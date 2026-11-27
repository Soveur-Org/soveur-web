"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { translateCategoryNameToFrench } from "@/constants/category-translations";
import { fetchCategories, fetchVendorReviews } from "@/lib/api/vendor-detail";
import type {
  ServiceCategoryGroup,
  VendorReview,
  VendorService,
} from "@/app/vendor/[id]/vendor.types";
import type { VendorTabId } from "@/app/vendor/[id]/vendor-tabs";

type ServiceWithCategory = {
  id: string;
  name: string;
};

function resolveCategory(
  service: VendorService,
  categoriesById: Record<string, string>,
): ServiceWithCategory {
  if (typeof service.categoryId === "string" && service.categoryId.length > 0) {
    return {
      id: service.categoryId,
      name: categoriesById[service.categoryId] ?? "Sans categorie",
    };
  }

  if (service.categoryId && typeof service.categoryId === "object") {
    const categoryId = service.categoryId.id ?? "uncategorized";
    return {
      id: categoryId,
      name:
        translateCategoryNameToFrench(service.categoryId.name) ??
        categoriesById[categoryId] ??
        "Sans categorie",
    };
  }

  return { id: "uncategorized", name: "Sans categorie" };
}

function groupServices(
  services: VendorService[],
  categoriesById: Record<string, string>,
): ServiceCategoryGroup[] {
  const map = new Map<string, ServiceCategoryGroup>();
  for (const service of services) {
    const category = resolveCategory(service, categoriesById);
    const group = map.get(category.id);
    if (group) {
      group.services.push(service);
      continue;
    }
    map.set(category.id, { id: category.id, name: category.name, services: [service] });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"));
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
  const [categoriesById, setCategoriesById] = useState<Record<string, string>>({});

  const [reviewsState, setReviewsState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<VendorReview[]>([]);

  const serviceCategories = useMemo(
    () => groupServices(services, categoriesById),
    [services, categoriesById],
  );

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
    let cancelled = false;

    const run = async () => {
      try {
        setServicesState("loading");
        setServicesError(null);
        setServices(list);
        const categoryList = await fetchCategories();
        if (cancelled) return;

        const nextCategories = categoryList.reduce<Record<string, string>>((acc, category) => {
          acc[category.id] = translateCategoryNameToFrench(category.name) ?? category.name;
          return acc;
        }, {});
        setCategoriesById(nextCategories);
        setServicesState("success");
      } catch (error) {
        if (cancelled) return;
        setServicesState("error");
        setServicesError(
          error instanceof Error ? error.message : "Erreur lors du chargement des services.",
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
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
