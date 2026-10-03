import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { segmentedControlItemVariants } from "../segmented-control-variants.ts";
import { segmentedControlMarkClass } from "../segmented-control-variants.ts";
import { segmentedControlVariants } from "../segmented-control-variants.ts";

const component = readFileSync(new URL("../segmented-control.tsx", import.meta.url), "utf8");

test("segmented is one track and outline is none", () => {
  const segmented = cn(segmentedControlVariants({ variant: "segmented" }));
  const outline = cn(segmentedControlVariants({ variant: "outline" }));
  assert.match(segmented, /rounded-full/);
  assert.match(segmented, /bg-muted/);
  assert.match(segmented, /border-border/);
  assert.match(segmented, /p-1/);
  assert.match(outline, /bg-transparent/);
  assert.match(outline, /p-0/);
  // The loose row is not the tracked row with its fill removed: it spaces the
  // options wider, because the gap is the track's job in the segmented variant.
  assert.match(outline, /gap-1\.5/);
});

test("the chosen option never restates the mark's fill", () => {
  const selected = cn(segmentedControlItemVariants({ variant: "segmented", selected: true }));
  const outlineSelected = cn(
    segmentedControlItemVariants({ variant: "outline", selected: true }),
  );
  // The mark is already a primary pill sitting behind this option. A second
  // bg-primary here would stack an un-animated fill exactly on the one that
  // slides, and the slide would look like nothing moved.
  assert.doesNotMatch(selected, /bg-primary/);
  assert.doesNotMatch(outlineSelected, /bg-primary/);
  // The chosen option still changes its ink and drops its own border so the
  // mark can show through — that is the whole difference between the two states.
  assert.match(selected, /text-primary-foreground/);
  assert.match(outlineSelected, /border-transparent/);
  assert.match(outlineSelected, /bg-transparent/);
});

test("the resting option is the variant's business, and only there", () => {
  const resting = cn(segmentedControlItemVariants({ variant: "outline", selected: false }));
  const restingTrack = cn(
    segmentedControlItemVariants({ variant: "segmented", selected: false }),
  );
  assert.match(resting, /border-border/);
  assert.match(resting, /hover:bg-accent/);
  // Inside the track the resting option is ink only: a resting fill of its own
  // would sit in front of the mark and the row would read as a strip of boxes.
  assert.doesNotMatch(restingTrack, /bg-background|bg-accent/);
  assert.match(restingTrack, /text-muted-foreground/);
});

test("sizes are one scale, not a second set of names", () => {
  const sm = cn(segmentedControlItemVariants({ size: "sm" }));
  const lg = cn(segmentedControlItemVariants({ size: "lg" }));
  assert.match(sm, /h-7/);
  assert.match(sm, /text-xs/);
  assert.match(lg, /h-9/);
  // Every option in a row is the same height, or the mark has two resting sizes.
  assert.doesNotMatch(sm, /h-8/);
  assert.doesNotMatch(lg, /h-8/);
});

test("the press is there and it respects reduced motion", () => {
  const value = cn(segmentedControlItemVariants({}));
  assert.match(value, /active:scale/);
  assert.match(value, /motion-reduce:active:scale-100/);
  assert.match(value, /focus-visible:ring/);
  assert.match(value, /disabled:pointer-events-none/);
});

