import assert from "node:assert/strict";
import test from "node:test";
import {
  addVisibleMultiSelectValues,
  filterMultiSelectOptions,
  multiSelectContentClass,
  multiSelectFieldClass,
  toggleMultiSelectValue,
} from "../multi-select-variants.ts";

const options = [
  { value: "engineer", label: "Engineer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Manager", disabled: true },
];

test("multi-select field is the same pill", () => {
  assert.match(multiSelectFieldClass, /min-h-9/);
  assert.match(multiSelectFieldClass, /rounded-full/);
  assert.match(multiSelectFieldClass, /border-input/);
  assert.match(multiSelectFieldClass, /aria-invalid:border-destructive/);
  assert.match(multiSelectContentClass, /menu-motion/);
  assert.match(multiSelectContentClass, /rounded-md/);
  assert.doesNotMatch(multiSelectFieldClass, /rounded-xl|backdrop-blur|shadow-2xl/);
});

test("search keeps contains matches", () => {
  const visible = filterMultiSelectOptions(options, "eng");
  assert.deepEqual(
    visible.map((option) => option.value),
    ["engineer"],
  );
  assert.deepEqual(
    filterMultiSelectOptions(options, "  ").map((option) => option.value),
    ["engineer", "designer", "manager"],
  );
});

test("toggle and select all skip disabled options", () => {
  assert.deepEqual(toggleMultiSelectValue(["designer"], "engineer"), ["designer", "engineer"]);
  assert.deepEqual(toggleMultiSelectValue(["engineer"], "engineer"), []);
  assert.deepEqual(addVisibleMultiSelectValues(["writer"], options), ["writer", "engineer", "designer"]);
});
