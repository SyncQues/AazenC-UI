import assert from "node:assert/strict";
import test from "node:test";
import {
  commandClass,
  commandEmptyClass,
  commandFilter,
  commandInputClass,
  commandItemClass,
  commandListClass,
} from "../command-variants.ts";

test("command is one list", () => {
  assert.match(commandClass, /bg-popover/);
  assert.match(commandClass, /rounded-lg/);
  assert.doesNotMatch(commandClass, /backdrop-blur|bg-background|shadow-2xl/);
  assert.match(commandInputClass, /h-10/);
  assert.match(commandInputClass, /bg-transparent/);
  assert.match(commandListClass, /max-h-72/);
  assert.match(commandItemClass, /data-\[selected=true\]:bg-accent/);
  assert.match(commandEmptyClass, /text-center/);
});

test("command search keeps contains matches only", () => {
  assert.equal(commandFilter("Engineer", "eng"), 1);
  assert.equal(commandFilter("Designer", "eng"), 0);
  assert.equal(commandFilter("Settings", "eng"), 0);
  assert.equal(commandFilter("Recruiter", "eng", ["engineering"]), 1);
  assert.equal(commandFilter("Engineer", "  "), 1);
});
