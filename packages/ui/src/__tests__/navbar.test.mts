import assert from "node:assert/strict";
import test from "node:test";
import { navbarPillSurface, navbarIndicatorClass, navbarLinkClass, navbarVariants } from "../navbar-variants.ts";

test("navbar keeps the sticky bar and adds the floating pill", () => {
  const bar = navbarVariants({ variant: "bar" });
  const floating = navbarVariants({ variant: "floating" });
  assert.match(bar, /sticky/);
  assert.match(bar, /border-b/);
  assert.match(bar, /bg-background/);
  assert.doesNotMatch(bar, /bg-background\/80|backdrop-blur/);
  assert.match(floating, /fixed/);
  assert.match(floating, /bg-transparent/);
  assert.match(navbarPillSurface, /bg-card/);
  assert.doesNotMatch(navbarPillSurface, /rgba\(|backdrop-blur|glass-/);
  assert.match(navbarLinkClass, /rounded-full/);
  assert.match(navbarLinkClass, /data-\[active=true\]:text-foreground/);
  assert.doesNotMatch(navbarLinkClass, /data-\[active=true\]:bg-/);
  assert.match(navbarIndicatorClass, /bg-primary\/15/);
  assert.match(navbarIndicatorClass, /transition-\[transform,width,height\]/);
  assert.match(navbarIndicatorClass, /duration-300/);
  assert.doesNotMatch(bar, /bg-white/);
});
