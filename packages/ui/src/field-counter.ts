/**
 * The `used / maxLength` counter, shared by Input and Textarea.
 * The rules live here so a limit reads the same on a one-line field as on a tall one.
 */

/** A field `value` is typed wider than a string, so count it without assuming. */
export function lengthOf(value: string | number | readonly string[] | undefined): number {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.join("").length;
  if (typeof value === "number") return String(value).length;
  return 0;
}

/** `maxLength` of zero or less is no limit at all, so there is nothing to count against. */
export function counterLimit(maxLength: number | undefined): number | null {
  return typeof maxLength === "number" && maxLength > 0 ? maxLength : null;
}

/** A counter only makes sense for text someone typed: a password leaks its length, a file has none. */
const UNCUNTABLE_TYPES = new Set(["password", "file"]);

/** True when a counter is worth drawing at all. */
export function showsCount({
  showCount,
  maxLength,
  type,
}: {
  showCount: boolean;
  maxLength: number | undefined;
  /** Absent on a Textarea, which has no type to worry about. */
  type?: string;
}): boolean {
  return showCount && counterLimit(maxLength) !== null && !UNCUNTABLE_TYPES.has(type ?? "");
}

/**
 * The geometry, written down once and inherited by both the field and the counter, which
 * are siblings under the wrapper this lands on. Custom properties inherit, so the strip a
 * Textarea reserves and the inset both counters sit at read the same number — which a
 * mirrored constant in this file could not promise.
 */
export const counterRootClass = "[--counter-inset:1rem] [--counter-strip:2rem]";

/**
 * The count sits inside the field, floating over the chrome while the text is kept
 * clear of it. `pointer-events-none` leaves the whole box clickable and selectable.
 */
const COUNTER_BASE = "pointer-events-none absolute text-xs text-muted-foreground tabular-nums";

/** On an input's single line, at the right end of the pill. */
export const inputCounterClass = `${COUNTER_BASE} right-[var(--counter-inset)] top-1/2 -translate-y-1/2`;

/** In a textarea's bottom corner, in the padding strip the count axis reserves. */
export const textareaCounterClass = `${COUNTER_BASE} bottom-3 right-[var(--counter-inset)]`;

/** The padding strip a Textarea keeps clear below its last line for the count to sit in. */
export const textareaCounterStripClass = "pb-[var(--counter-strip)]";

/**
 * Gap between the text and the count, so the two never touch. Deliberately a plain
 * number: unlike the inset above it is not a class anywhere, so it has no second
 * definition to drift from.
 */
export const COUNTER_GAP_PX = 8;

/**
 * How much padding-right keeps a field's own text clear of its counter.
 *
 * Measured off the two boxes rather than recomputed from the inset, so it is right
 * whatever positions the counter — and it has to be re-measured as the count itself
 * changes width, which it does every time the used number gains a digit.
 */
export function counterClearance(field: HTMLElement, counter: HTMLElement | null): number {
  if (!counter) return 0;
  const inset = field.getBoundingClientRect().right - counter.getBoundingClientRect().right;
  return counter.offsetWidth + Math.max(0, inset) + COUNTER_GAP_PX;
}
