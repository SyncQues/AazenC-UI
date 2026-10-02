import assert from "node:assert/strict";
import test from "node:test";
import { carouselDotClass, carouselFrameClass, carouselItemClass, carouselTrackClass } from "../carousel-variants.ts";

test("carousel is one horizontal frame", () => {
  assert.match(carouselFrameClass, /rounded-\[1\.125rem\]/);
  assert.match(carouselFrameClass, /overflow-hidden/);
  assert.match(carouselTrackClass, /transition-\[translate\]/);
  assert.match(carouselItemClass, /min-w-full/);
  assert.match(carouselDotClass, /data-\[active=true\]:bg-primary/);
  assert.doesNotMatch(carouselFrameClass, /rounded-full|h-64/);
});
