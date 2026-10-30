import type { Metadata } from "next";
import type { Vendor } from "./vendor.types";

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

export function getVendorMetadata(vendor: Vendor): Metadata {
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
}

export const FALLBACK_VENDOR_METADATA: Metadata = {
  title: "Soveur",
  description: "Decouvrez les services disponibles sur Soveur.",
  openGraph: {
    description: "Decouvrez les services disponibles sur Soveur.",
    images: ["/icon.png"],
  },
};
