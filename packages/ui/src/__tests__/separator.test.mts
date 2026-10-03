import assert from "node:assert/strict";
import test from "node:test";
import { separatorVariants } from "../separator-variants.ts";

/** cva ignores keys it does not declare, so this is how a caller looks for a second axis. */
const ask = separatorVariants as unknown as (props: Record<string, unknown>) => string;

const tokens = (className: string) => new Set(className.split(" ").filter(Boolean));

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

test("the hairline is one pixel and never zero", () => {
  // A 0 or h-0 rule is a rule nobody can see, which is worse than no divider.
  for (const orientation of ["horizontal", "vertical"] as const) {
    const className = separatorVariants({ orientation });
    assert.doesNotMatch(className, /(^|\s)h-0(\s|$)/);
    assert.doesNotMatch(className, /(^|\s)w-0(\s|$)/);
    assert.doesNotMatch(className, /(^|\s)border-0(\s|$)/);
  }
});

test("orientation is the only axis, and left off it means horizontal", () => {
  // An undeclared key has to leave the hairline exactly as it was.
  assert.equal(ask({ tone: "loud" }), separatorVariants());
  assert.equal(ask({ orientation: undefined }), separatorVariants());
  assert.equal(
    separatorVariants({ orientation: "horizontal" }),
    separatorVariants({ orientation: undefined }),
  );
});

test("the two orientations stay genuinely different, not just differently spelled", () => {
  const horizontal = tokens(separatorVariants({ orientation: "horizontal" }));
  const vertical = tokens(separatorVariants({ orientation: "vertical" }));

  // Both ways round: a base that re-adds the other orientation's box.
  assert.ok(horizontal.has("h-px") && !vertical.has("h-px"));
  assert.ok(vertical.has("h-full") && !horizontal.has("h-full"));
  assert.ok(horizontal.has("w-full") && !vertical.has("w-full"));
  assert.ok(vertical.has("w-px") && !horizontal.has("w-px"));

  // Everything off the axis is shared, so the base cannot drift per orientation.
  for (const token of horizontal) {
    if (token === "h-px" || token === "w-full") continue;
    assert.ok(vertical.has(token), `${token} is horizontal-only`);
  }
  for (const token of vertical) {
    if (token === "h-full" || token === "w-px") continue;
    assert.ok(horizontal.has(token), `${token} is vertical-only`);
  }
});