"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import { cn } from "@aazenc/utils";
import { chartStateVariants } from "./chart-variants";
import {
  ChartAreaGradient,
  ChartAxis,
  ChartCategoryLabels,
  ChartCrosshair,
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
  useChartId,
  useChartPointer,
  useContainerWidth,
  usePrefersReducedMotion,
  type ChartLegendItem,
  type ChartMargin,
} from "./chart-primitives";
import {
  buildAreaPath,
  buildLinePath,
  createBandScale,
  createLinearScale,
  datumLabel,
  datumValue,
  formatAxisTick,
  formatTooltipValue,
  linearTicks,
  normalizeSeries,
  resolveChartHeight,
  resolveDomain,
  staggerDelay,
  type ChartCurve,
  type ChartDatum,
  type ChartFormatOptions,
  type ChartPoint,
  type ChartSeries,
  type LinePathOptions,
} from "./chart-utils";

/**
 * Area chart.
 *
 * Same frame, same axis, same tooltip, same crosshair as the line chart — the
 * only difference is that the path is closed to a baseline and filled. A fill
 * encodes magnitude, so this chart pins the domain to zero where the line chart
 * does not, and that single flag is the whole reason the two components are not
 * one component with a `filled` prop.
 *
 * The gradient is `color-mix` against the series token rather than a literal
 * alpha pair, so the fade follows the palette in light, dark, and every theme
 * instead of fading to black-blue the moment someone switches.
 */

const DEFAULT_HEIGHT = 280;
const DEFAULT_ASPECT = 2.2;
const DEFAULT_INTENSITY = 0.28;

const MARGIN_TOP = 8;
const MARGIN_RIGHT = 8;
const MARGIN_BOTTOM = 24;

const TICK_COUNT = 5;

type NormalizedSeries = ReturnType<typeof normalizeSeries>;

/** One stacked series: the value at the top of its band and the value its floor
 *  sits on, both in data units so the scale can be built from them. */
interface StackedSeries {
  tops: (number | null)[];
  bottoms: (number | null)[];
}

function resolveFormatter(
  format: ChartFormatOptions | ((value: number) => string) | undefined,
): (value: number) => string {
  if (typeof format === "function") return format;
  return (value: number) => formatTooltipValue(value, format);
}

function resolveAxisFormatter(
  format: ChartFormatOptions | ((value: number) => string) | undefined,
  formatAxis: ((value: number) => string) | undefined,
): (value: number) => string {
  if (formatAxis) return formatAxis;
  const locale = typeof format === "function" ? undefined : format?.locale;
  return (value: number) => formatAxisTick(value, locale);
}

function buildLabel(
  kind: string,
  series: readonly { label: string }[],
): string {
  const names = series.map((entry) => entry.label).filter(Boolean);
  return names.length > 0 ? `${kind} of ${names.join(", ")}` : kind;
}

function toPoints(
  values: readonly (number | null)[],
  centers: readonly number[],
  yScale: (value: number) => number | null,
): (ChartPoint | null)[] {
  return values.map((value, index) => {
    if (value === null) return null;
    const y = yScale(value);
    const x = centers[index];
    if (y === null || x === undefined) return null;
    return { x, y };
  });
}

/**
 * Accumulate each series onto the one below it.
 *
 * A missing reading leaves a hole rather than a zero: treating it as zero would
 * silently move every band above it down by that series' value, which is the
 * one error a stacked chart cannot recover from visually.
 */
function computeStacks(
  series: readonly ChartSeries[],
  data: readonly ChartDatum[],
): { stacks: StackedSeries[]; extents: (number | null)[] } {
  const running = data.map(() => 0);
  const stacks: StackedSeries[] = [];
  const extents: (number | null)[] = [];

  for (const entry of series) {
    const tops: (number | null)[] = [];
    const bottoms: (number | null)[] = [];
    for (let index = 0; index < data.length; index += 1) {
      const row = data[index];
      const value = row ? datumValue(row, entry.key) : null;
      if (value === null) {
        tops.push(null);
        bottoms.push(null);
        continue;
      }
      const base = running[index] ?? 0;
      const top = base + value;
      running[index] = top;
      tops.push(top);
      bottoms.push(base);
      extents.push(top, base);
    }
    stacks.push({ tops, bottoms });
  }

  return { stacks, extents };
}

/**
 * A closed band between a top edge and a floor.
 *
 * `buildAreaPath` closes to one flat baseline, which is right for a single fill
 * and wrong for a stack: the second band has to start where the first one ended.
 * So the top edge is one path and the floor is the same path walked backwards —
 * which also keeps the two edges identically smoothed, so a curvy top does not
 * meet a straight bottom.
 */
