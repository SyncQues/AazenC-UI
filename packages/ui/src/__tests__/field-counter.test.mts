import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  COUNTER_GAP_PX,
  counterClearance,
  counterLimit,
  counterRootClass,
  inputCounterClass,
  lengthOf,
  showsCount,
  textareaCounterClass,
  textareaCounterStripClass,
} from "../field-counter.ts";

const input = readFileSync(new URL("../input.tsx", import.meta.url), "utf8");
const textarea = readFileSync(new URL("../textarea.tsx", import.meta.url), "utf8");
const counterSource = readFileSync(new URL("../field-counter.ts", import.meta.url), "utf8");

/** The two measurements `counterClearance` reads, and nothing else. */
function box(right: number): HTMLElement {
  return { getBoundingClientRect: () => ({ right }) } as unknown as HTMLElement;
}

function counter(right: number, offsetWidth: number): HTMLElement {
  return { offsetWidth, getBoundingClientRect: () => ({ right }) } as unknown as HTMLElement;
}

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
    assert.match(value, /right-\[var\(--counter-inset\)\]/);
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

test("the inset and the strip are written down once, on the wrapper both fields inherit", () => {
  // Two custom properties on the shared wrapper, which the counters position against
  // and the textarea reserves against — so neither can be moved without the other.
  assert.match(counterRootClass, /\[--counter-inset:1rem\]/);
  assert.match(counterRootClass, /\[--counter-strip:2rem\]/);
  assert.match(inputCounterClass, /var\(--counter-inset\)/);
  assert.match(textareaCounterClass, /var\(--counter-inset\)/);
  assert.match(textareaCounterStripClass, /var\(--counter-strip\)/);
  assert.match(input, /counterRootClass/);
  assert.match(textarea, /counterRootClass/);
  // The mirrored constant is exactly what let a `right-3` change land on one side and
  // miss the other, so it must not come back in any of the three files.
  assert.doesNotMatch(counterSource, /COUNTER_INSET_PX/);
  assert.doesNotMatch(input, /COUNTER_INSET_PX/);
  assert.doesNotMatch(textarea, /COUNTER_INSET_PX/);
});

test("the clearance is measured off the two boxes, not recomputed from the inset", () => {
  // A 40px counter sitting 16px in from a field's right edge.
  assert.equal(counterClearance(box(200), counter(184, 40)), 40 + 16 + COUNTER_GAP_PX);
  // The same counter positioned 4px in instead: the reserve follows it, which a
  // constant copied out of a class could not.
  assert.equal(counterClearance(box(200), counter(196, 40)), 40 + 4 + COUNTER_GAP_PX);
  // Nothing drawn, nothing reserved.
  assert.equal(counterClearance(box(200), null), 0);
  // A counter pushed past the field's own edge still leaves a sane reserve.
  assert.equal(counterClearance(box(200), counter(210, 40)), 40 + COUNTER_GAP_PX);
});

test("the reserve grows when the used count gains a digit, which is why it is re-measured", () => {
  // `9 / 24` against `10 / 24`. `tabular-nums` holds a digit's width steady, so the
  // wider count is exactly one digit more — and a reserve taken once per limit slides
  // under the text the moment the used number crosses into a second digit.
  const at = (offsetWidth: number) => counterClearance(box(200), counter(184, offsetWidth));
  assert.equal(at(47) - at(40), 7, "one more digit of count, one more digit of padding");
  assert.ok(at(47) > at(40));
});
