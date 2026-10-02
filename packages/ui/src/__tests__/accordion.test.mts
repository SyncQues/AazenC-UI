import assert from "node:assert/strict";
import test from "node:test";
import {
  accordionContentClass,
  accordionItemClass,
  accordionTriggerClass,
} from "../accordion-variants.ts";

test("accordion is one bordered list", () => {
  assert.match(accordionItemClass, /border-b/);
  assert.match(accordionItemClass, /last:border-b-0/);
  assert.match(accordionTriggerClass, /py-4/);
  assert.match(accordionTriggerClass, /hover:bg-accent\/40/);
  assert.match(accordionTriggerClass, /\[&\[data-state=open\]>svg\]:rotate-180/);
  assert.match(accordionContentClass, /animate-accordion-down/);
  assert.match(accordionContentClass, /animate-accordion-up/);
  assert.doesNotMatch(accordionTriggerClass, /hover:underline|rounded-2xl|bg-card/);
});
