import assert from "node:assert/strict";
import test from "node:test";
import { navbarGlassSurface, navbarIndicatorClass, navbarLinkClass, navbarVariants } from "../navbar-variants.ts";

test("navbar keeps the sticky bar and adds the floating glass pill", () => {
  const bar = navbarVariants({ variant: "bar" });
  const floating = navbarVariants({ variant: "floating" });
  assert.match(bar, /sticky/);
  assert.match(bar, /border-b/);
  assert.match(bar, /bg-background\/80/);
  assert.match(floating, /fixed/);
  assert.match(floating, /bg-transparent/);
  assert.match(navbarGlassSurface, /backdrop-blur-xl/);
  assert.match(navbarGlassSurface, /rounded-full|border/);
  assert.match(navbarLinkClass, /rounded-full/);
  assert.match(navbarLinkClass, /data-\[active=true\]:text-foreground/);
  assert.doesNotMatch(navbarLinkClass, /data-\[active=true\]:bg-/);
  assert.match(navbarIndicatorClass, /bg-primary\/15/);
  assert.match(navbarIndicatorClass, /transition-\[transform,width,height\]/);
  assert.match(navbarIndicatorClass, /duration-300/);
  assert.doesNotMatch(bar, /bg-white/);
});
