"use client";

import { useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { applyTime, formatDateLabel, formatTimeLabel } from "./calendar-utils";
import { DateField } from "./date-field";
import { TimeControls } from "./time-controls";

export interface DateTimePickerProps {
  id?: string;
  value?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  disablePast?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DateTimePicker({
  id,
  value = null,
  onValueChange,
  placeholder = "Pick a date and time",
  disabled = false,
  invalid = false,
  disablePast = false,
  open,
  onOpenChange,
}: DateTimePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => value ?? new Date());
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (next && value) setMonth(value);
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const hours = value?.getHours() ?? 12;
  const minutes = value?.getMinutes() ?? 0;
  const label = value
    ? `${formatDateLabel(value)} · ${formatTimeLabel(value.getHours(), value.getMinutes())}`
    : placeholder;

  return (
    <DateField
      id={id}
      label={label}
      empty={!value}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={setOpen}
    >
      <Calendar
        mode="single"
        selected={value ?? undefined}
        month={month}
        onMonthChange={setMonth}
        disablePast={disablePast}
        onSelect={(date) => {
          if (!date) {
            onValueChange?.(null);
            return;
          }
          onValueChange?.(applyTime(date, value ? hours : 12, value ? minutes : 0));
        }}
      />
      <div className="mx-1 border-t border-border">
        <TimeControls
          hours={hours}
          minutes={minutes}
          disabled={disabled}
          onChange={(nextHours, nextMinutes) => {
            onValueChange?.(applyTime(value ?? new Date(), nextHours, nextMinutes));
          }}
        />
      </div>
      <div className="flex flex-col gap-1 px-1 pt-1 pb-1">
        {value ? (
          <Button type="button" variant="ghost" width="full" onClick={() => onValueChange?.(null)}>
            Clear
          </Button>
        ) : null}
        <Button type="button" variant="outline" width="full" onClick={() => setOpen(false)}>
          Done
        </Button>
      </div>
    </DateField>
  );
}

export { DateTimePicker };
