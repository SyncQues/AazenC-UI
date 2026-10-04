/** The field's own measurements, read once per pass off the collapsed box. */
export interface AutoHeightInput {
  /** `scrollHeight` after the height is collapsed. Text plus padding, no border. */
  scrollHeight: number;
  /** Used line height in px. `normal` has already been replaced by the caller. */
  lineHeight: number;
  /** Padding and border, top and bottom, in px. */
  chrome: number;
  /** Rows the field keeps even when the text is shorter. */
  minRows: number;
  /** Rows it grows to before it starts scrolling again. */
  maxRows: number;
}

/**
 * Height for a field that has been collapsed to `height: auto`.
 * Clamped to the rows it is allowed to occupy, so a pasted essay takes over the
 * page. `minRows` wins a `maxRows` below it — a field that cannot show its own
 * floor is broken, and a cap the caller set too low should not shrink the box.
 */
export function autoHeight({
  scrollHeight,
  lineHeight,
  chrome,
  minRows,
  maxRows,
}: AutoHeightInput): number {
  const line = lineHeight > 0 ? lineHeight : 20;
  const floor = line * minRows + chrome;
  const ceiling = line * maxRows + chrome;
  return Math.max(floor, Math.min(Math.ceil(scrollHeight), ceiling));
}
