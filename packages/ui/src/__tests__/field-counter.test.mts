import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { counterLimit, inputCounterClass, lengthOf, showsCount, textareaCounterClass } from "../field-counter.ts";

const input = readFileSync(new URL("../input.tsx", import.meta.url), "utf8");
const textarea = readFileSync(new URL("../textarea.tsx", import.meta.url), "utf8");

test("a value wider than a string is still counted", () => {
  assert.equal(lengthOf("Ada"), 3);
  assert.equal(lengthOf(""), 0);
  assert.equal(lengthOf(undefined), 0);
  // React types a field value as string | number | readonly string[].
  assert.equal(lengthOf(42), 2);
  assert.equal(lengthOf(["a", "bc"]), 3);
  assert.equal(lengthOf([]), 0);
});

test("a limit of zero or less is no limit", () => {
  assert.equal(counterLimit(180), 180);
  assert.equal(counterLimit(0), null);
  assert.equal(counterLimit(-5), null);
  assert.equal(counterLimit(undefined), null);
});

test("a count needs both the ask and a limit to count against", () => {
  assert.equal(showsCount({ showCount: true, maxLength: 40 }), true);
  assert.equal(showsCount({ showCount: false, maxLength: 40 }), false);
  assert.equal(showsCount({ showCount: true, maxLength: undefined }), false);
  assert.equal(showsCount({ showCount: true, maxLength: 0 }), false);
});

test("a password is not counted in the open", () => {
  // A visible count hands over the length of the secret, which is most of the guesswork.
  assert.equal(showsCount({ showCount: true, maxLength: 40, type: "password" }), false);
  assert.equal(showsCount({ showCount: true, maxLength: 40, type: "file" }), false);

  // Every other type is ordinary text the person typed.
  for (const type of ["text", "email", "search", "url", "number", "tel"]) {
    assert.equal(showsCount({ showCount: true, maxLength: 40, type }), true, `${type} should count`);
  }
});

test("the count floats inside the field and stays out of the way", () => {
  // Absolute, or it would push the field around; pointer-events-none, or it would eat clicks.
  for (const value of [inputCounterClass, textareaCounterClass]) {
    assert.match(value, /absolute/);
    assert.match(value, /pointer-events-none/);
    assert.match(value, /text-muted-foreground/);
    assert.match(value, /tabular-nums/);
    assert.match(value, /right-4/);
  }
  // One line centres the count; a tall field puts it in the corner.
  assert.match(inputCounterClass, /top-1\/2 -translate-y-1\/2/);
  assert.match(textareaCounterClass, /bottom-3/);
});

test("the count turns destructive at the limit", () => {
  assert.match(cn(inputCounterClass, "text-destructive"), /text-destructive/);
  assert.match(cn(textareaCounterClass, "text-destructive"), /text-destructive/);
});

test("both fields ask the same module, so a limit reads the same on each", () => {
  for (const source of [input, textarea]) {
    assert.match(source, /from "\.\/field-counter"/);
    assert.match(source, /counterLimit\(maxLength\)/);
    assert.match(source, /showsCount\(\{/);
  }
  // Each takes the positioning that suits its shape, and neither invented its own chrome.
  assert.match(input, /inputCounterClass/);
  assert.match(textarea, /textareaCounterClass/);
  // A textarea has no type, so it must not be asked about one.
  assert.match(textarea, /showsCount\(\{ showCount, maxLength \}\)/);
});

test("the count is described by the field, beside whatever else is", () => {
  // A consumer wiring an error must not lose the count by claiming aria-describedby.
  for (const source of [input, textarea]) {
    assert.match(source, /\[ariaDescribedBy, withCount \? counterId : null\]\.filter\(Boolean\)\.join\(" "\)/);
    assert.match(source, /aria-describedby=\{describedBy\}/);
  }
});

test("the counter is not a live region", () => {
  // It would fire on every keystroke and talk over the field the user is typing in.
  for (const source of [input, textarea]) {
    assert.doesNotMatch(source, /aria-live/);
  }
});

test("the field keeps its own onChange", () => {
  // A spread after onChange would drop the handler and freeze the count.
  for (const source of [input, textarea]) {
    assert.match(source, /onChange=\{handleChange\}/);
    assert.ok(source.indexOf("onChange={handleChange}") < source.indexOf("{...props}"));
  }
});
