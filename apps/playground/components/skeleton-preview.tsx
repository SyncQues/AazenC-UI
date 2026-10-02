"use client";

import { Button } from "@aazenc/ui/button";
import { Skeleton } from "@aazenc/ui/skeleton";
import { useTheme } from "@aazenc/themes";

export function SkeletonPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Skeleton</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One pulse. A line stands in for text, a circle for an avatar, and a block for a card.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid max-w-md gap-8">
        <div className="grid gap-2">
          <p className="text-sm font-medium">Lines</p>
          <Skeleton width="short" />
          <Skeleton width="medium" />
          <Skeleton width="long" />
          <Skeleton width="full" />
          <Skeleton count={3} width="full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" />
          <div className="grid flex-1 gap-2">
            <Skeleton width="long" />
            <Skeleton width="medium" />
          </div>
        </div>
        <Skeleton shape="block" />
      </section>
    </main>
  );
}
