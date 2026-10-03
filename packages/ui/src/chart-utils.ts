/**
 * Chart engine math. No React, no DOM, no chart library.
 *
 * Everything a chart needs to turn numbers into geometry lives here so it can be
 * unit tested in node without a renderer. The components in this folder are thin
 * wrappers over these functions.
 *
 * The SyncQues charts reach for Recharts and hand it raw `rgb(37, 99, 235)` fills
 * and inline `hsl(var(--card))` tooltip styles. That is why they look wrong the
 * moment a theme changes. Nothing here hardcodes a color: `resolveChartColor`
 * hands back `var(--data-1)`. The geometry here is theme-blind on purpose.
 *
 * `--data-N` rather than `--chart-N` is a load-bearing choice, not a rename. Both
 * are tokens the design system re-picks per theme, but `--chart-N` is *also*
 * re-picked per mode, so a chart that defaulted to it repainted itself on a
 * dark-mode switch — and because a heat map's ramp is a `color-mix` against
 * `--background` as well, every band moved, not just the hue. The encoding is
 * not allowed to change underneath numbers that did not. See the palette
 * definition in `@aazenc/tokens/base.css` for the contrast work behind it.
 */

/** One row of chart data. Values are read by key and coerced, so callers can
 *  pass whatever their API returned without pre-cleaning it. */
export type ChartDatum = Record<string, unknown>;

/** A value placed in plot space. `x`/`y` are pixels by the time they get here. */
export interface ChartPoint {
  x: number;
  y: number;
}

/** `[low, high]` on a scale. */
export type ChartDomain = readonly [number, number];

/** `[start, end]` in pixels. */
export type ChartRange = readonly [number, number];

/** How many categorical slots the palette has. Cyclic, so slot 6 is slot 1. */
const chartPaletteSize = 5;

/**
 * The names that select a categorical slot by hand.
 *
 * `chart-N` is kept because it is what the prop has always been called and what
 * every existing call site passes; it now selects the *fixed* palette, so those
 * call sites get stable colors without being touched. `data-N` is the honest
 * spelling and behaves identically. Note that neither of these reaches
 * `--chart-N` any more — that token is still themed and still re-picked per
 * mode, and a consumer who wants it can pass `var(--chart-1)` as raw CSS.
 */
export const chartColorKeys = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;
export type ChartColorKey = (typeof chartColorKeys)[number];

export const dataColorKeys = [
  "data-1",
  "data-2",
  "data-3",
  "data-4",
  "data-5",
] as const;
export type DataColorKey = (typeof dataColorKeys)[number];

/** Named roles, so a consumer can say `color="success"` instead of guessing a
 *  palette index. Most are semantic tokens, which means most *do* follow the
 *  theme — asking for the brand's primary is asking for the brand's primary in
 *  both modes. `negative` is the exception and is fixed, because the two arms
 *  of a diverging ramp have to stay level with each other and one of them
 *  moving is the whole defect. */
export const chartRoleColors = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  foreground: "var(--foreground)",
  muted: "var(--muted-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  negative: "var(--data-negative)",
  brand: "var(--brand)",
  blue: "var(--blue-500)",
  green: "var(--green-500)",
  orange: "var(--orange-500)",
  teal: "var(--teal-500)",
  purple: "var(--purple-500)",
  pink: "var(--pink-500)",
} as const satisfies Record<string, string>;

export type ChartRole = keyof typeof chartRoleColors;

/** Anything a caller may hand us as a color. A raw CSS value still passes
 *  through untouched, so an escape hatch exists without giving up the defaults. */
export type ChartColorInput =
  | ChartRole
  | ChartColorKey
  | DataColorKey
  | (string & {});

/**
 * The categorical palette. `--data-N` rather than `--chart-N`: the chart slots
 * are re-picked per theme *and* per mode, so a series that used one changed
 * color on a mode switch while its values stayed put. The data slots are
 * declared once in `@aazenc/tokens/base.css` and hold in both modes.
 */
export function chartColorVar(index: number): string {
  // A real modulo rather than `Math.abs`, so the palette is genuinely cyclic:
  // -1 and 4 are the same slot, and -1 and 4 read as the same colour in a
  // legend. `Math.abs` would make -1 land two slots from 4 and quietly
  // mismatch a legend drawn with positive indices.
  const safe = ((Math.trunc(index) % chartPaletteSize) + chartPaletteSize) % chartPaletteSize;
  return `var(--data-${safe + 1})`;
}

/**
 * Does this look like CSS color syntax rather than a mistyped token name?
 *
 * `#fff`, `rgb(1 2 3)`, `oklch(0.6 0.2 30)`, `color-mix(...)` and `var(--x)`
 * all carry a `#`, a `(`, or a `,`. A bare word does not — and a bare word that
 * reached this function is either a typo or a made-up token, because the whole
 * API is "pass a role, pass a token, or pass real CSS". Handing `banana`
 * straight to `fill` renders black, and a black chart is a far worse failure
 * than one painted from the palette.
 */
