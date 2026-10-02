import assert from "node:assert/strict";
import test from "node:test";
import { clampProgress } from "../progress-utils.ts";

test("progress clamps numbers and keeps indeterminate empty", () => {
  assert.equal(clampProgress(undefined, 100), null);
  assert.equal(clampProgress(null, 100), null);
  assert.equal(clampProgress(Number.NaN, 100), null);
  assert.equal(clampProgress(-4, 100), 0);
  assert.equal(clampProgress(140, 100), 100);
  assert.equal(clampProgress(12, 0), 12);
  assert.equal(clampProgress(40, 50), 40);
});
