/**
 * The keyboard and selection rules of a toggle group, kept out of the component
 * so they can be reasoned about — and tested — without rendering anything.
 */

export const ITEM_SELECTOR = '[data-slot="toggle-group-item"]';

export type ToggleGroupType = "single" | "multiple";
export type ToggleGroupOrientation = "horizontal" | "vertical";
export type FocusIntent = "first" | "last" | "prev" | "next";

/**
 * Which way an arrow key moves, or `undefined` when it means nothing here.
 *
 * Orientation is honoured in both axes: up and down are not "previous and next"
 * in a horizontal row, and left and right are not in a vertical column, so
 * pressing them leaves the key to whatever the item itself does. `rtl` swaps the
 * two horizontal arrows, which is the only place the writing direction changes
 * what a key means.
 *
 * `PageUp` and `PageDown` are answered alongside `Home` and `End`. Neither
 * pattern this group implements — toolbar or radiogroup — gives them a meaning of
 * their own, so they are treated as a jump to the two ends rather than ignored:
 * a keypress that moves the focus is never worse than one the group swallows.
 */
export function focusIntentFor(
  key: string,
  orientation: ToggleGroupOrientation,
  dir: "ltr" | "rtl" = "ltr",
): FocusIntent | undefined {
  let resolved = key;
  if (dir === "rtl" && key === "ArrowLeft") resolved = "ArrowRight";
  else if (dir === "rtl" && key === "ArrowRight") resolved = "ArrowLeft";

  if (
    orientation === "vertical" &&
    (resolved === "ArrowLeft" || resolved === "ArrowRight")
  ) {
    return undefined;
  }
  if (
    orientation === "horizontal" &&
    (resolved === "ArrowUp" || resolved === "ArrowDown")
  ) {
    return undefined;
  }

  switch (resolved) {
    case "ArrowLeft":
    case "ArrowUp":
      return "prev";
    case "ArrowRight":
    case "ArrowDown":
      return "next";
    case "Home":
    case "PageUp":
      return "first";
    case "End":
    case "PageDown":
      return "last";
    default:
      return undefined;
  }
}

/**
 * The index the intent lands on, among `count` reachable items.
 *
 * `current` is -1 when nothing in the group holds the focus, which is the state
 * a tab into the group arrives in. From there the intent still has a direction:
 * forward lands on the first item and backward on the last, rather than always
 * snapping to the head of the row and leaving one arrow dead on arrival.
 */
export function nextFocusIndex(
  count: number,
  current: number,
  intent: FocusIntent,
  loop: boolean,
): number {
  if (count <= 0) return -1;
  if (intent === "first") return 0;
  if (intent === "last") return count - 1;
  if (current < 0) return intent === "next" ? 0 : count - 1;

  const step = intent === "next" ? 1 : -1;
  const candidate = current + step;
  if (candidate >= 0 && candidate < count) return candidate;
  if (!loop) return current;
  return candidate < 0 ? count - 1 : 0;
}

/** A click on an item: exclusive groups swap to it, multi groups add or drop it. */
export function toggleSelection(
  type: ToggleGroupType,
  selected: readonly string[],
  value: string,
): string[] {
  const isOn = selected.includes(value);
  if (type === "single") return isOn ? [] : [value];
  return isOn
    ? selected.filter((entry) => entry !== value)
    : [...selected, value];
}

/** An exclusive group answering a different item, which is never a change of nothing. */
export function selectOnly(
  selected: readonly string[],
  value: string,
): string[] {
  return selected.includes(value) ? [...selected] : [value];
}

/**
 * Which item holds the group's one tab stop, or `undefined` when nothing can take it.
 *
 * `values` is the items that can actually hold focus, in order — a disabled one cannot,
 * and a stop resting on one would strand the group.
 *
 * The focus wins over the answer, and that ordering is the whole point: a multi group
 * deliberately does not select on arrow, so a stop derived from `selected` alone would
 * put the user back on the first pressed item every time they tabbed in, rather than on
 * the one they left. With nothing focused yet — the state a tab into the group arrives
 * in — the answer takes it, because that is where the keyboard user last was.
 */
export function tabStopValue({
  values,
  selected,
  focused,
}: {
  values: readonly string[];
  selected: readonly string[];
  focused: string | null;
}): string | undefined {
  const reachable = new Set(values);
  if (focused !== null && reachable.has(focused)) return focused;
  return selected.find((value) => reachable.has(value)) ?? values[0];
}
