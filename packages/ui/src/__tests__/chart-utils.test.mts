import assert from "node:assert/strict";
import test from "node:test";
import {
  arcDash,
  arcGeometry,
  buildAreaPath,
  buildBarPath,
  buildLinePath,
  createBandScale,
  createLinearScale,
  formatAxisTick,
  formatChartValue,
  formatDelta,
  formatPercent,
  heatBucketIndex,
  heatBucketRange,
  heatCellBox,
  heatColorMix,
  heatFill,
  heatStaggerDelay,
  heatSteps,
  linearTicks,
  nearestIndex,
  niceCeil,
  polarPoint,
  normalizeSeries,
  normalizeSlices,
  resolveChartColor,
  resolveChartHeight,
  resolveDomain,
  resolveHeatDomain,
  sliceArcs,
  staggerDelay,
  toFiniteNumber,
  type ChartPoint,
} from "../chart-utils.ts";

function point(x: number, y: number): ChartPoint {
  return { x, y };
}

/* ------------------------------------------------------------------ colors -- */

test("the palette is tokens, never literal colors", () => {
  // A hardcoded rgb() is the exact thing that breaks when a theme changes, so
  // it is worth a test: this is the bug the whole engine exists to prevent.
  const first = resolveChartColor(undefined, 0);
  assert.equal(first, "var(--data-1)");
  assert.equal(resolveChartColor(undefined, 4), "var(--data-5)");
  assert.equal(resolveChartColor(undefined, 5), "var(--data-1)");

  // A negative index must not produce `var(--data---1)`, and it has to land on
  // the same slot as its positive equivalent or a legend drawn with one sign
  // disagrees with a series drawn with the other.
  assert.equal(resolveChartColor(undefined, -1), "var(--data-5)");
  assert.equal(resolveChartColor(undefined, -4), "var(--data-2)");
  assert.equal(resolveChartColor(undefined, -5), "var(--data-1)");
  assert.equal(resolveChartColor(undefined, -6), "var(--data-5)");

  for (let index = 0; index < 12; index += 1) {
    const color = resolveChartColor(undefined, index);
    assert.match(color, /^var\(--data-[1-5]\)$/);
    assert.doesNotMatch(color, /rgb|#[0-9a-f]{3}/i);
  }
});

test("the default palette is the fixed one, never --chart-N", () => {
  // The regression this whole palette change exists to prevent. `--chart-N` is
  // re-declared in every theme's dark block — in slate it moves from hue 41
  // (orange) to hue 264 (blue) — so a chart that reached for it repainted itself
  // on a mode switch while the numbers under it stayed put. Nothing in the
  // chart surface may resolve to it by default.
  for (let index = 0; index < 12; index += 1) {
    assert.doesNotMatch(resolveChartColor(undefined, index), /--chart-/);
  }
  for (const key of ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]) {
    assert.equal(resolveChartColor(key), `var(--data-${key.slice(-1)})`);
  }
  // `data-N` is the honest spelling and lands on the same fixed slot.
  for (const key of ["data-1", "data-2", "data-3", "data-4", "data-5"]) {
    assert.equal(resolveChartColor(key), `var(${`--${key}`})`);
  }
  // A slot past the end of the palette is a typo, not slot 6.
  assert.equal(resolveChartColor("data-9", 2), "var(--data-3)");
});

test("a named role resolves to a token and a raw value passes through", () => {
  assert.equal(resolveChartColor("primary"), "var(--primary)");
  assert.equal(resolveChartColor("destructive"), "var(--destructive)");
  assert.equal(resolveChartColor("blue"), "var(--blue-500)");
  assert.equal(resolveChartColor("chart-3"), "var(--data-3)");
  // `negative` is the one role that is NOT a themed token, because the two arms
  // of a diverging ramp have to stay level with each other and `--destructive`
  // moves between modes.
  assert.equal(resolveChartColor("negative"), "var(--data-negative)");
  assert.doesNotMatch(resolveChartColor("negative"), /--destructive/);

  // Anything carrying CSS color syntax is taken at face value.
  assert.equal(resolveChartColor("#ff0000"), "#ff0000");
  assert.equal(resolveChartColor("rgb(1 2 3)"), "rgb(1 2 3)");
  assert.equal(resolveChartColor("oklch(0.6 0.2 30)"), "oklch(0.6 0.2 30)");
  assert.equal(resolveChartColor("var(--brand)"), "var(--brand)");
  // The themed slot is still reachable, as raw CSS, for whoever wants it.
  assert.equal(resolveChartColor("var(--chart-1)"), "var(--chart-1)");

  // A bare word that is not a token is a typo. Passing it to `fill` renders
  // black, and a black chart is worse than one painted from the palette.
  assert.equal(resolveChartColor("banana", 2), "var(--data-3)");
  assert.equal(resolveChartColor("reddish", 0), "var(--data-1)");

  // The six hue names are roles, not typos, so they resolve rather than fall
  // back — and they are already theme-independent, pointing at the fixed ramps
  // in base.css. Worth knowing that they sit lighter than the data palette
  // (L 62–72% vs 58%) and so are the weakest marks on a near-white surface.
  assert.equal(resolveChartColor("orange"), "var(--orange-500)");
  assert.equal(resolveChartColor("teal"), "var(--teal-500)");
});

