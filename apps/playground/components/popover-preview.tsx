"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Input } from "@aazenc/ui/input";
import { Label } from "@aazenc/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@aazenc/ui/popover";
import { useTheme } from "@aazenc/themes";

export function PopoverPreview() {
  const { mode, toggleMode } = useTheme();
  const [width, setWidth] = useState("320");
  const [open, setOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Popover</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One floating panel, with the same corner radius as the menus. It holds a short form or a note.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              Width
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="panel-width">Width in pixels</Label>
                <Input id="panel-width" value={width} onChange={(event) => setWidth(event.target.value)} />
              </div>
              <Button type="submit">Apply</Button>
            </form>
          </PopoverContent>
        </Popover>
        <p className="mt-4 text-sm text-muted-foreground">Width: {width || "none"}</p>
      </div>
    </main>
  );
}
