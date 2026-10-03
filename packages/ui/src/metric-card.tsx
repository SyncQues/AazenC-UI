"use client";

/**
 * The KPI tile a dashboard is made of.
 *
 * This is the thing a reader looks at a hundred times a day, so it has to be the
 * fastest thing on the page to parse: label, value, trend, context. Everything
 * here is in service of that order, and of not moving when the number updates.
 *
 * Two rules the rest of the repo does not have to worry about, and this does:
 *
 * The trend is coloured by sentiment, not by sign. Revenue going up is good;
 * latency going up is a page. `invertTrend` is how a metric declares which side
 * of the line it lives on, and getting it wrong is worse than not colouring at
 * all — a dashboard that paints a churn spike green is actively lying.
 *
 * The trend is never signalled by colour alone. The arrow and the `+`/`-` carry
 * the meaning and the colour only agrees with them, which is what keeps the tile
 * readable for the one reader in eight who cannot tell red from green, and for
 * every reader on a screen in sunlight.
 *
 * The value never reflows. `tabular-nums` stops the digits from changing width
 * between `1,284` and `1,285`, and a min-height per size stops the whole tile
 * from resizing when the value slot holds a node with a different line box — in
 * a grid, one tile growing pushes every tile under it.
 *
 * One entrance, on by default: the card rises, its parts settle top to bottom,
 * the graph draws last. It runs on *mount*; `enter="none"` is the off switch.
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  createContext,
  useContext,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import { cardVariants } from "./card-variants";
import {
  formatChartValue,
  formatDelta,
  type ChartFormatOptions,
} from "./chart-utils";

/* ------------------------------------------------------------------ recipes -- */

export type MetricCardSize = "sm" | "md" | "lg";
export type MetricCardAlign = "start" | "center" | "end";
export type MetricCardEnter = "rise" | "none";
export type MetricCardTrendDirection = "up" | "down" | "flat";
export type MetricCardTrendTone = "positive" | "negative" | "neutral";

/**
 * Card's chrome, including the hover.
 *
 * The base is Card's plain reset — the radius, the overflow, the foreground,
 * the fade. The panel then restates Card's default surface, including the same
 * lift: a short rise and a deeper shadow. `interactive` only adds the pointer,
 * the focus ring, and the press, because a tile you cannot activate should
 * still feel like the card it is.
 */
const metricCardVariants = cva(
  [
    cardVariants({ variant: "plain", interactive: false }),
    "flex min-w-0 flex-col",
  ],
  {
    variants: {
      variant: {
        panel:
          "border border-border bg-card shadow-sm transition-[translate,scale,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:translate-none motion-reduce:scale-none",
        plain: "bg-transparent",
      },
      size: {
        sm: "gap-1.5 p-3",
        md: "gap-2 p-4",
        lg: "gap-2.5 p-6",
      },
      align: {
        start: "text-left",
        center: "text-center",
        end: "text-end",
      },
      interactive: {
        true: "cursor-pointer transition-[translate,scale,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.985] motion-reduce:translate-none motion-reduce:scale-none",
        false: "",
      },
      /**
       * The mount entrance. Both values carry `!`: the base inherits Card's
       * `animate-fade-in`, and two `animation` declarations is stylesheet order.
       */
      enter: {
        rise: "metric-card-in! metric-card-parts-in",
        // `animate-none`, not an empty string: `none` has to cancel the fade the
        // base already applies, so "off" never means "a gentler fade".
        none: "animate-none!",
      },
    },
    defaultVariants: {
      variant: "panel",
      size: "md",
      align: "start",
      interactive: false,
      enter: "rise",
    },
  },
);

/**
 * Label weight, not size, does the work. Every tile on a dashboard is scanned
 * for its value first, so four label sizes on one screen is four things to
 * compare before the number.
 */
const metricLabelSizeClass: Record<MetricCardSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
};

