"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import {
  segmentedControlItemVariants,
  segmentedControlItemsInClass,
  segmentedControlMarkClass,
  segmentedControlMarkInClass,
  segmentedControlVariants,
  type SegmentedControlSize,
  type SegmentedControlVariant,
} from "./segmented-control-variants";

const ITEM_SELECTOR = "[data-slot=segmented-control-item]";

const NAVIGATION_KEYS = new Set([
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

/**
 * Generic over the answer. The rows this replaced were all union-typed state —
 * `"smooth" | "linear" | "step"` — and on a `string` API every one of them needed
 * a cast in its `onValueChange`. Five casts in one storyboard is how a control
 * quietly gets typed as `string` and then hands a bad value to a chart.
 *
 * `className` is deliberately *not* omitted, unlike most components in this
 * package: the track is a flex row inside someone else's layout and there is
 * always a `w-full` or a `ml-auto` that has to be merged in. Omitting it and
 * letting it ride the rest-spread means the caller's classes land after the
 * variants rather than merged with them.
 */
export interface SegmentedControlProps<T extends string = string>
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue"> {
  options: readonly SegmentedControlOption<T>[];
  /** Controlled answer. Omit it to let the control keep its own. */
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  variant?: SegmentedControlVariant;
  size?: SegmentedControlSize;
  /** Names the group for a reader. Falls back to `aria-label` on the root. */
  label?: string;
}

type MarkBox = { x: number; y: number; w: number; h: number };

/**
 * The mark's rect in the track's own coordinate space.
 *
 * `getBoundingClientRect` on the track returns the *border* box, but an absolutely
 * positioned mark is placed against the *padding* box, so the border width has to
 * come off the difference or a 1px track border slides the whole mark 1px off
 * its label. Reading the border off the computed style is the explicit version of
 * that correction — the same thing `tabs` gets slightly wrong and nobody has
 * noticed because the error is a pixel.
 *
 * Rounded on purpose: a sub-pixel rect makes the mark a hair narrower than the ink
 * it is supposed to be sitting behind.
 */
function measureMark(track: HTMLElement): MarkBox | null {
  const active = track.querySelector<HTMLElement>(`${ITEM_SELECTOR}[data-selected="true"]`);
  if (!active) return null;
  const style = getComputedStyle(track);
  const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0;
  const borderTop = Number.parseFloat(style.borderTopWidth) || 0;
  const trackRect = track.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  return {
    x: Math.round(rect.left - trackRect.left - borderLeft),
    y: Math.round(rect.top - trackRect.top - borderTop),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
  };
}

function sameBox(a: MarkBox | null, b: MarkBox | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

function readOptions(track: HTMLElement): HTMLButtonElement[] {
  return Array.from(track.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR));
}

/**
 * One exclusive answer, given as options.
 *
 * A `radiogroup`, not a row of buttons. The rows this replaced were a map over
 * `Button`, which meant a screen reader announced four unlabelled buttons and the
 * answer — that exactly one of them is chosen — existed only in a background
 * colour. Arrow keys, `Home`/`End`, and a single tab stop are what make the
 * control legible as a choice rather than as four separate controls, and they are
 * the part worth owning rather than hand-rolling over and over per storyboard.
 *
 * There is no Radix toggle-group in the dependency set, and adding a primitive so
 * one component can get arrow keys would put a new entry in every consumer's
 * `package.json` and in every `registry:ui` install. It is ~30 lines here.
 *
 * The mark is measured off the DOM rather than computed from the option list,
 * because the options are content-sized and any arithmetic that assumes otherwise
 * is wrong the first time a label is longer than its neighbour.
 */
function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  variant = "segmented",
  size = "default",
  label,
  className,
  ...props
}: SegmentedControlProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
  const [box, setBox] = useState<MarkBox | null>(null);

  const controlled = value !== undefined;
  const active = controlled ? value : uncontrolled;

  const select = useCallback(
    (next: T) => {
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => setBox((current) => {
      const next = measureMark(track);
      return sameBox(current, next) ? current : next;
    });

    // Re-measured on the answer changing as well as on DOM mutations: the observer
    // only fires after React has committed, which is a frame of the mark still
    // sitting on the old option. `options` is deliberately not a dependency — the
    // preview passes a fresh array literal every render, and re-running this on
    // every one of those would measure in a loop. A changed option width is a
    // track resize, which the observer below already catches.
    sync();

    const mutations = new MutationObserver(sync);
    mutations.observe(track, {
      attributes: true,
      attributeFilter: ["data-selected"],
      childList: true,
      subtree: true,
    });
    const sizes = new ResizeObserver(sync);
    sizes.observe(track);
    return () => {
      mutations.disconnect();
      sizes.disconnect();
    };
  }, [active, variant, size]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!NAVIGATION_KEYS.has(event.key)) return;
    const track = trackRef.current;
    if (!track) return;
    const enabled = readOptions(track).filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    event.preventDefault();

    const current = document.activeElement as HTMLElement | null;
    const index = current ? enabled.indexOf(current as HTMLButtonElement) : -1;

    let next: HTMLButtonElement | undefined;
    if (event.key === "Home") {
      next = enabled[0];
    } else if (event.key === "End") {
      next = enabled[enabled.length - 1];
    } else {
      const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
      // From nothing focused, Backward lands on the last option and Forward on
      // the first, which is the direction the key asked for rather than always
      // snapping to the head of the row.
      const from = index === -1 ? (backwards ? 0 : -1) : index;
      const delta = backwards ? -1 : 1;
      next = enabled[(from + delta + enabled.length) % enabled.length];
    }
    // Unreachable while the row has an enabled option, but the index arithmetic
    // above is the kind of thing that quietly goes out of range the day a
    // wrapping or filtering rule lands.
    if (!next) return;

    next.focus();
    const nextValue = next.dataset.value;
    // The value came off the DOM, so it is a string by the time it gets here.
    // The mark is only ever measured from an option this same render put there,
    // so the cast cannot be wrong in practice.
    if (nextValue !== undefined) select(nextValue as T);
  }

  // One tab stop for the whole row: the chosen option takes it, and a row with no
  // answer yet hands it to the first option that can be reached.
  const selectedIndex = options.findIndex((option) => option.value === active);
  const fallbackIndex = options.findIndex((option) => !option.disabled);

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-orientation="horizontal"
      aria-label={label ?? props["aria-label"]}
      data-slot="segmented-control"
      data-variant={variant}
      data-size={size}
      onKeyDown={onKeyDown}
      className={cn(segmentedControlVariants({ variant }), className)}
      {...props}
    >
      {box ? (
        <span
          aria-hidden
          data-slot="segmented-control-mark"
          className={cn(segmentedControlMarkClass, segmentedControlMarkInClass)}
          style={{ width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }}
        />
      ) : null}
      {options.map((option, index) => {
        const selected = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={
              index === (selectedIndex === -1 ? fallbackIndex : selectedIndex) ? 0 : -1
            }
            disabled={option.disabled}
            data-slot="segmented-control-item"
            data-selected={selected}
            data-value={option.value}
            onClick={() => select(option.value)}
            className={cn(
              segmentedControlItemsInClass,
              segmentedControlItemVariants({ variant, size, selected }),
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
