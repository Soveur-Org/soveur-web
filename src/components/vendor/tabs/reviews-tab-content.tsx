import type { VendorReview } from "@/app/vendor/[id]/vendor.types";
import { RatingStars } from "@/components/vendor/rating-stars";

type DataState = "idle" | "loading" | "success" | "error";

type ReviewsTabContentProps = {
  reviewsState: DataState;
  reviewsError: string | null;
  reviews: VendorReview[];
  averageRating: number | null;
  reviewCount: number | null;
  formatDate: (value?: string) => string;
};

function getReviewerName(review: VendorReview) {
  return (
    review.user?.name ??
    ([review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") || "Client")
  );
}

export function ReviewsTabContent({
  reviewsState,
  reviewsError,
  reviews,
  averageRating,
  reviewCount,
  formatDate,
}: ReviewsTabContentProps) {
  const fallbackAverage =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + (review.rate ?? 0), 0) / reviews.length
      : 0;

  return (
    <section className="space-y-4 py-4">
      <header className="flex items-center gap-2 border-b border-line pb-4">
        <img src="/icons/star-bicolor.svg" alt="" width={20} height={19} />
        <p className="text-xl font-bold text-ink">
          {Number(averageRating ?? fallbackAverage).toFixed(1)} ({reviewCount ?? reviews.length}{" "}
          avis)
        </p>
      </header>

      {reviewsState === "loading" ? (
        <p className="py-4 text-center text-sm text-ink-secondary">Chargement des avis...</p>
      ) : null}
      {reviewsState === "error" ? (
        <p className="py-4 text-center text-sm text-red-600">
          {reviewsError ?? "Erreur API avis."}
        </p>
      ) : null}
      {reviewsState === "success" && reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-secondary">Aucun avis pour le moment.</p>
      ) : null}
      {reviewsState === "success" ? (
        <div className="space-y-3">
          {reviews.map((review) => {
            const reviewerName = getReviewerName(review);
            return (
              <article key={review.id} className="space-y-2 rounded-xl border border-line p-3">
                <div className="flex items-start gap-2.5">
                  {review.user?.photoUrl ? (
                    <img
                      src={review.user.photoUrl}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-base font-semibold text-ink-secondary">
                      {reviewerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
                        {reviewerName}
                      </p>
                      <RatingStars rating={review.rate} />
                    </div>
                    <p className="text-xs text-ink-secondary">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {review.comment ? <p className="text-sm text-ink">{review.comment}</p> : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
