"use client";

import { useEffect, useRef, useState, type ComponentProps, type HTMLAttributes, type Ref } from "react";
import {
  DayPicker,
  type DateRange,
  type DayButtonProps,
  type Matcher,
} from "react-day-picker";
import { cn } from "@aazenc/utils";
import {
  calendarCaptionClass,
  calendarClass,
  calendarDayButtonClass,
  calendarDayClass,
  calendarDropdownClass,
  calendarDropdownLabelClass,
  calendarDropdownRootClass,
  calendarDropdownsClass,
  calendarMonthClass,
  calendarMonthsClass,
  calendarNavButtonClass,
  calendarNavClass,
  calendarRangeEndClass,
  calendarRangeMiddleClass,
  calendarRangeStartClass,
  calendarWeekClass,
  calendarWeekdayClass,
  calendarWeekdaysClass,
} from "./calendar-variants";
import { withPastDisabled } from "./calendar-utils";

type CalendarShared = {
  /** Days before today cannot be chosen. */
  disablePast?: boolean;
  disabled?: Matcher | Matcher[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  id?: string;
  className?: string;
};

export type CalendarSingleProps = CalendarShared & {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
};

export type CalendarRangeProps = CalendarShared & {
  mode: "range";
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
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

function CalendarDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const selection = modifiers.range_middle
    ? "middle"
    : modifiers.range_start
      ? "start"
      : modifiers.range_end
        ? "end"
        : modifiers.selected
          ? "single"
          : undefined;

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.isoDate}
      data-today={modifiers.today ? "true" : undefined}
      data-outside={modifiers.outside ? "true" : undefined}
      data-selection={selection}
      className={cn(calendarDayButtonClass, className)}
      {...props}
    />
  );
}

function CalendarRoot({
  rootRef,
  ...rootProps
}: HTMLAttributes<HTMLDivElement> & { rootRef?: Ref<HTMLDivElement> }) {
  return <div data-slot="calendar" ref={rootRef} {...rootProps} />;
}

function CalendarChevron({ orientation }: { orientation?: "up" | "down" | "left" | "right" }) {
  if (orientation === "down" || orientation === "up") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
        <path
          d={orientation === "up" ? "m6 14 6-6 6 6" : "m6 10 6 6 6-6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return <ChevronIcon direction={orientation === "left" ? "left" : "right"} />;
}

function CalendarChrome({ className, ...props }: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn(calendarClass, className)}
      classNames={{
        months: calendarMonthsClass,
        month: calendarMonthClass,
        nav: calendarNavClass,
        button_previous: calendarNavButtonClass,
        button_next: calendarNavButtonClass,
        month_caption: calendarCaptionClass,
        dropdowns: calendarDropdownsClass,
        dropdown_root: calendarDropdownRootClass,
        dropdown: calendarDropdownClass,
        caption_label: calendarDropdownLabelClass,
        weekdays: calendarWeekdaysClass,
        weekday: calendarWeekdayClass,
        week: calendarWeekClass,
        day: calendarDayClass,
        range_start: calendarRangeStartClass,
        range_middle: calendarRangeMiddleClass,
        range_end: calendarRangeEndClass,
        today: "",
        outside: "",
        disabled: "",
      }}
      components={{
        Root: CalendarRoot,
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
      }}
      {...props}
      captionLayout="dropdown"
      fixedWeeks
      formatters={{
        formatMonthDropdown: (month, dateLib) =>
          dateLib ? dateLib.format(month, "LLL") : month.toLocaleDateString("en-US", { month: "short" }),
        ...props.formatters,
      }}
    />
  );
}

function Calendar(props: CalendarProps) {
  const { disablePast = false, disabled, ...rest } = props;
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const resolvedDisabled = (
    disablePast && today ? withPastDisabled(disabled, true, today) : disabled
  ) as Matcher | Matcher[] | undefined;
  const startMonth = rest.startMonth ?? (today ? new Date(today.getFullYear() - 100, 0, 1) : undefined);
  const endMonth = rest.endMonth ?? (today ? new Date(today.getFullYear() + 10, 11, 31) : undefined);

  if (rest.mode === "range") {
    return (
      <CalendarChrome
        mode="range"
        selected={rest.selected}
        onSelect={rest.onSelect}
        disabled={resolvedDisabled}
        month={rest.month}
        onMonthChange={rest.onMonthChange}
        defaultMonth={rest.defaultMonth}
        startMonth={startMonth}
        endMonth={endMonth}
        id={rest.id}
        className={rest.className}
      />
    );
  }

  return (
    <CalendarChrome
      mode="single"
      selected={rest.selected}
      onSelect={rest.onSelect}
      disabled={resolvedDisabled}
      month={rest.month}
      onMonthChange={rest.onMonthChange}
      defaultMonth={rest.defaultMonth}
      startMonth={startMonth}
      endMonth={endMonth}
      id={rest.id}
      className={rest.className}
    />
  );
}

export { Calendar };
export type { DateRange };
