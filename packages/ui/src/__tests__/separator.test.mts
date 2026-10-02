import assert from "node:assert/strict";
import test from "node:test";
import { separatorVariants } from "../separator-variants.ts";

test("separator is one hairline and horizontal is the default", () => {
  assert.match(separatorVariants(), /h-px/);
  assert.match(separatorVariants(), /w-full/);
  assert.match(separatorVariants(), /bg-border/);
  assert.match(separatorVariants(), /shrink-0/);
  assert.doesNotMatch(separatorVariants(), /h-full/);
  assert.doesNotMatch(separatorVariants(), /w-px/);
});

test("the vertical rule is the same line turned", () => {
  assert.match(separatorVariants({ orientation: "vertical" }), /h-full/);
  assert.match(separatorVariants({ orientation: "vertical" }), /w-px/);
  assert.match(separatorVariants({ orientation: "vertical" }), /bg-border/);
  assert.doesNotMatch(separatorVariants({ orientation: "vertical" }), /h-px|w-full/);
});

test("a separator never grows a thickness, a colour or an inset", () => {
  for (const orientation of ["horizontal", "vertical"] as const) {
    const className = separatorVariants({ orientation });
    assert.doesNotMatch(className, /[\s"]h-\[|[\s"]w-\[|[\s"]border\b/);
    assert.doesNotMatch(className, /bg-(muted|accent|foreground)/);
    assert.doesNotMatch(className, /oklch\(/);
    assert.doesNotMatch(className, /dark:/);
  }
});
