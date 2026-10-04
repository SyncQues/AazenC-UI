import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  breadcrumbClass,
  breadcrumbItemClass,
  breadcrumbLinkClass,
  breadcrumbListClass,
  breadcrumbPageClass,
  breadcrumbSeparatorClass,
} from "../breadcrumb-variants.ts";

const component = readFileSync(new URL("../breadcrumb.tsx", import.meta.url), "utf8");

test("the trail is a labelled nav", () => {
  // A page with two navs is only navigable if the landmarks are distinguishable.
  assert.match(component, /<nav /);
  assert.match(component, /aria-label=\{label\}/);
  assert.match(component, /label = "Breadcrumb"/);
  assert.equal(breadcrumbClass, "text-sm");
});

test("the trail is a list, so its order is real", () => {
  assert.match(component, /<ol /);
  assert.match(component, /<li /);
  assert.match(breadcrumbListClass, /flex flex-wrap items-center/);
});

test("a long path wraps instead of running off a narrow screen", () => {
  // Scrolling a path hides the ancestors, which are the part that is navigable.
  assert.match(breadcrumbListClass, /flex-wrap/);
  assert.doesNotMatch(breadcrumbListClass, /overflow-x-auto|overflow-hidden|whitespace-nowrap/);
  assert.match(breadcrumbPageClass, /truncate/);
  assert.match(breadcrumbItemClass, /min-w-0/);
});

test("the page you are on is a span, not a link", () => {
  // A link to the current page is a control that does nothing.
  assert.match(component, /<span data-slot="breadcrumb-page"/);
  assert.doesNotMatch(component, /<a [^>]*data-slot="breadcrumb-page"/);
  assert.match(breadcrumbPageClass, /font-medium text-foreground/);
});

test("the current page announces itself, and only the current page", () => {
  assert.match(component, /aria-current="page"/);
  const currentCount = component.match(/aria-current="page"/g)?.length ?? 0;
  assert.equal(currentCount, 1, "aria-current belongs on the page, once");
  assert.doesNotMatch(component, /aria-current="page"[^>]*aria-current/);
});

test("the separator is decorative and never announced", () => {
  assert.match(component, /data-slot="breadcrumb-separator"/);
  assert.match(component, /aria-hidden="true"/);
  assert.doesNotMatch(breadcrumbSeparatorClass, /aria-hidden/);
});

test("only the first crumb loses its separator, and the rule hangs off the item", () => {
  // The svg is the first child of every item, so `first:hidden` on the svg would
  // hide all of them. The suppression has to be keyed on the item being first.
  assert.match(
    breadcrumbItemClass,
    /\[&:first-child>\[data-slot=breadcrumb-separator\]\]:hidden/,
    "the first item must suppress its own separator",
  );
  assert.doesNotMatch(breadcrumbSeparatorClass, /first:hidden|hidden/);
});

test("each item draws exactly one separator, before its own label", () => {
  const items = component.match(/<svg/g)?.length ?? 0;
  assert.equal(items, 1, "the separator is defined once, inside the item");
  assert.match(component, /<svg[\s\S]*?data-slot="breadcrumb-separator"[\s\S]*?\{children\}/);
});

test("links are focusable and visible when focused", () => {
  assert.match(breadcrumbLinkClass, /focus-visible:ring-\[3px\] focus-visible:ring-ring\/50/);
  assert.match(breadcrumbLinkClass, /outline-none/);
  assert.match(breadcrumbLinkClass, /hover:text-foreground/);
  assert.match(breadcrumbLinkClass, /motion-reduce:transition-none/);
  assert.match(breadcrumbLinkClass, /text-muted-foreground/);
});

test("a link can be swapped for a router link without losing the chrome", () => {
  assert.match(component, /asChild = false/);
  assert.match(component, /asChild \? Slot : "a"/);
});

test("no part takes a class name", () => {
  // The chrome is the component's job. A class name here is how a trail drifts.
  for (const name of [
    "BreadcrumbProps",
    "BreadcrumbListProps",
    "BreadcrumbItemProps",
    "BreadcrumbLinkProps",
    "BreadcrumbPageProps",
  ]) {
    const at = component.indexOf(name);
    assert.notEqual(at, -1, `${name} is missing`);
    const declaration = component.slice(at, component.indexOf("\n\n", at));
    assert.match(declaration, /"className"/, `${name} does not omit className`);
  }
  assert.doesNotMatch(component, /className=\{props/);
});

test("the breadcrumb needs no client runtime", () => {
  // Nothing here measures, watches or holds state, so it should render on the server.
  assert.doesNotMatch(component, /"use client"/);
  assert.doesNotMatch(component, /useState|useEffect|useRef|useLayoutEffect/);
});
