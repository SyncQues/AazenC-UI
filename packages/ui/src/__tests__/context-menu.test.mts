import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  contextMenuCheckboxItemClass,
  contextMenuContentClass,
  contextMenuItemVariants,
  contextMenuLabelClass,
  contextMenuSeparatorClass,
  contextMenuShortcutClass,
  contextMenuSubTriggerClass,
  dropdownMenuCheckboxItemClass,
  dropdownMenuContentClass,
  dropdownMenuItemVariants,
  dropdownMenuLabelClass,
  dropdownMenuSeparatorClass,
  dropdownMenuShortcutClass,
  dropdownMenuSubTriggerClass,
} from "../menu-variants.ts";

const component = readFileSync(new URL("../context-menu.tsx", import.meta.url), "utf8");

test("the context menu is the dropdown's panel", () => {
  assert.match(contextMenuContentClass, /menu-motion/);
  assert.match(contextMenuContentClass, /bg-popover/);
  assert.match(contextMenuContentClass, /border-border/);
  assert.match(contextMenuContentClass, /shadow-md/);
  assert.match(contextMenuContentClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(contextMenuContentClass, /z-\[var\(--z-popper\)\]/);
  assert.doesNotMatch(contextMenuContentClass, /slide-in-from|backdrop-blur|shadow-lg|bg-background/);
});

test("a right-click menu and a click menu are the same menu, under two names", () => {
  // A second copy of these strings is exactly how the two panels start disagreeing
  // about padding or focus colour. Identity is the assertion, not similarity.
  const pairs: [string, string, string][] = [
    ["content", contextMenuContentClass, dropdownMenuContentClass],
    ["checkable item", contextMenuCheckboxItemClass, dropdownMenuCheckboxItemClass],
    ["label", contextMenuLabelClass, dropdownMenuLabelClass],
    ["separator", contextMenuSeparatorClass, dropdownMenuSeparatorClass],
    ["shortcut", contextMenuShortcutClass, dropdownMenuShortcutClass],
    ["sub trigger", contextMenuSubTriggerClass, dropdownMenuSubTriggerClass],
  ];

  for (const [what, context, dropdown] of pairs) {
    assert.equal(context, dropdown, `context menu ${what} has drifted from the dropdown`);
  }

  for (const tone of ["default", "destructive"] as const) {
    assert.equal(
      contextMenuItemVariants({ tone }),
      dropdownMenuItemVariants({ tone }),
      `context menu item tone=${tone} has drifted from the dropdown`,
    );
  }
});

test("destructive is the only item tone, in both menus", () => {
  const item = cn(contextMenuItemVariants({}));
  assert.match(item, /focus:bg-accent/);
  assert.doesNotMatch(item, /text-destructive/);

  const danger = cn(contextMenuItemVariants({ tone: "destructive" }));
  assert.match(danger, /text-destructive/);
  assert.match(danger, /focus:bg-destructive\/10/);
});

test("the item stays keyboard reachable and never strands a disabled one", () => {
  const item = cn(contextMenuItemVariants({}));
  assert.match(item, /outline-none/);
  assert.match(item, /focus:bg-accent/);
  assert.match(item, /data-\[disabled\]:pointer-events-none/);
  assert.match(item, /motion-reduce:transition-none/);
});

test("the panel is portalled and the wrapper only exists to carry presence", () => {
  // The portal needs an inert full-screen wrapper so the scale animation can run
  // without the panel measuring taps on itself. The panel re-enables its own
  // pointer events, which is why the wrapper and the panel disagree.
  assert.match(component, /ContextMenuPrimitive\.Portal/);
  assert.match(component, /menu-presence pointer-events-none fixed inset-0/);
  assert.match(component, /data-presence=""/);
  assert.match(contextMenuContentClass, /pointer-events-auto/);
  assert.doesNotMatch(contextMenuContentClass, /pointer-events-none/);
});

test("where the panel goes is Radix's, and this component cannot argue", () => {
  // The reason there is no `side`, `align` or `sideOffset` here is not that the author
  // chose to omit them: Radix drops all three from `ContextMenuContentProps` itself
  // (`@radix-ui/react-context-menu` `index.d.ts:26`), so passing one is a type error.
  // Asserting the *absence* of the words in our own source proved nothing — it would
  // pass just as well on an empty file — so this checks the contract it leans on.
  const radixTypes = readFileSync(
    new URL(
      "../../../../node_modules/@radix-ui/react-context-menu/dist/index.d.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const contentProps = /interface ContextMenuContentProps extends ([^{]+)\{/.exec(radixTypes);
  assert.ok(contentProps, "ContextMenuContentProps has to exist for this to mean anything");
  for (const omitted of ["side", "sideOffset", "align"]) {
    assert.ok(
      contentProps[1].includes(`'${omitted}'`),
      `Radix no longer omits \`${omitted}\`, so this component's placement is no longer the only one on offer`,
    );
  }
  // And the one that is genuinely ours: the panel is the dropdown's panel.
  // Wrapped in `cn` so a caller can still add their own classes.
  assert.match(component, /className=\{cn\(\s*contextMenuContentClass\s*,\s*className\s*\)\}/);
});

test("every part the dropdown exposes, the context menu exposes too", () => {
  // A context menu missing a part is a context menu that cannot express a real menu.
  const parts = [
    "ContextMenuCheckboxItem",
    "ContextMenuContent",
    "ContextMenuGroup",
    "ContextMenuItem",
    "ContextMenuLabel",
    "ContextMenuRadioGroup",
    "ContextMenuRadioItem",
    "ContextMenuSeparator",
    "ContextMenuShortcut",
    "ContextMenuSubContent",
    "ContextMenuSubTrigger",
    "ContextMenuTrigger",
  ];

  for (const part of parts) {
    assert.match(component, new RegExp(`function ${part}\\b`), `${part} is not defined`);
    assert.match(component, new RegExp(`\\b${part},`), `${part} is not exported`);
  }
});

test("items carry their tone in the DOM, not only in a class", () => {
  assert.match(component, /data-tone=\{tone\}/);
});

test("the checkable indicator is pinned, so a tick cannot push the label", () => {
  assert.match(component, /className=\{cn\(\s*contextMenuCheckboxItemClass\s*,\s*className\s*\)\}/);
  assert.match(component, /absolute left-2 flex size-3\.5 items-center justify-center/);
});

test("decorative icons inside items are hidden from the screen reader", () => {
  const icons = component.match(/<svg[^>]*>/g) ?? [];
  assert.ok(icons.length >= 2, "expected the tick and the chevron");
  for (const icon of icons) {
    assert.match(icon, /aria-hidden="true"/);
  }
});