test("the stagger counts options, not children", () => {
  const utilities = readFileSync(
    new URL("../../../animations/src/utilities.css", import.meta.url),
    "utf8",
  );
  const start = utilities.indexOf("@utility segmented-items-in");
  assert.ok(start !== -1, "segmented-items-in is missing from utilities.css");
  const block = utilities.slice(start, utilities.indexOf("@utility ", start + 1));

  // The mark is a child of the track too, so the first option is the track's
  // *second* child. Tailwind compiles `nth-child(1)` to `:first-child`, which
  // can never match it — the first option would silently lose its stagger delay
  // while every other one kept theirs. Nothing about the class output shows this;
  // it only shows up in the built stylesheet, so the guard reads the source.
  assert.doesNotMatch(block, /:nth-child\(/, "use :nth-of-type, the mark is also a child");
  assert.match(block, /:nth-of-type\(1\)/);

  // Every option gets a distinct beat, and they run in order.
  for (let step = 1; step <= 8; step += 1) {
    const entry = block.match(
      new RegExp(`:nth-of-type\\(${step}\\)\\s*\\{\\s*animation-delay:\\s*calc\\(var\\(--duration-stagger\\) \\* ${step}\\)`),
    );
    assert.ok(entry, `option ${step} has no ${step}x stagger delay`);
  }

  // `backwards` and never `forwards`: the keyframes end on `scale(1)`, and a
  // forwards fill would hold that transform over the item's `active:scale`, so
  // every press in the control would stop working after mount.
  assert.match(block, /segmented-item-in[^;]+backwards/);
  assert.doesNotMatch(block, /forwards/);
});

test("the mark fades in, and the mark is never animated on transform", () => {
  const keyframes = readFileSync(
    new URL("../../../animations/src/keyframes.css", import.meta.url),
    "utf8",
  );
  const start = keyframes.indexOf("@keyframes segmented-mark-in");
  assert.ok(start !== -1, "segmented-mark-in is missing from keyframes.css");
  const block = keyframes.slice(start, keyframes.indexOf("}", start));

  // The mark's inline `transform` is what places it behind the chosen option.
  // An entrance on transform would fight that inline style and send the pill to
  // the corner of the track.
  assert.doesNotMatch(block, /transform/);
  assert.match(block, /opacity/);
});

test("the mark actually transitions — this is the whole component", () => {
  const mark = segmentedControlMarkClass;

  // Regression. The mark used to carry no transition at all, so every change of
  // answer re-positioned it with a new inline transform and it teleported. The
  // component rendered, every assertion below still passed, and the control was
  // completely inert. The mark's whole job is the movement.
  assert.match(mark, /transition-\[transform/, "the mark has no transition: it will teleport");
  assert.match(mark, /width/, "width must transition: options are content-sized");
  assert.match(mark, /height/, "height must transition for the same reason");
  assert.match(mark, /duration-\[var\(--duration-slow\)\]/);
  assert.match(mark, /ease-\[var\(--ease-panel\)\]/);
  // The panel curve because the mark has to land on an exact rect; a spring
  // peaks past 1.098 and would overshoot its own option.
  assert.doesNotMatch(mark, /ease-\[var\(--ease-spring\)\]/);
  assert.match(mark, /motion-reduce:transition-none/);
  // Absolutely placed and hit-transparent, or it eats clicks on the option.
  assert.match(mark, /absolute/);
  assert.match(mark, /pointer-events-none/);
});

test("pill is the chip row, and its chosen chip empties out for the mark", () => {
  const track = cn(segmentedControlVariants({ variant: "pill" }));
  assert.match(track, /bg-transparent/);
  assert.match(track, /p-1/);

  const resting = cn(segmentedControlItemVariants({ variant: "pill", selected: false }));
  const chosen = cn(segmentedControlItemVariants({ variant: "pill", selected: true }));
  // The soft chip: a translucent foreground wash, exactly what the `tabs` pill
  // trigger rests on, so the two components share one chip.
  assert.match(resting, /bg-foreground\/10/);
  assert.match(resting, /border-border/);
  assert.match(resting, /shadow-xs/);
  // The chosen chip is a hole, not a second mark. A soft chip this size holding
  // its own dark fill would be two pills stacked.
  assert.match(chosen, /bg-transparent/);
  assert.match(chosen, /border-transparent/);
  assert.match(chosen, /shadow-none/);
  assert.doesNotMatch(chosen, /bg-primary/);
});

test("no chosen option in any variant ever paints its own primary fill", () => {
  for (const variant of ["segmented", "pill", "outline"] as const) {
    const chosen = cn(segmentedControlItemVariants({ variant, selected: true }));
    assert.doesNotMatch(
      chosen,
      /bg-primary/,
      `${variant}: the mark is the primary fill; a second one hides the slide`,
    );
    // Whatever it is, the chosen option has to let the mark through.
    assert.match(chosen, /text-primary-foreground/, `${variant}: chosen ink is not inverted`);
  }
});

test("all three tracks stay borderless or bordered on purpose", () => {
  const segmented = cn(segmentedControlVariants({ variant: "segmented" }));
  const pill = cn(segmentedControlVariants({ variant: "pill" }));
  const outline = cn(segmentedControlVariants({ variant: "outline" }));
  // Only the tracked bar carries the container. The other two put the separation
  // on the options instead, which is the difference between a segmented bar and
  // a row of chips.
  assert.match(segmented, /border-border/);
  assert.match(segmented, /bg-muted/);
  assert.doesNotMatch(pill, /bg-muted/);
  assert.doesNotMatch(outline, /bg-muted/);
  assert.doesNotMatch(pill, /p-0/, "pill keeps the track's breathing room");
});

test("the entrance class is on the track, where the utility can actually reach it", () => {
  const track = component.slice(
    component.indexOf('role="radiogroup"'),
    component.indexOf("</div>", component.indexOf('role="radiogroup"')),
  );
  const item = component.slice(component.indexOf("<button"), component.indexOf("</button>"));

  // The utility is `& > [data-slot="segmented-control-item"]` and an option button
  // has no element children, so on the button the animation, the whole stagger,
  // and the reduced-motion override are all unreachable. The class has to be the
  // track's — a source grep of utilities.css cannot see this.
  assert.match(track, /segmentedControlItemsInClass/, "the track must carry the entrance");
  assert.doesNotMatch(item, /segmentedControlItemsInClass/, "the option cannot carry it");

  // And the reduced-motion override has to be that same track-child selector, or
  // the cascade never reaches the options either.
  const source = readFileSync(
    new URL("../../../animations/src/utilities.css", import.meta.url),
    "utf8",
  );
  const reduced = source.slice(source.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /\.segmented-items-in > \[data-slot="segmented-control-item"\]/);
});

test("a caller's onKeyDown composes with the roving focus instead of replacing it", () => {
  // The rest-spread came after `onKeyDown`, and `onKeyDown` was never destructured,
  // so a caller passing one silently deleted the arrows, Home/End and the one tab
  // stop — the row stayed a `radiogroup` and could no longer be moved through.
  assert.match(component, /\n {2}onKeyDown,\n {2}\.\.\.props/);
  assert.match(
    component,
    /onKeyDown=\{\(event\) => \{\s*handleKeyDown\(event\);\s*onKeyDown\?\.\(event\);\s*\}\}/,
  );
});

test("a disabled selection does not take the only tab stop", () => {
  // A natively disabled button cannot be focused. If it still holds tabIndex 0,
  // every other option is -1 and the radiogroup has no tab stop.
  assert.match(
    component,
    /const rovingIndex =\s*selectedIndex !== -1 && !options\[selectedIndex\]\?\.disabled\s*\? selectedIndex\s*: fallbackIndex/,
  );
  assert.match(component, /tabIndex=\{index === rovingIndex \? 0 : -1\}/);
});

test("selecting the current value does not notify", () => {
  assert.match(component, /if \(next === active\) return;/);
});

test("the controlled mode is latched on the first render", () => {
  // Recomputed every render, a parent that starts with `value === undefined` and
  // supplies a real one later flipped the row controlled and discarded the option
  // the user had already picked.
  assert.match(component, /const \[controlled\] = useState\(value !== undefined\)/);
  assert.doesNotMatch(component, /const controlled = value !== undefined/);
});
