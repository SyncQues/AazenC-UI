/** Shared date math for the calendar, date, month, and time fields. */

export const PRESENT_VALUE = "Present";

const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function monthLabels(locale = "en-US") {
  return Array.from({ length: 12 }, (_, month) =>
    new Date(2024, month, 1).toLocaleDateString(locale, { month: "short" }),
  );
}

export const MONTH_LABELS = monthLabels();

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function formatDateLabel(date: Date): string {
  return dateLabel.format(date);
}

export function formatMonthLabel(year: number, month: number): string {
  return monthLabel.format(new Date(year, month, 1));
}

export function formatMonthValue(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function parseMonthValue(
  value: string | null | undefined,
): { year: number; month: number } | "present" | null {
  if (!value?.trim()) return null;
  if (value.trim().toLowerCase() === PRESENT_VALUE.toLowerCase()) return "present";
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year, month };
}

export function formatTimeLabel(hours: number, minutes: number): string {
  const normalized = ((hours % 24) + 24) % 24;
  const period = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function toHour12(hours: number): { hour: number; period: "AM" | "PM" } {
  const normalized = ((hours % 24) + 24) % 24;
  return {
    hour: normalized % 12 || 12,
    period: normalized >= 12 ? "PM" : "AM",
  };
}

export function fromHour12(hour: number, period: "AM" | "PM"): number {
  const normalized = ((hour - 1) % 12) + 1;
  if (period === "AM") return normalized === 12 ? 0 : normalized;
  return normalized === 12 ? 12 : normalized + 12;
}

export function applyTime(day: Date, hours: number, minutes: number): Date {
  const next = new Date(day);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatRangeLabel(from: Date | undefined, to: Date | undefined): string {
  if (!from) return "";
  if (!to || sameDay(from, to)) return formatDateLabel(from);
  return `${formatDateLabel(from)} – ${formatDateLabel(to)}`;
}

type PastMatcher = { before: Date };

export function withPastDisabled<T>(
  disabled: T | undefined,
  disablePast: boolean,
  today = new Date(),
): T | PastMatcher | Array<T | PastMatcher> | undefined {
  if (!disablePast) return disabled;
  const past: PastMatcher = { before: startOfDay(today) };
  if (disabled == null) return past;
  return Array.isArray(disabled) ? [...disabled, past] : [disabled, past];
}
