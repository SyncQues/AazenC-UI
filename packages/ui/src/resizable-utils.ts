import type { RefObject } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";

/**
 * SyncQues resizable — the order a group keeps its children in.
 *
 * A handle that can shut a panel needs a ref to that panel, and the library only
 * hands one to a panel that was given it. So the group records the order its
 * children mounted in, and a handle counts back from there to find the panel
 * before it and the panel after it. Mount order is visual order here because
 * nothing reorders a group after the fact, which is the one assumption this is
 * standing on.
 *
 * `collapsible` rides behind a ref rather than in the entry itself. An entry is
 * registered once and never re-registered, because unregistering removes the
 * entry and registering again *appends* it, which would quietly walk the handle
 * to the end of the array and scramble the order everything else had just
 * worked out.
 */
export type ResizableEntry = {
  id: string;
  kind: "panel" | "handle";
  panelRef?: RefObject<PanelImperativeHandle | null>;
  collapsible?: RefObject<boolean>;
};

export type ResizableRegistry = {
  entries: ResizableEntry[];
  register: (entry: ResizableEntry) => () => void;
};

/**
 * The panels either side of the entry at `index`, nearest first.
 *
 * Nearest, and one panel per side. In a three panel group the first handle's
 * right chevron must take the middle panel and not the far one, because a
 * chevron that reached past its neighbour to the next panel along would collapse
 * something the user cannot see change.
 */
export function panelsAround(entries: ResizableEntry[], index: number) {
  const pick = (list: ResizableEntry[]) => list.find((item) => item.kind === "panel")?.panelRef;

  return {
    start: pick(entries.slice(0, index).reverse()),
    end: pick(entries.slice(index + 1)),
  };
}

/**
 * Whether a collapsible handle sits on either side of the entry at `index`.
 *
 * The nearest handle on each side decides that side, and the two are read
 * separately. Reading every handle in the group instead is a real bug and was
 * one: in a group holding a plain handle and a collapsible one, a panel at the
 * far end became collapsible because a handle two panels away was. Being in the
 * same row of children is not the same as being beside.
 */
export function collapsibleHandleAround(entries: ResizableEntry[], index: number) {
  const nearest = (list: ResizableEntry[]) => list.find((item) => item.kind === "handle");
  const before = nearest(entries.slice(0, index).reverse());
  const after = nearest(entries.slice(index + 1));

  return before?.collapsible?.current === true || after?.collapsible?.current === true;
}
