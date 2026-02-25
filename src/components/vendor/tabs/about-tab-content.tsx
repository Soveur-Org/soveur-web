type WeeklyAvailabilityItem = {
  id: string;
  dayLabel: string;
  startLabel: string;
  endLabel: string;
};

type AboutTabContentProps = {
  description: string | null;
  weeklyAvailability: WeeklyAvailabilityItem[];
  address: string;
  mapUrl: string | null;
};

export function AboutTabContent({
  description,
  weeklyAvailability,
  address,
  mapUrl,
}: AboutTabContentProps) {
  return (
    <>
      <p className="mb-4 text-sm leading-relaxed text-[#3f455b]">
        {description ?? "Description non disponible."}
      </p>
      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold">Disponibilites</h2>
        {weeklyAvailability.length > 0 ? (
          <ul className="space-y-1 text-sm text-[#49506a]">
            {weeklyAvailability.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between gap-3">
                <span>{slot.dayLabel}</span>
                <span>
                  {slot.startLabel} - {slot.endLabel}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#7f8395]">Disponibilites non renseignees.</p>
        )}
      </section>
      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold">Adresse</h2>
        <p className="text-sm text-[#49506a]">{address}</p>
      </section>
      <section className="mb-5">
        {mapUrl ? (
          <iframe
            title="Carte du vendeur"
            src={mapUrl}
            className="h-48 w-full rounded-2xl border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-[#f3f5fa] text-sm text-[#7f8395]">
            Carte non disponible
          </div>
        )}
      </section>
    </>
  );
}
