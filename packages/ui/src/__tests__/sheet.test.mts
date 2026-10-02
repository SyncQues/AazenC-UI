import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  sheetBodyClass,
  sheetCloseClass,
  sheetContentVariants,
  sheetDescriptionClass,
  sheetFooterClass,
  sheetHeaderVariants,
  sheetOverlayClass,
  sheetTitleClass,
} from "../sheet-variants.ts";

test("sheet is one panel from any edge and the right edge is the default", () => {
  assert.match(sheetContentVariants(), /inset-y-0/);
  assert.match(sheetContentVariants(), /right-0/);
  assert.match(sheetContentVariants(), /w-3\/4/);
  assert.match(sheetContentVariants(), /sm:max-w-md/);
  assert.doesNotMatch(sheetContentVariants(), /sm:max-w-sm/);
  for (const side of ["top", "right", "bottom", "left"] as const) {
    assert.match(sheetContentVariants({ side }), /bg-background/);
    assert.match(sheetContentVariants({ side }), /shadow-lg/);
    assert.match(sheetContentVariants({ side }), /overflow-hidden/);
  }
});

test("only the free edge is rounded, the anchored edge stays square", () => {
  assert.match(sheetContentVariants({ side: "right" }), /rounded-l-\[var\(--radius-panel\)\]/);
  assert.match(sheetContentVariants({ side: "left" }), /rounded-r-\[var\(--radius-panel\)\]/);
  assert.match(sheetContentVariants({ side: "top" }), /rounded-b-\[var\(--radius-panel\)\]/);
  assert.match(sheetContentVariants({ side: "bottom" }), /rounded-t-\[var\(--radius-panel\)\]/);
  for (const side of ["top", "right", "bottom", "left"] as const) {
    assert.doesNotMatch(sheetContentVariants({ side }), /rounded-full|rounded-none|rounded-\[/);
  }
});

test("the edge the panel is docked to is the edge it is sized and bordered on", () => {
  assert.match(sheetContentVariants({ side: "right" }), /border-l/);
  assert.match(sheetContentVariants({ side: "left" }), /border-r/);
  assert.match(sheetContentVariants({ side: "top" }), /border-b/);
  assert.match(sheetContentVariants({ side: "bottom" }), /border-t/);
  assert.match(sheetContentVariants({ side: "right" }), /h-full/);
  assert.match(sheetContentVariants({ side: "bottom" }), /max-h-\[85vh\]/);
  assert.match(sheetContentVariants({ side: "top" }), /max-h-\[85vh\]/);
  assert.doesNotMatch(sheetContentVariants({ side: "right" }), /max-h-\[/);
});

test("a sheet is a dialog, so it keeps the dialog stack and the dialog motion", () => {
  assert.match(sheetContentVariants(), /sheet-motion/);
  assert.match(sheetContentVariants(), /z-\[var\(--z-dialog\)\]/);
  assert.match(sheetContentVariants(), /pointer-events-auto/);
  assert.match(sheetOverlayClass, /sheet-overlay-motion/);
  assert.match(sheetOverlayClass, /z-\[var\(--z-overlay\)\]/);
  assert.match(sheetOverlayClass, /bg-black\/50/);
  assert.doesNotMatch(sheetContentVariants(), /oklch\(|dark:/);
});

test("a sheet is not a drawer: no handle, no gesture affordance, no drag cue", () => {
  assert.doesNotMatch(sheetContentVariants(), /rounded-t-2xl/);
  assert.doesNotMatch(sheetContentVariants(), /touch-|cursor-|snap-|overscroll/);
});

test("only the body scrolls, the header and the action row are structure", () => {
  assert.match(sheetBodyClass, /flex-1/);
  assert.match(sheetBodyClass, /overflow-y-auto/);
  assert.match(sheetBodyClass, /min-h-0/);
  assert.match(sheetHeaderVariants(), /flex-col/);
  assert.match(sheetHeaderVariants({ close: true }), /pr-12/);
  assert.equal(
    sheetHeaderVariants({ close: false }).trim(),
    sheetHeaderVariants({ close: true }).replace("pr-12", "").trim(),
  );
  assert.match(sheetFooterClass, /border-t/);
  assert.match(sheetFooterClass, /mt-auto/);
  assert.match(sheetFooterClass, /safe-area-inset-bottom/);
  assert.match(sheetFooterClass, /sm:justify-end/);
  assert.doesNotMatch(sheetBodyClass, /border-t/);
});

test("sheet type matches the panel it is described by", () => {
  assert.match(sheetTitleClass, /font-semibold/);
  assert.match(sheetTitleClass, /text-foreground/);
  assert.match(sheetDescriptionClass, /text-muted-foreground/);
  assert.match(sheetCloseClass, /rounded-full/);
  assert.match(sheetCloseClass, /size-8/);
  assert.match(sheetCloseClass, /focus-visible:ring/);
});

/** Highest value a cubic-bezier easing reaches. Above 1 means it overshoots. */
function peakEasingValue(y1: number, y2: number): number {
  const curve = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let peak = 0;
  for (let step = 0; step <= 200; step += 1) peak = Math.max(peak, curve(step / 200, y1, y2));
  return peak;
}

function easingToken(name: string): [number, number] {
  const tokens = readFileSync(new URL("../../../tokens/src/base.css", import.meta.url), "utf8");
  const [, x1, y1, , y2] = tokens.match(
    new RegExp(`--${name}: cubic-bezier\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)\\)`),
  ) as RegExpMatchArray;
  assert.ok(Number(x1) < 1, `${name} is not a plain cubic-bezier`);
  return [Number(y1), Number(y2)];
}

test("a sheet does not bounce on the way in", () => {
  // The panel travels the whole viewport, so an overshooting curve is visible as
  // the sheet sailing past its resting position and coming back.
  const utilities = readFileSync(
    new URL("../../../animations/src/utilities.css", import.meta.url),
    "utf8",
  );
  const motion = utilities.slice(utilities.indexOf("@utility sheet-motion"));

  for (const side of ["right", "left", "top", "bottom"] as const) {
    const entry = motion.match(new RegExp(`animation: sheet-slide-in-${side} [^;]+;`))?.[0] ?? "";
    assert.match(entry, /var\(--ease-panel\)/, `sheet-slide-in-${side} lost its curve`);
    assert.doesNotMatch(entry, /var\(--ease-spring\)/, `sheet-slide-in-${side} bounces`);
  }
});

test("the curve a sheet uses cannot overshoot, and the spring it left can", () => {
  const [panelY1, panelY2] = easingToken("ease-panel");
  const [springY1, springY2] = easingToken("ease-spring");
  assert.ok(peakEasingValue(panelY1, panelY2) <= 1, "ease-panel must not overshoot");
  assert.ok(peakEasingValue(springY1, springY2) > 1, "ease-spring is expected to overshoot");
});
