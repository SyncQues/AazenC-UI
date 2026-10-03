"use client";

import { useMemo, useState } from "react";
import { Button } from "@aazenc/ui/button";
import { SegmentedControl } from "@aazenc/ui/segmented-control";
import {
  ChartContainer,
  ChartContainerBody,
  ChartContainerFooter,
} from "@aazenc/ui/chart-container";
import { AreaChart } from "@aazenc/ui/area-chart";
import { BarChart } from "@aazenc/ui/bar-chart";
import { LineChart } from "@aazenc/ui/line-chart";
import { PieChart } from "@aazenc/ui/pie-chart";
import { ChartLegend, type ChartDatum, type ChartSlice } from "@aazenc/ui";
import { useTheme } from "@aazenc/themes";

/**
 * One page for the four cartesian chart components, because that is how they are used.
 *
 * A dashboard is a grid, and every decision these charts make — the gutter, the
 * legend slot, the loading height, the padding contract — only shows up next to
 * another card. Four separate pages would each show a chart floating in
 * whitespace and none of them would show whether two charts line up.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const REVENUE: ChartDatum[] = MONTHS.map((month, index) => ({
  month,
  revenue: 18200 + index * 2140 + Math.round(Math.sin(index * 1.3) * 3900),
  forecast: 18200 + index * 2140 + Math.round(Math.cos(index * 0.9) * 2600),
  refunds: Math.round(900 + Math.abs(Math.sin(index * 1.7)) * 1400),
}));

const SIGNUPS: ChartDatum[] = MONTHS.map((month, index) => ({
  month,
  signups: Math.round(280 + index * 34 + Math.cos(index * 0.8) * 90),
  activation: Math.round(150 + index * 21 + Math.sin(index * 1.1) * 55),
  // A deliberate hole, because a chart that cannot show a gap is a chart that
  // draws a straight line through data it does not have.
  churn: index === 4 ? null : Math.round(40 + index * 4 + Math.sin(index) * 12),
}));

const CHANNELS: ChartSlice[] = [
  { name: "Organic", value: 4820 },
  { name: "Referral", value: 3140 },
  { name: "Paid", value: 2260 },
  { name: "Email", value: 1480 },
  { name: "Social", value: 760 },
];

const TEAM: ChartDatum[] = [
  { name: "Engineering", headcount: 34, open: 6 },
  { name: "Design", headcount: 11, open: 2 },
  { name: "Product", headcount: 9, open: 1 },
  { name: "Support", headcount: 14, open: 3 },
  { name: "Sales", headcount: 22, open: 5 },
];

type DataState = "ready" | "loading" | "error" | "empty";

/* Option tables at module scope, not inline in the rows. The rows used to be a
   map over a literal, which is fine until the control wants the answer typed as
   a union — then the literal has to be `as const` at a declaration site rather
   than inside JSX props. */
const STATE_OPTIONS = [
  { value: "ready", label: "ready" },
  { value: "loading", label: "loading" },
  { value: "error", label: "error" },
  { value: "empty", label: "empty" },
] as const;

const CURVE_OPTIONS = [
  { value: "smooth", label: "smooth" },
  { value: "linear", label: "linear" },
  { value: "step", label: "step" },
] as const;

const GRID_OPTIONS = [
  { value: "horizontal", label: "horizontal" },
  { value: "both", label: "both" },
  { value: "none", label: "none" },
] as const;

const ORIENTATION_OPTIONS = [
  { value: "vertical", label: "vertical" },
  { value: "horizontal", label: "horizontal" },
] as const;

const PIE_OPTIONS = [
  { value: "pie", label: "pie" },
  { value: "donut", label: "donut" },
] as const;

const LABEL_POSITION_OPTIONS = [
  { value: "outside", label: "outside" },
  { value: "inside", label: "inside" },
] as const;

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

/** A control row. Charts are mostly about their props, so the demo is mostly
 *  about being able to change one. */
function Controls({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
      {children}
    </div>
  );
}

/**
 * `stacked` is the one control here that is not an exclusive choice — it is an
 * independent boolean sitting next to the orientation row. It stays a plain
 * button: putting it in a segmented control would tell the reader they are
 * picking one of the layouts when they are actually adding to them.
 */
