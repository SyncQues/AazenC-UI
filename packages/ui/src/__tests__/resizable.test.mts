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
  collapsibleHandleAround,
  panelsAround,
  type ResizableEntry,
} from "../resizable-utils.ts";

const orientations = ["horizontal", "vertical"] as const;
const variants = ["rule", "band"] as const;

/* ------------------------------------------------------------------ *
 * The child order. These run the real functions, because the ordering
 * rules are where the bugs actually were.
 * ------------------------------------------------------------------ */

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
  const entries = [panel("a"), handle("h1", true), panel("b"), handle("h2", true), panel("c")];

  assert.equal(panelId(panelsAround(entries, 1).start), "a");
  assert.equal(panelId(panelsAround(entries, 1).end), "b", "h1 must reach b, not c");
  assert.equal(panelId(panelsAround(entries, 3).start), "b", "h2 must reach b, not a");
  assert.equal(panelId(panelsAround(entries, 3).end), "c");
});

test("a handle at either end of a group has only one panel to work with", () => {
  const leading = panelsAround([handle("h", true), panel("b")], 0);
  assert.equal(panelId(leading.start), undefined, "nothing sits before the first child");
  assert.equal(panelId(leading.end), "b", "the panel after it is still found");

  const trailing = panelsAround([panel("a"), handle("h", true)], 1);
  assert.equal(panelId(trailing.start), "a", "the panel before it is still found");
  assert.equal(panelId(trailing.end), undefined, "nothing sits after the last child");
});

test("a panel only becomes collapsible for a handle it is actually beside", () => {
  // The regression. Reading every handle in the group instead of the nearest one
  // per side made `a` collapsible because of a handle two panels away.
  const entries = [panel("a"), handle("plain", false), panel("b"), handle("shut", true), panel("c")];

  assert.equal(collapsibleHandleAround(entries, 0), false, "a is beside the plain handle");
  assert.equal(collapsibleHandleAround(entries, 2), true, "b is beside the collapsible one");
  assert.equal(collapsibleHandleAround(entries, 4), true, "c is beside the collapsible one");
});

test("a group with no collapsible handle leaves every panel alone", () => {
  const entries = [panel("a"), handle("plain", false), panel("b")];
  assert.equal(collapsibleHandleAround(entries, 0), false);
  assert.equal(collapsibleHandleAround(entries, 2), false);
  assert.equal(collapsibleHandleAround([panel("a"), panel("b")], 0), false);
});

/* ------------------------------------------------------------------ *
 * The collapse control's appearance.
 * ------------------------------------------------------------------ */

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
  const horizontal = resizableCollapseButtonVariants({ orientation: "horizontal" });
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
  assert.match(resizableCollapseButtonVariants({ orientation: "vertical" }), /\[&>svg\]:rotate-90/);
  assert.doesNotMatch(resizableCollapseButtonVariants({ orientation: "horizontal" }), /rotate-/);
  assert.match(resizableCollapseGripVariants({ orientation: "vertical" }), /\[&>svg\]:rotate-90/);
  assert.doesNotMatch(resizableCollapseGripVariants({ orientation: "horizontal" }), /rotate-/);
});

test("the dots between the chevrons bring no box of their own", () => {
  // They sit inside a pill that already has a border and a fill. A second
  // rounded box in the middle of the first reads as a mistake.
  for (const orientation of orientations) {
    const className = resizableCollapseGripVariants({ orientation });
    assert.doesNotMatch(className, /border|bg-|rounded|shadow/);
  }
});

test("a collapsed panel is a pixel off the layout, not a rule that thickens", () => {
  // The two looks stay honest about what they paint: a rule is a line, a band is
  // a band, and neither borrows the other's colour.
  const rule = resizableHandleVariants({ orientation: "horizontal", variant: "rule" });
  const band = resizableHandleVariants({ orientation: "horizontal", variant: "band" });
  assert.match(rule, /after:bg-border/);
  assert.doesNotMatch(band, /after:/);
});

/* ------------------------------------------------------------------ *
 * The wiring that the class strings cannot prove.
 * ------------------------------------------------------------------ */

