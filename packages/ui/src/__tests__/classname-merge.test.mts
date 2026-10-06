import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

/*
 * The `className` merge contract.
 *
 * `classname-props.type-test.tsx` proves every component *accepts* `className`.
 * This file proves the value is not thrown away on the way to the DOM, which is
 * a separate failure the type system cannot see.
 *
 * The shape that breaks: a component takes `className`, does not destructure it,
 * and spreads the rest onto an element that already sets `className`. The prop is
 * still inside `...props`, so it lands *after* the computed attribute and replaces
 * it wholesale. The caller gets a bare `<button class="my-class">` with
 * `rounded-full`, `h-9`, and every variant colour gone — and no error anywhere,
 * because from React's side the component did exactly what it was told.
 *
 * That is the exact bug shipped in `@aazenc/cli@0.2.0`, so it is worth pinning.
 * These assertions read the sources rather than rendering, because the Node test
 * runner cannot strip `.tsx` and this package has no JSX transform.
 */

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function readComponent(name: string): string {
  return readFileSync(join(srcDir, `${name}.tsx`), "utf8");
}

const button = readComponent("button");

test("Button takes className on its props", () => {
  // `Omit<ComponentProps<"button">, "className">` must be paired with a
  // re-declaration, or the attribute is a type error at the call site.
  assert.match(
    button,
    /className\?:\s*string;/,
    "ButtonProps must declare className",
  );
});

test("Button destructures className so it cannot ride along in the spread", () => {
  // This is the load-bearing line. Destructured means `...props` no longer
  // contains it, which is what makes the merge below authoritative.
  assert.match(
    button,
    /function Button\(\{[\s\S]*?\bclassName,[\s\S]*?\}\s*:\s*ButtonProps\)/,
    "Button must destructure className out of its props",
  );
});

test("Button keeps the variant classes under their own name", () => {
  // Naming the base `className` is what shipped the bug: the two collided, the
  // caller's value was shadowed away, and `cn` merged nothing.
  assert.match(button, /const baseClassName = cn\(buttonVariants\(/);
  assert.doesNotMatch(
    button,
    /const className = cn\(buttonVariants\(/,
    "the base class must not be bound to `className`",
  );
});

test("Button merges into both the button and the asChild branch", () => {
  const merges = button.match(/className=\{cn\(baseClassName, className\)\}/g);
  assert.equal(
    merges?.length,
    2,
    "both the native button and the asChild Slot must merge className",
  );
});

test("no component sets a raw className on an element it then spreads props onto", () => {
  // The bug shape, swept across the library. A raw `className={className}` is
  // only dangerous when `{...props}` follows on the same element, because that is
  // the only way a caller-supplied class can overwrite the computed one.
  const files = readdirSync(srcDir).filter(
    (name) => name.endsWith(".tsx") && name !== "__tests__",
  );
  const offenders: string[] = [];

  for (const name of files) {
    const source = readFileSync(join(srcDir, name), "utf8");
    // Element open tags only: `<button ... >`, never `className={x} />` paired
    // with a spread that lives in a sibling element further down the file.
    for (const tag of source.match(/<[a-zA-Z][^<>]*?>/g) ?? []) {
      const raw = tag.indexOf("className={className}");
      if (raw === -1) continue;
      const spread = tag.indexOf("{...props}");
      if (spread === -1) continue;
      if (spread < raw) {
        offenders.push(`${name}: {...props} precedes className={className}`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    "a raw className after a {...props} spread can be overwritten by the caller",
  );
});
