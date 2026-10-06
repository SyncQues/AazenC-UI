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
  assert.match(value, /transition-\[color,background-color,border-color,box-shadow,opacity,transform\]/);
  assert.match(value, /active:scale-\[0\.98\]/);
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
  assert.match(link, /active:scale-100/);
  assert.doesNotMatch(link, /active:scale-\[0\.98\]/);
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

test("soft is a raised pill whose pressed state is held by aria-pressed, not :active", () => {
  const value = classes({ variant: "soft" });
  assert.match(value, /rounded-full/);
  assert.match(value, /bg-muted/);
  assert.match(value, /(^|\s)text-foreground(\s|$)/);
  assert.match(value, /hover:bg-accent/);
  // Transparent at rest so the pressed border claims a pixel that is already there.
  assert.match(value, /border-transparent/);
  assert.match(value, /aria-pressed:bg-blue-500\/15/);
  assert.match(value, /aria-pressed:text-blue-700/);
  assert.match(value, /aria-pressed:border-blue-500\/40/);
  assert.match(value, /dark:aria-pressed:text-blue-400/);
  assert.match(value, /dark:aria-pressed:border-blue-400\/40/);
  assert.match(value, /hover:text-accent-foreground/);
  assert.doesNotMatch(value, /aria-pressed:[^" ]*ring-/);
  // The focus ring must survive the pressed background, so the state uses border.
  assert.match(value, /focus-visible:ring-\[3px\]/);
});

test("every variant that fills with accent on hover lands on accent-foreground", () => {
  // The rule that keeps a label readable: `--accent` and `--foreground` are not a
  // pair. mono inverts `--accent` to near-black, so the two land 1.11:1 apart and
  // soft's label vanished on hover. accent-foreground is the token defined as the
  // counterpart of accent, so it clears AA in every theme and both modes.
  for (const variant of ["outline", "ghost", "soft"] as const) {
    assert.match(
      classes({ variant }),
      /hover:bg-accent(\/[\d.]+)? hover:text-accent-foreground/,
      variant,
    );
  }
});

test("no variant pairs an accent fill with bare foreground text", () => {
  for (const variant of [
    "default",
    "outline",
    "ghost",
    "destructive",
    "destructive-soft",
    "link",
    "soft",
  ] as const) {
    assert.doesNotMatch(classes({ variant }), /hover:text-foreground\b/, variant);
  }
});

test("soft stays legible beside outline, which is what it is mistaken for", () => {
  const soft = classes({ variant: "soft" });
  const outline = classes({ variant: "outline" });
  assert.doesNotMatch(soft, /bg-background/);
  assert.match(outline, /border-border/);
  assert.doesNotMatch(soft, /text-destructive|bg-destructive/);
  assert.match(classes({ variant: "soft", size: "sm" }), /\bh-8\b/);
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
