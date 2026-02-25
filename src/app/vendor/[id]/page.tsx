import { notFound } from "next/navigation";
import { VendorPageClient } from "./vendor-page-client";
import type { Vendor } from "./vendor.types";

async function getVendorById(id: string): Promise<Vendor> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment variables.");
  }

  const response = await fetch(`${baseUrl}/vendors/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch vendor.");
  }

  return response.json();
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendorById(id);

  return <VendorPageClient vendor={vendor} />;
}
