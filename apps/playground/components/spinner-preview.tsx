"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Card, CardContent } from "@aazenc/ui/card";
import { Spinner, SpinnerLabel, SpinnerOverlay } from "@aazenc/ui/spinner";
import { useTheme } from "@aazenc/themes";

export function SpinnerPreview() {
  const { mode, toggleMode } = useTheme();
  const [saving, setSaving] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Spinner</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One arc, four sizes. It takes the color it sits in, so the same mark works on a page, on a card, and
            inside a button. Give it a label when it is the only thing on screen.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid max-w-2xl gap-10">
        <div className="grid gap-3">
          <p className="text-sm font-medium">Sizes</p>
          <div className="flex items-end gap-6 text-muted-foreground">
            <Spinner size="sm" label="Small" />
            <Spinner size="md" label="Medium" />
            <Spinner size="lg" label="Large" />
            <Spinner size="xl" label="Extra large" />
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Inline, next to a label</p>
          <div className="flex items-center gap-2 text-sm">
            <Spinner size="sm" label="Saving" />
            <SpinnerLabel>Saving your changes…</SpinnerLabel>
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Centered, in a region</p>
          <div className="rounded-lg border border-border">
            <SpinnerOverlay>
              <Spinner size="lg" label="Loading applications" />
              <SpinnerLabel>Loading applications…</SpinnerLabel>
            </SpinnerOverlay>
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">In a card, and in a button</p>
          <Card>
            <CardContent>
              <SpinnerOverlay>
                <Spinner size="md" label="Loading chart" />
                <SpinnerLabel>Loading chart…</SpinnerLabel>
              </SpinnerOverlay>
            </CardContent>
          </Card>
          <div className="flex items-center gap-3">
            <Button type="button" loading={saving} onClick={() => setSaving(true)}>
              Save changes
            </Button>
            <Button type="button" variant="outline" disabled={!saving} onClick={() => setSaving(false)}>
              Stop loading
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Unlabelled</p>
          <p className="text-sm text-muted-foreground">
            No label, so the mark is hidden from screen readers. Use it beside text that already says what is
            loading.
          </p>
          <Spinner size="md" />
        </div>
      </section>
    </main>
  );
}
