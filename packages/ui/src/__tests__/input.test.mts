import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { inputVariants } from "../input-variants.ts";

const component = readFileSync(new URL("../input.tsx", import.meta.url), "utf8");

test("input is one field", () => {
  const value = cn(inputVariants({}));
  assert.match(value, /h-9/);
  assert.match(value, /rounded-full/);
  assert.match(value, /px-4/);
  assert.match(value, /border-input/);
  assert.match(value, /focus-visible:ring-\[3px\]/);
  assert.match(value, /aria-invalid:border-destructive/);
  assert.doesNotMatch(value, /rounded-md|h-12|bg-zinc|backdrop-blur|pl-10/);
});

test("a leading icon only adds padding", () => {
  const value = cn(inputVariants({ icon: true }));
  assert.match(value, /pl-10/);
  assert.match(value, /h-9/);
  assert.match(value, /rounded-full/);
});

test("the type is the native one, set by the caller", () => {
  assert.match(component, /type = "text"/);
  assert.match(component, /type\?: ComponentProps<"input">\["type"\]/);
  // The type reaches the element itself, so the browser keeps doing its own job.
  assert.match(component, /type=\{type\}/);
});

test("the count is opt-in and starts out off", () => {
  assert.match(component, /showCount = false/);
  assert.match(component, /data-slot="input-counter"/);
  assert.match(component, /\{length\} \/ \{limit\}/);
});

test("the text is kept clear of the count, and it is measured not guessed", () => {
  // A fixed reserve breaks on any font that is not the one it was guessed against.
  assert.match(component, /counterClearance\(field, counterRef\.current\)/);
  assert.match(component, /field\.style\.paddingRight/);
  // Re-measured when the *used* count changes, not only when the limit does: `9 / 24`
  // and `10 / 24` are a digit apart, and a reserve taken once per limit slides under
  // the text the moment the used number crosses into a second digit.
  assert.match(component, /\}, \[withCount, maxLength, length\]\);/);
});

test("the icon centres on the field, not on the counter", () => {
  // The counter is out of flow, so this box is the field's own height and the icon stays put.
  assert.match(component, /cn\("relative w-full", counterRootClass\)/);
  assert.match(component, /absolute top-1\/2 left-4 -translate-y-1\/2/);
  assert.match(component, /if \(!icon && !withCount\) return field;/);
});
