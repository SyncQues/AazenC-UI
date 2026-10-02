export const PDF_MIN_ZOOM = 0.5;
export const PDF_MAX_ZOOM = 2.5;
export const PDF_ZOOM_STEP = 0.25;

export function clampPdfPage(page: number, numPages: number): number {
  if (!Number.isFinite(page) || numPages < 1) return 1;
  return Math.min(numPages, Math.max(1, Math.round(page)));
}

export function clampPdfZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(PDF_MAX_ZOOM, Math.max(PDF_MIN_ZOOM, zoom));
}

export function stepPdfZoom(zoom: number, direction: 1 | -1): number {
  const next = clampPdfZoom(zoom + direction * PDF_ZOOM_STEP);
  return Math.round(next * 100) / 100;
}
