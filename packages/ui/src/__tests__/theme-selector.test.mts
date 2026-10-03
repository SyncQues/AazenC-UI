import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("theme selector is one menu", () => {
  const source = readFileSync(new URL("../theme-selector.tsx", import.meta.url), "utf8");
  assert.match(source, /DropdownMenuRadioGroup/);
  assert.match(source, /Appearance/);
  assert.match(source, /Theme/);
  assert.match(source, /variant="outline"/);
  assert.doesNotMatch(source, /Surface|Glass/);
  assert.doesNotMatch(source, /size="lg"|size="icon"/);
});
