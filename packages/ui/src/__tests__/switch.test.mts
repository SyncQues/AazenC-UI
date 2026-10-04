import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { switchClass, switchThumbClass } from "../switch-variants.ts";

test("switch is one track", () => {
  assert.match(switchClass, /h-6/);
  assert.match(switchClass, /w-11/);
  assert.match(switchClass, /rounded-full/);
  assert.match(switchClass, /data-\[state=checked\]:bg-primary/);
  assert.doesNotMatch(switchClass, /dark:data-\[state=checked\]:bg-primary/);
  assert.match(switchClass, /dark:border-foreground\/45/);
  assert.doesNotMatch(switchClass, /dark:bg-input|h-\[1\.15rem\]|size-5/);
  assert.match(switchThumbClass, /data-\[state=checked\]:translate-x-5/);
  assert.match(switchThumbClass, /dark:data-\[state=unchecked\]:bg-foreground/);
  assert.doesNotMatch(switchThumbClass, /dark:data-\[state=checked\]:bg-primary-foreground/);
});

test("no dark fill on the track, so the checked primary always shows", () => {
  assert.doesNotMatch(switchClass, /dark:bg-/);
});

test("dark variant adds no specificity, so state utilities beat it", () => {
  const config = readFileSync(
    new URL("../../../config/src/globals.css", import.meta.url),
    "utf8",
  );
  // `:is(.dark *)` outranked `data-[state=checked]` and hid the on state in dark mode.
  assert.match(config, /@custom-variant dark \(&:where\(/);
  assert.doesNotMatch(config, /@custom-variant dark \(&:is\(/);
});