function looksLikeCssColor(value: string): boolean {
  return /[#(),]/.test(value) || value.startsWith("--");
}

/**
 * Which categorical slot a `chart-N` / `data-N` name selects, or -1.
 *
 * Both spellings resolve to the same fixed slot. `chart-1` is kept only so the
 * existing call sites keep working — mapping it to `--chart-1` again would put
 * the mode-dependent color straight back into the default path.
 */
function colorSlot(input: string): number {
  const match = /^(?:chart|data)-(\d+)$/.exec(input);
  if (!match) return -1;
  const slot = Number(match[1]) - 1;
  return slot >= 0 && slot < chartPaletteSize ? slot : -1;
}

/**
 * One warning per bad name, not one per render.
 *
 * `resolveChartColor` runs inside `useMemo` over every cell of a heat map, so an
 * unguarded `console.warn` here prints thousands of lines for a single typo. The
 * set is module scope rather than per-call so the message survives a remount.
 */
const warnedColorNames = new Set<string>();

function warnUnknownColorName(input: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (warnedColorNames.has(input)) return;
  warnedColorNames.add(input);
  console.warn(
    `[aazenc] Chart color "${input}" is not a role (${Object.keys(chartRoleColors).join(", ")}), ` +
      `a slot (chart-1…chart-5, data-1…data-5), or CSS. Falling back to the palette slot. ` +
      `Pass real CSS like "#0b6ffd" or "oklch(58% 0.228 259.815)" to set the color exactly.`,
  );
}

/**
 * Resolve one series or slice color. Order of preference: real CSS the caller
 * wrote, then a role, then a palette slot by name, then the slot for the index.
 */
export function resolveChartColor(
  input: ChartColorInput | undefined,
  index = 0,
): string {
  if (!input) return chartColorVar(index);
  // `in` walks the prototype chain, so `toString` and `__proto__` came back as
  // functions and objects and were handed straight to `fill`. Own keys only.
  if (Object.hasOwn(chartRoleColors, input)) {
    return chartRoleColors[input as ChartRole];
  }
  const slot = colorSlot(input);
  if (slot >= 0) return chartColorVar(slot);
  if (looksLikeCssColor(input)) return input;
  // A bare word that reached here is a typo or a made-up token. It still has to
  // render *something* — an invalid `fill` paints black, which is a worse
  // failure than a wrong-but-legible color — but silently swallowing it is how
  // `color="orange"` ends up rendering as a blue series with no explanation.
  warnUnknownColorName(input);
  return chartColorVar(index);
}

/** A whole palette as CSS values, ready to hand to a `series` prop. */
export function resolveChartPalette(
  input?: readonly ChartColorInput[],
  count = chartPaletteSize,
): string[] {
  const size = Math.max(1, Math.trunc(count));
  return Array.from({ length: size }, (_, index) =>
    resolveChartColor(input?.[index], index),
  );
}

/**
 * Coerce a data value to a finite number.
 *
 * API payloads carry `null`, `""`, and `NaN` for "no reading". Rendering those
 * as zero invents data, and rendering them as a gap needs a different code path
 * downstream, so they resolve to `null` here and every caller treats `null` the
 * same way: leave the hole.
 */
export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    // `Number` would happily read "0x10" and "1e3" as numbers but also "Infinity",
    // so the finite check below has to do the real work either way.
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  return null;
}

/** Read one key off a row as a finite number, or `null`. */
export function datumValue(datum: ChartDatum, key: string): number | null {
  return toFiniteNumber(datum[key]);
}

/** Read one key off a row as a display label. Falls back to the empty string
 *  rather than `String(undefined)`, which would print the word "undefined" on
 *  an axis. */
export function datumLabel(datum: ChartDatum, key: string): string {
  const value = datum[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint")
    return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Round a data extent out to human tick values.
 *
 * A domain of `[0, 8734]` with a 300px plot produces ticks like `873.42`, which
 * nobody wants to read. `niceCeil` steps up to the next 1/2/5 × 10ⁿ, so the
 * axis lands on `10000` and every tick is a round number.
 */
export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);
  const exponent = Math.floor(Math.log10(magnitude));
  const power = 10 ** exponent;
  const fraction = magnitude / power;
  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return sign * niceFraction * power;
}

/**
 * A plot domain that always includes zero.
 *
 * Bar and area charts encode magnitude by length from a shared baseline, so a
 * truncated axis turns a 3% difference into a cliff. Line charts opt back into
 * their own extent through `zeroBaseline: false`, which is why this is a flag
 * and not a hard rule.
 */
export function resolveDomain(
  values: readonly (number | null)[],
  options: { zeroBaseline?: boolean; tickCount?: number } = {},
): ChartDomain {
  const { zeroBaseline = true, tickCount = 5 } = options;
  const finite = values.filter((value): value is number => value !== null);
  if (finite.length === 0) return [0, 1];

  let min = Math.min(...finite);
  let max = Math.max(...finite);

  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    // A flat series collapses the domain to zero height, which divides by zero
    // in the scale and draws a straight line through the middle of the plot.
    // Give it a symmetric band instead so the line lands on a real value.
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }

  if (zeroBaseline) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  const step = niceCeil((max - min) / Math.max(1, tickCount));
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  return niceMax === niceMin ? [niceMin, niceMax + step] : [niceMin, niceMax];
}

/**
 * Evenly spaced, round-numbered tick values across a domain.
 *
 * The step comes from `niceCeil` for the same reason `resolveDomain` uses it:
 * dividing the span by the requested count and calling it a day gives
 * `-333.3333333` and `1.3K` on an axis that is otherwise perfectly round. Both
 * functions stepping the same way is what makes the axis and the data agree —
 * this is the one place a chart can print a number nobody asked for.
 *
 * Ticks are snapped down to a whole multiple of the step and the run is
 * extended past the domain if the last one falls short, so a domain that did
 * not come from `resolveDomain` still gets covered end to end.
 */
/**
 * The nice step `resolveDomain` already rounded to, recovered from the span.
 *
 * Re-running `niceCeil(span / count)` on a domain that was just rounded *up*
 * picks a coarser step, and the ticks then start before the domain and finish
 * past it. The next-smaller 1/2/2.5/5 step that tiles the span is the one the
 * domain was built with. A span that is not on that grid keeps the coarser
 * step, so a hand-built domain is still covered past both ends.
 */
function tickStep(span: number, count: number): number {
  const target = span / Math.max(1, count);
  const coarse = niceCeil(target);
  if (!Number.isFinite(coarse) || coarse <= 0) return coarse;
  if (dividesSpan(span, coarse)) return coarse;

  let step = coarse;
  for (let guard = 0; guard < 24; guard += 1) {
    step = previousNice(step);
    if (step <= 0) break;
    if (dividesSpan(span, step)) return step;
  }
  return coarse;
}

function dividesSpan(span: number, step: number): boolean {
  if (step <= 0 || !Number.isFinite(step)) return false;
  const steps = span / step;
  return Math.abs(steps - Math.round(steps)) < 1e-6;
}

/** The 1/2/2.5/5 step immediately below `value`. */
function previousNice(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const power = 10 ** Math.floor(Math.log10(value));
  const fraction = value / power;
  for (const item of [10, 5, 2.5, 2, 1]) {
    if (item < fraction - 1e-8) return item * power;
  }
  return power / 2;
}

