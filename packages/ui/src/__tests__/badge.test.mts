import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { badgeVariants } from "../badge-variants.ts";

test("badge default is a solid pill", () => {
  const value = cn(badgeVariants({}));
  assert.match(value, /rounded-full/);
  assert.match(value, /bg-primary/);
  assert.match(value, /text-xs/);
  assert.doesNotMatch(value, /bg-secondary|bg-green|bg-amber|bg-blue/);
});

test("soft replaces the pale secondary chip", () => {
  const value = cn(badgeVariants({ variant: "soft" }));
  assert.match(value, /bg-foreground\/10/);
  assert.match(value, /text-foreground/);
  assert.doesNotMatch(value, /bg-secondary|bg-muted/);
});

test("outline and destructive stay distinct", () => {
  const outline = cn(badgeVariants({ variant: "outline" }));
  const destructive = cn(badgeVariants({ variant: "destructive" }));
  assert.match(outline, /border-border/);
  assert.match(outline, /bg-transparent/);
  assert.match(destructive, /bg-destructive/);
  assert.match(destructive, /text-white/);
  assert.match(destructive, /dark:bg-destructive\/60/);
});
