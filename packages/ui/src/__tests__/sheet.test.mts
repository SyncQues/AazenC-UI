import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  panelCloseClass,
  panelDescriptionClass,
  panelFooterClass,
  panelTitleClass,
} from "../panel-chrome.ts";
import {
  sheetBodyClass,
  sheetCloseClass,
  sheetContentVariants,
  sheetDefaultSide,
  sheetDescriptionClass,
  sheetFooterClass,
  sheetHeaderVariants,
  sheetOverlayClass,
  sheetSides,
  sheetTitleClass,
} from "../sheet-variants.ts";

// The one suite that reads the real stylesheets, so a class string pointing at a
// renamed token fails here instead of in the browser. Cached: several tests read it.
const sourceCache = new Map<string, string>();

function readSource(relative: string): string {
  const hit = sourceCache.get(relative);
  if (hit !== undefined) return hit;
  const text = readFileSync(new URL(relative, import.meta.url), "utf8");
  sourceCache.set(relative, text);
  return text;
}

/** Highest value a cubic-bezier easing reaches. Above 1 means it overshoots. */
function peakEasingValue(y1: number, y2: number): number {
  const curve = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let peak = 0;
  for (let step = 0; step <= 200; step += 1) peak = Math.max(peak, curve(step / 200, y1, y2));
  return peak;
}

function easingToken(name: string): [number, number] {
  // Destructured only after the assert, so a renamed token reports its own name.
  const match = readSource("../../../tokens/src/base.css").match(
    new RegExp(
      `--${name}:\\s*cubic-bezier\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*\\)`,
    ),
  );
  assert.ok(match, `--${name} is not a cubic-bezier in packages/tokens/src/base.css`);
  const [, x1, y1, , y2] = match;
  assert.ok(Number(x1) < 1, `${name} is not a plain cubic-bezier`);
  return [Number(y1), Number(y2)];
}

test("the sheet re-exports the shared panel chrome rather than copying it", () => {
  // Sharing only pays off while these names ARE the shared ones.
  assert.equal(sheetFooterClass, panelFooterClass);
  assert.equal(sheetTitleClass, panelTitleClass);
  assert.equal(sheetDescriptionClass, panelDescriptionClass);
  assert.equal(sheetCloseClass, panelCloseClass);
});

test("the side list and the layouts are the same four sides", () => {
  // The compiler catches a side missing from the list; this catches a variant
// that resolves to nothing.
  const anchored = { top: "top-0", right: "right-0", bottom: "bottom-0", left: "left-0" };
  const rendered = new Set<string>();

  for (const side of sheetSides) {
    const classes = sheetContentVariants({ side });
    rendered.add(classes);
    assert.match(classes, new RegExp(`\\b${anchored[side]}\\b`), `${side} does not anchor to its edge`);
  }

  assert.equal(rendered.size, sheetSides.length, "two sides render the same panel");
  assert.ok(sheetSides.includes(sheetDefaultSide), "the default side is not a real side");
});

test("sheet is one panel from any edge and the default edge is the shared constant", () => {
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /inset-y-0/);
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /right-0/);
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /w-3\/4/);
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /sm:max-w-md/);

  // Per side: checking only the default left the other three untested.
  for (const side of sheetSides) {
    assert.doesNotMatch(sheetContentVariants({ side }), /sm:max-w-sm/);
  }
  assert.match(sheetContentVariants({ side: "left" }), /sm:max-w-md/);

  for (const side of sheetSides) {
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
  for (const side of sheetSides) {
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

test("a sheet keeps the dialog z-stack and brings its own per-side motion", () => {
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /sheet-motion/);
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /z-\[var\(--z-dialog\)\]/);
  assert.match(sheetContentVariants({ side: sheetDefaultSide }), /pointer-events-auto/);
  assert.match(sheetOverlayClass, /sheet-overlay-motion/);
  assert.match(sheetOverlayClass, /z-\[var\(--z-overlay\)\]/);
  assert.match(sheetOverlayClass, /bg-black\/50/);
});

test("a panel is never given a raw colour or a hand-patched dark mode", () => {
  // Colour arrives as a token so a theme can move it.
  for (const side of sheetSides) {
    const classes = sheetContentVariants({ side });
    assert.doesNotMatch(classes, /oklch\(|rgba?\(|hsla?\(|#[0-9a-f]{3,8}/i, `${side} hard-codes a colour`);
    assert.doesNotMatch(classes, /dark:/, `${side} patches dark mode by hand`);
  }
});

test("a sheet is not a drawer: no handle, no gesture affordance, no drag cue", () => {
  // Per side: `rounded-t-2xl` is the drawer's bottom styling, and the default
  // side is the right edge, so guarding only the default guarded a case that
  // cannot occur there.
  for (const side of sheetSides) {
    assert.doesNotMatch(sheetContentVariants({ side }), /rounded-t-2xl|rounded-b-2xl/);
    assert.doesNotMatch(sheetContentVariants({ side }), /touch-|cursor-|snap-|overscroll/);
  }
});

test("only the body scrolls, the header and the action row are structure", () => {
  assert.match(sheetBodyClass, /flex-1/);
  assert.match(sheetBodyClass, /overflow-y-auto/);
  assert.match(sheetBodyClass, /min-h-0/);
  assert.match(sheetHeaderVariants(), /flex-col/);
  assert.match(sheetFooterClass, /border-t/);
  assert.match(sheetFooterClass, /mt-auto/);
  assert.match(sheetFooterClass, /safe-area-inset-bottom/);
  assert.match(sheetFooterClass, /sm:justify-end/);
  assert.doesNotMatch(sheetBodyClass, /border-t/);
});

test("the header only reserves the close button's room when there is a close button", () => {
  // Stated as the contract, not as two variants being equal by construction.
  assert.match(sheetHeaderVariants({ close: true }), /\bpr-12\b/);
  assert.doesNotMatch(sheetHeaderVariants({ close: false }), /\bpr-12\b/);
  // The bare call is what SheetHeader actually reads, and the default is on.
  assert.match(sheetHeaderVariants(), /\bpr-12\b/);
});

test("sheet type matches the panel it is described by", () => {
  assert.match(sheetTitleClass, /font-semibold/);
  assert.match(sheetTitleClass, /text-foreground/);
  assert.match(sheetDescriptionClass, /text-muted-foreground/);
  assert.match(sheetCloseClass, /rounded-full/);
  assert.match(sheetCloseClass, /size-8/);
  assert.match(sheetCloseClass, /focus-visible:ring/);
});

test("a sheet does not bounce on the way in", () => {
  // The panel travels the whole viewport, so overshoot is plainly visible.
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

test("ease-panel cannot overshoot and ease-spring can", () => {
  // A property of the token pair, not of the sheet; the test above ties them.
  const [panelY1, panelY2] = easingToken("ease-panel");
  const [springY1, springY2] = easingToken("ease-spring");
  assert.ok(peakEasingValue(panelY1, panelY2) <= 1, "ease-panel must not overshoot");
  assert.ok(peakEasingValue(springY1, springY2) > 1, "ease-spring is expected to overshoot");
});