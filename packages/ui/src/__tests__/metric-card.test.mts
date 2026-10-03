import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Source, not rendered classes: the failures worth catching are a tile that looks
 * right and is inert under a pointer, and a cascade that shifts silently.
 */

const utilities = readFileSync(
  new URL("../../../animations/src/utilities.css", import.meta.url),
  "utf8",
);
const keyframes = readFileSync(
  new URL("../../../animations/src/keyframes.css", import.meta.url),
  "utf8",
);
const component = readFileSync(new URL("../metric-card.tsx", import.meta.url), "utf8");

/** One `@utility` block, bounded so it cannot reach the media queries below. */
function utilityBlock(name: string): string {
  const start = utilities.indexOf(`@utility ${name}`);
  assert.ok(start !== -1, `${name} is missing from utilities.css`);
  const next = [
    utilities.indexOf("@utility ", start + 1),
    utilities.indexOf("@media", start + 1),
  ]
    .filter((index) => index !== -1)
    .sort((a, b) => a - b)[0];
  return utilities.slice(start, next ?? utilities.length);
}

/** Every `animation` declaration in a block. The window is prose-inclusive, so a
 *  bare-word search for a fill mode would match this file's own comments. */
function animationDeclarations(block: string): string[] {
  return [...block.matchAll(/animation:\s*[^;]+;/g)].map((match) => match[0]);
}

/** One `@keyframes` block in full: these nest, so the first `}` is the `from`
 *  block's and cutting there never reaches the `to` half that pins a transform. */
function keyframeBlock(name: string): string {
  const start = keyframes.indexOf(`@keyframes ${name}`);
  assert.ok(start !== -1, `${name} is missing from keyframes.css`);
  const next = keyframes.indexOf("@keyframes", start + 1);
  return keyframes.slice(start, next === -1 ? keyframes.length : next);
}

test("the entrance is on by default, and `enter` is one decision", () => {
  // A tile that animates only when asked is a tile nobody asks for.
  assert.match(component, /defaultVariants:\s*\{[^}]*enter: "rise"/s);
  assert.match(component, /enter = "rise"/);
  assert.match(component, /data-enter=\{enter\}/);
  // `none` is the documented switch for a dashboard that re-keys its rows.
  assert.match(component, /enter\?: MetricCardEnter/);
});

test("the entrance fills backwards, never forwards", () => {
  // A `forwards` fill pins the keyframes' end transform over the panel's
  // `hover:-translate-y-1` and `active:scale`, so both die after mount.
  for (const name of ["metric-card-in", "metric-card-parts-in"]) {
    const declarations = animationDeclarations(utilityBlock(name));
    assert.ok(declarations.length > 0, `${name} declares no animation at all`);
    for (const declaration of declarations) {
      assert.match(
        declaration,
        /backwards/,
        `${name}: ${declaration} would pin a transform over the tile's hover and press`,
      );
      assert.doesNotMatch(declaration, /forwards/);
    }
  }
});

test("the entrance animates nothing that can move a layout", () => {
  for (const name of ["metric-card-in", "metric-card-part-in"]) {
    const block = keyframeBlock(name);
    // The tile reserves its value's line box; layout here would spend it.
    assert.doesNotMatch(
      block,
      /\b(width|height|top|left|right|bottom|filter|clip-path)\b/,
      `${name} animates a property that costs layout`,
    );
    assert.match(block, /opacity/);
    assert.match(block, /transform/);
  }
});

test("the cascade keys off each part's slot, not its position", () => {
  const block = utilityBlock("metric-card-parts-in");

  // A tile may have no trend. A positional selector would slide every part below
  // the gap up a beat — a difference no class string shows.
  assert.doesNotMatch(block, /:nth-child\(|:nth-of-type\(/, "the cascade is positional");
  for (const slot of ["header", "value", "trend", "chart", "footer"]) {
    assert.match(
      block,
      new RegExp(`\\[data-slot="metric-card-${slot}"\\]`),
      `the ${slot} has no beat`,
    );
  }

  // Label and number share the first beat; the graph is last, because the number
  // is what the tile is for.
  assert.match(
    block,
    /\[data-slot="metric-card-header"\]\s*\{\s*animation-delay:\s*0ms/,
    "the label must not wait: it is read first, and a delay reads as a flicker",
  );
  assert.match(
    block,
    /\[data-slot="metric-card-chart"\]\s*\{\s*animation-delay:\s*calc\(var\(--duration-stagger\) \* 3\)/,
  );
  assert.match(
    block,
    /\[data-slot="metric-card-footer"\]\s*\{\s*animation-delay:\s*calc\(var\(--duration-stagger\) \* 4\)/,
  );
});

test("the tile's entrance supersedes the fade it inherits from Card", () => {
  // Card's base is `animate-fade-in`, and two `animation` declarations on one
  // element is decided by stylesheet order. The `!` makes it a decision.
  assert.match(component, /rise: "metric-card-in! metric-card-parts-in"/);
  assert.match(component, /none: "animate-none!"/);
  // `none` has to cancel the inherited fade too, or "off" means "a gentler fade".
  assert.match(
    component,
    /none: "animate-none!"/,
    "enter=none must cancel the animation, not stop adding to it",
  );
});

test("the graph is handed the slot's own beat, and the two cannot drift", () => {
  // One expression in two files, not two millisecond counts to forget.
  const slot = utilityBlock("metric-card-parts-in");
  assert.match(
    component,
    /"--chart-delay": "calc\(var\(--duration-stagger\) \* 3\)"/,
    "the chart slot no longer hands its lead to the graph",
  );
  assert.match(slot, /animation-delay:\s*calc\(var\(--duration-stagger\) \* 3\)/);
});

test("reduced motion cancels the entrance and the whole cascade", () => {
  const start = utilities.indexOf("@media (prefers-reduced-motion: reduce)");
  assert.ok(start !== -1, "utilities.css has no reduced-motion block");
  const block = utilities.slice(start);

  // Every part must be listed, not just the container: cancelling the card while
  // its parts still rise leaves a tile assembling itself in zero gravity.
  assert.match(block, /\.metric-card-in,/);
  for (const slot of ["header", "value", "trend", "chart", "footer"]) {
    assert.match(
      block,
      new RegExp(
        `\\.metric-card-parts-in > \\[data-slot="metric-card-${slot}"\\]`,
      ),
      `the ${slot} still animates under reduced motion`,
    );
  }
});

test("the card's own keyboard handling is only on a clickable card", () => {
  // Keydown bubbles, so a presentational card with a focusable descendant in
  // `footer` or `chart` was cancelling that descendant's Space and the page scroll.
  assert.match(component, /if \(event\.target !== event\.currentTarget\) return;/);
  assert.match(component, /!asChild && clickable/);
  assert.doesNotMatch(component, /onKeyDown=\{asChild \? undefined : handleKeyDown\}/);
});

test("a caller's onKeyDown runs after the card's, not instead of it", () => {
  // The rest-spread came last and `onKeyDown` was never destructured, so a caller
  // passing one left a `role="button"` with a tab stop that ignored Enter and Space.
  assert.match(component, /\n {2}onKeyDown,\n {2}className,/);
  assert.match(component, /handleKeyDown\(event\);\s*onKeyDown\?\.\(event\);/);
});
