import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import { skeletonVariants } from "../skeleton-variants.ts";

test("skeleton is one pulse in three shapes", () => {
  const line = cn(skeletonVariants({}));
  assert.match(line, /skeleton-motion/);
  assert.match(line, /bg-foreground\/20/);
  assert.doesNotMatch(line, /bg-muted/);
  assert.match(line, /h-4/);
  assert.match(line, /rounded-md/);
  assert.match(line, /w-40/);
  assert.doesNotMatch(line, /rounded-full|h-24/);

  const circle = cn(skeletonVariants({ shape: "circle", width: "full" }));
  assert.match(circle, /rounded-full/);
  assert.match(circle, /size-10|w-10/);
  assert.doesNotMatch(circle, /w-full/);

  const block = cn(skeletonVariants({ shape: "block", width: "short" }));
  assert.match(block, /h-24/);
  assert.match(block, /rounded-lg/);
  assert.match(block, /w-full/);
  assert.doesNotMatch(block, /w-16/);
});

test("line widths stay on the line", () => {
  assert.match(cn(skeletonVariants({ width: "short" })), /w-16/);
  assert.match(cn(skeletonVariants({ width: "long" })), /w-64/);
  assert.match(cn(skeletonVariants({ width: "full" })), /w-full/);
});
