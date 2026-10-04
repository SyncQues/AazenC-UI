"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Label } from "@aazenc/ui/label";
import { Textarea } from "@aazenc/ui/textarea";
import { useTheme } from "@aazenc/themes";

export function TextareaPreview() {
  const { mode, toggleMode } = useTheme();
  const [bio, setBio] = useState("Analytical engine designer. Writes about machines that reason.");
  const [notes, setNotes] = useState("");
  const [comment, setComment] = useState("");
  const [empty, setEmpty] = useState("Not an address");
  const [saved, setSaved] = useState("");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Textarea</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The Input field with a shape. Set maxLength to get a count, or autoResize
            to let the box grow with the text.
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
          setSaved(String(data.get("bio") ?? ""));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="textarea-bio">Bio</Label>
          <Textarea
            id="textarea-bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="A sentence or two about you"
          />
          <p className="text-xs text-muted-foreground">Drag the bottom edge, or leave it alone.</p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="textarea-counted">Release note</Label>
          <Textarea
            id="textarea-counted"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={180}
            showCount
            rows={4}
            placeholder="What changed in this release?"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="textarea-grow">Comment</Label>
          <Textarea
            id="textarea-grow"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            autoResize
            maxRows={6}
            placeholder="Grows as you type, then scrolls past six lines"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="textarea-pill">Note</Label>
          <Textarea
            id="textarea-pill"
            shape="pill"
            rows={3}
            defaultValue="A heavily round field. Not a full radius — that reads as a lozenge."
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="textarea-invalid">Shipping address</Label>
          <Textarea
            id="textarea-invalid"
            invalid
            defaultValue={empty}
            onChange={(event) => setEmpty(event.target.value)}
            aria-describedby="textarea-invalid-hint"
            rows={3}
          />
          <p id="textarea-invalid-hint" className="text-sm text-destructive">
            Add a street and a city.
          </p>
        </div>

        <div className="grid gap-1.5 opacity-50">
          <Label htmlFor="textarea-disabled">Notes (read only)</Label>
          <Textarea id="textarea-disabled" disabled defaultValue="Locked by an administrator." />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">Save bio</Button>
          <Button type="button" variant="outline" onClick={() => setBio("")}>
            Clear bio
          </Button>
          {saved ? <p className="text-sm">Saved: {saved}</p> : null}
        </div>
      </form>
    </main>
  );
}
