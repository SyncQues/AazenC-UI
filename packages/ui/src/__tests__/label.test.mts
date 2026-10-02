import assert from "node:assert/strict";
import test from "node:test";
import { labelClass } from "../label-variants.ts";

test("label is one caption", () => {
  assert.match(labelClass, /text-sm/);
  assert.match(labelClass, /font-medium/);
  assert.match(labelClass, /peer-disabled:opacity-50/);
  assert.doesNotMatch(labelClass, /text-base|text-xs|uppercase/);
});
