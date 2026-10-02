import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { clampPdfPage, clampPdfZoom, stepPdfZoom } from "../pdf-viewer-utils.ts";
import {
  pdfPagePaneClass,
  pdfThumbsClass,
  pdfToolbarClass,
  pdfViewerClass,
} from "../pdf-viewer-variants.ts";

test("pdf viewer is one framed reader", () => {
  assert.match(pdfViewerClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(pdfViewerClass, /border-border/);
  assert.match(pdfViewerClass, /h-\[32rem\]/);
  assert.match(pdfViewerClass, /data-\[expanded=true\]:fixed/);
  assert.match(pdfViewerClass, /data-\[expanded=true\]:h-dvh/);
  assert.match(pdfToolbarClass, /border-b/);
  assert.match(pdfPagePaneClass, /overflow-auto/);
  assert.match(pdfPagePaneClass, /bg-foreground\/10/);
  assert.match(pdfPagePaneClass, /cursor-zoom-in/);
  assert.match(pdfThumbsClass, /border-r/);
  const framed = `${pdfViewerClass} ${pdfToolbarClass}`.replace(/data-\[expanded=true\]:\S+/g, "");
  assert.doesNotMatch(framed, /backdrop-blur|rounded-none|bg-muted/);
  const source = readFileSync(new URL("../pdf-viewer.tsx", import.meta.url), "utf8");
  assert.match(source, /Full page/);
  assert.match(source, /Exit full page/);
  assert.doesNotMatch(source, /^import\s+.*from\s+["']react-pdf["']/m);
  assert.match(source, /import\("react-pdf"\)/);
  assert.match(source, /\.catch\(/);
  assert.doesNotMatch(source, /unpkg\.com/);
});

test("page and zoom stay inside the reader range", () => {
  assert.equal(clampPdfPage(0, 3), 1);
  assert.equal(clampPdfPage(9, 3), 3);
  assert.equal(clampPdfPage(Number.NaN, 3), 1);
  assert.equal(clampPdfPage(1, 0), 1);
  assert.equal(clampPdfZoom(4), 2.5);
  assert.equal(clampPdfZoom(0), 0.5);
  assert.equal(stepPdfZoom(1, 1), 1.25);
  assert.equal(stepPdfZoom(0.5, -1), 0.5);
  assert.equal(stepPdfZoom(2.5, 1), 2.5);
});
