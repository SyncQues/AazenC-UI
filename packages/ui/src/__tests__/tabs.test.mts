import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  tabsBadgeClass,
  tabsColorVariants,
  tabsListVariants,
  tabsPillIndicatorClass,
  tabsSolidMarkColorClass,
  tabsTriggerVariants,
  tabsUnderlineIndicatorClass,
  tabsWashMarkColorClass,
} from "../tabs-variants.ts";

test("default tabs are one underline bar", () => {
  const list = cn(tabsListVariants({}));
  assert.match(list, /min-w-full/);
  assert.match(list, /border-b/);
  assert.match(list, /border-border/);
  assert.doesNotMatch(list, /rounded-full|bg-muted/);

  const trigger = cn(tabsTriggerVariants({}));
  assert.match(trigger, /relative/);
  assert.match(trigger, /data-\[state=active\]:text-foreground/);
  assert.match(trigger, /text-muted-foreground/);
  assert.doesNotMatch(trigger, /border-b-2|rounded-full|bg-primary|text-blue|bg-blue|amber|teal|purple/);
  assert.match(tabsUnderlineIndicatorClass, /h-0\.5/);
  assert.match(tabsUnderlineIndicatorClass, /bg-primary/);
});

test("pill is one chip and does not keep accent colors", () => {
  const list = cn(tabsListVariants({ variant: "pill" }));
  assert.match(list, /w-max/);
  assert.match(list, /gap-2/);
  assert.doesNotMatch(list, /border-b|min-w-full|bg-muted/);

  const trigger = cn(tabsTriggerVariants({ variant: "pill" }));
  assert.match(trigger, /rounded-full/);
  assert.match(trigger, /border-border/);
  assert.match(trigger, /bg-foreground\/10/);
  assert.match(trigger, /text-foreground/);
  assert.match(trigger, /shadow-xs/);
  assert.match(trigger, /data-\[state=active\]:bg-transparent/);
  assert.match(trigger, /data-\[state=active\]:border-transparent/);
  assert.match(trigger, /data-\[state=active\]:text-primary-foreground/);
  assert.doesNotMatch(trigger, /bg-muted|border-b-2|text-blue|bg-blue|amber|teal|purple|indigo|border-primary/);
  assert.match(tabsPillIndicatorClass, /bg-primary/);
  assert.match(tabsPillIndicatorClass, /rounded-full/);
});

test("segmented is one pill track that holds the same primary pill mark", () => {
  const list = cn(tabsListVariants({ variant: "segmented" }));
  assert.match(list, /rounded-full/);
  assert.match(list, /bg-muted/);
  assert.match(list, /inline-flex/);
  assert.match(list, /w-max/);
  assert.doesNotMatch(list, /border-b(?!order)|min-w-full|rounded-none|rounded-md/);

  const trigger = cn(tabsTriggerVariants({ variant: "segmented" }));
  assert.match(trigger, /rounded-full/);
  assert.doesNotMatch(trigger, /rounded-none|rounded-md|rounded-lg|rounded-xl/);
  // Inactive tabs sit on the track with no fill of their own.
  assert.match(trigger, /border-transparent/);
  assert.match(trigger, /bg-transparent/);
  assert.match(trigger, /text-muted-foreground/);
  // The mark is the primary fill, so the active label flips with it.
  assert.match(trigger, /data-\[state=active\]:text-primary-foreground/);
  assert.doesNotMatch(trigger, /text-blue|bg-blue|amber|teal|purple|indigo|border-primary/);

  // The mark is the same primary pill the chip row uses; only the track differs.
  assert.match(tabsPillIndicatorClass, /bg-primary/);
  assert.match(tabsPillIndicatorClass, /rounded-full/);
});

test("the count chip is shared by every tab look", () => {
  assert.match(tabsBadgeClass, /rounded-full/);
  assert.match(tabsBadgeClass, /bg-background/);
  assert.match(tabsBadgeClass, /text-foreground/);
  assert.match(tabsBadgeClass, /tabular-nums/);
  assert.doesNotMatch(tabsBadgeClass, /text-blue|bg-primary/);
});

test("a tab without a color stays the neutral tab", () => {
  assert.equal(cn(tabsColorVariants({})), "");
  assert.equal(cn(tabsColorVariants({ color: undefined })), "");
  for (const variant of ["default", "pill", "segmented"] as const) {
    const trigger = cn(tabsTriggerVariants({ variant }), tabsColorVariants({}));
    assert.doesNotMatch(trigger, /text-blue|text-teal|bg-surface/);
  }
});

test("a color paints the icon in both states and the label only when active", () => {
  const blue = cn(tabsColorVariants({ color: "blue" }));
  // The icon is the identity mark, so it keeps the hue before the tab is clicked.
  assert.match(blue, /\[&_svg\]:text-blue-600/);
  assert.match(blue, /dark:\[&_svg\]:text-blue-400/);
  // A solid mark fills with the hue, so the icon hands the color back. The dark
  // twin is the point: without it the 400 ties on specificity and lands later.
  assert.match(blue, /data-\[state=active\]:\[&_svg\]:text-current/);
  assert.match(blue, /dark:data-\[state=active\]:\[&_svg\]:text-current/);
  // The label joins the hue on the underline and on the chip row, and nowhere else.
  assert.match(blue, /data-\[variant=default\]:data-\[color=blue\]:data-\[state=active\]:text-blue-700/);
  assert.match(blue, /data-\[variant=pill\]:data-\[color=blue\]:data-\[state=active\]:text-blue-700/);
  assert.doesNotMatch(blue, /data-\[variant=default\]:data-\[color=blue\]:bg-|rounded-full/);
});

