"use client";

import * as ResizablePrimitive from "react-resizable-panels";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import { cn } from "@aazenc/utils";
import {
  collapseSides,
  collapsibleHandleAround,
  entriesInDomOrder,
  isCollapseAffordance,
  panelsAround,
  type ResizableEntry,
  type ResizableRegistry,
} from "./resizable-utils";
import {
  resizableCollapseButtonVariants,
  resizableCollapseGripVariants,
  resizableCollapseVariants,
  resizableGroupClass,
  resizableHandleGripVariants,
  resizableHandleVariants,
  resizablePanelClass,
  type ResizableHandleVariantProps,
  type ResizableOrientation,
} from "./resizable-variants";

// The library's `aria-orientation` on the separator is inverted, so the axis
// comes from the group's own prop instead.
const ResizableOrientationContext =
  createContext<ResizableOrientation>("horizontal");

const ResizableRegistryContext = createContext<ResizableRegistry | null>(null);

// The library writes to whichever panelRef it is handed, so a consumer's ref
// alone would leave ours empty and every chevron silently doing nothing.
function composeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as RefObject<T | null>).current = value;
    }
  };
}

// Document-capture, at module scope, via preventDefault: the library bails out
// only on `defaultPrevented`, so a descendant's stopPropagation cannot reach it.
if (typeof document !== "undefined") {
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (isCollapseAffordance(event.target)) event.preventDefault();
    },
    true,
  );
}

export type ResizablePanelGroupProps = Omit<
  ComponentProps<typeof ResizablePrimitive.Group>,
  "className"
> & {
  /** Panels side by side, or stacked. The handles turn with it. */
  orientation?: ResizableOrientation;
  className?: string;
};

export type ResizablePanelProps = ComponentProps<
  typeof ResizablePrimitive.Panel
>;

export type ResizableHandleProps = Omit<
  ComponentProps<typeof ResizablePrimitive.Separator>,
  "className"
> & {
  /**
   * Show the chevron pair. The one pointing away from the centre takes down the
   * panel behind it, and it is a toggle, so a second press brings it back. Both
   * panels either side become collapsible, which also means they can now be
   * dragged shut.
   */
  collapsible?: boolean;
  /** A hairline drawn inside the target, or the target tinted as a whole. Default "rule". */
  variant?: ResizableHandleVariantProps["variant"];
  /** The six-dot grip, for a split people are not expecting to move. Default false. */
  withHandle?: boolean;
  className?: string;
};

function ResizableGripIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="size-2.5 text-muted-foreground"
    >
      <circle cx="5" cy="4" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="11" cy="4" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="11" cy="12" r="1.5" />
    </svg>
  );
}

