import assert from "node:assert/strict";
import test from "node:test";
import { carouselDotClass, carouselFrameClass, carouselItemClass, carouselTrackClass } from "../carousel-variants.ts";

test("carousel is one horizontal frame", () => {
  assert.match(carouselFrameClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(carouselFrameClass, /overflow-hidden/);
  assert.match(carouselTrackClass, /overflow-x-auto/);
  assert.match(carouselTrackClass, /snap-x/);
  assert.match(carouselItemClass, /min-w-full/);
  assert.match(carouselItemClass, /snap-start/);
  assert.match(carouselDotClass, /size-6/);
  assert.match(carouselDotClass, /data-\[active=true\]:bg-primary\/20/);
  assert.doesNotMatch(carouselFrameClass, /rounded-full|h-64/);
});
