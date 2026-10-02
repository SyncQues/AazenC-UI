"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Input } from "@aazenc/ui/input";
import { Label } from "@aazenc/ui/label";
import { useTheme } from "@aazenc/themes";

export function LabelPreview() {
  const { mode, toggleMode } = useTheme();
  const [saved, setSaved] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Label</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One caption. A required field adds a mark. The text stays the same size.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <form
        className="mt-10 grid max-w-md gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSaved(String(data.get("workspace") ?? ""));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="workspace" required>
            Workspace
          </Label>
          <Input id="workspace" name="workspace" placeholder="Northwind" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="nickname">Nickname</Label>
          <Input id="nickname" placeholder="Optional" />
        </div>
        <Button type="submit">Save workspace</Button>
        {saved ? <p className="text-sm">Saved: {saved}</p> : null}
      </form>
    </main>
  );
}
