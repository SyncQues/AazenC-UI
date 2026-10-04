/** The one selector the mark and the arrow keys agree on. */
export const SEGMENTED_ITEM_SELECTOR = "[data-slot=segmented-control-item]";

export type MarkBox = { x: number; y: number; w: number; h: number };

/**
 * The mark's rect in the track's own space, off the *layout* box: `offset*` ignores
 * transforms, and the rect API measured the option's `scale(0.96)` entrance frame instead.
 */
export function measureMark(track: HTMLElement): MarkBox | null {
  const active = track.querySelector<HTMLElement>(
    `${SEGMENTED_ITEM_SELECTOR}[data-selected="true"]`,
  );
  if (!active || active.offsetParent !== track) return null;
  return {
    x: active.offsetLeft,
    y: active.offsetTop,
    w: active.offsetWidth,
    h: active.offsetHeight,
  };
}
