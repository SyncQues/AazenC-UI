"use client";

/**
 * A heat map.
 *
 * The chart that is hardest to do well and easiest to do badly, because almost
 * all of its decisions are invisible. A heat map has no marks to compare by
 * length and no labels to read, so the reader's only instrument is the colour:
 * which is why the ramp is built in `oklch` rather than by blending in sRGB, why
 * the bands are discrete rather than a continuous gradient, and why the scale is
 * printed underneath in real numbers.
 *
 * Four things this does that a grid of `<rect>`s usually does not:
 *
 * 1. **A missing reading is not zero.** `null` renders as an empty dashed slot,
 *    in both modes. Painted as the lowest band it would say "nothing happened",
 *    which is a claim the data never made — the most common way a heat map
 *    lies.
 * 2. **Bands, not a gradient.** Two neighbouring cells in a continuous ramp are
 *    indistinguishable, and a cell's exact shade never matches anything in a
 *    legend, so the legend cannot answer "how many are in the top band".
 *    Discrete bands make the swatch a reader is looking at the same swatch they
 *    can point at below the chart.
 * 3. **A diverging ramp is levelled, not centred.** A signed heat map running
 *    from -10 to +200 would otherwise put "no change" 5% of the way in and
 *    crush every negative into one band. `resolveHeatDomain` measures both arms
 *    from the pivot instead.
 * 4. **The keyboard moves in two dimensions.** Arrow keys walk the grid, which
 *    is the one interaction a 2D chart cannot borrow from a 1D one.
 *
 * It is also the only chart here with two axes of *category*, so the hit test is
 * a `floor` into a regular grid rather than a nearest-neighbour search: heat
 * cells tile the plot edge to edge, which makes exact arithmetic both cheaper
 * and more correct than a distance threshold.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import {
  ChartCategoryLabels,
  ChartDataTable,
  ChartFrame,
  ChartLiveRegion,
  ChartTooltip,
  staggerStyle,
  useContainerWidth,
  usePrefersReducedMotion,
  type ChartMargin,
  type ChartPointerHandlers,
  type ChartTooltipRow,
} from "./chart-primitives";
import {
  chartAxisLabelVariants,
  chartContainerVariants,
  chartStateVariants,
} from "./chart-variants";
import {
  clamp,
  datumLabel,
  datumValue,
  formatChartValue,
  heatBucketRange,
  heatCellBox,
  heatFill,
  heatStaggerDelay,
  heatSteps,
  resolveChartColor,
  resolveHeatDomain,
  type ChartColorInput,
  type ChartDatum,
  type ChartDomain,
  type ChartFormatOptions,
  type HeatCellBox,
  type HeatScale,
} from "./chart-utils";

export interface HeatMapProps extends Omit<ComponentProps<"div">, "className"> {
  /** One record per cell. Sparse input is fine — an absent pair is a gap. */
  data: ChartDatum[];
  /** The key holding each column's label (the horizontal axis). */
  xKey: string;
  /** The key holding each row's label (the vertical axis). */
  yKey: string;
  /** The key holding the number. `null`, `""`, and `NaN` render as a gap. */
  valueKey: string;
  /**
   * `"sequential"` reads magnitude from quiet to loud. `"diverging"` puts the
   * pivot in the middle with the two arms at equal distance from it, which is
   * the only honest way to draw a signed heat map.
   */
  scale?: HeatScale;
  /** Bands across the ramp. Five is readable; more is a gradient by another
   *  name. A diverging ramp is rounded up to odd so the neutral band exists. */
  steps?: number;
  /** Sequential base, or the "up" arm of a diverging ramp. */
  color?: ChartColorInput;
  /** The "down" arm. Only read when the scale diverges. */
  negativeColor?: ChartColorInput;
  /** The value that means "no change". Zero unless said otherwise. */
  pivot?: number;
  /**
   * Pin the domain. Two heat maps are only comparable side by side if they
   * share one — otherwise each stretches to its own extent and a quiet week
   * looks identical to a busy one.
   */
  domain?: ChartDomain;
  /** Space between cells, in pixels, clamped against the cell's own size. */
  gap?: number;
  radius?: number;
  /**
   * Plot height. Defaults to the row count, because a two-row heat map given a
   * fixed 260px is mostly padding and a thirty-row one given 260px is a
   * staircase of slivers too thin to read.
   */
  height?: number;
  /** The scale printed under the chart. Off is rarely right: an unreadable ramp
   *  is a picture, not a chart. */
  showScale?: boolean;
  format?: ChartFormatOptions | ((value: number) => string);
  label?: string;
  emptyLabel?: string;
  className?: string;
  /** Fires with the focused cell, or `-1` for each axis when it is cleared. */
  onCellChange?: (row: number, col: number) => void;
}

