"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ImageCarousel } from "@/components/vendor/image-carousel";
import { QuoteRequestModal } from "@/components/vendor/quote-request-modal";
import { RatingStars } from "@/components/vendor/rating-stars";
import { StripePaymentModal } from "@/components/vendor/stripe-payment-modal";
import { CustomerOrderModal } from "@/components/vendor/customer-order-modal";
import { AboutTabContent } from "@/components/vendor/tabs/about-tab-content";
import { GalleryTabContent } from "@/components/vendor/tabs/gallery-tab-content";
import { ReviewsTabContent } from "@/components/vendor/tabs/reviews-tab-content";
import { ServicesTabContent } from "@/components/vendor/tabs/services-tab-content";
import { useServiceCheckout } from "@/hooks/use-service-checkout";
import { getTradeLabel } from "@/constants/trade-translations";
import { useVendorTabsData } from "@/hooks/use-vendor-tabs-data";
import { SOVEUR_MOBILE_STORE_BADGES } from "@/lib/soveur-app-download-links";
import { buildOpeningGroups } from "@/lib/vendor-opening-hours";
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

function formatAddress(vendor: Vendor): string | null {
  const location = vendor.location;
  if (!location) return null;
  const parts = [location.street, location.city, location.country]
    .filter(Boolean)
    .join(", ");
  return parts || null;
}

// The server doesn't know the visitor's timezone: it renders the hours in the vendor's one
const subscribeToNothing = () => () => {};
const getBrowserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || null;
const getServerTimeZone = () => null;

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function formatServicePrice(service: VendorService) {
  if (service.serviceType === "QUOTE") return "Sur devis";
  if (typeof service.price !== "number") return null;
  const currency = "EUR";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(service.price);
  } catch {
    return `${service.price} ${currency}`;
  }
}

