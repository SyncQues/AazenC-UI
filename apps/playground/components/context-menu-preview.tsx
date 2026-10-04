"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@aazenc/ui/context-menu";
import { useTheme } from "@aazenc/themes";

export function ContextMenuPreview() {
  const { mode, toggleMode } = useTheme();
  const [action, setAction] = useState("None");
  const [showHidden, setShowHidden] = useState(false);
  const [sort, setSort] = useState("recent");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Context Menu</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The dropdown&apos;s panel, opened on right-click. Same items, same chrome, same destructive tone — one
            menu-variants feeds both, so the two cannot drift apart.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid gap-3">
        <p className="text-sm font-medium">Right-click a row</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          On a trackpad or a mouse, right-click the area below. On a touch screen it opens on press-and-hold,
          which is the browser&apos;s rule for this gesture, not something the component decides.
        </p>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="grid min-h-56 max-w-2xl place-items-center rounded-lg border border-border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Right-click anywhere in here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>File</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem onSelect={() => setAction("Open")}>
                Open
                <ContextMenuShortcut>O</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => setAction("Copy link")}>Copy link</ContextMenuItem>
                  <ContextMenuItem onSelect={() => setAction("Email")}>Email</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={showHidden} onCheckedChange={(value) => setShowHidden(value === true)}>
              Show hidden files
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuLabel>Sort by</ContextMenuLabel>
            <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
              <ContextMenuRadioItem value="recent">Recently opened</ContextMenuRadioItem>
              <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
              <ContextMenuRadioItem value="size">Size</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem tone="destructive" onSelect={() => setAction("Delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <p className="text-sm text-muted-foreground">
          Last action: {action}. Hidden files {showHidden ? "shown" : "hidden"}. Sort by {sort}.
        </p>
      </section>
    </main>
  );
}