/* ------------------------------------------------------------------- matrix -- */

interface HeatCell {
  row: number;
  col: number;
  value: number | null;
  fill: string | null;
  box: HeatCellBox;
  key: string;
}

interface HeatMatrix {
  columns: string[];
  rows: string[];
  /** Row-major, so `at(row, col)` is an index rather than a search. */
  cells: HeatCell[];
  domain: ChartDomain;
  /** Carried on the matrix because the scale legend needs it too, and inferring
   *  it from the domain's sign gets a sequential map spanning negative values
   *  wrong — which is most revenue-shaped data. */
  scale: HeatScale;
  steps: number;
  missing: number;
  height: number;
  margin: ChartMargin;
  plotWidth: number;
  plotHeight: number;
  cellWidth: number;
  cellHeight: number;
}

/** The longest row label in the same 6.5px-per-character estimate the bar
 *  chart uses, so two charts sharing a card line their gutters up. */
function rowGutterWidth(rows: readonly string[], width: number): number {
  const longest = rows.reduce((max, label) => Math.max(max, label.length), 0);
  return Math.min(
    Math.max(36, Math.ceil(longest * 6.5) + 12),
    Math.max(56, width * 0.34),
  );
}

/** Cell lookup. `cells` is row-major by construction, so this is arithmetic.
 *  A `find` per cell would make the data table quadratic — a year of days is
 *  10,950 cells, and 10,950 searches over 10,950 entries is a hundred million
 *  comparisons to render a table nobody looks at. */
function cellAt(matrix: HeatMatrix, row: number, col: number): HeatCell | null {
  if (row < 0 || col < 0 || row >= matrix.rows.length) return null;
  if (col >= matrix.columns.length) return null;
  return matrix.cells[row * matrix.columns.length + col] ?? null;
}

/* ------------------------------------------------------------------ pointer -- */

interface HeatPointer {
  row: number;
  col: number;
  x: number;
  y: number;
  active: boolean;
}

const noHeatPointer: HeatPointer = {
  row: -1,
  col: -1,
  x: 0,
  y: 0,
  active: false,
};

/**
 * Two-dimensional pointer and keyboard state.
 *
 * Not `useChartPointer`, which is the right shape for exactly one dimension:
 * its arrow keys walk a single list, so `ArrowUp` and `ArrowRight` would land on
 * the same cell and a reader tabbing a grid would be told they had gone up when
 * they had gone right.
 */
