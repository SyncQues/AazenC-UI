import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  chartAxisLabelVariants,
  chartBodyVariants,
  chartContainerVariants,
  chartGridVariants,
  chartLegendItemVariants,
  chartLegendSwatchVariants,
  chartLegendVariants,
  chartOverlayVariants,
  chartPlotVariants,
  chartStateTitleVariants,
  chartStateVariants,
  chartTitleVariants,
  chartTooltipRowVariants,
  chartTooltipVariants,
} from "../chart-variants.ts";

function classes(variants: (options?: never) => string, options?: never) {
  return cn(variants(options));
}

test("a chart panel is the card, and bare is the absence of it", () => {
  const panel = classes(chartContainerVariants);
  assert.match(panel, /bg-card/);
  assert.match(panel, /border-border/);
  assert.match(panel, /rounded-lg/);
  assert.match(panel, /shadow-sm/);
  // The body has to be allowed to shrink, or a chart refuses to fit its grid
  // cell and pushes the whole dashboard taller.
  assert.match(classes(chartBodyVariants), /min-h-0/);
  assert.match(classes(chartBodyVariants), /min-w-0/);

  const bare = classes(chartContainerVariants, { variant: "bare" as never });
  assert.match(bare, /bg-transparent/);
  assert.doesNotMatch(bare, /bg-card|shadow-sm/);
});

test("padding is three steps and a bare container is never padded by default", () => {
  assert.match(classes(chartContainerVariants, { padding: "none" as never }), /p-0/);
  assert.match(classes(chartContainerVariants, { padding: "sm" as never }), /p-4/);
  assert.match(classes(chartContainerVariants, { padding: "lg" as never }), /p-6/);
  assert.match(classes(chartContainerVariants), /p-6/);
  assert.match(classes(chartContainerVariants, { height: "full" as never }), /h-full/);
});

test("the plot stops a drag across it from scrolling the page", () => {
  // Without touch-action a finger dragged over a chart to read a value scrolls
  // the page instead, which on a phone means the reader loses the chart.
  assert.match(classes(chartPlotVariants), /touch-none/);
  assert.match(classes(chartPlotVariants), /select-none/);
  assert.doesNotMatch(classes(chartPlotVariants, { interactive: false as never }), /touch-none/);
});

test("the tooltip cannot take the pointer back", () => {
  // It tracks the cursor. If it accepted events, crossing the gap between the
  // plot and the bubble would make it flicker.
  const tooltip = classes(chartTooltipVariants);
  assert.match(tooltip, /pointer-events-none/);
  assert.match(tooltip, /bg-popover/);
  assert.match(tooltip, /border-border/);
  // It has to clear the plot it is drawn over.
  assert.match(tooltip, /z-10/);
  assert.match(classes(chartTooltipVariants, { tone: "silent" as never }), /sr-only/);
});

test("the crosshair overlay is invisible and reachable", () => {
  const overlay = classes(chartOverlayVariants);
  assert.match(overlay, /absolute/);
  assert.match(overlay, /inset-0/);
  // It sits over the marks so a 2px line is still grabbable, so it has to
  // carry the cursor and be focusable without a visible ring fighting the data.
  assert.match(overlay, /cursor-crosshair/);
  assert.match(overlay, /focus-visible:outline-none/);
});

test("an axis label is one muted tone whatever the axis", () => {
  const horizontal = classes(chartAxisLabelVariants);
  const vertical = classes(chartAxisLabelVariants, { orientation: "vertical" as never });
  // Two tones across two axes would read as a second data channel, and there
  // is only one.
  assert.equal(horizontal, vertical);
  assert.match(horizontal, /fill-muted-foreground/);
  assert.match(horizontal, /text-\[11px\]/);
  assert.doesNotMatch(horizontal, /font-(semibold|bold)/);
});

test("the grid is horizontal by default and subtle on request", () => {
  assert.match(classes(chartGridVariants), /opacity-60/);
  // The style variant picks which rules are drawn; the component short-circuits
  // to nothing for "none", so the variant itself contributes no class.
  assert.doesNotMatch(classes(chartGridVariants, { style: "none" as never }), /horizontal|both/);
  assert.match(classes(chartGridVariants, { density: "subtle" as never }), /opacity-35/);
  assert.doesNotMatch(classes(chartGridVariants, { density: "subtle" as never }), /opacity-60/);
});

