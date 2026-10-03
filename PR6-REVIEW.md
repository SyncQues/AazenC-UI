# PR #6 — Review

**Branch** `ui/component_4` → `main` · **PR** "feat: add chart components, markdown viewer, segmented control, and metric card"
42 files, +13,674 / −18. Reviewed 2026-10-04.

---

## Baseline: everything green

Verified independently before reading a line of the diff:

```
pnpm check-types ......... clean
pnpm lint ................ clean (eslint --max-warnings 0)
pnpm test ................ 241 / 241 pass
node scripts/check-registry ... Registry covers 50 package exports.
gh pr checks 6 ........... Lint, Typecheck, Test, Build, Deploy Preview all pass
```

**The PR is green on every axis and still has three ship-blockers.** That is the
headline: nothing here is caught by lint, types, or the test suite, and one of
them is a one-character input that freezes the browser tab.

Findings marked **[lead-verified]** were reproduced by me directly from source,
independently of the reviewer that raised them.

---

## Blockers — fix before merge

### B1 — `parseMarkdown("-")` never returns; the tab freezes permanently **[lead-verified]**

`packages/ui/src/markdown-viewer-utils.ts:216-228` (predicate at `:243`)

The paragraph branch collects lines until one matches `startsNewBlock`. If the
**first** line already matches, the `while` breaks with `paragraph.length === 0`,
the `if (paragraph.length > 0)` guard pushes nothing, and `index` is never
advanced — so the enclosing `while (index < lines.length)` at `:134` spins
forever.

Of the seven predicates in `startsNewBlock`, six are consumed by an earlier
top-level branch (fence, heading, rule, quote, list). **`TABLE_DIVIDER` is the only
one with no top-level handler**: `readTable` returns `null` when the *next* line
is not a valid divider, so such a line falls through to the paragraph branch and
deadlocks.

Reproduced by me, one process per input, hard-killed at 4s:

```
"x"              -> RETURNED 0ms [{"kind":"paragraph",...}]
">"              -> RETURNED 0ms [{"kind":"quote",...}]
"-"              -> NEVER RETURNED (SIGKILL after 4s)  <-- INFINITE LOOP
"| - |"          -> NEVER RETURNED (SIGKILL after 4s)  <-- INFINITE LOOP
"--- | ---"      -> NEVER RETURNED (SIGKILL after 4s)  <-- INFINITE LOOP
```

A brute-force sweep over `[]-:# *>a1.` to length 5 found **308 distinct
single-line hanging shapes**.

