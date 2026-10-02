import assert from "node:assert/strict";
import test from "node:test";
import { collapsibleContentClass, collapsibleTriggerClass } from "../collapsible-variants.ts";

test("collapsible is one disclosure", () => {
  assert.match(collapsibleTriggerClass, /w-full/);
  assert.match(collapsibleTriggerClass, /hover:bg-accent\/40/);
  assert.match(collapsibleContentClass, /collapsible-motion/);
  assert.doesNotMatch(collapsibleTriggerClass, /border-b|bg-card|rounded-2xl/);
  assert.doesNotMatch(collapsibleContentClass, /animate-accordion/);
});