test("an unknown color name warns once, and still renders", () => {
  const warnings: unknown[][] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args);
  };
  // A name no other test uses: the dedupe set is module scope and deliberately
  // survives remounts, so reusing a name an earlier test already warned about
  // would make this test pass or fail on test order alone.
  const typo = "chartt-2";
  try {
    // Rendered three times, as a heat map's per-cell `useMemo` would.
    assert.equal(resolveChartColor(typo, 1), "var(--data-2)");
    assert.equal(resolveChartColor(typo, 1), "var(--data-2)");
    assert.equal(resolveChartColor(typo, 1), "var(--data-2)");
  } finally {
    console.warn = original;
  }
  // One message for one typo, not one per cell.
  assert.equal(warnings.length, 1);
  assert.match(String(warnings[0]?.[0]), new RegExp(typo));
  // It still renders a legible color rather than an invalid `fill`, which would
  // paint black.
  assert.equal(resolveChartColor(typo, 1), "var(--data-2)");

  // A valid color never warns.
  const before = warnings.length;
  console.warn = (...args: unknown[]) => {
    warnings.push(args);
  };
  try {
    resolveChartColor("#123456");
    resolveChartColor("chart-2");
    resolveChartColor("data-2");
    resolveChartColor("destructive");
    resolveChartColor("negative");
  } finally {
    console.warn = original;
  }
  assert.equal(warnings.length, before);
});

test("series fill in their own label and palette slot", () => {
  const series = normalizeSeries([
    { key: "revenue" },
    { key: "signups", label: "Sign ups" },
    { key: "churn", color: "destructive" },
    { key: "hidden" },
  ]);
  assert.equal(series[0]?.label, "revenue");
  assert.equal(series[0]?.color, "var(--data-1)");
  assert.equal(series[1]?.label, "Sign ups");
  assert.equal(series[1]?.color, "var(--data-2)");
  assert.equal(series[2]?.color, "var(--destructive)");
  assert.equal(series[3]?.index, 3);
});

/* ------------------------------------------------------------------- input -- */

test("a missing reading is a gap, never a zero", () => {
  // Rendering null as 0 invents data. The whole point is that it resolves to
  // null so the path breaks instead.
  assert.equal(toFiniteNumber(null), null);
  assert.equal(toFiniteNumber(undefined), null);
  assert.equal(toFiniteNumber(""), null);
  assert.equal(toFiniteNumber("   "), null);
  assert.equal(toFiniteNumber("n/a"), null);
  assert.equal(toFiniteNumber(Number.NaN), null);
  assert.equal(toFiniteNumber(Number.POSITIVE_INFINITY), null);
  assert.equal(toFiniteNumber({}), null);
  assert.equal(toFiniteNumber([]), null);

  assert.equal(toFiniteNumber(0), 0);
  assert.equal(toFiniteNumber("42"), 42);
  assert.equal(toFiniteNumber(" 3.5 "), 3.5);
  assert.equal(toFiniteNumber(-7), -7);
});

/* ------------------------------------------------------------------ scales -- */

test("a domain always includes zero for bars", () => {
  const [min, max] = resolveDomain([120, 480, 300]);
  assert.equal(min, 0);
  assert.equal(max > 480, true);
  assert.equal(Number.isInteger(max), true);
});

test("a line keeps its own extent unless zero is asked for", () => {
  const [min, max] = resolveDomain([120, 480, 300], { zeroBaseline: false });
  assert.equal(min < 120, true);
  assert.equal(max >= 480, true);
});

test("a flat series still gets a drawable domain", () => {
  // A zero-height domain divides by zero in the scale and draws a line through
  // the middle of the plot at an arbitrary value.
  const [min, max] = resolveDomain([100, 100, 100]);
  assert.equal(max > min, true);

  const [zeroMin, zeroMax] = resolveDomain([0, 0, 0]);
  assert.equal(zeroMax > zeroMin, true);

  const [emptyMin, emptyMax] = resolveDomain([]);
  assert.equal(emptyMin, 0);
  assert.equal(emptyMax, 1);
});

test("ticks land on round numbers across the domain", () => {
  const domain = resolveDomain([0, 8734]);
  const ticks = linearTicks(domain, 5);
  assert.equal(ticks.length, 6);
  assert.equal(ticks[0], domain[0]);
  assert.equal(ticks[ticks.length - 1], domain[1]);
  for (const tick of ticks) {
    assert.equal(Number.isFinite(tick), true);
  }
  assert.equal(ticks.every((tick) => tick >= 0), true);
});

