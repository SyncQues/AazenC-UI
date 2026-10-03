"use client";

/**
 * Bars.
 *
 * The library this replaces draws a bar as a `<rect>` with `borderRadius` on all
 * four corners, so a column looks like a lozenge balanced on the axis instead
 * of a magnitude growing off it, and a negative value gets clamped to the axis
 * because a `height` cannot be negative. Both are geometry problems, not
 * styling problems, which is why the bar here is a path: `buildBarPath` rounds
 * the value end only, and a negative column is drawn downward from the zero
 * line because the value scale maps 0 to a pixel rather than to an edge.
 *
 * The horizontal layout is a second implementation, not the first one rotated.
 * It is the layout that makes a thirty-character category name readable, and
 * the axis swap is where rotated charts pick up their bugs: the band runs down
 * the y axis, the value axis runs along the bottom, the grid rules turn with
 * them, and the reveal has to grow sideways rather than upward.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import { cn } from "@aazenc/utils";
import {
  ChartAxis,
  ChartCategoryLabels,
  ChartDataTable,
  ChartFrame,
  ChartGrid,
  ChartInteractionSurface,
  ChartLegend,
  ChartLiveRegion,
  ChartTooltip,
  buildTooltipRows,
  resolveYAxisWidth,
  staggerStyle,
  useChartPointer,
  useContainerWidth,
  usePrefersReducedMotion,
  type ChartMargin,
} from "./chart-primitives";
import {
  chartAxisLabelVariants,
  chartContainerVariants,
  chartGridVariants,
  chartStateVariants,
} from "./chart-variants";
import {
  buildBarPath,
  clamp,
  createBandScale,
  createLinearScale,
  datumLabel,
  datumValue,
  formatAxisTick,
  formatChartValue,
  linearTicks,
  normalizeSeries,
  niceCeil,
  resolveDomain,
  staggerDelay,
  type BandScale,
  type ChartDatum,
  type ChartDomain,
  type ChartFormatOptions,
  type ChartSeries,
} from "./chart-utils";

export interface BarChartProps extends Omit<
  ComponentProps<"div">,
  "className"
> {
  data: ChartDatum[];
  /** The data key holding the category label. */
  xKey: string;
  /** One bar per category per series; grouped when there is more than one. */
  series: ChartSeries[];
  /** `"vertical"` draws columns, `"horizontal"` draws bars off the y axis. */
  orientation?: "vertical" | "horizontal";
  /** Accumulate the series into one bar per category instead of grouping. */
  stacked?: boolean;
  height?: number;
  /** Corner radius on the value end only. */
  radius?: number;
  showGrid?: boolean;
  /** Defaults to on for a multi-series chart and off for a single one, where a
   *  legend that repeats the axis is noise rather than information. */
  showLegend?: boolean;
  legendAlign?: "start" | "center" | "end";
  format?: ChartFormatOptions | ((value: number) => string);
  label?: string;
  emptyLabel?: string;
  className?: string;
  onHoverIndexChange?: (index: number) => void;
}

/** One bar in value space, before it has a pixel. */
interface BarSegment {
  seriesIndex: number;
  key: string;
  color: string;
  base: number;
  top: number;
  value: number;
}

/** One drawn bar, resolved to pixels. */
interface BarMark {
  key: string;
  /** Index into the data list, for the hover lookup. */
  rowIndex: number;
  d: string;
  color: string;
  /** Draw order, which is the order the reveal staggers through. */
  order: number;
}

interface BarGeometry {
  margin: ChartMargin;
  plotTop: number;
  plotBottom: number;
  plotRight: number;
  band: BandScale;
  valueScale: (value: number) => number | null;
  ticks: number[];
  labels: string[];
  centers: number[];
  /** Pixel of each row's outer value end, on the axis the band does not run along. */
  tips: number[];
  marks: BarMark[];
  maxCategoryLabels: number;
}

/**
 * The number of tick intervals that leaves every label a round number.
 *
 * `resolveDomain` rounds the domain out to a 1/2/5 × 10ⁿ step and `linearTicks`
 * then divides that domain evenly, so the labels only come out round when the
 * two happen to land together. Ask for six ticks across a ten-thousand-wide
 * domain and the axis reads `-333.3` — a domain that needed no fixing turned
 * into one that does, six lines below the code that was supposed to be
 * responsible for it. Walking down from the requested count to the first one
 * whose step divides the span exactly costs a handful of comparisons and always
 * lands on the step the domain was rounded for.
 */
