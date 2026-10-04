import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  dropdownMenuContentClass,
  dropdownMenuItemVariants,
} from "../menu-variants.ts";

test("dropdown is one panel", () => {
  assert.match(dropdownMenuContentClass, /menu-motion/);
  assert.match(dropdownMenuContentClass, /bg-popover/);
  assert.match(dropdownMenuContentClass, /border-border/);
  assert.match(dropdownMenuContentClass, /shadow-md/);
  assert.match(dropdownMenuContentClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(dropdownMenuContentClass, /z-\[var\(--z-popper\)\]/);
  assert.doesNotMatch(dropdownMenuContentClass, /slide-in-from|backdrop-blur|shadow-lg|bg-background/);
});

test("destructive is the only item tone", () => {
  const item = cn(dropdownMenuItemVariants({}));
  assert.match(item, /focus:bg-accent/);
  assert.doesNotMatch(item, /text-destructive/);

  const danger = cn(dropdownMenuItemVariants({ tone: "destructive" }));
  assert.match(danger, /text-destructive/);
  assert.match(danger, /dark:text-\[oklch\(0\.78_0\.16_25\)\]/);
  assert.match(danger, /focus:bg-destructive\/10/);
});
