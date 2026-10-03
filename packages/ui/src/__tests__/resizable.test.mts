import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  resizableCollapseButtonVariants,
  resizableCollapseGripVariants,
  resizableCollapseVariants,
  resizableGroupClass,
  resizableHandleGripVariants,
  resizableHandleVariants,
  resizablePanelClass,
} from "../resizable-variants.ts";
import {
  COLLAPSE_SLOT,
  collapseSides,
  collapsibleHandleAround,
  entriesInDomOrder,
  isCollapseAffordance,
  panelsAround,
  type ResizableEntry,
} from "../resizable-utils.ts";

const orientations = ["horizontal", "vertical"] as const;
const variants = ["rule", "band"] as const;

/* The child order. These run the real functions, because ordering is where
   the bugs were. */

const panel = (id: string): ResizableEntry => ({
  id,
  kind: "panel",
  panelRef: { current: { id } } as unknown as ResizableEntry["panelRef"],
});
const handle = (id: string, collapsible: boolean): ResizableEntry => ({
  id,
  kind: "handle",
  collapsible: { current: collapsible },
});
/** Which panel a ref belongs to, or undefined when nothing is there. */
const panelId = (ref: ResizableEntry["panelRef"]): string | undefined => {
  if (ref === undefined) return undefined;
  return (ref.current as unknown as { id: string } | null)?.id;
};

test("a chevron takes the panel right behind it, not the far one", () => {
  // Three panels and two handles. Each handle has a panel on either side, and
  // the far panel is just as reachable if the search runs the wrong way.
  const entries = [
    panel("a"),
    handle("h1", true),
    panel("b"),
    handle("h2", true),
    panel("c"),
  ];

  assert.equal(panelId(panelsAround(entries, 1).start), "a");
  assert.equal(
    panelId(panelsAround(entries, 1).end),
    "b",
    "h1 must reach b, not c",
  );
  assert.equal(
    panelId(panelsAround(entries, 3).start),
    "b",
    "h2 must reach b, not a",
  );
  assert.equal(panelId(panelsAround(entries, 3).end), "c");
});

test("a handle at either end of a group has only one panel to work with", () => {
  const leading = panelsAround([handle("h", true), panel("b")], 0);
  assert.equal(
    panelId(leading.start),
    undefined,
    "nothing sits before the first child",
  );
  assert.equal(panelId(leading.end), "b", "the panel after it is still found");

  const trailing = panelsAround([panel("a"), handle("h", true)], 1);
  assert.equal(
    panelId(trailing.start),
    "a",
    "the panel before it is still found",
  );
  assert.equal(
    panelId(trailing.end),
    undefined,
    "nothing sits after the last child",
  );
});

test("an index nothing owns finds nothing, rather than reaching into the group", () => {
  // Every first render returns -1. Unguarded, `slice(0, -1)` drops the *last*
  // child, so a chevron would collapse the first panel in the group.
  const entries = [panel("a"), handle("h1", true), panel("b")];

  for (const index of [-1, -99, entries.length, 99]) {
    assert.deepEqual(
      panelsAround(entries, index),
      { start: undefined, end: undefined },
      `index ${index} must not resolve a panel`,
    );
    assert.equal(
      collapsibleHandleAround(entries, index),
      false,
      `index ${index} must be false`,
    );
  }

  // slice() truncates a non-integer index, so it is checked too.
  for (const index of [1.5, Number.NaN]) {
    assert.deepEqual(panelsAround(entries, index), {
      start: undefined,
      end: undefined,
    });
    assert.equal(collapsibleHandleAround(entries, index), false);
  }

  // In-range values still work, so the guard is not refusing to answer.
  assert.equal(panelId(panelsAround(entries, 0).end), "b");
  assert.equal(panelId(panelsAround(entries, 2).start), "a");
});

test("a panel only becomes collapsible for a handle it is actually beside", () => {
  // The regression: reading every handle in the group made `a` collapsible
  // because of a handle two panels away.
  const entries = [
    panel("a"),
    handle("plain", false),
    panel("b"),
    handle("shut", true),
    panel("c"),
  ];

  assert.equal(
    collapsibleHandleAround(entries, 0),
    false,
    "a is beside the plain handle",
  );
  assert.equal(
    collapsibleHandleAround(entries, 2),
    true,
    "b is beside the collapsible one",
  );
  assert.equal(
    collapsibleHandleAround(entries, 4),
    true,
    "c is beside the collapsible one",
  );
});

