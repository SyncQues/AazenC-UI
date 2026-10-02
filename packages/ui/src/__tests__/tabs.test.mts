import assert from "node:assert/strict";
import test from "node:test";
import { cn } from "../../../utils/src/cn.ts";
import {
  tabsBadgeClass,
  tabsListVariants,
  tabsPillIndicatorClass,
  tabsTriggerVariants,
  tabsUnderlineIndicatorClass,
} from "../tabs-variants.ts";

test("default tabs are one underline bar", () => {
  const list = cn(tabsListVariants({}));
  assert.match(list, /min-w-full/);
  assert.match(list, /border-b/);
  assert.match(list, /border-border/);
  assert.doesNotMatch(list, /rounded-full|bg-muted/);

  const trigger = cn(tabsTriggerVariants({}));
  assert.match(trigger, /relative/);
  assert.match(trigger, /data-\[state=active\]:text-foreground/);
  assert.match(trigger, /text-muted-foreground/);
  assert.doesNotMatch(trigger, /border-b-2|rounded-full|bg-primary|text-blue|bg-blue|amber|teal|purple/);
  assert.match(tabsUnderlineIndicatorClass, /h-0\.5/);
  assert.match(tabsUnderlineIndicatorClass, /bg-primary/);
});

test("pill is one chip and does not keep accent colors", () => {
  const list = cn(tabsListVariants({ variant: "pill" }));
  assert.match(list, /w-max/);
  assert.match(list, /gap-2/);
  assert.doesNotMatch(list, /border-b|min-w-full|bg-muted/);

  const trigger = cn(tabsTriggerVariants({ variant: "pill" }));
  assert.match(trigger, /rounded-full/);
  assert.match(trigger, /border-border/);
  assert.match(trigger, /bg-foreground\/10/);
  assert.match(trigger, /text-foreground/);
  assert.match(trigger, /shadow-xs/);
  assert.match(trigger, /data-\[state=active\]:bg-transparent/);
  assert.match(trigger, /data-\[state=active\]:border-transparent/);
  assert.match(trigger, /data-\[state=active\]:text-primary-foreground/);
  assert.doesNotMatch(trigger, /bg-muted|border-b-2|text-blue|bg-blue|amber|teal|purple|indigo|border-primary/);
  assert.match(tabsPillIndicatorClass, /bg-primary/);
  assert.match(tabsPillIndicatorClass, /rounded-full/);
});

test("segmented is one pill track that holds the same primary pill mark", () => {
  const list = cn(tabsListVariants({ variant: "segmented" }));
  assert.match(list, /rounded-full/);
  assert.match(list, /bg-muted/);
  assert.match(list, /inline-flex/);
  assert.match(list, /w-max/);
  assert.doesNotMatch(list, /border-b(?!order)|min-w-full|rounded-none|rounded-md/);

  const trigger = cn(tabsTriggerVariants({ variant: "segmented" }));
  assert.match(trigger, /rounded-full/);
  assert.doesNotMatch(trigger, /rounded-none|rounded-md|rounded-lg|rounded-xl/);
  // Inactive tabs sit on the track with no fill of their own.
  assert.match(trigger, /border-transparent/);
  assert.match(trigger, /bg-transparent/);
  assert.match(trigger, /text-muted-foreground/);
  // The mark is the primary fill, so the active label flips with it.
  assert.match(trigger, /data-\[state=active\]:text-primary-foreground/);
  assert.doesNotMatch(trigger, /text-blue|bg-blue|amber|teal|purple|indigo|border-primary/);

  // The mark is the same primary pill the chip row uses; only the track differs.
  assert.match(tabsPillIndicatorClass, /bg-primary/);
  assert.match(tabsPillIndicatorClass, /rounded-full/);
});

test("the count chip is shared by every tab look", () => {
  assert.match(tabsBadgeClass, /rounded-full/);
  assert.match(tabsBadgeClass, /bg-background/);
  assert.match(tabsBadgeClass, /text-foreground/);
  assert.match(tabsBadgeClass, /tabular-nums/);
  assert.doesNotMatch(tabsBadgeClass, /text-blue|bg-primary/);
});
