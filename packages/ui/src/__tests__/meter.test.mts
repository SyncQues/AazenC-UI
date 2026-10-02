import assert from "node:assert/strict";
import test from "node:test";
import { meterFillClass, meterFillMotionClass, meterTrackClass, sliderThumbClass } from "../meter-variants.ts";

test("progress and slider share one track", () => {
  assert.match(meterTrackClass, /h-2/);
  assert.match(meterTrackClass, /rounded-full/);
  assert.match(meterTrackClass, /bg-foreground\/15/);
  assert.match(meterFillClass, /bg-primary/);
  assert.match(sliderThumbClass, /size-5/);
  assert.match(sliderThumbClass, /rounded-full/);
  assert.doesNotMatch(meterTrackClass, /h-1|h-3|bg-muted|bg-destructive/);
  assert.match(meterFillMotionClass, /rounded-full/);
  assert.match(meterFillMotionClass, /transition-\[width\]/);
  assert.match(meterFillMotionClass, /duration-500/);
  assert.match(meterFillMotionClass, /ease-out/);
  assert.match(meterFillMotionClass, /motion-reduce:transition-none/);
});
