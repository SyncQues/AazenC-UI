"use client";

import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

export function BadgePreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Badge</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Four marks. Soft covers the old secondary chip. Status colors were tints of that same pill.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Badge>New</Badge>
        <Badge variant="soft">Secondary</Badge>
        <Badge variant="outline">Draft</Badge>
        <Badge variant="destructive">3</Badge>
        <Badge asChild variant="soft">
          <a href="#jobs">Jobs</a>
        </Badge>
      </div>
    </main>
  );
}
