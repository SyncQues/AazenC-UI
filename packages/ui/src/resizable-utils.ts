import type { RefObject } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";

/**
 * SyncQues resizable — the order a group keeps its children in, so a handle can
 * find the panels either side of it. `collapsible` rides behind a ref because
 * re-registering an entry appends and would reorder the group.
 */
export type ResizableEntry = {
  id: string;
  kind: "panel" | "handle";
  panelRef?: RefObject<PanelImperativeHandle | null>;
  collapsible?: RefObject<boolean>;
  /** Used only for ordering; the library composes this with its own ref. */
  elementRef?: RefObject<HTMLElement | null>;
};

export type ResizableRegistry = {
  entries: ResizableEntry[];
  register: (entry: ResizableEntry) => () => void;
  /** Updates in place: re-registering appends and would reorder the group. */
  bump: (id: string, changes: Partial<Omit<ResizableEntry, "id">>) => void;
};

/** The chevron pill's slot, which the drag guard matches on. */
export const COLLAPSE_SLOT = "resizable-collapse";

const COLLAPSE_SELECTOR = `[data-slot="${COLLAPSE_SLOT}"]`;

/**
 * Whether a press landed on the chevron pill. The library bails out only on
 * `defaultPrevented`, and `stopPropagation` from a descendant cannot reach its
 * document-capture listener — so duck-typed here and prevented at capture there.
 */
export function isCollapseAffordance(
  target: EventTarget | null | undefined,
): boolean {
  if (!target) return false;
  const element = target as Element;
  if (typeof element.closest !== "function") return false;
  return element.closest(COLLAPSE_SELECTOR) !== null;
}

/** `Node.DOCUMENT_POSITION_FOLLOWING` / `PRECEDING`, without needing a DOM. */
const FOLLOWING = 4;
const PRECEDING = 2;

// Registration appends, so a late child would sort last and put a handle's
// chevrons next to the wrong panel. Falls back to registration order off-DOM.
export function entriesInDomOrder(entries: ResizableEntry[]): ResizableEntry[] {
  return entries
    .map((entry, order) => ({ entry, order }))
    .sort((a, b) => {
      const first = a.entry.elementRef?.current;
      const second = b.entry.elementRef?.current;
      if (!first?.compareDocumentPosition || !second?.compareDocumentPosition) {
        return a.order - b.order;
      }
      const position = first.compareDocumentPosition(second);
      if (position & FOLLOWING) return -1;
      if (position & PRECEDING) return 1;
      return a.order - b.order;
    })
    .map(({ entry }) => entry);
}

// Unguarded, -1 makes `slice(0, -1)` drop the last child and `slice(0)` return
// the whole group, so a chevron would collapse the wrong panel.
function outOfRange(index: number, length: number): boolean {
  return !Number.isInteger(index) || index < 0 || index >= length;
}

// Named, not numbered: the label is all a screen reader gets to go on.
export function collapseSides(orientation: "horizontal" | "vertical") {
  return orientation === "vertical"
    ? { start: "top", end: "bottom" }
    : { start: "left", end: "right" };
}

// Nearest one per side, or a chevron reaches past its neighbour.
export function panelsAround(entries: ResizableEntry[], index: number) {
  if (outOfRange(index, entries.length))
    return { start: undefined, end: undefined };

  const pick = (list: ResizableEntry[]) =>
    list.find((item) => item.kind === "panel")?.panelRef;

  return {
    start: pick(entries.slice(0, index).reverse()),
    end: pick(entries.slice(index + 1)),
  };
}

// Nearest handle per side: same row of children is not the same as beside.
export function collapsibleHandleAround(
  entries: ResizableEntry[],
  index: number,
) {
  if (outOfRange(index, entries.length)) return false;

  const nearest = (list: ResizableEntry[]) =>
    list.find((item) => item.kind === "handle");
  const before = nearest(entries.slice(0, index).reverse());
  const after = nearest(entries.slice(index + 1));

  return (
    before?.collapsible?.current === true ||
    after?.collapsible?.current === true
  );
}
