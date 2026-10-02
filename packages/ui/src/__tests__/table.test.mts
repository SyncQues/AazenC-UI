import assert from "node:assert/strict";
import test from "node:test";
import { tableContainerClass, tableFooterClass, tableRowClass } from "../table-variants.ts";

test("table is one bordered grid", () => {
  assert.match(tableContainerClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(tableContainerClass, /border-border/);
  assert.match(tableRowClass, /hover:bg-foreground\/5/);
  assert.match(tableFooterClass, /bg-foreground\/5/);
  assert.doesNotMatch(tableRowClass, /bg-muted|odd:|even:/);
  assert.doesNotMatch(tableContainerClass, /rounded-none|shadow-md/);
});
