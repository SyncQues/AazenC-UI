/** `null` is the indeterminate bar. Numbers are clamped into `0…max`. */
export function clampProgress(value: number | null | undefined, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const safeMax = max > 0 ? max : 100;
  return Math.min(safeMax, Math.max(0, value));
}