`MarkdownViewer` calls `parseMarkdown` synchronously inside `useMemo`
(`markdown-viewer.tsx:84`) with no `try`/`catch` and no error boundary, so this
is a synchronous infinite loop on the main thread: the tab becomes unresponsive
and no timeout, effect, or error boundary can intervene. Reachable from an empty
table divider, a YAML front-matter delimiter, a diff, or an ASCII diagram — and
this is precisely the input class the file advertises at `:5-8` ("a model
response, a pasted comment, a README from a fork").

**Fix:** advance `index` (or push the line) when the paragraph loop makes no
progress. One line.

### B2 — four of six chart series colours are invisible in Mono dark **[lead-verified]**

`packages/themes/src/mono.css:36-41`

`mono.css` re-ladders `--data-1..5` to oklch L 0.36–0.74 — and defines them
**only** inside the light block. I confirmed by grep that `:root[data-theme="mono"].dark`
(`:69-120`) never restates them, so the light ladder is what renders in dark mode.
That breaks the invariant `base.css:96-107` establishes — *"Every value sits at
oklch L 58% because the palette has to clear 3:1 against near-white **and**
near-black at the same time"* — in both directions.

Measured against `--card` (the surface charts actually render on,
`chart-variants.ts:15`):

| slot | light / card | dark / card |
|---|---|---|
| `--data-1` | 5.51:1 | 3.55:1 |
| `--data-2` | 3.36:1 | 5.81:1 |
| `--data-3` | 7.77:1 | **2.52:1 ✗** |
| `--data-4` | **2.31:1 ✗** | 8.47:1 |
| `--data-5` | 10.86:1 | **1.80:1 ✗** |
| `--data-negative` | 10.01:1 | **1.95:1 ✗** |

WCAG 1.4.11 floor for graphical objects is 3:1. In Mono Basic dark, series 3, 5
and the diverging down-arm are not dim — they are gone.

**Fix:** a dark `--data-*` set (stepped the way `--destructive` steps 0.45→0.55),
plus re-tuning light `--data-2`/`--data-4` inward.

### B3 — horizontal bar charts resolve the pointer against the wrong axis **[lead-verified]**

`packages/ui/src/bar-chart.tsx:489-491`, with `packages/ui/src/chart-primitives.tsx:517-519`

`useChartPointer` is strictly one-dimensional: `findIndex` matches
`event.clientX - bounds.left` against `centers`, which the signature documents as
*"Pixel position of each value, left to right."*

For `orientation="horizontal"` the band scale runs down the plot
(`createBandScale(..., [plotTop, plotBottom], 0.28)`, `bar-chart.tsx:378-382`), so
`geometry.centers` are **y**-coordinates (`bar-chart.tsx:470`) — matched against
the pointer's **x**. A reader pointing at the value end of a bar gets another
series' number or no tooltip at all:

```
centers (y): [32.4, 81.2, 130, 178.8, 227.6]   slack = 24.40
Alpha   (x=247.3, y=32.4)  -> selected index 4    wrong bar
Bravo   (x=434.7, y=81.2)  -> selected index -1   no tooltip
Charlie (x=622.0, y=130.0) -> selected index -1   no tooltip
Delta   (x=341.0, y=178.8) -> selected index -1   no tooltip
Echo    (x=528.3, y=227.6) -> selected index -1   no tooltip
```

The tooltip, the dim-others highlight, **and** `aria-valuenow`/`aria-valuetext`
all name a row the reader is not pointing at. Keyboard arrows are index-based and
stay correct, so it is purely the pointer/ARIA path — but it is the path the
README markets.

Fix: give the hook an `axis`/`orientation` option, or project the pointer's other
coordinate. Note that **the only playground snippet that demos horizontal bars is
the snippet that does not compile** (M16) — so nothing in the shipped demo
exercises this.

---

## Majors

### The two `void` statements — behaviour stubbed out after the signature promised it

### M1 — keyboard navigation throws away the pixel values it is handed **[lead-verified]**

`packages/ui/src/chart-primitives.tsx:562`, with `:581-583`

`useChartPointer` accepts a `values` option (`:465`); `line-chart.tsx:317` and
`area-chart.tsx:421` populate it with real pixel y-coordinates. The hook then does:

```ts
void values;                                                   // :583
setPointer({ index: next, x: center ?? 0, y: 0 });             // :562
```

Both consumers read `pointer.y` directly — the crosshair dot at
`chart-primitives.tsx:682` (`cy={pointer.y}`) and the bar-chart tooltip anchor at
`bar-chart.tsx:642` (`y={pointer.y}`). I confirmed both by reading them.

A keyboard user tabs to a line/area/bar chart and presses ArrowRight: the
crosshair rule and the readout advance correctly in x, but the active dot renders
at `cy="0"` — pinned to the top edge, up to 300px from the reading it marks.

**Fix:** `y: valuesRef.current?.[next] ?? 0`, with `values` in a ref beside `centersRef`.

### M2 — tooltips report `0` for cells the engine deliberately drew as gaps

`packages/ui/src/chart-primitives.tsx:1012`

The geometry pipeline coerces through `toFiniteNumber` (`chart-utils.ts:209`),
whose whole contract is "`null`, `""`, `NaN` → gap". `buildTooltipRows` instead
does `typeof raw === "number" ? raw : Number(raw)`, and `Number("")`,
`Number("   ")`, `Number(false)` and `Number([])` are all `0`, `Number(true)` is `1`.

```
"" (empty string)  {"engine_draws":"GAP", "tooltip":"row value=0"}
"   " (whitespace) {"engine_draws":"GAP", "tooltip":"row value=0"}
true  (boolean)    {"engine_draws":"GAP", "tooltip":"row value=1"}
[] (empty array)   {"engine_draws":"GAP", "tooltip":"row value=0"}
```

So an API returning `{ month: "2024-03", revenue: "" }` draws a visible hole and
then labels that hole **"revenue 0"** — the exact class of lie `heat-map.tsx:16-18`
names as "the most common way a heat map lies", reproduced in line/bar/area.
Note this helper is the second `void` scar: it takes `options: ChartFormatOptions`
and does `void options;` at `:1020`.

**Fix:** `const value = toFiniteNumber(raw); if (value === null) continue;`

### The stack math was written twice — and each copy lost a fix the other has

`area-chart.tsx:138-155` and `bar-chart.tsx:322-327, 404-431`

### M3 — a negative series in a stacked area chart is painted on top of the positive band **[lead-verified]**

`bar-chart.tsx:322-327` keeps **separate** positive and negative cursors, with the
reason written down: *"a loss below the axis never pushes a win above it away
from zero."* `area-chart.tsx` has no equivalent — `computeStacks` uses one
`running` cursor (`:138`), so `top = base + value` folds the negative back down
through the band beneath it.

```
stacked AreaChart, win=[10,12] loss=[-4,-6]
  series#0  bottoms=[0,0]    tops=[10,12]
  series#1  bottoms=[10,12]  tops=[6,6]     <-- loss band at 6..10, inside series#0
domain from extents: [0, 12.5]             <-- never below zero
```

The reader sees a 0→10 band with a differently-coloured 6→10 chunk over it and no
negative axis region at all — the loss is invisible. The playground demo stacks
`revenue` against `refunds`, so it ships reachable.

### M4 — every segment of a stacked bar gets rounded, which is the "string of pills" the comment forbids **[lead-verified]**

`bar-chart.tsx:404-431`. The comment at `:401-403` is explicit: *"The segment that
ends the stack in its direction is the only one that gets the radius. A radius on
every segment turns a stack into a string of pills."*

```ts
const positiveEnds = new Set<number>();                     // :404
for (const segment of segments) {
  if (segment.value >= 0) positiveEnds.add(segment.seriesIndex);   // :407  every one
  else negativeEnds.add(segment.seriesIndex);
}
const ends = segment.value >= 0
  ? positiveEnds.has(segment.seriesIndex) : ...             // :423-426  always true
const corner = segment.value >= 0 && ends ? radius : 0;     // :431
```

The set collects *every* positive series index, so `ends` is unconditionally true
and every joint shows a notch. The running cursor the code already computes is
the correct input; the per-segment set is not. Both M3 and M4 are the same
argument for extracting the stack arithmetic into `chart-utils.ts` once.

### M5 — `resolveDomain` and `linearTicks` compute different tick steps

`packages/ui/src/chart-utils.ts:310` and `:336`

`resolveDomain` rounds the domain out with `step = niceCeil((max-min)/tickCount)`;
`linearTicks` discards that step and recomputes `niceCeil(span/count)` from the
*already rounded* span. They agree only when `k` divides evenly, contradicting the
JSDoc at `:320-330` (*"Both functions stepping the same way is what makes the axis
and the data agree"*).

A 3-point line chart of `[3, 13, 8]` (`zeroBaseline:false`, `TICK_COUNT = 5`):

```
resolveDomain    -> [2,14]
linearTicks(.,5) -> [0, 2.5, 5, 7.5, 10, 12.5, 15]      6 intervals, not 5
  tick 0   -> y=245.33   below the plot, collides with category labels
  tick 15  -> y=-4.67    above the SVG top edge, clipped away
```

Rate of out-of-domain ticks over signed random data: **line 26.6%, area 26.9%**.
`ChartAxis` renders every tick with no bounds check, so labels are clipped.

The repo already half-knows this — `bar-chart.tsx:143-152` ships `roundTickCount()`
whose comment names the defect. The mitigation is **partial**: with signed values
(it explicitly supports them, `:318-331`) the axis still disagrees on 1.4–12.2%
depending on tick count. The two charts with no such guard are `line-chart.tsx:271`
and `area-chart.tsx:355`.

Test gap: `chart-utils.test.mts:229-231, 251-252` assert `ticks[0] === domain[0]`
on five hand-picked datasets that all happen to produce `k = 5` — the invariant is
asserted only where it holds.

### M6 — `ChartContainer` state blocks ignore the `padding` prop

`packages/ui/src/chart-container.tsx:569` (with `:179, 232, 285, 502`)

The body is handed `padding="none"` whenever `state !== "ready"`, and each state
block then renders `chartStateVariants({size})` — a variant set with no padding
axis at all. The comment at `:566-568` claims the opposite: *"the dashed frame's
content then lands exactly where the plot's content would have."* It holds only
for `padding="lg"`.

```
padding = sm
  ready   body: … flex-1 pt-4 px-4 pb-4 …
  loading body: … flex-1 p-0
  loading state: … min-h-[12rem] p-6 …
padding = lg
  ready   body: … flex-1 pt-6 px-6 pb-6 …   (the only padding that works)
```

So `<ChartContainer padding="sm">` shifts its content 8px on every load, and with
`padding="none"` the full 24px — in a file whose header (`:17-19`) calls reflow
*"the most common complaint about dashboards, and it is free to avoid here."*
Separately, `stateSize` is pinned to `"md"` → a fixed `min-h-[12rem]` (192px)
regardless of the plot, so a 320px plot grows the card by 128px on load.

### M7 — the line and area live regions are not gated on focus

`packages/ui/src/line-chart.tsx:600`, `packages/ui/src/area-chart.tsx:666`

`bar-chart.tsx:647-654` and `pie-chart.tsx:458-462` both carry the identical
guard, with the reasoning written down: *"A live region that fires on every pointer
move talks over a screen reader user who is also driving a mouse."* Line and area
render `<ChartLiveRegion message={readout(activeIndex)} />` unconditionally, and
the readout returns the full label/value list — sweeping the mouse across a
12-point, 3-series line chart queues ~36 announcements. `focused` is already
returned by the hook.

### M8 — the pie's focus surface has no role, name, or value

`packages/ui/src/pie-chart.tsx:318-362`

`grep -n "role=\|aria-" pie-chart.tsx` returns exactly two hits, both
`aria-hidden` on the slice group. The tabbable `div` (`:324`, `tabIndex={0}` plus
`onKeyDown`) carries no semantics, so a screen reader tabs to an unlabelled stop,
and when `onSliceClick` is supplied nothing announces it as activatable. The three
cartesian charts all get `role="slider"` + `aria-label` + `aria-valuemin/max/now`
+ `aria-valuetext` from `ChartInteractionSurface`
(`chart-primitives.tsx:625-641`).

### M9 — the segmented control can end up with zero tab stops **[lead-verified]**

`packages/ui/src/segmented-control.tsx:254-256`

```ts
tabIndex={index === (selectedIndex === -1 ? fallbackIndex : selectedIndex) ? 0 : -1}
```

If the **active** option is `disabled`, it receives `tabIndex={0}` — but a natively
`disabled` button is unfocusable — and every other option is `-1`. The entire
radiogroup becomes unreachable by keyboard, which APG forbids (exactly one
tabbable member is required).

```
selected option becomes disabled  rovingIndex=1  tabStops=0  [day:-1 week:0(disabled) month:-1]
defaultValue points at a disabled option  rovingIndex=1  tabStops=0
normal selection                   rovingIndex=1  tabStops=1
```

Triggers: controlled `value` naming a now-disabled option (restoring a saved
preference), `defaultValue` naming one, or an option flipping to `disabled` while
selected. **Fix:**
`const roving = (selectedIndex !== -1 && !options[selectedIndex]?.disabled) ? selectedIndex : fallbackIndex;`

### M10 — `{...props}` silently replaces `MetricCard`'s own keyboard activation

`packages/ui/src/metric-card.tsx:379` (with `:384`, type at `:274`)

`onKeyDown={asChild ? undefined : handleKeyDown}` is written **before** `{...props}`,
and `MetricCardProps` only omits `"className" | "children" | "onClick"` — so
`onKeyDown` survives into the public type. A caller passing `onKeyDown`
(analytics, a global shortcut, `stopPropagation`) overwrites the handler, and the
`role="button" tabIndex={0}` div stops responding to Enter and Space while still
looking and focusing like a button. WCAG 2.1.1.

Fix: chain instead of override, or omit `onKeyDown` from the props type.

### M11 — `onValueChange` fires on unchanged values

`packages/ui/src/segmented-control.tsx:142-148`

```ts
const select = useCallback((next: T) => {
  if (!controlled) setUncontrolled(next);
  onValueChange?.(next);          // no `if (next === active) return`
}, [controlled, onValueChange]);
```

Re-clicking the already-selected segment calls `onValueChange` with an identical
value. The documented use cases are exactly the ones this hurts — *"the state row
on a chart storyboard, the curve picker, the range filter"* — wired to
`router.replace` / `setSearchParams` / a refetching effect, a re-click re-pushes
the URL and re-runs the effect. Radix `ToggleGroup`/`Select` and the React
controlled-`onChange` contract both suppress no-ops.

### M12 — the segmented-control option stagger is a silent no-op **[lead-verified]**

`packages/animations/src/utilities.css:472`, applied at `packages/ui/src/segmented-control.tsx:263`

The utility compiles to a **child** selector:

```css
.segmented-items-in > [data-slot="segmented-control-item"] { animation: segmented-item-in … }
```

but `segmentedControlItemsInClass` is applied to the `<button>` itself
(`segmented-control.tsx:262-265`); the track gets `segmentedControlVariants(...)`
(`:235`). A `<button>` has no element children, so **nothing matches** —
`segmented-item-in` never runs, and its reduced-motion guard can never match
either.

The CSS comment at `:466-471` — *"The mark is also a child of the track, so the
first option is the track's **second** child"* — is only true if the class sits on
the track, which proves the intent. **One-line fix:** move the class to `:235`.

The existing test (`segmented-control.test.mts:72-102`) reads the CSS *source*,
not the rendered DOM, which is why 241/241 stays green.

### M13 — `stroke-dasharray: revert` deletes the pie's own dash

`packages/animations/src/utilities.css:693-695`

The comment states *"a slice must not be left collapsed to `0 1000` — drop the
animation and the dash stays as set."* `revert` rolls back to the previous cascade
**origin**, discarding author-origin declarations including the SVG presentation
attribute — so `strokeDasharray`/`strokeDashoffset`
(`pie-chart.tsx:387-388`) revert to `none`/`0` and **every slice paints its full
circumference**. Stacked in order, the pie becomes a solid disc in the last
slice's colour. `animation: none !important` at `:667` already cancels the
animation, so `revert` adds nothing but the damage.

Inside the repo this is masked one tick later by `!reduced && "chart-arc-in"`
(`pie-chart.tsx:395`) once `usePrefersReducedMotion`'s effect fires — so it is a
wrong-first-paint flash for exactly the audience the block exists for, and a
permanent wrong render for any direct consumer of the exported `chart-arc-in`
utility. Use `unset`, or drop the rule.

### M14 — Firefox 111/112 render every heat-map cell black

`packages/animations/src/utilities.css:437-448`

The comment claims the `var()` fallback *"still applies and the cells come out in
the flat base token instead of in nothing."* It cannot: a `var()` fallback only
fires when the custom property is **undefined**, and here `--heat-fill` *is*
defined (inline, `heat-map.tsx:802`). `color-mix()` shipped in **Firefox 113**
while `package.json:24-29` claims `firefox >= 111`. On FF 111/112 the substituted
value is invalid-at-computed-value-time → `fill` becomes `unset` → inherited →
SVG initial `black`. **The whole heat map renders black.** Lightning CSS emitted no
`@supports` wrapper because the mix is a runtime value.

Fix: an `@supports (color: color-mix(in lab, red, red))` pair, or raise the floor
to `firefox >= 113` (which also fixes N2).

### M15 — the "missing reading" cell is not a perceivable graphical object

`packages/animations/src/utilities.css:446-448` (markup `heat-map.tsx:792-794`)

The claim at `heat-map.tsx:792-794` is that *"the dashed outline is what says 'no
reading' rather than 'a reading of nothing'."* The dash is the only signal and it
is invisible against its own fill, which is invisible against the plot:

| theme | fill vs dashed outline | fill vs card |
|---|---|---|
| slate light | 1.25:1 | 1.10:1 |
| slate dark | 1.18:1 | 1.06:1 |
| mono light | 1.31:1 | 1.16:1 |
| mono dark | **1.03:1** | **1.03:1** |

1.03:1 in mono dark means a "missing" cell is pixel-identical to the plot. Needs a
token at real contrast (`--muted-foreground` or a dedicated `--data-missing`).

### M16 — the `charts` example snippet does not compile **[lead-verified]**

`apps/playground/lib/examples/components.ts:732`

The snippet declares `revenue` (`:702-706`) and then renders
`<BarChart data={team} xKey="name" series={[{key:"headcount"}]} … />` with no
`team` in scope. Extracted and typechecked against the real `packages/ui/src`:

```
charts.tsx(37,17): error TS2304: Cannot find name 'team'.
```

This is the only executable documentation for four of the nine new components, and
`ExampleCode` only ever prints the string — nothing in CI compiles it, so it ships
silently. Every other prop in all five new snippets typechecks clean.

Recommend adding snippet typechecking to `pnpm check-types`: the registry is the
contract, but the snippet is what gets copy-pasted.

### M17 — the markdown parser has no depth budget

`packages/ui/src/markdown-viewer-utils.ts:198` and `:445-447`

`parseBlocks` recurses per blockquote level and per list-item level with no cap,
and `markdown-viewer.tsx:84` does not guard the call:

```
">".repeat(8000) + " x"          RangeError: Maximum call stack size exceeded   (8 KB input)
"* ".repeat(5000) + "x"          RangeError                                     (10 KB input)
3000-level indented list          6.8 s, then throws at ~4000
```

A thrown `RangeError` during render propagates to the nearest error boundary —
there is none — so one pathological document blanks the view. Related: unterminated
`[` gives clean quadratic blowup (`"["×64000` = 3.4 s of blocked main thread,
4× per doubling), and nested list continuation lines are re-sliced at `:411`/`:424`
making them super-quadratic (4000 levels = 16 s).

Fix: a depth budget in `parseBlocks` plus a `try`/`catch` fallback to plain text
in `markdown-viewer.tsx` closes B1's whole family cheaply.

### M18 — heading `id`s collide across nested blocks

`packages/ui/src/markdown-viewer-utils.ts:131`

`usedIds` is allocated *inside* `parseBlocks`, so each list item and blockquote
gets a fresh namespace. The comment at `:120-123` promises *"Heading ids are
unique within one call"* — true only at the top level. `markdown-viewer.tsx:111`
emits them, so duplicates reach the DOM:

```
two top-level headings     -> ["setup","setup-1"]    correct
top-level + one in a list -> ["setup","setup"]      "setup" twice
three sibling list items  -> ["install","install","install"]
```

A same-document `[jump](#setup)` becomes non-deterministic. Thread `usedIds` down
through the recursive calls.

---

## Minors

| | Where | Finding |
|---|---|---|
| N1 | `chart-utils.ts:311-313` | Dead ternary — both arms are byte-identical, so `zeroBaseline` has no effect on the lower-bound rounding. Defect signal in the one function M5 depends on. |
| N2 | `utilities.css:399-408` | `chart-shimmer` fallback is ~20× intended strength on FF 111/112: Lightning CSS downlevels `color-mix` to bare `var(--foreground)` (slate light **20.17:1**, dark 17.02:1). Same root cause as M14. |
| N3 | `chart-utils.ts:1113` | `heatSteps` returns 13 for `steps=12, scale="diverging"`, breaking its own documented `Math.min(12, …)` clamp — the odd-band fix-up returns `safe + 1` without re-clamping. Renders 13 legend swatches. |
| N4 | `chart-utils.ts:1132` | `heatBucketIndex`/`heatFill` emit `color-mix(… NaN% …)` for non-finite input. `clamp(NaN,0,1)` is `NaN`, so `Math.min(count-1, NaN)` is `NaN`. Not reachable through `HeatMap` today, but these are exported and their contract says non-finite is a gap. |
| N5 | `chart-utils.ts:894-901` | `formatChartValue` picks the compact unit *before* rounding, so `999999.9` → **`"1000.0K"`**. |
| N6 | `chart-utils.ts:758-760` | "Every number this engine hands to the DOM goes through `round`" is false for `linearTicks` and `createBandScale` (measured: `linearTicks` produced >2dp in 714/200000 random domains). The "tripwire" test only samples the three functions that *do* round. |
| N7 | `chart-utils.ts:397` | `createBandScale` silently produces zero-width bands for a reversed range (`total = Math.max(0, r1-r0)`), while `createLinearScale` documents "an inverted range is legal". Latent. |
| N8 | `chart-utils.ts:292, 1081` | `Math.min(...finite)` throws above ~124k values — `RangeError` during render from an exported API. A `reduce` costs nothing. |
| N9 | `utilities.css:511-519` | `chart-series-line`/`chart-series-area` are defined but never used anywhere, and `chart-crosshair`'s `transform`/`opacity` transition can never fire (children move via `cx`/`cy` **attributes**). Consequence: `chart-draw-in`'s comment says *"data updates fade instead"* — they hard-cut. |
| N10 | `utilities.css:596-669` | Five new classes are the only ones absent from the reduced-motion block: `chart-crosshair`, `chart-series-line`, `chart-series-area`, `chart-mark`, `chart-grid-line`. `chart-mark`'s hover dimming and a 300ms `d` morph are not user-initiated motion. |
| N11 | `utilities.css:429-435` / `keyframes.css:367-368` | `will-change: transform, opacity` on **every** heat cell — a 365-column grid is 2,555 `<rect>`s each promoted to a compositor layer, never released. And the *"every one of these animates a property the compositor owns"* claim is false for 2 of 17 keyframes: `background-position` (chart-shimmer) and `stroke-dasharray` (chart-arc-in) both force paint every frame. |
| N12 | `utilities.css:347-350`, `keyframes.css:369-370` | The "growing clip" that is supposed to mask the drawn line **does not exist** — `grep clipPath\|mask=` over line/area charts returns nothing. Stated mitigation for the 720ms draw is absent. |
| N13 | `chart-primitives.tsx:529` | `ChartContainer` renders the hoisted body as a bare array → React logs *"Each child in a list should have a unique key prop"* for the standard call shape, reproduced through the repo's own React 19.2.3. |
| N14 | `heat-map.tsx:229-230` | `locate()` divides by `cellWidth`/`cellHeight` with no zero guard and `0/0 = NaN` passes every range check, so `onCellChange(0, NaN)` is reachable at `height={20}`. The codebase guards this correctly elsewhere (`bar-chart.tsx:492-494` has the same unguarded-callback-in-deps shape). |
| N15 | `chart-primitives.tsx:1041`, `chart-utils.ts:905` | Every chart's `sr-only` data table is server-rendered with the host's default locale, so any other locale hits a hydration text mismatch on every number. Demonstrated: `LANG=de_DE` → `1.234.567` vs `en_US` → `1,234,567`. |
| N16 | `chart-primitives.tsx:740-741` | `ChartTooltip` allocates a fresh `{width, height}` object on every pointer move, forcing a second render per pointer event on a tree the code itself calls byte-sensitive. |
| N17 | `heat-map.tsx:635` | Cell keys join row and column labels with an unescaped `-`: `('Mon-Tue','X')` and `('Mon','Tue-X')` both produce `Mon-Tue-X`. |
| N18 | `segmented-control-variants.ts:184` | `will-change-transform,opacity` is one comma-joined token Tailwind cannot parse — **the mark gets no `will-change` at all** (`will-change-opacity` does not exist in v4; `will-change-[transform,opacity]` does). Verified through a real Tailwind compile. |
| N19 | `metric-card.tsx:474-497` | A non-finite `change` renders a blank trend row while the value renders "—". |
| N20 | `chart-utils.ts` `formatDelta` | `change={-0.0004}` prints **`"-0.0%"` with a red down-arrow**; `0.00004` prints `"+0.0%"` green. `resolveTrend` only calls exactly `0` flat. |
| N21 | `segmented-control.tsx:167-175` | The mark goes stale when an option's *width* changes without a track resize — the `MutationObserver` omits `characterData`, and React updates a string label via `node.nodeValue`. Latent while the track is `w-max`; real once a caller merges `w-full`, which `:46-50` invites. |
| N22 | `metric-card.tsx:260` | `precision` is documented on `MetricCardTrendProps` but unreachable through `MetricCard` (no `precision` prop, not forwarded). |
| N23 | `pie-chart.tsx:9-12` | "The reveal runs on the compositor" is false — `stroke-dasharray` is not compositable. Compounded by an inert `will-change: stroke-dasharray` at `utilities.css:383`. |
| N24 | `bar-chart.tsx:552, 558` | `{...props}` is spread after `ref={frameRef}`, and `BarChartProps` only omits `className`, so a caller-supplied `ref` silently disables the ResizeObserver — the chart falls back to 640px. Only bar has this collision; the other three measure an inner div. |
| N25 | `bar-chart.tsx:68-94` | `BarChart` lacks `yKey`, `grid`, `hiddenSeries`, `onLegendClick` and `formatAxis`, all of which line and area expose — so its legend is permanently non-interactive and the two "one-series" charts differ. Also fires `onHoverIndexChange(-1)` on mount (`:494`), which area/line guard against with a `reportedIndex` ref. |
| N26 | `bar-chart.tsx:535`, `pie-chart.tsx:380` | Empty states collapse (`min-h-[12rem]`, no dashed frame) where area/line reserve plot height — bar and pie reflow ~88px when data lands, and the four charts show two different empty treatments. |
| N27 | `bar-chart.tsx:330`, `pie-chart.tsx:380`, `line-chart.tsx:479` | React keys built from user-supplied labels; duplicate categories/slices produce duplicate keys (`['Organic','Organic','Paid']`). |
| N28 | `markdown-viewer.tsx:282-290` | Link `title` is parsed, typed, and unit-tested, then silently never rendered — while the image path does render it. |
| N29 | `markdown-viewer.tsx:174` | The table scroll container is `overflow-x-auto` with no `tabIndex`/`role`, so a wide table is mouse-only (WCAG 2.1.1). The shipped `code-block.tsx:72-76` already does `tabIndex={0} aria-label="Code"` — match it. |
| N30 | `markdown-viewer-utils.ts:14` | The documented "setext headings stay plain text" contract is violated whenever the text contains a pipe: `parseMarkdown("Some | text\n---")` yields a zero-row table. Same for blockquotes. |
| N31 | `docs/missing_comp.md:36-41` | **[lead-verified]** Six components this PR actually ports — Chart Container, Area Chart, Bar Chart, Line Chart, Pie Chart, Metric Card — are still listed as *missing*. The file has an established `✅` convention for exactly this (`:30, :31, :22-24`). This PR updated `component.md` but not this one. |
| N32 | `component.md` | `segmented-control` — also newly shipped, in the registry, the `exports` map, and the playground — has no checklist entry at all (`grep -in "segment" component.md` → nothing). |
| N33 | `apps/playground/app/sitemap.ts:41` | `charts`, `heat-map` and `metric-card` are linked from the component index and served by `[slug]/page.tsx`, but missing from `componentSlugs` — the three heaviest new pages are the ones crawlers can't discover directly. |
| N34 | `apps/registry/registry.json:1312` | `markdown-viewer` declares no `dependencies`, yet its own shipped `markdown-viewer-variants.ts` imports `class-variance-authority`. It resolves today only because the `separator` registryDependency happens to declare cva; `missingDependencies()` (`packages/cli/src/lib/install.ts:63-77`) reads only `item.dependencies`. |
| N35 | `apps/playground/app/layout.tsx:21` | Playfair Display is declared `weight: "100 900"` but the shipped woff2 covers **400–900** (decoded with fontTools: `wght` axis 400.0→400.0→900.0). Inter's `100 900` is correct. |
| N36 | `chart-utils.ts:157` | A file shipped into end-user projects reads bare `process.env.NODE_ENV` — a type error (`TS2580`) in any project without `@types/node`, i.e. most Vite users. It is the only `process.env` reference in `packages/*/src`. |

---

## Nits

- `segmented-control.tsx:230` vs `:236` — `aria-label={label ?? props["aria-label"]}` is computed then `{...props}` re-writes it, so a caller's `aria-label` beats the `label` prop, inverting the documented precedence.
- `metric-card.tsx:89` — `interactive` alone adds a `focus-visible:ring-[3px]` that can never render, since `tabIndex` is `undefined` unless `onClick`/`asChild`.
- `chart-utils.ts:837-848` — `arcLabelPoint`'s documented default `inset = 0.82` puts the label *inside* the slice on the coloured fill; the JSDoc says "just outside the outer edge". Every caller passes an explicit inset, so nothing renders wrong today.
- `chart-utils.ts:195` — `resolveChartPalette(undefined, NaN)` returns `[]` but `count: Infinity` throws `RangeError: Invalid array length`; both unvalidated on an otherwise defensive API.
- `chart-utils.test.mts:561` — `assert.equal(formatChartValue(...).length > 0, true)` is vacuous: every string satisfies it. The value under test is `"$1.500"`.
- `chart-variants.test.mts:94` — `assert.doesNotMatch(classes(...), /horizontal|both/)` can never fail; all three `style` values map to `""`.
- `heat-map.tsx:723` — `columns={[yKey, …columns]}` puts the raw prop name in the accessible table's first `<th>`, so `yKey="team_id"` ships `team_id` to the screen reader.
- `markdown-viewer-utils.ts:66` — `HEADING`'s `(.+?)[ \t]*#*[ \t]*$` lets `#*` eat content: `parseMarkdown("### ###")` yields text `"#"`.
- `globals.css:56-61` — the six `--color-data-*` mappings emit no CSS at all: nothing uses a `*-data-N` utility, and every consumer goes through the raw `var(--data-N)` string. Forward-looking API, not a live one.
- `base.css:105-107` — the "adjacent slots ≥103.7°" argument covers 1↔2, 3↔4, 4↔5 but not the three-series case it names: 1↔3 is **44.1°**, the closest pair in the palette.

---

## PR hygiene

- **`382f3e9` is reverted by `7a287aa`** in the same PR — a net-zero CI change costing two commits. Squash-merge clears it.
- **`5ac318e` ("update import path for routes types in next-env.d.ts") is also net-zero** — the diff of that file against `main` is empty, because `next build` regenerated it. Both the commit and the tracking of this generated file (which imports `./.next/types/routes.d.ts`) are worth a second look; CI is green either way.
- **The PR body says "Corresponding tests and preview components."** Tests exist for `chart-utils`, `chart-variants`, `markdown-viewer`, `metric-card` and `segmented-control`. The seven chart `.tsx` files — **~5,300 lines** — have neither a `*-utils.ts` nor a test. Per the PR4 precedent, pure logic belongs in `*-utils.ts` where the harness can reach it, and there is a lot of it: `computeStacks` (M3), `buildBandPath`, `roundTickCount`, `sliceAt`, `rowGutterWidth`, `cellAt`, `buildTooltipRows` (M2), `splitChartContainerChildren`, `rendersNothing`, `isChartContainerFooter`, `partOf`, `resolveErrorMessage`. This is the single highest-leverage structural change in the PR, and **M3 and M4 are direct evidence for it** — the stack arithmetic written twice lost a fix each time.
- **`component.md:222-226` claims the charts are "keyboard and screen-reader readable."** M1, M7 and M8 are where that claim does not yet hold.

---

## What is genuinely good

Worth stating plainly, because it is most of the diff:

- **The palette discipline holds.** `--data-N` is mode- and theme-independent by construction; nothing reaches `--chart-N`. No hardcoded colour anywhere in the four chart components — the only literal is the `var(--data-1)` crosshair fallback.
- **The markdown viewer's security posture is sound.** There is no `dangerouslySetInnerHTML` anywhere in `packages/ui` — the tree-of-nodes design means there is no sink to attack. I independently ran 12 XSS payloads against `safeHref`: all real vectors blocked, including `java<TAB>script:`, `java\nscript:`, NUL-prefixed, mixed-case, and `data:image/svg+xml`. A reviewer cross-checked 22 obfuscation spellings against Node's WHATWG URL parser: 0 escaped.
- **The pie genuinely dodges the classic arc traps** — single-slice and full-circle produce no NaN, sum-zero renders the empty state rather than dividing by zero.
- **Reduced motion is comprehensive** — all 17 new keyframes map to a utility in the `@media (prefers-reduced-motion: reduce)` block, and it wins on layer order rather than by accident.
- **Monotone interpolation does not overshoot** — worst excursion beyond the data's own min/max measured 0.0000 across eight adversarial shapes.
- **The registry is genuinely in three-way parity** (`exports` ↔ `registry.json` ↔ `index.ts`). A reviewer installed all nine components through the real CLI into scratch projects and typechecked every result — a stronger guarantee than `check-registry.mjs` provides.
- **The fonts are legitimate** variable woff2s, decoded cleanly, real `fvar` axes, with `display: "swap"` and metric-adjusted fallbacks preserved from the `next/font/google` version.
- **No secrets, no TODOs, no `eslint-disable`, no `console.log`** in any changed text file.

---

## Suggested fix order

1. **B1** — `index += 1` on no paragraph progress (one line, one frozen tab)
2. **B3** — axis option on `useChartPointer`
3. **B2** — dark `--data-*` set for `mono.css`
4. **M1, M9, M10** — the three keyboard/ARIA defects (each a few lines)
5. **M3, M4** — extract the stack arithmetic to `chart-utils.ts` once
6. **M12, M13, M14, M15** — the four animation/token defects
7. **M2, M5, M16, M17, M18** — correctness and docs
8. **PR hygiene** — squash away the revert pair, extend `component.md` and `docs/missing_comp.md`

---

## Method

Seven reviewers worked disjoint scopes (chart engine / chart render layer /
composed charts / markdown viewer / segmented control + metric card / design
tokens / registry + playground), each instructed to **verify by execution** — run
the payload, compile the CSS, decode the font — rather than assert from reading,
and to report "no findings" where the code was correct. Every Blocker and every
finding marked **[lead-verified]** I reproduced myself from source before
accepting it. Findings were de-duplicated across scopes; the four chart-layer
findings that two reviewers reached independently (bar-chart's unguarded
`onHoverIndexChange` dep, `pointer.y` reaching the bar tooltip, the `values`
option being stubbed) were merged into their root causes.