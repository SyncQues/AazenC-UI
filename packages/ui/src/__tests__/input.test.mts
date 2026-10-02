import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { inputVariants } from "../input-variants.ts";

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
