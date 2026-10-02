import assert from "node:assert/strict";
import test from "node:test";
import { checkboxClass, checkboxIndicatorClass } from "../checkbox-variants.ts";

test("checkbox is one box", () => {
  assert.match(checkboxClass, /size-4/);
  assert.match(checkboxClass, /rounded-\[4px\]/);
  assert.match(checkboxClass, /data-\[state=checked\]:bg-primary/);
  assert.match(checkboxClass, /data-\[state=indeterminate\]:bg-primary/);
  assert.match(checkboxClass, /aria-invalid:border-destructive/);
  assert.match(checkboxClass, /focus-visible:ring-\[3px\]/);
  assert.match(checkboxIndicatorClass, /animate-checkbox-check/);
  assert.doesNotMatch(checkboxClass, /size-5|rounded-full|bg-green/);
});
