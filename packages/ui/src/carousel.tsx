"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button } from "./button";
import { carouselDotClass, carouselDotMarkClass, carouselFrameClass, carouselItemClass, carouselTrackClass } from "./carousel-variants";

type CarouselContextValue = { current: number; count: number };

const CarouselContext = createContext<CarouselContextValue>({ current: 0, count: 0 });

export interface CarouselProps extends Omit<ComponentProps<"div">, "className" | "children"> {
  children: ReactNode;
  label?: string;
}

function Carousel({ children, label = "Slides", onKeyDown, ...rest }: CarouselProps) {
  const items = Children.toArray(children);
  const count = items.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const current = count === 0 ? 0 : Math.min(index, count - 1);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    setIndex(clamped);
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    setIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
  };

  const onRegionKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      go(0);
    } else if (event.key === "End") {
      event.preventDefault();
      go(count - 1);
    }
  };

  return (
    <CarouselContext.Provider value={{ current, count }}>
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className="w-full"
        onKeyDown={onRegionKeyDown}
        {...rest}
      >
        <div className={carouselFrameClass}>
          <div ref={scrollerRef} className={carouselTrackClass} onScroll={onScroll}>
            {items.map((child, itemIndex) =>
              isValidElement(child) ? cloneElement(child as ReactElement<{ index?: number }>, { index: itemIndex }) : child,
            )}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <span className="pointer-events-auto">
              <Button type="button" variant="outline" size="icon" aria-label="Previous slide" disabled={current === 0} onClick={() => go(current - 1)}>
                <Chevron direction="left" />
              </Button>
            </span>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="pointer-events-auto">
              <Button type="button" variant="outline" size="icon" aria-label="Next slide" disabled={current >= count - 1} onClick={() => go(current + 1)}>
                <Chevron direction="right" />
              </Button>
            </span>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          Slide {current + 1} of {count}
        </p>
        {count > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: count }, (_, dot) => (
              <button
                key={dot}
                type="button"
                className={`group ${carouselDotClass}`}
                data-active={dot === current}
                aria-label={`Go to slide ${dot + 1}`}
                aria-current={dot === current ? "true" : undefined}
                onClick={() => go(dot)}
              >
                <span className={carouselDotMarkClass} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </CarouselContext.Provider>
  );
}

export type CarouselItemProps = {
  children: ReactNode;
  index?: number;
};

function CarouselItem({ children, index = 0 }: CarouselItemProps) {
  const { current, count } = useContext(CarouselContext);
  const hidden = index !== current;

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      aria-hidden={hidden || undefined}
      inert={hidden ? true : undefined}
      className={carouselItemClass}
    >
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
