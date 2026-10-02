import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  spinnerLabelClass,
  spinnerOverlayClass,
  spinnerVariants,
} from "../spinner-variants.ts";

function classes(options: Parameters<typeof spinnerVariants>[0]) {
  return cn(spinnerVariants(options));
}

test("spinner is one arc that spins and stops for reduced motion", () => {
  const value = classes({});
  assert.match(value, /animate-spin/);
  assert.match(value, /motion-reduce:animate-none/);
  assert.doesNotMatch(value, /animate-pulse|animate-bounce/);
});

test("the mark takes the color it is dropped into", () => {
  const value = classes({ size: "xl" });
  assert.doesNotMatch(value, /text-(primary|muted-foreground|blue-600)/);
  assert.doesNotMatch(value, /bg-/);
});

test("four sizes, and no gap above the button mark", () => {
  assert.match(classes({ size: "sm" }), /size-4/);
  assert.match(classes({ size: "md" }), /size-6/);
  assert.match(classes({ size: "lg" }), /size-8/);
  assert.match(classes({ size: "xl" }), /size-12/);
  assert.doesNotMatch(classes({ size: "sm" }), /size-6/);
});

test("the overlay centers without claiming the viewport", () => {
  assert.match(spinnerOverlayClass, /flex/);
  assert.match(spinnerOverlayClass, /items-center/);
  assert.match(spinnerOverlayClass, /justify-center/);
  assert.match(spinnerOverlayClass, /gap-3/);
  assert.doesNotMatch(spinnerOverlayClass, /min-h-screen|fixed|h-screen/);
});

test("the label is quiet and reads on one line when it can", () => {
  assert.match(spinnerLabelClass, /text-sm/);
  assert.match(spinnerLabelClass, /text-muted-foreground/);
  assert.doesNotMatch(spinnerLabelClass, /font-semibold/);
});