export function linearTicks(domain: ChartDomain, count = 5): number[] {
  const [min, max] = domain;
  const span = max - min;
  if (span === 0 || !Number.isFinite(span)) return [min];

  const step = tickStep(span, count);
  if (!Number.isFinite(step) || step <= 0) return [min, max];

  const first = Math.floor(min / step) * step;
  const last = Math.ceil(max / step) * step;
  const steps = Math.round((last - first) / step);
  if (!Number.isFinite(steps) || steps < 1) return [min, max];

  const ticks: number[] = [];
  for (let index = 0; index <= steps; index += 1) {
    ticks.push(first + step * index);
  }
  return ticks;
}

/**
 * A linear pixel scale. Returns `null` for non-finite input so a bad reading
 * becomes a gap in the path rather than a stray `NaN` attribute in the markup.
 */
export function createLinearScale(
  domain: ChartDomain,
  range: ChartRange,
): (value: number) => number | null {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  if (span === 0) return () => r0;
  return (value: number) => {
    if (!Number.isFinite(value)) return null;
    return r0 + ((value - d0) / span) * (r1 - r0);
  };
}

export interface BandScale {
  /** Left/top edge of band `index`, in pixels. */
  start(index: number): number;
  /** Width/height of one band. */
  bandwidth: number;
  /** Distance between band origins, including the gap. */
  step: number;
  /** Center of band `index`, in pixels. */
  center(index: number): number;
  /** Band containing pixel `position`, or -1 when the position is in a gap or
   *  past either end. -1 rather than a clamp so the caller can tell "between
   *  two bars" apart from "on the first bar" and drop the tooltip. */
  indexAt(position: number): number;
  count: number;
}

/**
 * A d3-shaped band scale, so bar widths and gaps match what a charting library
 * would have produced. `padding` is the inner gap as a fraction of the step and
 * `paddingOuter` is the gap before the first and after the last band.
 */
export function createBandScale(
  count: number,
  range: ChartRange,
  padding = 0.2,
  paddingOuter = padding / 2,
): BandScale {
  const [r0, r1] = range;
  const total = Math.max(0, r1 - r0);
  const safeCount = Math.max(0, Math.trunc(count));
  const inner = clamp(padding, 0, 1);
  const outer = clamp(paddingOuter, 0, 1);

  // d3 divides by (n - paddingInner + 2 * paddingOuter). A single band, or any
  // degenerate padding, would make that zero or negative and put the scale at
  // ±Infinity, so those cases fall back to "fill the whole range with `count`
  // equal slices".
  const denominator = safeCount - inner + outer * 2;
  const step =
    safeCount === 0 || denominator <= 0 ? total : total / denominator;
  const bandwidth = step * (1 - inner);
  const origin = r0 + step * outer;

  return {
    bandwidth: safeCount === 0 ? 0 : Math.max(0, bandwidth),
    step: safeCount === 0 ? 0 : Math.max(0, step),
    count: safeCount,
    start(index) {
      return origin + step * index;
    },
    center(index) {
      return origin + step * index + Math.max(0, bandwidth) / 2;
    },
    indexAt(position) {
      if (safeCount === 0 || step === 0) return -1;
      const offset = (position - origin) / step;
      const index = Math.floor(offset);
      if (index < 0 || index >= safeCount) return -1;
      // Inside this band's own span, or in the gap after it?
      return offset - index <= 1 - inner ? index : -1;
    },
  };
}

/**
 * Which datapoint a pointer is nearest.
 *
 * Charts are wider than they are tall, so a naive Euclidean nearest-point search
 * snaps to the wrong point on steep slopes. This ranks by horizontal distance
 * only, which is what "the column I am pointing at" means to a reader.
 */
export function nearestIndex(
  position: number,
  centers: readonly number[],
  maxDistance = Number.POSITIVE_INFINITY,
): number {
  if (centers.length === 0) return -1;
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < centers.length; index += 1) {
    const center = centers[index];
    if (center === undefined) continue;
    const distance = Math.abs(center - position);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  if (best === -1 || bestDistance > maxDistance) return -1;
  return best;
}

export type ChartCurve = "linear" | "smooth" | "step";

export interface LinePathOptions {
  curve?: ChartCurve;
  /** Where a step curve turns. `midpoint` is the honest one for a discrete
   *  measurement; `after` matches how a step chart usually gets hand-drawn. */
  stepPosition?: "midpoint" | "before" | "after";
}

/** `M x y L x y …` with a gap wherever a point is missing. */
function buildPolylinePath(points: readonly ChartPoint[]): string {
  let path = "";
  let penDown = false;
  for (const point of points) {
    if (point === null) {
      penDown = false;
      continue;
    }
    path += `${penDown ? "L" : "M"}${round(point.x)} ${round(point.y)}`;
    penDown = true;
  }
  return path;
}

/** A step path, with the vertical riser landing where `stepPosition` says. */
function buildStepPath(
  points: readonly ChartPoint[],
  position: "midpoint" | "before" | "after",
): string {
  const usable = points.filter((point) => point !== null);
  if (usable.length === 0) return "";

  // Each usable point needs its x, plus the previous/next x so the riser can be
  // placed at the midpoint between two samples.
  const samples: { x: number; y: number; index: number }[] = [];
  let index = 0;
  for (const point of points) {
    if (point === null) {
      index += 1;
      continue;
    }
    samples.push({ x: point.x, y: point.y, index });
    index += 1;
  }

  const first = samples[0];
  if (!first) return "";

  const riserAt = (sampleIndex: number): number => {
    const current = samples[sampleIndex];
    const next = samples[sampleIndex + 1];
    if (!current) return 0;
    // The riser is the only part of a step chart that needs a decision. It
    // belongs between two samples, and the three options are where inside that
    // gap it falls: at the first sample ("before"), at the second ("after"), or
    // halfway ("midpoint") — the only one that does not claim a value was held
    // across the whole interval when it was not.
    if (position === "before") return current.x;
    if (position === "after") return next ? next.x : current.x;
    return next ? (current.x + next.x) / 2 : current.x;
  };

  let path = `M${round(first.x)} ${round(first.y)}`;
  for (
    let sampleIndex = 0;
    sampleIndex < samples.length - 1;
    sampleIndex += 1
  ) {
    const current = samples[sampleIndex];
    const next = samples[sampleIndex + 1];
    if (!current || !next) continue;
    const riser = riserAt(sampleIndex);
    path += `H${round(riser)}V${round(next.y)}H${round(next.x)}`;
  }
  return path;
}