function buildBandPath(
  tops: readonly (ChartPoint | null)[],
  bottoms: readonly (ChartPoint | null)[],
  options: LinePathOptions = {},
): string {
  const parts: string[] = [];
  let index = 0;

  while (index < tops.length) {
    if (!tops[index]) {
      index += 1;
      continue;
    }
    const runTops: ChartPoint[] = [tops[index] as ChartPoint];
    const runBottoms: ChartPoint[] = [];
    // The run's first floor point is the one that gets dropped if this is
    // seeded inside the loop below, and a band one point short of its floor is
    // a band that silently disappears.
    const firstBottom = bottoms[index];
    if (firstBottom) runBottoms.push(firstBottom);
    let cursor = index + 1;
    while (cursor < tops.length) {
      const next = tops[cursor];
      if (!next) break;
      runTops.push(next);
      const bottom = bottoms[cursor];
      if (bottom) runBottoms.push(bottom);
      cursor += 1;
    }
    // One point wide is no area, and a run missing part of its floor would close
    // the shape straight across the hole.
    if (runTops.length > 1 && runBottoms.length === runTops.length) {
      const floor = buildLinePath([...runBottoms].reverse(), options);
      parts.push(
        `${buildLinePath(runTops, options)}${floor.replace(/^M/, "L")}Z`,
      );
    }
    index = cursor;
  }

  return parts.join(" ");
}

export interface AreaChartProps extends Omit<
  ComponentProps<"figure">,
  "className"
> {
  data: ChartDatum[];
  xKey: string;
  /**
   * The bands to draw. Optional: with `yKey` a single-series chart is one prop
   * instead of an array literal. The render order is the stack order.
   */
  series?: ChartSeries[];
  /** Shorthand for a one-element `series`. Ignored when `series` is given. */
  yKey?: string;
  height?: number;
  showGrid?: boolean;
  grid?: "horizontal" | "both" | "none";
  showLegend?: boolean;
  legendAlign?: "start" | "center" | "end";
  curve?: ChartCurve;
  format?: ChartFormatOptions | ((value: number) => string);
  formatAxis?: (value: number) => string;
  label?: string;
  emptyLabel?: string;
  hiddenSeries?: string[];
  /** Opacity at the top of the gradient. Below about 0.15 the fill reads as a
   *  tint and stops carrying the value. */
  intensity?: number;
  /** Stack each series on the one below it. The domain follows the stack, so
   *  the y axis shows totals, not per-series heights. */
  stack?: boolean;
  /** Where an unstacked fill stops: the zero line, or the bottom of the plot. */
  baseline?: "zero" | "min";
  /** Draw the line on top of the fill. The fill alone loses its own shape at
   *  low intensity, and the stroke is what a reader traces back to the axis. */
  showStroke?: boolean;
  /** Fade the fill with the series color. Off gives a flat fill at `intensity`,
   *  which is the right call on a dense stack where the bands start competing. */
  gradient?: boolean;
  strokeWidth?: number;
  onLegendClick?: (key: string) => void;
  onHoverIndexChange?: (index: number) => void;
  className?: string;
}

