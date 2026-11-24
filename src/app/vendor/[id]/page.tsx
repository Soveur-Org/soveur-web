import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchVendorById, fetchVendorServices } from "@/lib/api/vendor-detail";
import { FALLBACK_VENDOR_METADATA, getVendorMetadata } from "./vendor-metadata";
import { VendorPageClient } from "./vendor-page-client";
import type { Vendor, VendorService } from "./vendor.types";

const getVendor = cache(async (id: string) => fetchVendorById(id));
const getVendorServices = cache(async (id: string) => fetchVendorServices(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    return getVendorMetadata(await getVendor(id));
  } catch {
    return FALLBACK_VENDOR_METADATA;
  }
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let vendor: Vendor;
  let initialServices: VendorService[];
  try {
    [vendor, initialServices] = await Promise.all([getVendor(id), getVendorServices(id)]);
  } catch {
    notFound();
  }

  return (
    <VendorPageClient key={vendor.id} vendor={vendor} initialServices={initialServices} />
  );
}
