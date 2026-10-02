"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@aazenc/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogSize,
} from "@aazenc/ui/dialog";
import { useTheme } from "@aazenc/themes";

const sizes: { size: DialogSize; label: string; copy: string }[] = [
  { size: "sm", label: "Small", copy: "Confirms and short forms." },
  { size: "default", label: "Default", copy: "The standard dialog." },
  { size: "lg", label: "Large", copy: "Details, composers, and search." },
  { size: "xl", label: "Wide", copy: "Galleries and large previews." },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-3">{children}</div>
    </section>
  );
}

export function DialogPreview() {
  const { mode, toggleMode } = useTheme();
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [removed, setRemoved] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dialog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One centered panel. Size is small, default, large, or wide. Padding is comfortable or flush.
            An alert uses the same panel and stays open until you choose an action.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section title="Size">
        {sizes.map((item) => (
          <Dialog key={item.size}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                {item.label}
              </Button>
            </DialogTrigger>
            <DialogContent size={item.size}>
              <DialogHeader>
                <DialogTitle>{item.label} dialog</DialogTitle>
                <DialogDescription>{item.copy}</DialogDescription>
              </DialogHeader>
              <p className="text-sm">The panel fades and scales in, then rests in the center.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </Section>

      <Section title="Form">
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger asChild>
            <Button type="button">Add a note</Button>
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Add a note</DialogTitle>
              <DialogDescription>Saved on this page only.</DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setNote(String(data.get("note") ?? ""));
                setNoteOpen(false);
              }}
            >
              <label className="grid gap-2 text-sm font-medium" htmlFor="dialog-note">
                Note
                <input
                  id="dialog-note"
                  name="note"
                  defaultValue={note}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                />
              </label>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <p className="self-center text-sm text-muted-foreground">{note ? `Saved: ${note}` : "Nothing saved."}</p>
      </Section>

      <Section title="Alert">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete item
            </Button>
          </DialogTrigger>
          <DialogContent size="sm" kind="alert">
            <DialogHeader>
              <DialogTitle>Delete this item?</DialogTitle>
              <DialogDescription>This cannot be undone. The overlay and Escape leave it open.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" variant="destructive" onClick={() => setRemoved(true)}>
                  Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="self-center text-sm text-muted-foreground">{removed ? "Item deleted." : "Item is still here."}</p>
      </Section>

      <Section title="Flush">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Open composer
            </Button>
          </DialogTrigger>
          <DialogContent size="lg" padding="none">
            <DialogHeader>
              <DialogTitle>New post</DialogTitle>
              <DialogDescription>The header and footer hold their own padding.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm">
                Flush dialogs are the composers and pickers. The middle section scrolls when the copy is long.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                A second gray fill, a rounder corner, and a heavier shadow are the same panel, so they are not separate options.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button">Publish</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="No close button">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost">
              Open quietly
            </Button>
          </DialogTrigger>
          <DialogContent size="sm" close={false}>
            <DialogHeader>
              <DialogTitle>Review</DialogTitle>
              <DialogDescription>Dismiss with the action, the overlay, or Escape.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>
    </main>
  );
}