test("the segmented bar keeps its own active foreground, not a restated one", () => {
  // The base rule already carries it; a color rule restating it would be dead
  // weight a rename could silently break.
  for (const color of ["blue", "pink"] as const) {
    const trigger = cn(tabsTriggerVariants({ variant: "segmented" }), tabsColorVariants({ color }));
    assert.match(trigger, /data-\[state=active\]:text-primary-foreground/);
    assert.doesNotMatch(trigger, /data-\[variant=segmented\]:data-\[color=/);
    assert.doesNotMatch(cn(tabsColorVariants({ color })), /text-primary-foreground/);
  }
});

test("a colored chip is still the neutral chip until it is hovered", () => {
  // The regression: an opaque per-tab fill (bg-surface) won on specificity over
  // the shared bg-foreground/10 and turned the row into a strip of boxes.
  for (const color of ["blue", "green", "orange", "teal", "purple", "pink"] as const) {
    const trigger = cn(tabsTriggerVariants({ variant: "pill" }), tabsColorVariants({ color }));
    assert.doesNotMatch(trigger, /bg-surface/);
    assert.match(trigger, /bg-foreground\/10/);
    // The only fill a hue may add to a resting chip is its own 10% hover.
    assert.match(trigger, new RegExp(`not-data-\\[state=active\\]:hover:bg-${color}-500\\/10`));
    assert.match(trigger, new RegExp(`data-\\[state=active\\]:border-${color}-400\\/60`));
  }
});

test("the chip row tints the border, the active label and the hover", () => {
  const purple = cn(tabsColorVariants({ color: "purple" }));
  assert.match(purple, /data-\[variant=pill\]:data-\[color=purple\]:data-\[state=active\]:border-purple-400\/60/);
  assert.match(
    purple,
    /data-\[variant=pill\]:data-\[color=purple\]:not-data-\[state=active\]:hover:bg-purple-500\/10/,
  );
  // An active chip must stay see-through so the sliding mark shows through it.
  assert.doesNotMatch(purple, /data-\[state=active\]:bg-purple-\d/);
});

test("every hue ships a light and a dark pair for the icon and the active label", () => {
  const hues = ["blue", "green", "orange", "teal", "purple", "pink"] as const;
  for (const hue of hues) {
    const classes = cn(tabsColorVariants({ color: hue }));
    assert.match(classes, new RegExp(`\\[&_svg\\]:text-${hue}-600`));
    assert.match(classes, new RegExp(`dark:\\[&_svg\\]:text-${hue}-400`));
    assert.match(classes, new RegExp(`data-\\[variant=default\\]:data-\\[color=${hue}\\]:data-\\[state=active\\]:text-${hue}-700`));
    assert.match(
      classes,
      new RegExp(`dark:data-\\[variant=pill\\]:data-\\[color=${hue}\\]:data-\\[state=active\\]:text-${hue}-300`),
    );
    // The mark of a colored tab is the same hue as its label.
    assert.equal(tabsSolidMarkColorClass[hue], `bg-${hue}-500`);
    assert.equal(tabsWashMarkColorClass[hue], `bg-${hue}-500/10`);
  }
  // Both mark tables answer for the same hues, so no hue falls through to
  // undefined and leaves the mark untinted.
  assert.deepEqual(
    Object.keys(tabsSolidMarkColorClass).sort(),
    Object.keys(tabsWashMarkColorClass).sort(),
  );
});

test("a color never lands on a tab that did not ask for it", () => {
  const classes = cn(tabsColorVariants({ color: "green" }));
  for (const other of ["blue", "orange", "teal", "purple", "pink"]) {
    assert.doesNotMatch(classes, new RegExp(`data-\\[color=${other}\\]`));
    assert.doesNotMatch(classes, new RegExp(`text-${other}-`));
  }
});

test("the mark changes hue on the same clock it slides", () => {
  // Without background-color in the list the hue snaps on the first frame.
  assert.match(tabsPillIndicatorClass, /transition-\[transform,width,height,background-color\]/);
  assert.match(tabsUnderlineIndicatorClass, /transition-\[transform,width,background-color\]/);
  for (const mark of [tabsPillIndicatorClass, tabsUnderlineIndicatorClass]) {
    assert.match(mark, /duration-300/);
    assert.match(mark, /ease-out/);
    assert.match(mark, /motion-reduce:transition-none/);
  }
  // Every wash is 10%, so the crossfade never dips through transparent.
  for (const wash of Object.values(tabsWashMarkColorClass)) {
    assert.match(wash, /\/10$/);
  }
});