function useHeatPointer(options: {
  matrix: HeatMatrix | null;
}): { pointer: HeatPointer; handlers: ChartPointerHandlers; focused: boolean } {
  const { matrix } = options;
  const [pointer, setPointer] = useState<HeatPointer>(noHeatPointer);
  const [focused, setFocused] = useState(false);

  // Held in a ref so the keydown handler is not rebuilt on every pointer move.
  const matrixRef = useRef(matrix);
  matrixRef.current = matrix;

  const locate = useCallback((x: number, y: number): HeatPointer => {
    const m = matrixRef.current;
    if (!m || m.rows.length === 0 || m.columns.length === 0) {
      return noHeatPointer;
    }
    const col = Math.floor((x - m.margin.left) / m.cellWidth);
    const row = Math.floor((y - m.margin.top) / m.cellHeight);
    if (row < 0 || col < 0 || row >= m.rows.length || col >= m.columns.length) {
      // Outside the matrix but still inside the plot: keep the pixel position
      // so a tooltip on the way out does not jump to the last cell.
      return { ...noHeatPointer, x, y };
    }
    return { row, col, x, y, active: true };
  }, []);

  const resolve = useCallback(
    (event: Parameters<ChartPointerHandlers["onPointerMove"]>[0]) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (bounds.width === 0) return;
      setPointer(locate(event.clientX - bounds.left, event.clientY - bounds.top));
    },
    [locate],
  );

  const handlers = useMemo<ChartPointerHandlers>(
    () => ({
      onPointerMove: resolve,
      // A tap has no hover, so the first touch both moves and sticks. Dragging
      // is how a grid is read on a phone, so this is `pointerdown` rather than
      // a click handler, which a drag never fires.
      onPointerDown: resolve,
      onPointerLeave: () => {
        // A focused chart keeps its cell when the pointer leaves: a touch user
        // lifting a finger would otherwise lose the readout before reading it.
        if (!focused) setPointer(noHeatPointer);
      },
      onKeyDown: (event) => {
        const m = matrixRef.current;
        if (!m || m.rows.length === 0 || m.columns.length === 0) return;

        const lastRow = m.rows.length - 1;
        const lastCol = m.columns.length - 1;
        const from = pointer.active
          ? { row: pointer.row, col: pointer.col }
          : { row: 0, col: 0 };

        let next = from;
        switch (event.key) {
          case "ArrowRight":
            next = { ...from, col: Math.min(lastCol, from.col + 1) };
            break;
          case "ArrowLeft":
            next = { ...from, col: Math.max(0, from.col - 1) };
            break;
          case "ArrowDown":
            next = { ...from, row: Math.min(lastRow, from.row + 1) };
            break;
          case "ArrowUp":
            next = { ...from, row: Math.max(0, from.row - 1) };
            break;
          // Home and End reach the two ends of the *row the reader is on*,
          // which is what a spreadsheet does; the whole matrix is Ctrl+Home
          // and Ctrl+End. Landing Home on the very first cell instead would
          // mean a reader checking one column had to press it nine times.
          case "Home":
            next =
              event.ctrlKey || event.metaKey
                ? { row: 0, col: 0 }
                : { ...from, col: 0 };
            break;
          case "End":
            next =
              event.ctrlKey || event.metaKey
                ? { row: lastRow, col: lastCol }
                : { ...from, col: lastCol };
            break;
          case "Escape":
            setPointer(noHeatPointer);
            return;
          default:
            return;
        }

        event.preventDefault();
        setFocused(true);
        setPointer({
          ...next,
          x: m.margin.left + (next.col + 0.5) * m.cellWidth,
          y: m.margin.top + (next.row + 0.5) * m.cellHeight,
          active: true,
        });
      },
      onFocus: () => {
        setFocused(true);
        setPointer((current) => {
          if (current.active) return current;
          const m = matrixRef.current;
          if (!m) return current;
          return {
            row: 0,
            col: 0,
            x: m.margin.left + m.cellWidth / 2,
            y: m.margin.top + m.cellHeight / 2,
            active: true,
          };
        });
      },
      onBlur: () => setFocused(false),
    }),
    [focused, pointer.active, pointer.col, pointer.row, resolve],
  );

  return { pointer, handlers, focused };
}

/* -------------------------------------------------------------------- scale -- */

/**
 * The ramp, printed.
 *
 * Swatches alone are not a scale: a reader needs to know that the third one is
 * "10 to 40" and not "a bit more than the second". So the band boundaries are
 * real values off the same `domain` the cells were bucketed against, which means
 * the legend cannot drift from the chart the way a hand-written colour key does.
 */
