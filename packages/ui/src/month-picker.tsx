"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { calendarCaptionClass, calendarNavButtonClass, monthButtonClass } from "./calendar-variants";
import {
  PRESENT_VALUE,
  formatMonthLabel,
  formatMonthValue,
  monthLabels,
  parseMonthValue,
} from "./calendar-utils";
import { DateField } from "./date-field";
import { useOpen } from "./use-open";

export interface MonthPickerProps {
  id?: string;
  /** `YYYY-MM`, or `Present` when that choice is allowed. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  allowPresent?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d={direction === "left" ? "M15 6 9 12l6 6" : "m9 6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonthPicker({
  id,
  value,
  onValueChange,
  placeholder = "Pick a month",
  disabled = false,
  invalid = false,
  allowPresent = false,
  open,
  onOpenChange,
  className,
}: MonthPickerProps) {
  const [isOpen, setOpenState] = useOpen(open, onOpenChange);
  const [inner, setInner] = useState<string | null>(null);
  const selected = value !== undefined ? value : inner;
  const parsed = parseMonthValue(selected);
  const [year, setYear] = useState<number | null>(() => (parsed && parsed !== "present" ? parsed.year : null));

  useEffect(() => {
    if (year == null) setYear(new Date().getFullYear());
  }, [year]);

  const setSelected = (next: string | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const setOpen = (next: boolean) => {
    if (next && parsed && parsed !== "present") setYear(parsed.year);
    setOpenState(next);
  };

  const label =
    parsed === "present"
      ? PRESENT_VALUE
      : parsed
        ? formatMonthLabel(parsed.year, parsed.month)
        : placeholder;

  const choose = (next: string) => {
    setSelected(next);
    setOpen(false);
  };

  const labels = monthLabels();

  return (
    <DateField
      id={id}
      label={label}
      empty={!parsed}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={setOpen}
      className={className}
    >
      <div data-slot="month-picker" className="w-[16.5rem] p-1">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between">
            <button type="button" className={calendarNavButtonClass} aria-label="Previous year" onClick={() => setYear((current) => (current ?? new Date().getFullYear()) - 1)}>
              <Chevron direction="left" />
            </button>
            <button type="button" className={calendarNavButtonClass} aria-label="Next year" onClick={() => setYear((current) => (current ?? new Date().getFullYear()) + 1)}>
              <Chevron direction="right" />
            </button>
          </div>
          <div className={calendarCaptionClass} aria-live="polite">
            {year}
          </div>
        </div>
        {allowPresent ? (
          <button
            type="button"
            className={`${monthButtonClass} mt-2 w-full`}
            data-selected={parsed === "present" ? "true" : undefined}
            onClick={() => choose(PRESENT_VALUE)}
          >
            {PRESENT_VALUE}
          </button>
        ) : null}
        <div className="mt-2 grid grid-cols-3 gap-1">
          {labels.map((month, index) => {
            const monthSelected = parsed !== "present" && parsed?.year === year && parsed?.month === index;
            return (
              <button
                key={month}
                type="button"
                className={monthButtonClass}
                data-selected={monthSelected ? "true" : undefined}
                aria-pressed={monthSelected}
                disabled={year == null}
                onClick={() => {
                  if (year == null) return;
                  choose(formatMonthValue(year, index));
                }}
              >
                {month}
              </button>
            );
          })}
        </div>
        {parsed ? (
          <div className="pt-2">
            <Button type="button" variant="ghost" width="full" onClick={() => setSelected(null)}>
              Clear
            </Button>
          </div>
        ) : null}
      </div>
    </DateField>
  );
}

export { MonthPicker };
