import assert from "node:assert/strict";
import test from "node:test";
import { avatarFallbackClass, avatarVariants } from "../avatar-variants.ts";

test("avatar is one circle in three sizes", () => {
  const base = avatarVariants();
  assert.match(base, /rounded-full/);
  assert.match(base, /size-10/);
  assert.match(avatarVariants({ size: "sm" }), /size-8/);
  assert.match(avatarVariants({ size: "lg" }), /size-12/);
  assert.match(avatarFallbackClass, /bg-foreground\/10/);
  assert.doesNotMatch(base, /rounded-md|bg-blue|bg-muted/);
  assert.doesNotMatch(avatarFallbackClass, /bg-muted|bg-blue/);
});
