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
  useChartPointer,
  useContainerWidth,
  usePrefersReducedMotion,
  type ChartLegendItem,
  type ChartMargin,
} from "./chart-primitives";
import {
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
} from "./chart-utils";

/**
 * Line chart.
 *
 * A charting library gives this away as a pile of render props, and the price is
 * paid on every dashboard: the tooltip cannot be themed, the reveal is a
 * `recharts` default rather than the one the design system already ships, and a
 * theme switch re-paints half the chart. Here the chart is a path string and a
 * stroke, so the crosshair, the keyboard readout, and the draw animation are the
 * same three components every other chart in the folder is built from, and every
 * color is a token the browser resolves per theme.
 */

/** Dots stop reading as samples somewhere around here and start reading as a
 *  second, noisier series, which is why `auto` refuses to draw them. */
const AUTO_DOT_LIMIT = 24;

/** A fixed default so two charts in the same grid line up. */
const DEFAULT_HEIGHT = 280;
const DEFAULT_ASPECT = 2.2;

const MARGIN_TOP = 8;
const MARGIN_RIGHT = 8;
const MARGIN_BOTTOM = 24;

/** Ticks per axis. Five keeps the gutter readable at any height a card can be,
 *  and a sixth line of text is a line of text nobody asked for. */
const TICK_COUNT = 5;

type NormalizedSeries = ReturnType<typeof normalizeSeries>;

/**
 * `format` takes either a callback or the options bag because both are honest
 * answers: the bag is what the other charts take, and the callback is what a
 * caller reaches for the first time a chart needs a unit. Tooltips get full
 * precision, axes get the compact form, because the gutter is narrow and the
 * bubble is not.
 */
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

/**
 * The accessible name, built from what is actually plotted. A blank
 * `aria-label` is announced as "graphics symbol", which is the one description
 * that tells a reader nothing at all.
 */
function buildLabel(
  kind: string,
  series: readonly { label: string }[],
): string {
  const names = series.map((entry) => entry.label).filter(Boolean);
  return names.length > 0 ? `${kind} of ${names.join(", ")}` : kind;
}

/**
 * Plot-space points for one series, with a hole wherever the reading is missing.
 * `toFiniteNumber` has already turned `null`, `""` and `NaN` into `null`, and a
 * `null` point breaks the path into separate runs — a gap is a gap, because
 * drawing a line through it invents data the API never reported.
 */
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

export interface LineChartProps extends Omit<
  ComponentProps<"figure">,
  "className"
> {
  /** One row per x position. Values are coerced on read, so `null`, `""` and
   *  `NaN` all become a gap rather than a zero. */
  data: ChartDatum[];
  /** The categorical key read for the x axis. */
  xKey: string;
  /**
   * The lines to draw. Optional: with `yKey` a single-series chart is one prop
   * instead of an array literal, because making every caller write
   * `series={[{ key: "revenue" }]}` for one line is ceremony.
   */
  series?: ChartSeries[];
  /** Shorthand for a one-element `series`. Ignored when `series` is given — a
   *  caller who listed series meant them. */
  yKey?: string;
  height?: number;
  showGrid?: boolean;
  /** Vertical rules as well as horizontal ones. Most categorical axes do not
   *  need them; a time axis sometimes does. */
  grid?: "horizontal" | "both" | "none";
  /** Defaults to on once more than one series is drawn. */
  showLegend?: boolean;
  legendAlign?: "start" | "center" | "end";
  curve?: ChartCurve;
  format?: ChartFormatOptions | ((value: number) => string);
  formatAxis?: (value: number) => string;
  label?: string;
  emptyLabel?: string;
  /** Keys to leave out of the render. The legend reports the full set so a
   *  hidden series can be brought back. */
  hiddenSeries?: string[];
  /** Force the sample dots on. `dotMode` is the honest control — see below. */
  showDots?: boolean;
  /** `auto` shows dots only up to `AUTO_DOT_LIMIT` points. `dotMode` wins over
   *  `showDots` when both are set, because "auto" is a decision a boolean
   *  cannot express. */
  dotMode?: "auto" | "always" | "never";
  strokeWidth?: number;
  /** Draw a dot on every visible series at the hovered index. */
  showPoints?: boolean;
  onLegendClick?: (key: string) => void;
  onHoverIndexChange?: (index: number) => void;
  className?: string;
}

