"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@aazenc/ui/collapsible";
import { useTheme } from "@aazenc/themes";

export function CollapsiblePreview() {
  const { mode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Collapsible</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One disclosure. The trigger can be this row, or any button you already have.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-md gap-8">
        <Collapsible>
          <CollapsibleTrigger>Shipping notes</CollapsibleTrigger>
          <CollapsibleContent>
            <p className="px-1 pt-1 text-muted-foreground">Leave the parcel at the side door.</p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline">
              {open ? "Hide hints" : "Show hints"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="pt-3 text-muted-foreground">Search matches the label, not a fuzzy score.</p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </main>
  );
}