test("a tick is never a number nobody asked for", () => {
  // `resolveDomain` rounds the domain to a 1/2/5 step and `linearTicks` has to
  // step the same way. When they disagree, a 10,000-wide axis prints -333.3
  // next to 0 and 666.7, and every one of those is a bug.
  for (const values of [
    [0, 8734],
    [-4200, 8100],
    [12, 48000],
    [0, 7],
    [0, 1234567],
  ]) {
    const domain = resolveDomain(values);
    const ticks = linearTicks(domain, 5);
    assert.equal(ticks[0], domain[0], `lower bound for ${values}`);
    assert.equal(ticks[ticks.length - 1], domain[1], `upper bound for ${values}`);
    for (const tick of ticks) {
      assert.equal(
        tick === 0 || Number.isInteger(tick * 100),
        true,
        `tick ${tick} is not a round number`
      );
    }
  }

  // A domain that did not come from resolveDomain is still covered end to end.
  const raw = linearTicks([3, 8734], 5);
  assert.equal(raw[0] <= 3, true);
  assert.equal(raw[raw.length - 1] >= 8734, true);
  assert.equal(raw.some((tick) => tick % 1 !== 0), false);

  // A degenerate domain is one tick, not a divide by zero.
  assert.deepEqual(linearTicks([5, 5], 5), [5]);
});

test("nice steps are 1, 2, 2.5, or 5 times a power of ten", () => {
  assert.equal(niceCeil(8734), 10000);
  assert.equal(niceCeil(4), 5);
  assert.equal(niceCeil(24), 25);
  assert.equal(niceCeil(180), 200);
  assert.equal(niceCeil(1), 1);
  assert.equal(niceCeil(0), 0);
  assert.equal(niceCeil(-4), -5);
});

test("a linear scale maps the domain onto the range", () => {
  const scale = createLinearScale([0, 100], [0, 200]);
  assert.equal(scale(0), 0);
  assert.equal(scale(50), 100);
  assert.equal(scale(100), 200);
  // A non-finite value is a gap, not a NaN in the path data.
  assert.equal(scale(Number.NaN), null);

  // An inverted range is legal: a horizontal bar chart grows leftward.
  const inverted = createLinearScale([0, 10], [100, 0]);
  assert.equal(inverted(0), 100);
  assert.equal(inverted(10), 0);

  // A zero-width domain must not divide by zero.
  const flat = createLinearScale([5, 5], [0, 100]);
  assert.equal(flat(5), 0);
});

test("a band scale lays out evenly and finds the band under a pixel", () => {
  const scale = createBandScale(4, [0, 400], 0.2);
  assert.equal(scale.count, 4);
  assert.equal(scale.bandwidth > 0, true);
  // Four bands across 400px with a 0.2 gap: step is 400 / (4 - 0.2 + 0.2).
  assert.equal(Math.round(scale.step), 100);
  assert.equal(Math.round(scale.start(0)), 10);
  assert.equal(Math.round(scale.center(0)), 50);
  assert.equal(Math.round(scale.center(3)), 350);

  assert.equal(scale.indexAt(50), 0);
  assert.equal(scale.indexAt(350), 3);
  // In the gap after band 0 there is no band. -1 is what lets the caller drop
  // the tooltip instead of snapping it to the wrong bar.
  assert.equal(scale.indexAt(-40), -1);
  assert.equal(scale.indexAt(5000), -1);

  const empty = createBandScale(0, [0, 400], 0.2);
  assert.equal(empty.bandwidth, 0);
  assert.equal(empty.indexAt(50), -1);
});

test("nearest index ranks by horizontal distance only", () => {
  // A tall chart has points far apart vertically; ranking by distance would
  // snap to the wrong one.
  assert.equal(nearestIndex(104, [0, 100, 200, 300]), 1);
  assert.equal(nearestIndex(96, [0, 100, 200, 300]), 1);
  assert.equal(nearestIndex(-100, [0, 100]), 0);
  // The caller's slack is what decides "near enough" — the function itself
  // always has an answer, because a chart with a bounded hit area is easier to
  // reason about than one that sometimes has none.
  assert.equal(nearestIndex(-100, [0, 100], 10), -1);
  assert.equal(nearestIndex(140, [0, 100], 10), -1);
  assert.equal(nearestIndex(50, []), -1);
});

/* ------------------------------------------------------------------- paths -- */

test("a line path starts with a move and never emits NaN", () => {
  const path = buildLinePath([point(0, 10), point(10, 20), point(20, 5)]);
  assert.match(path, /^M0 10/);
  assert.match(path, /L10 20/);
  assert.doesNotMatch(path, /NaN/);
  assert.doesNotMatch(path, /\.\d{3,}/);
});

test("a missing reading breaks the path instead of bridging it", () => {
  const withGap = buildLinePath([
    point(0, 10),
    point(10, 20),
    null,
    point(30, 5),
    point(40, 0),
  ]);
  // Two separate runs means two moves...
  assert.equal((withGap.match(/M/g) ?? []).length, 2);
  // ...and the straight line straight across the hole is never drawn.
  assert.doesNotMatch(withGap, /L10 20L30 5/);

  const bridged = buildLinePath([point(0, 10), point(10, 20), point(30, 5)]);
  assert.equal((bridged.match(/M/g) ?? []).length, 1);
  assert.match(bridged, /L10 20L30 5/);

  // A leading or trailing gap must not open a phantom run.
  assert.equal((buildLinePath([null, point(10, 20), point(20, 5)]).match(/M/g) ?? []).length, 1);
  assert.equal((buildLinePath([point(0, 1), null]).match(/M/g) ?? []).length, 1);
  // A lone surviving sample is still a reading, so it draws as a zero-length
  // subpath — which a round linecap paints as a dot. A bare `M` would drop it.
  assert.equal(buildLinePath([null, point(10, 20), null]), "M10 20L10 20");
});