/**
 * Monotone cubic (Fritsch–Carlson) interpolation.
 *
 * Catmull-Rom looks smoother but overshoots: a plateau of `100, 100, 100` with a
 * dip to `20` on either side draws a curve that dips to `84` in the flat part.
 * On a dashboard that is a lie about the data. Monotone tangents never exceed
 * the neighbouring secants, so the curve cannot invent a peak that the data does
 * not contain, and it still reads as a smooth trend.
 */
function buildMonotonePath(points: readonly ChartPoint[]): string {
  const usable = points.filter((point): point is ChartPoint => point !== null);
  if (usable.length === 0) return "";
  if (usable.length === 1) {
    const only = usable[0]!;
    return `M${round(only.x)} ${round(only.y)}`;
  }
  if (usable.length === 2) {
    return `M${round(usable[0]!.x)} ${round(usable[0]!.y)}L${round(usable[1]!.x)} ${round(usable[1]!.y)}`;
  }

  const count = usable.length;
  // Secant slope per segment.
  const deltas: number[] = new Array(count - 1);
  for (let index = 0; index < count - 1; index += 1) {
    const current = usable[index]!;
    const next = usable[index + 1]!;
    const run = next.x - current.x;
    deltas[index] = run === 0 ? 0 : (next.y - current.y) / run;
  }

  // Tangent per node: centered average to start.
  const tangents: number[] = new Array(count);
  tangents[0] = deltas[0] ?? 0;
  tangents[count - 1] = deltas[count - 2] ?? 0;
  for (let index = 1; index < count - 1; index += 1) {
    tangents[index] = ((deltas[index - 1] ?? 0) + (deltas[index] ?? 0)) / 2;
  }

  // Enforce monotonicity: a node whose neighbors slope the same way keeps its
  // average; a node at a local peak or valley gets a flat tangent, which is what
  // stops the curve from overshooting there.
  for (let index = 0; index < count - 1; index += 1) {
    const delta = deltas[index] ?? 0;
    if (delta === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }
    let alpha = (tangents[index] ?? 0) / delta;
    let beta = (tangents[index + 1] ?? 0) / delta;
    // Sign guards: a tangent pointing against its own segment is what lets the
    // curve overshoot the data, and no amount of tau-scaling brings it back.
    if (alpha <= 0) {
      alpha = 0;
      tangents[index] = 0;
    }
    if (beta <= 0) {
      beta = 0;
      tangents[index + 1] = 0;
    }
    // Harmonic-mean weighting. Without this guard a zero tangent next to a steep
    // segment divides by zero and the whole path goes NaN.
    if (alpha * alpha + beta * beta > 9) {
      const tau = 3 / Math.sqrt(alpha * alpha + beta * beta);
      tangents[index] = tau * alpha * delta;
      tangents[index + 1] = tau * beta * delta;
    }
  }

  const first = usable[0]!;
  let path = `M${round(first.x)} ${round(first.y)}`;
  for (let index = 0; index < count - 1; index += 1) {
    const current = usable[index]!;
    const next = usable[index + 1]!;
    const run = (next.x - current.x) / 3;
    const controlA = {
      x: current.x + run,
      y: current.y + (tangents[index] ?? 0) * run,
    };
    const controlB = {
      x: next.x - run,
      y: next.y - (tangents[index + 1] ?? 0) * run,
    };
    path += `C${round(controlA.x)} ${round(controlA.y)} ${round(controlB.x)} ${round(controlB.y)} ${round(next.x)} ${round(next.y)}`;
  }
  return path;
}

/**
 * Round to 2dp and drop trailing zeros.
 *
 * Path data is the largest string in the rendered SVG, and repeating `.5000001`
 * in every coordinate costs real bytes in a chart that re-renders on every
 * pointer move.
 */
export function round(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/** Strip `null` entries so the path builders only deal with real points. */
export function compactPoints(
  points: readonly (ChartPoint | null)[],
): (ChartPoint | null)[] {
  return points.filter((point) => point !== null);
}

/**
 * The stroke path for a line or the outline of an area.
 * A `null` point breaks the path into separate runs, so a missing reading is a
 * visible gap rather than a straight line drawn across it.
 */
export function buildLinePath(
  points: readonly (ChartPoint | null)[],
  options: LinePathOptions = {},
): string {
  const { curve = "linear", stepPosition = "midpoint" } = options;
  const runs = splitRuns(points);
  if (runs.length === 0) return "";

  return runs
    .map((run) => {
      if (run.length === 1) {
        // A lone sample has no length to draw, but it is still a reading and
        // hiding it is worse than drawing a dot. A zero-length subpath is what
        // the SVG spec says should paint a round cap; a bare `M` paints
        // nothing, so the `L` to the same coordinate is load-bearing.
        const only = run[0]!;
        return `M${round(only.x)} ${round(only.y)}L${round(only.x)} ${round(only.y)}`;
      }
      if (curve === "smooth") return buildMonotonePath(run);
      if (curve === "step") return buildStepPath(run, stepPosition);
      return buildPolylinePath(run);
    })
    .filter((path) => path.length > 0)
    .join(" ");
}

/** Group points into consecutive non-null runs. */
export function splitRuns(
  points: readonly (ChartPoint | null)[],
): ChartPoint[][] {
  const runs: ChartPoint[][] = [];
  let current: ChartPoint[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length > 0) runs.push(current);
      current = [];
      continue;
    }
    current.push(point);
  }
  if (current.length > 0) runs.push(current);
  return runs;
}

/**
 * The filled shape under a line, closed down to `baselineY`.
 * Each run is closed independently so a gap is not filled with a solid block
 * spanning the hole.
 */
