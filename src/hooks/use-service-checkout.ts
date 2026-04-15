"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createServiceOrder,
  fetchAvailableSlots,
  fetchServiceDetail,
} from "@/lib/api/vendor-detail";
import type {
  BookingSlot,
  ClientLocation,
  VendorService,
} from "@/app/vendor/[id]/vendor.types";

type SelectedService = {
  categoryId: string;
  service: VendorService;
} | null;

function isValidEmail(value: string): boolean {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toUtcIso(date: string, time: string): string {
  const [hoursRaw = "0", minutesRaw = "0"] = time.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);
  const safeHours = Number.isFinite(hours) ? hours : 0;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  const localDate = new Date(`${date}T00:00:00`);
  localDate.setHours(safeHours, safeMinutes, 0, 0);
  return localDate.toISOString();
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseSlotStartMinutes(value: string): number | null {
  const [hoursRaw = "0", minutesRaw = "0"] = value.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

export function useServiceCheckout(
  vendorId: string,
  selectedService: SelectedService,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotsState, setSlotsState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlotValue, setSelectedSlotValue] = useState<string | null>(
    null,
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [clientLocation, setClientLocation] = useState<ClientLocation | null>(
    null,
  );
  const [bookingNotes, setBookingNotes] = useState("");
  const [serviceContext, setServiceContext] = useState<{
    serviceType: string;
    bookingLocationType: string | null;
    duration: number | null;
    serviceId: string;
  } | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(
    null,
  );

  const canOpenCheckout = Boolean(selectedService);
  const canSubmitBooking = Boolean(selectedDate && selectedSlotValue);

  useEffect(() => {
    if (!bookingOpen || !selectedService?.service.id || !selectedDate) return;
    let cancelled = false;

    const run = async () => {
      try {
        setSlotsState("loading");
        setCheckoutError(null);
        const availableSlots = await fetchAvailableSlots(
          selectedService.service.id,
          selectedDate,
        );
        const now = new Date();
        const isToday = selectedDate === getLocalDateKey(now);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const filteredSlots = isToday
          ? availableSlots.filter((slot) => {
              const slotMinutes = parseSlotStartMinutes(slot.value);
              if (slotMinutes === null) return true;
              return slotMinutes >= nowMinutes;
            })
          : availableSlots;

        if (cancelled) return;
        setSlots(filteredSlots);
        setSlotsState("success");
        setSelectedSlotValue(null);
      } catch (error) {
        if (cancelled) return;
        setSlots([]);
        setSlotsState("error");
        setCheckoutError(
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des disponibilites.",
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookingOpen, selectedDate, selectedService?.service.id]);

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedDate("");
    setSlots([]);
    setSlotsState("idle");
    setSelectedSlotValue(null);
  };

  const closeCustomerModal = () => {
    setCustomerModalOpen(false);
  };

  const backToBooking = () => {
    setCustomerModalOpen(false);
    setBookingOpen(true);
  };

  const clearCustomerData = () => {
    setCustomerEmail("");
    setCustomerName("");
    setCustomerPhone("");
    setAddressQuery("");
    setClientLocation(null);
    setBookingNotes("");
  };

  const validateCustomerForm = () => {
    if (!customerEmail.trim()) {
      setCheckoutError("L'email est obligatoire.");
      return false;
    }
    if (!isValidEmail(customerEmail)) {
      setCheckoutError("Veuillez saisir une adresse email valide.");
      return false;
    }

    if (!customerName.trim()) {
      setCheckoutError("Le nom et prenom sont obligatoires.");
      return false;
    }

    const isAtClient = serviceContext?.bookingLocationType === "AT_CLIENT";
    if (isAtClient) {
      if (!customerPhone.trim()) {
        setCheckoutError("Le telephone est requis pour une prestation a domicile.");
        return false;
      }
      if (!clientLocation) {
        setCheckoutError("Veuillez selectionner une adresse valide.");
        return false;
      }
    }

    return true;
  };

  const startCheckout = async () => {
    if (!selectedService) return;

    setCheckoutError(null);
    setIsSubmitting(true);
    try {
      const serviceDetails = await fetchServiceDetail(
        selectedService.service.id,
      );
      const ctx = {
        serviceId: selectedService.service.id,
        serviceType:
          serviceDetails.serviceType ??
          selectedService.service.serviceType ??
          "INSTANT",
        bookingLocationType: serviceDetails.bookingLocationType ?? null,
        duration:
          serviceDetails.duration ?? selectedService.service.duration ?? null,
      };
      setServiceContext(ctx);
      if (ctx.serviceType === "BOOKING") {
        setBookingOpen(true);
      } else {
        setCustomerModalOpen(true);
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Erreur de paiement.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBookingSlot = () => {
    if (!selectedDate || !selectedSlotValue) return;
    setCheckoutError(null);
    setBookingOpen(false);
    setCustomerModalOpen(true);
  };

  const submitCustomerDetails = async () => {
    if (!serviceContext) return;
    setCheckoutError(null);

    if (!validateCustomerForm()) return;

    const isBookingAtClient =
      serviceContext.serviceType === "BOOKING" &&
      serviceContext.bookingLocationType === "AT_CLIENT";

    setIsSubmitting(true);
    try {
      const basePayload = {
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        clientLocation: isBookingAtClient
          ? (clientLocation ?? undefined)
          : undefined,
        bookingNotes: isBookingAtClient
          ? bookingNotes.trim() || undefined
          : undefined,
      };

      const isBooking = serviceContext.serviceType === "BOOKING";
      if (isBooking && selectedDate && selectedSlotValue) {
        const duration = serviceContext.duration ?? 0;
        const scheduledAt = toUtcIso(selectedDate, selectedSlotValue);
        const order = await createServiceOrder(serviceContext.serviceId, {
          ...basePayload,
          scheduledAt,
          scheduledDuration: duration,
        });
        setCustomerModalOpen(false);
        closeBooking();
        clearCustomerData();
        setPaymentClientSecret(order.clientSecret);
      } else {
        const order = await createServiceOrder(
          serviceContext.serviceId,
          basePayload,
        );
        setCustomerModalOpen(false);
        clearCustomerData();
        setPaymentClientSecret(order.clientSecret);
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la creation de commande.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearPayment = () => setPaymentClientSecret(null);

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return {
    isSubmitting,
    checkoutError,
    canOpenCheckout,
    customerModalOpen,
    closeCustomerModal,
    bookingOpen,
    selectedDate,
    setSelectedDate,
    slotsState,
    slots,
    selectedSlotValue,
    setSelectedSlotValue,
    canSubmitBooking,
    customerEmail,
    setCustomerEmail,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    addressQuery,
    setAddressQuery,
    clientLocation,
    setClientLocation,
    bookingNotes,
    setBookingNotes,
    serviceType: serviceContext?.serviceType ?? null,
    bookingLocationType: serviceContext?.bookingLocationType ?? null,
    paymentClientSecret,
    clearPayment,
    startCheckout,
    submitCustomerDetails,
    backToBooking,
    closeBooking,
    submitBookingSlot,
    defaultDate,
    vendorId,
  };
}
