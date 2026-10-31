import type { OpeningGroup } from "@/lib/vendor-opening-hours";

type AboutTabContentProps = {
  description: string | null;
  openingGroups: OpeningGroup[];
  address: string | null;
  mapUrl: string | null;
};

export function AboutTabContent({
  description,
  openingGroups,
  address,
  mapUrl,
}: AboutTabContentProps) {
  return (
    <div className="py-4">
      {description ? (
        <p className="mb-4 whitespace-pre-line text-sm text-ink">{description}</p>
      ) : null}
      {openingGroups.length > 0 ? (
        <section className="mb-4">
          <h2 className="mb-3 text-base font-semibold text-ink">Heures d&apos;ouverture</h2>
          <ul className="space-y-2.5 text-base">
            {openingGroups.map((group) => (
              <li key={group.dayLabel} className="flex flex-wrap gap-1">
                <span className="text-ink-tertiary">{group.dayLabel} :</span>
                <span className="text-ink">{group.timeLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {address ? (
        <section>
          {mapUrl ? (
            <iframe
              title="Carte du vendeur"
              src={mapUrl}
              className="h-[209px] w-full rounded-[30px] border-0 lg:h-72"
              loading="lazy"
            />
          ) : (
            <div className="flex h-[209px] items-center justify-center rounded-[30px] bg-surface text-sm text-ink-secondary">
              Carte non disponible
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