/** Hand-rolled, because nothing in this file earns an icon dependency. */
function ResizableChevronIcon({ direction }: { direction: "start" | "end" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "start" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function ResizablePanelGroup({
  orientation,
  className,
  ...props
}: ResizablePanelGroupProps) {
  const resolvedOrientation: ResizableOrientation = orientation ?? "horizontal";
  const [entries, setEntries] = useState<ResizableEntry[]>([]);

  const register = useCallback((entry: ResizableEntry) => {
    setEntries((previous) => [...previous, entry]);

    return () => {
      setEntries((previous) => previous.filter((item) => item !== entry));
    };
  }, []);

  // Rewrites an entry where it lies; re-registering would append and reorder.
  const bump = useCallback(
    (id: string, changes: Partial<Omit<ResizableEntry, "id">>) => {
      setEntries((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, ...changes } : item,
        ),
      );
    },
    [],
  );

  // Changes as children arrive, which is what re-renders a handle once its
// neighbours are known. `register` and `bump` are stable, so they hold still.
  const registry = useMemo<ResizableRegistry | null>(
    () => ({ entries, register, bump }),
    [entries, register, bump],
  );

  return (
    <ResizableOrientationContext.Provider value={resolvedOrientation}>
      <ResizableRegistryContext.Provider value={registry}>
        <ResizablePrimitive.Group
          data-slot="resizable-panel-group"
          orientation={resolvedOrientation}
          className={cn(resizableGroupClass, className)}
          {...props}
        />
      </ResizableRegistryContext.Provider>
    </ResizableOrientationContext.Provider>
  );
}

// The order the user sees, shared by the panel and the handle: if they disagree
// on it, a chevron collapses something other than the panel next to it.
// `-1` is every first render, and any panel used outside a group.
function useOrderedEntries(registry: ResizableRegistry | null, id: string) {
  const ordered = useMemo(
    () => (registry === null ? [] : entriesInDomOrder(registry.entries)),
    [registry],
  );

  return {
    entries: ordered,
    index: ordered.findIndex((item) => item.id === id),
  };
}

// The one part of this file taking a className: the library's inner scroller is
// where a consumer lays content out, and there is nowhere else to put it.
function ResizablePanel({
  collapsible,
  className,
  panelRef: consumerPanelRef,
  elementRef: consumerElementRef,
  ...props
}: ResizablePanelProps) {
  const id = useId();
  const panelRef = ResizablePrimitive.usePanelRef();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const registry = useContext(ResizableRegistryContext);
  const register = registry?.register;

  const entry = useMemo<ResizableEntry>(
    () => ({ id, kind: "panel", panelRef, elementRef }),
    [id, panelRef],
  );
  useEffect(() => register?.(entry), [register, entry]);

  // The library's own collapse() is a no-op on a panel that is not collapsible,
  // so a panel beside a collapsible handle is made collapsible for it. That is
  // a visible change, not just a wiring one: the panel can now also be dragged
  // shut, which is what a panel with a close chevron on its edge should do.
  const { entries, index } = useOrderedEntries(registry, id);
  const besideACollapsibleHandle =
    index >= 0 && collapsibleHandleAround(entries, index);

  // Memoised, because a fresh function here is a ref whose identity changes
  // every render. `useImperativeHandle` folds the ref into its own dependency
  // list, so the library would detach and re-attach the handle on every single
  // commit rather than once on mount — and a detached handle is `null`, which is
  // the same silent failure this composition exists to prevent.
  const composedPanelRef = useMemo(
    () => composeRefs(panelRef, consumerPanelRef),
    [panelRef, consumerPanelRef],
  );
  const composedElementRef = useMemo(
    () => composeRefs(elementRef, consumerElementRef),
    [elementRef, consumerElementRef],
  );

  return (
    <ResizablePrimitive.Panel
      {...props}
      data-slot="resizable-panel"
      elementRef={composedElementRef}
      panelRef={composedPanelRef}
      collapsible={collapsible ?? besideACollapsibleHandle}
      className={cn(resizablePanelClass, className)}
    />
  );
}

/**
 * Whether a panel is shut, tracked locally.
 *
 * There is nothing to subscribe to: `isCollapsed()` is imperative and the
 * library emits no event when it changes. So the value is read once the ref is
 * filled and then kept in step by this control's own press — which covers every
 * way the chevrons can change it. A panel shut from the keyboard on the
 * separator, or by its double-click reset, leaves it stale. That is the same gap
 * the label already lives with, and the reason `aria-expanded` is worth having
 * rather than complete: it is right except in that one case, where before it
 * there was nothing at all.
 */
function useCollapsed(
  panel: RefObject<ResizablePrimitive.PanelImperativeHandle | null> | undefined,
) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(panel?.current?.isCollapsed() ?? false);
  }, [panel]);
  return [collapsed, setCollapsed] as const;
}

