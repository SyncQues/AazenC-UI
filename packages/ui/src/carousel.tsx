"use client";

import { Children, type ReactNode, useState } from "react";
import { Button } from "./button";
import { carouselDotClass, carouselFrameClass, carouselItemClass, carouselTrackClass } from "./carousel-variants";

export type CarouselProps = {
  children: ReactNode;
  label?: string;
};

function Carousel({ children, label = "Slides" }: CarouselProps) {
  const count = Children.toArray(children).length;
  const [index, setIndex] = useState(0);
  const current = count === 0 ? 0 : Math.min(index, count - 1);

  return (
    <div data-slot="carousel" role="region" aria-roledescription="carousel" aria-label={label} className="w-full">
      <div className={carouselFrameClass}>
        <div className={carouselTrackClass} style={{ translate: `${-current * 100}% 0` }}>
          {children}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <span className="pointer-events-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous slide"
              disabled={current === 0}
              onClick={() => setIndex(current - 1)}
            >
              <Chevron direction="left" />
            </Button>
          </span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <span className="pointer-events-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next slide"
              disabled={current >= count - 1}
              onClick={() => setIndex(current + 1)}
            >
              <Chevron direction="right" />
            </Button>
          </span>
        </div>
      </div>
      {count > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: count }, (_, dot) => (
            <button
              key={dot}
              type="button"
              className={carouselDotClass}
              data-active={dot === current}
              aria-label={`Go to slide ${dot + 1}`}
              aria-current={dot === current ? "true" : undefined}
              onClick={() => setIndex(dot)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type CarouselItemProps = {
  children: ReactNode;
};

function CarouselItem({ children }: CarouselItemProps) {
  return (
    <div data-slot="carousel-item" role="group" aria-roledescription="slide" className={carouselItemClass}>
      {children}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === "left" ? <path d="M15 6 9 12l6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

export { Carousel, CarouselItem };
