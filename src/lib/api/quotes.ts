import { fetchJson } from "@/lib/api/vendor-detail";

export type QuoteStatus =
  | "REQUESTED"
  | "SENT"
  | "ACCEPTED"
  | "PAID"
  | "DECLINED"
  | "REJECTED"
  | "CANCELLED";

export type QuoteTiming = "ASAP" | "THIS_WEEK" | "DATE";

export type QuoteLine = {
  id: string;
  label: string;
  detail: string | null;
  quantity: number;
  unit: string | null; // null = flat price ("Forfait")
  unitPrice: number;
};

export type QuotePayment = {
  kind: "DEPOSIT" | "BALANCE" | "FULL" | null;
  amount: number;
  paidAt: string | null;
};

export type Quote = {
  id: string;
  reference: string;
  status: QuoteStatus;
  description: string;
  timing: QuoteTiming;
  preferredDate: string | null;
  customerName: string | null;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  amountPaid: number;
  balanceDue: number;
  vendorMessage: string | null;
  declineReason: string | null;
  sentAt: string | null;
  validUntil: string | null;
  paidAt: string | null;
  isExpired: boolean;
  payments: QuotePayment[];
  service: { id: string; name: string };
  vendor: { id: string; name: string; photo: string | null };
  lines: QuoteLine[];
  images: { id: string; url: string }[];
};

export type GuestQuotePayload = {
  serviceId: string;
  description: string;
  timing: QuoteTiming;
  preferredDate?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

type QuotePaymentIntent = { clientSecret: string; amount: number };

export async function requestGuestQuote(payload: GuestQuotePayload) {
  return fetchJson<Quote & { accessToken: string }>("/quotes/guest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchQuoteByToken(token: string) {
  return fetchJson<Quote>(`/quotes/access/${encodeURIComponent(token)}`);
}

/** Direct link to the PDF, served by the API (only once the quote was sent). */
export function getQuotePdfUrl(token: string) {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/quotes/access/${encodeURIComponent(token)}/pdf`;
}

export async function acceptQuoteByToken(token: string) {
  return fetchJson<QuotePaymentIntent>(
    `/quotes/access/${encodeURIComponent(token)}/accept`,
    { method: "POST" },
  );
}

export async function payQuoteBalanceByToken(token: string) {
  return fetchJson<QuotePaymentIntent>(
    `/quotes/access/${encodeURIComponent(token)}/pay-balance`,
    { method: "POST" },
  );
}

export async function rejectQuoteByToken(token: string) {
  return fetchJson<Quote>(`/quotes/access/${encodeURIComponent(token)}/reject`, {
    method: "PATCH",
  });
}

export async function cancelQuoteByToken(token: string) {
  return fetchJson<Quote>(`/quotes/access/${encodeURIComponent(token)}/cancel`, {
    method: "PATCH",
  });
}