function roundTickCount(domain: ChartDomain, requested: number): number {
  const span = Math.abs(domain[1] - domain[0]);
  for (let count = requested; count > 1; count -= 1) {
    if (niceCeil(span / count) * count === span) return count;
  }
  return requested;
}

/**
 * The category axis, on whichever edge the bars are growing away from.
 *
 * `ChartCategoryLabels` sits under a plot, which is the only place a column
 * chart needs it. The horizontal case repeats its stride rule rather than
 * calling it something else, because two copies of "print every nth label"
 * that agree are cheaper than one that does not.
 */
function BarCategoryAxis({
  labels,
  centers,
  margin,
  vertical,
  plotBottom,
  maxLabels,
}: {
  labels: readonly string[];
  centers: readonly number[];
  margin: ChartMargin;
  vertical: boolean;
  plotBottom: number;
  maxLabels: number;
}) {
  if (vertical) {
    return (
      <ChartCategoryLabels
        labels={labels}
        centers={centers}
        plotBottom={plotBottom}
        maxLabels={maxLabels}
      />
    );
  }

  const stride = Math.max(1, Math.ceil(labels.length / Math.max(1, maxLabels)));
  return (
    <g data-slot="chart-axis-y" aria-hidden="true">
      {labels.map((label, index) => {
        if (index % stride !== 0) return null;
        const center = centers[index];
        if (center === null || center === undefined) return null;
        return (
          <text
            key={`${label}-${index}`}
            x={margin.left - 8}
            y={center}
            textAnchor="end"
            dominantBaseline="middle"
            className={chartAxisLabelVariants({ orientation: "vertical" })}
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Value rules for a horizontal bar chart.
 *
 * `ChartGrid` runs its rules through a value scale and lays them out
 * horizontally, which is right for a column chart and mirrored into nonsense
 * for a bar chart: the same numbers, drawn at `y = scale(tick)`, come out as
 * one-pixel horizontal segments stacked on top of each other.
 */
function BarValueGrid({
  ticks,
  scale,
  plotTop,
  plotBottom,
}: {
  ticks: readonly number[];
  scale: (value: number) => number | null;
  plotTop: number;
  plotBottom: number;
}) {
  return (
    <g
      data-slot="chart-grid"
      className={chartGridVariants({ style: "horizontal" })}
      aria-hidden="true"
    >
      {ticks.map((tick) => {
        const x = scale(tick);
        if (x === null) return null;
        return (
          <line
            key={`v-${tick}`}
            x1={x}
            x2={x}
            y1={plotTop}
            y2={plotBottom}
            stroke="var(--border)"
            strokeWidth={1}
            className="chart-grid-line"
            shapeRendering="crispEdges"
          />
        );
      })}
    </g>
  );
}

function BarChart({
  data,
  xKey,
  series,
  orientation = "vertical",
  stacked = false,
  height = 280,
  radius = 4,
  showGrid = true,
  showLegend,
  legendAlign = "start",
  format,
  label = "Bar chart",
  emptyLabel = "No data",
  className,
  onHoverIndexChange,
  ...props
}: BarChartProps) {
  const [frameRef, width] = useContainerWidth();
  const reduced = usePrefersReducedMotion();
  const vertical = orientation === "vertical";
  const normalized = useMemo(() => normalizeSeries(series), [series]);

  // A function is the caller's whole answer. An options object is handed to the
  // shared formatter, so a prefix or a locale is spelled the same way in every
  // chart in the system.
  const formatValue = useMemo(
    () =>
      typeof format === "function"
        ? format
        : (value: number) => formatChartValue(value, format),
    [format],
  );
  // Axis ticks stay compact whatever the tooltip is doing: the gutter is 28px
  // wide and `1,234,567` does not fit in one.
  const tickFormat = useMemo(
    () => (value: number) =>
      formatAxisTick(
        value,
        typeof format === "function" ? undefined : format?.locale,
      ),
    [format],
  );

  const geometry = useMemo<BarGeometry | null>(() => {
    if (data.length === 0) return null;

    // Value space first, pixels second. The domain is built from the extents
    // the bars actually reach, which for a stack is the running total and not
    // the per-segment value — a stacked chart whose domain came from the raw
    // segments draws its top row through the roof.
    const labels: string[] = [];
    const plans: BarSegment[][] = [];
    const extents: number[] = [];

    for (const [rowIndex, row] of data.entries()) {
      const category = datumLabel(row, xKey);
      labels.push(category);
      const segments: BarSegment[] = [];
      let positive = 0;
      let negative = 0;

      for (const entry of normalized) {
        const value = datumValue(row, entry.key);
        if (value === null) continue;
        // Positive and negative stacks accumulate on separate cursors, so a
        // loss below the axis never pushes a win above it away from zero.
        const base = stacked ? (value >= 0 ? positive : negative) : 0;
        const top = base + value;
        if (stacked) {
          if (value >= 0) positive = top;
          else negative = top;
        }
        segments.push({
          seriesIndex: entry.index,
          // The row index keeps the key unique when two rows share a label.
          key: `${rowIndex}-${category}-${entry.key}`,
          color: entry.color,
          base,
          top,
          value,
        });
      }

      plans.push(segments);
      for (const segment of segments) extents.push(segment.base, segment.top);
    }

    const plotSize = vertical ? height : width;
    const tickCount = clamp(Math.round(plotSize / 56), 3, 6);
    // Zero baseline, always. A bar axis that starts at 40 turns a 4% gap into
    // a cliff, and a clipped bar is a lie in a way a clipped line is not.
    const domain = resolveDomain(extents, { zeroBaseline: true, tickCount });
    const ticks = linearTicks(domain, roundTickCount(domain, tickCount));

    // A horizontal bar chart is the only layout where a category name gets a
    // real gutter. `resolveYAxisWidth` is typed for numeric ticks, so the
    // string is measured here with the same 6.5px-per-character estimate — and
    // then capped, because a sixty-character label must not eat the plot.
    const longest = labels.reduce(
      (max, label) => Math.max(max, label.length),
      0,
    );
    const categoryGutter = Math.min(
      Math.max(48, Math.ceil(longest * 6.5) + 14),
      Math.max(64, width * 0.38),
    );

    const margin: ChartMargin = vertical
      ? {
          top: 12,
          right: 14,
          bottom: 28,
          left: resolveYAxisWidth(ticks, tickFormat),
        }
      : { top: 8, right: 18, bottom: 28, left: categoryGutter };

    const plotLeft = margin.left;
    const plotRight = Math.max(plotLeft, width - margin.right);
    const plotTop = margin.top;
    const plotBottom = Math.max(plotTop, height - margin.bottom);
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    const band = createBandScale(
      data.length,
      vertical ? [plotLeft, plotRight] : [plotTop, plotBottom],
      0.28,
    );
    // The value scale is the only thing that knows where zero is, and every bar
    // is measured against it. That is what puts a negative value below the
    // baseline instead of clamping it to the edge of the plot.
    const valueScale = createLinearScale(
      domain,
      vertical ? [plotBottom, plotTop] : [plotLeft, plotRight],
    );
    const zero = valueScale(0) ?? (vertical ? plotBottom : plotLeft);

    const cells = stacked ? 1 : normalized.length;
    const cell = cells > 0 ? band.bandwidth / cells : 0;
    // Grouped only. A stack has no inner gap to give up: the band padding
    // already separates one category's stack from the next.
    const gap = stacked ? 0 : cell * 0.18;
    const extent = cell - gap;

    const marks: BarMark[] = [];
    const tips: number[] = [];
    for (const [rowIndex, segments] of plans.entries()) {
      // The segment that ends the stack in its direction is the one whose
      // outer edge is the value end, so it is the only one that gets the
      // radius. A radius on every segment turns a stack into a string of pills.
      let positiveEnd = -1;
      let negativeEnd = -1;
      let positiveTip: number | null = null;
      let negativeTip: number | null = null;
      for (const segment of segments) {
        // A zero reading draws nothing, so it cannot end a stack.
        if (stacked && segment.value === 0) continue;
        if (segment.value < 0) negativeEnd = segment.seriesIndex;
        else positiveEnd = segment.seriesIndex;
      }

      for (const segment of segments) {
        const from = valueScale(segment.base) ?? zero;
        const to = valueScale(segment.top) ?? zero;
        const length = Math.abs(to - from);
        // A zero reading is a gap, not a bar of nothing. `buildBarPath` returns
        // an empty path for it anyway; skipping here also keeps a one-pixel
        // sliver of noise out of a chart that is mostly zeros.
        if (length <= 0 || extent <= 0) continue;

        const along =
          band.start(rowIndex) +
          (stacked ? 0 : segment.seriesIndex * cell + gap / 2);
        // Grouped: every bar is its own value end. Stacked: only the last
        // segment in each direction is.
        const end = segment.value < 0 ? negativeEnd : positiveEnd;
        const ends = !stacked || segment.seriesIndex === end;
        // `buildBarPath` rounds the top edge or the right edge and nothing
        // else, so a bar that grows downward or to the left keeps square
        // corners — rounding its baseline end would say "this value is
        // smaller" when it is not.
        const corner = segment.value >= 0 && ends ? radius : 0;
        // The outer pixel of this segment. A positive column ends at its top;
        // a horizontal bar ends at its right. The keyboard tooltip anchors there.
        const outer = vertical
          ? segment.value >= 0
            ? Math.min(from, to)
            : Math.max(from, to)
          : segment.value >= 0
            ? Math.max(from, to)
            : Math.min(from, to);
        if (segment.value >= 0) {
          positiveTip =
            positiveTip === null
              ? outer
              : vertical
                ? Math.min(positiveTip, outer)
                : Math.max(positiveTip, outer);
        } else {
          negativeTip =
            negativeTip === null
              ? outer
              : vertical
                ? Math.max(negativeTip, outer)
                : Math.min(negativeTip, outer);
        }

        const d = vertical
          ? buildBarPath({
              x: along,
              y: Math.min(from, to),
              width: extent,
              height: length,
              radius: corner,
              side: "top",
            })
          : buildBarPath({
              x: Math.min(from, to),
              y: along,
              width: length,
              height: extent,
              radius: corner,
              side: "right",
            });

        marks.push({
          key: segment.key,
          rowIndex,
          d,
          color: segment.color,
          order: marks.length,
        });
      }
      tips.push(
        positiveTip ?? negativeTip ?? (vertical ? plotBottom : plotLeft),
      );
    }

    return {
      margin,
      plotTop,
      plotBottom,
      plotRight,
      band,
      valueScale,
      ticks,
      labels,
      centers: plans.map((_, index) => band.center(index)),
      tips,
      marks,
      maxCategoryLabels: Math.max(
        1,
        Math.floor((vertical ? plotWidth : plotHeight) / (vertical ? 64 : 24)),
      ),
    };
  }, [
    data,
    xKey,
    normalized,
    stacked,
    vertical,
    width,
    height,
    radius,
    tickFormat,
  ]);

  // A horizontal bar chart's band runs down the y axis, so the hit test has to
  // read the y offset.
  const { pointer, handlers, focused } = useChartPointer({
    centers: geometry?.centers ?? [],
    axis: vertical ? "x" : "y",
    values: geometry?.tips ?? [],
  });

  // Reported through an effect rather than during render: the parent that
  // stores the index re-renders this chart, and a callback fired mid-render
  // would set state on a component that is still rendering.
  const hoverIndex = onHoverIndexChange;
  const reportedIndex = useRef(pointer.index);
  useEffect(() => {
    if (reportedIndex.current === pointer.index) return;
    reportedIndex.current = pointer.index;
    hoverIndex?.(pointer.index);
  }, [hoverIndex, pointer.index]);

  const valueText = useCallback(
    (index: number) => {
      const row = data[index];
      if (!row) return "";
      const rows = buildTooltipRows(normalized, row, formatValue);
      if (rows.length === 0) return datumLabel(row, xKey);
      return `${datumLabel(row, xKey)}: ${rows
        .map((entry) => `${entry.label} ${entry.value}`)
        .join(", ")}`;
    },
    [data, normalized, formatValue, xKey],
  );

  const table = (
    <ChartDataTable
      caption={label}
      columns={["Category", ...normalized.map((entry) => entry.label)]}
      rows={data.map((row) => [
        datumLabel(row, xKey),
        ...normalized.map((entry) => {
          const value = datumValue(row, entry.key);
          return value === null ? "—" : formatValue(value);
        }),
      ])}
    />
  );

  if (!geometry || geometry.marks.length === 0) {
    return (
      <div
        ref={frameRef}
        data-slot="bar-chart"
        className={cn(
          chartContainerVariants({ variant: "bare", padding: "none" }),
          className,
        )}
        {...props}
      >
        <div
          data-slot="bar-chart-empty"
          className={chartStateVariants({ size: "md" })}
        >
          {emptyLabel}
        </div>
      </div>
    );
  }

  const { margin, plotTop, plotBottom, ticks, labels, centers, marks } =
    geometry;
  const activeRow = pointer.index >= 0 ? data[pointer.index] : undefined;
  const legendVisible = showLegend ?? normalized.length > 1;

  return (
    <div
      ref={frameRef}
      data-slot="bar-chart"
      className={cn(
        chartContainerVariants({ variant: "bare", padding: "none" }),
        className,
      )}
      {...props}
    >
      <div data-slot="bar-chart-plot" className="relative min-w-0">
        <ChartFrame width={width} height={height} label={label} table={table}>
          {showGrid ? (
            vertical ? (
              <ChartGrid
                width={width}
                height={height}
                margin={margin}
                ticks={ticks}
                scale={geometry.valueScale}
                variant="horizontal"
              />
            ) : (
              <BarValueGrid
                ticks={ticks}
                scale={geometry.valueScale}
                plotTop={plotTop}
                plotBottom={plotBottom}
              />
            )
          ) : null}

          <g data-slot="bar-chart-bars" aria-hidden="true">
            {marks.map((mark) => {
              const active = pointer.index === mark.rowIndex;
              return (
                <path
                  key={mark.key}
                  d={mark.d}
                  fill={mark.color}
                  className={cn(
                    !reduced &&
                      (vertical ? "chart-bar-grow" : "chart-bar-grow-x"),
                    "chart-mark",
                  )}
                  // `transform-box` and the origin are set here as well as in
                  // the grow utility: with motion reduced the utility is never
                  // applied, and without these the hover scale would be
                  // measured against the whole plot and throw the bar across
                  // the chart.
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: vertical ? "bottom" : "left",
                    transform: active ? "scale(1.04)" : undefined,
                    opacity: pointer.index >= 0 && !active ? 0.45 : 1,
                    ...(reduced ? {} : staggerStyle(staggerDelay(mark.order))),
                  }}
                />
              );
            })}
          </g>

          <BarCategoryAxis
            labels={labels}
            centers={centers}
            margin={margin}
            vertical={vertical}
            plotBottom={plotBottom}
            maxLabels={geometry.maxCategoryLabels}
          />
          <ChartAxis
            height={height}
            margin={margin}
            ticks={ticks}
            scale={geometry.valueScale}
            format={tickFormat}
            orientation={vertical ? "vertical" : "horizontal"}
          />
        </ChartFrame>

        <ChartInteractionSurface
          pointer={pointer}
          handlers={handlers}
          count={data.length}
          label={label}
          valueText={valueText}
        >
          {activeRow ? (
            <ChartTooltip
              title={datumLabel(activeRow, xKey)}
              rows={buildTooltipRows(normalized, activeRow, formatValue)}
              x={pointer.x}
              y={pointer.y}
              width={width}
              height={height}
            />
          ) : null}
          {/* Announced only while the chart holds focus. A live region that
              fires on every pointer move talks over a screen reader user who
              is also driving a mouse. */}
          <ChartLiveRegion
            message={
              focused && pointer.index >= 0 ? valueText(pointer.index) : ""
            }
          />
        </ChartInteractionSurface>
      </div>

      {legendVisible ? (
        <div data-slot="bar-chart-legend" className="pt-3">
          <ChartLegend
            items={normalized.map((entry) => ({
              label: entry.label,
              color: entry.color,
              shape: "square" as const,
            }))}
            align={legendAlign}
            orientation="horizontal"
          />
        </div>
      ) : null}
    </div>
  );
}

export { BarChart };
