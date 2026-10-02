"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { formatDateLabel, formatRangeLabel, sameDay } from "./calendar-utils";
import { DateField } from "./date-field";

type FieldShared = {
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  disablePast?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DatePickerSingleProps = FieldShared & {
  mode?: "single";
  value?: Date | null;
  onValueChange?: (value: Date | null) => void;
};

export type DatePickerRangeProps = FieldShared & {
  mode: "range";
  value?: DateRange | null;
  onValueChange?: (value: DateRange | null) => void;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

function useOpen(open: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const current = open ?? uncontrolled;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return [current, setOpen] as const;
}

function SingleDatePicker({
  id,
  value,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  invalid = false,
  disablePast = false,
  open,
  onOpenChange,
}: DatePickerSingleProps) {
  const [isOpen, setOpen] = useOpen(open, onOpenChange);
  const [inner, setInner] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(() => value ?? new Date());
  const selected = value !== undefined ? value : inner;

  const setSelected = (next: Date | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <DateField
      id={id}
      label={selected ? formatDateLabel(selected) : placeholder}
      empty={!selected}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={(next) => {
        if (next && selected) setMonth(selected);
        setOpen(next);
      }}
    >
      <Calendar
        mode="single"
        selected={selected ?? undefined}
        month={month}
        onMonthChange={setMonth}
        disablePast={disablePast}
        onSelect={(date) => {
          setSelected(date ?? null);
          if (date) setOpen(false);
        }}
      />
      {selected ? (
        <div className="px-1 pt-1 pb-1">
          <Button type="button" variant="ghost" width="full" onClick={() => setSelected(null)}>
            Clear
          </Button>
        </div>
      ) : null}
    </DateField>
  );
}

function RangeDatePicker({
  id,
  value,
  onValueChange,
  placeholder = "Pick a range",
  disabled = false,
  invalid = false,
  disablePast = false,
  open,
  onOpenChange,
}: DatePickerRangeProps) {
  const [isOpen, setOpen] = useOpen(open, onOpenChange);
  const [inner, setInner] = useState<DateRange | null>(null);
  const [month, setMonth] = useState<Date>(() => value?.from ?? new Date());
  const selected = value !== undefined ? value : inner;

  const setSelected = (next: DateRange | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <DateField
      id={id}
      label={selected?.from ? formatRangeLabel(selected.from, selected.to) : placeholder}
      empty={!selected?.from}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={(next) => {
        if (next && selected?.from) setMonth(selected.from);
        setOpen(next);
      }}
    >
      <Calendar
        mode="range"
        selected={selected ?? undefined}
        month={month}
        onMonthChange={setMonth}
        disablePast={disablePast}
        onSelect={(range) => {
          setSelected(range ?? null);
          if (range?.from && range.to && !sameDay(range.from, range.to)) setOpen(false);
        }}
      />
      {selected?.from ? (
        <div className="px-1 pt-1 pb-1">
          <Button type="button" variant="ghost" width="full" onClick={() => setSelected(null)}>
            Clear
          </Button>
        </div>
      ) : null}
    </DateField>
  );
}

function DatePicker(props: DatePickerProps) {
  if (props.mode === "range") return <RangeDatePicker {...props} />;
  return <SingleDatePicker {...props} />;
}

export { DatePicker };
export type { DateRange };
