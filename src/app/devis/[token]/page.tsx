import type { Metadata } from "next";
import { QuotePageClient } from "./quote-page-client";

// The link is private: it must never be indexed
export const metadata: Metadata = {
  title: "Soveur - Devis",
  robots: { index: false, follow: false },
};

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ sent?: string; paid?: string }>;
}) {
  const { token } = await params;
  const { sent, paid } = await searchParams;

  return (
    <QuotePageClient token={token} justSent={sent === "1"} justPaid={paid === "1"} />
  );
}
