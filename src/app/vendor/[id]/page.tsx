import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchVendorById } from "@/lib/api/vendor-detail";
import { VendorPageClient } from "./vendor-page-client";
import type { Vendor } from "./vendor.types";

const getVendor = cache(async (id: string) => fetchVendorById(id));

function getVendorOpenGraphImage(vendor: Vendor): string {
  const firstVendorImage = (vendor.vendorImages ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)[0]?.url;
  return firstVendorImage || "/icon.png";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const vendor = await getVendor(id);
    const image = getVendorOpenGraphImage(vendor);
    return {
      title: `Soveur - ${vendor.name}`,
      openGraph: {
        images: [image],
      },
    };
  } catch {
    return {
      title: "Soveur",
      openGraph: {
        images: ["/icon.png"],
      },
    };
  }
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let vendor: Vendor;
  try {
    vendor = await getVendor(id);
  } catch {
    notFound();
  }

  return <VendorPageClient vendor={vendor} />;
}
