import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchVendorById, fetchVendorServices } from "@/lib/api/vendor-detail";
import { VendorPageClient } from "./vendor-page-client";
import type { Vendor, VendorService } from "./vendor.types";

const getVendor = cache(async (id: string) => fetchVendorById(id));
const getVendorServices = cache(async (id: string) => fetchVendorServices(id));

function getVendorOpenGraphImage(vendor: Vendor): string {
  const firstVendorImage = (vendor.vendorImages ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)[0]?.url;
  return firstVendorImage || "/icon.png";
}

function getVendorDescription(vendor: Vendor): string {
  const trimmed = vendor.description?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : `Decouvrez ${vendor.name} sur Soveur.`;
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
    const description = getVendorDescription(vendor);
    return {
      title: `Soveur - ${vendor.name}`,
      description,
      openGraph: {
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Soveur",
      description: "Decouvrez les services disponibles sur Soveur.",
      openGraph: {
        description: "Decouvrez les services disponibles sur Soveur.",
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