export function buildAreaPath(
  points: readonly (ChartPoint | null)[],
  baselineY: number,
  options: LinePathOptions = {},
): string {
  const runs = splitRuns(points).filter((run) => run.length > 1);
  return runs
    .map((run) => {
      const top = buildLinePath(run, options);
      if (top.length === 0) return "";
      const first = run[0]!;
      const last = run[run.length - 1]!;
      return `${top}L${round(last.x)} ${round(baselineY)}L${round(first.x)} ${round(baselineY)}Z`;
    })
    .filter(Boolean)
    .join(" ");
}
/** A bar's outline. Kept as a path so a bar can carry rounded corners on the
 *  value end only, which is what a CSS `border-radius` cannot do. */
export function buildBarPath(options: {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  side?: "top" | "right";
}): string {
  const { x, y, width, height, radius = 0, side = "top" } = options;
  if (width <= 0 || height <= 0) return "";
  // Never round more than half the short edge, or the bar collapses into a lozenge.
  const limit = side === "top" ? width / 2 : height / 2;
  const r = clamp(radius, 0, limit);
  if (r === 0) {
    return `M${round(x)} ${round(y)}H${round(x + width)}V${round(y + height)}H${round(x)}Z`;
  }

  if (side === "top") {
    return [
      `M${round(x)} ${round(y + height)}`,
      `V${round(y + r)}`,
      `A${round(r)} ${round(r)} 0 0 1 ${round(x + r)} ${round(y)}`,
      `H${round(x + width - r)}`,
      `A${round(r)} ${round(r)} 0 0 1 ${round(x + width)} ${round(y + r)}`,
      `V${round(y + height)}`,
      "Z",
    ].join("");
  }

  return [
    `M${round(x)} ${round(y)}`,
    `H${round(x + width - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width)} ${round(y + r)}`,
    `V${round(y + height - r)}`,
    `A${round(r)} ${round(r)} 0 0 1 ${round(x + width - r)} ${round(y + height)}`,
    `H${round(x)}`,
    "Z",
  ].join("");
}

/**
 * A point on a circle. `angle` is measured clockwise from twelve o'clock so it
 * matches how slices are read off a pie.
 *
 * Rounded to two decimals, and that is not cosmetic. `Math.sin` and `Math.cos`
 * are not required by the spec to be correctly rounded, so Node's V8 and the
 * browser's V8 are each free to be off by an ulp — and they are. A pie label
 * came out as `y="258.7870377302694"` on the server and `258.78703773026933` in
 * the browser: the same number, two doubles that print differently, which React
 * reports as a hydration mismatch and refuses to patch. The difference is around
 * 6e-14, five thousand times below one hundredth of a pixel, so rounding here
 * costs nothing visible and makes the markup identical on both sides. Every
 * number this engine hands to the DOM goes through `round` for this reason.
 */
export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angleRadians: number,
): ChartPoint {
  return {
    x: round(cx + radius * Math.sin(angleRadians)),
    y: round(cy - radius * Math.cos(angleRadians)),
  };
}

/** Fractions (0–1) of a circle to a start/end angle in radians, starting at
 *  twelve o'clock. */
export function arcAngles(
  startFraction: number,
  endFraction: number,
): { start: number; end: number; sweep: number } {
  const start = startFraction * Math.PI * 2;
  const end = endFraction * Math.PI * 2;
  return { start, end, sweep: Math.max(0, end - start) };
}

/**
 * A pie or donut slice, drawn as a stroked circle.
 *
 * The obvious approach is an `<path>` with two arc commands, but there is no way
 * to animate the sweep angle in CSS, so the slices either appear instantly or
 * need JS on every frame. A stroked circle solves that: `stroke-dasharray` and
 * `stroke-dashoffset` *are* animatable properties, so the sweep runs on the
 * compositor with no re-render.
 *
 * A stroke of width `w` centered on radius `r` covers radius `r - w/2` to
 * `r + w/2`, so choosing `r = inner + w/2` and `w = outer - inner` lands the
 * stroke exactly on the requested band — the same numbers draw a filled pie
 * (`inner = 0`) and a donut (`inner > 0`) with no branching.
 */
export function arcGeometry(options: {
  outerRadius: number;
  innerRadius?: number;
}): { radius: number; strokeWidth: number; circumference: number } {
  const outer = Math.max(0, options.outerRadius);
  const inner = clamp(options.innerRadius ?? 0, 0, outer);
  const strokeWidth = Math.max(0, outer - inner);
  const radius = inner + strokeWidth / 2;
  // Rounded for the same reason as `polarPoint`: these three land in `r`,
  // `stroke-width`, and the dash maths as raw attribute values.
  return {
    radius: round(radius),
    strokeWidth: round(strokeWidth),
    circumference: round(2 * Math.PI * radius),
  };
}

/** The `stroke-dasharray` / `stroke-dashoffset` pair that draws one slice.
 *  `dashoffset` shifts the visible dash back so the slice starts at twelve. */
export function arcDash(
  geometry: { circumference: number },
  startFraction: number,
  endFraction: number,
): { dasharray: string; dashoffset: number } {
  const { circumference } = geometry;
  const length = Math.max(0, (endFraction - startFraction) * circumference);
  // `|| 0` rather than a nullish fallback: a slice that starts at twelve
  // computes `-0`, and `stroke-dashoffset="-0"` in the markup is a wart that
  // shows up in every diff and every snapshot.
  const offset = round(-startFraction * circumference) || 0;
  return {
    // The trailing gap has to be at least as long as the visible dash, or the
    // pattern wraps and the slice paints twice.
    dasharray: `${round(length)} ${round(Math.max(0, circumference - length))}`,
    dashoffset: offset,
  };
}

/** Where a slice's mid-angle label sits, just outside the outer edge. */
export function arcLabelPoint(
  cx: number,
  cy: number,
  outerRadius: number,
  startFraction: number,
  endFraction: number,
  inset = 0.82,
): ChartPoint {
  const { start, end } = arcAngles(startFraction, endFraction);
  return polarPoint(cx, cy, outerRadius * inset, (start + end) / 2);
}

