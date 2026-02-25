"use client";

import { useEffect, useMemo, useState } from "react";
import { translateCategoryNameToFrench } from "@/constants/category-translations";
import type {
  CategoriesResponse,
  Category,
  ServiceCategoryGroup,
  Vendor,
  VendorService,
  VendorServicesResponse,
} from "./vendor.types";
import { VendorTabs, type VendorTabId } from "./vendor-tabs";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getOpenLabel(vendor: Vendor): string {
  return vendor.visible ? "Ouvert" : "Ferme";
}

function formatAddress(vendor: Vendor) {
  const location = vendor.location;
  if (!location) return "Adresse non disponible";
  return [location.street, location.zipcode, location.city, location.country]
    .filter(Boolean)
    .join(", ");
}

function renderStars(rating: number | null) {
  const safe = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return "★★★★★".slice(0, safe) + "☆☆☆☆☆".slice(0, 5 - safe);
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hRaw = "0", mRaw = "0"] = time.split(":");
  const hour = Number.parseInt(hRaw, 10);
  const minute = Number.parseInt(mRaw, 10);
  return {
    hour: Number.isNaN(hour) ? 0 : hour,
    minute: Number.isNaN(minute) ? 0 : minute,
  };
}

function capitalizeFirst(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function formatUtcSlotToLocal(
  weekDay: number,
  startTime: string,
  endTime: string,
  timeZone: string,
) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const baseSunday = Date.UTC(2020, 0, 5);
  const startUtc = new Date(
    baseSunday + weekDay * 24 * 60 * 60 * 1000 + (start.hour * 60 + start.minute) * 60 * 1000,
  );
  const endUtc = new Date(
    baseSunday + weekDay * 24 * 60 * 60 * 1000 + (end.hour * 60 + end.minute) * 60 * 1000,
  );

  const weekDayFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  const startDay = capitalizeFirst(weekDayFormatter.format(startUtc));
  const endDay = capitalizeFirst(weekDayFormatter.format(endUtc));
  const startLocal = timeFormatter.format(startUtc);
  const endLocal = timeFormatter.format(endUtc);

  const dayLabel = startDay === endDay ? startDay : `${startDay} / ${endDay}`;
  return { dayLabel, startLocal, endLocal };
}

function getCategoryMeta(
  service: VendorService,
  categoryNamesById: Record<string, string>,
): { id: string; name: string | null } {
  if (typeof service.categoryId === "string" && service.categoryId.trim().length > 0) {
    return {
      id: service.categoryId,
      name: categoryNamesById[service.categoryId] ?? null,
    };
  }

  if (service.categoryId && typeof service.categoryId === "object") {
    const objectId = service.categoryId.id ?? "uncategorized";
    return {
      id: objectId,
      name:
        translateCategoryNameToFrench(service.categoryId.name) ??
        categoryNamesById[objectId] ??
        "Sans categorie",
    };
  }

  return { id: "uncategorized", name: "Sans categorie" };
}

function groupServicesByCategory(
  services: VendorService[],
  categoryNamesById: Record<string, string>,
): ServiceCategoryGroup[] {
  const groups = new Map<string, ServiceCategoryGroup & { hasResolvedName: boolean }>();

  for (const service of services) {
    const category = getCategoryMeta(service, categoryNamesById);
    const existing = groups.get(category.id);

    if (existing) {
      existing.services.push(service);
      continue;
    }

    groups.set(category.id, {
      id: category.id,
      name: category.name ?? "",
      services: [service],
      hasResolvedName: Boolean(category.name),
    });
  }

  const ordered = Array.from(groups.values()).sort((a, b) => {
    if (a.hasResolvedName && b.hasResolvedName) {
      return a.name.localeCompare(b.name, "fr");
    }
    if (a.hasResolvedName) return -1;
    if (b.hasResolvedName) return 1;
    return a.id.localeCompare(b.id, "fr");
  });

  let unnamedCounter = 1;
  return ordered.map((group) => {
    if (group.hasResolvedName) {
      return { id: group.id, name: group.name, services: group.services };
    }

    const fallbackName = `Categorie ${unnamedCounter}`;
    unnamedCounter += 1;

    return {
      id: group.id,
      name: fallbackName,
      services: group.services,
    };
  });
}

