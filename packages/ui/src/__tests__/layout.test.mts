import assert from "node:assert/strict";
import test from "node:test";
import {
  asVariantKey,
  boxClass,
  centerVariants,
  containerVariants,
  flexVariants,
  gridVariants,
  spacerVariants,
  splitVariants,
  stackVariants,
} from "../layout-variants.ts";

/** cva ignores keys it does not declare, so this is how a caller looks for a second axis. */
const ask = (variants: unknown) =>
  variants as unknown as (props: Record<string, unknown>) => string;

const tokens = (className: string) =>
  new Set(className.split(" ").filter(Boolean));

const GAPS = [
  "0",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
] as const;

test("a number and a string on the same scale step reach the same class", () => {
  // `gap={4}` is how most people write it, `gap="4"` is how the scale is keyed.
  for (const [number, string] of [
    [4, "4"],
    [0.5, "0.5"],
    [0, "0"],
    [12, "12"],
  ] as const) {
    assert.equal(asVariantKey(number), string);
    assert.equal(asVariantKey(string), string);
    assert.equal(
      stackVariants({ gap: asVariantKey(number) }),
      stackVariants({ gap: string }),
    );
  }
});

test("an omitted scale value stays omitted, so the default is not overwritten", () => {
  // "" would make cva drop the default gap, which is worse than not asking.
  assert.equal(asVariantKey(undefined), undefined);
  assert.equal(asVariantKey(null), undefined);
  assert.equal(asVariantKey(0), "0");
  assert.equal(
    stackVariants({ gap: asVariantKey(undefined) }),
    stackVariants(),
  );
});

test("every box carries min-w-0, or a wide child scrolls the page sideways", () => {
  for (const className of [
    boxClass,
    stackVariants(),
    gridVariants(),
    flexVariants(),
    centerVariants(),
    splitVariants(),
    containerVariants(),
    spacerVariants(),
  ]) {
    assert.match(className, /(^|\s)min-w-0(\s|$)/);
  }
});

test("stack is a column and flex is a row, both by default", () => {
  assert.match(stackVariants(), /flex-col/);
  assert.match(flexVariants(), /flex-row/);
  assert.doesNotMatch(stackVariants(), /flex-row/);
  assert.doesNotMatch(flexVariants(), /flex-col/);
});

test("stack and grid carry a default gap, flex does not", () => {
  // Rhythm containers guess; the raw primitive leaves the spacing to the caller.
  assert.match(stackVariants(), /(^|\s)gap-4(\s|$)/);
  assert.match(gridVariants(), /(^|\s)gap-4(\s|$)/);
  assert.doesNotMatch(flexVariants(), /(^|\s)gap-/);
});

test("one gap scale everywhere, so a column and a grid share a rhythm", () => {
  for (const gap of GAPS) {
    const expected = `gap-${gap}`;
    assert.ok(
      tokens(stackVariants({ gap })).has(expected),
      `stack misses ${expected}`,
    );
    assert.ok(
      tokens(gridVariants({ gap })).has(expected),
      `grid misses ${expected}`,
    );
    assert.ok(
      tokens(flexVariants({ gap })).has(expected),
      `flex misses ${expected}`,
    );
    assert.ok(
      tokens(splitVariants({ gap })).has(expected),
      `split misses ${expected}`,
    );
  }
});

test("a gap is exactly one gap class, never a second one left behind", () => {
  for (const variants of [
    stackVariants,
    gridVariants,
    flexVariants,
    splitVariants,
  ]) {
    for (const gap of GAPS) {
      const className = variants({ gap });
      assert.equal(
        className.match(/(?:^|\s)gap-[0-9.]+(?=\s|$)/g)?.length,
        1,
        className,
      );
    }
  }
});

test("wrap turns a stack into a cluster, so no separate component is needed", () => {
  const wrapped = stackVariants({ wrap: true });
  assert.match(wrapped, /flex-wrap/);
  assert.match(
    wrapped,
    /flex-col/,
    "wrapping a column keeps the column direction",
  );
  assert.doesNotMatch(stackVariants({ wrap: false }), /flex-wrap/);
  assert.equal(stackVariants({ wrap: undefined }), stackVariants());
});

test("grid goes up to six columns and no further", () => {
  for (const columns of ["1", "2", "3", "4", "5", "6"] as const) {
    assert.ok(tokens(gridVariants({ columns })).has(`grid-cols-${columns}`));
  }
  // A seventh track means a wrapping row, which is what `wrap` is for. Asking for
  // one gets the implicit single column instead, which is still a readable grid.
  const wide = ask(gridVariants)({ columns: "7" });
  assert.doesNotMatch(wide, /grid-cols-/);
  assert.match(wide, /(^|\s)grid(\s|$)/);
});

test("the default grid is one column", () => {
  assert.ok(tokens(gridVariants()).has("grid-cols-1"));
  assert.equal(gridVariants({ columns: undefined }), gridVariants());
});

test("split pushes its ends apart and is the only primitive that does", () => {
  assert.match(splitVariants(), /justify-between/);
  assert.match(splitVariants(), /flex-wrap/);
  for (const other of [
    stackVariants(),
    gridVariants(),
    flexVariants(),
    centerVariants(),
  ]) {
    assert.doesNotMatch(other, /justify-between/);
  }
});

