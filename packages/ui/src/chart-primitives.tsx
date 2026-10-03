"use client";

/**
 * Chart internals. Nothing here is exported from the package entry — these are
 * the parts a chart is assembled from, and they are the reason five different
 * charts share one tooltip, one axis treatment, and one pointer model.
 *
 * A charting library gives you all of this for free and then charges for it in
 * bundle size and in control: SyncQues overrides the tooltip with an inline
 * `contentStyle` on every chart because the library's own tooltip cannot be
 * themed. Here the tooltip is ours, so it is themed by construction.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import {
  chartAxisLabelVariants,
  chartGridVariants,
  chartLegendItemVariants,
  chartLegendSwatchVariants,
  chartLegendVariants,
  chartOverlayVariants,
  chartPlotVariants,
  chartTooltipRowVariants,
  chartTooltipTitleVariants,
  chartTooltipVariants,
  type ChartLegendVariantProps,
  type ChartTooltipVariantProps,
} from "./chart-variants";
import {
  formatChartValue,
  toFiniteNumber,
  type ChartFormatOptions,
  type ChartSeries,
  type ChartSlice,
} from "./chart-utils";

/* ------------------------------------------------------------------ sizing -- */

/** Tracks the pointer between values. Defined here rather than in
 *  `chart-variants` because it is a motion hook, not a paint recipe — the
 *  keyframe it names lives in `@aazenc/animations`. */
const chartCrosshair = "chart-crosshair";

/**
 * Track a container's width with `ResizeObserver`.
 *
 * An SVG chart cannot size itself: it has no intrinsic width, and `width="100%"`
 * on a `<svg>` with a viewBox does give it the box, so the *element* is fine —
 * but the *geometry inside* still needs a pixel number to lay out points. A
 * charting library re-renders on every resize for this; so does this, and it is
 * the one unavoidable re-render in a chart.
 *
 * The initial width is a deliberate lie. SSR and the first client paint have no
 * layout, so charts start at a sensible desktop width and correct on the first
 * observer callback. Laying out at 0 makes every scale divide by zero and draws
 * a frame of garbage.
 */
