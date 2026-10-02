"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@aazenc/ui/command";
import { useTheme } from "@aazenc/themes";

const jobs = ["Designer", "Engineer", "Recruiter"];

export function CommandPreview() {
  const { mode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("None");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Command</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One list. The inline search and the palette use the same rows. The palette sits in the dialog.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 max-w-md overflow-hidden rounded-lg border border-border">
        <Command>
          <CommandInput placeholder="Search roles" />
          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup heading="Roles">
              {jobs.map((job) => (
                <CommandItem key={job} value={job} onSelect={() => setPicked(job)}>
                  {job}
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem value="Settings" onSelect={() => setPicked("Settings")}>
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </section>
      <p className="mt-3 text-sm">Picked: {picked}</p>

      <div className="mt-8">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Open palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Search roles">
          <CommandInput placeholder="Type a command" />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup heading="Roles">
              {jobs.map((job) => (
                <CommandItem
                  key={job}
                  value={job}
                  onSelect={() => {
                    setPicked(job);
                    setOpen(false);
                  }}
                >
                  {job}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </main>
  );
}
