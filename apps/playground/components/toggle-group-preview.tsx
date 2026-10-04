"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@aazenc/ui/toggle-group";
import { useTheme } from "@aazenc/themes";

const FORMATS = [
  { value: "bold", label: "B", className: "font-bold" },
  { value: "italic", label: "I", className: "italic" },
  { value: "underline", label: "U", className: "underline" },
  { value: "strike", label: "S", className: "line-through" },
];

const ALIGN = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const FILTERS = [
  { value: "mine", label: "Mine" },
  { value: "assigned", label: "Assigned to me" },
  { value: "urgent", label: "Urgent" },
  { value: "archived", label: "Archived", disabled: true },
];

export function ToggleGroupPreview() {
  const { mode, toggleMode } = useTheme();
  const [formats, setFormats] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState("left");
  const [filters, setFilters] = useState<string[]>(["mine", "urgent"]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Toggle group
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Any number of independent on/off answers, held at the same time. Not
            a segmented control — that one always has exactly one answer.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pill — the default, and every item its own answer
          </h2>
          <ToggleGroup
            type="multiple"
            value={formats}
            onValueChange={setFormats}
            label="Text format"
          >
            {FORMATS.map((format) => (
              <ToggleGroupItem
                key={format.value}
                value={format.value}
                className="w-8 px-0"
              >
                <span aria-hidden className={format.className}>
                  {format.label}
                </span>
                <span className="sr-only">{format.value}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p
            className={FORMATS.map((f) =>
              formats.includes(f.value) ? f.className : "",
            ).join(" ")}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-xs text-muted-foreground">
            On: {formats.length ? formats.join(", ") : "nothing"}. Arrowing here
            moves the focus and changes nothing — in a toolbar, selecting on
            arrow would press every item you swept past.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Single — a radiogroup, so arrow selects
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Align</span>
            <ToggleGroup
              type="single"
              value={align}
              onValueChange={setAlign}
              label="Text alignment"
            >
              {ALIGN.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <p className="text-xs text-muted-foreground">
            Tab in, then use the arrow keys: focus and answer move together, as
            every other radiogroup on the platform does. Pressing the chosen
            item again clears it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Outline — the joined strip
          </h2>
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={formats}
            onValueChange={setFormats}
            label="Text format, joined"
          >
            {FORMATS.map((format) => (
              <ToggleGroupItem
                key={format.value}
                value={format.value}
                className="w-8 px-0"
              >
                <span aria-hidden className={format.className}>
                  {format.label}
                </span>
                <span className="sr-only">{format.value}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            The items touch and the container keeps the square radius, for the
            rows that read as one control rather than as separate chips.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Ghost — no container, each item carries its own border
          </h2>
          <ToggleGroup
            type="multiple"
            variant="ghost"
            value={filters}
            onValueChange={setFilters}
            label="Filters"
          >
            {FILTERS.map((filter) => (
              <ToggleGroupItem
                key={filter.value}
                value={filter.value}
                disabled={filter.disabled}
              >
                {filter.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            What a pressed item looks like is the same in every variant, so a
            toggle never has to be relearned. A disabled item is skipped by the
            arrows rather than hidden.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sizes — and one tab stop for the row
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {(["sm", "default", "lg"] as const).map((size) => (
              <ToggleGroup
                key={size}
                type="single"
                size={size}
                defaultValue="center"
                label={`Alignment at size ${size}`}
              >
                {ALIGN.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value}>
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            The whole row is one tab stop, and it sits on the answer — so
            tabbing away and back lands on what is currently chosen.
          </p>
        </section>
      </div>
    </main>
  );
}
