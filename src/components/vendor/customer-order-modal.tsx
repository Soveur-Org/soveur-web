"use client";

import { AddressAutocompleteField } from "@/components/vendor/address-autocomplete-field";
import type { ClientLocation } from "@/app/vendor/[id]/vendor.types";

type CustomerFormValues = {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  addressQuery: string;
  clientLocation: ClientLocation | null;
};

type CustomerOrderModalProps = {
  isOpen: boolean;
  bookingLocationType: string | null;
  values: CustomerFormValues;
  error: string | null;
  onClose: () => void;
  onChange: (next: Partial<CustomerFormValues>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function CustomerOrderModal({
  isOpen,
  bookingLocationType,
  values,
  error,
  onClose,
  onChange,
  onSubmit,
  isSubmitting,
}: CustomerOrderModalProps) {
  if (!isOpen) return null;

  const requiresClientAddress = bookingLocationType === "AT_CLIENT";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1f2436]">Vos informations</h3>
          <button type="button" onClick={onClose} className="text-[#7f8395]">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            Email *
            <input
              type="email"
              value={values.customerEmail}
              onChange={(event) => onChange({ customerEmail: event.target.value })}
              className="mt-1 w-full rounded-lg border border-[#d8dbe5] px-3 py-2 outline-none"
            />
          </label>

          <label className="block text-sm">
            Nom
            <input
              type="text"
              value={values.customerName}
              onChange={(event) => onChange({ customerName: event.target.value })}
              className="mt-1 w-full rounded-lg border border-[#d8dbe5] px-3 py-2 outline-none"
            />
          </label>

          <label className="block text-sm">
            Telephone
            <input
              type="tel"
              value={values.customerPhone}
              onChange={(event) => onChange({ customerPhone: event.target.value })}
              className="mt-1 w-full rounded-lg border border-[#d8dbe5] px-3 py-2 outline-none"
            />
          </label>

          {requiresClientAddress ? (
            <div>
              <p className="mb-1 text-sm">Adresse de prestation *</p>
              <AddressAutocompleteField
                value={values.addressQuery}
                onInputChange={(addressQuery) => onChange({ addressQuery })}
                onSelectLocation={(clientLocation) =>
                  onChange({
                    clientLocation,
                    addressQuery: clientLocation.name,
                  })
                }
              />
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold text-white ${
            isSubmitting ? "bg-[#b8bcc9]" : "bg-[#1f2436]"
          }`}
        >
          {isSubmitting ? "Validation..." : "Continuer"}
        </button>
      </section>
    </div>
  );
}
