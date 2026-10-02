import assert from "node:assert/strict";
import test from "node:test";
import { tooltipContentClass } from "../tooltip-variants.ts";

test("tooltip is one inverse bubble", () => {
  assert.match(tooltipContentClass, /bg-primary/);
  assert.match(tooltipContentClass, /text-primary-foreground/);
  assert.match(tooltipContentClass, /rounded-md/);
  assert.match(tooltipContentClass, /menu-motion/);
  assert.doesNotMatch(tooltipContentClass, /bg-popover|rounded-full|text-sm/);
});