test("a smooth curve does not overshoot a plateau", () => {
  // Catmull-Rom through this data dips below the plateau, inventing a dip that
  // is not in the readings. Monotone tangents must not.
  const path = buildLinePath(
    [point(0, 20), point(10, 100), point(20, 100), point(30, 100), point(40, 20)],
    { curve: "smooth" }
  );
  assert.match(path, /^M0 20C/);

  // Parse every control point and assert none sits above the plateau.
  const ys = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const ysOnly = ys.filter((_, index) => index % 2 === 1);
  assert.equal(ysOnly.every((y) => y <= 100.0001), true);
});

test("a smooth curve survives repeated values and a single point", () => {
  const flat = buildLinePath([point(0, 5), point(10, 5), point(20, 5)], {
    curve: "smooth",
  });
  assert.doesNotMatch(flat, /NaN/);

  const single = buildLinePath([point(5, 5)], { curve: "smooth" });
  // A one-sample run paints a dot, not nothing.
  assert.equal(single, "M5 5L5 5");

  const two = buildLinePath([point(0, 0), point(10, 10)], { curve: "smooth" });
  assert.doesNotMatch(two, /C/, "two points have no curve to bend");
  assert.doesNotMatch(two, /NaN/);

  assert.equal(buildLinePath([null, null]), "");
  assert.equal(buildLinePath([]), "");
});

test("a step curve turns where it is told to", () => {
  // The riser is the only decision a step chart makes: where, inside the gap
  // between two samples, the value changes. The three options are that the
  // change lands on the first sample, the second, or halfway between.
  const points = [point(0, 10), point(10, 20), point(20, 30)];

  const midpoint = buildLinePath(points, { curve: "step" });
  assert.match(midpoint, /H5/);
  assert.match(midpoint, /V20/);
  assert.match(midpoint, /H15/);
  assert.doesNotMatch(midpoint, /NaN/);

  const before = buildLinePath(points, { curve: "step", stepPosition: "before" });
  assert.match(before, /^M0 10H0V20/);

  const after = buildLinePath(points, { curve: "step", stepPosition: "after" });
  assert.match(after, /^M0 10H10V20/);
});

test("an area closes down to the baseline, one run at a time", () => {
  const path = buildAreaPath([point(0, 10), point(10, 20), point(20, 5)], 100);
  assert.match(path, /^M0 10/);
  assert.match(path, /L20 100/);
  assert.match(path, /Z/);
  assert.doesNotMatch(path, /NaN/);

  // A gap must not be filled as a solid block spanning the hole.
  const gapped = buildAreaPath(
    [point(0, 10), point(10, 20), null, point(30, 5), point(40, 0)],
    100
  );
  assert.equal((gapped.match(/Z/g) ?? []).length, 2);
  assert.equal((gapped.match(/M/g) ?? []).length, 2);

  // A single point has no area to fill.
  assert.equal(buildAreaPath([point(0, 10)], 100), "");
});

test("a bar rounds only the value end", () => {
  const column = buildBarPath({ x: 0, y: 10, width: 20, height: 90, radius: 4 });
  assert.match(column, /^M0 100/);
  assert.match(column, /A4 4 0 0 1/);
  assert.equal((column.match(/A/g) ?? []).length, 2);
  assert.match(column, /Z$/);

  const bar = buildBarPath({
    x: 0,
    y: 0,
    width: 90,
    height: 20,
    radius: 4,
    side: "right",
  });
  assert.match(bar, /H86/);
  assert.match(bar, /A4 4 0 0 1/);

  // A zero-size bar is not a sliver of ink.
  assert.equal(buildBarPath({ x: 0, y: 0, width: 0, height: 40 }), "");
  assert.equal(buildBarPath({ x: 0, y: 0, width: 20, height: 0 }), "");

  // A radius bigger than half the bar must not collapse it into a lozenge.
  const fat = buildBarPath({ x: 0, y: 0, width: 10, height: 10, radius: 99 });
  assert.match(fat, /A5 5/);
});

/* -------------------------------------------------------------------- arcs -- */

test("one geometry draws both a pie and a donut", () => {
  const pie = arcGeometry({ outerRadius: 100 });
  // A filled pie is a stroke as wide as the whole radius, centred halfway out.
  assert.equal(pie.strokeWidth, 100);
  assert.equal(pie.radius, 50);

  const donut = arcGeometry({ outerRadius: 100, innerRadius: 60 });
  assert.equal(donut.strokeWidth, 40);
  // inner + width/2, so the stroke lands exactly on the requested band.
  assert.equal(donut.radius, 80);
  assert.equal(donut.radius - donut.strokeWidth / 2, 60);
  assert.equal(donut.radius + donut.strokeWidth / 2, 100);

  // A hole wider than the pie is degenerate, and it has to degenerate to
  // nothing rather than to a negative stroke that renders inside out.
  const degenerate = arcGeometry({ outerRadius: 100, innerRadius: 500 });
  assert.equal(degenerate.strokeWidth, 0);
  assert.equal(degenerate.circumference > 0, true);
});

