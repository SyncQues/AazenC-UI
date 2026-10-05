"use client";

import { useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { applyTime, formatDateLabel, formatTimeLabel } from "./calendar-utils";
import { DateField } from "./date-field";
import { TimeControls } from "./time-controls";
import { useOpen } from "./use-open";

export interface DateTimePickerProps {
  id?: string;
  /** Local date and time. Formatting with `toISOString()` shifts the date west of UTC. */
  value?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  disablePast?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function DateTimePicker({
  id,
  value,
  onValueChange,
  placeholder = "Pick a date and time",
  disabled = false,
  invalid = false,
  disablePast = false,
  open,
  onOpenChange,
  className,
}: DateTimePickerProps) {
  const [isOpen, setOpen] = useOpen(open, onOpenChange);
  const [inner, setInner] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | undefined>(() => value ?? undefined);
  const selected = value !== undefined ? value : inner;

  const setSelected = (next: Date | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const hours = selected?.getHours() ?? 12;
  const minutes = selected?.getMinutes() ?? 0;
  const label = selected
    ? `${formatDateLabel(selected)} · ${formatTimeLabel(selected.getHours(), selected.getMinutes())}`
    : placeholder;

  return (
    <DateField
      id={id}
      label={label}
      empty={!selected}
      className={className}
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
          if (!date) {
            setSelected(null);
            return;
          }
          setSelected(applyTime(date, selected ? hours : 12, selected ? minutes : 0));
        }}
      />
      <div className="mx-1 border-t border-border">
        <TimeControls
          hours={hours}
          minutes={minutes}
          disabled={disabled}
          onChange={(nextHours, nextMinutes) => setSelected(applyTime(selected ?? new Date(), nextHours, nextMinutes))}
        />
      </div>
      <div className="flex flex-col gap-1 px-1 pt-1 pb-1">
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

export { DateTimePicker };