function ResizableCollapseControls({
  orientation,
  start,
  end,
}: {
  orientation: ResizableOrientation;
  start: RefObject<ResizablePrimitive.PanelImperativeHandle | null> | undefined;
  end: RefObject<ResizablePrimitive.PanelImperativeHandle | null> | undefined;
}) {
  /**
 * The label names the panel and says "toggle", never "collapse": nothing
 * re-renders on the library's imperative `isCollapsed()`, so an action label
 * would be wrong on every second press.
 */
  const sides = collapseSides(orientation);

  const [startCollapsed, setStartCollapsed] = useCollapsed(start);
  const [endCollapsed, setEndCollapsed] = useCollapsed(end);

  const toggle = (
    panel:
      RefObject<ResizablePrimitive.PanelImperativeHandle | null> | undefined,
    setCollapsed: (value: boolean) => void,
  ) => {
    if (panel?.current === null || panel === undefined) return;
    if (panel.current.isCollapsed()) {
      panel.current.expand();
      setCollapsed(false);
    } else {
      panel.current.collapse();
      setCollapsed(true);
    }
  };

  return (
    <span
      data-slot="resizable-collapse"
      className={resizableCollapseVariants({ orientation })}
    >
      <button
        type="button"
        data-slot="resizable-collapse-start"
        className={resizableCollapseButtonVariants({ orientation })}
        aria-label={`Toggle the ${sides.start} panel`}
        aria-expanded={!startCollapsed}
        // The library runs a keydown handler on the separator itself and calls
        // preventDefault() for Enter, so a key pressed here bubbles into it: the
        // button's activation never fires and the library collapses the *first*
        // panel instead. Stopping the key here costs nothing — the arrow, Home and
        // End keys it handles only run when the separator itself has focus, and a
        // key pressed on a child button never reaches them either way.
        onKeyDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          toggle(start, setStartCollapsed);
        }}
        onClick={(event) => {
          event.stopPropagation();
          // Enter and Space synthesize click with detail 0. A pointer press
          // does not: the document listener cancels pointerdown, so click
          // never fires and pointerup is what toggles.
          if (event.detail !== 0) return;
          toggle(start, setStartCollapsed);
        }}
      >
        <ResizableChevronIcon direction="start" />
      </button>
      <span
        data-slot="resizable-collapse-grip"
        className={resizableCollapseGripVariants({ orientation })}
      >
        <ResizableGripIcon />
      </span>
      <button
        type="button"
        data-slot="resizable-collapse-end"
        className={resizableCollapseButtonVariants({ orientation })}
        aria-label={`Toggle the ${sides.end} panel`}
        aria-expanded={!endCollapsed}
        onKeyDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          toggle(end, setEndCollapsed);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (event.detail !== 0) return;
          toggle(end, setEndCollapsed);
        }}
      >
        <ResizableChevronIcon direction="end" />
      </button>
    </span>
  );
}

function ResizableHandle({
  collapsible = false,
  variant,
  withHandle = false,
  children,
  elementRef: consumerElementRef,
  className,
  ...props
}: ResizableHandleProps) {
  const orientation = useContext(ResizableOrientationContext);
  const id = useId();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const registry = useContext(ResizableRegistryContext);
  const register = registry?.register;
  const bump = registry?.bump;

  // Mirrored into a ref so the entry never has to be rebuilt when the prop
  // changes. Rebuilding it would unregister and re-register, and the re-register
  // appends, which would move this handle to the end of the order.
  const collapsibleRef = useRef(collapsible);
  const previousCollapsible = useRef(collapsible);
  useEffect(() => {
    collapsibleRef.current = collapsible;
    // The ref alone re-renders only *this* handle. The value is read by the
    // panels beside it, which are siblings and would never find out — so a
    // chevron would render and then collapse nothing, because the panel it
    // points at was never made collapsible. `bump` is what tells them: it gives
    // `entries` a new identity so every consumer re-renders, and it rewrites the
    // entry in place so the order all of this depends on survives.
    if (previousCollapsible.current === collapsible) return;
    previousCollapsible.current = collapsible;
    bump?.(id, { collapsible: collapsibleRef });
  }, [bump, id, collapsible]);

  const entry = useMemo<ResizableEntry>(
    () => ({ id, kind: "handle", collapsible: collapsibleRef, elementRef }),
    [id],
  );
  useEffect(() => register?.(entry), [register, entry]);

  const { entries, index } = useOrderedEntries(registry, id);
  const neighbours = index >= 0 ? panelsAround(entries, index) : null;

  const composedElementRef = useMemo(
    () => composeRefs(elementRef, consumerElementRef),
    [elementRef, consumerElementRef],
  );

  return (
    <ResizablePrimitive.Separator
      {...props}
      data-slot="resizable-handle"
      elementRef={composedElementRef}
      className={cn(resizableHandleVariants({ orientation, variant }), className)}
    >
      {/* `collapsible` takes the handle's contents over. A consumer who wants a
          custom child keeps `withHandle` and `children` and leaves this off. */}
      {collapsible ? (
        <ResizableCollapseControls
          orientation={orientation}
          start={neighbours?.start}
          end={neighbours?.end}
        />
      ) : withHandle && !children ? (
        <span
          data-slot="resizable-handle-grip"
          className={resizableHandleGripVariants({ orientation })}
        >
          <ResizableGripIcon />
        </span>
      ) : (
        children
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