function extractServicesFromPayload(payload: unknown): VendorService[] {
  if (Array.isArray(payload)) {
    return payload as VendorService[];
  }

  if (payload && typeof payload === "object") {
    const typed = payload as VendorServicesResponse;
    if (Array.isArray(typed.data)) {
      return typed.data;
    }
  }

  return [];
}

function extractCategoriesFromPayload(payload: unknown): Category[] {
  if (Array.isArray(payload)) {
    return payload as Category[];
  }

  if (payload && typeof payload === "object") {
    const typed = payload as CategoriesResponse;
    if (Array.isArray(typed.data)) {
      return typed.data;
    }
  }

  return [];
}

function formatServicePrice(service: VendorService) {
  if (typeof service.price !== "number") return null;
  const currency = service.currency ?? "EUR";

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(service.price);
  } catch {
    return `${service.price} ${currency}`;
  }
}

function formatServiceDuration(service: VendorService) {
  if (typeof service.duration !== "number") return null;
  if (!service.durationMetric) return `${service.duration}`;
  return `${service.duration} ${service.durationMetric.toLowerCase()}`;
}

function getServiceImageUrl(service: VendorService): string | null {
  if (typeof service.photo === "string" && service.photo.length > 0) {
    return service.photo;
  }

  const firstImage =
    service.images?.slice().sort((a, b) => a.order - b.order)[0] ??
    service.serviceImages?.slice().sort((a, b) => a.order - b.order)[0];

  return firstImage?.url ?? null;
}

