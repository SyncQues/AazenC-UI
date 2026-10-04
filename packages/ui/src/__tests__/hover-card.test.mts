import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { hoverCardContentClass } from "../hover-card-variants.ts";

const component = readFileSync(
  new URL("../hover-card.tsx", import.meta.url),
  "utf8",
);

test("the card is one panel, a wider popover", () => {
  assert.match(hoverCardContentClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(hoverCardContentClass, /bg-popover/);
  assert.match(hoverCardContentClass, /menu-motion/);
  assert.doesNotMatch(
    hoverCardContentClass,
    /rounded-full|rounded-md|bg-primary/,
  );
});

test("the card is wider than a popover, because a person does not fit in 288px", () => {
  const popover = readFileSync(
    new URL("../popover-variants.ts", import.meta.url),
    "utf8",
  );
  const popoverWidth = Number(/w-(\d+)/.exec(popover)?.[1]);
  const cardWidth = Number(/w-(\d+)/.exec(hoverCardContentClass)?.[1]);
  assert.equal(popoverWidth, 72, "the popover is 18rem, as it has always been");
  assert.ok(
    cardWidth > popoverWidth,
    `the card is ${cardWidth} against a ${popoverWidth} popover`,
  );
});

test("the card takes pointer events, unlike the layer that hosts it", () => {
  // The portal wrapper is hit-transparent, so the card has to opt back in or a
  // link inside a preview card is not clickable.
  assert.match(hoverCardContentClass, /pointer-events-auto/);
  assert.match(component, /menu-presence pointer-events-none fixed inset-0/);
});

test("the open state is held here, not left to Radix's intent handlers", () => {
  // Measured against react-hover-card@1.1.23: Radix schedules its close when the
  // pointer leaves the trigger and nothing cancels it on the card, which is
  // portalled and so shares no pointer region. A controlled `open` is what makes
  // the content's own pointer enter able to call that close off.
  assert.match(component, /open=\{open\}/);
  assert.match(component, /onOpenChange=\{setOpen\}/);
  assert.match(
    component,
    /onPointerEnter=\{\(event\) => \{[\s\S]*?intent\.onEnter\(true\)[\s\S]*?\}\}\s*onPointerLeave/,
    "the content's pointer enter must land in the same handler pair as its leave",
  );
});

test("every one of our intent handlers suppresses Radix's own half", () => {
  // `composeEventHandlers` skips the primitive's handler once the caller's has
  // prevented the event. Without this, two intent layers race and the close the
  // content cancels is scheduled again by the primitive a few lines later.
  // Four on the trigger, three on the content: `onFocusOutside` is Radix's own
  // hook rather than a DOM event and is handled by its own test below.
  const handlers = component.match(
    /on(?:PointerEnter|PointerLeave|Focus|Blur)=\{\(event\) => \{[^}]*\}\}/g,
  );
  assert.equal(
    handlers?.length,
    7,
    "the trigger's four and the content's three",
  );
  for (const handler of handlers) {
    assert.match(handler, /event\.preventDefault\(\)/);
  }
});

test("the card's own links are back in the tab order", () => {
  // Radix forces tabindex="-1" on every focusable node in the card and traps
  // none of them, so tabbing off the trigger walks straight past the card.
  assert.match(
    component,
    /querySelectorAll<HTMLElement>\('\[tabindex="-1"\]'\)/,
  );
  assert.match(component, /removeAttribute\("tabindex"\)/);
});

test("the fix lives inside the portal, because the portal mounts late", () => {
  // Two things that only show up in a real render, and both of them leave the
  // effect quietly doing nothing instead of throwing.
  //
  // Radix's `Presence` mounts its children a render *after* `open` flips, so a
  // component above the portal never re-renders when the card appears.
  assert.match(
    component,
    /<HoverCardPrimitive\.Portal>\s*<HoverCardSurface \{\.\.\.props\} \/>/,
    "the surface has to be inside the portal or its effect runs against nothing",
  );
  // And `Content` takes a forwarded ref and never attaches it, so a ref on it is
  // null for good. The wrapper this file renders is the only safe anchor.
  assert.doesNotMatch(
    component,
    /<HoverCardPrimitive\.Content\s+ref=/,
    "a ref on Radix's Content is never attached",
  );
  assert.match(component, /ref=\{layerRef\}/);
  assert.match(component, /layerRef\.current\?\.querySelector<HTMLElement>/);
});

test("the attribute is watched, not just stripped once", () => {
  // Radix's own effect has no dependency list and runs after every render of the
  // card, and the card re-renders on its own — a focus change inside it is
  // enough. A single pass on mount is undone by the next render.
  assert.match(component, /new MutationObserver\(restore\)/);
  assert.match(component, /attributeFilter: \["tabindex"\]/);
  assert.match(component, /subtree: true/);
  assert.match(component, /return \(\) => observer\.disconnect\(\);/);
});

test("tabbing out of the card closes it", () => {
  // Radix prevents this event, which is what strands a card on screen after the
  // user has tabbed past it.
  assert.match(
    component,
    /onFocusOutside=\{\(event\) => \{[\s\S]*?intent\.onDismiss\(\)/,
  );
});

test("focus opens at once, the pointer goes through the delay", () => {
  assert.match(
    component,
    /onFocus=\{\(event\) => \{[\s\S]*?intent\.onEnter\(true\)/,
  );
  assert.match(
    component,
    /onPointerEnter=\{\(event\) => \{[\s\S]*?intent\.onEnter\(false\)/,
  );
});

test("a touch pointer is not a hover", () => {
  assert.match(component, /function isHoverPointer/);
  assert.match(component, /event\.pointerType !== "touch"/);
  // Both the trigger and the content have to be guarded: a finger resting on the
  // card itself would otherwise hold it open over the page.
  assert.equal((component.match(/isHoverPointer\(event\)/g) ?? []).length, 4);
});

test("the trigger is a real link, so a card about a person is a link", () => {
  assert.match(
    component,
    /function HoverCardTrigger\(\{[\s\S]*?asChild = false/,
  );
  assert.match(
    component,
    /<HoverCardPrimitive\.Trigger[\s\S]*?data-slot="hover-card-trigger"/,
  );
});

test("the parts outside a HoverCard say so instead of rendering half a card", () => {
  assert.match(component, /must be rendered inside <HoverCard>/);
  assert.match(component, /<\$\{part\}> must be rendered/);
});

test("every part carries a data-slot, as the rest of this package does", () => {
  for (const slot of [
    "hover-card",
    "hover-card-trigger",
    "hover-card-content",
  ]) {
    assert.ok(
      component.includes(`data-slot="${slot}"`),
      `${slot} has no data-slot`,
    );
  }
});

test("the class stays mergeable with the caller's", () => {
  // `cn` has to see both, or a `w-72` in a consumer's layout is silently lost
  // behind the panel's own `w-80`.
  assert.match(
    component,
    /className=\{cn\(hoverCardContentClass, className\)\}/,
  );
  const merged = cn(hoverCardContentClass, "w-72");
  assert.match(
    merged,
    /w-72/,
    "the caller's width has to win over the panel's",
  );
  assert.doesNotMatch(merged, /w-80/, "the panel's own width has to give way");
  assert.match(merged, /p-4/, "and the rest of the panel class survives");
});
