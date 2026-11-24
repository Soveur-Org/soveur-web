import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchVendorBySlug, fetchVendorServices } from "@/lib/api/vendor-detail";
import { FALLBACK_VENDOR_METADATA, getVendorMetadata } from "../vendor/[id]/vendor-metadata";
import { VendorPageClient } from "../vendor/[id]/vendor-page-client";
import type { Vendor, VendorService } from "../vendor/[id]/vendor.types";

// Same rules as the backend. Spares an API call for URLs like /robots.txt
const SLUG_REGEX = /^[a-zA-Z0-9-_]{3,50}$/;

const getVendor = cache(async (slug: string) => {
  if (!SLUG_REGEX.test(slug)) {
    throw new Error("Invalid slug");
  }
  return fetchVendorBySlug(slug);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    return getVendorMetadata(await getVendor(slug));
  } catch {
    return FALLBACK_VENDOR_METADATA;
  }
}

export default async function VendorSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let vendor: Vendor;
  let initialServices: VendorService[];
  try {
    vendor = await getVendor(slug);
    initialServices = await fetchVendorServices(vendor.id);
  } catch {
    notFound();
  }

  return (
    <VendorPageClient key={vendor.id} vendor={vendor} initialServices={initialServices} />
  );
}
