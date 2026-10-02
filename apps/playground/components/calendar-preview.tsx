"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Calendar } from "@aazenc/ui/calendar";
import { DatePicker, type DateRange } from "@aazenc/ui/date-picker";
import { DateTimePicker } from "@aazenc/ui/date-time-picker";
import { Label } from "@aazenc/ui/label";
import { MonthPicker } from "@aazenc/ui/month-picker";
import { TimePicker } from "@aazenc/ui/time-picker";
import { useTheme } from "@aazenc/themes";

export function CalendarPreview() {
  const { mode, toggleMode } = useTheme();
  const [day, setDay] = useState<Date | undefined>(new Date(2026, 9, 2));
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One month grid. Date, range, month, time, and date-time use the same pill field.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid gap-10">
        <section className="grid gap-3">
          <h2 className="text-lg font-medium">Month</h2>
          <Calendar mode="single" selected={day} onSelect={setDay} />
        </section>

        <section className="grid max-w-sm gap-6">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <DatePicker id="date" value={date} onValueChange={setDate} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="range">Range</Label>
            <DatePicker id="range" mode="range" value={range} onValueChange={setRange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="month">Month</Label>
            <MonthPicker id="month" value={month} onValueChange={setMonth} allowPresent />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <TimePicker id="time" value={time} onValueChange={setTime} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date-time">Date and time</Label>
            <DateTimePicker id="date-time" value={dateTime} onValueChange={setDateTime} />
          </div>
        </section>
      </div>
    </main>
  );
}
