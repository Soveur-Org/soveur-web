import { useEffect, useMemo, useState } from "react";
import type { ServiceCategoryGroup, VendorService } from "@/app/vendor/[id]/vendor.types";

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
    <section className="space-y-6 pb-20">
      {servicesState === "loading" ? (
        <p className="text-sm text-[#7f8395]">Chargement des services...</p>
      ) : null}
      {servicesState === "error" ? (
        <p className="text-sm text-red-600">{servicesError ?? "Erreur API services."}</p>
      ) : null}
      {servicesState === "success" && serviceCategories.length === 0 ? (
        <p className="text-sm text-[#7f8395]">Aucun service disponible.</p>
      ) : null}
      {servicesState === "success"
        ? serviceCategories.map((category) => (
            <div key={category.id} className="space-y-3">
              <header className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1f2436]">{category.name}</h3>
                <span className="text-xs font-medium text-[#7f8395]">
                  {category.services.length} service{category.services.length > 1 ? "s" : ""}
                </span>
              </header>
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const serviceImages = useMemo(() => getServiceImages(service), [service]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsDescriptionExpanded(false);
  }, [service.id, service.description]);

  const durationValue = toNumber(service.duration);
  const showDurationChip =
    service.serviceType === "BOOKING" &&
    durationValue !== null &&
    Number.isFinite(durationValue) &&
    durationValue > 0;
  const hasManyImages = serviceImages.length > 1;
  const displayDescription =
    service.description && service.description.trim().length > 0
      ? service.description
      : "Aucune description disponible";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
  };

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
      className={`w-full cursor-pointer overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2436] ${
        isSelected ? "border-[#1f2436]" : "border-[#e7e9f0]"
      }`}
    >
      {serviceImages.length > 0 ? (
        <div className="relative mb-3 overflow-hidden rounded-xl bg-[#f3f4f6]">
          <img
            src={serviceImages[currentImageIndex]}
            alt={service.name}
            className="h-40 w-full object-cover"
          />
          {hasManyImages ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                aria-label="Image precedente"
              >
                {"<"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                aria-label="Image suivante"
              >
                {">"}
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {serviceImages.map((_, index) => (
                  <span
                    key={`${service.id}-dot-${index}`}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="mb-3 h-40 w-full rounded-xl bg-[#f3f4f6]" />
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h4 className="line-clamp-1 flex-1 text-[15px] font-semibold text-[#1f2436]">{service.name}</h4>
          <span className="text-base font-bold text-[#1f2436]">{formattedPrice}</span>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className={`text-sm leading-5 text-[#6d7286] ${isDescriptionExpanded ? "" : "line-clamp-2"}`}>
              {displayDescription}
            </p>
            {displayDescription.length > 120 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDescriptionExpanded((previous) => !previous);
                }}
                className="mt-1 text-xs font-semibold text-[#1f2436]"
              >
                {isDescriptionExpanded ? "Voir moins" : "Voir plus"}
              </button>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              isSelected ? "border-[#1f2436]" : "border-[#a8afc4]"
            }`}
          >
            <span className={`h-3.5 w-3.5 rounded-full ${isSelected ? "bg-[#1f2436]" : "bg-transparent"}`} />
          </span>
        </div>

        {showDurationChip ? (
          <div className="pt-0.5">
            <span className="inline-flex rounded-full bg-[#f4f5fa] px-3 py-1 text-xs font-semibold text-[#6d7286]">
              {durationValue} min
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