test("a group with no collapsible handle leaves every panel alone", () => {
  const entries = [panel("a"), handle("plain", false), panel("b")];
  assert.equal(collapsibleHandleAround(entries, 0), false);
  assert.equal(collapsibleHandleAround(entries, 2), false);
  assert.equal(collapsibleHandleAround([panel("a"), panel("b")], 0), false);
});

test("a handle's collapsible value is read live, so flipping the prop is seen", () => {
  // The regression: the value rode behind a ref only the handle re-rendered,
  // so the panels reading it thought nothing was collapsible.
  const entry = handle("h", false);
  const entries = [panel("a"), entry, panel("b")];

  assert.equal(
    collapsibleHandleAround(entries, 0),
    false,
    "shut is off to begin with",
  );
  entry.collapsible!.current = true;
  assert.equal(collapsibleHandleAround(entries, 0), true, "and now it is on");
  entry.collapsible!.current = false;
  assert.equal(collapsibleHandleAround(entries, 0), false, "and off again");
});

/* The order, which registration gets wrong on its own. */

/** A DOM stand-in: 4 is FOLLOWING, 2 is PRECEDING. */
const node = (order: number) => ({
  order,
  compareDocumentPosition: (other: { order: number }) =>
    other.order > order ? 4 : 2,
});

const placed = (id: string, order: number | null): ResizableEntry => ({
  id,
  kind: "panel",
  panelRef: { current: { id } } as unknown as ResizableEntry["panelRef"],
  elementRef:
    order === null ? { current: null } : { current: node(order) as never },
});

test("a child that mounts late still sorts to where the user sees it", () => {
  // Registered a, h, late — but in the document the handle is last, because
  // `late` turned up after it and belongs between the two panels.
  const registered = [placed("a", 0), placed("h", 2), placed("late", 1)];
  const sorted = entriesInDomOrder(registered);

  assert.deepEqual(
    sorted.map((entry) => entry.id),
    ["a", "late", "h"],
    "the late panel sorted to where it is, not where it registered",
  );

  // Which is the whole reason: the chevrons now sit next to the right panel.
  const index = sorted.findIndex((entry) => entry.id === "h");
  assert.equal(panelId(panelsAround(sorted, index).start), "late");
  assert.equal(panelId(panelsAround(sorted, index).end), undefined);

  // Uncorrected, the same handle reaches back to `a` instead.
  const wrong = registered.findIndex((entry) => entry.id === "h");
  assert.equal(panelId(panelsAround(registered, wrong).start), "a");
});

test("entries with no DOM node keep the order they registered in", () => {
  // First paint and every server render, where registration order is the best
  // available answer.
  const entries = [
    placed("a", 0),
    placed("b", null),
    placed("c", 2),
    placed("d", null),
  ];
  assert.deepEqual(
    entriesInDomOrder(entries).map((entry) => entry.id),
    ["a", "b", "c", "d"],
  );

  // A group of entries with no refs at all is the same case.
  const bare = [panel("a"), handle("h", false), panel("b")];
  assert.deepEqual(
    entriesInDomOrder(bare).map((entry) => entry.id),
    ["a", "h", "b"],
  );
});

test("sorting the order does not disturb the array it was given", () => {
  const entries = [placed("a", 2), placed("h", 0), placed("b", 1)];
  const order = entries.map((entry) => entry.id);
  entriesInDomOrder(entries);
  assert.deepEqual(
    entries.map((entry) => entry.id),
    order,
    "the caller's array was reordered",
  );
});

/* The drag guard: the regression is `stopPropagation` on the chevron not
   reaching a listener the library puts on the document in the capture phase. */

/** An element stub that resolves `closest` the way the real one would. */
const elementIn = (inside: boolean) => ({
  closest: (selector: string) => {
    // The selector is part of the contract: it is what makes the guard specific
    // to the chevron pill rather than blanket-preventing presses everywhere.
    assert.equal(selector, `[data-slot="${COLLAPSE_SLOT}"]`);
    return inside ? ({} as Element) : null;
  },
});

