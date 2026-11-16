"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Tour, type TourStep } from "@aazenc/ui/tour";
import { useTheme } from "@aazenc/themes";

const steps: TourStep[] = [
  {
    target: "#tour-nav",
    title: "Navigation",
    description: "This is where the product lives.",
    side: "bottom",
  },
  {
    target: "#tour-theme",
    title: "Theme",
    description: "Switch light and dark from here.",
    side: "left",
  },
  {
    target: "#tour-save",
    title: "Save",
    description: "Write the change when you are ready.",
    side: "top",
  },
];

export function TourPreview() {
  const { mode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Ready");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tour</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One spotlight. The card walks through the page. Arrow keys move the step, and Escape closes it.
          </p>
        </div>
        <Button id="tour-theme" type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-md gap-8">
        <div id="tour-nav" className="rounded-lg border border-border px-4 py-3 text-sm font-medium">
          Navigation
        </div>
        <div className="flex flex-wrap gap-3">
          <Button id="tour-save" type="button">
            Save
          </Button>
          <Button
            id="tour-start"
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("On the tour");
              setOpen(true);
            }}
          >
            Show the tour
          </Button>
        </div>
        <p id="tour-status" className="text-sm">
          {status}
        </p>
      </div>

      <Tour
        open={open}
        steps={steps}
        onFinish={() => setStatus("Tour finished")}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setStatus((previous) => (previous === "Tour finished" ? previous : "Skipped"));
        }}
      />
    </main>
  );
}
