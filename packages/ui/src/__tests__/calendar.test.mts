import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  formatDateLabel,
  formatMonthValue,
  formatRangeLabel,
  formatTimeLabel,
  fromHour12,
  parseMonthValue,
  withPastDisabled,
} from "../calendar-utils.ts";
import {
  calendarDayButtonClass,
  calendarDropdownRootClass,
  dateFieldClass,
  datePanelClass,
  monthButtonClass,
} from "../calendar-variants.ts";

test("calendar fields share one pill and one grid", () => {
  assert.match(dateFieldClass, /rounded-full/);
  assert.match(dateFieldClass, /h-9/);
  assert.match(datePanelClass, /rounded-\[1\.125rem\]/);
  assert.match(calendarDayButtonClass, /rounded-full/);
  assert.match(calendarDayButtonClass, /data-\[selection=single\]:bg-primary/);
  assert.match(monthButtonClass, /rounded-full/);
  assert.match(calendarDropdownRootClass, /rounded-md/);
  assert.match(calendarDropdownRootClass, /border-border/);
  assert.doesNotMatch(`${dateFieldClass} ${datePanelClass} ${calendarDayButtonClass}`, /backdrop-blur|bg-muted|glass-panel/);
  const source = readFileSync(new URL("../calendar.tsx", import.meta.url), "utf8");
  assert.match(source, /captionLayout="dropdown"/);
  assert.doesNotMatch(source, /calendarVariants|variant="chrome"|variant="outline"|variant="elevated"/);
});

test("date labels stay in one format", () => {
  assert.equal(formatDateLabel(new Date(2024, 2, 5)), "Mar 5, 2024");
  assert.equal(formatRangeLabel(new Date(2024, 2, 5), new Date(2024, 2, 5)), "Mar 5, 2024");
  assert.equal(formatRangeLabel(new Date(2024, 2, 5), new Date(2024, 2, 8)), "Mar 5, 2024 – Mar 8, 2024");
  assert.equal(formatTimeLabel(0, 0), "12:00 AM");
  assert.equal(formatTimeLabel(9, 5), "9:05 AM");
  assert.equal(formatTimeLabel(12, 30), "12:30 PM");
  assert.equal(formatTimeLabel(15, 0), "3:00 PM");
  assert.equal(fromHour12(12, "AM"), 0);
  assert.equal(fromHour12(12, "PM"), 12);
  assert.equal(fromHour12(3, "PM"), 15);
  assert.equal(formatMonthValue(2024, 2), "2024-03");
  assert.deepEqual(parseMonthValue("2024-03"), { year: 2024, month: 2 });
  assert.equal(parseMonthValue("Present"), "present");
  assert.equal(parseMonthValue("nope"), null);
  const today = new Date(2026, 9, 2);
  const past = withPastDisabled(undefined, true, today) as { before: Date };
  assert.equal(past.before.getDate(), 2);
  const matcher = { before: today };
  assert.equal(withPastDisabled(matcher, false, today), matcher);
});
