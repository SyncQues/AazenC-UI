import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { buttonVariants } from "../button-variants.ts";

function classes(options: Parameters<typeof buttonVariants>[0]) {
  return cn(buttonVariants(options));
}

test("default button is a primary pill", () => {
  const value = classes({});
  assert.match(value, /bg-primary/);
  assert.match(value, /text-primary-foreground/);
  assert.match(value, /hover:bg-primary\/90/);
  assert.match(value, /h-9/);
  assert.match(value, /rounded-full/);
  assert.doesNotMatch(value, /rounded-md/);
  assert.match(value, /focus-visible:ring-\[3px\]/);
  assert.doesNotMatch(value, /brand-gradient|bg-green-600|bg-white\/50/);
});

test("outline, ghost, and link stay distinct from the primary fill", () => {
  assert.match(classes({ variant: "outline" }), /border-border/);
  assert.match(classes({ variant: "outline" }), /dark:bg-input\/30/);
  assert.match(classes({ variant: "ghost" }), /bg-transparent/);
  assert.match(classes({ variant: "ghost" }), /dark:hover:bg-accent\/50/);
  const link = classes({ variant: "link", size: "lg" });
  assert.match(link, /hover:underline/);
  assert.match(link, /h-auto/);
  assert.match(link, /rounded-none/);
  assert.doesNotMatch(link, /\bh-10\b/);
});

test("destructive fill stays white, and soft danger text lightens in dark mode", () => {
  const filled = classes({ variant: "destructive" });
  assert.match(filled, /text-white/);
  assert.match(filled, /dark:bg-destructive\/60/);
  const soft = classes({ variant: "destructive-soft" });
  assert.match(soft, /text-destructive/);
  assert.match(soft, /dark:text-\[oklch\(0\.78_0\.16_25\)\]/);
  assert.match(soft, /dark:hover:text-\[oklch\(0\.78_0\.16_25\)\]/);
  assert.doesNotMatch(soft, /text-white/);
});

test("shape, width, align, and icon sizes do not need utility classes", () => {
  assert.match(classes({ shape: "rounded" }), /rounded-md/);
  assert.doesNotMatch(classes({ shape: "rounded" }), /rounded-full/);
  assert.match(classes({ shape: "square" }), /rounded-none/);
  assert.match(classes({ width: "full" }), /w-full/);
  assert.match(classes({ align: "start" }), /justify-start/);
  assert.doesNotMatch(classes({ align: "start" }), /justify-center/);
  assert.match(classes({ size: "xs" }), /\bh-7\b/);
  assert.match(classes({ size: "xl" }), /\bh-12\b/);
  assert.match(classes({ size: "icon" }), /size-9/);
  assert.match(classes({ size: "icon-sm" }), /size-8/);
  assert.match(classes({ size: "icon-xs" }), /size-7/);
  assert.match(classes({ size: "icon-2xs" }), /size-6/);
  assert.match(classes({ size: "icon-lg" }), /size-10/);
});
