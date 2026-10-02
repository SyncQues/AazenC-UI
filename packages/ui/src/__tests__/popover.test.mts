import assert from "node:assert/strict";
import test from "node:test";
import { popoverContentClass } from "../popover-variants.ts";

test("popover is one menu panel", () => {
  assert.match(popoverContentClass, /rounded-\[1\.125rem\]/);
  assert.match(popoverContentClass, /bg-popover/);
  assert.match(popoverContentClass, /w-72/);
  assert.match(popoverContentClass, /menu-motion/);
  assert.doesNotMatch(popoverContentClass, /rounded-full|rounded-md|bg-primary/);
});
