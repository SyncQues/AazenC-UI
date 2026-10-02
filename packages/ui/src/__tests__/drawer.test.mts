import assert from "node:assert/strict";
import test from "node:test";
import {
  drawerBodyClass,
  drawerCloseClass,
  drawerContentClass,
  drawerFooterClass,
  drawerHandleClass,
  drawerHeaderClass,
  drawerOverlayClass,
} from "../drawer-variants.ts";

test("drawer is one sheet from any edge", () => {
  assert.match(drawerOverlayClass, /drawer-overlay-motion/);
  assert.match(drawerOverlayClass, /bg-black\/50/);
  assert.match(drawerOverlayClass, /z-\[var\(--z-overlay\)\]/);
  assert.match(drawerContentClass, /bg-background/);
  assert.match(drawerContentClass, /max-h-\[85vh\]/);
  assert.match(drawerContentClass, /rounded-t-2xl/);
  assert.match(drawerContentClass, /sm:max-w-md/);
  assert.match(drawerContentClass, /shadow-lg/);
  assert.match(drawerContentClass, /overflow-hidden/);
  assert.match(drawerContentClass, /data-\[vaul-drawer-direction=bottom\]/);
  assert.match(drawerContentClass, /data-\[vaul-drawer-direction=top\]/);
  assert.match(drawerContentClass, /data-\[vaul-drawer-direction=left\]/);
  assert.match(drawerContentClass, /data-\[vaul-drawer-direction=right\]/);
  assert.doesNotMatch(drawerContentClass, /max-h-\[90vh\]|max-h-\[92vh\]|shadow-2xl|backdrop-blur/);
  assert.match(drawerHandleClass, /group-data-\[vaul-drawer-direction=bottom\]/);
  assert.match(drawerHandleClass, /group-data-\[vaul-drawer-direction=top\]/);
  assert.match(drawerHandleClass, /bg-foreground\/30/);
  assert.match(drawerHandleClass, /order-last/);
  assert.match(drawerHeaderClass, /text-left/);
  assert.match(drawerBodyClass, /overflow-y-auto/);
  assert.match(drawerFooterClass, /border-t/);
  assert.match(drawerFooterClass, /sm:justify-end/);
  assert.match(drawerFooterClass, /safe-area-inset-bottom/);
  assert.match(drawerCloseClass, /rounded-full/);
});
