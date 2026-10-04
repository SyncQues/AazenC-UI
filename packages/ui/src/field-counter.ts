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
 * The count sits inside the field, floating over the chrome while the text is kept
 * clear of it. `pointer-events-none` leaves the whole box clickable and selectable.
 */
const COUNTER_BASE = "pointer-events-none absolute text-xs text-muted-foreground tabular-nums";

/** On an input's single line, at the right end of the pill. */
export const inputCounterClass = `${COUNTER_BASE} right-4 top-1/2 -translate-y-1/2`;

/** In a textarea's bottom corner, in the padding strip the count axis reserves. */
export const textareaCounterClass = `${COUNTER_BASE} bottom-3 right-4`;

/** How far the counters keep from the right edge. Has to agree with the `right-4` above. */
export const COUNTER_INSET_PX = 16;

/** Gap between the text and the count, so the two never touch. */
export const COUNTER_GAP_PX = 8;
