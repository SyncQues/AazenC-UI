"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSide,
} from "@aazenc/ui/drawer";
import { Input } from "@aazenc/ui/input";
import { useTheme } from "@aazenc/themes";

const sides: { side: DrawerSide; label: string }[] = [
  { side: "bottom", label: "Bottom" },
  { side: "top", label: "Top" },
  { side: "left", label: "Left" },
  { side: "right", label: "Right" },
];

export function DrawerPreview() {
  const { mode, toggleMode } = useTheme();
  const [saved, setSaved] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Drawer</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One sheet from any edge. Drag the handle, scroll the body, and confirm from the action row.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {sides.map((item) => (
          <Drawer key={item.side} side={item.side}>
            <DrawerTrigger asChild>
              <Button type="button" variant="outline">
                {item.label}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{item.label} drawer</DrawerTitle>
                <DrawerDescription>The same sheet, from the {item.label.toLowerCase()} edge.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <p>Swipe the handle or use Close. The body scrolls when the note is longer than the sheet.</p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button type="button">Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
      </div>

      <div className="mt-8">
        <Drawer open={noteOpen} onOpenChange={setNoteOpen}>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline">
              Save from the drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Save this note</DrawerTitle>
              <DrawerDescription>Saving stores the note and closes the sheet.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <label className="grid gap-1.5 font-medium" htmlFor="drawer-note">
                Note
                <Input id="drawer-note" name="note" placeholder="Ship the drawer" />
              </label>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="button"
                onClick={() => {
                  setSaved(true);
                  setNoteOpen(false);
                }}
              >
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        {saved ? <p className="mt-3 text-sm">Saved from the drawer.</p> : null}
      </div>
    </main>
  );
}
