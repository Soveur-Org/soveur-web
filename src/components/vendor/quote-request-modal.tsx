"use client";

import { useState } from "react";
import { requestGuestQuote, type QuoteTiming } from "@/lib/api/quotes";
import type { VendorService } from "@/app/vendor/[id]/vendor.types";

type QuoteRequestModalProps = {
  vendorName: string;
  services: VendorService[];
  initialServiceId: string;
  onClose: () => void;
  onRequested: (accessToken: string) => void;
};

const TIMINGS: { value: QuoteTiming; label: string }[] = [
  { value: "ASAP", label: "Dès que possible" },
  { value: "THIS_WEEK", label: "Cette semaine" },
  { value: "DATE", label: "Choisir une date" },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getTomorrowKey(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${tomorrow.getFullYear()}-${month}-${day}`;
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-primary";

export function QuoteRequestModal({
  vendorName,
  services,
  initialServiceId,
  onClose,
  onRequested,
}: QuoteRequestModalProps) {
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [description, setDescription] = useState("");
  const [timing, setTiming] = useState<QuoteTiming>("ASAP");
  const [preferredDate, setPreferredDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (description.trim().length < 5) return "Explique ton besoin en quelques mots.";
    if (timing === "DATE" && !preferredDate) return "Choisis une date.";
    if (!firstName.trim() || !lastName.trim()) return "Le prénom et le nom sont obligatoires.";
    if (!isValidEmail(email)) return "Saisis une adresse email valide.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const quote = await requestGuestQuote({
        serviceId,
        description: description.trim(),
        timing,
        // The day is chosen, not the time: 9:00 local keeps it on that day in any timezone
        ...(timing === "DATE"
          ? { preferredDate: new Date(`${preferredDate}T09:00:00`).toISOString() }
          : {}),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      onRequested(quote.accessToken);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'envoyer ta demande. Réessaie.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Demande de devis</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-ink-secondary"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-primary">
            Prestation
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              disabled={services.length < 2}
              className={`${inputClassName} bg-surface`}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-primary">
            Explique en deux mots *
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              placeholder="Ex : fuite sous l'évier de la cuisine, ça goutte depuis hier."
              className={`${inputClassName} min-h-24`}
            />
          </label>

          <div>
            <p className="text-sm font-medium text-primary">Quand ?</p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {TIMINGS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTiming(option.value)}
                  className={`rounded-xl border-[1.5px] px-2 py-2 text-xs font-semibold text-primary ${
                    timing === option.value
                      ? "border-primary bg-white"
                      : "border-transparent bg-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {timing === "DATE" ? (
              <input
                type="date"
                min={getTomorrowKey()}
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                className={`${inputClassName} mt-2`}
              />
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-primary">
              Prénom *
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium text-primary">
              Nom *
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClassName}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-primary">
            Email *
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium text-primary">
            Téléphone (optionnel)
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
            />
          </label>

          <p className="rounded-xl bg-surface p-3 text-xs leading-5 text-ink-secondary">
            Rien à payer maintenant. {vendorName} t’envoie un devis par email, et tu ne
            règles un acompte en ligne que si tu l’acceptes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-5 w-full rounded-[15px] px-5 py-4 text-sm font-bold text-white ${
            isSubmitting ? "bg-ink-tertiary" : "bg-primary"
          }`}
        >
          {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
        </button>
      </section>
    </div>
  );
}
