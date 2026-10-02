"use client";

import { timePartClass } from "./calendar-variants";
import { fromHour12, toHour12 } from "./calendar-utils";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

export interface TimeControlsProps {
  hours: number;
  minutes: number;
  disabled?: boolean;
  onChange: (hours: number, minutes: number) => void;
}

function TimeControls({ hours, minutes, disabled = false, onChange }: TimeControlsProps) {
  const { hour, period } = toHour12(hours);

  return (
    <div data-slot="time-controls" className="flex items-center gap-2 px-1 py-1">
      <select
        aria-label="Hour"
        disabled={disabled}
        value={String(hour)}
        className={timePartClass}
        onChange={(event) => onChange(fromHour12(Number(event.target.value), period), minutes)}
      >
        {HOURS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="text-muted-foreground">
        :
      </span>
      <select
        aria-label="Minute"
        disabled={disabled}
        value={String(minutes)}
        className={timePartClass}
        onChange={(event) => onChange(hours, Number(event.target.value))}
      >
        {MINUTES.map((item) => (
          <option key={item} value={item}>
            {String(item).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        aria-label="Period"
        disabled={disabled}
        value={period}
        className={timePartClass}
        onChange={(event) => onChange(fromHour12(hour, event.target.value === "PM" ? "PM" : "AM"), minutes)}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export { TimeControls };
