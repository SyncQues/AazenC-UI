import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyClass,
  emptyContentClass,
  emptyDescriptionClass,
  emptyMediaClass,
  emptyTitleClass,
} from "../empty-variants.ts";

test("empty is one dashed message", () => {
  assert.match(emptyClass, /border-dashed/);
  assert.match(emptyClass, /border-border/);
  assert.match(emptyClass, /items-center/);
  assert.match(emptyClass, /animate-fade-in/);
  assert.doesNotMatch(emptyClass, /bg-card|backdrop-blur|shadow-xl|rounded-2xl/);
  assert.match(emptyMediaClass, /size-10/);
  assert.match(emptyMediaClass, /bg-muted/);
  assert.match(emptyMediaClass, /rounded-lg/);
  assert.match(emptyTitleClass, /text-lg/);
  assert.match(emptyDescriptionClass, /text-muted-foreground/);
  assert.match(emptyContentClass, /max-w-sm/);
});
