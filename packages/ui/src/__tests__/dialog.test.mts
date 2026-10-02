import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  dialogBodyVariants,
  dialogCloseClass,
  dialogContentVariants,
  dialogDescriptionClass,
  dialogFooterVariants,
  dialogHeaderVariants,
  dialogOverlayClass,
  dialogTitleClass,
} from "../dialog-variants.ts";

function content(options: Parameters<typeof dialogContentVariants>[0]) {
  return cn(dialogContentVariants(options));
}

test("default dialog is one centered panel", () => {
  const value = content({});
  assert.match(value, /dialog-motion/);
  assert.match(value, /bg-background/);
  assert.match(value, /border-border/);
  assert.match(value, /shadow-lg/);
  assert.match(value, /rounded-lg/);
  assert.match(value, /sm:max-w-lg/);
  assert.match(value, /max-h-\[85vh\]/);
  assert.match(value, /-translate-x-1\/2/);
  assert.match(value, /-translate-y-1\/2/);
  assert.match(value, /z-\[var\(--z-dialog\)\]/);
  assert.match(value, /gap-4/);
  assert.match(value, /p-6/);
  assert.doesNotMatch(value, /sm:max-w-md|sm:max-w-2xl|sm:max-w-5xl|p-0|backdrop-blur|bg-card/);
});

test("widths collapse to four sizes", () => {
  assert.match(content({ size: "sm" }), /sm:max-w-md/);
  assert.doesNotMatch(content({ size: "sm" }), /sm:max-w-lg/);

  assert.match(content({ size: "lg" }), /sm:max-w-2xl/);
  assert.doesNotMatch(content({ size: "lg" }), /sm:max-w-lg/);

  assert.match(content({ size: "xl" }), /sm:max-w-5xl/);
  assert.doesNotMatch(content({ size: "xl" }), /sm:max-w-2xl|sm:max-w-4xl/);
});

test("flush padding is the composer shell", () => {
  const value = content({ padding: "none" });
  assert.match(value, /p-0/);
  assert.match(value, /gap-0/);
  assert.match(value, /overflow-hidden/);
  assert.doesNotMatch(value, /(^|\s)p-6(\s|$)/);
  assert.doesNotMatch(value, /gap-4/);

  const header = cn(dialogHeaderVariants({ padding: "none", close: true }));
  assert.match(header, /border-b/);
  assert.match(header, /px-6/);
  assert.match(header, /pr-10/);

  const body = cn(dialogBodyVariants({ padding: "none" }));
  assert.match(body, /overflow-y-auto/);
  assert.match(body, /px-6/);

  const footer = cn(dialogFooterVariants({ padding: "none" }));
  assert.match(footer, /border-t/);
  assert.match(footer, /sm:justify-end/);
});

test("chrome stays one title, one description, and one overlay", () => {
  assert.match(dialogTitleClass, /text-lg/);
  assert.match(dialogTitleClass, /font-semibold/);
  assert.match(dialogDescriptionClass, /text-sm/);
  assert.match(dialogDescriptionClass, /text-muted-foreground/);
  assert.match(dialogOverlayClass, /dialog-overlay-motion/);
  assert.match(dialogOverlayClass, /bg-black\/50/);
  assert.match(dialogOverlayClass, /z-\[var\(--z-overlay\)\]/);
  assert.match(dialogCloseClass, /absolute/);
  assert.match(dialogCloseClass, /top-4/);
  assert.match(dialogCloseClass, /focus-visible:ring-\[3px\]/);

  const header = cn(dialogHeaderVariants({ close: false }));
  assert.doesNotMatch(header, /pr-10/);
  assert.match(cn(dialogFooterVariants({})), /sm:justify-end/);
});
