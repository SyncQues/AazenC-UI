import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  tourCardClass,
  tourOverlayClass,
  tourSpotlightClass,
} from "../tour-variants.ts";
import { placeTourCard, spotlightBox } from "../tour-utils.ts";

const source = readFileSync(new URL("../tour.tsx", import.meta.url), "utf8");

test("tour card sits above the page and fades in", () => {
  assert.match(tourOverlayClass, /fixed/);
  assert.match(tourOverlayClass, /inset-0/);
  assert.doesNotMatch(tourOverlayClass, /bg-black/);
  assert.match(source, /fillOpacity="0\.5"/);
  assert.match(tourSpotlightClass, /ring-2/);
  assert.match(tourSpotlightClass, /ring-primary/);
  assert.match(tourSpotlightClass, /pointer-events-none/);
  assert.match(tourCardClass, /bg-background/);
  assert.match(tourCardClass, /border-border/);
  assert.match(tourCardClass, /animate-fade-in/);
  assert.match(tourCardClass, /motion-reduce:animate-none/);
  assert.match(tourCardClass, /z-\[calc\(var\(--z-popper\)\+2\)\]/);
});

test("className is merged before the rest spread", () => {
  const body = source.slice(source.indexOf("function Tour("));
  const classAt = body.indexOf("className={cn(");
  const spreadAt = body.indexOf("{...props}");
  assert.ok(classAt !== -1 && spreadAt !== -1 && classAt < spreadAt);
  assert.match(source, /data-slot="tour"/);
  assert.match(source, /data-slot="tour-spotlight"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /from "react-dom"/);
  assert.match(source, /createPortal\(/);
});

test("the card prefers the requested side and flips when it does not fit", () => {
  const card = { width: 200, height: 120 };
  const viewport = { width: 400, height: 400 };
  const centered = placeTourCard(null, "bottom", card, viewport);
  assert.equal(centered.top, 140);
  assert.equal(centered.left, 100);
  assert.equal(centered.side, "bottom");

  const below = placeTourCard({ top: 40, left: 100, width: 40, height: 30 }, "bottom", card, viewport);
  assert.equal(below.side, "bottom");
  assert.equal(below.top, 82);

  const flipped = placeTourCard({ top: 360, left: 100, width: 40, height: 30 }, "bottom", card, viewport);
  assert.equal(flipped.side, "top");
  assert.equal(flipped.top, 228);

  const beside = placeTourCard({ top: 100, left: 10, width: 40, height: 40 }, "right", { width: 120, height: 80 }, {
    width: 500,
    height: 400,
  });
  assert.equal(beside.side, "right");
  assert.equal(beside.left, 62);
  assert.equal(beside.top, 80);

  const hole = spotlightBox({ top: 10, left: 20, width: 30, height: 40 });
  assert.deepEqual(hole, { top: 4, left: 14, width: 42, height: 52 });
});
