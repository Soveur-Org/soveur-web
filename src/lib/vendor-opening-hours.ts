import type { Vendor } from "@/app/vendor/[id]/vendor.types";

export type OpeningGroup = {
  dayLabel: string;
  timeLabel: string;
};

const EN_WEEKDAY_TO_INDEX: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1, 0, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return (
    Date.UTC(read("year"), read("month") - 1, read("day"), read("hour"), read("minute"), read("second")) -
    date.getTime()
  );
}

function zonedDateTimeToUtc(day: Date, hour: number, minute: number, timeZone: string) {
  const utcGuess = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute);
  const initialOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const refinedOffset = getTimeZoneOffsetMs(new Date(utcGuess - initialOffset), timeZone);
  return new Date(utcGuess - refinedOffset);
}

function formatDisplayTime(date: Date, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  const [hour, minute] = formatted.split(":");
  return `${Number(hour)}h${minute}`;
}

function formatDayName(weekDay: number) {
  const dayName = new Intl.DateTimeFormat("fr-FR", { weekday: "long", timeZone: "UTC" }).format(
    new Date(REFERENCE_MONDAY_UTC + (weekDay - 1) * DAY_MS),
  );
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

function formatDayRange(startDay: number, endDay: number) {
  return startDay === endDay
    ? formatDayName(startDay)
    : `${formatDayName(startDay)} - ${formatDayName(endDay)}`;
}

/**
 * Same display as the app: consecutive days sharing a schedule are grouped.
 * Slots are stored in the vendor's timezone and shown in `displayTimeZone`.
 */
export function buildOpeningGroups(
  availability: Vendor["availability"],
  displayTimeZone: string | null,
): OpeningGroup[] {
  if (!availability?.slots?.length) return [];

  const vendorTimeZone = availability.timezone ?? displayTimeZone ?? "UTC";
  const timeZone = displayTimeZone ?? vendorTimeZone;
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" });
  const rangesByDay = new Map<number, { startMs: number; label: string }[]>();

  availability.slots
    .filter((slot) => slot.active)
    .forEach((slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      const day = new Date(REFERENCE_MONDAY_UTC + (slot.weekDay - 1) * DAY_MS);
      const isOvernight =
        endHour < startHour || (endHour === startHour && endMinute <= startMinute);

      const startUtc = zonedDateTimeToUtc(day, startHour, startMinute, vendorTimeZone);
      const endUtc = zonedDateTimeToUtc(
        isOvernight ? new Date(day.getTime() + DAY_MS) : day,
        endHour,
        endMinute,
        vendorTimeZone,
      );

      const weekDay = EN_WEEKDAY_TO_INDEX[weekdayFormatter.format(startUtc)];
      if (!weekDay) return;

      const ranges = rangesByDay.get(weekDay) ?? [];
      ranges.push({
        startMs: startUtc.getTime(),
        label: `${formatDisplayTime(startUtc, timeZone)} - ${formatDisplayTime(endUtc, timeZone)}`,
      });
      rangesByDay.set(weekDay, ranges);
    });

  const activeDays = Array.from(rangesByDay.entries())
    .map(([weekDay, ranges]) => ({
      weekDay,
      timeLabel: ranges
        .sort((a, b) => a.startMs - b.startMs)
        .map((range) => range.label)
        .join(", "),
    }))
    .sort((a, b) => a.weekDay - b.weekDay);

  const groups: OpeningGroup[] = [];
  let groupStart = activeDays[0];
  activeDays.forEach((day, index) => {
    const next = activeDays[index + 1];
    const continuesGroup =
      next && next.weekDay === day.weekDay + 1 && next.timeLabel === groupStart.timeLabel;
    if (continuesGroup) return;

    groups.push({
      dayLabel: formatDayRange(groupStart.weekDay, day.weekDay),
      timeLabel: groupStart.timeLabel,
    });
    groupStart = next;
  });

  return groups;
}
