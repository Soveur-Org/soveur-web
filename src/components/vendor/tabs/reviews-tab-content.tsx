import type { VendorReview } from "@/app/vendor/[id]/vendor.types";

type DataState = "idle" | "loading" | "success" | "error";

type ReviewsTabContentProps = {
  reviewsState: DataState;
  reviewsError: string | null;
  reviews: VendorReview[];
  formatDate: (value?: string) => string;
};

export function ReviewsTabContent({
  reviewsState,
  reviewsError,
  reviews,
  formatDate,
}: ReviewsTabContentProps) {
  return (
    <section className="space-y-3 pb-20">
      {reviewsState === "loading" ? (
        <p className="text-sm text-[#7f8395]">Chargement des avis...</p>
      ) : null}
      {reviewsState === "error" ? (
        <p className="text-sm text-red-600">{reviewsError ?? "Erreur API avis."}</p>
      ) : null}
      {reviewsState === "success" && reviews.length === 0 ? (
        <p className="text-sm text-[#7f8395]">Aucun avis pour le moment.</p>
      ) : null}
      {reviewsState === "success"
        ? reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-[#ebedf3] p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-[#1f2436]">
                  {review.user?.name ??
                    ([review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") ||
                      "Utilisateur")}
                </p>
                <span className="text-xs text-[#6d7286]">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-xs text-[#f2a327]">
                {"★".repeat(Math.round(review.rate ?? 0))}
                {"☆".repeat(Math.max(0, 5 - Math.round(review.rate ?? 0)))}
              </p>
              <p className="mt-1 text-sm text-[#3f455b]">{review.comment ?? "Aucun commentaire."}</p>
            </article>
          ))
        : null}
    </section>
  );
}