test("a slice dash covers its own fraction and leaves room for the gap", () => {
  const { circumference } = arcGeometry({ outerRadius: 100 });
  const quarter = arcDash({ circumference }, 0, 0.25);
  const parts = quarter.dasharray.split(" ");
  // Rounded to 2dp like every other number that reaches the DOM, so compare
  // with the same rounding rather than to the exact float.
  assert.equal(Number(parts[0]), Math.round(circumference * 0.25 * 100) / 100);
  // The trailing gap has to be at least as long as the dash, or the pattern
  // wraps and the slice paints twice.
  assert.equal(Number(parts[1]) >= Number(parts[0]), true);
  assert.equal(quarter.dashoffset, 0);

  const second = arcDash({ circumference }, 0.25, 0.5);
  assert.equal(
    Math.round(-second.dashoffset * 100) / 100,
    Math.round(circumference * 0.25 * 100) / 100
  );

  // A zero-width slice is a hairline, not a full lap of the circle.
  const empty = arcDash({ circumference }, 0.5, 0.5);
  assert.equal(empty.dasharray.startsWith("0 "), true);
});

test("slices keep their share of the whole and close the circle", () => {
  const slices = normalizeSlices([
    { name: "a", value: 30 },
    { name: "b", value: 70 },
    { name: "c", value: 0 },
  ]);
  // A zero slice is dropped rather than drawn as a hairline.
  assert.equal(slices.length, 2);
  assert.equal(Math.round((slices[0]?.fraction ?? 0) * 100), 30);
  assert.equal(slices[0]?.color, "var(--data-1)");
  assert.equal(slices[1]?.color, "var(--data-2)");

  const arcs = sliceArcs(slices);
  assert.equal(arcs[0]?.start, 0);
  assert.equal(Math.round((arcs[1]?.end ?? 0) * 100), 100);

  // An all-zero dataset must not divide by zero.
  const empty = normalizeSlices([
    { name: "a", value: 0 },
    { name: "b", value: 0 },
  ]);
  assert.equal(empty.length, 0);
});

/* --------------------------------------------------------------- formatting -- */

test("axis ticks are compact and values are not", () => {
  // An axis has no room for the full number, so it abbreviates...
  assert.equal(formatAxisTick(999), "999");
  assert.equal(formatAxisTick(1200), "1.2K");
  assert.equal(formatAxisTick(1000), "1K");
  assert.equal(formatAxisTick(1_500_000), "1.5M");
  assert.equal(formatAxisTick(2_400_000_000), "2.4B");
  assert.equal(formatAxisTick(-1500), "-1.5K");

  // ...but a tooltip or a metric card reads the number out loud, so it keeps
  // the full grouped figure.
  assert.equal(formatChartValue(1284), "1,284");
  assert.equal(formatChartValue(0), "0");
  assert.equal(formatChartValue(Number.NaN), "—");
});

test("formatters take a prefix, a suffix, and a precision", () => {
  assert.equal(formatChartValue(1234, { prefix: "$" }), "$1,234");
  assert.equal(formatChartValue(42, { suffix: "ms" }), "42ms");
  assert.equal(formatChartValue(0.4213, { suffix: "%", precision: 1 }), "0.4%");
  assert.equal(formatChartValue(1234, { compact: true, precision: 0 }), "1K");
  assert.equal(formatChartValue(1500, { locale: "de-DE", prefix: "$" }).length > 0, true);
});

test("a delta carries its sign and a percentage is a share", () => {
  assert.equal(formatDelta(0.124), "+12.4%");
  assert.equal(formatDelta(-0.031), "-3.1%");
  assert.equal(formatDelta(0), "0.0%");
  assert.equal(formatDelta(Number.NaN), "—");

  assert.equal(formatPercent(0.421), "42.1%");
  assert.equal(formatPercent(0.5), "50%");
  assert.equal(formatPercent(Number.NaN), "—");
});

/* ----------------------------------------------------------------- motion -- */

test("the stagger is capped so a long chart finishes on time", () => {
  // Uncapped, a 40-bar chart puts the last bar nearly a second behind the
  // first and the reader watches it fill in.
  assert.equal(staggerDelay(0, 45), "0ms");
  assert.equal(staggerDelay(1, 45), "45ms");
  assert.equal(staggerDelay(12, 45), "540ms");
  assert.equal(staggerDelay(39, 45), staggerDelay(12, 45));
  assert.equal(staggerDelay(-5, 45), "0ms");
});

test("plot height follows the width but stays readable", () => {
  assert.equal(resolveChartHeight(640, 2), 320);
  // A narrow card must not get a 320px chart, and a wide one must not get a
  // 2000px sliver.
  assert.equal(resolveChartHeight(200, 2), 180);
  assert.equal(resolveChartHeight(4000, 2), 420);
  // An absurd aspect is clamped before it is used, and the result is still
  // pulled back into the readable band rather than left at 80px.
  assert.equal(resolveChartHeight(640, 99), 180);
  assert.equal(resolveChartHeight(640, 0.01), 420);
});