function LineChart({
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
  showDots,
  dotMode,
  strokeWidth = 2,
  showPoints = true,
  onLegendClick,
  onHoverIndexChange,
  className,
  ...props
}: LineChartProps) {
  const [measureRef, measuredWidth] = useContainerWidth();
  const width = Math.max(0, measuredWidth);
  // An explicit height is the caller's decision and is used verbatim. The
  // default is a flat 280 so two charts in a grid line up, capped by the
  // responsive helper because a 320px card spending 280px on a 90px plot is
  // mostly gutter.
  const height =
    heightProp ??
    Math.min(
      DEFAULT_HEIGHT,
      Math.round(
        resolveChartHeight(width, DEFAULT_ASPECT, { min: 200, max: 420 }),
      ),
    );

  const reducedMotion = usePrefersReducedMotion();

  const allSeries = useMemo<NormalizedSeries>(() => {
    if (series && series.length > 0) return normalizeSeries(series);
    if (yKey) return normalizeSeries([{ key: yKey }]);
    return [];
  }, [series, yKey]);

  // Colors are assigned over the full list and only then filtered, so hiding a
  // series does not repaint every series after it. A legend that reshuffles the
  // palette on each click is unreadable.
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

  const formatter = useMemo(() => resolveFormatter(format), [format]);
  const axisFormatter = useMemo(
    () => resolveAxisFormatter(format, formatAxis),
    [format, formatAxis],
  );

  // A line encodes change, not magnitude from zero. Pinning the domain to zero
  // would flatten a 3% move into a straight line, so the axis follows the data.
  const domain = useMemo(
    () => resolveDomain(flatValues, { zeroBaseline: false }),
    [flatValues],
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
  // 64px is about two digits plus a gap at 11px. Anything tighter and the
  // thinning below starts dropping every other label.
  const maxLabels = Math.max(2, Math.floor(plotWidth / 64));

  const seriesPoints = useMemo(
    () => values.map((row) => toPoints(row, centers, yScale)),
    [values, centers, yScale],
  );
  const paths = useMemo(
    () =>
      seriesPoints.map((points, index) => ({
        entry: visible[index],
        d: buildLinePath(points, { curve }),
      })),
    [seriesPoints, visible, curve],
  );

  const primary = visible[0];
  const primaryValues = useMemo(
    () => seriesPoints[0]?.map((point) => point?.y ?? null) ?? [],
    [seriesPoints],
  );

  const { pointer, handlers, focused } = useChartPointer({
    centers,
    values: primaryValues,
    // The plot is the hit area, not the band. Without the slack a reader has to
    // land on a 3px dot to get a value, which is the exact failure the
    // crosshair exists to fix.
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

  const dotSetting = dotMode ?? (showDots ? "always" : "auto");
  const plotDots =
    dotSetting === "always" ||
    (dotSetting === "auto" && labels.length <= AUTO_DOT_LIMIT);
  // Forced dots on a dense series overlap into a smear, so the mark shrinks
  // rather than the chart getting wider.
  const dotRadius = labels.length > 60 ? 2.5 : 3.5;

  const chartLabel = label ?? buildLabel("Line chart", allSeries);
  const activeIndex = pointer.index;
  const anchorY =
    activeIndex >= 0 ? (primaryValues[activeIndex] ?? pointer.y) : 0;

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      allSeries.map((entry) => ({
        id: entry.key,
        label: entry.label,
        color: entry.color,
        shape: "line",
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
          data-slot="line-chart-plot"
          className="relative w-full min-w-0"
        >
          <ChartFrame
            width={width}
            height={height}
            label={chartLabel}
            table={table}
          >
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
            <g data-slot="line-chart-series" aria-hidden="true">
              {paths.map((path, index) => {
                if (!path.entry || path.d.length === 0) return null;
                return (
                  <path
                    key={path.entry.key}
                    d={path.d}
                    data-slot="line-chart-path"
                    fill="none"
                    stroke={path.entry.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={path.entry.dashed ? "4 4" : undefined}
                    // The stroke is measured in screen units, so a chart that
                    // the CSS scales down keeps a 2px line instead of a hairline.
                    vectorEffect="non-scaling-stroke"
                    // The reveal is a dash offset against `pathLength=1`, so the
                    // draw maths is one unit long whatever the real geometry is.
                    pathLength={reducedMotion ? undefined : 1}
                    // A dashed series cannot also be a draw: the draw works by
                    // owning the dash array, so a target or a projection fades
                    // up instead of tracing itself in.
                    className={
                      reducedMotion
                        ? undefined
                        : path.entry.dashed
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
            {plotDots ? (
              <g data-slot="line-chart-dots" aria-hidden="true">
                {seriesPoints.map((points, seriesIndex) => {
                  const entry = visible[seriesIndex];
                  if (!entry) return null;
                  return points.map((point, pointIndex) => {
                    if (!point) return null;
                    return (
                      <circle
                        key={`${entry.key}-${labels[pointIndex] ?? pointIndex}`}
                        cx={point.x}
                        cy={point.y}
                        r={dotRadius}
                        fill="var(--card)"
                        stroke={entry.color}
                        strokeWidth={2}
                        className={reducedMotion ? undefined : "chart-point-in"}
                        style={
                          reducedMotion
                            ? undefined
                            : staggerStyle(
                                staggerDelay(
                                  seriesIndex +
                                    Math.round(
                                      (pointIndex /
                                        Math.max(1, labels.length - 1)) *
                                        3,
                                    ),
                                ),
                              )
                        }
                      />
                    );
                  });
                })}
              </g>
            ) : null}
            {showPoints && activeIndex >= 0 ? (
              <g
                data-slot="line-chart-points"
                className="chart-crosshair"
                aria-hidden="true"
              >
                {seriesPoints.map((points, seriesIndex) => {
                  const entry = visible[seriesIndex];
                  const point = points[activeIndex];
                  if (!entry || !point) return null;
                  return (
                    <circle
                      key={`active-${entry.key}`}
                      cx={point.x}
                      cy={point.y}
                      r={dotRadius + 1}
                      fill="var(--card)"
                      stroke={entry.color}
                      strokeWidth={2.5}
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
        data-slot="line-chart-empty"
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
      data-slot="line-chart"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    >
      {plot}
      {/* Announced only while the chart holds focus. A live region that
          fires on every pointer move talks over a screen reader user who
          is also driving a mouse. */}
      <ChartLiveRegion
        message={focused && activeIndex >= 0 ? readout(activeIndex) : ""}
      />
    </figure>
  );
}

export { LineChart };
