import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  focusIntentFor,
  nextFocusIndex,
  selectOnly,
  tabStopValue,
  toggleSelection,
} from "../toggle-group-utils.ts";
import {
  toggleGroupItemVariants,
  toggleGroupItemsInClass,
  toggleGroupVariants,
} from "../toggle-group-variants.ts";
import { toggleControlClass, toggleVariants } from "../toggle-variants.ts";

const component = readFileSync(
  new URL("../toggle-group.tsx", import.meta.url),
  "utf8",
);
const variants = readFileSync(
  new URL("../toggle-group-variants.ts", import.meta.url),
  "utf8",
);

test("arrow keys mean what the orientation says", () => {
  assert.equal(focusIntentFor("ArrowRight", "horizontal"), "next");
  assert.equal(focusIntentFor("ArrowLeft", "horizontal"), "prev");
  // Up and down are not previous and next in a horizontal row, so they belong
  // to whatever the item itself does with them.
  assert.equal(focusIntentFor("ArrowUp", "horizontal"), undefined);
  assert.equal(focusIntentFor("ArrowDown", "horizontal"), undefined);
  assert.equal(focusIntentFor("ArrowUp", "vertical"), "prev");
  assert.equal(focusIntentFor("ArrowDown", "vertical"), "next");
  assert.equal(focusIntentFor("ArrowRight", "vertical"), undefined);
  assert.equal(focusIntentFor("ArrowLeft", "vertical"), undefined);
});

test("the writing direction swaps the horizontal arrows", () => {
  // The one place `dir` changes what a key means: right is forward either way,
  // it is just next to a different side of the row.
  assert.equal(focusIntentFor("ArrowRight", "horizontal", "rtl"), "prev");
  assert.equal(focusIntentFor("ArrowLeft", "horizontal", "rtl"), "next");
  // Vertical is unaffected: writing direction does not rearrange a column.
  assert.equal(focusIntentFor("ArrowDown", "vertical", "rtl"), "next");
});

test("Home and End reach both ends, and Page keys join them", () => {
  assert.equal(focusIntentFor("Home", "horizontal"), "first");
  assert.equal(focusIntentFor("End", "horizontal"), "last");
  assert.equal(focusIntentFor("PageUp", "horizontal"), "first");
  assert.equal(focusIntentFor("PageDown", "horizontal"), "last");
  assert.equal(focusIntentFor("a", "horizontal"), undefined);
  assert.equal(focusIntentFor("Tab", "horizontal"), undefined);
});

test("nothing to move through leaves the index alone", () => {
  assert.equal(nextFocusIndex(0, -1, "next", true), -1);
  assert.equal(nextFocusIndex(0, -1, "prev", false), -1);
});

test("an arrow arriving with nothing focused still goes the way it pointed", () => {
  // Tabbing into a group lands here. Snapping to the head of the row regardless
  // would leave one of the two arrows dead on arrival.
  assert.equal(nextFocusIndex(3, -1, "next", true), 0);
  assert.equal(nextFocusIndex(3, -1, "prev", true), 2);
  assert.equal(nextFocusIndex(3, -1, "last", true), 2);
  assert.equal(nextFocusIndex(3, -1, "first", true), 0);
});

test("looping wraps and not looping stops at the end", () => {
  assert.equal(nextFocusIndex(3, 2, "next", true), 0);
  assert.equal(nextFocusIndex(3, 0, "prev", true), 2);
  assert.equal(nextFocusIndex(3, 2, "next", false), 2);
  assert.equal(nextFocusIndex(3, 0, "prev", false), 0);
  // Interior moves are the same either way.
  assert.equal(nextFocusIndex(3, 1, "next", false), 2);
  assert.equal(nextFocusIndex(3, 1, "prev", true), 0);
});

test("an exclusive group swaps to the other item and clears itself", () => {
  assert.deepEqual(toggleSelection("single", [], "bold"), ["bold"]);
  assert.deepEqual(toggleSelection("single", ["bold"], "italic"), ["italic"]);
  // Pressing the chosen item again hands back nothing, which is the "" a
  // controlled single group receives.
  assert.deepEqual(toggleSelection("single", ["bold"], "bold"), []);
});