test("a legend that cannot be pressed is a legend only mouse users get", () => {
  const legend = classes(chartLegendVariants);
  assert.match(legend, /flex-wrap/);
  assert.match(classes(chartLegendVariants, { orientation: "vertical" as never }), /flex-col/);
  assert.match(classes(chartLegendVariants, { align: "end" as never }), /justify-end/);

  const item = classes(chartLegendItemVariants);
  assert.doesNotMatch(item, /cursor-pointer/);
  const interactive = classes(chartLegendItemVariants, {
    interactive: true as never,
    active: true as never,
  });
  assert.match(interactive, /cursor-pointer/);
  assert.match(interactive, /text-foreground/);
  assert.match(classes(chartLegendItemVariants, { interactive: true as never }), /opacity-70/);

  // The swatch is a box so it lines up with the text baseline at any size.
  assert.match(classes(chartLegendSwatchVariants, { shape: "circle" as never }), /rounded-full/);
  assert.match(classes(chartLegendSwatchVariants, { shape: "line" as never }), /h-0\.5/);
});

test("numbers in a readout are tabular or the tooltip jitters", () => {
  assert.match(classes(chartTooltipRowVariants), /tabular-nums|justify-between/);
  assert.match(classes(chartTooltipRowVariants, { emphasis: "strong" as never }), /font-medium/);
});

test("a state is centred and sized, and only an error takes the destructive tone", () => {
  const state = classes(chartStateVariants);
  assert.match(state, /items-center/);
  assert.match(state, /justify-center/);
  assert.match(state, /text-center/);
  assert.match(classes(chartStateVariants, { size: "lg" as never }), /min-h-\[16rem\]/);

  // Every state names its own text; only the destructive tone adds a colour,
  // so a loading or empty block is never mistaken for an error.
  assert.match(classes(chartStateTitleVariants), /text-foreground/);
  assert.doesNotMatch(classes(chartStateTitleVariants), /text-destructive/);
  assert.match(classes(chartStateTitleVariants, { tone: "destructive" as never }), /text-destructive/);
});

test("a state frame animates in, because swapping it for the plot is the loudest change a chart makes", () => {
  // Regression: the frame was pure layout, so plot -> error -> empty cut hard.
  // It rides the base rather than a variant so every state, and any block a
  // consumer composes by hand, arrives the same way.
  for (const size of ["sm", "md", "lg"] as const) {
    assert.match(
      classes(chartStateVariants, { size } as never),
      /chart-state-in/,
      `size=${size} lost the state enter animation`,
    );
  }
});

test("a chart title is one size, and it truncates rather than wrap", () => {
  const title = classes(chartTitleVariants);
  assert.match(title, /truncate/);
  assert.match(title, /font-semibold/);
  assert.match(classes(chartTitleVariants, { size: "md" as never }), /text-base/);
  assert.doesNotMatch(classes(chartTitleVariants, { size: "md" as never }), /text-sm/);
});

test("the title keeps its line box through tailwind-merge", () => {
  // tailwind-merge declares `font-size` as conflicting with `leading`, so a
  // recipe that put `leading-none` in its base string and `text-base` in a
  // variant lost the leading on the way out of `cn` — the class never reached
  // the DOM and the title sat at the reader's line height instead of the
  // product's. Asserted rather than fixed silently, because the failure is
  // invisible in the source and only shows up in a rendered box model.
  for (const size of ["sm", "md"] as const) {
    const value = classes(chartTitleVariants, { size });
    assert.match(value, /leading-none/, `size ${size} lost leading-none`);
  }
  assert.doesNotMatch(
    classes(chartTitleVariants, { size: "md" as never }),
    /text-sm|leading-tight/
  );
});

test("the legend can sit between a start and an end", () => {
  // A legend with a total on its right is the reason `between` exists, and
  // ChartContainerFooter already offers the same three positions.
  assert.match(classes(chartLegendVariants, { align: "between" as never }), /justify-between/);
  assert.doesNotMatch(classes(chartLegendVariants, { align: "between" as never }), /justify-start|justify-end/);
});