function AreaChart({
  data,
  xKey,
  series,
  yKey,
  height: heightProp,
  showGrid,
  grid,
  showLegend,
  legendAlign = "start",
  curve = "smooth",
  format,
  formatAxis,
  label,
  emptyLabel = "No data to show",
  hiddenSeries,
  intensity = DEFAULT_INTENSITY,
  stack = false,
  baseline = "zero",
  showStroke = true,
  gradient = true,
  strokeWidth = 2,
  onLegendClick,
  onHoverIndexChange,
  className,
  ...props
}: AreaChartProps) {
  const [measureRef, measuredWidth] = useContainerWidth();
  const width = Math.max(0, measuredWidth);
  const height =
    heightProp ??
    Math.min(
      DEFAULT_HEIGHT,
      Math.round(
        resolveChartHeight(width, DEFAULT_ASPECT, { min: 200, max: 420 }),
      ),
    );

  const reducedMotion = usePrefersReducedMotion();
  const gradientId = useChartId("area");

  const allSeries = useMemo<NormalizedSeries>(() => {
    if (series && series.length > 0) return normalizeSeries(series);
    if (yKey) return normalizeSeries([{ key: yKey }]);
    return [];
  }, [series, yKey]);

  // Colors are assigned over the full list and only then filtered, so hiding a
  // band does not repaint every band after it.
  const visible = useMemo(
    () =>
      allSeries.filter(
        (entry) =>
          !entry.hidden && !(hiddenSeries?.includes(entry.key) ?? false),
      ),
    [allSeries, hiddenSeries],
  );

  const labels = useMemo(
    () => data.map((row) => datumLabel(row, xKey)),
    [data, xKey],
  );

  const values = useMemo(
    () => visible.map((entry) => data.map((row) => datumValue(row, entry.key))),
    [data, visible],
  );

  const flatValues = useMemo(() => values.flat(), [values]);
  const hasValues = flatValues.some((value) => value !== null);

  // In data units, before any scale exists — the stacked domain cannot be
  // resolved until the totals are known, and the totals cannot be known until
  // the scale maps them. Resolving them first breaks the loop.
  const stacked = useMemo(
    () => (stack ? computeStacks(visible, data) : null),
    [stack, visible, data],
  );
  const domainValues = stacked?.extents ?? flatValues;

  const formatter = useMemo(() => resolveFormatter(format), [format]);
  const axisFormatter = useMemo(
    () => resolveAxisFormatter(format, formatAxis),
    [format, formatAxis],
  );

  // A fill encodes magnitude by length from a shared baseline, so the domain
  // includes zero even when every reading is positive. Truncating it turns a 3%
  // difference into a cliff.
  const domain = useMemo(
    () => resolveDomain(domainValues, { zeroBaseline: true }),
    [domainValues],
  );
  const ticks = useMemo(() => linearTicks(domain, TICK_COUNT), [domain]);
  const margin = useMemo<ChartMargin>(
    () => ({
      top: MARGIN_TOP,
      right: MARGIN_RIGHT,
      bottom: MARGIN_BOTTOM,
      left: resolveYAxisWidth(ticks, axisFormatter),
    }),
    [ticks, axisFormatter],
  );
  const plotBottom = Math.max(margin.top, height - margin.bottom);
  // Bottom-to-top: a linear scale walks its range in the order it is given, and
  // an axis whose largest tick lands in the gutter is upside down.
  const yScale = useMemo(
    () => createLinearScale(domain, [plotBottom, margin.top]),
    [domain, margin, plotBottom],
  );
  const band = useMemo(
    () => createBandScale(labels.length, [margin.left, width - MARGIN_RIGHT]),
    [labels.length, margin.left, width],
  );
  const centers = useMemo(
    () => labels.map((_, index) => band.center(index)),
    [labels, band],
  );
  const plotWidth = Math.max(0, width - margin.left - MARGIN_RIGHT);
  const maxLabels = Math.max(2, Math.floor(plotWidth / 64));

  // The floor of an unstacked fill. `zero` is the honest default — it is the
  // line the value is measured from — and `min` is the escape hatch for a series
  // that lives far from zero, where anchoring to it wastes most of the plot.
  const baselineY = yScale(baseline === "min" ? domain[0] : 0) ?? plotBottom;

  const shapes = useMemo(
    () =>
      visible.map((entry, index) => {
        const source = stacked?.stacks[index];
        const tops = source
          ? toPoints(source.tops, centers, yScale)
          : toPoints(values[index] ?? [], centers, yScale);
        const floors = source
          ? toPoints(source.bottoms, centers, yScale)
          : null;
        return {
          entry,
          d: source
            ? buildBandPath(tops, floors ?? [], { curve })
            : buildAreaPath(tops, baselineY, { curve }),
          outline: buildLinePath(tops, { curve }),
        };
      }),
    [visible, stacked, values, centers, yScale, baselineY, curve],
  );

  const primary = visible[0];
  const primaryValues = useMemo(
    () =>
      (stacked?.stacks[0]
        ? toPoints(stacked.stacks[0].tops, centers, yScale)
        : toPoints(values[0] ?? [], centers, yScale)
      ).map((point) => point?.y ?? null),
    [stacked, values, centers, yScale],
  );

  const { pointer, handlers } = useChartPointer({
    centers,
    values: primaryValues,
    // The plot is the hit area, not the band: a fill that only responds inside
    // its own shape is a fill that cannot be read at its edges.
    hitSlop: Math.max(12, band.step / 2),
  });

  const readout = useCallback(
    (index: number): string => {
      if (index < 0) return "";
      const parts = visible.map((entry) => {
        const row = data[index];
        const value = row ? datumValue(row, entry.key) : null;
        return value === null ? null : `${entry.label} ${formatter(value)}`;
      });
      return [
        labels[index] ?? "",
        ...parts.filter((part) => part !== null),
      ].join(", ");
    },
    [visible, data, labels, formatter],
  );

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

  const chartLabel = label ?? buildLabel("Area chart", allSeries);
  const activeIndex = pointer.index;
  const anchorY =
    activeIndex >= 0 ? (primaryValues[activeIndex] ?? pointer.y) : 0;

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      allSeries.map((entry) => ({
        id: entry.key,
        label: entry.label,
        color: entry.color,
        shape: "square",
        active: !(hiddenSeries?.includes(entry.key) ?? false),
      })),
    [allSeries, hiddenSeries],
  );

  const table = useMemo(() => {
    if (data.length === 0) return null;
    return (
      <ChartDataTable
        caption={chartLabel}
        columns={[xKey, ...visible.map((entry) => entry.label)]}
        rows={data.map((row) => [
          datumLabel(row, xKey),
          ...visible.map((entry) => {
            const value = datumValue(row, entry.key);
            return value === null ? "—" : formatter(value);
          }),
        ])}
      />
    );
  }, [data, xKey, visible, formatter, chartLabel]);

  const gridVariant = grid ?? (showGrid === false ? "none" : "horizontal");

  const plot =
    data.length > 0 && hasValues ? (
      <>
        <div
          ref={measureRef}
          data-slot="area-chart-plot"
          className="relative w-full min-w-0"
        >
          <ChartFrame
            width={width}
            height={height}
            label={chartLabel}
            table={table}
          >
            {gradient ? (
              <defs>
                {visible.map((entry, index) => (
                  <ChartAreaGradient
                    key={entry.key}
                    id={`${gradientId}-${index}`}
                    color={entry.color}
                    intensity={intensity}
                  />
                ))}
              </defs>
            ) : null}
            <ChartGrid
              width={width}
              height={height}
              margin={margin}
              ticks={ticks}
              scale={yScale}
              xPositions={centers}
              variant={gridVariant}
            />
            <ChartAxis
              height={height}
              margin={margin}
              ticks={ticks}
              scale={yScale}
              format={axisFormatter}
              orientation="vertical"
            />
            <g data-slot="area-chart-fill" aria-hidden="true">
              {shapes.map((shape, index) => {
                if (!shape.entry || shape.d.length === 0) return null;
                return (
                  <path
                    key={shape.entry.key}
                    d={shape.d}
                    data-slot="area-chart-area"
                    fill={
                      gradient
                        ? `url(#${gradientId}-${index})`
                        : shape.entry.color
                    }
                    fillOpacity={gradient ? undefined : intensity}
                    stroke="none"
                    className={reducedMotion ? undefined : "chart-area-in"}
                    // One step behind the stroke: the line draws first and the
                    // fill fades up underneath it. The reverse order reads as a
                    // colour arriving before the thing it belongs to.
                    style={
                      reducedMotion
                        ? undefined
                        : staggerStyle(staggerDelay(index + 1))
                    }
                  />
                );
              })}
            </g>
            {showStroke ? (
              <g data-slot="area-chart-stroke" aria-hidden="true">
                {shapes.map((shape, index) => {
                  if (!shape.entry || shape.outline.length === 0) return null;
                  return (
                    <path
                      key={shape.entry.key}
                      d={shape.outline}
                      data-slot="area-chart-line"
                      fill="none"
                      stroke={shape.entry.color}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={shape.entry.dashed ? "4 4" : undefined}
                      vectorEffect="non-scaling-stroke"
                      pathLength={reducedMotion ? undefined : 1}
                      // The draw owns the dash array, so a dashed series — a
                      // target, a projection — fades up instead of tracing in.
                      className={
                        reducedMotion
                          ? undefined
                          : shape.entry.dashed
                            ? "chart-reveal-in"
                            : "chart-draw-in"
                      }
                      style={
                        reducedMotion
                          ? undefined
                          : staggerStyle(staggerDelay(index))
                      }
                    />
                  );
                })}
              </g>
            ) : null}
            <ChartCategoryLabels
              labels={labels}
              centers={centers}
              plotBottom={plotBottom}
              maxLabels={maxLabels}
            />
            <ChartCrosshair
              pointer={pointer}
              center={centers[activeIndex] ?? null}
              top={margin.top}
              bottom={plotBottom}
              color={primary?.color ?? "var(--data-1)"}
            />
          </ChartFrame>
          <ChartInteractionSurface
            pointer={pointer}
            handlers={handlers}
            count={labels.length}
            label={chartLabel}
            valueText={readout}
          >
            {activeIndex >= 0 ? (
              <ChartTooltip
                title={labels[activeIndex] ?? ""}
                rows={buildTooltipRows(visible, data[activeIndex], formatter)}
                x={centers[activeIndex] ?? 0}
                y={anchorY}
                width={plotWidth}
                height={height}
              />
            ) : null}
          </ChartInteractionSurface>
        </div>
        {(showLegend ?? allSeries.length > 1) ? (
          <ChartLegend
            items={legendItems}
            align={legendAlign}
            onItemClick={
              onLegendClick
                ? (item) => {
                    if (item.id) onLegendClick(item.id);
                  }
                : undefined
            }
          />
        ) : null}
      </>
    ) : (
      <div
        data-slot="area-chart-empty"
        className={cn(
          chartStateVariants({ size: "md" }),
          "border border-dashed border-border",
        )}
        style={{ minHeight: height }}
      >
        {emptyLabel}
      </div>
    );

  return (
    <figure
      role="figure"
      aria-label={chartLabel}
      data-slot="area-chart"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    >
      {plot}
      <ChartLiveRegion message={readout(activeIndex)} />
    </figure>
  );
}

export { AreaChart };
