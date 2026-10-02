"use client";

import { useState } from "react";
import { Button } from "./button";
import { calendarCaptionClass, calendarNavButtonClass, monthButtonClass } from "./calendar-variants";
import {
  MONTH_LABELS,
  PRESENT_VALUE,
  formatMonthLabel,
  formatMonthValue,
  parseMonthValue,
} from "./calendar-utils";
import { DateField } from "./date-field";

export interface MonthPickerProps {
  id?: string;
  /** `YYYY-MM`, or `Present` when that choice is allowed. */
  value?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  allowPresent?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  value = null,
  onValueChange,
  placeholder = "Pick a month",
  disabled = false,
  invalid = false,
  allowPresent = false,
  open,
  onOpenChange,
}: MonthPickerProps) {
  const parsed = parseMonthValue(value);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [year, setYear] = useState(() => (parsed && parsed !== "present" ? parsed.year : new Date().getFullYear()));
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (next && parsed && parsed !== "present") setYear(parsed.year);
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const label =
    parsed === "present"
      ? PRESENT_VALUE
      : parsed
        ? formatMonthLabel(parsed.year, parsed.month)
        : placeholder;

  const choose = (next: string) => {
    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <DateField
      id={id}
      label={label}
      empty={!parsed}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={setOpen}
    >
      <div data-slot="month-picker" className="w-[16.5rem] p-1">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between">
            <button type="button" className={calendarNavButtonClass} aria-label="Previous year" onClick={() => setYear((current) => current - 1)}>
              <Chevron direction="left" />
            </button>
            <button type="button" className={calendarNavButtonClass} aria-label="Next year" onClick={() => setYear((current) => current + 1)}>
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
          {MONTH_LABELS.map((month, index) => {
            const selected = parsed !== "present" && parsed?.year === year && parsed?.month === index;
            return (
              <button
                key={month}
                type="button"
                className={monthButtonClass}
                data-selected={selected ? "true" : undefined}
                aria-pressed={selected}
                onClick={() => choose(formatMonthValue(year, index))}
              >
                {month}
              </button>
            );
          })}
        </div>
        {parsed ? (
          <div className="pt-2">
            <Button type="button" variant="ghost" width="full" onClick={() => onValueChange?.("")}>
              Clear
            </Button>
          </div>
        ) : null}
      </div>
    </DateField>
  );
}

export { MonthPicker };
