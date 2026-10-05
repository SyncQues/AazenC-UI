"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@aazenc/utils";
import { hoverCardContentClass } from "./hover-card-variants";

/** Radix's defaults, kept so anyone arriving from shadcn sees the same timing. */
const DEFAULT_OPEN_DELAY = 700;
const DEFAULT_CLOSE_DELAY = 300;

type HoverCardIntent = {
  /** Focus is a request in its own right: open without waiting out `openDelay`. */
  openNow: () => void;
  /** Escape, a pointer down outside, or the focus leaving the card. */
  dismiss: () => void;
  /** The card's own node, so the trigger can tell a departure from a move into it. */
  contentRef: RefObject<HTMLElement | null>;
};

const HoverCardIntentContext = createContext<HoverCardIntent | null>(null);

function useHoverCardIntent(part: string): HoverCardIntent {
  const intent = useContext(HoverCardIntentContext);
  if (!intent) {
    throw new Error(`<${part}> must be rendered inside <HoverCard>.`);
  }
  return intent;
}

export type HoverCardProps = Omit<
  ComponentProps<typeof HoverCardPrimitive.Root>,
  "className" | "children"
> & {
  children?: ReactNode;
  /** Milliseconds the pointer may rest on the trigger before the card opens. */
  openDelay?: number;
  /** Milliseconds after the pointer and the focus are both gone before it closes. */
  closeDelay?: number;
  className?: string;
};

export interface HoverCardTriggerProps extends Omit<
  ComponentProps<typeof HoverCardPrimitive.Trigger>,
  "children"
> {
  asChild?: boolean;
  children?: ReactNode;
  /**
   * Kept, unlike `PopoverTrigger`. The trigger is almost always something the
   * trigger cannot size for itself — an avatar, a name, a link in a sentence —
   * so there is always a size or a focus ring to merge in from outside.
   *
   * Rendered as a real `<a>`, which the keyboard cannot reach without an `href`.
   * Pass one, or `asChild` onto something already focusable, or the card is
   * hover-only and the focus path below never runs.
   */
  className?: string;
}

export interface HoverCardContentProps extends Omit<
  ComponentProps<typeof HoverCardPrimitive.Content>,
  "children"
> {
  children?: ReactNode;
  /** Kept for the same reason as the trigger's: a card is often not 320px. */
  className?: string;
}

/**
 * A preview panel that opens on hover and on focus.
 *
 * The open state is held here so two of Radix's defaults can be corrected. The pointer
 * path is left entirely to Radix, because that is the part that was already right.
 *
 * What Radix does, and this file deliberately does not touch: it schedules the open on
 * the trigger's `openDelay` and the close on its `closeDelay`, cancels that close as
 * soon as the pointer reaches the card, and declines to close at all while a pointer is
 * held down inside the card or the user has a selection in it — see
 * `react-hover-card@1.1.23` `index.mjs:50-55`, `121`, `195-201`. Re-implementing that
 * timer to fix a card that closed under the pointer would be re-implementing a defect
 * this version does not have, and would have cost the selection guard with it: Radix
 * holds a card open for as long as you are reading inside it, which is the whole reason
 * a card can hold a link.
 *
 * What this file does change, both measured against that same version:
 *
 *  - **focus opens at once.** Radix routes focus through the pointer's `openDelay`
 *    (`index.mjs:93`), so tabbing onto a trigger waits 700ms for a card the keyboard
 *    user has already asked for.
 *  - **focus leaving the card closes it.** Radix prevents `onFocusOutside`
 *    (`index.mjs:186-188`), which strands a card on screen once the user tabs past it.
 */
