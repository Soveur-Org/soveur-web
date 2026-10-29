"use client";

import { useCallback, useEffect, useState } from "react";
import { StripePaymentModal } from "@/components/vendor/stripe-payment-modal";
import {
  acceptQuoteByToken,
  cancelQuoteByToken,
  fetchQuoteByToken,
  getQuotePdfUrl,
  payQuoteBalanceByToken,
  rejectQuoteByToken,
  type Quote,
  type QuoteLine,
  type QuoteStatus,
} from "@/lib/api/quotes";

// Stripe confirms the payment through a webhook, so the quote status lags a little
const REFRESH_AFTER_PAYMENT_MS = 2500;

const STATUS_LABELS: Record<QuoteStatus, { label: string; className: string }> = {
  REQUESTED: { label: "Demandé", className: "bg-[#fff4e5] text-[#b25e00]" },
  SENT: { label: "À valider", className: "bg-[#e8f1ff] text-[#0055cc]" },
  ACCEPTED: { label: "Accepté", className: "bg-[#e7f8ee] text-[#1e7b45]" },
  PAID: { label: "Payé", className: "bg-[#e7f8ee] text-[#1e7b45]" },
  DECLINED: { label: "Refusé par le pro", className: "bg-[#f2f2f2] text-[#666666]" },
  REJECTED: { label: "Refusé", className: "bg-[#f2f2f2] text-[#666666]" },
  CANCELLED: { label: "Annulé", className: "bg-[#f2f2f2] text-[#666666]" },
};

