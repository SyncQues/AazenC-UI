"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Checkbox } from "@aazenc/ui/checkbox";
import { Label } from "@aazenc/ui/label";
import { useTheme } from "@aazenc/themes";

const options = ["Email", "Push", "SMS"] as const;

export function CheckboxPreview() {
  const { mode, toggleMode } = useTheme();
  const [picked, setPicked] = useState<string[]>(["Email"]);
  const all = picked.length === options.length;
  const some = picked.length > 0 && !all;

  function toggle(option: string, on: boolean) {
    setPicked((current) => (on ? [...current, option] : current.filter((item) => item !== option)));
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Checkbox</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One box. A partial selection uses the same fill with a dash.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-md gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="channels"
            checked={all ? true : some ? "indeterminate" : false}
            onCheckedChange={(next) => setPicked(next === true ? [...options] : [])}
          />
          <Label htmlFor="channels">All channels</Label>
        </div>
        {options.map((option) => (
          <div key={option} className="ml-6 flex items-center gap-2">
            <Checkbox
              id={`channel-${option}`}
              checked={picked.includes(option)}
              onCheckedChange={(next) => toggle(option, next === true)}
            />
            <Label htmlFor={`channel-${option}`}>{option}</Label>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Checkbox id="channel-invalid" invalid />
          <Label htmlFor="channel-invalid">Accept the terms</Label>
        </div>
        <p className="text-sm text-destructive">Required before you continue.</p>
        <div className="flex items-center gap-2">
          <Checkbox id="channel-disabled" disabled checked />
          <Label htmlFor="channel-disabled">Disabled</Label>
        </div>
        {picked.length > 0 ? <p className="text-sm">On: {picked.join(", ")}</p> : <p className="text-sm">On: none</p>}
      </div>
    </main>
  );
}
