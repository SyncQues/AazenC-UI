import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { toggleControlClass, toggleVariants } from "../toggle-variants.ts";

const component = readFileSync(
  new URL("../toggle.tsx", import.meta.url),
  "utf8",
);

test("a toggle is a button that says whether it is down", () => {
  // The whole accessibility story is these two attributes: Space and Enter come
  // from the browser, and a reader announces "pressed" without help.
  assert.match(component, /aria-pressed=\{pressed\}/);
  assert.match(component, /data-state=\{pressed \? "on" : "off"\}/);
  assert.match(component, /data-slot="toggle"/);
  assert.match(component, /type="button"/);
});

test("there is no value, defaultValue or onChange on the DOM node", () => {
  // A rest-spread that let these through would put React's own `onChange` on a
  // button, where it means something else entirely.
  assert.match(
    component,
    /Omit<\s*ComponentProps<"button">,\s*"value" \| "children"\s*>/,
  );
  assert.match(component, /\n {2}pressed: pressedProp,\n/);
  assert.match(component, /\n {2}onPressedChange,\n {2}variant = "default",\n/);
});

test("onPressedChange hands back the next state, not the current one", () => {
  // So a caller can wire it straight to a setter without inverting anything.
  assert.match(component, /const next = !pressed;/);
  assert.match(component, /onPressedChange\?\.\(next\)/);
  assert.doesNotMatch(component, /onPressedChange\?\.\(pressed\)/);
});

test("the controlled mode is latched on the first render", () => {
  // Recomputed every render, a parent that starts uncontrolled and supplies
  // `pressed` later flipped the toggle and discarded what the user had pressed.
  assert.match(
    component,
    /const \[isControlled\] = useState\(pressedProp !== undefined\)/,
  );
  assert.doesNotMatch(
    component,
    /const isControlled = pressedProp !== undefined/,
  );
});

test("a caller that prevents the press has handled the toggle itself", () => {
  // The only way to make a toggle read-only without removing the button.
  assert.match(component, /if \(event\.defaultPrevented\) return;/);
});

test("pressed is pill by default, as Button's shape is", () => {
  const resting = cn(toggleVariants({}));
  const pressed = cn(toggleVariants({ pressed: true }));
  assert.match(resting, /rounded-full/);
  assert.match(pressed, /rounded-full/);
  assert.match(pressed, /bg-primary/);
  assert.match(pressed, /text-primary-foreground/);
  // Ink only until it is pressed, so a row of them is not a row of chips.
  assert.doesNotMatch(resting, /border-border/);
});

test("outline carries its own border, and a pressed toggle looks the same either way", () => {
  for (const variant of ["default", "outline"] as const) {
    const pressed = cn(toggleVariants({ variant, pressed: true }));
    assert.match(pressed, /bg-primary/, `${variant}: filled`);
    assert.match(
      pressed,
      /text-primary-foreground/,
      `${variant}: ink inverted`,
    );
  }
  assert.match(
    cn(toggleVariants({ variant: "outline", pressed: false })),
    /border-border/,
  );
});

test("sizes are the scale the group and the segmented control already use", () => {
  const sm = cn(toggleVariants({ size: "sm" }));
  const lg = cn(toggleVariants({ size: "lg" }));
  assert.match(sm, /h-7/);
  assert.match(sm, /text-xs/);
  assert.match(lg, /h-9/);
  assert.doesNotMatch(sm, /h-8/);
  assert.doesNotMatch(lg, /h-8/);
});

test("the press is there, it is animated, and it respects reduced motion", () => {
  const resting = cn(toggleVariants({}));
  assert.match(resting, /active:scale-\[0\.95\]/);
  assert.match(resting, /motion-reduce:active:scale-100/);
  assert.match(resting, /focus-visible:ring/);
  assert.match(resting, /disabled:pointer-events-none/);
  // The turn-on is an animation keyed off data-state, so it re-runs per press.
  assert.match(resting, /animate-toggle-press-in/);
  // `scale` is in the transition list or the press snaps with no easing at all.
  assert.match(toggleControlClass, /transition-\[[^\]]*scale\]/);
});

test("an icon-only toggle keeps its own name and does not need a group", () => {
  // Nothing here requires a ToggleGroup, and nothing strips an `aria-label`, so
  // a lone icon button can be named the way it needs to be.
  assert.match(component, /\{\.\.\.props\}/);
  assert.doesNotMatch(component, /aria-label/);
});