export function VendorPageClient({
  vendor,
  initialServices,
}: {
  vendor: Vendor;
  initialServices: VendorService[];
}) {
  const [activeTab, setActiveTab] = useState<VendorTabId>("about");
  const [selectedService, setSelectedService] = useState<{
    categoryId: string;
    service: VendorService;
  } | null>(null);

  const {
    servicesState,
    servicesError,
    serviceCategories,
    reviewsState,
    reviewsError,
    reviews,
  } = useVendorTabsData(vendor.id, activeTab, initialServices);

  const checkout = useServiceCheckout(vendor.id, selectedService);
  const router = useRouter();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const quoteServices = useMemo(
    () => initialServices.filter((service) => service.serviceType === "QUOTE"),
    [initialServices],
  );

  const images = useMemo(
    () => (vendor.vendorImages ?? []).slice().sort((a, b) => a.order - b.order),
    [vendor.vendorImages],
  );

  const showServicesTab = initialServices.length > 0;
  const showGalleryTab = images.length > 1;
  const displayTimeZone = useSyncExternalStore(
    subscribeToNothing,
    getBrowserTimeZone,
    getServerTimeZone,
  );
  const openingGroups = useMemo(
    () => buildOpeningGroups(vendor.availability, displayTimeZone),
    [displayTimeZone, vendor.availability],
  );
  const address = formatAddress(vendor);

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

  useEffect(() => {
    if (activeTab === "services" && !showServicesTab) {
      setActiveTab("about");
    }
    if (activeTab === "gallery" && !showGalleryTab) {
      setActiveTab("about");
    }
  }, [activeTab, showServicesTab, showGalleryTab]);

  const selectService = (categoryId: string, service: VendorService) => {
    setSelectedService({ categoryId, service });
  };

  const checkoutButtonLabel =
    selectedService?.service.serviceType === "BOOKING"
      ? "Voir les disponibilités"
      : "Réserver maintenant";
  const checkoutBarClassName =
    "fixed inset-x-0 bottom-0 z-30 bg-white px-4 pb-4 pt-3 lg:sticky lg:px-0";
  const checkoutBarInnerClassName = "mx-auto max-w-2xl lg:max-w-none";

  return (
    <main className="min-h-screen bg-white text-ink">
      <aside className="border-b border-line bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 lg:justify-between lg:px-8">
          <div className="hidden items-center gap-2 lg:flex">
            <img src="/icon.png" alt="" width={36} height={36} />
            <span className="text-xl font-bold text-primary">Soveur</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SOVEUR_MOBILE_STORE_BADGES.map((store) => (
              <a
                key={store.imageSrc}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 transition-opacity hover:opacity-90 active:opacity-80"
              >
                <img
                  src={store.imageSrc}
                  alt={store.label}
                  className="h-10 w-auto max-w-[140px] object-contain object-left"
                  width={140}
                  height={40}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </aside>

      <article className="w-full pb-28 lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="lg:sticky lg:top-8">
          {images.length > 0 ? (
            <ImageCarousel
              images={images.map((image) => image.url)}
              alt={vendor.name}
              variant="hero"
              className="h-[300px] md:h-[380px] lg:h-[min(56vh,520px)] lg:rounded-[30px]"
            />
          ) : (
            <div className="h-[300px] bg-surface md:h-[380px] lg:h-[min(56vh,520px)] lg:rounded-[30px]" />
          )}

          <section className="relative -mt-[53px] rounded-t-[30px] bg-white px-4 pt-6 lg:mt-5 lg:rounded-none lg:p-0">
            <div className="mx-auto flex max-w-2xl flex-col gap-2.5 lg:max-w-none">
              <h1 className="text-2xl font-semibold lg:text-[32px] lg:leading-tight">
                {vendor.name}
              </h1>
              {vendor.trades?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {vendor.trades.map((trade) => (
                    <span
                      key={trade.id}
                      className="rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium text-ink"
                    >
                      {getTradeLabel(trade)}
                    </span>
                  ))}
                </div>
              ) : null}
              {address ? (
                <div className="flex gap-1">
                  <img
                    src="/icons/graylocation.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  <p className="text-base text-ink-secondary">{address}</p>
                </div>
              ) : null}
              <RatingStars
                rating={vendor.averageRating}
                reviewCount={vendor.reviewCount ?? 0}
              />
            </div>
          </section>
        </div>

        <div className="px-4 lg:px-0">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <VendorTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              showServices={showServicesTab}
              showGallery={showGalleryTab}
            />

            {activeTab === "about" ? (
              <AboutTabContent
                description={vendor.description}
                openingGroups={openingGroups}
                address={address}
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
                averageRating={vendor.averageRating}
                reviewCount={vendor.reviewCount}
                formatDate={formatDate}
              />
            ) : null}
          </div>

          {selectedService?.service.serviceType === "QUOTE" ? (
            <div className={checkoutBarClassName}>
              <div className={checkoutBarInnerClassName}>
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full rounded-[15px] bg-primary px-5 py-5 text-sm font-bold text-white"
                >
                  Demander un devis
                </button>
              </div>
            </div>
          ) : selectedService ? (
            <div className={checkoutBarClassName}>
              <div className={checkoutBarInnerClassName}>
                <button
                  type="button"
                  disabled={!checkout.canOpenCheckout || checkout.isSubmitting}
                  onClick={checkout.startCheckout}
                  className={`w-full rounded-[15px] px-5 py-5 text-sm font-bold text-white ${
                    checkout.canOpenCheckout && !checkout.isSubmitting
                      ? "bg-primary"
                      : "bg-ink-tertiary opacity-60"
                  }`}
                >
                  {checkout.isSubmitting ? "Chargement..." : checkoutButtonLabel}
                </button>
                {checkout.checkoutError ? (
                  <p className="mt-2 text-center text-xs text-red-600">
                    {checkout.checkoutError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      {checkout.bookingOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <section className="flex max-h-[88vh] w-full max-w-md flex-col overflow-x-hidden rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span />
              <h3 className="text-lg font-semibold text-primary">
                Choisir un créneau
              </h3>
              <button
                type="button"
                onClick={checkout.closeBooking}
                className="text-ink-secondary"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-1">
              <label className="mb-3 block min-w-0 text-sm">
                Date
                <div className="mt-1 w-full min-w-0 overflow-hidden rounded-lg border border-line">
                  <input
                    type="date"
                    value={checkout.selectedDate}
                    onChange={(event) =>
                      checkout.setSelectedDate(event.target.value)
                    }
                    className="block w-full min-w-0 max-w-full border-0 bg-transparent px-3 py-2 pr-10 text-sm text-ink outline-none"
                  />
                </div>
              </label>

              {checkout.slotsState === "loading" ? (
                <p className="mb-2 text-sm text-ink-secondary">
                  Chargement des créneaux...
                </p>
              ) : null}
              {(() => {
                const hasAvailableSlots = checkout.slots.some(
                  (s) => s.available,
                );
                if (checkout.slotsState === "success" && !hasAvailableSlots) {
                  return (
                    <p className="mb-2 text-sm text-ink-secondary">
                      Aucun créneau disponible ce jour.
                    </p>
                  );
                }
                if (!hasAvailableSlots) return null;
                return (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {checkout.slots.map((slot) => {
                      if (!slot.available) return null;
                      const isSelected =
                        checkout.selectedSlotValue === slot.value;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() =>
                            checkout.setSelectedSlotValue(slot.value)
                          }
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-line bg-surface"
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {checkout.checkoutError ? (
              <p className="mb-3 text-sm text-red-600">
                {checkout.checkoutError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!checkout.canSubmitBooking || checkout.isSubmitting}
              onClick={checkout.submitBookingSlot}
              className={`w-full rounded-[15px] px-5 py-4 text-sm font-bold text-white ${
                checkout.canSubmitBooking && !checkout.isSubmitting
                  ? "bg-primary"
                  : "bg-ink-tertiary"
              }`}
            >
              {checkout.isSubmitting ? "Chargement..." : "Continuer"}
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
        onBack={
          checkout.serviceType === "BOOKING"
            ? checkout.backToBooking
            : undefined
        }
        onChange={(next) => {
          if (next.customerEmail !== undefined)
            checkout.setCustomerEmail(next.customerEmail);
          if (next.customerName !== undefined)
            checkout.setCustomerName(next.customerName);
          if (next.customerPhone !== undefined)
            checkout.setCustomerPhone(next.customerPhone);
          if (next.addressQuery !== undefined)
            checkout.setAddressQuery(next.addressQuery);
          if (next.clientLocation !== undefined)
            checkout.setClientLocation(next.clientLocation);
          if (next.bookingNotes !== undefined)
            checkout.setBookingNotes(next.bookingNotes);
        }}
        onSubmit={checkout.submitCustomerDetails}
      />

      {isQuoteModalOpen && selectedService?.service.serviceType === "QUOTE" ? (
        <QuoteRequestModal
          vendorName={vendor.name}
          services={quoteServices}
          initialServiceId={selectedService.service.id}
          onClose={() => setIsQuoteModalOpen(false)}
          onRequested={(accessToken) => router.push(`/devis/${accessToken}?sent=1`)}
        />
      ) : null}

      {checkout.paymentClientSecret ? (
        <StripePaymentModal
          clientSecret={checkout.paymentClientSecret}
          onClose={checkout.clearPayment}
        />
      ) : null}
    </main>
  );
}