test("center centres on both axes, and full only adds the viewport height", () => {
  assert.match(centerVariants(), /items-center/);
  assert.match(centerVariants(), /justify-center/);
  assert.match(centerVariants({ full: true }), /min-h-svh/);
  assert.doesNotMatch(centerVariants({ full: false }), /min-h-svh/);
  assert.doesNotMatch(centerVariants(), /min-h-svh/);
});

test("a spacer grows unless it is told not to", () => {
  assert.match(spacerVariants(), /flex-1/);
  assert.match(spacerVariants({ grow: false }), /flex-none/);
  assert.doesNotMatch(spacerVariants({ grow: false }), /flex-1/);
});

test("container is centred and gutter-padded, which is the page shell", () => {
  for (const size of ["xs", "md", "2xl", "7xl", "prose", "full"] as const) {
    const className = containerVariants({ size });
    assert.match(className, /mx-auto/, size);
    assert.match(className, /w-full/, size);
    assert.match(className, /(^|\s)px-4(\s|$)/, size);
    assert.match(className, /sm:px-6/, size);
  }
  assert.match(containerVariants({ size: "full" }), /max-w-none/);
  assert.match(containerVariants({ size: "prose" }), /max-w-prose/);
});

test("container sizes are Tailwind's own max-w steps, one for one", () => {
  // The point of the scale is that `size="7xl"` and `max-w-7xl` are the same number.
  const named = [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "6xl",
    "7xl",
  ];
  for (const size of named) {
    assert.ok(
      tokens(containerVariants({ size: size as "xs" })).has(`max-w-${size}`),
      size,
    );
  }
});

test("full is no column limit, not a wider column", () => {
  assert.match(containerVariants({ size: "full" }), /max-w-none/);
  assert.notEqual(containerVariants({ size: "full" }), containerVariants());
  assert.doesNotMatch(containerVariants({ size: "full" }), /max-w-(?!none)/);
});

test("align and justify name every value the axis actually has", () => {
  const aligns = ["start", "center", "end", "baseline", "stretch"] as const;
  for (const align of aligns) {
    assert.ok(
      tokens(stackVariants({ align })).has(`items-${align}`),
      `stack ${align}`,
    );
    assert.ok(
      tokens(flexVariants({ align })).has(`items-${align}`),
      `flex ${align}`,
    );
    assert.ok(
      tokens(splitVariants({ align })).has(`items-${align}`),
      `split ${align}`,
    );
  }
  const justifies = [
    "start",
    "center",
    "end",
    "between",
    "around",
    "evenly",
  ] as const;
  for (const justify of justifies) {
    assert.ok(
      tokens(flexVariants({ justify })).has(`justify-${justify}`),
      justify,
    );
  }
  // justify-between belongs to split, so flex is the only primitive offering the rest.
  assert.doesNotMatch(stackVariants(), /justify-/);
  assert.doesNotMatch(gridVariants(), /justify-/);
});

test("align is silent until asked, because stretch is already the default", () => {
  assert.doesNotMatch(stackVariants(), /items-/);
  assert.doesNotMatch(flexVariants(), /items-/);
});

test("an undeclared key leaves a primitive exactly as it was", () => {
  assert.equal(ask(stackVariants)({ tone: "loud" }), stackVariants());
  assert.equal(ask(gridVariants)({ tone: "loud" }), gridVariants());
  assert.equal(ask(flexVariants)({ tone: "loud" }), flexVariants());
  assert.equal(ask(containerVariants)({ tone: "loud" }), containerVariants());
});

test("no primitive emits a colour, a shadow or a hard-coded pixel", () => {
  // Layout sets boxes. Anything painted here is a surface, and there are surfaces for that.
  for (const className of [
    boxClass,
    stackVariants(),
    gridVariants(),
    flexVariants(),
    centerVariants(),
    splitVariants(),
    containerVariants(),
    spacerVariants(),
  ]) {
    assert.doesNotMatch(className, /(bg-|text-|border|shadow|ring)/);
    assert.doesNotMatch(className, /oklch\(/);
    assert.doesNotMatch(className, /dark:/);
    assert.doesNotMatch(className, /\[[0-9]+px\]/);
  }
});

test("no primitive picks a breakpoint, because the caller's className owns that", () => {
  // Responsive has to stay overridable: `md:grid-cols-3` must beat `columns`.
  for (const className of [
    stackVariants(),
    gridVariants(),
    flexVariants(),
    centerVariants(),
    splitVariants(),
  ]) {
    assert.doesNotMatch(className, /(?:^|\s)(sm|md|lg|xl|2xl):/);
  }
});

test("the container gutter is the one responsive thing here, and it is on purpose", () => {
  // Every page shell needs the gutter to widen on a desktop, and it must not be
  // something a caller has to remember twice per page.
  assert.match(containerVariants(), /(^|\s)px-4(\s|$)/);
  assert.match(containerVariants(), /sm:px-6/);
  assert.doesNotMatch(containerVariants(), /(?:^|\s)(md|lg|xl|2xl):/);
});
