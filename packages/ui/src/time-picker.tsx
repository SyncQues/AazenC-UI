"use client";

import { useState } from "react";
import { Button } from "./button";
import { applyTime, formatTimeLabel } from "./calendar-utils";
import { DateField } from "./date-field";
import { TimeControls } from "./time-controls";

export interface TimePickerProps {
  id?: string;
  value?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function TimePicker({
  id,
  value = null,
  onValueChange,
  placeholder = "Pick a time",
  disabled = false,
  invalid = false,
  open,
  onOpenChange,
}: TimePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const hours = value?.getHours() ?? 12;
  const minutes = value?.getMinutes() ?? 0;
  const base = value ?? new Date();

  return (
    <DateField
      id={id}
      icon="time"
      label={value ? formatTimeLabel(hours, minutes) : placeholder}
      empty={!value}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={setOpen}
    >
      <TimeControls
        hours={hours}
        minutes={minutes}
        disabled={disabled}
        onChange={(nextHours, nextMinutes) => onValueChange?.(applyTime(base, nextHours, nextMinutes))}
      />
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

export { TimePicker };
