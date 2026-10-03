"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import {
  MetricCard,
  MetricCardChart,
  MetricCardFooter,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  metricCardVariants,
} from "@aazenc/ui/metric-card";
import { useTheme } from "@aazenc/themes";
import { cn } from "@aazenc/utils";

/**
 * The tile a dashboard is made of.
 *
 * The trend is the thing this demo is really about, so `invertTrend` is on a
 * control: revenue going up and latency going up are the same arrow in opposite
 * colours, and a reader has to be able to see that flip rather than read about
 * it.
 */

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

/** A drop-in sparkline for the `chart` slot. The slot takes any node, so this
 *  can be a bare `<svg>` with no wrapper and still fill its box. */
function Sparkline({
  values,
  color = "var(--primary)",
}: {
  values: number[];
  color?: string;
}) {
  const width = 120;
  const height = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" L ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      className="text-primary"
    >
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

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

export function MetricCardPreview() {
  const { mode, toggleMode } = useTheme();
  const [invert, setInvert] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Metric Card
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A KPI tile: label, value, trend, context. The trend is coloured by
            sentiment rather than by sign, and it never leans on colour alone.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <Section
        title="A row of tiles"
        description="A dashboard row. None of them lift on hover — the pointer crosses the whole row on its way somewhere, and twelve tiles that all move is a row that looks broken."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Monthly revenue"
            value={48210}
            change={invert ? -0.031 : 0.124}
            invertTrend={invert}
            changeLabel="vs last month"
            icon={<ArrowUpIcon />}
            chart={<Sparkline values={[28, 31, 29, 36, 34, 41, 44, 48]} />}
          />
          <MetricCard
            label="Active members"
            value={1284}
            change={invert ? -0.004 : 0.087}
            invertTrend={invert}
            changeLabel="vs last month"
            icon={<UsersIcon />}
            chart={
              <Sparkline
                values={[9, 9, 10, 10, 11, 11, 12, 12]}
                color="var(--chart-2)"
              />
            }
          />
          <MetricCard
            label="p95 latency"
            value={184}
            change={invert ? 0.124 : -0.031}
            invertTrend={invert}
            changeLabel="vs last week"
            format={{ suffix: "ms" }}
            icon={<ClockIcon />}
          />
          <MetricCard
            label="Onboarding rate"
            value={67.1}
            change={0.02}
            changeLabel="vs last month"
            format={{ suffix: "%", precision: 1 }}
            icon={<TargetIcon />}
          />
        </div>
      </Section>

      <Section
        title="The trend is a claim about good and bad"
        description="Flipping this changes which direction is painted green, not which way the arrow points. That is the whole point: a churn spike and a revenue dip look identical as a percentage, and they are opposites."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            Sentiment of an increase
          </span>
          <Toggle active={!invert} onClick={() => setInvert(false)}>
            increase is good
          </Toggle>
          <Toggle active={invert} onClick={() => setInvert(true)}>
            increase is bad
          </Toggle>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Revenue"
            value={48210}
            change={0.124}
            invertTrend={invert}
            changeLabel="vs last month"
          />
          <MetricCard
            label="Churn"
            value={3.2}
            change={0.061}
            invertTrend={!invert}
            changeLabel="vs last month"
            format={{ suffix: "%" }}
          />
          <MetricCard
            label="Error rate"
            value={0.4}
            change={0}
            changeLabel="unchanged"
            format={{ suffix: "%" }}
          />
        </div>
      </Section>

      <Section
        title="Three sizes"
        description="The value reserves its line box, so a tile does not resize when a number momentarily becomes an em dash or when a live count ticks over."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          {(["sm", "md", "lg"] as const).map((value) => (
            <Toggle
              key={value}
              active={size === value}
              onClick={() => setSize(value)}
            >
              {value}
            </Toggle>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["sm", "md", "lg"] as const).map((value) => (
            <MetricCard
              key={value}
              size={value}
              label={`Conversion rate (${value})`}
              value={18.4}
              change={0.042}
              changeLabel="vs last month"
              format={{ suffix: "%" }}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Composed by hand"
        description="The card is a default composition, not a sealed box. Every part is exported, and a card can be assembled in a different order — the label above the value, the footer anywhere."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* The parts are exported on their own, so a tile can be put together
              in a different order — the value first, the label under it — which
              is the one thing a sealed card component can never let you do. */}
          <div
            className={cn(
              metricCardVariants({ variant: "panel", size: "md" }),
              "gap-1",
            )}
          >
            <MetricCardValue value={98240} format={{ prefix: "$" }} />
            <MetricCardLabel>Composed manually, value first</MetricCardLabel>
            <MetricCardTrend change={0.18} changeLabel="this quarter" />
            <MetricCardChart>
              <Sparkline values={[40, 48, 44, 61, 72, 70, 88, 98]} />
            </MetricCardChart>
            <MetricCardFooter>Updated 4 minutes ago</MetricCardFooter>
          </div>

          {/* A value that is not a number renders as given, and the reserved
              line box means the tile below it does not move. */}
          <MetricCard
            label="Open invoices"
            value="—"
            change={0}
            changeLabel="No change"
            footer="Nothing is overdue"
          />
        </div>
      </Section>

      <Section
        title="Variants"
        description="`panel` is the product card. `plain` drops the border for a card that already sits inside another surface."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-3">
            {(["panel", "plain"] as const).map((variant) => (
              <MetricCard
                key={variant}
                variant={variant}
                label={variant}
                value={1240}
                change={0.02}
                className={metricCardVariants({ variant: "panel" })}
              />
            ))}
          </div>
          <div className="grid gap-3">
            {(["start", "center", "end"] as const).map((align) => (
              <MetricCard
                key={align}
                align={align}
                label={`align: ${align}`}
                value={1240}
                change={0.02}
              />
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
