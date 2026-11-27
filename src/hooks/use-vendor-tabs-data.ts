"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchVendorReviews } from "@/lib/api/vendor-detail";
import type {
  ServiceCategoryGroup,
  VendorReview,
  VendorService,
} from "@/app/vendor/[id]/vendor.types";
import type { VendorTabId } from "@/app/vendor/[id]/vendor-tabs";

// Les prestations n'ont plus de catégorie : elles prennent les métiers du pro
// (affichés en haut de la page). Un seul groupe, sans titre.
function groupServices(services: VendorService[]): ServiceCategoryGroup[] {
  if (services.length === 0) return [];
  return [{ id: "all", name: "", services }];
}

export function useVendorTabsData(
  vendorId: string,
  activeTab: VendorTabId,
  initialServices: VendorService[],
) {
  const initialServicesRef = useRef(initialServices);
  initialServicesRef.current = initialServices;

  const hasFetchedServicesRef = useRef(false);
  const hasFetchedReviewsRef = useRef(false);
  const [servicesState, setServicesState] = useState<"idle" | "loading" | "success" | "error">(
    () => (initialServices.length === 0 ? "success" : "loading"),
  );
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [services, setServices] = useState<VendorService[]>(() => initialServices);

  const [reviewsState, setReviewsState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<VendorReview[]>([]);

  const serviceCategories = useMemo(() => groupServices(services), [services]);

  useEffect(() => {
    const list = initialServicesRef.current;

    if (list.length === 0) {
      setServices([]);
      setServicesState("success");
      setServicesError(null);
      hasFetchedServicesRef.current = true;
      return;
    }

    hasFetchedServicesRef.current = true;
    setServices(list);
    setServicesState("success");
    setServicesError(null);
  }, [vendorId]);

  useEffect(() => {
    if (activeTab !== "reviews" || hasFetchedReviewsRef.current) return;
    hasFetchedReviewsRef.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        setReviewsState("loading");
        setReviewsError(null);
        const reviewList = await fetchVendorReviews(vendorId);
        if (cancelled) return;
        setReviews(reviewList);
        setReviewsState("success");
      } catch (error) {
        if (cancelled) return;
        setReviewsState("error");
        setReviewsError(
          error instanceof Error ? error.message : "Erreur lors du chargement des avis.",
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [activeTab, vendorId]);

  return {
    servicesState,
    servicesError,
    serviceCategories,
    reviewsState,
    reviewsError,
    reviews,
  };
}
