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
  assert.match(pdfViewerClass, /rounded-\[1\.125rem\]/);
  assert.match(pdfViewerClass, /border-border/);
  assert.match(pdfViewerClass, /h-\[32rem\]/);
  assert.match(pdfToolbarClass, /border-b/);
  assert.match(pdfPagePaneClass, /overflow-auto/);
  assert.match(pdfPagePaneClass, /bg-foreground\/10/);
  assert.match(pdfThumbsClass, /border-r/);
  assert.doesNotMatch(`${pdfViewerClass} ${pdfToolbarClass}`, /backdrop-blur|rounded-none|bg-muted/);
  const source = readFileSync(new URL("../pdf-viewer.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /pdfViewerVariants|variant="chrome"|variant="outline"/);
});

test("page and zoom stay inside the reader range", () => {
  assert.equal(clampPdfPage(0, 3), 1);
  assert.equal(clampPdfPage(9, 3), 3);
  assert.equal(clampPdfPage(Number.NaN, 3), 1);
  assert.equal(clampPdfZoom(4), 2.5);
  assert.equal(clampPdfZoom(0), 0.5);
  assert.equal(stepPdfZoom(1, 1), 1.25);
  assert.equal(stepPdfZoom(0.5, -1), 0.5);
});
