"use client";

import { useState } from "react";
import { Button } from "./button";
import { applyTime, formatTimeLabel } from "./calendar-utils";
import { DateField } from "./date-field";
import { TimeControls } from "./time-controls";
import { useOpen } from "./use-open";

export interface TimePickerProps {
  id?: string;
  value?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function TimePicker({
  id,
  value,
  onValueChange,
  placeholder = "Pick a time",
  disabled = false,
  invalid = false,
  open,
  onOpenChange,
  className,
}: TimePickerProps) {
  const [isOpen, setOpen] = useOpen(open, onOpenChange);
  const [inner, setInner] = useState<Date | null>(null);
  const selected = value !== undefined ? value : inner;

  const setSelected = (next: Date | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const hours = selected?.getHours() ?? 12;
  const minutes = selected?.getMinutes() ?? 0;

  return (
    <DateField
      id={id}
      icon="time"
      label={selected ? formatTimeLabel(hours, minutes) : placeholder}
      empty={!selected}
      disabled={disabled}
      invalid={invalid}
      open={isOpen}
      onOpenChange={setOpen}
      className={className}
    >
      <TimeControls
        hours={hours}
        minutes={minutes}
        disabled={disabled}
        onChange={(nextHours, nextMinutes) => setSelected(applyTime(selected ?? new Date(), nextHours, nextMinutes))}
      />
      <div data-slot="time-picker" className="flex flex-col gap-1 px-1 pt-1 pb-1">
        {selected ? (
          <Button type="button" variant="ghost" width="full" onClick={() => setSelected(null)}>
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