export function useContainerWidth(
  fallback = 640,
): [(node: HTMLElement | null) => void, number] {
  const [width, setWidth] = useState(fallback);
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback((element: HTMLElement | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!node) return;

    const measure = () => {
      const next = node.getBoundingClientRect().width;
      // Sub-pixel layout widths thrash the state on a fractional-pixel scale
      // factor, which re-renders on every scroll. Rounding to whole pixels ends
      // that for a difference nobody can see.
      if (next > 0) setWidth(Math.round(next));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, width];
}

/** Read the user's motion preference.
 *
 * Read from a media query at mount rather than from a CSS class, because the
 * chart has to know whether to *render* the reveal at all — a `prefers-reduced-
 * motion` chart still animates nothing, but it should also not pay for a
 * `stroke-dasharray` on every path it draws.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ---------------------------------------------------------------- the frame -- */

export interface ChartFrameProps extends Omit<
  ComponentProps<"div">,
  "className" | "children"
> {
  width: number;
  height: number;
  /** A short description of what the chart shows. Read out instead of the
   *  geometry, which a screen reader cannot describe. */
  label: string;
  /** The data table a screen reader can fall back to. Charts are the one place
   *  where shipping the underlying numbers is not optional. */
  table?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * The plot frame: a sized, labelled `<figure>`.
 *
 * The width is passed in rather than measured here, because every chart already
 * has it — it measured the container to build its scales, and measuring it a
 * second time inside the frame would put a second `ResizeObserver` on the same
 * box and a second render pass behind every resize.
 *
 * `role="figure"` with an explicit `aria-label` means assistive tech announces
 * "chart, revenue by month" rather than "graphics symbol".
 */
export function ChartFrame({
  width,
  height,
  label,
  table,
  className,
  children,
  ...props
}: ChartFrameProps) {
  return (
    <div
      data-slot="chart-frame"
      className={cn(chartPlotVariants({ interactive: false }), className)}
      {...props}
    >
      <svg
        role="figure"
        aria-label={label}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {children}
      </svg>
      {table ? <div className="sr-only">{table}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- axes -- */

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Gutter sizes, from the tick density rather than from a constant. A y-axis
 *  showing `1.2M` needs more room than one showing `4`, and a fixed margin
 *  either clips the first or wastes the gutter. */
export function resolveYAxisWidth(
  ticks: readonly number[],
  format: (value: number) => string,
): number {
  const longest = ticks.reduce(
    (max, tick) => Math.max(max, format(tick).length),
    0,
  );
  // 6.5px per character at 11px Inter, plus the 8px gap to the plot, floored at
  // enough room for a single digit plus the tick padding.
  return Math.max(28, Math.ceil(longest * 6.5) + 14);
}

export interface ChartGridProps {
  width: number;
  height: number;
  margin: ChartMargin;
  ticks: readonly number[];
  scale: (value: number) => number | null;
  /**
   * X positions in pixels, one per category. Only read for `variant: "both"`.
   *
   * A vertical rule is positioned by the category axis, not by the value ticks,
   * so it cannot be derived from `ticks` — an earlier version drew one per
   * *value* tick all at `margin.left`, which stacked N lines on the left edge
   * and made "both" render identically to "horizontal". The caller owns the
   * band scale, so the caller supplies the positions.
   */
  xPositions?: readonly number[];
  variant?: "horizontal" | "both" | "none";
  density?: "normal" | "subtle";
  className?: string;
}

/**
 * Grid rules.
 *
 * Drawn *under* the series and never given an axis line: a full-width border
 * around the plot competes with the data, and `axisLine={false}` is the single
 * most common thing a chart gets right. `shapeRendering="crispEdges"` snaps the
 * lines to the pixel grid — a 1px rule drawn at y=100.5 renders as two blurry
 * half-pixels on a non-retina display.
 */
export function ChartGrid({
  width,
  height,
  margin,
  ticks,
  scale,
  xPositions,
  variant = "horizontal",
  density = "normal",
  className,
}: ChartGridProps) {
  if (variant === "none") return null;
  const plotBottom = height - margin.bottom;

  return (
    <g
      data-slot="chart-grid"
      className={cn(
        "chart-plot-in",
        chartGridVariants({ style: variant, density }),
        className,
      )}
      aria-hidden="true"
    >
      {ticks.map((tick) => {
        const y = scale(tick);
        if (y === null) return null;
        return (
          <line
            key={`h-${tick}`}
            x1={margin.left}
            x2={width - margin.right}
            y1={y}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
            className="chart-grid-line"
            shapeRendering="crispEdges"
          />
        );
      })}
      {variant === "both"
        ? (xPositions ?? []).map((x, index) => (
            <line
              key={`v-${index}`}
              x1={x}
              x2={x}
              y1={margin.top}
              y2={plotBottom}
              stroke="var(--border)"
              strokeWidth={1}
              className="chart-grid-line"
              shapeRendering="crispEdges"
            />
          ))
        : null}
    </g>
  );
}

export interface ChartAxisProps {
  height: number;
  margin: ChartMargin;
  ticks: readonly number[];
  scale: (value: number) => number | null;
  format: (value: number) => string;
  orientation: "horizontal" | "vertical";
  className?: string;
}

/**
 * Axis tick labels. `aria-hidden`: the frame already announces what the chart is,
 * and a screen reader reading "0, 500, 1,000" aloud on top of that is noise.
 */
export function ChartAxis({
  height,
  margin,
  ticks,
  scale,
  format,
  orientation,
  className,
}: ChartAxisProps) {
  const plotBottom = height - margin.bottom;

  if (orientation === "vertical") {
    return (
      <g
        data-slot="chart-axis-y"
        aria-hidden="true"
        className={cn("chart-plot-in", className)}
      >
        {ticks.map((tick) => {
          const y = scale(tick);
          if (y === null) return null;
          return (
            <text
              key={tick}
              x={margin.left - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className={chartAxisLabelVariants({ orientation: "vertical" })}
            >
              {format(tick)}
            </text>
          );
        })}
      </g>
    );
  }

  return (
    <g
      data-slot="chart-axis-x"
      aria-hidden="true"
      className={cn("chart-plot-in", className)}
    >
      {ticks.map((tick) => {
        const x = scale(tick);
        if (x === null) return null;
        return (
          <text
            key={tick}
            x={x}
            y={plotBottom + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            className={chartAxisLabelVariants({ orientation: "horizontal" })}
          >
            {format(tick)}
          </text>
        );
      })}
    </g>
  );
}

/** Category labels under a band axis. Every nth is shown once the labels would
 *  otherwise collide — a 24-bar chart printing 24 labels prints 24 unreadable
 *  ones. */
export function ChartCategoryLabels({
  labels,
  centers,
  plotBottom,
  maxLabels,
  className,
}: {
  labels: readonly string[];
  centers: readonly number[];
  plotBottom: number;
  maxLabels: number;
  className?: string;
}) {
  const count = labels.length;
  if (count === 0) return null;
  const stride = Math.max(1, Math.ceil(count / Math.max(1, maxLabels)));

  return (
    <g
      data-slot="chart-axis-x"
      aria-hidden="true"
      className={cn("chart-plot-in", className)}
    >
      {labels.map((label, index) => {
        if (index % stride !== 0) return null;
        const center = centers[index];
        if (center === null || center === undefined) return null;
        return (
          <text
            key={`${label}-${index}`}
            x={center}
            y={plotBottom + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            className={chartAxisLabelVariants({ orientation: "horizontal" })}
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------- interaction -- */

export interface ChartPointerState {
  /** Index into the data array, or -1 when the pointer is not over a value. */
  index: number;
  /** Pointer position in plot pixels, for placing the crosshair. */
  x: number;
  y: number;
  /** Plot-pixel y of the value itself, or `null` when there is no reading. */
  valueY: number | null;
}

const noPointer: ChartPointerState = { index: -1, x: 0, y: 0, valueY: null };

export interface ChartPointerHandlers {
  onPointerMove: (event: ReactPointerEvent<Element>) => void;
  onPointerLeave: () => void;
  onPointerDown: (event: ReactPointerEvent<Element>) => void;
  onKeyDown: (event: ReactKeyboardEvent<Element>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * Turn pointer movement over the plot into a data index.
 *
 * This is the whole interaction model the five charts share, and it is the part
 * a charting library is hardest to customise — SyncQues has no crosshair at all,
 * so a reader has to hit a 3px dot to get a value.
 *
 * The overlay is a real element with `role="slider"` semantics: a chart that can
 * be read by arrow key is a chart that works without a mouse, on a keyboard, and
 * through a screen reader's virtual cursor. `aria-valuenow` is the index and the
 * value is read out in `aria-valuetext`, which is what makes it announce
 * "1,240" instead of "14".
 */
export function useChartPointer(options: {
  /** Pixel position of each value, along the band's axis. */
  centers: readonly number[];
  /** Which axis `centers` run along. A horizontal bar chart's band runs down the
   *  page, so its hit test has to read `clientY`, not `clientX`. */
  axis?: "x" | "y";
  /** Pixel position of each value on the axis the band does not run along.
   *  Vertical for a column, line, or area chart; horizontal for a horizontal
   *  bar. Keyboard placement anchors the tooltip here, and the crosshair ring
   *  reads it as `valueY` when the band runs left to right. */
  values?: readonly (number | null)[];
  /** Hit slack, in pixels. Zero means the pointer has to be exactly on a
   *  value; the default is half a step, so a column chart behaves like the
   *  column it looks like and a line chart behaves like the line. */
  hitSlop?: number;
  disabled?: boolean;
}): {
  pointer: ChartPointerState;
  handlers: ChartPointerHandlers;
  focused: boolean;
} {
  const { centers, axis = "x", values, hitSlop, disabled = false } = options;
  const [pointer, setPointer] = useState<ChartPointerState>(noPointer);
  const [focused, setFocused] = useState(false);

  // Kept in a ref so the keydown handler is not rebuilt on every pointer move.
  const centersRef = useRef(centers);
  centersRef.current = centers;
  const valuesRef = useRef(values);
  valuesRef.current = values;

  /** The value's own y, so the crosshair ring lands on the reading, not the cursor.
   *  A band running down the page has no value y — only the two charts that draw
   *  a crosshair ever read this, and both run their band left to right. */
  const valueYAt = useCallback(
    (index: number): number | null => {
      if (index < 0 || axis === "y") return null;
      return valuesRef.current?.[index] ?? null;
    },
    [axis],
  );

  const step =
    centers.length > 1
      ? Math.abs((centers[centers.length - 1] ?? 0) - (centers[0] ?? 0)) /
        (centers.length - 1)
      : 0;
  const slack = hitSlop ?? step / 2;

  const findIndex = useCallback(
    (position: number): number => {
      const list = centersRef.current;
      if (list.length === 0) return -1;
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < list.length; index += 1) {
        const center = list[index];
        if (center === null || center === undefined) continue;
        const distance = Math.abs(center - position);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      }
      if (best === -1 || bestDistance > slack) return -1;
      return best;
    },
    [slack],
  );

  const resolve = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (disabled) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width === 0) return;
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      // Both coordinates are always kept: the tooltip anchors off them even
      // though only the band's own axis decides which index was hit.
      const index = findIndex(axis === "y" ? y : x);
      setPointer({ index, x, y, valueY: valueYAt(index) });
    },
    [axis, disabled, findIndex, valueYAt],
  );

  const handlers = useMemo<ChartPointerHandlers>(
    () => ({
      onPointerMove: resolve,
      // A tap on a touch screen has no hover, so the first touch both moves and
      // sticks. `onPointerDown` is used rather than a click handler because a
      // click is not fired for a drag, and dragging is how a chart is read on
      // a phone.
      onPointerDown: resolve,
      onPointerLeave: () => {
        // A focused chart keeps its value while the pointer leaves: losing the
        // readout the moment the finger lifts would make a touch chart
        // impossible to read.
        if (!focused) setPointer(noPointer);
      },
      onKeyDown: (event: ReactKeyboardEvent<Element>) => {
        if (disabled) return;
        const list = centersRef.current;
        if (list.length === 0) return;
        const current = pointer.index;
        let next = current;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          next = current < 0 ? 0 : Math.min(list.length - 1, current + 1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          next = current < 0 ? list.length - 1 : Math.max(0, current - 1);
        } else if (event.key === "Home") {
          next = 0;
        } else if (event.key === "End") {
          next = list.length - 1;
        } else if (event.key === "Escape") {
          setPointer(noPointer);
          return;
        } else {
          return;
        }
        event.preventDefault();
        setFocused(true);
        const center = list[next];
        setPointer((current) => {
          const along = center ?? 0;
          const cross = valuesRef.current?.[next] ?? null;
          // The band axis moves to the category. The other axis moves to the
          // value, so a keyboard tooltip sits on the bar instead of the plot edge.
          const placed =
            axis === "y"
              ? { x: cross ?? current.x, y: along }
              : { x: along, y: cross ?? current.y };
          return {
            ...current,
            ...placed,
            index: next,
            valueY: valueYAt(next),
          };
        });
      },
      onFocus: () => {
        setFocused(true);
        setPointer((current) => {
          if (current.index >= 0) return current;
          const first = centersRef.current[0] ?? 0;
          const index = Math.min(centersRef.current.length - 1, 0);
          const cross = valuesRef.current?.[0] ?? null;
          const placed =
            axis === "y"
              ? { y: first, x: cross ?? current.x }
              : { x: first, y: cross ?? current.y };
          return {
            ...current,
            ...placed,
            index,
            valueY: valueYAt(index),
          };
        });
      },
      onBlur: () => setFocused(false),
    }),
    [axis, disabled, focused, pointer.index, resolve, valueYAt],
  );

  return { pointer, handlers, focused };
}

/**
 * The one element that makes a chart interactive.
 *
 * A transparent div laid over the plot, carrying the pointer handlers, the
 * keyboard handlers, and the `role="slider"` semantics together.
 *
 * The obvious build is two nodes — a `<rect>` inside the `<svg>` for the
 * keyboard, a `<div>` over it for the pointer — and that is what this started
 * as. It costs an extra element, splits focus from the thing the pointer is
 * over, and puts two sets of identical handlers on the same box where whichever
 * one the browser picks first wins and the other looks like a bug. One surface
 * has one set of handlers, and the element a reader tabs to is the element the
 * pointer is on.
 *
 * It sits *above* the marks, or a 2px line cannot be hit, and the tooltip it
 * contains is `pointer-events: none`, or crossing the gap between the plot and
 * the bubble would make the bubble flicker.
 */
export function ChartInteractionSurface({
  pointer,
  handlers,
  count,
  label,
  valueText,
  className,
  children,
}: {
  pointer: ChartPointerState;
  handlers: ChartPointerHandlers;
  count: number;
  label: string;
  valueText: (index: number) => string;
  className?: string;
  children?: ReactNode;
}) {
  const active = pointer.index >= 0;
  return (
    <div
      data-slot="chart-interaction"
      className={cn(chartOverlayVariants(), className)}
      role="slider"
      tabIndex={count === 0 ? -1 : 0}
      aria-label={label}
      aria-valuemin={count > 0 ? 0 : undefined}
      aria-valuemax={count > 0 ? count - 1 : undefined}
      aria-valuenow={active ? pointer.index : undefined}
      aria-valuetext={active ? valueText(pointer.index) : undefined}
      onPointerMove={handlers.onPointerMove}
      onPointerLeave={handlers.onPointerLeave}
      onPointerDown={handlers.onPointerDown}
      onKeyDown={handlers.onKeyDown}
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- crosshair -- */

/** The vertical rule and the dot that follow the pointer. */
export function ChartCrosshair({
  pointer,
  center,
  top,
  bottom,
  color,
}: {
  pointer: ChartPointerState;
  center: number | null;
  top: number;
  bottom: number;
  color: string;
}) {
  if (center === null || pointer.index < 0) return null;
  // No reading means no ring: the rule still shows, the value does not exist.
  const valueY = pointer.valueY;
  return (
    <g
      data-slot="chart-crosshair"
      className={chartCrosshair}
      aria-hidden="true"
    >
      <line
        x1={center}
        x2={center}
        y1={top}
        y2={bottom}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="3 3"
        shapeRendering="crispEdges"
      />
      {valueY === null ? null : (
        <circle
          cx={center}
          cy={valueY}
          r={4.5}
          fill="var(--card)"
          stroke={color}
          strokeWidth={2.5}
          className="chart-point-active"
        />
      )}
    </g>
  );
}

/* ----------------------------------------------------------------- tooltip -- */

export interface ChartTooltipRow {
  label: string;
  value: string;
  color?: string;
  emphasis?: "normal" | "strong";
}

export interface ChartTooltipProps extends ChartTooltipVariantProps {
  title: string;
  rows: readonly ChartTooltipRow[];
  /** Plot-pixel position to anchor to. */
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
}

/**
 * The readout.
 *
 * The flip logic is the part worth keeping: a bubble that renders at the pointer
 * and then runs off the right edge is the single most common tooltip bug. This
 * one measures the bubble after mount and flips to the other side when it would
 * overflow, so a value near the right edge of a chart is still readable.
 */
export function ChartTooltip({
  title,
  rows,
  x,
  y,
  width,
  height,
  placement = "auto",
  tone = "default",
  className,
}: ChartTooltipProps) {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    const node = bubbleRef.current;
    if (!node) return;

    const measure = () => {
      setSize({ width: node.offsetWidth, height: node.offsetHeight });
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    // Measured, not derived from the props: a row that widens from `9` to
    // `1,240,000` changes the bubble's width with the same title and row count.
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const bubbleWidth = size?.width ?? 144;
  const bubbleHeight = size?.height ?? 64;

  const flipX = x + bubbleWidth + 16 > width;
  const flipY = y - bubbleHeight - 12 < 0;

  const left =
    placement === "bottom"
      ? x
      : placement === "top"
        ? x
        : flipX
          ? Math.max(4, x - bubbleWidth - 12)
          : x + 12;
  const top =
    placement === "top"
      ? Math.max(4, y - bubbleHeight - 10)
      : placement === "bottom"
        ? y + 10
        : flipY
          ? y + 14
          : y - bubbleHeight / 2;

  return (
    <div
      ref={bubbleRef}
      data-slot="chart-tooltip"
      data-placement={placement}
      className={cn(chartTooltipVariants({ placement, tone }), className)}
      style={{
        // Clamped on both edges. The horizontal clamp is what keeps a value
        // near the right-hand side of a chart on screen; the vertical one is
        // what keeps a value near the floor from hanging below the plot, which
        // is the same bug one axis over.
        left: `clamp(0px, ${Math.round(left)}px, calc(100% - ${bubbleWidth + 4}px))`,
        top: `clamp(0px, ${Math.round(top)}px, ${Math.max(0, height - bubbleHeight - 4)}px)`,
      }}
    >
      <div className={chartTooltipTitleVariants({ size: "md" })}>{title}</div>
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn(
              chartTooltipRowVariants({ emphasis: row.emphasis ?? "normal" }),
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              {row.color ? (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-[3px]"
                  style={{ background: row.color }}
                />
              ) : null}
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Announce the active value without moving focus. Charts are the one place
 *  where a live region earns its keep: the value changes on hover, and a screen
 *  reader user cannot see that happen. */
export function ChartLiveRegion({ message }: { message: string }) {
  return (
    <span
      data-slot="chart-live"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </span>
  );
}

/* ------------------------------------------------------------------ legend -- */

export interface ChartLegendItem {
  label: string;
  color: string;
  shape?: "square" | "circle" | "line";
  id?: string;
  active?: boolean;
}

export interface ChartLegendProps extends ChartLegendVariantProps {
  items: readonly ChartLegendItem[];
  onItemClick?: (item: ChartLegendItem, index: number) => void;
  className?: string;
}

/**
 * A legend built from the same data the chart draws.
 *
 * The SyncQues pie legend is a second hand-maintained list beside the chart, so
 * it drifts: change a slice name, forget the legend, and the two disagree. This
 * one is derived, so it cannot.
 *
 * `role="list"` on a `<ul>` would be redundant, but the interactive case needs
 * real buttons — a legend a reader cannot press is a legend that only sighted
 * mouse users get.
 */
export function ChartLegend({
  items,
  align = "start",
  orientation = "horizontal",
  onItemClick,
  className,
}: ChartLegendProps) {
  if (items.length === 0) return null;
  return (
    <ul
      data-slot="chart-legend"
      className={cn(chartLegendVariants({ align, orientation }), className)}
    >
      {items.map((item, index) => {
        const interactive = Boolean(onItemClick);
        const content = (
          <>
            <span
              aria-hidden="true"
              className={chartLegendSwatchVariants({
                shape: item.shape ?? "square",
              })}
              style={{ background: item.color }}
            />
            <span className="truncate">{item.label}</span>
          </>
        );
        return (
          <li key={item.id ?? `${item.label}-${index}`} className="min-w-0">
            {interactive ? (
              <button
                type="button"
                aria-pressed={item.active ?? true}
                onClick={() => onItemClick?.(item, index)}
                className={cn(
                  chartLegendItemVariants({
                    interactive: true,
                    active: item.active ?? true,
                  }),
                  "border-0 bg-transparent p-0",
                )}
              >
                {content}
              </button>
            ) : (
              <span
                className={cn(
                  chartLegendItemVariants({
                    interactive: false,
                    active: item.active ?? true,
                  }),
                )}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------- defs -- */

/**
 * A vertical gradient from a series color to nothing, for area fills.
 *
 * `color-mix` rather than a hardcoded alpha pair so the fade follows the series
 * color in every theme — a gradient written as `rgba(37, 99, 235, 0.3)` fades
 * to black-blue in dark mode, which is the exact bug every hand-written area
 * chart has.
 */
export function ChartAreaGradient({
  id,
  color,
  intensity = 0.28,
}: {
  id: string;
  color: string;
  intensity?: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={intensity} />
      <stop offset="60%" stopColor={color} stopOpacity={intensity * 0.35} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );
}

/** A stable id for gradient/clip references. Two charts on one page must not
 *  share a gradient id or the second one's fill silently takes the first one's
 *  color. */
export function useChartId(prefix: string): string {
  const id = useId();
  // `useId` returns `:r1:`, and a colon in an id is legal in HTML but breaks a
  // `url(#…)` reference in some SVG renderers.
  return `${prefix}-${id.replace(/:/g, "")}`;
}

/* ------------------------------------------------------------------ tables -- */

/** The accessible fallback: a real table of the plotted numbers. */
export function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) =>
              cellIndex === 0 ? (
                <th key={`cell-${cellIndex}`} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={`cell-${cellIndex}`}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------------ shared -- */

/** Rows for the shared tooltip, given the series and a datum. */
export function buildTooltipRows(
  series: readonly ChartSeries[],
  datum: Record<string, unknown> | undefined,
  format: (value: number) => string,
  options: ChartFormatOptions = {},
): ChartTooltipRow[] {
  if (!datum) return [];
  const rows: ChartTooltipRow[] = [];
  for (const entry of series) {
    if (entry.hidden) continue;
    // The same coercion the plot uses, so a `""` reading is a gap in the line
    // and no row in the tooltip rather than a zero sitting under the cursor.
    const value = toFiniteNumber(datum[entry.key]);
    if (value === null) continue;
    rows.push({
      label: entry.label ?? entry.key,
      value: format(value),
      color: entry.color,
    });
  }
  void options;
  return rows;
}

/** Tooltip rows for a pie, where the readout is the slice and its share. */
export function buildSliceTooltipRows(
  slice: ChartSlice,
  fraction: number,
  format: (value: number) => string,
): ChartTooltipRow[] {
  return [
    {
      label: format(slice.value),
      value: `${(fraction * 100).toFixed(fraction >= 0.1 ? 0 : 1)}%`,
      color: slice.color,
      emphasis: "strong",
    },
  ];
}

/** CSS custom properties that carry a per-series stagger into the keyframes. */
export function staggerStyle(delay: string): CSSProperties {
  return { "--chart-delay": delay } as CSSProperties;
}

export { formatChartValue };
