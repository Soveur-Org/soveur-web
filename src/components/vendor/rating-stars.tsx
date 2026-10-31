type RatingStarsProps = {
  rating: number | null | undefined;
  reviewCount?: number;
};

export function RatingStars({ rating, reviewCount }: RatingStarsProps) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating ?? 0)));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <img
          key={index}
          src={index < filledStars ? "/icons/star.svg" : "/icons/star-gray.svg"}
          alt=""
          width={13}
          height={13}
        />
      ))}
      {reviewCount !== undefined ? (
        <span className="ml-1 text-xs text-ink-secondary">{reviewCount} avis</span>
      ) : null}
    </div>
  );
}
