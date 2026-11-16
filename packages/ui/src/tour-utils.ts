/**
 * Placement for the tour card.
 * Prefer the requested side. Flip when that side cannot hold the card.
 */

export const tourSides = ["top", "right", "bottom", "left"] as const;
export type TourSide = (typeof tourSides)[number];

export const TOUR_GAP = 12;
export const TOUR_PAD = 8;
export const TOUR_SPOTLIGHT_PAD = 6;

export interface TourBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TourCardPlacement {
  top: number;
  left: number;
  side: TourSide;
}

const opposite: Record<TourSide, TourSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function sideOrder(preferred: TourSide): TourSide[] {
  return [
    preferred,
    opposite[preferred],
    ...tourSides.filter((side) => side !== preferred && side !== opposite[preferred]),
  ];
}

function roomFor(
  target: TourBox,
  viewport: { width: number; height: number },
  gap: number,
  padding: number,
) {
  return {
    top: target.top - gap - padding,
    bottom: viewport.height - (target.top + target.height) - gap - padding,
    left: target.left - gap - padding,
    right: viewport.width - (target.left + target.width) - gap - padding,
  };
}

function fits(
  side: TourSide,
  room: ReturnType<typeof roomFor>,
  card: { width: number; height: number },
) {
  if (side === "top" || side === "bottom") return room[side] >= card.height;
  return room[side] >= card.width;
}

export function placeTourCard(
  target: TourBox | null,
  preferred: TourSide,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = TOUR_GAP,
  padding = TOUR_PAD,
): TourCardPlacement {
  if (!target) {
    return {
      top: Math.max(padding, (viewport.height - card.height) / 2),
      left: Math.max(padding, (viewport.width - card.width) / 2),
      side: preferred,
    };
  }

  const room = roomFor(target, viewport, gap, padding);
  const side = sideOrder(preferred).find((candidate) => fits(candidate, room, card)) ?? preferred;

  let top = target.top + target.height / 2 - card.height / 2;
  let left = target.left + target.width / 2 - card.width / 2;

  if (side === "bottom") top = target.top + target.height + gap;
  if (side === "top") top = target.top - gap - card.height;
  if (side === "right") left = target.left + target.width + gap;
  if (side === "left") left = target.left - gap - card.width;

  return {
    top: clamp(top, padding, viewport.height - card.height - padding),
    left: clamp(left, padding, viewport.width - card.width - padding),
    side,
  };
}

export function spotlightBox(target: TourBox, pad = TOUR_SPOTLIGHT_PAD): TourBox {
  return {
    top: target.top - pad,
    left: target.left - pad,
    width: target.width + pad * 2,
    height: target.height + pad * 2,
  };
}