/* ------------------------------------------------------------------ heatmap -- */

test("a sequential heat map domain is the extent, and a flat one still has height", () => {
  assert.deepEqual(resolveHeatDomain([4, 90, 22]), [4, 90]);
  // A pivot is meaningless on a sequential ramp, so it must not narrow the range.
  assert.deepEqual(resolveHeatDomain([4, 90], { pivot: 50 }), [4, 90]);
  // Every cell the same value: a zero-height domain divides by zero in the
  // bucket maths and sends all of them to the last, loudest band.
  assert.deepEqual(resolveHeatDomain([7, 7, 7]), [6.3, 7.7]);
  // A single reading is the flat case again.
  assert.deepEqual(resolveHeatDomain([0]), [-1, 1]);
  // Nothing at all must not come back as NaN, or every cell paints as the top
  // band and the chart looks full of data.
  assert.deepEqual(resolveHeatDomain([]), [0, 1]);
  assert.deepEqual(resolveHeatDomain([null, null]), [0, 1]);
  // An explicit domain is the escape hatch that makes two maps comparable.
  assert.deepEqual(resolveHeatDomain([4, 90], { domain: [0, 100] }), [0, 100]);
});

test("a diverging domain levels both arms against the pivot", () => {
  // The whole point: -10..200 would put zero 5% of the way in and crush every
  // negative into one band. Levelled, ±200 are the same distance from zero.
  assert.deepEqual(resolveHeatDomain([-10, 200], { scale: "diverging" }), [-200, 200]);
  // A non-zero pivot shifts the centre rather than splitting on zero.
  assert.deepEqual(resolveHeatDomain([10, 90], { scale: "diverging", pivot: 50 }), [10, 90]);
  // Everything on the pivot still has to land somewhere.
  assert.deepEqual(resolveHeatDomain([50, 50], { scale: "diverging", pivot: 50 }), [49, 51]);
});

test("a diverging ramp is always an odd number of bands, so the pivot has one", () => {
  assert.equal(heatSteps(5, "diverging"), 5);
  // With four there is no middle, so a value of exactly zero is painted as
  // strongly as one a quarter of the way up the arm.
  assert.equal(heatSteps(4, "diverging"), 5);
  assert.equal(heatSteps(2, "diverging"), 3);
  // A sequential ramp has no such requirement.
  assert.equal(heatSteps(4, "sequential"), 4);
  // Bounded: 40 bands is a gradient wearing a legend, and 0 is a division.
  assert.equal(heatSteps(40), 12);
  assert.equal(heatSteps(0), 1);
  assert.equal(heatSteps(-3), 1);
  assert.equal(heatSteps(Number.NaN), 5);
});

test("bands are half-open and the last one is closed at the top", () => {
  const domain = [0, 100] as const;
  assert.equal(heatBucketIndex(0, domain, 5), 0);
  assert.equal(heatBucketIndex(19.9, domain, 5), 0);
  assert.equal(heatBucketIndex(20, domain, 5), 1);
  assert.equal(heatBucketIndex(99, domain, 5), 4);
  // The maximum lands in the last band rather than one past the end, which is
  // what makes a cell's shade match the last swatch in the legend.
  assert.equal(heatBucketIndex(100, domain, 5), 4);
  // Out of domain is clamped, not wrapped.
  assert.equal(heatBucketIndex(-50, domain, 5), 0);
  assert.equal(heatBucketIndex(500, domain, 5), 4);
  // A degenerate domain cannot divide.
  assert.equal(heatBucketIndex(5, [5, 5], 5), 0);
});

test("the bands a legend prints are the bands the cells were bucketed into", () => {
  const domain = [0, 100] as const;
  assert.deepEqual(heatBucketRange(0, domain, 5), [0, 20]);
  assert.deepEqual(heatBucketRange(2, domain, 5), [40, 60]);
  assert.deepEqual(heatBucketRange(4, domain, 5), [80, 100]);
  // The ranges must tile the domain with no gap and no overlap, or the legend
  // is describing bands that do not exist.
  const covered = Array.from({ length: 5 }, (_, i) => heatBucketRange(i, domain, 5));
  assert.equal(covered[0]?.[0], domain[0]);
  assert.equal(covered[4]?.[1], domain[1]);
  for (let i = 1; i < covered.length; i += 1) {
    assert.equal(covered[i]?.[0], covered[i - 1]?.[1]);
  }
});

test("a sequential ramp climbs in strength from the first band to the last", () => {
  const domain = [0, 100] as const;
  const strengths = Array.from({ length: 5 }, (_, i) =>
    heatFill({ value: i * 20 + 10, domain, steps: 5 }).strength,
  );
  assert.equal(strengths[0], 0);
  assert.equal(strengths[4], 1);
  for (let i = 1; i < strengths.length; i += 1) {
    assert.ok((strengths[i] ?? 0) > (strengths[i - 1] ?? 0), `band ${i} is not stronger than ${i - 1}`);
  }
  // The floor is not the bare background: a lowest band with no tint is a cell
  // the reader cannot see is there at all.
  assert.match(heatFill({ value: 1, domain, steps: 5 }).color, /14%/);
  assert.match(heatFill({ value: 99, domain, steps: 5 }).color, /100%/);
});

