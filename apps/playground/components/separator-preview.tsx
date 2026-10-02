"use client";

import { Separator } from "@aazenc/ui/separator";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

export function SeparatorPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Separator</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One hairline. Horizontal by default, vertical when it divides a row. Decorative by default, because
            most rules are furniture.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid max-w-2xl gap-6">
        <div className="grid gap-3">
          <p className="text-sm font-medium">Horizontal</p>
          <p className="text-sm text-muted-foreground">
            The default. It takes the full width of whatever it is in and never shrinks below the line it is
            meant to draw.
          </p>
          <div className="grid gap-3 rounded-lg border border-border p-6">
            <p className="text-sm">Public profile</p>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Anyone can see this page. Applications stay private.
            </p>
            <Separator />
            <p className="text-sm">Private draft</p>
            <p className="text-sm text-muted-foreground">Only your team can see this one.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">Vertical</p>
        <p className="text-sm text-muted-foreground">
          Needs a parent with a height. A vertical rule with no height above it is a rule with no height.
        </p>
        <div className="flex h-9 items-center gap-3 rounded-lg border border-border px-4 text-sm">
          <span>All roles</span>
          <Separator orientation="vertical" />
          <span className="text-muted-foreground">32 results</span>
        </div>
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">Decorative, and not</p>
        <p className="text-sm text-muted-foreground">
          A rule inside a paragraph is furniture and is hidden from a screen reader. A rule between two groups of
          fields is structure, and there it needs <code className="font-mono text-foreground">decorative=&#123;false&#125;</code> so
          it can be announced and can hold focus.
        </p>
        <div className="grid gap-6 rounded-lg border border-border p-6 sm:grid-cols-2">
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Decorative (default)</legend>
            <Separator />
            <p className="text-sm text-muted-foreground">
              This heading and the copy under it belong to the same thought.
            </p>
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Not decorative</legend>
            <Separator decorative={false} />
            <p className="text-sm text-muted-foreground">
              This is a second group of fields, so the rule is announced.
            </p>
          </fieldset>
        </div>
      </section>
    </main>
  );
}
