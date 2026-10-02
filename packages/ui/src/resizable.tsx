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
  type RefObject,
} from "react";
import { cn } from "@aazenc/utils";
import {
  collapsibleHandleAround,
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

/**
 * The handle reads the group's axis from here rather than off the
 * `aria-orientation` the library puts on it, because that value is inverted:
 * a horizontal group produces a separator that reports itself as vertical. The
 * group's own prop is passed through to the library, so the two can never
 * disagree.
 */
const ResizableOrientationContext = createContext<ResizableOrientation>("horizontal");

const ResizableRegistryContext = createContext<ResizableRegistry | null>(null);

export type ResizablePanelGroupProps = Omit<
  ComponentProps<typeof ResizablePrimitive.Group>,
  "className"
> & {
  /** Panels side by side, or stacked. The handles turn with it. */
  orientation?: ResizableOrientation;
};

export type ResizablePanelProps = ComponentProps<typeof ResizablePrimitive.Panel>;

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

function ResizablePanelGroup({ orientation, ...props }: ResizablePanelGroupProps) {
  const resolvedOrientation: ResizableOrientation = orientation ?? "horizontal";
  const [entries, setEntries] = useState<ResizableEntry[]>([]);

  const register = useCallback((entry: ResizableEntry) => {
    setEntries((previous) => [...previous, entry]);

    return () => {
      setEntries((previous) => previous.filter((item) => item !== entry));
    };
  }, []);

  // The context value changes as children arrive, which is what makes a handle
  // re-render once its neighbours are known. `register` is kept out of that
  // identity on purpose below, or every registration would restart every
  // registration.
  const registry = useMemo<ResizableRegistry | null>(
    () => ({ entries, register }),
    [entries, register],
  );

  return (
    <ResizableOrientationContext.Provider value={resolvedOrientation}>
      <ResizableRegistryContext.Provider value={registry}>
        <ResizablePrimitive.Group
          data-slot="resizable-panel-group"
          orientation={resolvedOrientation}
          className={resizableGroupClass}
          {...props}
        />
      </ResizableRegistryContext.Provider>
    </ResizableOrientationContext.Provider>
  );
}

/**
 * The one part of this file that takes a className, against the rule the rest
 * of the library keeps. The library renders an inner scroller inside every
 * panel, and that div is the natural place to lay content out; without a way
 * through, a consumer cannot make a panel a flex column and has nowhere to put
 * a class that is not fighting the resize.
 */
function ResizablePanel({ collapsible, className, ...props }: ResizablePanelProps) {
  const id = useId();
  const panelRef = ResizablePrimitive.usePanelRef();
  const registry = useContext(ResizableRegistryContext);
  const register = registry?.register;

  const entry = useMemo<ResizableEntry>(() => ({ id, kind: "panel", panelRef }), [id, panelRef]);
  useEffect(() => register?.(entry), [register, entry]);

  // The library's own collapse() is a no-op on a panel that is not collapsible,
  // so a panel beside a collapsible handle is made collapsible for it. That is
  // a visible change, not just a wiring one: the panel can now also be dragged
  // shut, which is what a panel with a close chevron on its edge should do.
  const index = registry?.entries.findIndex((item) => item.id === id) ?? -1;
  const besideACollapsibleHandle =
    registry !== null && index >= 0 && collapsibleHandleAround(registry.entries, index);

  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      panelRef={panelRef}
      collapsible={collapsible ?? besideACollapsibleHandle}
      className={cn(resizablePanelClass, className)}
      {...props}
    />
  );
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
   * The label says "toggle" and names the panel, never "collapse".
   *
   * `isCollapsed()` is imperative and the library does not announce the change,
   * so a label that named the action would be wrong on every second press and
   * nothing would re-render to correct it. Naming the target instead is right in
   * both states, and the chevron the button already carries says which way the
   * press goes.
   */
  const sides =
    orientation === "vertical"
      ? { start: "top", end: "bottom" }
      : { start: "left", end: "right" };

  const toggle = (
    panel: RefObject<ResizablePrimitive.PanelImperativeHandle | null> | undefined,
  ) => {
    if (panel?.current === null || panel === undefined) return;
    if (panel.current.isCollapsed()) panel.current.expand();
    else panel.current.collapse();
  };

  return (
    <span data-slot="resizable-collapse" className={resizableCollapseVariants({ orientation })}>
      <button
        type="button"
        data-slot="resizable-collapse-start"
        className={resizableCollapseButtonVariants({ orientation })}
        aria-label={`Toggle the ${sides.start} panel`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          toggle(start);
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
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          toggle(end);
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
  ...props
}: ResizableHandleProps) {
  const orientation = useContext(ResizableOrientationContext);
  const id = useId();
  const registry = useContext(ResizableRegistryContext);
  const register = registry?.register;

  // Mirrored into a ref so the entry never has to be rebuilt when the prop
  // changes. Rebuilding it would unregister and re-register, and the re-register
  // appends, which would move this handle to the end of the order.
  const collapsibleRef = useRef(collapsible);
  useEffect(() => {
    collapsibleRef.current = collapsible;
  }, [collapsible]);

  const entry = useMemo<ResizableEntry>(
    () => ({ id, kind: "handle", collapsible: collapsibleRef }),
    [id],
  );
  useEffect(() => register?.(entry), [register, entry]);

  const index = registry?.entries.findIndex((item) => item.id === id) ?? -1;
  const neighbours = registry !== null && index >= 0 ? panelsAround(registry.entries, index) : null;

  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={resizableHandleVariants({ orientation, variant })}
      {...props}
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
        <span data-slot="resizable-handle-grip" className={resizableHandleGripVariants({ orientation })}>
          <ResizableGripIcon />
        </span>
      ) : (
        children
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