test("a multi group adds and drops independently", () => {
  assert.deepEqual(toggleSelection("multiple", [], "bold"), ["bold"]);
  assert.deepEqual(toggleSelection("multiple", ["bold"], "italic"), [
    "bold",
    "italic",
  ]);
  assert.deepEqual(toggleSelection("multiple", ["bold", "italic"], "bold"), [
    "italic",
  ]);
});

test("selecting an answer that is already on changes nothing", () => {
  // The guard that keeps an arrow from deselecting a radiogroup: an arrow always
  // lands on a *different* item, so this can only fire from a re-render.
  assert.deepEqual(selectOnly(["bold"], "bold"), ["bold"]);
  assert.deepEqual(selectOnly(["bold"], "italic"), ["italic"]);
  // A new array either way, so a state setter that compares by identity still
  // sees a change on a genuine switch.
  assert.notEqual(selectOnly(["bold"], "bold"), undefined);
});

test("the two modes are not the same component with a different fill", () => {
  // Measured against @radix-ui/react-toggle-group@1.1.19, ArrowRight moves the
  // focus ring and leaves every aria-checked exactly as it was — which in a
  // radiogroup means the answer is unreachable by keyboard.
  assert.match(
    component,
    /if \(isSingle\) \{[\s\S]*?commit\(selectOnly\(selected, nextValue\)\)/,
  );
  // And a toolbar must not select on arrow, or sweeping to Underline presses Bold
  // on the way past.
  const select = component.slice(
    component.indexOf("if (isSingle) {"),
    component.indexOf("const tabStopValue"),
  );
  assert.doesNotMatch(
    select.slice(select.lastIndexOf("if (isSingle)")),
    /type === "multiple"/,
  );
});

test("a radiogroup has to be a radiogroup, and a toolbar a toolbar", () => {
  assert.match(component, /role=\{isSingle \? "radiogroup" : "toolbar"\}/);
  assert.match(component, /role=\{isSingle \? "radio" : undefined\}/);
  assert.match(component, /aria-checked=\{isSingle \? pressed : undefined\}/);
  assert.match(component, /aria-pressed=\{isSingle \? undefined : pressed\}/);
  assert.match(component, /data-state=\{pressed \? "on" : "off"\}/);
});

test("a modified arrow belongs to the browser", () => {
  // alt-arrow is a word jump and shift-arrow is a text selection; swallowing
  // either would take the keyboard away from the page.
  // Matched without the trailing `return;` so a Prettier reflow of the guard
  // does not read as a behaviour change.
  assert.match(
    component,
    /event\.metaKey \|\| event\.ctrlKey \|\| event\.altKey \|\| event\.shiftKey/,
  );
  const guard = component.slice(component.indexOf("event.metaKey"));
  assert.match(
    guard.slice(0, 120),
    /return;/,
    "the guard has to return before the key is read as navigation",
  );
});

test("a disabled item is skipped, not hidden, and never takes the tab stop", () => {
  assert.match(component, /\.filter\(\(item\) => !item\.disabled\)/);
  // A natively disabled button cannot be focused, so a group that handed its only tab
  // stop to one would be unreachable. The rule itself lives in the utils, where it can
  // be asked directly rather than read.
  assert.match(
    component,
    /const reachable = items\s*\.filter\(\(child\) => !child\.props\.disabled\)/,
  );
  assert.equal(
    tabStopValue({ values: ["a", "c"], selected: ["b"], focused: null }),
    "a",
    "a disabled item is not a candidate, so the stop skips past the answer",
  );
  assert.equal(tabStopValue({ values: ["a", "c"], selected: ["a"], focused: null }), "a");
});

test("one tab stop, and it sits on the answer", () => {
  assert.match(component, /tabIndex: value === stop \? 0 : -1/);
  // Nothing focused yet is the state a tab into the group arrives in, and the answer
  // is where the keyboard user last was.
  assert.equal(tabStopValue({ values: ["a", "b", "c"], selected: ["b"], focused: null }), "b");
  // With no answer either, the first item that can take focus gets it.
  assert.equal(tabStopValue({ values: ["a", "b", "c"], selected: [], focused: null }), "a");
  // An empty group has nothing to hand it to, and says so rather than inventing one.
  assert.equal(tabStopValue({ values: [], selected: ["a"], focused: null }), undefined);
});

test("the tab stop follows the focus, which the answer alone cannot answer", () => {
  // The whole reason the focus is tracked separately: a multi group moves focus on
  // arrow without selecting, so a stop derived from `selected` would put the user back
  // on the first pressed item every time they tabbed in, rather than where they left.
  assert.equal(
    tabStopValue({
      values: ["bold", "italic", "underline"],
      selected: ["bold"],
      focused: "underline",
    }),
    "underline",
    "focus wins over the answer, because only the focus moved",
  );
  // A focus on something that has since gone, or been disabled, falls back rather than
  // pointing the tab at a button that cannot take it.
  assert.equal(tabStopValue({ values: ["bold", "italic"], selected: ["bold"], focused: "underline" }), "bold");
  assert.equal(tabStopValue({ values: ["bold", "italic"], selected: ["italic"], focused: null }), "italic");
  // The group takes the focus from one bubbling handler, so an arrow, a click and a
  // tab all land in the same place without a handler per item.
  assert.match(
    component,
    /const \[focusedValue, setFocusedValue\] = useState<string \| null>\(null\)/,
  );
  assert.match(component, /closest<HTMLElement>\(ITEM_SELECTOR\)/);
  assert.match(component, /if \(value !== undefined\) setFocusedValue\(value\);/);
});

test("a group with nothing focusable takes the tab stop itself", () => {
  // Every item disabled leaves the stop with nowhere to go, and a group no tab can
  // reach is a group nobody can find.
  assert.match(component, /tabIndex=\{stop === undefined \? 0 : undefined\}/);
});

test("a caller's onKeyDown composes instead of replacing the roving focus", () => {
  // Regression shape from `SegmentedControl`: a rest-spread after an
  // un-destructured `onKeyDown` silently deleted the arrows and Home/End.
  assert.match(component, /\n {2}onKeyDown,\n {2}onFocus,\n {2}children,/);
  assert.match(
    component,
    /onKeyDown=\{\(event\) => \{\s*handleKeyDown\(event\);\s*onKeyDown\?\.\(event\);\s*\}\}/,
  );
  // Same for the focus the roving tab stop is derived from.
  assert.match(
    component,
    /onFocus=\{\(event\) => \{\s*handleFocus\(event\);\s*onFocus\?\.\(event\);\s*\}\}/,
  );
});

test("the name comes from label, and aria-label is pulled out so it cannot win", () => {
  // `aria-label` written before `{...props}` meant the spread silently overrode the
  // `label` prop — the opposite of what the expression said it was doing.
  assert.match(component, /"aria-label": ariaLabel,/);
  assert.match(component, /aria-label=\{label \?\? ariaLabel\}/);
  assert.ok(
    component.indexOf("aria-label={label ?? ariaLabel}") > component.indexOf("{...props}"),
    "the resolved name has to land after the spread, not before it",
  );
});

test("the group's own contract is written after the rest-spread", () => {
  // The role and the name are how a screen reader finds the group; `data-value` on an
  // item is how the roving focus finds the item. None of them can be a caller's to set.
  for (const owned of [
    'role={isSingle ? "radiogroup" : "toolbar"}',
    "aria-label={label ?? ariaLabel}",
    'data-slot="toggle-group"',
  ]) {
    assert.ok(
      component.indexOf("{...props}") < component.indexOf(owned),
      `${owned} has to be written after the spread`,
    );
  }
  for (const owned of [
    'role={isSingle ? "radio" : undefined}',
    "aria-checked={isSingle ? pressed : undefined}",
    "data-value={value}",
  ]) {
    assert.ok(
      component.indexOf("{...props}") < component.indexOf(owned),
      `${owned} has to be written after the spread`,
    );
  }
});

test("an arrow onto the item already answered does not call back", () => {
  // With `loop`, arrowing past the end can land on the item that is already on. Focus
  // moving is not an answer, and a callback that fires with the value it already holds
  // is a render the consumer did not ask for.
  assert.match(
    component,
    /if \(nextValue !== undefined && !selected\.includes\(nextValue\)\)/,
  );
});

test("a caller that prevents the press has handled the item itself", () => {
  assert.match(component, /if \(!event\.defaultPrevented\) toggle\(value\)/);
});

test("the controlled mode is latched on the first render", () => {
  // Recomputed every render, a parent that starts with no value and supplies one
  // later flipped the group controlled and discarded the user's own picks.
  assert.match(
    component,
    /const \[isControlled\] = useState\(valueProp !== undefined\)/,
  );
  assert.doesNotMatch(
    component,
    /const isControlled = valueProp !== undefined/,
  );
});

test("pill is the default, and it is the shape the library already defaults to", () => {
  const fallback = cn(toggleGroupVariants({}));
  assert.match(fallback, /rounded-full/);
  assert.match(fallback, /gap-1/);
  // A joined strip is still one keystroke away, for the rows that want it.
  assert.doesNotMatch(fallback, /p-0\.5/);
  assert.match(component, /variant = "pill"/);
});

test("outline is a joined strip and ghost puts no chrome between items", () => {
  const outline = cn(toggleGroupVariants({ variant: "outline" }));
  const ghost = cn(toggleGroupVariants({ variant: "ghost" }));
  assert.match(outline, /bg-muted/);
  assert.match(outline, /border-border/);
  assert.match(outline, /p-0\.5/);
  assert.doesNotMatch(ghost, /bg-muted/);
  assert.doesNotMatch(ghost, /border-border/);
  assert.match(ghost, /gap-1\.5/);
});

test("what pressed means is the same in every variant", () => {
  // A toggle that reads "on" one way in one variant and another way in the other
  // is a toggle people have to relearn between screens.
  for (const variant of ["pill", "outline", "ghost"] as const) {
    const pressed = cn(toggleGroupItemVariants({ variant, pressed: true }));
    assert.match(pressed, /bg-primary/, `${variant}: a pressed item is filled`);
    assert.match(
      pressed,
      /text-primary-foreground/,
      `${variant}: its ink is inverted`,
    );
  }
});

test("a pressed item rounds to fit the container it sits in", () => {
  const pill = cn(toggleGroupItemVariants({ variant: "pill", pressed: true }));
  const outline = cn(
    toggleGroupItemVariants({ variant: "outline", pressed: true }),
  );
  const ghost = cn(
    toggleGroupItemVariants({ variant: "ghost", pressed: true }),
  );
  // Otherwise the fill corners poke out past the container's radius.
  assert.match(pill, /rounded-full/);
  assert.match(outline, /rounded-\[calc\(var\(--radius\)-2px\)\]/);
  assert.match(ghost, /rounded-\[var\(--radius\)\]/);
});

test("sizes are the scale SegmentedControl already uses", () => {
  const sm = cn(toggleGroupItemVariants({ size: "sm" }));
  const lg = cn(toggleGroupItemVariants({ size: "lg" }));
  assert.match(sm, /h-7/);
  assert.match(sm, /text-xs/);
  assert.match(lg, /h-9/);
  // Every item in a row is one height, or the strip has two resting sizes.
  assert.doesNotMatch(sm, /h-8/);
  assert.doesNotMatch(lg, /h-8/);
});

test("the press is there and it respects reduced motion", () => {
  const resting = cn(toggleGroupItemVariants({}));
  assert.match(resting, /active:scale/);
  assert.match(resting, /motion-reduce:active:scale-100/);
  assert.match(resting, /focus-visible:ring/);
  assert.match(resting, /disabled:pointer-events-none/);
});

test("an item outside a ToggleGroup says so", () => {
  assert.match(component, /must be rendered inside <ToggleGroup>/);
});

test("the items arrive staggered and each one springs as it turns on", () => {
  // The entrance is on the container, because the stagger has to come off
  // :nth-of-type of the children; a class on each item could not stagger.
  assert.match(component, /toggleGroupItemsInClass/);
  assert.equal(toggleGroupItemsInClass, "toggle-group-items-in");
  // The press is on the item and keyed off data-state, so it re-runs on every
  // press rather than once at mount.
  const resting = cn(toggleGroupItemVariants({}));
  assert.match(resting, /animate-toggle-press-in/);
});

test("an item and a standalone Toggle are built on one base", () => {
  // Two controls with one name that drift apart on padding or the press is how a
  // toggle looks different inside a group than it does on its own.
  assert.match(
    variants,
    /import \{ toggleControlClass \} from "\.\/toggle-variants"/,
  );
  const base = new Set(toggleControlClass.split(/\s+/));
  for (const className of [
    cn(toggleGroupItemVariants({})),
    cn(toggleVariants({})),
  ]) {
    const classes = new Set(className.split(/\s+/));
    for (const token of base) {
      assert.ok(classes.has(token), `${token} is on the shared base`);
    }
  }
});
