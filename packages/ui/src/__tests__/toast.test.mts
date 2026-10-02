import assert from "node:assert/strict";
import test from "node:test";
import { toastCardVariants, toastIconClass, toastViewportClass } from "../toast-variants.ts";

test("toast is one card and tones change the icon", () => {
  assert.match(toastViewportClass, /top-4/);
  assert.match(toastViewportClass, /right-4/);
  assert.match(toastViewportClass, /z-\[var\(--z-toast\)\]/);
  assert.match(toastCardVariants({ tone: "default" }), /rounded-\[var\(--radius-panel\)\]/);
  assert.match(toastCardVariants({ tone: "success" }), /bg-popover/);
  assert.match(toastIconClass, /data-\[tone=success\]:text-success-foreground/);
  assert.match(toastIconClass, /data-\[tone=warning\]:text-warning-foreground/);
  assert.match(toastIconClass, /data-\[tone=destructive\]:text-destructive/);
  assert.doesNotMatch(toastCardVariants({ tone: "default" }), /bg-primary|rounded-md/);
  assert.doesNotMatch(toastIconClass, /oklch\(/);
});