const compactUnits = [
  { limit: 1e12, suffix: "T" },
  { limit: 1e9, suffix: "B" },
  { limit: 1e6, suffix: "M" },
  { limit: 1e3, suffix: "K" },
] as const;

export interface ChartFormatOptions {
  /** Digits kept on the mantissa. `1` turns `1234` into `1.2K`. */
  precision?: number;
  locale?: string;
  /** A prefix or full unit string, e.g. `"$"`. */
  prefix?: string;
  /** A suffix, e.g. `"%"` or `"ms"`. */
  suffix?: string;
  /** Draw `1,234` instead of `1.2K`. */
  compact?: boolean;
}

/**
 * Format a value for a tooltip, a legend, or a metric card.
 *
 * Axis ticks use `compact` because a y-axis has no room for `1,234,567`. Tooltips
 * and cards do not, so they keep the full grouped number — a reader looking at
 * `1.2M` in a tooltip has been handed less than the tooltip had room to show.
 */
export function formatChartValue(
  value: number,
  options: ChartFormatOptions = {},
): string {
  const {
    precision = 1,
    locale,
    prefix = "",
    suffix = "",
    compact = false,
  } = options;

  if (!Number.isFinite(value)) return "—";
  if (value === 0) return `${prefix}0${suffix}`;

  const sign = value < 0 ? "-" : "";
  const magnitude = Math.abs(value);

  if (compact) {
    // `compactUnits` runs large to small, so index - 1 is the next unit up.
    for (let index = 0; index < compactUnits.length; index += 1) {
      const unit = compactUnits[index]!;
      if (magnitude < unit.limit) continue;
      const scaled = magnitude / unit.limit;
      const rounded = Number(scaled.toFixed(precision));
      // A mantissa that rounds up to 1000 belongs to the next unit up: a
      // `1000.0K` axis label reads as a promotion that never happened.
      const larger = compactUnits[index - 1];
      if (rounded >= 1000 && larger !== undefined) {
        const carried = magnitude / larger.limit;
        const carriedRounded = Number(carried.toFixed(precision));
        const digits = Number.isInteger(carriedRounded) ? 0 : precision;
        return `${sign}${prefix}${carried.toFixed(digits)}${larger.suffix}${suffix}`;
      }
      // Trailing zeros are noise on an axis: `10K`, not `10.0K`.
      const digits = Number.isInteger(rounded) ? 0 : precision;
      return `${sign}${prefix}${scaled.toFixed(digits)}${unit.suffix}${suffix}`;
    }
  }

  const maximumFractionDigits = Number.isInteger(magnitude) ? 0 : precision;
  return `${sign}${prefix}${magnitude.toLocaleString(locale, {
    maximumFractionDigits,
  })}${suffix}`;
}

/** Axis ticks: compact, because the gutter is narrow. */
export function formatAxisTick(value: number, locale?: string): string {
  return formatChartValue(value, { compact: true, locale });
}

/** Tooltip and legend values: full precision, because the tooltip has room. */
export function formatTooltipValue(
  value: number,
  options: ChartFormatOptions = {},
): string {
  return formatChartValue(value, { precision: 2, ...options });
}

/** `0.421` as `42.1%`, with one decimal unless the number is round. */
export function formatPercent(fraction: number, precision = 1): string {
  if (!Number.isFinite(fraction)) return "—";
  const percent = fraction * 100;
  const digits = Number.isInteger(percent) ? 0 : precision;
  return `${percent.toFixed(digits)}%`;
}

/** Signed percentage, for a metric card trend. `+12.4%` / `-3.1%`. */
export function formatDelta(fraction: number, precision = 1): string {
  if (!Number.isFinite(fraction)) return "—";
  const percent = fraction * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "-" : "";
  return `${sign}${Math.abs(percent).toFixed(precision)}%`;
}

export interface ChartSeries {
  /** The data key this series reads. */
  key: string;
  /** Legend and tooltip label. Falls back to `key`. */
  label?: string;
  color?: ChartColorInput;
  /** Stack onto this id. Series sharing an id stack. */
  stack?: string;
  /** Draw as a dashed line — the convention for a target or a projection. */
  dashed?: boolean;
  /** Per-point override for `null` values, e.g. a gap. */
  hidden?: boolean;
}

/** Fill in the derived bits of a series so the render path never re-derives
 *  them: the label, and the slot it takes in the palette. */
export function normalizeSeries(
  series: readonly ChartSeries[],
): (ChartSeries & { label: string; index: number; color: string })[] {
  return series.map((entry, index) => ({
    ...entry,
    index,
    label: entry.label ?? entry.key,
    color: resolveChartColor(entry.color, index),
  }));
}

export interface ChartSlice {
  /** Category name, shown in the legend and the tooltip. */
  name: string;
  value: number;
  color?: ChartColorInput;
}

/** Normalize slices for a pie: fill in colors, drop non-finite values, and
 *  compute each slice's share so the tooltip never recomputes the total. */
export function normalizeSlices(
  slices: readonly ChartSlice[],
): (ChartSlice & { color: string; fraction: number })[] {
  const usable = slices
    .map((slice) => ({ ...slice, value: toFiniteNumber(slice.value) ?? 0 }))
    .filter((slice) => slice.value > 0);

  const total = usable.reduce((sum, slice) => sum + slice.value, 0);
  return usable.map((slice, index) => ({
    ...slice,
    color: resolveChartColor(slice.color, index),
    fraction: total > 0 ? slice.value / total : 0,
  }));
}

/** Cumulative start/end fractions for a pie, in draw order. */
export function sliceArcs(
  slices: readonly { fraction: number }[],
): { start: number; end: number }[] {
  let cursor = 0;
  return slices.map((slice) => {
    const start = cursor;
    cursor += slice.fraction;
    return { start, end: cursor };
  });
}

/**
 * An animation delay for staggered reveals, as a CSS `time` value.
 *
 * The cap matters: on a 40-bar chart an uncapped stagger puts the last bar
 * nearly a second behind the first, so the chart is still filling in when the
 * reader has already read it. Past 12 steps the delay stops growing.
 */