function BooleanToggle({
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

export function ChartsPreview() {
  const { mode, toggleMode } = useTheme();
  const [curve, setCurve] = useState<"smooth" | "linear" | "step">("smooth");
  const [grid, setGrid] = useState<"horizontal" | "both" | "none">(
    "horizontal",
  );
  const [pieVariant, setPieVariant] = useState<"pie" | "donut">("donut");
  const [labelPosition, setLabelPosition] = useState<"outside" | "inside">(
    "outside",
  );
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical",
  );
  const [stacked, setStacked] = useState(false);
  const [state, setState] = useState<DataState>("ready");

  const retry = useMemo(() => () => setState("ready"), []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Charts</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Area, bar, line, and pie on one engine. Every color is a design
            token, so they follow light, dark, and every palette without being
            told. Hover, tap, or tab a chart to read a value.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section
        title="The container is the component"
        description="Title, description, actions, the plot, and the legend. The state layer below is the same container — loading, error, and empty are props, not four forked copies."
      >
        <Controls>
          <span className="text-muted-foreground">State</span>
          <SegmentedControl
            size="sm"
            options={STATE_OPTIONS}
            value={state}
            onValueChange={setState}
            label="Chart state"
          />
        </Controls>

        <ChartContainer
          title="Revenue"
          description="Last 12 months, in USD"
          loading={state === "loading"}
          error={
            state === "error"
              ? "The billing service did not respond."
              : undefined
          }
          onRetry={state === "error" ? retry : undefined}
          isEmpty={state === "empty"}
          height="full"
        >
          <AreaChart
            data={REVENUE}
            xKey="month"
            series={[
              { key: "revenue", label: "Revenue" },
              { key: "refunds", label: "Refunds" },
            ]}
            curve={curve}
            grid={grid}
            height={260}
            label="Revenue and refunds by month"
          />
        </ChartContainer>
      </Section>

      <Section
        title="Line and area"
        description="Smoothing is monotone, so the curve cannot invent a peak the readings do not contain. The dashed series is a forecast and fades in rather than drawing, because the draw owns the dash array."
      >
        <Controls>
          <span className="text-muted-foreground">Curve</span>
          <SegmentedControl
            size="sm"
            options={CURVE_OPTIONS}
            value={curve}
            onValueChange={setCurve}
            label="Curve"
          />
          <span className="ml-3 text-muted-foreground">Grid</span>
          <SegmentedControl
            size="sm"
            options={GRID_OPTIONS}
            value={grid}
            onValueChange={setGrid}
            label="Grid"
          />
        </Controls>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="Signups" description="With a missing month">
            <LineChart
              data={SIGNUPS}
              xKey="month"
              series={[
                { key: "signups", label: "Signups" },
                { key: "activation", label: "Activated" },
                { key: "churn", label: "Churned", color: "destructive" },
              ]}
              curve={curve}
              grid={grid}
              height={240}
              label="Signups, activations, and churn by month"
            />
          </ChartContainer>

          <ChartContainer
            title="Forecast"
            description="Actual against projection"
          >
            <AreaChart
              data={REVENUE}
              xKey="month"
              yKey="revenue"
              stack
              grid={grid}
              height={240}
              label="Stacked revenue against forecast"
            />
          </ChartContainer>
        </div>
      </Section>

      <Section
        title="Bars"
        description="Vertical or horizontal. The value axis is never truncated, so the zero line is always the baseline — a bar that starts at 40 would be a lie about the length of the bar."
      >
        <Controls>
          <span className="text-muted-foreground">Layout</span>
          <SegmentedControl
            size="sm"
            options={ORIENTATION_OPTIONS}
            value={orientation}
            onValueChange={setOrientation}
            label="Bar layout"
          />
          <BooleanToggle active={stacked} onClick={() => setStacked((value) => !value)}>
            stacked
          </BooleanToggle>
        </Controls>

        <ChartContainer
          title="Headcount"
          description="By team, with open roles"
        >
          <BarChart
            data={TEAM}
            xKey="name"
            series={[
              { key: "headcount", label: "Headcount" },
              { key: "open", label: "Open roles", color: "warning" },
            ]}
            orientation={orientation}
            stacked={stacked}
            height={orientation === "vertical" ? 260 : 300}
            label="Headcount and open roles by team"
          />
        </ChartContainer>
      </Section>

      <Section
        title="Pie and donut"
        description="Slices are stroked circles, not arc paths, because a dash offset animates on the compositor and a path's `d` does not. The legend is derived from the data, so it cannot drift out of step with the slices."
      >
        <Controls>
          <SegmentedControl
            size="sm"
            options={PIE_OPTIONS}
            value={pieVariant}
            onValueChange={setPieVariant}
            label="Pie style"
          />
          <span className="ml-3 text-muted-foreground">Labels</span>
          <SegmentedControl
            size="sm"
            options={LABEL_POSITION_OPTIONS}
            value={labelPosition}
            onValueChange={setLabelPosition}
            label="Label position"
          />
        </Controls>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartContainer title="Acquisition" padding="none">
            <ChartContainerBody padding="lg">
              <PieChart
                data={CHANNELS}
                variant={pieVariant}
                innerRadius={0.62}
                height={240}
                legendPosition="right"
                showLabels
                labelPosition={labelPosition}
                label="Signups by acquisition channel"
              />
            </ChartContainerBody>
          </ChartContainer>

          <ChartContainer
            title="Legend slot"
            description="A footer, hoisted below the plot"
          >
            <PieChart
              data={CHANNELS}
              variant={pieVariant}
              height={240}
              showLegend={false}
              label="Signups by acquisition channel"
            />
            <ChartContainerFooter>
              <ChartLegend
                align="between"
                items={CHANNELS.map((slice) => ({
                  label: slice.name,
                  color: `var(--chart-${CHANNELS.indexOf(slice) + 1})`,
                  shape: "circle" as const,
                }))}
              />
            </ChartContainerFooter>
          </ChartContainer>
        </div>
      </Section>

      <Section
        title="A chart with a filter in its header"
        description="The container takes the actions, so a date-range picker does not have to be rebuilt for every chart."
      >
        <ChartContainer
          title="Revenue"
          description="Last 12 months"
          actions={
            <>
              <Button type="button" size="xs" variant="outline">
                30d
              </Button>
              <Button type="button" size="xs" variant="default">
                12m
              </Button>
            </>
          }
        >
          <AreaChart
            data={REVENUE}
            xKey="month"
            series={[{ key: "forecast", label: "Forecast", dashed: true }]}
            height={220}
            label="Forecast revenue by month"
          />
        </ChartContainer>
      </Section>
    </main>
  );
}
