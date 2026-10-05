import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { autoHeight } from "../textarea-measure.ts";
import { textareaVariants } from "../textarea-variants.ts";

const component = readFileSync(new URL("../textarea.tsx", import.meta.url), "utf8");
const inputVariants = readFileSync(new URL("../input-variants.ts", import.meta.url), "utf8");

/** The single radius token in a class list. Throws if the shape is set twice or not at all. */
function radiusOf(value: string): string {
  const found = value.match(/rounded-[a-z0-9]+/g) ?? [];
  assert.equal(found.length, 1, `expected one radius, found ${found.join(", ") || "none"}`);
  return found[0];
}

test("the field is a rounded box by default", () => {
  const value = cn(textareaVariants({}));
  assert.match(value, /w-full/);
  assert.match(value, /rounded-lg/);
  assert.match(value, /border-input/);
  assert.match(value, /focus-visible:ring-\[3px\]/);
  assert.match(value, /aria-invalid:border-destructive/);
});

test("the shape names are the ones the Button already uses", () => {
  assert.match(cn(textareaVariants({ shape: "pill" })), /rounded-3xl/);
  assert.match(cn(textareaVariants({ shape: "rounded" })), /rounded-lg/);
  assert.doesNotMatch(cn(textareaVariants({ shape: "pill" })), /rounded-lg/);

  // Pill is the addition, rounded stays the default. Neither silently becomes the other.
  assert.match(component, /shape = "rounded"/);
  assert.match(component, /shape, resize: autoResize/);
});

test("pill is not a full radius, which would be a lozenge on a tall box", () => {
  // rounded-full measures half the height: three lines of text end up inside an oval.
  const pill = radiusOf(cn(textareaVariants({ shape: "pill" })));
  assert.notEqual(pill, "rounded-full");
  assert.notEqual(pill, "rounded-none");

  // Still unmistakably rounder than the default, or the shape is not worth having.
  const RADIUS_PX: Record<string, number> = { "rounded-lg": 8, "rounded-2xl": 16, "rounded-3xl": 24 };
  assert.ok(RADIUS_PX[pill] > RADIUS_PX[radiusOf(cn(textareaVariants({ shape: "rounded" })))]);
});

test("the shape is set in exactly one place", () => {
  // Two radius classes in one list, and tailwind-merge silently picks one.
  const value = cn(textareaVariants({ shape: "pill" }));
  assert.equal((value.match(/rounded-[a-z0-9]+/g) ?? []).length, 1);
});

test("the chrome is the input's, token for token", () => {
  const value = cn(textareaVariants({}));
  // Same field, different shape: a drift in either is a bug in both, so pin the shared states.
  for (const token of [
    "placeholder:text-muted-foreground",
    "selection:bg-primary",
    "dark:bg-input/30",
    "focus-visible:ring-ring/50",
    "aria-invalid:ring-destructive/20",
    "disabled:opacity-50",
    "motion-reduce:transition-none",
  ]) {
    assert.ok(value.includes(token), `textarea is missing ${token}`);
    assert.ok(inputVariants.includes(token), `input is missing ${token}`);
  }
});

test("only the bottom edge drags", () => {
  assert.match(cn(textareaVariants({ resize: "manual" })), /resize-y/);
  assert.doesNotMatch(cn(textareaVariants({ resize: "manual" })), /resize-x|resize-none/);

  // A growing field owns its own height, so the handle has nothing left to move. It
  // must still scroll: `autoResize` stops the box at `maxRows`, and past that the only
  // way to the text the user typed or pasted is a scrollbar. `overflow-hidden` takes
  // that away, stranding everything below the last visible row.
  const none = cn(textareaVariants({ resize: "none" }));
  assert.match(none, /resize-none/);
  assert.doesNotMatch(none, /overflow-hidden/);
  assert.match(none, /overflow-y-auto/);
});

test("autoResize is the only thing that takes the handle away", () => {
  assert.match(component, /resize: autoResize \? "none" : "manual"/);
});

test("the height is measured, not declared", () => {
  // Collapsing first, or a field can only ever grow.
  assert.match(component, /field\.style\.height = "auto";/);
  assert.ok(
    component.indexOf('field.style.height = "auto";') < component.indexOf("field.style.height = `${autoHeight("),
  );
});

test("autoResize stops at maxRows so a pasted essay cannot take the page", () => {
  const short = autoHeight({ scrollHeight: 44, lineHeight: 20, chrome: 26, minRows: 3, maxRows: 8 });
  assert.equal(short, 86, "three rows of chrome, never less");

  const exact = autoHeight({ scrollHeight: 146, lineHeight: 20, chrome: 26, minRows: 3, maxRows: 8 });
  assert.equal(exact, 146);

  const past = autoHeight({ scrollHeight: 4000, lineHeight: 20, chrome: 26, minRows: 3, maxRows: 8 });
  assert.equal(past, 186, "eight rows of chrome");
});

test("minRows wins a maxRows set below it", () => {
  const value = autoHeight({ scrollHeight: 400, lineHeight: 20, chrome: 26, minRows: 5, maxRows: 2 });
  assert.equal(value, 126, "a cap the caller set too low must not shrink the field");
});

test("a line-height the browser refused to compute still measures", () => {
  const normal = autoHeight({ scrollHeight: 60, lineHeight: NaN, chrome: 26, minRows: 3, maxRows: 8 });
  assert.equal(normal, 86, "falls back to 20px a line");
  assert.ok(Number.isFinite(normal));
});

test("the counter is the shared one, sitting in the bottom corner", () => {
  // The rules live in field-counter so a limit reads the same on a tall field as on a short one.
  assert.match(component, /data-slot="textarea-counter"/);
  assert.match(component, /cn\(textareaCounterClass, length >= limit && "text-destructive"\)/);
  assert.match(component, /\{length\} \/ \{limit\}/);
});

test("counting reserves a strip below the last line", () => {
  // The count floats, so the text has to be kept out of its corner by padding, not by
  // luck. The strip is the shared one the counter is positioned into, rather than a
  // second number that has to be kept in step with the first.
  assert.match(cn(textareaVariants({ count: true })), /pb-\[var\(--counter-strip\)\]/);
  assert.doesNotMatch(cn(textareaVariants({ count: false })), /counter-strip/);
  assert.match(component, /count: withCount/);
});