const TIMING_LABELS = {
  ASAP: "Dès que possible",
  THIS_WEEK: "Cette semaine",
  DATE: "À une date précise",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

function formatLineDetail(line: QuoteLine): string {
  if (line.detail) return line.detail;
  if (!line.unit && line.quantity === 1) return "Forfait";
  const quantity = line.unit ? `${line.quantity} ${line.unit}` : `${line.quantity}`;
  return `${quantity} × ${formatEuro(line.unitPrice)}`;
}

function getInfo(quote: Quote): string | null {
  switch (quote.status) {
    case "REQUESTED":
      return `${quote.vendor.name} prépare ton devis. Tu recevras un email dès qu’il est prêt.`;
    case "SENT":
      if (quote.isExpired) return "Ce devis a expiré. Demande au pro de te le renvoyer.";
      return quote.depositPercent > 0
        ? `Tu verses ${formatEuro(quote.depositAmount)} en ligne en signant. Le solde de ${formatEuro(
            quote.total - quote.depositAmount,
          )} se règle ensuite.`
        : `Tu règles la totalité, ${formatEuro(quote.total)}, en signant.`;
    case "ACCEPTED":
      return `Acompte de ${formatEuro(quote.amountPaid)} réglé. Reste à payer : ${formatEuro(
        quote.balanceDue,
      )}.`;
    case "PAID":
      return "Devis entièrement réglé. Merci !";
    case "DECLINED":
      return [`${quote.vendor.name} ne peut pas donner suite à ta demande.`, quote.declineReason]
        .filter(Boolean)
        .join(" ");
    default:
      return null;
  }
}

export function QuotePageClient({
  token,
  justSent,
  justPaid,
}: {
  token: string;
  justSent: boolean;
  justPaid: boolean;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const loadQuote = useCallback(async () => {
    try {
      setQuote(await fetchQuoteByToken(token));
      setLoadError(null);
    } catch {
      setLoadError("Ce devis est introuvable. Vérifie le lien reçu par email.");
    }
  }, [token]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  useEffect(() => {
    if (!justPaid) return;
    const timer = setTimeout(loadQuote, REFRESH_AFTER_PAYMENT_MS);
    return () => clearTimeout(timer);
  }, [justPaid, loadQuote]);

  const runAction = async (action: () => Promise<void>) => {
    setActionError(null);
    setIsBusy(true);
    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Une erreur est survenue. Réessaie.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const startPayment = (kind: "accept" | "balance") =>
    runAction(async () => {
      const payment =
        kind === "accept"
          ? await acceptQuoteByToken(token)
          : await payQuoteBalanceByToken(token);
      setClientSecret(payment.clientSecret);
    });

  const updateStatus = (confirmMessage: string, action: () => Promise<Quote>) => {
    if (!window.confirm(confirmMessage)) return;
    runAction(async () => {
      setQuote(await action());
    });
  };

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <p className="text-center text-sm text-[#6d7286]">{loadError}</p>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <p className="text-sm text-[#6d7286]">Chargement...</p>
      </main>
    );
  }

  const status = STATUS_LABELS[quote.status];
  const isPriced = ["SENT", "ACCEPTED", "PAID"].includes(quote.status);
  const canAccept = quote.status === "SENT" && !quote.isExpired;
  const canPayBalance = quote.status === "ACCEPTED" && quote.balanceDue > 0;
  const canCancel = quote.status === "REQUESTED" || quote.status === "SENT";
  const info = getInfo(quote);
  const timingLabel =
    quote.timing === "DATE" && quote.preferredDate
      ? `Le ${formatDate(quote.preferredDate)}`
      : TIMING_LABELS[quote.timing];

  return (
    <main className="min-h-screen bg-white text-[#1b1f2f]">
      <article className="mx-auto w-full max-w-md px-4 pb-36 pt-8">
        {justSent && quote.status === "REQUESTED" ? (
          <p className="mb-4 rounded-xl bg-[#e7f8ee] p-3 text-sm text-[#1e7b45]">
            Demande envoyée ! Un email avec le lien de cette page t’a été envoyé.
          </p>
        ) : null}
        {justPaid ? (
          <p className="mb-4 rounded-xl bg-[#e7f8ee] p-3 text-sm text-[#1e7b45]">
            Paiement confirmé, merci !
          </p>
        ) : null}

        <h1 className="text-2xl font-bold text-[#1f2436]">Devis de {quote.vendor.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          <span className="text-xs text-[#6d7286]">
            {quote.reference}
            {quote.status === "SENT" && quote.validUntil
              ? ` · valable jusqu’au ${formatDate(quote.validUntil)}`
              : ""}
          </span>
        </div>

        {isPriced ? (
          <section className="mt-6 space-y-3">
            <ul className="divide-y divide-[#eceff5] rounded-2xl border border-[#eceff5] px-4">
              {quote.lines.map((line) => (
                <li key={line.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1f2436]">{line.label}</p>
                    <p className="text-xs text-[#6d7286]">{formatLineDetail(line)}</p>
                  </div>
                  <p className="text-sm font-bold text-[#1f2436]">
                    {formatEuro(line.quantity * line.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total HT</span>
                <span className="font-semibold">{formatEuro(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>
                  {quote.vatRate > 0
                    ? `TVA ${quote.vatRate} %`
                    : "TVA non applicable, art. 293 B du CGI"}
                </span>
                <span className="font-semibold">{formatEuro(quote.vatAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-[#eceff5] pt-3">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-bold">{formatEuro(quote.total)}</span>
              </div>
            </div>
          </section>
        ) : null}

        {quote.sentAt ? (
          <a
            href={getQuotePdfUrl(token)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#d8dbe5] px-5 py-3 text-sm font-semibold text-[#1f2436]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
            </svg>
            Télécharger le devis
          </a>
        ) : null}

        {quote.vendorMessage && isPriced ? (
          <section className="mt-4 rounded-2xl border border-[#eceff5] p-4">
            <p className="text-sm font-bold">Message du pro</p>
            <p className="mt-1 whitespace-pre-line text-sm text-[#6d7286]">
              {quote.vendorMessage}
            </p>
          </section>
        ) : null}

        {info ? (
          <p className="mt-4 rounded-xl bg-[#f5f6f9] p-3 text-sm leading-6 text-[#6d7286]">
            {info}
          </p>
        ) : null}

        <section className="mt-6 space-y-2 rounded-2xl bg-[#f5f6f9] p-4 text-sm">
          <p className="font-bold">Ta demande</p>
          <p className="font-semibold">{quote.service.name}</p>
          <p className="text-[#6d7286]">{timingLabel}</p>
          <p className="whitespace-pre-line">{quote.description}</p>
        </section>

        {actionError ? <p className="mt-4 text-sm text-red-600">{actionError}</p> : null}

        {canCancel ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              updateStatus("Annuler ta demande ? Le pro sera prévenu.", () =>
                cancelQuoteByToken(token),
              )
            }
            className="mt-6 w-full py-2 text-sm font-semibold text-red-600"
          >
            Annuler ma demande
          </button>
        ) : null}
      </article>

      {canAccept || canPayBalance ? (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 p-4">
          <div className="mx-auto max-w-md space-y-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => startPayment(canAccept ? "accept" : "balance")}
              className={`w-full rounded-full px-5 py-4 text-sm font-semibold text-white ${
                isBusy ? "bg-[#b8bcc9]" : "bg-[#1f2436]"
              }`}
            >
              {canAccept
                ? `Accepter et payer ${formatEuro(quote.depositAmount)}`
                : `Payer le solde (${formatEuro(quote.balanceDue)})`}
            </button>
            {canAccept ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  updateStatus("Refuser ce devis ? Le pro sera prévenu.", () =>
                    rejectQuoteByToken(token),
                  )
                }
                className="w-full py-2 text-sm font-semibold text-[#6d7286]"
              >
                Refuser le devis
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {clientSecret ? (
        <StripePaymentModal
          clientSecret={clientSecret}
          onClose={() => setClientSecret(null)}
          successPath={`/devis/${token}?paid=1`}
        />
      ) : null}
    </main>
  );
}
