"use client";

import { useRef, useState } from "react";

type ImageCarouselProps = {
  images: string[];
  alt: string;
  variant: "hero" | "card";
  // Sets the height (and rounding) of the carousel
  className: string;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ImageCarousel({ images, alt, variant, className }: ImageCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasManyImages = images.length > 1;
  const isHero = variant === "hero";

  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior: "smooth" });
  };

  const arrowClassName =
    "absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition-colors hover:bg-white [@media(hover:hover)]:flex";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={scrollerRef}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          if (clientWidth > 0) setActiveIndex(Math.round(scrollLeft / clientWidth));
        }}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={hasManyImages ? `${alt} - image ${index + 1}` : alt}
            loading={index === 0 ? "eager" : "lazy"}
            className="h-full w-full shrink-0 snap-start object-cover"
          />
        ))}
      </div>

      {isHero ? <div className="pointer-events-none absolute inset-0 bg-black/12" /> : null}

      {hasManyImages ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goTo((activeIndex - 1 + images.length) % images.length);
            }}
            className={`${arrowClassName} left-3`}
            aria-label="Image précédente"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goTo((activeIndex + 1) % images.length);
            }}
            className={`${arrowClassName} right-3`}
            aria-label="Image suivante"
          >
            <Chevron direction="right" />
          </button>
          <div
            className={`pointer-events-none absolute inset-x-0 flex items-center justify-center ${
              isHero ? "bottom-[70px] gap-2 lg:bottom-5" : "bottom-2 gap-1.5"
            }`}
          >
            {images.map((url, index) => {
              const isActive = index === activeIndex;
              if (isHero) {
                return (
                  <span
                    key={url}
                    className={`h-2 rounded-full transition-all ${
                      isActive ? "w-6 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                );
              }
              return (
                <span
                  key={url}
                  className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-white/60"}`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
