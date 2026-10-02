import assert from "node:assert/strict";
import test from "node:test";
import { toastCardVariants, toastIconClass, toastViewportClass } from "../toast-variants.ts";

test("toast is one card with distinct tones", () => {
  assert.match(toastViewportClass, /top-4/);
  assert.match(toastViewportClass, /right-4/);
  assert.match(toastCardVariants({ tone: "default" }), /rounded-\[1\.125rem\]/);
  assert.match(toastCardVariants({ tone: "success" }), /bg-popover/);
  assert.match(toastIconClass, /data-\[tone=success\]/);
  assert.match(toastIconClass, /data-\[tone=warning\]/);
  assert.match(toastIconClass, /data-\[tone=destructive\]/);
  assert.doesNotMatch(toastCardVariants({ tone: "default" }), /bg-primary|rounded-md/);
});