function HoverCard({
  openDelay = DEFAULT_OPEN_DELAY,
  closeDelay = DEFAULT_CLOSE_DELAY,
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: HoverCardProps) {
  // The root carries no classes of its own, so `className` rides `...props` to Radix.
  // Latched, as `SegmentedControl` latches: a parent supplying `open` with its
  // data must not flip the card controlled and discard what the user found.
  const [isControlled] = useState(openProp !== undefined);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const open = isControlled ? (openProp ?? false) : uncontrolledOpen;
  const contentRef = useRef<HTMLElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const openNow = useCallback(() => setOpen(true), [setOpen]);
  const dismiss = useCallback(() => setOpen(false), [setOpen]);

  const intent: HoverCardIntent = { openNow, dismiss, contentRef };

  return (
    <HoverCardIntentContext.Provider value={intent}>
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={open}
        // Both delays belong to Radix, which owns the only timers left. Handing them
        // to the primitive rather than reading them here is what keeps a caller's
        // `openDelay` from meaning one thing on the pointer path and another on ours.
        openDelay={openDelay}
        closeDelay={closeDelay}
        onOpenChange={setOpen}
        {...props}
      >
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardIntentContext.Provider>
  );
}

/** Renders a real `<a>` by default, so a card about a person is a link. */
function HoverCardTrigger({
  asChild = false,
  className,
  onFocus,
  onBlur,
  ...props
}: HoverCardTriggerProps) {
  const { openNow, contentRef } = useHoverCardIntent("HoverCardTrigger");

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      asChild={asChild}
      className={className}
      onFocus={(event) => {
        // Preventing is how a handler suppresses the primitive's own half:
        // `composeEventHandlers` skips the second argument once the first has.
        // Otherwise Radix opens on its own `openDelay` and this is a 700ms wait.
        event.preventDefault();
        onFocus?.(event);
        openNow();
      }}
      onBlur={(event) => {
        const to = event.relatedTarget as Node | null;
        // Focus moving into the card is intent, not a departure. Radix cancels a
        // scheduled close on the card's *pointer* enter, so a card opened by keyboard
        // would otherwise be closed out from under the focus it had just received.
        if (to && contentRef.current?.contains(to)) event.preventDefault();
        onBlur?.(event);
      }}
      {...props}
    />
  );
}

function HoverCardContent({ className, ...props }: HoverCardContentProps) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardSurface className={className} {...props} />
    </HoverCardPrimitive.Portal>
  );
}

/**
 * The layer and the card, inside the portal, as one component.
 *
 * It has to be inside the portal rather than above it: Radix's `Presence` mounts
 * its children a render *after* `open` flips, so a component above the portal
 * does not re-render when the card appears, and any effect it owns runs against
 * a portal that is not there yet. Mounted in here, it mounts with the card.
 */
function HoverCardSurface({
  sideOffset = 8,
  align = "center",
  onFocusOutside,
  className,
  children,
  ...props
}: HoverCardContentProps) {
  const { dismiss, contentRef } = useHoverCardIntent("HoverCardSurface");
  // The ref is on the wrapper this file renders. Radix's `Content` takes a
  // forwarded ref and never attaches it, so a ref on it stays null for good.
  const layerRef = useRef<HTMLDivElement | null>(null);

  // Radix forces `tabindex="-1"` on every focusable node in the card and traps
  // none of it, so Tab walks straight past the card's links. Lifting the
  // attribute back off makes it an ordinary stop in the tab order.
  //
  // Watching the attribute rather than doing it once: Radix's own effect runs
  // after every render of the card, with no dependency list, and the card
  // re-renders on its own — a focus change inside it is enough. A single pass on
  // mount would be undone by the next render with nothing here to answer.
  useEffect(() => {
    const content = layerRef.current?.querySelector<HTMLElement>(
      '[data-slot="hover-card-content"]',
    );
    if (!content) return;
    contentRef.current = content;
    const restore = () =>
      content
        .querySelectorAll<HTMLElement>('[tabindex="-1"]')
        .forEach((node) => {
          // A `data-slot` mark is this library's own, not Radix forcing focus away.
          if (!node.hasAttribute("data-slot")) node.removeAttribute("tabindex");
        });
    restore();
    const observer = new MutationObserver(restore);
    observer.observe(content, {
      attributes: true,
      attributeFilter: ["tabindex"],
      subtree: true,
    });
    return () => {
      observer.disconnect();
      contentRef.current = null;
    };
  }, [contentRef]);

  return (
    <div
      ref={layerRef}
      className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]"
    >
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        data-presence=""
        align={align}
        sideOffset={sideOffset}
        onFocusOutside={(event) => {
          // Preventing is how a handler suppresses the primitive's own half.
          // Radix uses this one to *keep* a card open once the focus has left, which
          // is how a card ends up stranded on screen after the user tabs past it.
          event.preventDefault();
          onFocusOutside?.(event);
          dismiss();
        }}
        className={cn(hoverCardContentClass, className)}
        {...props}
      >
        {children}
      </HoverCardPrimitive.Content>
    </div>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