export function VendorPageClient({ vendor }: { vendor: Vendor }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<VendorTabId>("about");
  const [servicesState, setServicesState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [services, setServices] = useState<VendorService[]>([]);
  const [categoryNamesById, setCategoryNamesById] = useState<Record<string, string>>({});
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{
    categoryId: string;
    service: VendorService;
  } | null>(null);
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const images = useMemo(
    () => (vendor.vendorImages ?? []).slice().sort((a, b) => a.order - b.order),
    [vendor.vendorImages],
  );

  const lat = toNumber(vendor.location?.lat);
  const lng = toNumber(vendor.location?.lng);
  const hasMap = lat !== null && lng !== null;
  const bbox = hasMap ? `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}` : null;
  const mapUrl = hasMap
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;

  const slots = useMemo(
    () =>
      (vendor.availability?.slots?.filter((slot) => slot.active) ?? []).sort(
        (a, b) => a.weekDay - b.weekDay,
      ),
    [vendor.availability?.slots],
  );
  const serviceCategories = useMemo(
    () => groupServicesByCategory(services, categoryNamesById),
    [services, categoryNamesById],
  );
  const openCategory = useMemo(
    () => serviceCategories.find((category) => category.id === openCategoryId) ?? null,
    [serviceCategories, openCategoryId],
  );
  const canReserve = Boolean(selectedService);

  useEffect(() => {
    if (activeTab !== "services" || servicesState !== "idle") return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      setServicesState("error");
      setServicesError("NEXT_PUBLIC_API_BASE_URL est manquante.");
      return;
    }

    let cancelled = false;

    const fetchServices = async () => {
      try {
        setServicesState("loading");
        setServicesError(null);

        const [servicesResponse, categoriesResponse] = await Promise.allSettled([
          fetch(`${baseUrl}/services/vendor/${vendor.id}?page=1&limit=100`, {
            cache: "no-store",
          }),
          fetch(`${baseUrl}/categories?page=1&limit=100`, {
            cache: "no-store",
          }),
        ]);

        if (servicesResponse.status !== "fulfilled" || !servicesResponse.value.ok) {
          throw new Error("Impossible de recuperer les services.");
        }

        const servicesPayload = (await servicesResponse.value.json()) as unknown;
        const fetchedServices = extractServicesFromPayload(servicesPayload).filter(
          (service) => service.visible !== false,
        );
        let categoryMap: Record<string, string> = {};

        if (categoriesResponse.status === "fulfilled" && categoriesResponse.value.ok) {
          const categoriesPayload = (await categoriesResponse.value.json()) as unknown;
          const categories = extractCategoriesFromPayload(categoriesPayload);
          categoryMap = categories.reduce<Record<string, string>>((acc, category) => {
            if (category?.id && category?.name) {
              acc[category.id] = translateCategoryNameToFrench(category.name) ?? category.name;
            }
            return acc;
          }, {});
        }

        if (!cancelled) {
          setServices(fetchedServices);
          setCategoryNamesById(categoryMap);
          setServicesState("success");
        }
      } catch (error) {
        if (!cancelled) {
          setServicesState("error");
          setServicesError(
            error instanceof Error ? error.message : "Erreur lors du chargement des services.",
          );
        }
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
    };
  }, [activeTab, vendor.id]);

  const prevImage = () => {
    if (images.length === 0) return;
    setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setActiveImage((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const openCategoryModal = (categoryId: string) => {
    setOpenCategoryId(categoryId);
    setPendingServiceId(
      selectedService?.categoryId === categoryId ? selectedService.service.id : null,
    );
  };

  const closeCategoryModal = () => {
    setOpenCategoryId(null);
    setPendingServiceId(null);
  };

  const confirmServiceSelection = () => {
    if (!openCategory || !pendingServiceId) return;
    const service = openCategory.services.find((item) => item.id === pendingServiceId);
    if (!service) return;

    setSelectedService({ categoryId: openCategory.id, service });
    closeCategoryModal();
  };

  const handleReserveNow = () => {
    if (!selectedService) return;

    console.log("Reserve now clicked", {
      vendorId: vendor.id,
      serviceId: selectedService.service.id,
      serviceName: selectedService.service.name,
      categoryId: selectedService.categoryId,
    });
  };

  return (
    <main className="min-h-screen bg-white text-[#1b1f2f]">
      <article className="w-full pb-6 sm:mx-auto sm:max-w-sm">
        <section className="relative h-72 w-full overflow-hidden bg-[#d9d9d9]">
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImage]?.url}
                alt={`${vendor.name} - image ${activeImage + 1}`}
                className="h-full w-full object-cover"
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                    aria-label="Image precedente"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                    aria-label="Image suivante"
                  >
                    {">"}
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === activeImage ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Aller a l'image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#ececec] to-[#dadada]" />
          )}
        </section>

        <section className="mt-4 bg-white px-4 pb-5 text-[#1b1f2f] shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:rounded-3xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-semibold leading-tight">{vendor.name}</h1>
              <p className="mt-1 text-sm text-[#6d7286]">{formatAddress(vendor)}</p>
            </div>
            <span className="rounded-full bg-[#57c74f] px-3 py-1 text-xs font-semibold text-white">
              {getOpenLabel(vendor)}
            </span>
          </div>

          <div className="mb-5 flex items-center gap-2 text-sm">
            <span className="text-[#f2a327]">{renderStars(vendor.averageRating)}</span>
            <span className="text-[#6d7286]">({vendor.reviewCount ?? 0})</span>
          </div>

          <VendorTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "about" ? (
            <>
              <section className="mb-4 space-y-2">
                <p className="text-sm leading-relaxed text-[#3f455b]">
                  {vendor.description ?? "Description non disponible."}
                </p>
              </section>

              <section className="mb-4 space-y-2">
                <h2 className="text-sm font-semibold">Heures d&apos;ouverture</h2>
                {slots.length > 0 ? (
                  <ul className="space-y-1 text-sm text-[#49506a]">
                    {slots.map((slot) => {
                      const local = formatUtcSlotToLocal(
                        slot.weekDay,
                        slot.startTime,
                        slot.endTime,
                        timeZone,
                      );
                      return (
                        <li key={slot.id} className="flex items-center justify-between gap-3">
                          <span>{local.dayLabel}</span>
                          <span>
                            {local.startLocal} - {local.endLocal}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-[#7f8395]">Horaires non disponibles.</p>
                )}
              </section>

              <section className="mb-4 space-y-2">
                <h2 className="text-sm font-semibold">Adresse</h2>
                <p className="text-sm text-[#49506a]">{formatAddress(vendor)}</p>
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
          ) : null}

          {activeTab === "services" ? (
            <section className="mb-5 space-y-3">
              {servicesState === "loading" ? (
                <p className="text-sm text-[#7f8395]">Chargement des services...</p>
              ) : null}

              {servicesState === "error" ? (
                <p className="text-sm text-red-600">
                  {servicesError ?? "Erreur lors du chargement des services."}
                </p>
              ) : null}

              {servicesState === "success" && serviceCategories.length === 0 ? (
                <p className="text-sm text-[#7f8395]">Aucun service visible.</p>
              ) : null}

              {servicesState === "success"
                ? serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategoryModal(category.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left ${
                        selectedService?.categoryId === category.id
                          ? "border-[#1f2436] bg-[#f3f4f6]"
                          : "border-[#d8dbe5] bg-[#f3f4f6]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#1f2436]">
                          {category.name}
                        </span>
                        {selectedService?.categoryId === category.id ? (
                          <>
                            <span className="mt-1 block truncate text-xs text-[#49506a]">
                              {selectedService.service.name}
                            </span>
                            <span className="mt-0.5 block text-sm font-bold text-[#1f2436]">
                              + {formatServicePrice(selectedService.service) ?? "--"}
                            </span>
                          </>
                        ) : null}
                      </span>
                      <span className="ml-3 flex items-center gap-3 text-sm text-[#49506a]">
                        {selectedService?.categoryId === category.id ? null : (
                          <span>{category.services.length}</span>
                        )}
                        <span className="text-[#1f2436]">▶</span>
                      </span>
                    </button>
                  ))
                : null}
            </section>
          ) : null}

          {activeTab === "gallery" ? (
            <section className="mb-5">
              <p className="text-sm text-[#7f8395]">Galerie bientot disponible.</p>
            </section>
          ) : null}

          {activeTab === "reviews" ? (
            <section className="mb-5">
              <p className="text-sm text-[#7f8395]">Avis bientot disponibles.</p>
            </section>
          ) : null}

          <button
            type="button"
            disabled={!canReserve}
            onClick={handleReserveNow}
            className={`w-full rounded-full px-5 py-4 text-sm font-semibold tracking-wide text-white ${
              canReserve ? "bg-[#1f2436]" : "bg-[#b8bcc9]"
            }`}
          >
            RESERVER MAINTENANT
          </button>
        </section>
      </article>

      {openCategory ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fermer la modal"
            className="absolute inset-0 bg-black/40"
            onClick={closeCategoryModal}
          />
          <section className="relative z-10 max-h-[85vh] w-full max-w-md overflow-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1f2436]">{openCategory.name}</h3>
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-full px-2 py-1 text-sm text-[#7f8395]"
              >
                ×
              </button>
            </div>
            <ul className="space-y-3">
              {openCategory.services.map((service) => {
                const isActive = pendingServiceId === service.id;
                const imageUrl = getServiceImageUrl(service);
                return (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => setPendingServiceId(service.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left ${
                        isActive ? "border-[#1f2436]" : "border-[#ebedf3]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <span className="h-12 w-12 rounded-md bg-[#f3f4f6]" />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#1f2436]">
                            {service.name}
                          </span>
                          <span className="block text-sm text-[#6d7286]">
                            {formatServicePrice(service) ?? "--"}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`h-5 w-5 rounded-full border-2 ${
                          isActive
                            ? "border-[#1f2436] bg-[#1f2436]"
                            : "border-[#1f2436] bg-transparent"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              disabled={!pendingServiceId}
              onClick={confirmServiceSelection}
              className={`mt-5 w-full rounded-full px-5 py-4 text-sm font-semibold text-white ${
                pendingServiceId ? "bg-[#1f2436]" : "bg-[#b8bcc9]"
              }`}
            >
              Choisir
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
