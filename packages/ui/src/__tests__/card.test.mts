import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  cardContentVariants,
  cardFooterVariants,
  cardHeaderVariants,
  cardPaddingClass,
  cardTitleVariants,
  cardVariants,
} from "../card-variants.ts";

function card(options: Parameters<typeof cardVariants>[0]) {
  return cn(cardVariants(options));
}

test("default card is a bordered panel with the standard radius", () => {
  const value = card({});
  assert.match(value, /bg-card/);
  assert.match(value, /border-border/);
  assert.match(value, /shadow-sm/);
  assert.match(value, /rounded-lg/);
  assert.match(value, /text-card-foreground/);
  assert.match(value, /overflow-hidden/);
  assert.match(value, /animate-fade-in/);
  assert.match(value, /hover:-translate-y-1/);
  assert.match(value, /hover:shadow-md/);
  assert.match(value, /transition-\[translate,scale,box-shadow\]/);
  assert.doesNotMatch(value, /rounded-3xl|premium-glass-card|bg-transparent|shadow-lg/);
  assert.doesNotMatch(value, /(^|\s)shadow-md(\s|$)/);
});

test("glass and plain are the other two surfaces", () => {
  const glass = card({ variant: "glass" });
  assert.match(glass, /premium-glass-card/);
  assert.match(glass, /rounded-lg/);
  assert.match(glass, /hover:-translate-y-1/);
  assert.doesNotMatch(glass, /bg-card|shadow-lg|border-0|bg-transparent/);

  const plain = card({ variant: "plain" });
  assert.match(plain, /bg-transparent/);
  assert.match(plain, /border-0/);
  assert.match(plain, /shadow-none/);
  assert.doesNotMatch(plain, /bg-card|shadow-sm|premium-glass-card/);
});

test("round, align, and interactive do not need utility classes", () => {
  assert.match(card({ radius: "round" }), /rounded-3xl/);
  assert.doesNotMatch(card({ radius: "round" }), /rounded-lg/);

  assert.match(card({ align: "center" }), /text-center/);

  const clickable = card({ interactive: true });
  assert.match(clickable, /cursor-pointer/);
  assert.match(clickable, /hover:shadow-md/);
  assert.doesNotMatch(clickable, /hover:bg-accent/);

  const open = card({ variant: "plain", interactive: true });
  assert.match(open, /cursor-pointer/);
  assert.match(open, /hover:bg-accent\/40/);
  assert.doesNotMatch(open, /shadow-md|bg-card/);
});

test("parts share one padding and titles have two sizes", () => {
  assert.match(cardPaddingClass.lg.header, /p-6/);
  assert.match(cardPaddingClass.sm.header, /p-4/);
  assert.match(cardPaddingClass.none.content, /p-0/);
  assert.match(cardPaddingClass.lg.content, /pt-6/);
  assert.match(cardPaddingClass.lg.content, /\[\[data-slot=card-header\]\+&\]:pt-0/);
  assert.doesNotMatch(cardPaddingClass.lg.content, /(^|\s)pt-0(\s|$)/);

  const row = cn(cardHeaderVariants({ layout: "row" }), cardPaddingClass.sm.header);
  assert.match(row, /justify-between/);
  assert.match(row, /p-4/);
  assert.doesNotMatch(row, /flex-col/);

  assert.match(cardTitleVariants({}), /text-lg/);
  assert.doesNotMatch(cardTitleVariants({}), /text-2xl|text-sm/);
  assert.match(cardTitleVariants({ size: "sm" }), /text-sm/);
  assert.doesNotMatch(cardTitleVariants({ size: "sm" }), /text-lg/);

  assert.match(cardContentVariants({ gap: "md" }), /space-y-4/);
  assert.equal(cardContentVariants({ gap: "none" }), "");
  assert.match(cardFooterVariants({ align: "center" }), /justify-center/);
  assert.match(cardFooterVariants({ align: "between" }), /justify-between/);
  assert.doesNotMatch(cardFooterVariants({ align: "center" }), /justify-start/);
});
