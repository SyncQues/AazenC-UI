"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import { hoverCardContentClass } from "./hover-card-variants";

/** Radix's defaults, kept so anyone arriving from shadcn sees the same timing. */
const DEFAULT_OPEN_DELAY = 700;
const DEFAULT_CLOSE_DELAY = 300;

type HoverCardIntent = {
  open: boolean;
  /** The pointer or the focus arrived somewhere that wants the card. */
  onEnter: (immediate: boolean) => void;
  /** Whatever wanted the card has gone. */
  onLeave: () => void;
  /** Escape, or a pointer down outside. */
  onDismiss: () => void;
};

const HoverCardIntentContext = createContext<HoverCardIntent | null>(null);

function useHoverCardIntent(part: string): HoverCardIntent {
  const intent = useContext(HoverCardIntentContext);
  if (!intent) {
    throw new Error(`<${part}> must be rendered inside <HoverCard>.`);
  }
  return intent;
}

/** A touch pointer has no hover, so a finger resting on a trigger opens nothing. */
function isHoverPointer(event: PointerEvent | FocusEvent): boolean {
  if (!("pointerType" in event)) return true;
  return event.pointerType !== "touch";
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
 * The intent layer is ours, not Radix's. Radix schedules its close when the
 * pointer leaves the *trigger* and never cancels it on the *card*, which is
 * portalled and so shares no pointer region: measured against
 * `react-hover-card@1.1.23`, a card closes 300ms after the pointer leaves the
 * trigger even while the pointer is resting on it. A card you cannot move onto
 * cannot hold a link, which is the only reason to build one. Radix keeps the
 * parts that are hard — portalling, placement, dismissal, presence.
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
  // Latched, as `SegmentedControl` latches: a parent supplying `open` with its
  // data must not flip the card controlled and discard what the user found.
  const [isControlled] = useState(openProp !== undefined);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  const open = isControlled ? (openProp ?? false) : uncontrolledOpen;

  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => clearTimers, []);

  const intent: HoverCardIntent = {
    open,
    onEnter: (immediate) => {
      clearTimeout(closeTimer.current);
      if (immediate || openDelay === 0) {
        clearTimeout(openTimer.current);
        setOpen(true);
        return;
      }
      clearTimeout(openTimer.current);
      // Arriving is not the same as being wanted: a pointer sweeping a row of
      // avatars has to cross the delay or the row strobes.
      openTimer.current = setTimeout(() => setOpen(true), openDelay);
    },
    onLeave: () => {
      clearTimeout(openTimer.current);
      closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
    },
    onDismiss: () => {
      clearTimers();
      setOpen(false);
    },
  };

  return (
    <HoverCardIntentContext.Provider value={intent}>
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={open}
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
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: HoverCardTriggerProps) {
  const intent = useHoverCardIntent("HoverCardTrigger");

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      asChild={asChild}
      className={className}
      onPointerEnter={(event) => {
        // Preventing is how a handler suppresses the primitive's own half:
        // `composeEventHandlers` skips the second argument once the first has.
        // Otherwise Radix's timers race ours and the fix above is undone.
        event.preventDefault();
        onPointerEnter?.(event);
        if (isHoverPointer(event)) intent.onEnter(false);
      }}
      onPointerLeave={(event) => {
        event.preventDefault();
        onPointerLeave?.(event);
        if (isHoverPointer(event)) intent.onLeave();
      }}
      onFocus={(event) => {
        event.preventDefault();
        onFocus?.(event);
        // No delay on focus: tabbing onto a trigger is already the request.
        intent.onEnter(true);
      }}
      onBlur={(event) => {
        event.preventDefault();
        onBlur?.(event);
        intent.onLeave();
      }}
      {...props}
    />
  );
}

function HoverCardContent(props: HoverCardContentProps) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardSurface {...props} />
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
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onFocusOutside,
  className,
  children,
  ...props
}: HoverCardContentProps) {
  const intent = useHoverCardIntent("HoverCardSurface");
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
    return () => observer.disconnect();
  }, []);

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
        onPointerEnter={(event) => {
          // The point of the component: the pointer is on the card, so the
          // close the trigger scheduled on its way out is called off.
          event.preventDefault();
          onPointerEnter?.(event);
          if (isHoverPointer(event)) intent.onEnter(true);
        }}
        onPointerLeave={(event) => {
          event.preventDefault();
          onPointerLeave?.(event);
          if (isHoverPointer(event)) intent.onLeave();
        }}
        onFocus={(event) => {
          event.preventDefault();
          onFocus?.(event);
          // Tabbing into the card is intent too, or it closes under the focus.
          intent.onEnter(true);
        }}
        onFocusOutside={(event) => {
          event.preventDefault();
          onFocusOutside?.(event);
          // Radix prevents this event, which is what strands a card on screen
          // after the user tabs past it. Skipping its half, close instead.
          intent.onDismiss();
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