export function staggerDelay(
  index: number,
  stepMs = 45,
  maxSteps = 12,
): string {
  const steps = Math.min(Math.max(0, index), maxSteps);
  return `${(steps * stepMs).toFixed(0)}ms`;
}

/**
 * Plot height for a card. Charts that render into a card need a height that
 * scales with width, or a narrow card gets a 320px-tall bar chart and a wide one
 * gets a sliver. `aspect` is clamped so an extreme container still gets a
 * readable chart.
 */
export function resolveChartHeight(
  width: number,
  aspect = 2,
  options: { min?: number; max?: number } = {},
): number {
  const { min = 180, max = 420 } = options;
  const ratio = clamp(aspect, 0.25, 8);
  return clamp(width / ratio, min, max);
}

/** The long edge of a plot box. */
export function boxLongEdge(width: number, height: number): number {
  return Math.max(width, height);
}

/** Percentage of a value against a total, guarding the 0/0 case that a fresh
 *  dataset produces. */
export function shareOf(value: number, total: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0)
    return 0;
  return value / total;
}

/* ------------------------------------------------------------------ heatmap -- */

/** How a heat map encodes a value's sign. */
export type HeatScale = "sequential" | "diverging";

/**
 * The domain the cells are bucketed against.
 *
 * A diverging heat map is *not* a sequential one with a zero in it. Its whole
 * claim is that "no change" is the visual centre and the two arms are equally
 * far from it, so a month that fell by 40% and a month that rose by 40% have to
 * land on the same shade. An ordinary min/max domain does not do that: a dataset
 * running from -10 to +200 gives a zero at 5% of the way in, and every negative
 * cell collapses into the first bucket. So the arms are levelled against the
 * largest absolute distance from the pivot instead of against each other.
 *
 * An explicit `domain` always wins, which is what lets two heat maps be
 * compared at all — a "this week" and a "last week" grid are unreadable
 * side by side if each one stretches to its own extent.
 */
export function resolveHeatDomain(
  values: readonly (number | null)[],
  options: {
    scale?: HeatScale;
    pivot?: number;
    domain?: ChartDomain;
  } = {},
): ChartDomain {
  const { scale = "sequential", pivot = 0, domain } = options;
  if (domain) return domain;

  const finite = values.filter((value): value is number => value !== null);
  if (finite.length === 0) return [0, 1];

  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];

  if (scale === "diverging") {
    const reach = Math.max(Math.abs(min - pivot), Math.abs(max - pivot));
    // Every cell equal to the pivot still has to land somewhere. A zero-width
    // domain divides by zero in the bucket maths and sends all of them to the
    // last bucket, which is the loudest colour on the ramp.
    const span = reach > 0 ? reach : 1;
    return [pivot - span, pivot + span];
  }

  if (min === max) {
    // Same reason `resolveDomain` widens a flat series: a one-value heat map
    // still has to show that value, and a zero-height domain cannot.
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  return [min, max];
}

/** Clamp a step count to something a legend can hold and a cell can use. */
export function heatSteps(count: number, scale: HeatScale = "sequential"): number {
  const steps = Math.round(Number.isFinite(count) ? count : 5);
  const safe = Math.min(12, Math.max(1, steps));
  // A diverging ramp needs a bucket that straddles the pivot, and an even
  // count has no middle: with 4 buckets the split is 2 down and 2 up and the
  // neutral bucket is nowhere, so a value of exactly zero is painted as
  // strongly as one a quarter of the way up the arm. Rounded up to odd, the
  // centre exists and the arms match.
  if (scale === "diverging" && safe % 2 === 0) return safe + 1;
  return safe;
}

/**
 * Which band a value falls in, as an index into `[0, steps)`.
 *
 * Bands are half-open, `[low, high)`, with the last one closed at the top, so
 * every value is in exactly one band and a value sitting on the domain maximum
 * lands in the last band rather than one past the end.
 */
export function heatBucketIndex(
  value: number,
  domain: ChartDomain,
  steps: number,
): number {
  const count = Math.max(1, Math.round(steps));
  const span = domain[1] - domain[0];
  if (!Number.isFinite(span) || span <= 0) return 0;
  const t = clamp((value - domain[0]) / span, 0, 1);
  return Math.min(count - 1, Math.floor(t * count));
}

/** The `[low, high)` values a band covers, so a legend can print real numbers
 *  under its swatches rather than a bare "low" and "high". */
export function heatBucketRange(
  index: number,
  domain: ChartDomain,
  steps: number,
): ChartDomain {
  const count = Math.max(1, Math.round(steps));
  const span = (domain[1] - domain[0]) / count;
  return [domain[0] + span * index, domain[0] + span * (index + 1)];
}

/**
 * A step on the ramp, as a CSS color.
 *
 * `color-mix` in `oklch` rather than `srgb` is the whole point. Mixing two
 * colors in sRGB walks a straight line through gamma-encoded space, so the
 * midpoint of a light-to-dark mix is *darker than either end* and a ramp built
 * that way is not monotonic in perceived lightness — the middle of a heat map
 * comes out muddier than its own ends, and a reader ranking two mid-range cells
 * is ranking noise. `oklch` interpolates lightness and chroma as separate
 * coordinates, so a step from the base color to the background rises in
 * lightness the entire way.
 *
 * The result is handed to CSS as a custom property and read back through
 * `var(--heat-fill, var(--data-1))`. A browser without `color-mix` treats the
 * declaration as invalid at computed-value time, the custom property falls
 * through to the fallback, and the cells come out in the flat base token rather
 * than in nothing.
 */
export function heatColorMix(
  color: string,
  percent: number,
  background = "var(--background)",
): string {
  const pct = Math.round(clamp(percent, 0, 100));
  return `color-mix(in oklch, ${color} ${pct}%, ${background})`;
}

