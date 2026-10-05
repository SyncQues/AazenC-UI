import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * The component layer, not the variant layer: what the eight primitives actually
 * put on the element. Nothing here runs the JSX — the suite runs on Node's type
 * stripper, which cannot load a `.tsx` — so this reads the source, the same way
 * the other component families are covered. `layout.test.mts` cannot see any of
 * it, which is how a broken `as` or a dropped props spread ships green.
 */

const component = readFileSync(new URL("../layout.tsx", import.meta.url), "utf8");

const PRIMITIVES = [
  "Box",
  "Stack",
  "Grid",
  "Flex",
  "Center",
  "Split",
  "Container",
  "Spacer",
] as const;

/** One primitive's body, so an assertion about one is not satisfied by another. */
function body(name: string): string {
  const start = component.indexOf(`export function ${name}<`);
  assert.notEqual(start, -1, `${name} is not exported from layout.tsx`);
  const rest = component.slice(start + 1);
  const next = rest.search(/\nexport (?:function|type|const|\{)/);
  return next === -1 ? component.slice(start) : component.slice(start, start + next);
}

test("all eight primitives are exported and none is left unrendered", () => {
  for (const name of PRIMITIVES) {
    assert.match(component, new RegExp(`export function ${name}<`), name);
    assert.match(body(name), new RegExp(`data-slot="${name.toLowerCase()}"`), name);
  }
  const declared = [...component.matchAll(/export function (\w+)</g)].map(
    (match) => match[1],
  );
  assert.deepEqual(declared.sort(), [...PRIMITIVES].sort());
});

test("every primitive resolves its tag from as and asChild, never a hard-coded one", () => {
  for (const name of PRIMITIVES) {
    const source = body(name);
    // Without this a default parameter pins the tag and `as` is silently inert.
    assert.match(source, /as: Tag[,}]/, `${name} destructures as`);
    assert.match(source, /asChild = false/, `${name} destructures asChild`);
    assert.match(source, /resolveTag\(Tag, asChild\)/, `${name} resolves the tag`);
  }
  // Slot is what makes asChild adopt the child's own tag.
  assert.match(component, /asChild \? Slot :/);
  assert.match(component, /import \{ Slot \} from "@radix-ui\/react-slot"/);
});

test("every primitive spreads the remaining props onto the element", () => {
  // This spread is the only path a ref, an id, aria-* or a data-* attribute can
  // travel, so losing it costs every one of them at once.
  for (const name of PRIMITIVES) {
    assert.match(body(name), /\.\.\.\(props as object\)/, name);
  }
});

test("every primitive routes className through cn, so a caller can override it", () => {
  for (const name of PRIMITIVES) {
    const source = body(name);
    assert.match(source, /className,/, `${name} pulls className out of props`);
    assert.match(source, /cn\(/, `${name} merges through cn`);
  }
  // twMerge is what makes the override win rather than just append.
  assert.match(
    readFileSync(new URL("../../../utils/src/cn.ts", import.meta.url), "utf8"),
    /twMerge/,
  );
});

test("the axes a caller set are readable off the element", () => {
  assert.match(body("Stack"), /data-direction=\{direction\}/);
  assert.match(body("Flex"), /data-direction=\{direction\}/);
  assert.match(body("Split"), /data-direction=\{direction\}/);
  assert.match(body("Container"), /data-size=\{size\}/);
});

test("props are typed from the tag as renders, not pinned to div", () => {
  // The regression this guards: `Omit<ComponentProps<"div">>` made a Stack a
  // link impossible to compile, while the docs promised exactly that.
  assert.doesNotMatch(
    component,
    /ComponentProps<"div">/,
    "layout props are still pinned to div",
  );
  assert.match(component, /type LayoutElementProps<E extends ElementType/);
  assert.match(component, /Omit<ComponentPropsWithRef<E>,/);
  // WithRef is what lets a ref follow the tag: ref on as="a" is an anchor ref.
  for (const name of PRIMITIVES) {
    assert.match(
      component,
      new RegExp(`export function ${name}<E extends ElementType`),
      `${name} is generic over the tag`,
    );
  }
});

test("the variant surface is still re-exported, so index.ts keeps resolving", () => {
  for (const name of [
    "asVariantKey",
    "boxClass",
    "centerVariants",
    "containerVariants",
    "flexVariants",
    "gridVariants",
    "spacerVariants",
    "splitVariants",
    "stackVariants",
  ]) {
    assert.match(component, new RegExp(`\\b${name}\\b`), name);
  }
});