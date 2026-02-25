import { notFound } from "next/navigation";
import { fetchVendorById } from "@/lib/api/vendor-detail";
import { VendorPageClient } from "./vendor-page-client";
import type { Vendor } from "./vendor.types";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let vendor: Vendor;
  try {
    vendor = await fetchVendorById(id);
  } catch {
    notFound();
  }

  return <VendorPageClient vendor={vendor} />;
}