export interface HeatFillOptions {
  value: number;
  domain: ChartDomain;
  steps?: number;
  scale?: HeatScale;
  /** Sequential base color, or the "up" arm of a diverging ramp. */
  color?: string;
  /** The "down" arm. Only read when the scale diverges. */
  negativeColor?: string;
  background?: string;
  /** Strength of the weakest band, as a percentage of the color. A heat map
   *  whose lowest band is the bare background is unreadable at the low end, so
   *  the default leaves a visible tint on the floor. */
  minMix?: number;
  /** Strength of the strongest band. */
  maxMix?: number;
}

export interface HeatFill {
  /** Band index, for the tooltip and the legend. */
  index: number;
  /** The color, as a CSS value. */
  color: string;
  /** The un-mixed token, so a caller can fall back to it. */
  base: string;
  /** How strong the mix is, 0–1. Zero on a diverging ramp's neutral band. */
  strength: number;
}

/**
 * The color for one value.
 *
 * Sequential ramps read from `minMix` to `maxMix` across the bands, so lightness
 * climbs monotonically and the loudest cell really is the largest number.
 * Diverging ramps level both arms against the same neutral band in the middle,
 * which is what makes "up 40%" and "down 40%" the same shade.
 *
 * Note there is no `pivot` here. The pivot decides the *shape* of the domain —
 * `resolveHeatDomain` is what levels the two arms around it — and by the time a
 * value reaches this function all it has is a band index. Taking a pivot that
 * this function cannot use would be an option that reads like it does something
 * and does not.
 */
export function heatFill(options: HeatFillOptions): HeatFill {
  const {
    value,
    domain,
    scale = "sequential",
    color = "var(--data-1)",
    negativeColor = "var(--data-negative)",
    background = "var(--background)",
    minMix = 14,
    maxMix = 100,
  } = options;

  const steps = heatSteps(options.steps ?? 5, scale);

  if (scale === "sequential") {
    const index = heatBucketIndex(value, domain, steps);
    const strength = steps > 1 ? index / (steps - 1) : 1;
    return {
      index,
      color: heatColorMix(color, minMix + strength * (maxMix - minMix), background),
      base: color,
      strength,
    };
  }

  // `mid` is the band that straddles the pivot, and `steps` is odd here because
  // `heatSteps` guarantees it: without a middle band there is no neutral, and
  // the pivot itself gets a color strong enough to look like a real reading.
  const mid = Math.floor(steps / 2);

  // ...and that middle band has to be closed at *both* ends, which
  // `heatBucketIndex` cannot be: it is half-open everywhere so that every value
  // lands in exactly one band, and over a [-100, 100] domain with 5 bands that
  // puts -20 in the neutral band and +20 in the first coloured one. Two values
  // the same distance from zero, painted as two different magnitudes, and a
  // legend that reads symmetric while the chart is not.
  //
  // Measured from the domain's centre rather than from a `pivot` argument: for
  // a levelled domain those are the same number, and when a caller pins an
  // asymmetric domain the midpoint is what the printed scale already shows, so
  // this stays consistent with the legend instead of contradicting it.
  const centre = (domain[0] + domain[1]) / 2;
  const halfWidth = (domain[1] - domain[0]) / (2 * steps);
  const band =
    Math.abs(value - centre) <= halfWidth
      ? mid
      : heatBucketIndex(value, domain, steps);

  const distance = band - mid;
  const strength = mid > 0 ? clamp(Math.abs(distance) / mid, 0, 1) : 0;
  const arm = distance < 0 ? negativeColor : color;

  return {
    index: band,
    color:
      strength === 0
        ? background
        : heatColorMix(arm, minMix + strength * (maxMix - minMix), background),
    base: arm,
    strength,
  };
}

/** One cell's box, in plot pixels. */
export interface HeatCellBox {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Corner radius, held to half the shorter edge. Zero means square. */
  radius: number;
}

/**
 * Where one cell sits.
 *
 * The gap is clamped against the cell's own size. A heat map is the one chart
 * where a fixed pixel gap is wrong: a 7×52 activity grid has six-pixel cells,
 * and a 3px gap turns half of each cell into background, so the chart reads as
 * a sparse dot field instead of a dense one. Clamping to leave at least a pixel
 * of fill keeps the shape of the grid at any size.
 */
export function heatCellBox(options: {
  col: number;
  row: number;
  columns: number;
  rows: number;
  x: number;
  y: number;
  width: number;
  height: number;
  gap?: number;
  radius?: number;
}): HeatCellBox {
  const {
    col,
    row,
    columns,
    rows,
    x,
    y,
    width,
    height,
    gap = 2,
    radius = 3,
  } = options;

  const cellWidth = columns > 0 ? width / columns : 0;
  const cellHeight = rows > 0 ? height / rows : 0;
  const inset = Math.max(0, Math.min(gap, Math.min(cellWidth, cellHeight) - 1));
  // A radius wider than half the cell turns a rounded square into a circle and
  // a circle into a clipped one, so it is held to half the shorter edge.
  const r = Math.max(0, Math.min(radius, Math.min(cellWidth, cellHeight) / 2 - inset / 2));

  // Rounded, like every other number this engine emits. A 365-column activity
  // grid otherwise writes `width="13.857142857142858"` into 2,555 elements,
  // which is a third of a megabyte of markup describing a shape the reader
  // cannot see the difference in — and a seventh significant figure is one more
  // place for a server and a browser to disagree.
  return {
    x: round(x + col * cellWidth + inset / 2),
    y: round(y + row * cellHeight + inset / 2),
    width: round(Math.max(0, cellWidth - inset)),
    height: round(Math.max(0, cellHeight - inset)),
    radius: round(r),
  };
}

/**
 * A diagonal reveal delay, as a CSS time.
 *
 * Columns alone sweep left to right, which reads as a progress bar and makes
 * the last column wait for a queue it is not in. `col + row` sends the wave
 * across the corner, so a grid resolves the way the eye scans it. The cap is
 * what matters: a 12×52 activity grid is 64 diagonals deep, and uncapped the
 * bottom-right cell would start a second after the first.
 */
export function heatStaggerDelay(
  col: number,
  row: number,
  stepMs = 11,
  maxSteps = 18,
): string {
  const steps = Math.min(Math.max(0, col + row), maxSteps);
  return `${(steps * stepMs).toFixed(0)}ms`;
}