test("a press on the chevron pill is the one press the drag guard can see", () => {
  assert.equal(
    isCollapseAffordance(elementIn(true) as unknown as EventTarget),
    true,
  );
  assert.equal(
    isCollapseAffordance(elementIn(false) as unknown as EventTarget),
    false,
  );
});

test("the drag guard survives the targets a real event actually carries", () => {
  // Text nodes and window are legal `pointerdown` targets and have no `closest`,
  // so this duck types rather than using `instanceof Element`.
  assert.equal(isCollapseAffordance(null), false);
  assert.equal(isCollapseAffordance(undefined), false);
  assert.equal(isCollapseAffordance({} as unknown as EventTarget), false);
  assert.equal(isCollapseAffordance("#text" as unknown as EventTarget), false);
  assert.equal(
    isCollapseAffordance({ nodeType: 3 } as unknown as EventTarget),
    false,
    "a bare object with no closest is not a crash",
  );
});

test("the guard is registered where the library's own listener cannot precede it", () => {
  // Not a behaviour test: there is no DOM here. It is here because the fix is
  // one argument away from being undone.
  const source = readFileSync(
    new URL("../resizable.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /addEventListener\(\s*"pointerdown"/);
  // Third argument true === capture, on the document: the library registers
  // there too, so only an earlier capture listener is early enough.
  assert.match(
    source,
    /document\.addEventListener\(\s*"pointerdown",[\s\S]*?\n\s*true,?\s*\n?\s*\);/,
  );
  // The descendant stopPropagation that cannot work, and did.
  assert.doesNotMatch(
    source,
    /onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/,
  );
});

/* The chevron's keyboard behaviour. */

test("a key pressed on a chevron never reaches the separator", () => {
  // The library preventDefaults Enter on the separator, so without this the
  // keydown bubbled into it and collapsed the *first* panel.
  const source = readFileSync(
    new URL("../resizable.tsx", import.meta.url),
    "utf8",
  );
  const buttons = source.match(/<button[\s\S]*?<\/button>/g) ?? [];

  assert.equal(
    buttons.length,
    2,
    "there should be exactly two chevron buttons",
  );
  for (const button of buttons) {
    assert.match(
      button,
      /onKeyDown=\{\(event\) => event\.stopPropagation\(\)\}/,
    );
    // Still a real button, so Space and Enter both mean what they should.
    assert.match(button, /type="button"/);
  }
});

test("each chevron is named for the side it acts on", () => {
  // "Toggle", never "Collapse": nothing re-renders to correct an action label.
  assert.deepEqual(collapseSides("horizontal"), {
    start: "left",
    end: "right",
  });
  // A stacked group reaches up and down, not left and right.
  assert.deepEqual(collapseSides("vertical"), { start: "top", end: "bottom" });
});

/* The collapse control's appearance. */

test("the pill is a row beside a row of panels and a column down a stack", () => {
  const horizontal = resizableCollapseVariants({ orientation: "horizontal" });
  const vertical = resizableCollapseVariants({ orientation: "vertical" });

  assert.match(horizontal, /h-6/);
  assert.match(horizontal, /flex-row/);
  assert.doesNotMatch(horizontal, /w-6|flex-col/);

  assert.match(vertical, /w-6/);
  assert.match(vertical, /flex-col/);
  assert.doesNotMatch(vertical, /h-6|flex-row/);

  for (const className of [horizontal, vertical]) {
    assert.match(className, /rounded-md/);
    assert.match(className, /border-border/);
    assert.match(className, /bg-background/);
    // It floats over both panels, so it has to sit above them.
    assert.match(className, /z-10/);
  }
});

test("a chevron button fills the end of the pill, not just its own glyph", () => {
  const horizontal = resizableCollapseButtonVariants({
    orientation: "horizontal",
  });
  const vertical = resizableCollapseButtonVariants({ orientation: "vertical" });

  assert.match(horizontal, /h-full/);
  assert.match(horizontal, /w-5/);
  assert.match(vertical, /w-full/);
  assert.match(vertical, /h-5/);

  for (const className of [horizontal, vertical]) {
    // Two controls inside a ten pixel handle cannot both be glyph sized.
    assert.match(className, /items-center/);
    assert.match(className, /justify-center/);
    assert.match(className, /\[&>svg\]:size-2\.5/);
    assert.match(className, /focus-visible:ring-\[3px\]/);
  }
});

test("only the stacked group turns its chevrons, and its dots with them", () => {
  // The same turn the standalone grip gets: a chevron that keeps pointing left
  // in a stacked group is pointing at nothing.
  assert.match(
    resizableCollapseButtonVariants({ orientation: "vertical" }),
    /\[&>svg\]:rotate-90/,
  );
  assert.doesNotMatch(
    resizableCollapseButtonVariants({ orientation: "horizontal" }),
    /rotate-/,
  );
  assert.match(
    resizableCollapseGripVariants({ orientation: "vertical" }),
    /\[&>svg\]:rotate-90/,
  );
  assert.doesNotMatch(
    resizableCollapseGripVariants({ orientation: "horizontal" }),
    /rotate-/,
  );
});

test("the dots between the chevrons bring no box of their own", () => {
  // They sit inside a pill that already has a border and a fill. A second
  // rounded box in the middle of the first reads as a mistake.
  for (const orientation of orientations) {
    const className = resizableCollapseGripVariants({ orientation });
    assert.doesNotMatch(className, /border|bg-|rounded|shadow/);
  }
});

test("the two handle looks never borrow each other's colour", () => {
  // The presence of `after:` is the whole difference between a rule and a band.
  const rule = resizableHandleVariants({
    orientation: "horizontal",
    variant: "rule",
  });
  const band = resizableHandleVariants({
    orientation: "horizontal",
    variant: "band",
  });

  assert.match(rule, /after:bg-border/);
  assert.doesNotMatch(band, /after:/);
});

test("the collapse styles are tokens like everything else", () => {
  const classNames = [
    ...orientations.map((orientation) =>
      resizableCollapseVariants({ orientation }),
    ),
    ...orientations.map((orientation) =>
      resizableCollapseButtonVariants({ orientation }),
    ),
    ...orientations.map((orientation) =>
      resizableCollapseGripVariants({ orientation }),
    ),
  ];
  for (const className of classNames) {
    assert.doesNotMatch(className, /oklch\(|#[0-9a-f]{3,8}\b|\bdark:/);
  }
});

test("the group is styled by the library and by nothing else", () => {
  // Empty on purpose: the library sets the group's box as inline styles, so any
  // class here loses.
  assert.equal(resizableGroupClass, "");
});

test("a horizontal group gets an upright target with an upright rule", () => {
  const className = resizableHandleVariants({
    orientation: "horizontal",
    variant: "rule",
  });

  // Panels side by side, so the target is ten pixels across and full height.
  assert.match(className, /\bw-2\.5\b/);
  assert.match(className, /\bh-full\b/);
  // And the rule inside it runs the same way: a vertical line down the middle.
  assert.match(className, /after:w-px/);
  assert.match(className, /after:inset-y-0/);
  assert.match(className, /after:left-1\/2/);
  assert.match(className, /after:-translate-x-1\/2/);

  // The target itself stays unpainted; only the rule inside it carries colour.
  const onTheElement = className
    .split(" ")
    .filter((token) => !token.split(":").includes("after"));
  assert.doesNotMatch(onTheElement.join(" "), /bg-/);
});

test("a vertical group gets a lying target with a lying rule", () => {
  const className = resizableHandleVariants({
    orientation: "vertical",
    variant: "rule",
  });

  // Panels stacked, so the target is ten pixels tall and the full width.
  assert.match(className, /\bh-2\.5\b/);
  assert.match(className, /\bw-full\b/);
  // And the rule inside it runs across: a horizontal line through the middle.
  assert.match(className, /after:h-px/);
  assert.match(className, /after:inset-x-0/);
  assert.match(className, /after:top-1\/2/);
  assert.match(className, /after:-translate-y-1\/2/);
});

test("the handle never claims the whole axis, because it cannot shrink", () => {
  // react-resizable-panels styles the separator with inline flex-grow: 0 and
  // flex-shrink: 0 and leaves its base size to width. A handle told to be
  // w-full inside a side-by-side group therefore demands the entire frame and
  // can never give any of it back, while the panels — inline min-width: 0 —
  // shrink to nothing. So the axis the group lays out along is the one axis the
  // handle must never fill.
  const laidOutAlong = { horizontal: "width", vertical: "height" } as const;
  const alongTheAxis = { horizontal: /\bw-full\b/, vertical: /\bh-full\b/ };
  const acrossTheAxis = { horizontal: /\bh-2\.5\b/, vertical: /\bw-2\.5\b/ };
  const tenPixels = { horizontal: /\bw-2\.5\b/, vertical: /\bh-2\.5\b/ };

  for (const orientation of orientations) {
    for (const variant of variants) {
      const className = resizableHandleVariants({ orientation, variant });
      const where = `${orientation}/${variant}`;

      assert.doesNotMatch(
        className,
        alongTheAxis[orientation],
        `${where} fills the ${laidOutAlong[orientation]} the group lays out along`,
      );
      assert.doesNotMatch(
        className,
        acrossTheAxis[orientation],
        `${where} is ten pixels on the wrong axis`,
      );
      assert.match(
        className,
        tenPixels[orientation],
        `${where} lost its ten-pixel target`,
      );
    }
  }
});

test("the handle turns with the group and never draws two rules", () => {
  const vertical = resizableHandleVariants({ orientation: "vertical" });
  const horizontal = resizableHandleVariants({ orientation: "horizontal" });

  // A side-by-side group is a vertical line; a stacked one is a horizontal one.
  assert.doesNotMatch(horizontal, /after:h-px/);
  assert.doesNotMatch(horizontal, /\bh-2\.5\b/);
  assert.doesNotMatch(vertical, /after:w-px/);
  assert.doesNotMatch(vertical, /\bw-2\.5\b/);
  // Default is the same split shadcn and every IDE ships: panels side by side.
  assert.equal(resizableHandleVariants(), horizontal);
});

test("the rule stays a pixel wide in both directions, whatever the state", () => {
  for (const orientation of orientations) {
    const className = resizableHandleVariants({ orientation, variant: "rule" });
    const rules = className.match(/(?:^|\s)after:(?:h|w)-[^\s"]+/g) ?? [];
    assert.equal(
      rules.length,
      1,
      `${orientation} should draw exactly one rule`,
    );
    assert.doesNotMatch(className, /after:(?:h|w)-\[|after:border\b/);
  }
});

test("every handle state tints the rule, not the ten pixels around it", () => {
  const className = resizableHandleVariants({
    orientation: "vertical",
    variant: "rule",
  });
  for (const state of [
    "hover:after:bg-foreground/40",
    "focus-visible:after:bg-foreground/40",
    "data-[separator=active]:after:bg-primary",
  ]) {
    assert.ok(className.includes(state), `${state} is missing`);
  }
  // The drag state keys off the library's own attribute, which is always set.
  assert.match(className, /data-\[separator=active\]:/);
  assert.doesNotMatch(className, /data-\[separator=focus\]/);
  assert.doesNotMatch(className, /active:/);
});

test("band paints the target itself and generates no pseudo-element", () => {
  for (const orientation of orientations) {
    const className = resizableHandleVariants({ orientation, variant: "band" });

    // No after: utility at all, so the pseudo-element is never created — which
    // is the point: there is nothing of it to see, rest or hover.
    assert.doesNotMatch(className, /after:/, `${orientation} band drew a rule`);
    // The affordance is the target's own background, invisible until touched.
    for (const state of [
      "bg-transparent",
      "hover:bg-border/50",
      "data-[separator=active]:bg-border",
    ]) {
      assert.ok(
        className.includes(state),
        `${orientation} is missing ${state}`,
      );
    }
    // z-10 keeps the band above whatever the panels are painting.
    assert.match(className, /z-10/);
  }
});

test("rule and band are the same size, because a variant only changes how it paints", () => {
  const sizeOf = (className: string) =>
    className
      .split(" ")
      .filter((token) => /^(?:h|w)-(?:2\.5|full)$/.test(token))
      .sort()
      .join(" ");

  for (const orientation of orientations) {
    const rule = resizableHandleVariants({ orientation, variant: "rule" });
    const band = resizableHandleVariants({ orientation, variant: "band" });

    assert.equal(
      sizeOf(rule),
      sizeOf(band),
      `${orientation} changed size between looks`,
    );
    // Sanity: the ten-pixel target is one side and the full run is the other.
    assert.equal(
      sizeOf(rule),
      orientation === "horizontal" ? "h-full w-2.5" : "h-2.5 w-full",
    );
  }
});

test("a panel can always be shrunk below its own content", () => {
  assert.match(resizablePanelClass, /min-w-0/);
  assert.match(resizablePanelClass, /min-h-0/);
  // The library already renders an inner scroller inside every panel.
  assert.doesNotMatch(resizablePanelClass, /overflow|bg-|border/);
});

test("the grip takes the shape of the rule it sits on", () => {
  const vertical = resizableHandleGripVariants({ orientation: "vertical" });
  const horizontal = resizableHandleGripVariants({ orientation: "horizontal" });

  // Panels side by side means an upright rule, so an upright pill.
  assert.match(horizontal, /\bh-4\b/);
  assert.match(horizontal, /\bw-2\.5\b/);
  // Panels stacked means a lying rule, so a lying pill.
  assert.match(vertical, /\bh-2\.5\b/);
  assert.match(vertical, /\bw-4\b/);
  for (const className of [vertical, horizontal]) {
    assert.match(className, /rounded-full/);
    assert.match(className, /bg-muted/);
  }
});

test("only the vertical grip turns its icon, because only it is a pill on its side", () => {
  // The pill keeps the footprint that fits the line; the six dots run along it.
  assert.match(
    resizableHandleGripVariants({ orientation: "vertical" }),
    /\[&>svg\]:rotate-90/,
  );
  assert.doesNotMatch(
    resizableHandleGripVariants({ orientation: "horizontal" }),
    /rotate-/,
  );
  // The default orientation is the upright one, so the default grip does not turn.
  assert.doesNotMatch(resizableHandleGripVariants(), /rotate-/);
});

test("nothing here is a raw colour or a dark-mode patch", () => {
  const classNames = [
    resizableGroupClass,
    resizablePanelClass,
    ...orientations.map((orientation) =>
      resizableHandleGripVariants({ orientation }),
    ),
    ...orientations.flatMap((orientation) =>
      variants.map((variant) =>
        resizableHandleVariants({ orientation, variant }),
      ),
    ),
  ];
  for (const className of classNames) {
    assert.doesNotMatch(className, /oklch\(|#[0-9a-f]{3,8}\b|\bdark:/);
  }
});

/* Read out of the source, because there is no DOM here to run them in. */

test("the resizable parts are the v4 primitives, not the v3 names", () => {
  const source = readFileSync(
    new URL("../resizable.tsx", import.meta.url),
    "utf8",
  );

  // Matched through the namespace: the old v3 names are undefined properties
  // here, so a stale wrapper fails at runtime, not at compile time.
  assert.doesNotMatch(
    source,
    /ResizablePrimitive\.PanelGroup|ResizablePrimitive\.PanelResizeHandle|ResizablePrimitive\.direction/,
  );
  assert.match(source, /ResizablePrimitive\.Group/);
  assert.match(source, /ResizablePrimitive\.Panel/);
  assert.match(source, /ResizablePrimitive\.Separator/);
});

test("the chevrons are hand-rolled, because nothing here earns an icon dependency", () => {
  const source = readFileSync(
    new URL("../resizable.tsx", import.meta.url),
    "utf8",
  );

  // Two buttons and a row of dots do not justify a package. Paths and viewBox
  // are not asserted: a rename should be free.
  assert.doesNotMatch(
    source,
    /lucide-react|@radix-ui\/react-icons|heroicons|react-icons/,
  );
  // Decorative either way: the label on the button carries the meaning.
  assert.match(source, /aria-hidden="true"/);
});

test("the panel keeps a ref that a consumer cannot quietly take over", () => {
  const source = readFileSync(
    new URL("../resizable.tsx", import.meta.url),
    "utf8",
  );

  // The library writes to whichever panelRef it is handed and nothing else, so
  // a consumer's ref alone left ours empty and every chevron doing nothing.
  assert.match(source, /usePanelRef\(\)/);
  assert.match(source, /panelRef=\{composedPanelRef\}/);
  // …and it has to be stable: `useImperativeHandle` folds the ref into its
  // dependency list, so a fresh callback detaches it every commit.
  assert.match(
    source,
    /const composedPanelRef = useMemo\([\s\S]*?composeRefs\(panelRef, consumerPanelRef\)[\s\S]*?\);/,
  );
  // The rest props must not follow the composed refs, or a caller ref replaces them.
  assert.match(
    source,
    /<ResizablePrimitive\.Panel\s+\{\.\.\.props\}[\s\S]*?panelRef=\{composedPanelRef\}/,
  );
});
