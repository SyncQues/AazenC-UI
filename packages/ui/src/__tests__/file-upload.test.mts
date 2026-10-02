import assert from "node:assert/strict";
import test from "node:test";
import { fileUploadClass, fileUploadFileClass } from "../file-upload-variants.ts";

test("file upload is one dashed zone", () => {
  assert.match(fileUploadClass, /border-dashed/);
  assert.match(fileUploadClass, /rounded-\[var\(--radius-panel\)\]/);
  assert.match(fileUploadClass, /data-\[dragging=true\]:border-primary/);
  assert.match(fileUploadClass, /has-\[:focus-visible\]:ring-\[3px\]/);
  assert.match(fileUploadClass, /data-\[invalid=true\]:border-destructive/);
  assert.match(fileUploadClass, /dark:border-foreground\/45/);
  assert.match(fileUploadFileClass, /rounded-full/);
  assert.doesNotMatch(fileUploadClass, /rounded-full|size-24|aspect-\[3\/1\]/);
});
