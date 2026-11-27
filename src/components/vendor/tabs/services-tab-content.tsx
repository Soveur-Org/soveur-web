import { useEffect, useMemo, useState } from "react";
import type { ServiceCategoryGroup, VendorService } from "@/app/vendor/[id]/vendor.types";
import { ImageCarousel } from "@/components/vendor/image-carousel";

type DataState = "idle" | "loading" | "success" | "error";

type SelectedService = {
  categoryId: string;
  service: VendorService;
} | null;

type ServicesTabContentProps = {
  servicesState: DataState;
  servicesError: string | null;
  serviceCategories: ServiceCategoryGroup[];
  selectedService: SelectedService;
  onServiceSelect: (categoryId: string, service: VendorService) => void;
  formatServicePrice: (service: VendorService) => string | null;
};

export function ServicesTabContent({
  servicesState,
  servicesError,
  serviceCategories,
  selectedService,
  onServiceSelect,
  formatServicePrice,
}: ServicesTabContentProps) {
  return (
    <section className="space-y-6 py-4">
      {servicesState === "loading" ? (
        <p className="py-4 text-center text-sm text-ink-secondary">Chargement des services...</p>
      ) : null}
      {servicesState === "error" ? (
        <p className="py-4 text-center text-sm text-red-600">
          {servicesError ?? "Erreur API services."}
        </p>
      ) : null}
      {servicesState === "success" && serviceCategories.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-secondary">Aucun service disponible.</p>
      ) : null}
      {servicesState === "success"
        ? serviceCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <h3 className="text-lg font-bold text-ink">{category.name}</h3>
              <ul className="space-y-2.5">
                {category.services.map((service) => {
                  const isSelected =
                    selectedService?.categoryId === category.id &&
                    selectedService.service.id === service.id;
                  return (
                    <li key={service.id}>
                      <ServiceCard
                        service={service}
                        isSelected={isSelected}
                        onSelect={() => onServiceSelect(category.id, service)}
                        formattedPrice={formatServicePrice(service) ?? "--"}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        : null}
    </section>
  );
}

type ServiceCardProps = {
  service: VendorService;
  isSelected: boolean;
  onSelect: () => void;
  formattedPrice: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getServiceImages(service: VendorService): string[] {
  const sorted =
    service.serviceImages?.slice().sort((a, b) => a.order - b.order) ??
    service.images?.slice().sort((a, b) => a.order - b.order) ??
    [];

  const fromArrays = sorted.map((image) => image.url).filter(Boolean);
  const withPhoto = service.photo ? [service.photo, ...fromArrays] : fromArrays;
  return Array.from(new Set(withPhoto));
}

function ServiceCard({ service, isSelected, onSelect, formattedPrice }: ServiceCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const serviceImages = useMemo(() => getServiceImages(service), [service]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [service.id, service.description]);

  const durationValue = toNumber(service.duration);
  const showDurationChip =
    service.serviceType === "BOOKING" &&
    durationValue !== null &&
    Number.isFinite(durationValue) &&
    durationValue > 0;
  const displayDescription =
    service.description && service.description.trim().length > 0
      ? service.description
      : "Aucune description disponible";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`w-full cursor-pointer space-y-2.5 rounded-[18px] bg-white p-3 text-left shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected ? "border-[1.5px] border-primary" : "border border-line"
      }`}
    >
      {serviceImages.length > 0 ? (
        <ImageCarousel
          images={serviceImages}
          alt={service.name}
          variant="card"
          className="h-40 rounded-[14px]"
        />
      ) : (
        <div className="h-40 w-full rounded-[14px] bg-[#f0f0f0]" />
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <h4 className="line-clamp-1 flex-1 text-base font-semibold text-ink">{service.name}</h4>
          <span className="text-lg font-bold text-primary">{formattedPrice}</span>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="flex-1 space-y-1">
            <p
              className={`text-[13px] leading-[18px] text-ink-secondary ${
                isDescriptionExpanded ? "" : "line-clamp-2"
              }`}
            >
              {displayDescription}
            </p>
            {displayDescription.length > 120 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDescriptionExpanded((previous) => !previous);
                }}
                className="text-[13px] font-semibold text-primary"
              >
                {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
              </button>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary"
          >
            <span className={`h-3.5 w-3.5 rounded-full ${isSelected ? "bg-primary" : "bg-transparent"}`} />
          </span>
        </div>

        {showDurationChip ? (
          <span className="inline-flex rounded-full bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-secondary">
            {durationValue} min
          </span>
        ) : null}
      </div>
    </div>
  );
}
