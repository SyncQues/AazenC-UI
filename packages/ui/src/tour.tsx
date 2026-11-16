"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type Ref } from "react";
import { createPortal } from "react-dom";
import { cn } from "@aazenc/utils";
import { Button } from "./button";
import {
  placeTourCard,
  spotlightBox,
  type TourBox,
  type TourSide,
} from "./tour-utils";
import {
  tourActionsClass,
  tourCardClass,
  tourDescriptionClass,
  tourFooterClass,
  tourOverlayClass,
  tourProgressClass,
  tourSpotlightClass,
  tourTitleClass,
} from "./tour-variants";

export type { TourSide };

export interface TourStep {
  /** CSS selector for the highlighted element. Omit to center the card. */
  target?: string;
  title: string;
  description?: string;
  side?: TourSide;
}

export interface TourLabels {
  back?: string;
  next?: string;
  done?: string;
  skip?: string;
}

export interface TourProps extends Omit<ComponentProps<"div">, "className" | "children"> {
  steps: readonly TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  onFinish?: () => void;
  labels?: TourLabels;
  className?: string;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function sameBox(a: TourBox | null, b: TourBox | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function readTarget(selector: string | undefined): TourBox | null {
  if (!selector) return null;
  try {
    const node = document.querySelector(selector);
    if (!(node instanceof HTMLElement)) return null;
    const box = node.getBoundingClientRect();
    return { top: box.top, left: box.left, width: box.width, height: box.height };
  } catch {
    return null;
  }
}

function Tour({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  step,
  defaultStep = 0,
  onStepChange,
  onFinish,
  labels,
  className,
  style,
  onKeyDown,
  ref,
  ...props
}: TourProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledStep, setUncontrolledStep] = useState(defaultStep);
  const [mounted, setMounted] = useState(false);
  const [target, setTarget] = useState<TourBox | null>(null);
  const [cardSize, setCardSize] = useState({ width: 320, height: 160 });
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const maskId = useId().replace(/:/g, "");

  const isOpen = open ?? uncontrolledOpen;
  const count = steps.length;
  const index = count === 0 ? 0 : Math.min(Math.max(step ?? uncontrolledStep, 0), count - 1);
  const current = steps[index];
  const selector = current?.target;
  const preferred = current?.side ?? "bottom";

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const setIndex = (next: number) => {
    if (step === undefined) setUncontrolledStep(next);
    onStepChange?.(next);
  };

  const finish = () => {
    onFinish?.();
    setOpen(false);
  };

  const go = (delta: number) => {
    if (count === 0) return;
    const next = index + delta;
    if (next >= count) {
      finish();
      return;
    }
    if (next < 0) return;
    setIndex(next);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !mounted || count === 0) return;

    safeQuery(selector)?.scrollIntoView({ block: "nearest", inline: "nearest" });

    const measure = () => {
      setTarget((prev) => {
        const next = readTarget(selector);
        return sameBox(prev, next) ? prev : next;
      });
      const card = cardRef.current;
      if (!card) return;
      const box = card.getBoundingClientRect();
      setCardSize((prev) =>
        prev.width === box.width && prev.height === box.height ? prev : { width: box.width, height: box.height },
      );
    };

    measure();
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [isOpen, mounted, count, selector, index]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    cardRef.current?.focus();
  }, [isOpen, mounted, index]);

  if (!isOpen || !mounted || !current) return null;

  const placement = placeTourCard(
    target,
    preferred,
    cardSize,
    { width: window.innerWidth, height: window.innerHeight },
  );
  const hole = target ? spotlightBox(target) : null;
  const last = index === count - 1;

  return createPortal(
    <>
      <div data-slot="tour-overlay" className={tourOverlayClass} />
      <svg className="pointer-events-none fixed inset-0 z-[calc(var(--z-popper)+2)] h-full w-full" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {hole ? (
              <rect x={hole.left} y={hole.top} width={hole.width} height={hole.height} rx="8" fill="black" />
            ) : null}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="black" fillOpacity="0.5" mask={`url(#${maskId})`} />
      </svg>
      {hole ? (
        <div
          data-slot="tour-spotlight"
          className={tourSpotlightClass}
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
        />
      ) : null}
      <div
        data-slot="tour"
        data-side={placement.side}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={current.description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(tourCardClass, className)}
        {...props}
        style={{ top: placement.top, left: placement.left, ...style }}
        ref={(node) => {
          cardRef.current = node;
          assignRef(ref, node);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            return;
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
            return;
          }
          if (event.key !== "Tab") return;
          const items = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled)");
          if (items.length === 0) return;
          const first = items[0];
          const lastItem = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            lastItem?.focus();
          } else if (!event.shiftKey && document.activeElement === lastItem) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div>
          <h2 id={titleId} className={tourTitleClass}>
            {current.title}
          </h2>
          {current.description ? (
            <p id={descriptionId} className={tourDescriptionClass}>
              {current.description}
            </p>
          ) : null}
        </div>
        <div className={tourFooterClass}>
          <p className={tourProgressClass}>
            {index + 1} of {count}
          </p>
          <div className={tourActionsClass}>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {labels?.skip ?? "Skip"}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => go(-1)}>
              {labels?.back ?? "Back"}
            </Button>
            <Button type="button" size="sm" onClick={() => go(1)}>
              {last ? (labels?.done ?? "Done") : (labels?.next ?? "Next")}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function safeQuery(selector: string | undefined) {
  if (!selector) return null;
  try {
    const node = document.querySelector(selector);
    return node instanceof HTMLElement ? node : null;
  } catch {
    return null;
  }
}

export { Tour };
