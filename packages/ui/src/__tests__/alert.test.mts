import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import {
  alertActionClass,
  alertDescriptionClass,
  alertIconClass,
  alertTitleClass,
  alertVariants,
} from "../alert-variants.ts";
import { ALERT_HEADING_TAGS, ALERT_PART, resolveAlertRole, splitAlertChildren } from "../alert-utils.ts";

test("alert is one inline message and the tone paints it", () => {
  assert.match(alertVariants(), /flex/);
  assert.match(alertVariants(), /items-start/);
  assert.match(alertVariants(), /flex-wrap/);
  assert.match(alertVariants(), /p-4/);
  assert.match(alertVariants(), /border-border/);
  assert.match(alertVariants({ tone: "success" }), /bg-success\/10/);
  assert.match(alertVariants({ tone: "warning" }), /bg-warning\/10/);
  assert.match(alertVariants({ tone: "destructive" }), /border-destructive\/40/);
});

test("alert takes the same three shapes as button, panel radius first", () => {
  assert.match(alertVariants(), /rounded-\[var\(--radius-panel\)\]/);
  assert.match(alertVariants({ shape: "rounded" }), /rounded-\[var\(--radius-panel\)\]/);
  assert.match(alertVariants({ shape: "pill" }), /rounded-full/);
  assert.match(alertVariants({ shape: "square" }), /rounded-none/);
  assert.doesNotMatch(alertVariants(), /rounded-full|rounded-none/);
});

test("alert washes the tone in, never fills the box", () => {
  assert.doesNotMatch(alertVariants({ tone: "success" }), /bg-success\/(?!10\b)/);
  assert.doesNotMatch(alertVariants({ tone: "warning" }), /bg-warning\/(?!10\b)/);
  assert.doesNotMatch(alertVariants({ tone: "destructive" }), /bg-destructive\/(?!10\b)/);
});

test("the box text stays foreground, so it keeps one contrast in every tone", () => {
  // Not `text-`: the root legitimately carries `text-sm`, and the wash behind
  // it already changes.
  for (const tone of ["default", "success", "warning", "destructive"] as const) {
    assert.doesNotMatch(
      alertVariants({ tone }),
      /text-(destructive|success|warning)(-foreground)?\b/,
      `${tone} alert tinted the text`,
    );
  }
});

test("alert parts are one column with actions at the end", () => {
  assert.match(alertTitleClass, /font-medium/);
  assert.match(alertDescriptionClass, /text-muted-foreground/);
  assert.match(alertActionClass, /ml-auto/);
  assert.match(alertActionClass, /justify-end/);
});

test("only the first action pushes the row, so two of them do not drift apart", () => {
  // `ml-auto` eats the free space; two of them in a row would split it between
  // them. The sibling rule zeroes the margin on every action after the first.
  assert.match(alertActionClass, /\[&\+&\]:ml-0/);
});

test("the icon carries the tone through the readable token", () => {
  assert.match(alertIconClass, /size-5/);
  assert.match(alertIconClass, /data-\[tone=success\]:text-success-foreground/);
  assert.match(alertIconClass, /data-\[tone=warning\]:text-warning-foreground/);
  assert.match(alertIconClass, /data-\[tone=destructive\]:text-destructive\b/);
  assert.doesNotMatch(alertIconClass, /dark:/);
  assert.doesNotMatch(alertIconClass, /oklch\(/);
});

test("the destructive mark is the hue, not the text on a solid destructive", () => {
  // Regression: `-foreground` is white in light mode (1.25:1 on `bg-destructive/10`).
  // The base hue measures 3.83:1 there.
  assert.doesNotMatch(alertIconClass, /data-\[tone=destructive\]:text-destructive-foreground/);
  assert.match(alertIconClass, /data-\[tone=destructive\]:text-destructive(?![-\w])/);
});

test("a consumer-supplied icon cannot overflow the mark", () => {
  // Same guard Button uses: a Lucide icon defaults to 24x24.
  assert.match(alertIconClass, /\[&_svg:not\(\[class\*='size-'\]\)\]:size-5/);
});

/* --- the logic alert.tsx delegates, so it can be tested without a DOM --- */
test("only the tones that cost something interrupt", () => {
  assert.equal(resolveAlertRole("destructive"), "alert");
  assert.equal(resolveAlertRole("warning"), "alert");
  assert.equal(resolveAlertRole("success"), "status");
  assert.equal(resolveAlertRole("default"), "status");
});

test("an explicit role wins over the tone", () => {
  assert.equal(resolveAlertRole("destructive", "status"), "status");
  assert.equal(resolveAlertRole("default", "alert"), "alert");
});

/** Stands in for AlertAction, which alert.tsx cannot be imported to reach. */
const MarkedAction = () => null;
Object.assign(MarkedAction, { [ALERT_PART]: "action" });
const action = (label: string) => React.createElement(MarkedAction, null, label);

test("every action is kept, not just the last one", () => {
  // Regression: `action` used to be one slot, so a second <AlertAction> vanished.
  const { body, actions } = splitAlertChildren([
    React.createElement("p", null, "Saved"),
    action("Undo"),
    action("Dismiss"),
  ]);
  assert.equal(actions.length, 2);
  assert.equal(actions[0]?.props?.children, "Undo");
  assert.equal(actions[1]?.props?.children, "Dismiss");
  assert.equal(body.length, 1);
});

test("an action written before the text still goes to the end of the row", () => {
  const { body, actions } = splitAlertChildren([action("Retry"), React.createElement("p", null, "Broken")]);
  assert.equal(actions.length, 1);
  assert.equal(body.length, 1);
});

test("an action wrapped in a fragment is still hoisted", () => {
  const wrapped = React.createElement(React.Fragment, null, action("Retry"), React.createElement("p", null, "Broken"));
  const { body, actions } = splitAlertChildren([wrapped]);
  assert.equal(actions.length, 1, "the wrapped action was left in the body column");
  assert.equal(body.length, 1);
});

test("a hand-rolled element carrying the slot is hoisted too", () => {
  const { actions } = splitAlertChildren([React.createElement("div", { "data-slot": "alert-action" }, "Retry")]);
  assert.equal(actions.length, 1);
});

test("children that render nothing do not leave an empty body column", () => {
  const { body } = splitAlertChildren([false, null, undefined, ""]);
  assert.equal(body.length, 0);

  const { body: mixed } = splitAlertChildren([false, React.createElement("p", null, "Real"), null]);
  assert.equal(mixed.length, 1);
});

test("zero is content", () => {
  const { body } = splitAlertChildren([0]);
  assert.equal(body.length, 1, "0 was filtered out, but it renders");
});

test("the title can lift its level to match the outline it sits in", () => {
  assert.equal(ALERT_HEADING_TAGS[3], "h3");
  assert.equal(ALERT_HEADING_TAGS[4], "h4");
  assert.equal(ALERT_HEADING_TAGS[5], "h5");
  assert.equal(ALERT_HEADING_TAGS[6], "h6");
});