test("a diverging ramp is neutral at the pivot and symmetric either side of it", () => {
  const domain = [-100, 100] as const;
  const options = { domain, steps: 5, scale: "diverging" as const };
  const pivot = heatFill({ ...options, value: 0 });
  assert.equal(pivot.strength, 0);
  assert.equal(pivot.color, "var(--background)");

  // ±20 are the same distance from zero and must be the same shade.
  const up = heatFill({ ...options, value: 20 });
  const down = heatFill({ ...options, value: -20 });
  assert.equal(up.strength, down.strength);
  assert.equal(up.color, down.color);

  // Just outside the neutral band the two arms must match in *strength* and
  // differ in *color* — equal magnitude, opposite sign. Matching strength alone
  // would make a diverging ramp a sequential one wearing two colours.
  const upOut = heatFill({ ...options, value: 40 });
  const downOut = heatFill({ ...options, value: -40 });
  assert.equal(upOut.strength, downOut.strength);
  assert.notEqual(upOut.color, downOut.color);
  assert.match(upOut.color, /data-1/);
  assert.match(downOut.color, /data-negative/);

  // With no colors named at all, the two arms must still differ. They used to
  // resolve to the same token when the caller omitted `negativeColor`, which
  // turned a diverging ramp into a sequential one and misstated the sign of
  // every negative cell.
  const bareUp = heatFill({ ...options, value: 40 });
  const bareDown = heatFill({ ...options, value: -40 });
  assert.notEqual(bareUp.color, bareDown.color);
  assert.notEqual(bareUp.base, bareDown.base);
  assert.equal(bareUp.strength, bareDown.strength);

  // The extremes are the strongest on both arms.
  assert.equal(heatFill({ ...options, value: 100 }).strength, 1);
  assert.equal(heatFill({ ...options, value: -100 }).strength, 1);
  // The arms use the two colors the caller named.
  assert.match(
    heatFill({ ...options, value: 100, color: "var(--success)" }).color,
    /var\(--success\)/,
  );
  assert.match(
    heatFill({ ...options, value: -100, negativeColor: "var(--destructive)" }).color,
    /var\(--destructive\)/,
  );

  // The neutral band is closed at both ends, not half-open. This is the whole
  // regression: `heatBucketIndex` is half-open so every value lands in exactly
  // one band, and on its own that puts -20 in the neutral band and +20 in the
  // first coloured one — equal distances from zero, two different magnitudes.
  assert.equal(heatFill({ ...options, value: -20 }).strength, 0);
  assert.equal(heatFill({ ...options, value: 20 }).strength, 0);
  assert.equal(heatFill({ ...options, value: -20.01 }).strength, 0.5);
  assert.equal(heatFill({ ...options, value: 20.01 }).strength, 0.5);
  // Past the neutral band the arms match again.
  assert.equal(
    heatFill({ ...options, value: -61 }).strength,
    heatFill({ ...options, value: 61 }).strength,
  );

  // A pinned, deliberately asymmetric domain centres the neutral band on the
  // midpoint — which is the number the printed scale shows, so the legend and
  // the cells cannot disagree with each other.
  const pinned = {
    domain: [-20, 180] as const,
    steps: 5,
    scale: "diverging" as const,
  };
  assert.equal(heatFill({ ...pinned, value: 80 }).strength, 0);
  assert.ok(heatFill({ ...pinned, value: 20 }).strength > 0);
  assert.ok(heatFill({ ...pinned, value: 140 }).strength > 0);
});

test("a sequential ramp spanning negative values is still sequential", () => {
  // The regression: a scale inferred from the domain's sign turns a revenue
  // heat map that happens to run from -5 to 5 into a diverging one, and a
  // reader sees "no change" where the data says "small negative".
  const sequential = heatFill({
    value: -5,
    domain: [-5, 5],
    steps: 5,
    scale: "sequential",
  });
  assert.equal(sequential.strength, 0);
  assert.notEqual(sequential.color, "var(--background)");
});

test("the ramp is mixed in oklch so lightness climbs the whole way", () => {
  const mixed = heatColorMix("var(--data-1)", 40);
  // sRGB interpolation between a light and a dark color dips *below* both ends
  // in perceived lightness, which is what makes an sRGB heat map's middle look
  // muddier than its own ends.
  assert.match(mixed, /^color-mix\(in oklch, var\(--data-1\) 40%, var\(--background\)\)$/);
  // The percentage is an integer, because "color-mix(... 33.33333% ...)" is
  // valid CSS nobody should be shipping.
  assert.match(heatColorMix("red", 33.333), / 33%,/);
  // And it is clamped, so an over-driven ramp cannot invert itself.
  assert.match(heatColorMix("red", 500), / 100%,/);
  assert.match(heatColorMix("red", -5), / 0%,/);
  // The fallback surface matters: a browser without color-mix has to leave the
  // custom property invalid at computed-value time, not absent from the rule.
  assert.match(mixed, /var\(--background\)/);
});

