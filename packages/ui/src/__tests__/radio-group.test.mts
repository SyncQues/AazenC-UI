import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  radioGroupClass,
  radioGroupDotClass,
  radioGroupHorizontalClass,
  radioGroupIndicatorClass,
  radioGroupItemClass,
} from "../radio-group-variants.ts";

const source = readFileSync(new URL("../radio-group.tsx", import.meta.url), "utf8");

test("radio group is a column of circles", () => {
  assert.match(radioGroupClass, /grid/);
  assert.match(radioGroupClass, /gap-3/);
  assert.match(radioGroupHorizontalClass, /grid-flow-col/);
  assert.match(radioGroupHorizontalClass, /w-fit/);
  assert.match(radioGroupItemClass, /size-4/);
  assert.match(radioGroupItemClass, /rounded-full/);
  assert.doesNotMatch(radioGroupItemClass, /rounded-\[4px\]/);
  assert.match(radioGroupItemClass, /data-\[state=checked\]:border-primary/);
  assert.match(radioGroupItemClass, /data-\[state=checked\]:text-primary/);
  assert.doesNotMatch(radioGroupItemClass, /data-\[state=checked\]:bg-primary/);
  assert.match(radioGroupItemClass, /aria-invalid:border-destructive/);
  assert.match(radioGroupItemClass, /focus-visible:ring-\[3px\]/);
  assert.match(radioGroupItemClass, /dark:border-foreground\/45/);
  assert.match(radioGroupIndicatorClass, /animate-checkbox-check/);
  assert.match(radioGroupDotClass, /size-2/);
  assert.match(radioGroupDotClass, /rounded-full/);
  assert.match(radioGroupDotClass, /bg-current/);
});

test("className is merged before the rest spread", () => {
  const group = source.slice(source.indexOf("function RadioGroup("), source.indexOf("function RadioGroupItem("));
  const item = source.slice(source.indexOf("function RadioGroupItem("));
  for (const body of [group, item]) {
    const classAt = body.indexOf("className={cn(");
    const spreadAt = body.indexOf("{...props}");
    assert.ok(classAt !== -1 && spreadAt !== -1 && classAt < spreadAt);
  }
  assert.match(source, /data-slot="radio-group"/);
  assert.match(source, /data-slot="radio-group-item"/);
  assert.match(source, /orientation=\{orientation\}/);
});
