"use client";

/**
 * Pie and donut.
 *
 * The slice is not a path. A path is the only way anybody has ever drawn an
 * arc, and an arc has no animatable `d`: the sweep either snaps on or has to be
 * driven from JavaScript on every frame. A stroked circle is, because
 * `stroke-dasharray` and `stroke-dashoffset` are ordinary CSS properties, so
 * the reveal runs on the compositor while React stays still. `arcGeometry`
 * hands back the one set of numbers that draws a filled pie and a ring donut
 * without branching anywhere in this file.
 *
 * The pointer model is bespoke for the same reason. `useChartPointer` ranks
 * datapoints by horizontal distance, which is how you find the column you are
 * pointing at and has no meaning at all on a pie — here the pointer is turned
 * into an angle from twelve o'clock and matched against the accumulated
 * fractions, which is the same coordinate the slices are drawn in.
 */

import {
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@aazenc/utils";
import {
  ChartDataTable,
  ChartFrame,
  ChartLegend,
  ChartLiveRegion,
  ChartTooltip,
  buildSliceTooltipRows,
  staggerStyle,
  useChartId,
  useContainerWidth,
  usePrefersReducedMotion,
} from "./chart-primitives";
import {
  chartContainerVariants,
  chartStateVariants,
} from "./chart-variants";
import {
  arcDash,
  arcGeometry,
  arcLabelPoint,
  clamp,
  formatChartValue,
  formatPercent,
  normalizeSlices,
  sliceArcs,
  staggerDelay,
  type ChartFormatOptions,
  type ChartSlice,
} from "./chart-utils";

export interface PieChartProps extends Omit<
  ComponentProps<"div">,
  "className"
> {
  data: ChartSlice[];
  variant?: "pie" | "donut";
  /** Fraction of the outer radius left hollow. Only read for `"donut"`. */
  innerRadius?: number;
  height?: number;
  showLegend?: boolean;
  legendPosition?: "bottom" | "right";
  /** Share-of-total labels on the slices. Below 4% they are unreadable, so
   *  they are dropped rather than stacked on each other. */
  showLabels?: boolean;
  /** Where a share label sits. `outside` is the default and it is a contrast
   *  decision, not a layout one: no text colour survives every slice of a
   *  categorical palette, and 39.7% printed on a navy slice in a light theme is
   *  about 2:1. Off the ring, a label sits on the card and uses the card's own
   *  foreground, which is the one colour guaranteed to contrast. `inside` is
   *  there for the brand look, and it carries its own drop shadow so the label
   *  still separates from a mid-tone slice. */
  labelPosition?: "outside" | "inside";
  format?: ChartFormatOptions | ((value: number) => string);
  label?: string;
  emptyLabel?: string;
  className?: string;
  onSliceClick?: (slice: ChartSlice, index: number) => void;
}

interface HoverState {
  /** Index into the normalized slice list, or -1 when the pointer is not on
   *  one. A pie is the one chart where the index is a slice rather than a
   *  position on an axis. */
  index: number;
  /** Plot-pixel position, so the tooltip can anchor to the pointer. */
  x: number;
  y: number;
}

const noHover: HoverState = { index: -1, x: 0, y: 0 };
const fullTurn = Math.PI * 2;
/** Below this share a slice is a sliver and a label is a smudge across its
 *  neighbours. */
const minLabelShare = 0.04;

function PieChart({
  data,
  variant = "pie",
  innerRadius = 0.6,
  height = 280,
  showLegend = true,
  legendPosition = "bottom",
  showLabels = false,
  labelPosition = "outside",
  format,
  label = "Pie chart",
  emptyLabel = "No data",
  className,
  onSliceClick,
  ...props
}: PieChartProps) {
  const [frameRef, width] = useContainerWidth();
  const reduced = usePrefersReducedMotion();
  const [hover, setHover] = useState<HoverState>(noHover);
  const [focused, setFocused] = useState(false);
  const clipId = useChartId("pie-clip");

  const formatValue = useMemo(
    () =>
      typeof format === "function"
        ? format
        : (value: number) => formatChartValue(value, format),
    [format],
  );

  const chart = useMemo(() => {
    const slices = normalizeSlices(data);
    const arcs = sliceArcs(slices);
    // The circle is inscribed in the shorter side, with a couple of pixels left
    // over: a stroke is centred on its radius, so a pie that fills the box
    // exactly paints half its outer edge over the margin.
    const outerRadius = Math.max(0, Math.min(width, height) / 2 - 2);
    const inner =
      variant === "donut" ? clamp(innerRadius, 0, 0.95) * outerRadius : 0;
    const geometry = arcGeometry({ outerRadius, innerRadius: inner });
    return {
      slices,
      arcs,
      outerRadius,
      inner,
      geometry,
      cx: width / 2,
      cy: height / 2,
      // Outside the ring by default, and that is a contrast decision rather than
      // a layout one. A label on top of a slice has to be legible against a
      // colour the caller chose and the theme re-picks in dark mode, and there
      // is no text colour that survives every slice of a categorical palette —
      // 39.7% on a navy slice in a light theme is 2.1:1, which is unreadable.
      // Off the ring, the label sits on the card and uses the card's own
      // foreground, which is the one colour guaranteed to contrast.
      labelInset:
        outerRadius > 0
          ? labelPosition === "inside"
            ? variant === "donut"
              ? // A label on the middle of the band, not at one fixed fraction
                // of the outer radius where a donut's would fall in the hole.
                (inner + outerRadius) / (2 * outerRadius)
              : 0.68
            : 1.18
          : 0,
    };
  }, [data, width, height, variant, innerRadius, labelPosition]);

  /**
   * Which slice is under a point, in the slices' own coordinate system.
   *
   * The angle is measured clockwise from twelve o'clock — the same origin the
   * `rotate(-90)` on every slice uses — so a fraction of a turn off the pointer
   * is a fraction into the accumulated arcs, with no second convention to keep
   * in step.
   */
  const sliceAt = useCallback(
    (clientX: number, clientY: number, bounds: DOMRect): number => {
      if (chart.outerRadius <= 0) return -1;
      const dx = clientX - bounds.left - chart.cx;
      const dy = clientY - bounds.top - chart.cy;
      const distance = Math.hypot(dx, dy);
      // The hole in a donut is not a slice, and the margin outside the circle
      // is not either. Guessing in either case would make the readout jump to
      // whichever wedge happens to be nearest.
      if (distance > chart.outerRadius || distance < chart.inner) return -1;
      const angle = Math.atan2(dx, -dy);
      const fraction = (((angle % fullTurn) + fullTurn) % fullTurn) / fullTurn;
      for (let index = 0; index < chart.arcs.length; index += 1) {
        const arc = chart.arcs[index];
        if (!arc) continue;
        if (fraction >= arc.start && fraction < arc.end) return index;
      }
      return -1;
    },
    [chart],
  );

  const describe = useCallback(
    (index: number) => {
      const slice = chart.slices[index];
      if (!slice) return "";
      return `${slice.name}: ${formatValue(slice.value)} (${formatPercent(slice.fraction)})`;
    },
    [chart, formatValue],
  );

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setHover({
      index: sliceAt(event.clientX, event.clientY, bounds),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const count = chart.slices.length;
    if (count === 0) return;
    const current = hover.index;
    let next = current;
    // A pie is a ring, so the arrows wrap rather than stop. Clamping the way a
    // list clamps tells the reader they have reached the end of a row, which is
    // not the shape they are looking at.
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = current < 0 ? 0 : (current + 1) % count;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = current < 0 ? count - 1 : (current - 1 + count) % count;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    } else if (event.key === "Escape") {
      setHover(noHover);
      return;
    } else if (event.key === "Enter" || event.key === " ") {
      const slice = chart.slices[current];
      if (slice) onSliceClick?.(slice, current);
      event.preventDefault();
      return;
    } else {
      return;
    }
    event.preventDefault();
    const arc = chart.arcs[next];
    const point = arc
      ? arcLabelPoint(
          chart.cx,
          chart.cy,
          chart.outerRadius,
          arc.start,
          arc.end,
          1.12,
        )
      : { x: chart.cx, y: chart.cy };
    setHover({ index: next, x: point.x, y: point.y });
  };

  if (chart.slices.length === 0) {
    return (
      <div
        data-slot="pie-chart"
        className={cn(
          chartContainerVariants({ variant: "bare", padding: "none" }),
          className,
        )}
        {...props}
      >
        <div
          data-slot="pie-chart-empty"
          className={chartStateVariants({ size: "md" })}
        >
          {emptyLabel}
        </div>
      </div>
    );
  }

  const { slices, arcs, geometry, cx, cy, outerRadius } = chart;
  const active = hover.index >= 0 ? slices[hover.index] : undefined;
  const side = showLegend && legendPosition === "right";

  const table = (
    <ChartDataTable
      caption={label}
      columns={["Name", "Value", "Share"]}
      rows={slices.map((slice) => [
        slice.name,
        formatValue(slice.value),
        formatPercent(slice.fraction),
      ])}
    />
  );

  return (
    <div
      data-slot="pie-chart"
      className={cn(
        chartContainerVariants({ variant: "bare", padding: "none" }),
        className,
      )}
      {...props}
    >
      <div
        data-slot="pie-chart-body"
        className={cn(
          "flex min-w-0",
          side
            ? "flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
            : "flex-col gap-3",
        )}
      >
        <div
          ref={frameRef}
          data-slot="pie-chart-plot"
          // A focus stop of its own: the arrow-key readout is unreachable
          // without one, and the ring is left visible so a keyboard user can
          // see where they are. The live region below says what they landed on.
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerMove={track}
          onPointerDown={track}
          onPointerLeave={() => {
            // A chart the reader is standing in keeps its value when the pointer
            // leaves; otherwise lifting a finger off a touch screen erases the
            // readout before it has been read.
            if (!focused) setHover(noHover);
          }}
          onFocus={() => {
            setFocused(true);
            setHover((current) =>
              current.index < 0 ? { index: 0, x: cx, y: cy } : current,
            );
          }}
          onBlur={() => {
            setFocused(false);
            setHover(noHover);
          }}
          onClick={(event: ReactMouseEvent<HTMLDivElement>) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const index = sliceAt(event.clientX, event.clientY, bounds);
            if (index < 0) return;
            const slice = slices[index];
            if (!slice) return;
            setHover({
              index,
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
            onSliceClick?.(slice, index);
          }}
          className={cn(
            "relative min-w-0 flex-1 rounded-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            onSliceClick && "cursor-pointer",
          )}
        >
          <ChartFrame width={width} height={height} label={label} table={table}>
            <defs>
              {/* The stroke is centred on the radius, so half of it is outside
                  the circle the geometry describes. Clipping to that circle is
                  what keeps a pie from bleeding a halo into the legend. */}
              <clipPath id={clipId}>
                <circle cx={cx} cy={cy} r={outerRadius} />
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`} aria-hidden="true">
              {slices.map((slice, index) => {
                const arc = arcs[index];
                if (!arc) return null;
                const dash = arcDash(geometry, arc.start, arc.end);
                return (
                  <circle
                    key={slice.name}
                    cx={cx}
                    cy={cy}
                    r={geometry.radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={geometry.strokeWidth}
                    strokeDasharray={dash.dasharray}
                    strokeDashoffset={dash.dashoffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    // Deliberately an opacity emphasis and not a scale. A CSS
                    // transform would replace the `rotate(-90)` attribute
                    // outright — it is a presentation attribute, and the
                    // property wins — and the whole pie would un-rotate to
                    // start at three o'clock the moment the pointer arrived.
                    className={cn(!reduced && "chart-arc-in", "chart-mark")}
                    style={{
                      opacity:
                        hover.index >= 0 && hover.index !== index ? 0.4 : 1,
                      ...(reduced ? {} : staggerStyle(staggerDelay(index))),
                    }}
                  />
                );
              })}
            </g>

            {showLabels ? (
              <g
                data-slot="pie-chart-labels"
                aria-hidden="true"
                className={cn(
                  "fill-card-foreground text-[11px] leading-none",
                  labelPosition === "inside" &&
                    "fill-white mix-blend-normal drop-shadow-[0_1px_2px_rgb(0_0_0/0.45)]"
                )}
              >
                {slices.map((slice, index) => {
                  const arc = arcs[index];
                  if (!arc || slice.fraction < minLabelShare) return null;
                  const point = arcLabelPoint(
                    cx,
                    cy,
                    outerRadius,
                    arc.start,
                    arc.end,
                    chart.labelInset,
                  );
                  // Outside, a label anchors away from the ring it belongs to.
                  // Inside, it stays centred on its own slice.
                  const outside = labelPosition === "outside";
                  return (
                    <text
                      key={`${slice.name}-label`}
                      x={point.x}
                      y={point.y}
                      textAnchor={
                        outside ? (point.x >= cx ? "start" : "end") : "middle"
                      }
                      dominantBaseline="middle"
                    >
                      {formatPercent(slice.fraction)}
                    </text>
                  );
                })}
              </g>
            ) : null}
          </ChartFrame>

          {active ? (
            <ChartTooltip
              title={active.name}
              rows={buildSliceTooltipRows(active, active.fraction, formatValue)}
              x={hover.x}
              y={hover.y}
              width={width}
              height={height}
            />
          ) : null}
          {/* Only while focused: a live region that fires on every pointer move
              talks over a screen reader user who is also driving a mouse. */}
          <ChartLiveRegion
            message={focused && hover.index >= 0 ? describe(hover.index) : ""}
          />
        </div>

        {showLegend ? (
          <div
            data-slot="pie-chart-legend"
            className={cn(side ? "sm:max-w-[14rem] sm:shrink-0" : "pt-1")}
          >
            <ChartLegend
              items={slices.map((slice, index) => ({
                // The share appears next to the slice being pointed at, so the
                // legend answers "how much is this one" without the reader
                // having to divide anything.
                label:
                  hover.index === index
                    ? `${slice.name} ${formatPercent(slice.fraction)}`
                    : slice.name,
                color: slice.color,
                shape: "circle" as const,
                active: hover.index === index,
              }))}
              align={side ? "start" : "center"}
              orientation={side ? "vertical" : "horizontal"}
              onItemClick={
                onSliceClick
                  ? (_item, index) => {
                      const slice = slices[index];
                      if (slice) onSliceClick(slice, index);
                    }
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { PieChart };
