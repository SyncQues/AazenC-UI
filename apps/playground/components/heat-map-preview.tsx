"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { ChartContainer } from "@aazenc/ui/chart-container";
import { HeatMap } from "@aazenc/ui/heat-map";
import type { ChartDatum } from "@aazenc/ui";
import { useTheme } from "@aazenc/themes";

/**
 * Heat map, on its own page.
 *
 * A heat map does not belong on a page with the other charts. Every one of them
 * encodes a value as a *length* a reader can compare against an axis; this one
 * encodes it as a colour, which means the decisions that matter are entirely
 * different ones — where the ramp comes from, whether the bands are legible,
 * what a missing reading looks like, and whether two maps can be compared at
 * all. Sitting next to a bar chart, all of that gets read as a detail of the
 * bar chart.
 */

/** Mon–Sun. Spelled out rather than indexed, because a heat map's whole job is
 *  being scanned by column, and `0` and `6` are not columns. */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const WEEKS = [
  "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12",
] as const;

/**
 * Twelve weeks of deploys. The numbers are shaped rather than random: weekends
 * are quiet, Friday is the hot column, and two cells are missing entirely so the
 * dashed "no reading" gap is on screen rather than described.
 */
const WEEKDAYS: ChartDatum[] = WEEKS.flatMap((week, weekIndex) =>
  DAYS.map((day, dayIndex) => {
    // Two deliberate holes. `null` is a missing reading, and the whole point of
    // rendering it differently is invisible unless there is one to look at.
    if (weekIndex === 4 && dayIndex === 2) return { week, day, value: null };
    if (weekIndex === 9 && dayIndex === 5) return { week, day, value: null };
    const base = dayIndex >= 5 ? 1 : 6 + dayIndex;
    return {
      week,
      day,
      value: Math.max(
        0,
        Math.round(base + Math.sin(weekIndex * 0.8) * 3 + Math.cos(dayIndex * 1.4) * 2),
      ),
    };
  }),
);

/** The same shape, signed, so the diverging ramp has both arms to show. */
const DIVERGING: ChartDatum[] = WEEKS.slice(0, 6).flatMap((week, weekIndex) =>
  DAYS.map((day, dayIndex) => ({
    week,
    day,
    value: Math.round(
      Math.sin(weekIndex * 0.9 + dayIndex * 0.4) * 14 + Math.cos(dayIndex * 1.1) * 5,
    ),
  })),
);

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A control row. A heat map is almost entirely about its props. */
function Controls({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
      {children}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "default" : "outline"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function HeatMapPreview() {
  const { mode, toggleMode } = useTheme();
  const [scale, setScale] = useState<"sequential" | "diverging">("sequential");
  const [steps, setSteps] = useState(5);
  const [radius, setRadius] = useState(3);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Heat Map
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A matrix on a ramp mixed in oklch, so lightness climbs the whole
            way instead of dipping in the middle. Bands rather than a gradient,
            so a cell&apos;s shade is a swatch the reader can point at. A
            missing reading is a dashed gap, never a zero. Hover, tap, or tab
            the grid to read a value.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section
        title="Sequential and diverging"
        description="Sequential reads magnitude from quiet to loud. Diverging puts the pivot in the middle with both arms at equal distance from it — a fall of 8 and a rise of 8 are the same shade, which an ordinary min/max domain would not give you."
      >
        <Controls>
          <span className="text-muted-foreground">Scale</span>
          {(["sequential", "diverging"] as const).map((value) => (
            <Toggle
              key={value}
              active={scale === value}
              onClick={() => setScale(value)}
            >
              {value}
            </Toggle>
          ))}
          <span className="ml-3 text-muted-foreground">Bands</span>
          {([3, 5, 7] as const).map((value) => (
            <Toggle
              key={value}
              active={steps === value}
              onClick={() => setSteps(value)}
            >
              {value}
            </Toggle>
          ))}
          <span className="ml-3 text-muted-foreground">Radius</span>
          {([0, 3, 6] as const).map((value) => (
            <Toggle
              key={value}
              active={radius === value}
              onClick={() => setRadius(value)}
            >
              {value}
            </Toggle>
          ))}
        </Controls>

        <ChartContainer
          title={scale === "diverging" ? "Change vs last week" : "Deploys per weekday"}
          description={
            scale === "diverging"
              ? "Both arms are levelled against zero. Note the scale below the grid, in real numbers, not swatches alone."
              : "Twelve weeks. Friday is the hot column and the weekends are the quiet ones, and you can see that without reading a number."
          }
        >
          <HeatMap
            data={scale === "diverging" ? DIVERGING : WEEKDAYS}
            xKey="day"
            yKey="week"
            valueKey="value"
            scale={scale}
            steps={steps}
            radius={radius}
            /* Green, because this is a sequential ramp and green is a perfectly
               good one: `--data-4` is fixed, so it holds in either mode, and it
               measures 3.83:1 on the light surface and 4.99:1 on the dark one.
               Not `color="green"` — that role points at `--green-500` (L 72%),
               which measures 2.13:1 on light, under the 3:1 a mark needs.

               The diverging arm stays on the default blue/red on purpose. A
               diverging ramp needs its two arms to be tellable apart, and a
               mode-stable palette is confined to a narrow luminance band (a
               color has to clear 3:1 against near-white *and* near-black), so
               every slot sits at L 58% and hue has to do all the work alone.
               Measured worst-case across normal vision plus the three
               dichromacies, green-up scores 1.03:1 against the default red —
               invisible to a red-green colourblind reader. The best pair still
               available is 1.45:1 (purple L 52% against this blue), and a red
               dark enough to separate from green drops to 2.15:1 on the dark
               surface, failing the contrast it was darkened for. */
            color={scale === "diverging" ? "data-1" : "data-4"}
            format={scale === "diverging" ? { suffix: " pts" } : undefined}
            label={
              scale === "diverging"
                ? "Change in points against the previous week, by weekday"
                : "Deploys by weekday over twelve weeks"
            }
          />
        </ChartContainer>
      </Section>

      <Section
        title="One domain, two maps"
        description="Pinned to the same range, so a quiet week and a busy week look different. Left to its own extent each map stretches to fill, and then they agree on nothing — which is the most common way two heat maps are put side by side and quietly made meaningless."
      >
        <div className="space-y-5">
          {WEEKS.slice(0, 2).map((week) => (
            <ChartContainer key={week} title={week} padding="sm">
              <HeatMap
                data={WEEKDAYS.filter((entry) => entry.week === week)}
                xKey="day"
                yKey="week"
                valueKey="value"
                steps={steps}
                domain={[0, 24]}
                height={72}
                radius={2}
                color="data-4"
                label={`Deploys for ${week}`}
              />
            </ChartContainer>
          ))}
        </div>
      </Section>

      <Section
        title="A gap is not a zero"
        description="W5 and W10 each lost a reading. Those two cells are drawn as empty dashed slots rather than as the lowest band, because the lowest band is a claim — it says nothing happened — and the data says we do not know."
      >
        <ChartContainer
          title="Two weeks, two missing readings"
          description="A dashed cell is a cell with no number in it. Filled in, it would read as a quiet Friday, and a quiet Friday is a different claim."
        >
          <HeatMap
            data={WEEKDAYS.filter(
              (entry) => entry.week === "W5" || entry.week === "W10",
            )}
            xKey="day"
            yKey="week"
            valueKey="value"
            steps={steps}
            domain={[0, 24]}
            height={96}
            color="data-4"
            label="Two weeks of deploys, with two missing readings"
          />
        </ChartContainer>
      </Section>
    </main>
  );
}
