"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Label } from "@aazenc/ui/label";
import { MultiSelect } from "@aazenc/ui/multi-select";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@aazenc/ui/select";
import { useTheme } from "@aazenc/themes";

const roles = [
  { value: "engineer", label: "Engineer" },
  { value: "designer", label: "Designer" },
  { value: "writer", label: "Writer" },
  { value: "manager", label: "Manager", disabled: true },
];

export function SelectPreview() {
  const { mode, toggleMode } = useTheme();
  const [role, setRole] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Select</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One pill for a single choice. Multi-select is that same pill with search, tags, and select all.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <form
        className="mt-10 grid max-w-md gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSaved(String(data.get("role") ?? ""));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="role-select">Role</Label>
          <Select name="role" value={role} onValueChange={setRole}>
            <SelectTrigger id="role-select">
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Team</SelectLabel>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectItem value="manager" disabled>
                Manager
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="role-invalid">Invalid</Label>
          <Select>
            <SelectTrigger id="role-invalid" invalid>
              <SelectValue placeholder="Pick a team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineer">Engineer</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-destructive">Choose a team.</p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="roles-multi">Roles</Label>
          <MultiSelect
            id="roles-multi"
            options={roles}
            value={picked}
            onValueChange={setPicked}
            placeholder="Choose roles"
            empty="No roles"
          />
        </div>

        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineer">Engineer</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit">Save role</Button>
        {saved ? <p className="text-sm">Saved: {saved}</p> : null}
        {picked.length > 0 ? <p className="text-sm">Picked: {picked.join(", ")}</p> : null}
      </form>
    </main>
  );
}