/**
 * The value's line box, reserved explicitly. `leading-none` already gives the
 * digits a fixed height, so this is belt and braces for the node a caller drops
 * in with its own line height — and it is what stops the tile from jumping when
 * a number is momentarily unavailable and renders as an em dash.
 */
const metricValueSizeClass: Record<MetricCardSize, string> = {
  sm: "text-2xl min-h-6",
  md: "text-3xl min-h-[1.875rem]",
  lg: "text-4xl min-h-9",
};

/**
 * `--success-foreground` rather than `--success`: the plain token is tuned as a
 * fill, and as text it is a wash on the card. The dark-mode red is the one
 * `button-variants` already reaches for, because `--destructive` is a deep red
 * that disappears into a near-black card.
 */
const metricTrendToneClass: Record<MetricCardTrendTone, string> = {
  positive: "text-success-foreground",
  negative: "text-destructive dark:text-[oklch(0.78_0.16_25)]",
  neutral: "text-muted-foreground",
};

/** The header well, borrowed from Alert's icon box rather than invented again. */
const metricIconWellClass =
  "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

/* ------------------------------------------------------------------- trend -- */

/** Direction and sentiment, resolved together: they are not the same axis. */
function resolveTrend(
  change: number,
  invert: boolean,
): { direction: MetricCardTrendDirection; tone: MetricCardTrendTone } {
  if (!Number.isFinite(change) || change === 0)
    return { direction: "flat", tone: "neutral" };
  const up = change > 0;
  return {
    direction: up ? "up" : "down",
    tone: (invert ? !up : up) ? "positive" : "negative",
  };
}

/**
 * The arrow. Decorative on purpose — `formatDelta` already prints the sign, and
 * a screen reader that hears both says "plus twelve point four percent" twice.
 *
 * Zero gets a dash rather than an up or a down: a metric sitting exactly on its
 * previous value has no direction, and an arrow that flickers between up and
 * down as the number rounds is noise.
 */
function MetricTrendIcon({
  direction,
}: {
  direction: MetricCardTrendDirection;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5 shrink-0"
    >
      {direction === "up" ? (
        <path d="M12 19V6m0 0-5.5 5.5M12 6l5.5 5.5" />
      ) : direction === "down" ? (
        <path d="M12 5v13m0 0 5.5-5.5M12 18l-5.5-5.5" />
      ) : (
        <path d="M6 12h12" />
      )}
    </svg>
  );
}

/**
 * A number is formatted as a full grouped figure, never compacted: this is the
 * number people read out loud in a standup, and a KPI that says `1.3K` has
 * thrown away the thing it exists to say. `precision` is 2 because the card has
 * room — the same reasoning `formatTooltipValue` uses.
 */
function formatMetricValue(
  value: number,
  format: ChartFormatOptions | undefined,
): string {
  return formatChartValue(value, { precision: 2, ...format });
}

/* ---------------------------------------------------------------- the parts -- */

const MetricCardSizeContext = createContext<MetricCardSize>("md");

export interface MetricCardHeaderProps extends Omit<
  ComponentProps<"div">,
  "className"
> {
  /** Sits in a muted well at the head of the row, like an Alert's icon box. */
  icon?: ReactNode;
  className?: string;
}

export type MetricCardLabelProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
};

export type MetricCardValueProps = Omit<
  ComponentProps<"div">,
  "className" | "children"
> & {
  /** A number is formatted; anything else is rendered as given. */
  value: ReactNode | number;
  /** Overrides the default formatting for a numeric value. */
  format?: ChartFormatOptions;
  size?: MetricCardSize;
  className?: string;
};

export interface MetricCardTrendProps extends Omit<
  ComponentProps<"div">,
  "className" | "children"
> {
  /** A previous-period delta as a fraction: `0.124` renders `+12.4%`. */
  change?: number;
  /** A preformatted string in place of the delta — the escape hatch for a change
   *  that is not a percentage, like "+3 seats" or "unchanged". */
  trend?: ReactNode;
  /** "vs last month". Muted, and never part of the number. */
  changeLabel?: ReactNode;
  /** Flips the good/bad mapping for the metrics where down is the good news:
   *  cost, latency, churn, error rate. */
  invertTrend?: boolean;
  /** Decimal places on the delta. */
  precision?: number;
  className?: string;
}

