"use client";

import { useEffect, useMemo, useState } from "react";
import { StripePaymentModal } from "@/components/vendor/stripe-payment-modal";
import { CustomerOrderModal } from "@/components/vendor/customer-order-modal";
import { AboutTabContent } from "@/components/vendor/tabs/about-tab-content";
import { GalleryTabContent } from "@/components/vendor/tabs/gallery-tab-content";
import { ReviewsTabContent } from "@/components/vendor/tabs/reviews-tab-content";
import { ServicesTabContent } from "@/components/vendor/tabs/services-tab-content";
import { useServiceCheckout } from "@/hooks/use-service-checkout";
import { useVendorTabsData } from "@/hooks/use-vendor-tabs-data";
import type { Vendor, VendorService } from "./vendor.types";
import { VendorTabs, type VendorTabId } from "./vendor-tabs";

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getOpenLabel(vendor: Vendor) {
  return vendor.visible ? "Ouvert" : "Fermé";
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

  const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone,
  });
  const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  });

  return {
    dayLabel: capitalizeFirst(dayFormatter.format(startUtc)),
    startLabel: timeFormatter.format(startUtc),
    endLabel: timeFormatter.format(endUtc),
  };
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function formatServicePrice(service: VendorService) {
  if (typeof service.price !== "number") return null;
  const currency = "EUR";
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

export function VendorPageClient({ vendor }: { vendor: Vendor }) {
  const [activeTab, setActiveTab] = useState<VendorTabId>("about");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedService, setSelectedService] = useState<{
    categoryId: string;
    service: VendorService;
  } | null>(null);

  const { servicesState, servicesError, serviceCategories, reviewsState, reviewsError, reviews } =
    useVendorTabsData(vendor.id, activeTab);

  const checkout = useServiceCheckout(vendor.id, selectedService);

  const images = useMemo(
    () => (vendor.vendorImages ?? []).slice().sort((a, b) => a.order - b.order),
    [vendor.vendorImages],
  );
  const userTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );
  const weeklyAvailability = useMemo(
    () =>
      (vendor.availability?.slots ?? [])
        .filter((slot) => slot.active)
        .sort((a, b) => a.weekDay - b.weekDay)
        .map((slot) => ({
          id: slot.id,
          ...formatUtcSlotToLocal(slot.weekDay, slot.startTime, slot.endTime, userTimeZone),
        })),
    [userTimeZone, vendor.availability?.slots],
  );

  const lat = toNumber(vendor.location?.lat);
  const lng = toNumber(vendor.location?.lng);
  const mapUrl =
    lat !== null && lng !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
      : null;

  useEffect(() => {
    if (checkout.bookingOpen && !checkout.selectedDate) {
      checkout.setSelectedDate(checkout.defaultDate);
    }
  }, [checkout]);

  const selectService = (categoryId: string, service: VendorService) => {
    setSelectedService({ categoryId, service });
  };

  const checkoutButtonLabel =
    selectedService?.service.serviceType === "BOOKING"
      ? "Voir les disponibilités"
      : "Réserver maintenant";

  return (
    <main className="min-h-screen bg-white text-[#1b1f2f]">
      <article className="w-full pb-28 sm:mx-auto sm:max-w-sm">
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
                    onClick={() => setActiveImage((current) => (current > 0 ? current - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((current) => (current < images.length - 1 ? current + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-white"
                  >
                    {">"}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="mt-4 bg-white px-4 pb-5 text-[#1b1f2f]">
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
            <AboutTabContent
              description={vendor.description}
              weeklyAvailability={weeklyAvailability}
              address={formatAddress(vendor)}
              mapUrl={mapUrl}
            />
          ) : null}

          {activeTab === "services" ? (
            <ServicesTabContent
              servicesState={servicesState}
              servicesError={servicesError}
              serviceCategories={serviceCategories}
              selectedService={selectedService}
              onServiceSelect={selectService}
              formatServicePrice={formatServicePrice}
            />
          ) : null}

          {activeTab === "gallery" ? (
            <GalleryTabContent images={images} vendorName={vendor.name} />
          ) : null}

          {activeTab === "reviews" ? (
            <ReviewsTabContent
              reviewsState={reviewsState}
              reviewsError={reviewsError}
              reviews={reviews}
              formatDate={formatDate}
            />
          ) : null}
        </section>
      </article>

      {selectedService ? (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4">
          <div className="sm:mx-auto sm:max-w-sm">
            <button
              type="button"
              disabled={!checkout.canOpenCheckout || checkout.isSubmitting}
              onClick={checkout.startCheckout}
              className={`w-full rounded-full px-5 py-4 text-sm font-semibold tracking-wide text-white ${
                checkout.canOpenCheckout && !checkout.isSubmitting ? "bg-[#1f2436]" : "bg-[#b8bcc9]"
              }`}
            >
              {checkout.isSubmitting ? "Chargement..." : checkoutButtonLabel}
            </button>
            {checkout.checkoutError ? (
              <p className="mt-2 text-center text-xs text-red-600">{checkout.checkoutError}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {checkout.bookingOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <section className="flex max-h-[88vh] w-full max-w-md flex-col overflow-x-hidden rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={checkout.backToCustomerModal}
                className="text-lg font-semibold text-[#7f8395]"
                aria-label="Retour"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-[#1f2436]">Choisir un créneau</h3>
              <button type="button" onClick={checkout.closeBooking} className="text-[#7f8395]">
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1">
              <label className="mb-3 block min-w-0 text-sm">
                Date
                <div className="mt-1 w-full min-w-0 overflow-hidden rounded-lg border border-[#d8dbe5]">
                  <input
                    type="date"
                    value={checkout.selectedDate}
                    onChange={(event) => checkout.setSelectedDate(event.target.value)}
                    className="block w-full min-w-0 max-w-full border-0 bg-transparent px-3 py-2 pr-10 text-sm text-[#1b1f2f] outline-none"
                  />
                </div>
              </label>

              {checkout.slotsState === "loading" ? (
                <p className="mb-2 text-sm text-[#7f8395]">Chargement des créneaux...</p>
              ) : null}
              {checkout.slotsState === "success" && checkout.slots.length === 0 ? (
                <p className="mb-2 text-sm text-[#7f8395]">Aucun créneau disponible.</p>
              ) : null}

              <div className="mb-4 grid grid-cols-2 gap-2">
                {checkout.slots.map((slot) => {
                  const isDisabled = !slot.available;
                  const isSelected = checkout.selectedSlotValue === slot.value && !isDisabled;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => checkout.setSelectedSlotValue(slot.value)}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        isDisabled
                          ? "border-[#d8dbe5] text-[#7f8395]"
                          : isSelected
                            ? "border-[#1f2436] bg-[#1f2436] text-white"
                            : "cursor-not-allowed border-[#eceff5] bg-[#f7f8fb] opacity-80"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {checkout.checkoutError ? (
              <p className="mb-3 text-sm text-red-600">{checkout.checkoutError}</p>
            ) : null}

            <button
              type="button"
              disabled={!checkout.canSubmitBooking || checkout.isSubmitting}
              onClick={checkout.submitBookingOrder}
              className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white ${
                checkout.canSubmitBooking && !checkout.isSubmitting
                  ? "bg-[#1f2436]"
                  : "bg-[#b8bcc9]"
              }`}
            >
              {checkout.isSubmitting ? "Création de la réservation..." : "Continuer vers paiement"}
            </button>
          </section>
        </div>
      ) : null}

      <CustomerOrderModal
        isOpen={checkout.customerModalOpen}
        serviceType={checkout.serviceType}
        bookingLocationType={checkout.bookingLocationType}
        values={{
          customerEmail: checkout.customerEmail,
          customerName: checkout.customerName,
          customerPhone: checkout.customerPhone,
          addressQuery: checkout.addressQuery,
          clientLocation: checkout.clientLocation,
          bookingNotes: checkout.bookingNotes,
        }}
        error={checkout.checkoutError}
        isSubmitting={checkout.isSubmitting}
        onClose={checkout.closeCustomerModal}
        onChange={(next) => {
          if (next.customerEmail !== undefined) checkout.setCustomerEmail(next.customerEmail);
          if (next.customerName !== undefined) checkout.setCustomerName(next.customerName);
          if (next.customerPhone !== undefined) checkout.setCustomerPhone(next.customerPhone);
          if (next.addressQuery !== undefined) checkout.setAddressQuery(next.addressQuery);
          if (next.clientLocation !== undefined) checkout.setClientLocation(next.clientLocation);
          if (next.bookingNotes !== undefined) checkout.setBookingNotes(next.bookingNotes);
        }}
        onSubmit={checkout.submitCustomerDetails}
      />

      {checkout.paymentClientSecret ? (
        <StripePaymentModal
          clientSecret={checkout.paymentClientSecret}
          onClose={checkout.clearPayment}
        />
      ) : null}
    </main>
  );
}
