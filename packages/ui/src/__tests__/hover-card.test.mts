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

test("the pointer path is Radix's, timers and all", () => {
  // This is the load-bearing one. Radix already schedules the open on the trigger's
  // delay, already cancels that close the moment the pointer reaches the card, and
  // already declines to close while a pointer is held down inside it or the user has a
  // selection in it (`react-hover-card@1.1.23` `index.mjs:50-55`, `121`, `195-201`).
  //
  // An earlier draft re-implemented that timer to work around a card that closed under
  // the pointer. That defect does not exist in the pinned version, and re-implementing
  // the timer silently switched off the selection guard — a card you could not read
  // inside. Both halves of that are asserted here, because neither shows up in a render.
  assert.doesNotMatch(
    component,
    /onPointerEnter=/,
    "a trigger pointer-enter handler is the start of a second intent layer",
  );
  assert.doesNotMatch(component, /onPointerLeave=/);
  assert.doesNotMatch(
    component,
    /setTimeout/,
    "the only timers left are Radix's, and they carry the guard",
  );
  assert.doesNotMatch(component, /isHoverPointer/, "Radix's `excludeTouch` already does this");
  // The open state is still ours, because the two behaviours below need it to be.
  assert.match(component, /open=\{open\}/);
  assert.match(component, /onOpenChange=\{setOpen\}/);
});

test("both delays reach the primitive, or a caller's openDelay means two things", () => {
  // With the pointer path handed back to Radix, these two props are the only thing
  // deciding when anything opens. Reading them here without passing them down left the
  // primitive on its own 700ms/300ms while the component appeared to honour the caller's.
  assert.match(component, /openDelay=\{openDelay\}/);
  assert.match(component, /closeDelay=\{closeDelay\}/);
  assert.match(component, /openDelay = DEFAULT_OPEN_DELAY/);
  assert.match(component, /closeDelay = DEFAULT_CLOSE_DELAY/);
});

test("focus opens at once, without waiting out the pointer's delay", () => {
  // Radix routes focus through `onOpen`, which is the pointer path, so tabbing onto a
  // trigger otherwise waits 700ms for a card the keyboard user has already asked for.
  // Preventing is what suppresses the primitive's half: `composeEventHandlers` skips
  // its argument once the caller's has.
  assert.match(
    component,
    /onFocus=\{\(event\) => \{[\s\S]*?event\.preventDefault\(\);[\s\S]*?openNow\(\)/,
  );
  // And it is the only place we open, so nothing else can re-introduce the delay.
  assert.equal((component.match(/openNow\(\)/g) ?? []).length, 1);
});

test("focus leaving the card closes it", () => {
  // Radix prevents `onFocusOutside` (`index.mjs:186-188`), which is how a card ends up
  // stranded on screen once the user tabs past it.
  assert.match(
    component,
    /onFocusOutside=\{\(event\) => \{[\s\S]*?event\.preventDefault\(\);[\s\S]*?dismiss\(\)/,
  );
});

test("focus moving into the card is not a departure", () => {
  // The one keyboard case Radix's pointer cancellation does not cover: tab from the
  // trigger into the card. The trigger's blur would otherwise schedule the close and
  // nothing would call it off, so the card shut under the focus it had just received.
  // `relatedTarget` is where the focus is going, and it is available synchronously.
  assert.match(component, /onBlur=\{\(event\) => \{[\s\S]*?event\.relatedTarget/);
  assert.match(
    component,
    /if \(to && contentRef\.current\?\.contains\(to\)\) event\.preventDefault\(\);/,
  );
  // Which needs the card's own node, published by the surface and pulled in the trigger.
  assert.match(component, /const \{ openNow, contentRef \} = useHoverCardIntent\("HoverCardTrigger"\)/);
  assert.match(component, /contentRef\.current = content;/);
  assert.match(component, /contentRef\.current = null;/);
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
  // The observer is torn down, and the node it published with it, so a closed card
  // leaves no dangling reference for the trigger's blur to ask.
  assert.match(component, /observer\.disconnect\(\)/);
  assert.match(component, /contentRef\.current = null;/);
});

test("the trigger says it needs an href, because a bare anchor is not focusable", () => {
  // The card opens on focus, and Radix renders the trigger as a real `<a>`. Without an
  // `href` that is not a tab stop, so the focus path never runs and the card is
  // hover-only — which the shipped example hides by passing one.
  assert.match(
    component,
    /Rendered as a real `<a>`, which the keyboard cannot reach without an `href`/,
  );
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