export type MetricCardFooterProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
};

export type MetricCardChartProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
};

export interface MetricCardProps
  extends
    Omit<ComponentProps<"div">, "className" | "children" | "onClick">,
    VariantProps<typeof metricCardVariants> {
  label: ReactNode;
  value: ReactNode | number;
  /** A previous-period delta as a fraction (0.124 → +12.4%). Use `trend` only
   *  if you are passing a preformatted string instead. */
  change?: number;
  /** A preformatted string in place of the delta. */
  trend?: ReactNode;
  changeLabel?: ReactNode;
  /** Inverts the good/bad colour mapping. Cost metrics go down when they are
   *  good; latency, churn, and error rate do too. */
  invertTrend?: boolean;
  /** An icon in the header well. */
  icon?: ReactNode;
  /** Renders under the value. */
  footer?: ReactNode;
  /** A sparkline slot. A `<Sparkline>` does not exist yet — accept a ReactNode
   *  so callers can drop one in later. The slot passes its own cascade beat to
   *  the graph inside it as `--chart-delay`. */
  chart?: ReactNode;
  /** Overrides the default formatting for a numeric value. */
  format?: ChartFormatOptions;
  /** The mount entrance: `rise` (default) or `none`. Re-declared without the
   *  `null` cva allows, for the same reason `size` is. */
  enter?: MetricCardEnter;
  /** Re-declared without the `null` cva allows, because a null size has to
   *  resolve to the default rather than reach a lookup keyed on it. */
  size?: MetricCardSize;
  /** Render the card as this child — an `<a>` or a `<button>`. */
  asChild?: boolean;
  /** Replaces the composed body, and — with `asChild` — is the element the card
   *  renders as. */
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

function MetricCard({
  label,
  value,
  change,
  trend,
  changeLabel,
  invertTrend = false,
  icon,
  footer,
  chart,
  format,
  size = "md",
  align = "start",
  variant,
  interactive = false,
  enter = "rise",
  asChild = false,
  onClick,
  className,
  children,
  ...props
}: MetricCardProps) {
  const Comp = asChild ? Slot : "div";
  // A card that can be clicked should not need a second prop to look like it.
  // `asChild` counts too: the caller has said this tile is a link.
  const clickable = asChild || Boolean(onClick);
  const lifted = interactive || clickable;

  // A plain `div` with a click handler is not a button until it says so and
  // answers the keyboard. `asChild` is exempt: the child is a real control and
  // already does both.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Space scrolls the page, and on a role="button" it has to activate.
    event.preventDefault();
    onClick?.();
  };

  const composed = (
    <>
      <MetricCardHeader icon={icon}>
        <MetricCardLabel>{label}</MetricCardLabel>
      </MetricCardHeader>
      <MetricCardValue value={value} format={format} />
      {change !== undefined || trend !== undefined ? (
        <MetricCardTrend
          change={change}
          trend={change === undefined ? trend : undefined}
          changeLabel={changeLabel}
          invertTrend={invertTrend}
        />
      ) : null}
      {chart ? <MetricCardChart>{chart}</MetricCardChart> : null}
      {footer ? <MetricCardFooter>{footer}</MetricCardFooter> : null}
    </>
  );

  return (
    <MetricCardSizeContext.Provider value={size}>
      <Comp
        data-slot="metric-card"
        data-size={size}
        data-variant={variant ?? "panel"}
        data-enter={enter}
        role={asChild ? undefined : onClick ? "button" : undefined}
        tabIndex={asChild || !onClick ? undefined : 0}
        onClick={onClick}
        onKeyDown={asChild ? undefined : handleKeyDown}
        className={cn(
          metricCardVariants({ variant, size, align, interactive: lifted, enter }),
          className,
        )}
        {...props}
      >
        {/* With `asChild` the children *are* the element to render as, so there
            is no composed body left to slot in — and only `asChild` means that.
            A card with a click handler and no `asChild` still gets its body. */}
        {asChild ? children : (children ?? composed)}
      </Comp>
    </MetricCardSizeContext.Provider>
  );
}

