import assert from "node:assert/strict";
import test from "node:test";
import {
  selectContentClass,
  selectItemClass,
  selectTriggerClass,
  selectViewportClass,
} from "../select-variants.ts";

test("select trigger matches the input pill", () => {
  assert.match(selectTriggerClass, /h-9/);
  assert.match(selectTriggerClass, /rounded-full/);
  assert.match(selectTriggerClass, /px-4/);
  assert.match(selectTriggerClass, /border-input/);
  assert.match(selectTriggerClass, /focus-visible:ring-\[3px\]/);
  assert.match(selectTriggerClass, /aria-invalid:border-destructive/);
  assert.doesNotMatch(selectTriggerClass, /rounded-md|h-10|h-12|bg-zinc/);
});

test("select menu is one popover", () => {
  assert.match(selectContentClass, /menu-motion/);
  assert.match(selectContentClass, /rounded-\[1\.125rem\]/);
  assert.match(selectContentClass, /bg-popover/);
  assert.match(selectContentClass, /shadow-md/);
  assert.match(selectContentClass, /z-\[var\(--z-popper\)\]/);
  assert.match(selectViewportClass, /overflow-y-auto/);
  assert.match(selectItemClass, /pl-8/);
  assert.doesNotMatch(selectContentClass, /shadow-2xl|backdrop-blur|slide-in/);
  assert.doesNotMatch(selectViewportClass, /trigger-height/);
});