test("pressing a chevron never also grabs the handle", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");
  const buttons = source.match(/<button[\s\S]*?<\/button>/g) ?? [];

  assert.equal(buttons.length, 2, "there should be exactly two chevron buttons");
  for (const button of buttons) {
    // The separator starts a drag on pointerdown. Without this the chevron would
    // collapse the panel *and* begin a resize from the same press.
    assert.match(button, /onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
    assert.match(button, /type="button"/);
  }
});

test("both chevrons are labelled with the side they act on, per orientation", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  assert.match(source, /aria-label=\{`Toggle the \$\{sides\.start\} panel`\}/);
  assert.match(source, /aria-label=\{`Toggle the \$\{sides\.end\} panel`\}/);
  // "Toggle", never "Collapse": the library does not announce the change, so a
  // label naming the action would be wrong on every second press with nothing to
  // re-render and correct it.
  assert.doesNotMatch(source, /aria-label=\{`Collapse/);
  // Stacked means top and bottom, not left and right.
  assert.match(source, /orientation === "vertical"\s*\?\s*\{\s*start: "top",\s*end: "bottom"/);
  assert.match(source, /start: "left",\s*end: "right"/);
});

test("a chevron asks the panel whether it is already shut before it acts", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  // Collapse only would be a trap: one press and the panel is gone with no way
  // back but the layout prop.
  assert.match(source, /if \(panel\.current\.isCollapsed\(\)\) panel\.current\.expand\(\);/);
  assert.match(source, /else panel\.current\.collapse\(\);/);
  // The library's own primitives, not a hand-rolled layout rewrite.
  assert.doesNotMatch(source, /setLayout|getLayout/);
});

test("the panel takes the ref the library will only fill if it is asked for it", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  assert.match(source, /usePanelRef\(\)/);
  assert.match(source, /panelRef=\{panelRef\}/);
  // collapse() is a documented no-op on a panel that is not collapsible, so a
  // panel beside a collapsible handle is made one.
  assert.match(source, /collapsible=\{collapsible \?\? besideACollapsibleHandle\}/);
});

test("collapsible is a prop of the handle, and spends itself on the class", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  assert.match(source, /collapsible\?: boolean;/);
  // Unconsumed props are spread onto the separator's div and become unknown
  // attributes React warns about.
  assert.match(
    source,
    /function ResizableHandle\(\{[\s\S]*?\bcollapsible\b[\s\S]*?\}\s*:\s*ResizableHandleProps\)/,
  );
  // And a handle that renders the chevron pill does not also render withHandle's
  // grip on top of it.
  assert.match(source, /collapsible \? \(\s*<ResizableCollapseControls/);
});

test("the chevrons are hand-rolled, because nothing here earns an icon dependency", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /lucide-react|@radix-ui\/react-icons|heroicons/);
  assert.match(source, /stroke="currentColor"/);
  assert.match(source, /aria-hidden="true"/);
  // Left and right are two different paths, not one path and a scale flip.
  assert.match(source, /M15 6l-6 6 6 6/);
  assert.match(source, /M9 6l6 6-6 6/);
});

test("the collapse styles are tokens like everything else", () => {
  const classNames = [
    ...orientations.map((orientation) => resizableCollapseVariants({ orientation })),
    ...orientations.map((orientation) => resizableCollapseButtonVariants({ orientation })),
    ...orientations.map((orientation) => resizableCollapseGripVariants({ orientation })),
  ];
  for (const className of classNames) {
    assert.doesNotMatch(className, /oklch\(|#[0-9a-f]{3,8}\b|\bdark:/);
  }
});


test("the group leaves the axis alone, because the library owns it inline", () => {
  assert.match(resizableGroupClass, /h-full/);
  assert.match(resizableGroupClass, /w-full/);
  assert.match(resizableGroupClass, /overflow-hidden/);
  // react-resizable-panels sets display and flex-direction as inline styles on
  // the group, which no class can outrank. A flex-col here would be a lie.
  assert.doesNotMatch(resizableGroupClass, /flex-(col|row)|flex-direction/);
});

test("a horizontal group gets an upright target with an upright rule", () => {
  const className = resizableHandleVariants({ orientation: "horizontal", variant: "rule" });

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
  const className = resizableHandleVariants({ orientation: "vertical", variant: "rule" });

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
      assert.match(className, tenPixels[orientation], `${where} lost its ten-pixel target`);
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
    assert.equal(rules.length, 1, `${orientation} should draw exactly one rule`);
    assert.doesNotMatch(className, /after:(?:h|w)-\[|after:border\b/);
  }
});

test("every handle state tints the rule, not the ten pixels around it", () => {
  const className = resizableHandleVariants({ orientation: "vertical", variant: "rule" });
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
      assert.ok(className.includes(state), `${orientation} is missing ${state}`);
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

    assert.equal(sizeOf(rule), sizeOf(band), `${orientation} changed size between looks`);
    // Sanity: the ten-pixel target is one side and the full run is the other.
    assert.equal(sizeOf(rule), orientation === "horizontal" ? "h-full w-2.5" : "h-2.5 w-full");
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
  assert.match(resizableHandleGripVariants({ orientation: "vertical" }), /\[&>svg\]:rotate-90/);
  assert.doesNotMatch(resizableHandleGripVariants({ orientation: "horizontal" }), /rotate-/);
  // The default orientation is the upright one, so the default grip does not turn.
  assert.doesNotMatch(resizableHandleGripVariants(), /rotate-/);
});

test("nothing here is a raw colour or a dark-mode patch", () => {
  const classNames = [
    resizableGroupClass,
    resizablePanelClass,
    ...orientations.map((orientation) => resizableHandleGripVariants({ orientation })),
    ...orientations.flatMap((orientation) =>
      variants.map((variant) => resizableHandleVariants({ orientation, variant })),
    ),
  ];
  for (const className of classNames) {
    assert.doesNotMatch(className, /oklch\(|#[0-9a-f]{3,8}\b|\bdark:/);
  }
});

test("the resizable parts are the v4 primitives, and only Group and Handle refuse a className", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  // v4 renamed PanelGroup/PanelResizeHandle to Group/Separator. The old names
  // are undefined properties here, and a stale copy of the old wrapper is the
  // most likely way this file gets wrong.
  assert.doesNotMatch(source, /PanelResizeHandle|ResizablePrimitive\.direction/);
  assert.match(source, /ResizablePrimitive\.Group/);
  assert.match(source, /ResizablePrimitive\.Panel/);
  assert.match(source, /ResizablePrimitive\.Separator/);

  for (const slot of [
    "resizable-panel-group",
    "resizable-panel",
    "resizable-handle",
    "resizable-handle-grip",
  ]) {
    assert.ok(source.includes(`data-slot="${slot}"`), `${slot} has no data-slot`);
  }

  // The panel is the one deliberate exception: the library's inner scroller is
  // where a consumer lays content out, so the className has to get through.
  for (const type of ["ResizablePanelGroupProps", "ResizableHandleProps"]) {
    const declaration = source.match(new RegExp(`export type ${type} =[\\s\\S]*?;`))?.[0] ?? "";
    assert.ok(declaration.length > 0, `${type} is not exported`);
    assert.match(declaration, /"className"/, `${type} leaks className`);
  }

  const panelProps =
    source.match(/export type ResizablePanelProps =[^\n]*/)?.[0] ??
    "export type ResizablePanelProps =";
  assert.ok(panelProps.length > 0, "ResizablePanelProps is not exported");
  assert.doesNotMatch(panelProps, /Omit|className/, "ResizablePanelProps refuses a className");
  assert.match(source, /cn\(resizablePanelClass, className\)/);
  assert.match(source, /import \{ cn \} from "@aazenc\/utils"/);
});

test("the handle spends its variant on the class, not on the DOM", () => {
  const source = readFileSync(new URL("../resizable.tsx", import.meta.url), "utf8");

  // Anything left in ...props is spread onto the separator's div, so an
  // unconsumed variant lands as an unknown attribute and React complains.
  assert.match(
    source,
    /function ResizableHandle\(\{[\s\S]*?\bvariant\b[\s\S]*?\}\s*:\s*ResizableHandleProps\)/,
  );
  assert.match(source, /resizableHandleVariants\(\{ orientation, variant \}\)/);
  assert.match(source, /ResizableHandleVariantProps\["variant"\]/);
});
