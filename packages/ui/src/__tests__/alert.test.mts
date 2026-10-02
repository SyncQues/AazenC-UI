import assert from "node:assert/strict";
import test from "node:test";
import {
  alertActionClass,
  alertDescriptionClass,
  alertIconClass,
  alertTitleClass,
  alertVariants,
} from "../alert-variants.ts";

test("alert is one inline message and the tone paints it", () => {
  assert.match(alertVariants(), /flex/);
  assert.match(alertVariants(), /items-start/);
  assert.match(alertVariants(), /flex-wrap/);
  assert.match(alertVariants(), /p-4/);
  assert.match(alertVariants(), /border-border/);
  assert.match(alertVariants({ tone: "success" }), /bg-success\/10/);
  assert.match(alertVariants({ tone: "warning" }), /bg-warning\/10/);
  assert.match(alertVariants({ tone: "destructive" }), /border-destructive\/40/);
});

test("alert takes the same three shapes as button, panel radius first", () => {
  assert.match(alertVariants(), /rounded-\[var\(--radius-panel\)\]/);
  assert.match(alertVariants({ shape: "rounded" }), /rounded-\[var\(--radius-panel\)\]/);
  assert.match(alertVariants({ shape: "pill" }), /rounded-full/);
  assert.match(alertVariants({ shape: "square" }), /rounded-none/);
  assert.doesNotMatch(alertVariants(), /rounded-full|rounded-none/);
});

test("alert washes the tone in, never fills the box", () => {
  assert.doesNotMatch(alertVariants({ tone: "success" }), /bg-success\/[^1]/);
  assert.doesNotMatch(alertVariants({ tone: "warning" }), /bg-warning\/[^1]/);
  assert.doesNotMatch(alertVariants({ tone: "destructive" }), /bg-destructive\/[^1]/);
  assert.doesNotMatch(alertVariants({ tone: "destructive" }), /text-destructive\b/);
});

test("alert parts are one column with actions at the end", () => {
  assert.match(alertTitleClass, /font-medium/);
  assert.match(alertDescriptionClass, /text-muted-foreground/);
  assert.match(alertActionClass, /ml-auto/);
  assert.match(alertActionClass, /justify-end/);
});

test("the icon carries the tone through the readable token", () => {
  assert.match(alertIconClass, /size-5/);
  assert.match(alertIconClass, /data-\[tone=success\]:text-success-foreground/);
  assert.match(alertIconClass, /data-\[tone=warning\]:text-warning-foreground/);
  assert.match(alertIconClass, /data-\[tone=destructive\]:text-destructive-foreground/);
  assert.doesNotMatch(alertIconClass, /dark:/);
  assert.doesNotMatch(alertIconClass, /oklch\(/);
});