function MetricCardHeader({
  icon,
  className,
  children,
  ...props
}: MetricCardHeaderProps) {
  return (
    <div
      data-slot="metric-card-header"
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      {icon ? <span className={metricIconWellClass}>{icon}</span> : null}
      {children}
    </div>
  );
}

function MetricCardLabel({
  className,
  children,
  ...props
}: MetricCardLabelProps) {
  const size = useContext(MetricCardSizeContext);
  return (
    <div
      data-slot="metric-card-label"
      className={cn(
        "min-w-0 font-medium text-muted-foreground text-pretty",
        metricLabelSizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function MetricCardValue({
  value,
  format,
  size,
  className,
  ...props
}: MetricCardValueProps) {
  const inherited = useContext(MetricCardSizeContext);
  const resolved = size ?? inherited;
  return (
    <div
      data-slot="metric-card-value"
      className={cn(
        // The size comes FIRST. tailwind-merge treats a font-size class as
        // conflicting with every `leading-*` written after it, so a `leading-none`
        // in the same argument is deleted, the value falls back to the theme's
        // line height for its size, and the min-height above stops meaning
        // anything.
        metricValueSizeClass[resolved],
        // `tabular-nums` is the rest of the reflow story: proportional digits
        // make the number change width four times a second as a live count ticks.
        "min-w-0 font-semibold leading-none tracking-tight tabular-nums",
        className,
      )}
      {...props}
    >
      {typeof value === "number" ? formatMetricValue(value, format) : value}
    </div>
  );
}

function MetricCardTrend({
  change,
  trend,
  changeLabel,
  invertTrend = false,
  precision = 1,
  className,
  ...props
}: MetricCardTrendProps) {
  const numeric = typeof change === "number" && Number.isFinite(change);
  const { direction, tone } = resolveTrend(numeric ? change : 0, invertTrend);

  return (
    <div
      data-slot="metric-card-trend"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium",
        className,
      )}
      {...props}
    >
      {/* A preformatted string carries its own sign, so the arrow is dropped
          rather than guessed out of free text, and the tone stays neutral:
          reading a sentiment out of "+3 seats" is how a metric ends up coloured
          backwards. */}
      <span
        className={cn(
          "inline-flex items-center gap-1 tabular-nums",
          numeric ? metricTrendToneClass[tone] : "text-muted-foreground",
        )}
      >
        {numeric ? <MetricTrendIcon direction={direction} /> : null}
        {numeric ? formatDelta(change, precision) : trend}
      </span>
      {changeLabel ? (
        <span className="min-w-0 truncate text-xs font-normal text-muted-foreground">
          {changeLabel}
        </span>
      ) : null}
    </div>
  );
}

function MetricCardChart({
  className,
  children,
  style,
  ...props
}: MetricCardChartProps) {
  return (
    <div
      data-slot="metric-card-chart"
      className={cn(
        // A bare `<svg>` sparkline is the expected drop-in, so it is made to
        // fill the slot the same way `chartPlotVariants` makes a plot fill its
        // frame. Without this a sparkline renders at its 100×30 default.
        "min-w-0 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
        className,
      )}
      style={
        {
          // The slot's own beat, passed to the graph: every reveal utility takes
          // its offset from `--chart-delay`. A caller's `style` lands after this.
          "--chart-delay": "calc(var(--duration-stagger) * 3)",
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

function MetricCardFooter({
  className,
  children,
  ...props
}: MetricCardFooterProps) {
  return (
    <div
      data-slot="metric-card-footer"
      className={cn("min-w-0 text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  MetricCard,
  MetricCardChart,
  MetricCardFooter,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardTrend,
  MetricCardValue,
  metricCardVariants,
};
