"use client";

import { AddressAutocompleteField } from "@/components/vendor/address-autocomplete-field";
import type { ClientLocation } from "@/app/vendor/[id]/vendor.types";

type CustomerFormValues = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  addressQuery: string;
  clientLocation: ClientLocation | null;
  bookingNotes: string;
};

type CustomerOrderModalProps = {
  isOpen: boolean;
  serviceType: string | null;
  bookingLocationType: string | null;
  values: CustomerFormValues;
  error: string | null;
  onClose: () => void;
  onBack?: () => void;
  onChange: (next: Partial<CustomerFormValues>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function CustomerOrderModal({
  isOpen,
  serviceType,
  bookingLocationType,
  values,
  error,
  onClose,
  onBack,
  onChange,
  onSubmit,
  isSubmitting,
}: CustomerOrderModalProps) {
  if (!isOpen) return null;

  const requiresClientAddress =
    serviceType === "BOOKING" && bookingLocationType === "AT_CLIENT";
  const requiresPhone = bookingLocationType === "AT_CLIENT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-lg font-semibold text-ink-secondary"
              aria-label="Retour"
            >
              ←
            </button>
          ) : (
            <span />
          )}
          <h3 className="text-lg font-semibold text-primary">Vos informations</h3>
          <button type="button" onClick={onClose} className="text-ink-secondary">
            ×
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <div className="space-y-3">
          <label className="block text-sm">
            Email *
            <input
              type="email"
              value={values.customerEmail}
              onChange={(event) => onChange({ customerEmail: event.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none"
            />
          </label>

          <label className="block text-sm">
            Nom et Prenom *
            <input
              type="text"
              value={values.customerName}
              onChange={(event) => onChange({ customerName: event.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none"
            />
          </label>

          <label className="block text-sm">
            {requiresPhone ? "Telephone *" : "Telephone (optionnel)"}
            <input
              type="tel"
              value={values.customerPhone}
              onChange={(event) => onChange({ customerPhone: event.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 outline-none"
            />
          </label>

          {requiresClientAddress ? (
            <div>
              <p className="mb-1 text-sm">Adresse de prestation *</p>
              <AddressAutocompleteField
                value={values.addressQuery}
                onInputChange={(addressQuery) => onChange({ addressQuery, clientLocation: null })}
                onSelectLocation={(clientLocation) =>
                  onChange({
                    clientLocation,
                    addressQuery: clientLocation.name,
                  })
                }
              />
            </div>
          ) : null}

          {requiresClientAddress ? (
            <label className="block text-sm">
              Notes de reservation
              <textarea
                value={values.bookingNotes}
                onChange={(event) => onChange({ bookingNotes: event.target.value })}
                placeholder="Ex: merci d'arriver 10 minutes en avance"
                className="mt-1 min-h-20 w-full rounded-lg border border-line px-3 py-2 outline-none"
              />
            </label>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`mt-5 w-full rounded-[15px] px-5 py-4 text-sm font-bold text-white ${
            isSubmitting ? "bg-ink-tertiary" : "bg-primary"
          }`}
        >
          {isSubmitting
            ? "Validation..."
            : serviceType === "BOOKING"
              ? "Continuer vers paiement"
              : "Continuer"}
        </button>
      </section>
    </div>
  );
}