test("a cell is inset from its slot, and the gap cannot eat the cell", () => {
  const base = { columns: 4, rows: 3, x: 0, y: 0, width: 400, height: 300 };
  const cell = heatCellBox({ ...base, col: 1, row: 1, gap: 2 });
  // 100px cells with a 2px gap.
  assert.equal(cell.x, 101);
  assert.equal(cell.y, 101);
  assert.equal(cell.width, 98);
  assert.equal(cell.height, 98);

  // The regression this clamp exists for: an activity grid has 6px cells, and a
  // fixed 3px gap turns half of each one into background, so a dense chart
  // reads as a sparse dot field.
  const tiny = heatCellBox({
    ...base,
    columns: 60,
    rows: 7,
    width: 360,
    height: 56,
    col: 0,
    row: 0,
    gap: 3,
  });
  assert.ok(tiny.width >= 1, `a 6px cell left ${tiny.width}px of fill`);
  assert.ok(tiny.height >= 1, `a 8px cell left ${tiny.height}px of fill`);

  // The radius is held to half the shorter edge, or a small cell becomes a
  // circle and then a clipped one.
  assert.ok(tiny.radius <= Math.min(tiny.width, tiny.height) / 2);
  const rounded = heatCellBox({ ...base, col: 0, row: 0, gap: 0, radius: 3 });
  assert.equal(rounded.radius, 3);
  // A zero plot is not a division by zero.
  const degenerate = heatCellBox({ ...base, width: 0, height: 0, col: 0, row: 0 });
  assert.equal(degenerate.width, 0);
  assert.equal(degenerate.height, 0);
});

test("the heat map reveal runs across the corner, and it is capped", () => {
  // Columns alone sweep left to right, which reads as a progress bar.
  assert.equal(heatStaggerDelay(0, 0), "0ms");
  assert.equal(heatStaggerDelay(3, 2, 11), "55ms");
  assert.equal(heatStaggerDelay(2, 3, 11), "55ms");
  // A year of days is 64 diagonals deep; uncapped, the bottom-right cell would
  // start seven hundred milliseconds after the first.
  assert.equal(heatStaggerDelay(364, 364, 11), heatStaggerDelay(18, 18, 11));
  assert.equal(heatStaggerDelay(18, 0, 11), "198ms");
  assert.equal(heatStaggerDelay(-4, -4, 11), "0ms");
});

test("no number this engine emits carries more precision than a pixel can show", () => {
  // The regression: `Math.sin` and `Math.cos` are not required to be correctly
  // rounded, so Node's V8 and Chrome's V8 each land on a different double in the
  // last ulp. A pie label came out as `y="258.7870377302694"` on the server and
  // `258.78703773026933` in the browser — the same number, two spellings, which
  // React reports as a hydration mismatch and refuses to patch.
  //
  // So every coordinate the engine hands to the DOM is rounded to two decimals.
  // This test is the tripwire: it fails the moment someone adds a geometry
  // function that returns a raw double.
  const twoDecimals = (value: number) =>
    Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;

  // Sweep the whole circle, not one angle: a single sample can sit on a value
  // that happens to round cleanly.
  for (let degrees = 0; degrees < 360; degrees += 7) {
    const point = polarPoint(205.5, 120.25, 95.5833333, (degrees * Math.PI) / 180);
    assert.ok(twoDecimals(point.x), `polarPoint x at ${degrees}°: ${point.x}`);
    assert.ok(twoDecimals(point.y), `polarPoint y at ${degrees}°: ${point.y}`);
  }

  const geometry = arcGeometry({ outerRadius: 95.5833333, innerRadius: 36.2 });
  for (const [name, value] of Object.entries(geometry)) {
    assert.ok(twoDecimals(value), `arcGeometry.${name}: ${value}`);
  }

  // A 365-column activity grid: the case where unrounded output actually hurt,
  // writing thirteen decimal places into every one of 2,555 cells.
  const cell = heatCellBox({
    col: 364,
    row: 6,
    columns: 365,
    rows: 7,
    x: 48.3333333,
    y: 6.6666667,
    width: 1166.6666667,
    height: 168.5714286,
    gap: 3,
    radius: 2.5,
  });
  for (const [name, value] of Object.entries(cell)) {
    assert.ok(twoDecimals(value), `heatCellBox.${name}: ${value}`);
  }

  // ...and the rounding must not move a cell off its neighbour. Two adjacent
  // cells still tile without a seam or an overlap.
  const base = { columns: 7, rows: 4, x: 40, y: 6, width: 350, height: 100, gap: 2, radius: 3 };
  const a = heatCellBox({ ...base, col: 0, row: 0 });
  const b = heatCellBox({ ...base, col: 1, row: 0 });
  assert.ok(
    Math.abs(b.x - (a.x + a.width + 2)) < 1e-9,
    `rounded cells no longer tile: ${a.x}+${a.width}+2 != ${b.x}`,
  );
});