function HeatScaleLegend({
  matrix,
  color,
  negativeColor,
  pivot,
  format,
  reduced,
}: {
  matrix: HeatMatrix;
  color: string;
  negativeColor: string;
  pivot: number;
  format: (value: number) => string;
  reduced: boolean;
}) {
  const { domain, steps, scale } = matrix;

  const swatches = Array.from({ length: steps }, (_, index) => {
    const [low, high] = heatBucketRange(index, domain, steps);
    return {
      index,
      // The band's midpoint, so a swatch is the colour of a value inside it
      // rather than of its lower edge.
      color: heatFill({
        value: (low + high) / 2,
        domain,
        steps,
        scale,
        color,
        negativeColor,
      }).color,
    };
  });

  return (
    <div
      data-slot="heat-map-scale"
      className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[11px] text-muted-foreground"
    >
      {/* First in the DOM, so it is *read* first. A ramp a screen reader cannot
          hear is half a chart, and these are the only place the band boundaries
          are written down — but the sentence has to lead, or the reader gets
          "0, 15, no data, colour scale from 0 to 15" and has to reassemble it. */}
      <span className="sr-only">
        {`Colour scale from ${format(domain[0])} to ${format(domain[1])} in ${steps} bands${
          scale === "diverging" ? `, diverging around ${format(pivot)}` : ", low to high"
        }${matrix.missing > 0 ? ". A dashed cell means no reading was taken" : ""}.`}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {format(domain[0])}
      </span>
      <ul className="flex items-center gap-px" aria-hidden="true">
        {swatches.map((swatch) => (
          <li
            key={swatch.index}
            className={cn(
              "h-3 w-6 first:rounded-l-sm last:rounded-r-sm",
              reduced ? undefined : "heat-scale-in",
            )}
            style={{
              background: swatch.color,
              ...(reduced ? {} : staggerStyle(`${swatch.index * 35}ms`)),
            }}
          />
        ))}
      </ul>
      <span aria-hidden="true" className="tabular-nums">
        {format(domain[1])}
      </span>
      {matrix.missing > 0 ? (
        <>
          <span
            aria-hidden="true"
            className="ml-2 h-3 w-6 rounded-sm border border-dashed border-border"
          />
          <span aria-hidden="true">No data</span>
        </>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- the surface -- */

/**
 * The focusable surface.
 *
 * Its own component rather than the shared `ChartInteractionSurface`, which is a
 * one-dimensional `role="slider"`. `role="application"` is the right call here:
 * it tells a screen reader the arrow keys belong to this widget rather than to
 * the page, which is the failure mode a custom 2D grid actually has. The data
 * table behind the figure carries the same numbers in reading order for anyone
 * who would rather read them than navigate them.
 */
function HeatMapSurface({
  handlers,
  matrix,
  label,
  children,
}: {
  handlers: ChartPointerHandlers;
  matrix: HeatMatrix | null;
  label: string;
  children?: ReactNode;
}) {
  const empty = !matrix || matrix.rows.length === 0 || matrix.columns.length === 0;
  return (
    <div
      data-slot="chart-interaction"
      className="absolute inset-0 cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      role="application"
      aria-roledescription="Heat map"
      aria-label={label}
      tabIndex={empty ? -1 : 0}
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

/* ---------------------------------------------------------------- component -- */

function HeatMap({
  data,
  xKey,
  yKey,
  valueKey,
  scale = "sequential",
  steps: stepsProp = 5,
  color: colorProp,
  negativeColor: negativeColorProp,
  pivot = 0,
  domain: domainProp,
  gap = 2,
  radius = 3,
  height: heightProp,
  showScale = true,
  format,
  label = "Heat map",
  emptyLabel = "No data",
  className,
  onCellChange,
  ...props
}: HeatMapProps) {
  const [frameRef, width] = useContainerWidth();
  const reduced = usePrefersReducedMotion();

  // A function is the caller's whole answer; an options object goes to the
  // shared formatter, so a prefix or a locale is spelled the same way here as in
  // every other chart in the system.
  const formatValue = useMemo(
    () =>
      typeof format === "function"
        ? format
        : (value: number) => formatChartValue(value, format),
    [format],
  );

  // Both arms resolve independently. `negativeColor` used to be resolved at
  // index 0 like `color`, so an omitted prop produced `var(--data-1)` for *both*
  // and a diverging map drew its two arms in one color — which reads as a
  // sequential ramp, and silently misstates the sign of every negative cell.
  // The default is named rather than positional so it stays the down arm.
  const color = useMemo(() => resolveChartColor(colorProp, 0), [colorProp]);
  const negativeColor = useMemo(
    () => resolveChartColor(negativeColorProp ?? "negative", 0),
    [negativeColorProp],
  );

  const matrix = useMemo<HeatMatrix | null>(() => {
    if (data.length === 0) return null;

    // Column and row order is first-seen, not sorted. Sorting would quietly
    // reorder a caller's data — January first when the data says otherwise — and
    // a heat map whose axes disagree with the table beneath it is worse than one
    // that is not alphabetical.
    const columns: string[] = [];
    const rows: string[] = [];
    const colAt = new Map<string, number>();
    const rowAt = new Map<string, number>();
    const values: (number | null)[][] = [];

    for (const datum of data) {
      const column = datumLabel(datum, xKey);
      const row = datumLabel(datum, yKey);

      let col = colAt.get(column);
      if (col === undefined) {
        col = columns.length;
        columns.push(column);
        colAt.set(column, col);
      }
      let rowIndex = rowAt.get(row);
      if (rowIndex === undefined) {
        rowIndex = rows.length;
        rows.push(row);
        rowAt.set(row, rowIndex);
        values.push([]);
      }
      // A duplicate (column, row) pair overwrites rather than accumulates. Two
      // records claiming to be the same cell is a data bug, and quietly adding
      // them would invent a value nobody measured.
      (values[rowIndex] ??= [])[col] = datumValue(datum, valueKey);
    }

    if (columns.length === 0 || rows.length === 0) return null;

    const flat: number[] = [];
    let missing = 0;
    for (const rowValues of values) {
      for (let col = 0; col < columns.length; col += 1) {
        const value = rowValues?.[col] ?? null;
        if (value === null) missing += 1;
        else flat.push(value);
      }
    }

    const steps = heatSteps(stepsProp, scale);
    const domain = resolveHeatDomain(flat, { scale, pivot, domain: domainProp });

    // Default height follows the rows rather than a constant: a two-row heat map
    // given 260px is mostly padding, and a thirty-row one given 260px is a
    // staircase of slivers too thin to hit with a finger.
    //
    // The clamp applies to the *derived* value only. Putting it around both
    // meant an explicit `height={52}` — a single-week strip, the most ordinary
    // heat map there is — was silently raised to the 120px floor, and the
    // caller's number was simply discarded.
    const height = Math.round(
      heightProp === undefined
        ? clamp(rows.length * 26 + 40, 120, 560)
        : // Only enough to keep the geometry valid; a negative plot is a
          // division by zero in the cell maths.
          Math.max(1, heightProp),
    );

    const margin: ChartMargin = {
      top: 6,
      right: 6,
      bottom: 24,
      left: rowGutterWidth(rows, width),
    };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);

    const cellWidth = columns.length > 0 ? plotWidth / columns.length : 0;
    const cellHeight = rows.length > 0 ? plotHeight / rows.length : 0;

    const cells: HeatCell[] = [];
    for (let row = 0; row < rows.length; row += 1) {
      for (let col = 0; col < columns.length; col += 1) {
        const value = values[row]?.[col] ?? null;
        const box = heatCellBox({
          col,
          row,
          columns: columns.length,
          rows: rows.length,
          x: margin.left,
          y: margin.top,
          width: plotWidth,
          height: plotHeight,
          gap,
          radius,
        });
        cells.push({
          row,
          col,
          value,
          fill:
            value === null
              ? null
              : heatFill({
                  value,
                  domain,
                  steps,
                  scale,
                  color,
                  negativeColor,
                }).color,
          box,
          key: `${rows[row] ?? ""}-${columns[col] ?? ""}`,
        });
      }
    }

    return {
      columns,
      rows,
      cells,
      domain,
      scale,
      steps,
      missing,
      height,
      margin,
      plotWidth,
      plotHeight,
      cellWidth,
      cellHeight,
    };
  }, [
    data,
    xKey,
    yKey,
    valueKey,
    scale,
    stepsProp,
    color,
    negativeColor,
    pivot,
    domainProp,
    gap,
    radius,
    heightProp,
    width,
  ]);

  const { pointer, handlers, focused } = useHeatPointer({ matrix });

  useEffect(() => {
    onCellChange?.(pointer.row, pointer.col);
  }, [onCellChange, pointer.row, pointer.col]);

  const activeCell = useMemo(
    () => (matrix && pointer.active ? cellAt(matrix, pointer.row, pointer.col) : null),
    [matrix, pointer.active, pointer.row, pointer.col],
  );

  const valueText = useCallback(
    (row: number, col: number) => {
      if (!matrix) return "";
      const rowLabel = matrix.rows[row];
      const colLabel = matrix.columns[col];
      const cell = cellAt(matrix, row, col);
      if (rowLabel === undefined || colLabel === undefined || !cell) return "";
      return cell.value === null
        ? `${rowLabel}, ${colLabel}: no data`
        : `${rowLabel}, ${colLabel}: ${formatValue(cell.value)}`;
    },
    [matrix, formatValue],
  );

  if (!matrix) {
    return (
      <div
        ref={frameRef}
        data-slot="heat-map"
        className={cn(
          chartContainerVariants({ variant: "bare", padding: "none" }),
          className,
        )}
        {...props}
      >
        <div
          data-slot="heat-map-empty"
          className={chartStateVariants({ size: "md" })}
        >
          {emptyLabel}
        </div>
      </div>
    );
  }

  const { columns, rows, cells, height, margin, cellHeight, cellWidth } = matrix;

  const table = (
    <ChartDataTable
      caption={label}
      columns={[yKey, ...columns]}
      rows={rows.map((rowLabel, row) => [
        rowLabel,
        ...columns.map((_, col) => {
          const cell = cellAt(matrix, row, col);
          return cell?.value === null || cell?.value === undefined
            ? "—"
            : formatValue(cell.value);
        }),
      ])}
    />
  );

  const tooltipRows: ChartTooltipRow[] = activeCell
    ? activeCell.value === null
      ? [{ label: rows[activeCell.row] ?? "", value: "No data" }]
      : [
          {
            label: rows[activeCell.row] ?? "",
            value: formatValue(activeCell.value),
            color: activeCell.fill ?? undefined,
            emphasis: "strong",
          },
        ]
    : [];

  // One stride rule for both axes, so the labels a reader can actually read are
  // the same density down the side as they are along the bottom.
  const rowStride = Math.max(
    1,
    Math.ceil(rows.length / Math.max(1, Math.floor(matrix.plotHeight / 22))),
  );

  return (
    <div
      ref={frameRef}
      data-slot="heat-map"
      className={cn(
        chartContainerVariants({ variant: "bare", padding: "none" }),
        className,
      )}
      {...props}
    >
      <div data-slot="heat-map-plot" className="relative min-w-0">
        <ChartFrame width={width} height={height} label={label} table={table}>
          <g data-slot="heat-map-cells" aria-hidden="true">
            {cells.map((cell) => {
              const active =
                pointer.active && cell.row === pointer.row && cell.col === pointer.col;
              const dimmed = pointer.active && !active;
              const missingCell = cell.value === null;
              return (
                <rect
                  key={cell.key}
                  data-slot="heat-map-cell"
                  data-missing={missingCell ? "" : undefined}
                  x={cell.box.x}
                  y={cell.box.y}
                  width={cell.box.width}
                  height={cell.box.height}
                  rx={cell.box.radius}
                  ry={cell.box.radius}
                  // `chart-mark` is the shared hover transition, so dimming and
                  // highlighting behave exactly as they do on a bar or a slice.
                  className={cn(
                    missingCell ? "heat-cell-missing" : "heat-cell",
                    !reduced && !missingCell && "heat-cell-in",
                    "chart-mark",
                  )}
                  // The dashed outline is what says "no reading" rather than "a
                  // reading of nothing". `--muted` would have looked right in
                  // one mode and read as a low value in the other.
                  stroke={missingCell ? "var(--border)" : undefined}
                  strokeWidth={missingCell ? 1 : undefined}
                  strokeDasharray={missingCell ? "2 2" : undefined}
                  style={
                    {
                      ...(missingCell
                        ? {}
                        : ({ "--heat-fill": cell.fill } as CSSProperties)),
                      ...(dimmed ? { opacity: 0.55 } : {}),
                      ...(active
                        ? { stroke: "var(--foreground)", strokeWidth: 1.5 }
                        : {}),
                      ...(reduced || missingCell
                        ? {}
                        : staggerStyle(heatStaggerDelay(cell.col, cell.row))),
                    } as CSSProperties
                  }
                />
              );
            })}
          </g>

          <ChartCategoryLabels
            labels={columns}
            centers={columns.map(
              (_, col) => margin.left + (col + 0.5) * cellWidth,
            )}
            plotBottom={margin.top + matrix.plotHeight}
            maxLabels={Math.max(1, Math.floor(matrix.plotWidth / 56))}
          />

          {/* Row labels are right-aligned into the gutter the matrix reserved
              for them, at the same stride as the column axis. */}
          <g data-slot="chart-axis-y" aria-hidden="true" className="chart-plot-in">
            {rows.map((rowLabel, row) => {
              if (row % rowStride !== 0) return null;
              return (
                <text
                  key={rowLabel}
                  x={margin.left - 8}
                  y={margin.top + (row + 0.5) * cellHeight}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className={chartAxisLabelVariants({ orientation: "vertical" })}
                >
                  {rowLabel}
                </text>
              );
            })}
          </g>
        </ChartFrame>

        <HeatMapSurface handlers={handlers} matrix={matrix} label={label}>
          {activeCell ? (
            <ChartTooltip
              title={columns[activeCell.col] ?? ""}
              rows={tooltipRows}
              x={pointer.x}
              y={pointer.y}
              width={width}
              height={height}
            />
          ) : null}
          {/* Announced only while the chart holds focus. A live region that
              fires on every pointer move talks over a screen reader user who is
              also driving a mouse. */}
          <ChartLiveRegion
            message={
              focused && pointer.active
                ? valueText(pointer.row, pointer.col)
                : ""
            }
          />
        </HeatMapSurface>
      </div>

      {showScale ? (
        <HeatScaleLegend
          matrix={matrix}
          color={color}
          negativeColor={negativeColor}
          pivot={pivot}
          format={formatValue}
          reduced={reduced}
        />
      ) : null}
    </div>
  );
}

export { HeatMap };
