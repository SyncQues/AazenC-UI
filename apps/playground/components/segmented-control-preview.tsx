"use client";

import { useState } from "react";
import { SegmentedControl } from "@aazenc/ui/segmented-control";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

const RANGES = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
  { value: "all", label: "All time" },
];

const CURVES = [
  { value: "smooth", label: "Smooth" },
  { value: "linear", label: "Linear" },
  { value: "step", label: "Step" },
];

const DENSITY = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
  { value: "condensed", label: "Condensed" },
];

export function SegmentedControlPreview() {
  const { mode, toggleMode } = useTheme();
  const [range, setRange] = useState("7d");
  const [curve, setCurve] = useState("smooth");
  const [density, setDensity] = useState("comfortable");
  const [granularity, setGranularity] = useState<"a" | "b" | "c">("a");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Segmented control
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One exclusive answer as a row of options. The primary pill slides
            behind the chosen one, so the answer is a position in the row and not
            only a fill.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Tracked — the mark sits in a muted track
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Range</span>
            <SegmentedControl
              options={RANGES}
              value={range}
              onValueChange={setRange}
              label="Date range"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The mark travels on <code>transform</code>, with width and height
            alongside it so it never resizes under the label.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pill — every option is its own chip
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Curve</span>
            <SegmentedControl
              variant="pill"
              options={CURVES}
              value={curve}
              onValueChange={setCurve}
              label="Chart curve"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Same chip as the pill tab row, and the same sliding mark. The chosen
            chip empties out rather than painting a second dark pill over the
            mark.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Loose — separate chips on the page background
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Density</span>
            <SegmentedControl
              variant="outline"
              options={DENSITY}
              value={density}
              onValueChange={setDensity}
              label="Density"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sizes — and a row that is not a radio group without arrows
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {(["sm", "default", "lg"] as const).map((size) => (
              <SegmentedControl
                key={size}
                size={size}
                options={CURVES}
                defaultValue="smooth"
                label={`Curve at size ${size}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Tab into a row, then use the arrow keys. Tab again and the row is one
            stop, not one per option.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            A disabled option is skipped, not hidden
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <SegmentedControl
              variant="pill"
              options={[
                { value: "a", label: "Hourly" },
                { value: "b", label: "Daily", disabled: true },
                { value: "c", label: "Monthly" },
              ]}
              value={granularity}
              onValueChange={setGranularity}
              label="Granularity"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
