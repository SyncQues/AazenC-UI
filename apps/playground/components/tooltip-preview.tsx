"use client";

import { Button } from "@aazenc/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@aazenc/ui/tooltip";
import { useTheme } from "@aazenc/themes";

export function TooltipPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tooltip</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One inverse bubble. It opens on hover or focus and uses the theme primary in both modes.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline">
              Share
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy the link</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button">Publish</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Visible to everyone in the workspace</TooltipContent>
        </Tooltip>
      </div>
    </main>
  );
}
