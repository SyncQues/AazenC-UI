"use client";

/**
 * The frame every chart on a dashboard sits in.
 *
 * SyncQues has a thirty line "ChartContainer": an `<h3>`, a spinner, an error
 * string, and the plot. It has no state for "loaded but empty", nowhere to put a
 * range picker, nowhere to put a legend, and it hardcodes the heading tag — so
 * every page that wanted one of those forked it, and there are four of them in
 * the app. This is the one that does not get forked.
 *
 * The state layer is the point. `loading > error > empty > children` is decided
 * once, here, in that order, and it is not a decision a call site is allowed to
 * make: a chart that paints an empty state over a failed query is hiding the one
 * thing the reader came to the page for.
 *
 * The loading state is a shimmer the height of a real plot rather than a
 * collapsed body. A dashboard that reflows when its data lands is the most
 * common complaint about dashboards, and it is free to avoid here.
 *
 * Padding lives on the parts, not on the box, for the same reason it does in
 * `card.tsx`: the container draws the border and the shadow, and a `p-6` on the
 * box plus a `pt-6` on the body is 48px of air under a title.
 */

import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@aazenc/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { ToneIcon } from "./tone-icon";
import { staggerStyle } from "./chart-primitives";
import {
  chartBodyVariants,
  chartContainerVariants,
  chartDescriptionVariants,
  chartHeaderVariants,
  chartStateTitleVariants,
  chartStateVariants,
  chartTitleVariants,
  type ChartContainerVariantProps,
  type ChartStateVariantProps,
} from "./chart-variants";

/* ------------------------------------------------------------------ recipes -- */

export type ChartContainerPadding = NonNullable<
  ChartContainerVariantProps["padding"]
>;
export type ChartContainerStateSize = NonNullable<
  ChartStateVariantProps["size"]
>;
export type ChartContainerTitleLevel = 2 | 3 | 4 | 5;

/** Heading level to element, so the title is not stuck at `<h3>`. */
const CHART_CONTAINER_HEADING_TAGS = {
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
} as const;

/**
 * The padding contract, mirroring `cardPaddingClass` — including the collapse
 * rule, which is why this cannot just be that record: card's collapse keys on
 * `[data-slot=card-header]`, and these are chart parts.
 *
 * The body keeps its own top padding (`chartBodyVariants`) and drops it when a
 * header is directly above, so the two boxes never stack a double gap. The
 * collapse is a sibling selector rather than a prop because a header can be
 * added or removed by a consumer composing the parts by hand, and the padding
 * should not have to be re-threaded when that happens.
 */
const chartContainerPaddingClass: Record<
  ChartContainerPadding,
  { header: string; body: string; footer: string }
> = {
  none: { header: "p-0", body: "p-0", footer: "p-0" },
  sm: {
    header: "p-4",
    body: "px-4 pb-4 [[data-slot=chart-container-header]+&]:pt-0",
    footer:
      "px-4 pb-4 [[data-slot=chart-container-header]+&]:pt-0 [[data-slot=chart-container-body]+&]:pt-0",
  },
  lg: {
    header: "p-6",
    body: "px-6 pb-6 [[data-slot=chart-container-header]+&]:pt-0",
    footer:
      "px-6 pb-6 [[data-slot=chart-container-header]+&]:pt-0 [[data-slot=chart-container-body]+&]:pt-0",
  },
};

/** The title and description are one column; only the actions go to the right. */
const chartContainerTitleBlockClass = "flex min-w-0 flex-1 flex-col gap-1";

/** One dashed frame for both non-plot states, so they read as the same event. */
const chartStateFrameClass = "h-full w-full rounded-lg border border-dashed";

/**
 * Round, not Empty's `rounded-lg` square: this is a 36px badge inside a dashed
 * frame, and a rounded square at that size reads as a broken glyph. The well
 * stays muted in every state so the frame's message is the loud thing.
 */
const chartStateWellClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0";

/** Stamped on ChartContainerFooter so the container can hoist it, Alert-style. */
const CHART_CONTAINER_PART = "aazencChartContainerPart";

/**
 * The mark, the sentence, and the action arrive in that order, each a beat after
 * the frame. The frame already owns the cross-fade, so these only add the small
 * rise — layered on top they read as a block assembling rather than four things
 * appearing at once, which is the difference between a state and a glitch.
 *
 * Reuses `chart-reveal-in` and its `--chart-delay` rather than a second
 * keyframe: the motion is identical, only the start time differs. The delays
 * stay well inside `--duration-enter` so the last part still lands with the
 * frame rather than after it.
 */
const statePartDelays: Record<0 | 1 | 2, string> = {
  0: "40ms",
  1: "90ms",
  2: "140ms",
};

/* ------------------------------------------------------------------- state -- */

type ChartContainerState = "ready" | "loading" | "error" | "empty";

/**
 * The default empty mark: a baseline with a dashed line where the series would
 * be. Axes with no series read as a broken chart; a drawn series reads as "there
 * is data here". A dashed line says neither, which is the truth.
 */
function ChartEmptyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  );
}

/**
 * Waiting, at the size the plot will be.
 *
 * The shimmer is an absolutely positioned layer rather than a skeleton's worth
 * of grey blocks on purpose: it tells the reader "a chart is coming" instead of
 * "here are some lines", and it costs one div. The block behind it is the height
 * of a real plot, so nothing below the card moves when the data lands.
 */
function ChartContainerLoading({
  stateSize,
  label,
}: {
  stateSize: ChartContainerStateSize;
  label: string;
}) {
  return (
    <div
      data-slot="chart-container-loading"
      role="status"
      className={cn(
        chartStateVariants({ size: stateSize }),
        chartStateFrameClass,
        "overflow-hidden",
      )}
    >
      {/* The utility already carries the motion-reduce kill switch, so there is
          nothing to guard here. */}
      <div aria-hidden="true" className="chart-shimmer absolute inset-0" />
      {/* Positioned so it paints above the shimmer: an unpositioned flex item
          sits below any positioned sibling, and the spinner would vanish. */}
      <span
        className="chart-reveal-in relative inline-flex"
        style={staggerStyle(statePartDelays[0])}
      >
        <Spinner size="lg" />
      </span>
      {/* `aria-busy` alone tells assistive tech the region is busy; it does not
          say what is coming. This is the sentence that fills the silence. */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function resolveErrorMessage(
  error: ReactNode | Error | undefined,
): ReactNode {
  if (typeof error === "string" || typeof error === "number") return error;
  if (error instanceof Error) return error.message;
  return error;
}

/**
 * A failed query, said in the tone the state system already owns rather than in
 * a bespoke red box. `role="alert"` because the failure arrived after the page
 * painted: a reader who is not looking at the plot is exactly the reader who
 * needs to be interrupted.
 */
function ChartContainerError({
  error,
  onRetry,
  stateSize,
}: {
  error: ReactNode | Error | undefined;
  onRetry?: () => void;
  stateSize: ChartContainerStateSize;
}) {
  const message = resolveErrorMessage(error);

  return (
    <div
      data-slot="chart-container-error"
      role="alert"
      className={cn(
        chartStateVariants({ size: stateSize }),
        chartStateFrameClass,
        "border-destructive/40",
      )}
    >
      <span
        className={cn(
          chartStateWellClass,
          "chart-reveal-in bg-destructive/10 text-destructive [&_svg]:size-4",
        )}
        style={staggerStyle(statePartDelays[0])}
      >
        <ToneIcon tone="destructive" />
      </span>
      <p
        className={cn(
          chartStateTitleVariants({ tone: "destructive" }),
          "chart-reveal-in text-sm text-balance",
        )}
        style={staggerStyle(statePartDelays[1])}
      >
        {message ?? "This chart could not be loaded."}
      </p>
      {/* No Retry without a handler. A button that re-renders the same failed
          state teaches people that buttons lie. The wrapper carries the enter
          because `Button` deliberately does not take a className. */}
      {onRetry ? (
        <span
          className="chart-reveal-in"
          style={staggerStyle(statePartDelays[2])}
        >
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </span>
      ) : null}
    </div>
  );
}

function ChartContainerEmpty({
  empty,
  emptyIcon,
  stateSize,
}: {
  empty: ReactNode | undefined;
  emptyIcon: ReactNode | undefined;
  stateSize: ChartContainerStateSize;
}) {
  return (
    <div
      data-slot="chart-container-empty"
      className={cn(
        chartStateVariants({ size: stateSize }),
        chartStateFrameClass,
      )}
    >
      {empty ?? (
        <>
          <span
            className={cn(chartStateWellClass, "chart-reveal-in")}
            style={staggerStyle(statePartDelays[0])}
          >
            {emptyIcon ?? <ChartEmptyIcon />}
          </span>
          <span
            className={cn(
              chartStateTitleVariants({ tone: "neutral" }),
              "chart-reveal-in text-sm",
            )}
            style={staggerStyle(statePartDelays[1])}
          >
            No data to show
          </span>
          <span
            className="chart-reveal-in text-xs text-muted-foreground"
            style={staggerStyle(statePartDelays[2])}
          >
            Widen the range or clear the filters.
          </span>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- composition -- */

const ChartContainerPaddingContext = createContext<ChartContainerPadding>("lg");

/** Only the values React actually renders as nothing. `0` is a reading. */
function rendersNothing(child: ReactNode): boolean {
  return (
    child === null ||
    child === undefined ||
    typeof child === "boolean" ||
    child === ""
  );
}

/**
 * Pull the footers out of `children` and leave the plot behind.
 *
 * The legend is chrome, not plot: it has to sit below the body with the
 * container's padding, and it has to keep sitting there while the body is a
 * shimmer, or the card changes height when the data lands. Hoisting it is the
 * same trade `Alert` makes with its actions — including looking through a
 * fragment, so a footer wrapped in `<>…</>` still hoists.
 */
function splitChartContainerChildren(children: ReactNode): {
  body: ReactNode[];
  footers: ReactNode[];
} {
  const body: ReactNode[] = [];
  const footers: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isChartContainerFooter(child)) {
      footers.push(child);
      return;
    }
    if (isValidElement(child) && child.type === Fragment) {
      const nested = splitChartContainerChildren(
        (child.props as { children?: ReactNode }).children,
      );
      body.push(...nested.body);
      footers.push(...nested.footers);
      return;
    }
    if (rendersNothing(child)) return;
    body.push(child);
  });

  return { body, footers };
}

function isChartContainerFooter(child: ReactNode): boolean {
  if (!isValidElement(child)) return false;
  if (partOf(child.type) === "footer") return true;
  // Also honour a hand-rolled <div data-slot="chart-container-footer">.
  return (
    (child.props as { "data-slot"?: string })["data-slot"] ===
    "chart-container-footer"
  );
}

// `child.type` is a JSX constructor, which TS will not index.
function partOf(type: unknown): string | undefined {
  if (typeof type !== "function") return undefined;
  const flag = (type as unknown as Record<string, unknown>)[
    CHART_CONTAINER_PART
  ];
  return typeof flag === "string" ? flag : undefined;
}

/* ----------------------------------------------------------------- the parts -- */

export interface ChartContainerHeaderProps
  extends
    Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof chartHeaderVariants> {
  className?: string;
}

export interface ChartContainerTitleProps
  extends
    Omit<ComponentProps<"h3">, "className">,
    VariantProps<typeof chartTitleVariants> {
  /** Heading level. Card hardcodes `<h3>`; a chart inside a panel has to be
   *  able to say `<h4>` or the document outline is fiction. */
  level?: ChartContainerTitleLevel;
  className?: string;
}

export interface ChartContainerDescriptionProps
  extends
    Omit<ComponentProps<"p">, "className">,
    VariantProps<typeof chartDescriptionVariants> {
  className?: string;
}

export type ChartContainerActionsProps = Omit<
  ComponentProps<"div">,
  "className"
> & {
  className?: string;
};

export interface ChartContainerBodyProps
  extends
    Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof chartBodyVariants> {
  className?: string;
}

export interface ChartContainerFooterProps extends Omit<
  ComponentProps<"div">,
  "className"
> {
  align?: "start" | "center" | "end";
  className?: string;
}

export interface ChartContainerProps
  extends
    Omit<ComponentProps<"div">, "className" | "children" | "title">,
    VariantProps<typeof chartContainerVariants> {
  title?: ReactNode;
  description?: ReactNode;
  /** Rendered at the right of the header — a range picker, a segmented filter. */
  actions?: ReactNode;
  /** One of these decides what the body shows. They are mutually exclusive in
   *  order: loading > error > empty > children. */
  loading?: boolean;
  error?: ReactNode | Error;
  onRetry?: () => void;
  /** Show the empty state when children is null/undefined. */
  isEmpty?: boolean;
  /** Overrides the built-in empty block wholesale. */
  empty?: ReactNode;
  /** The mark in the empty state's well. */
  emptyIcon?: ReactNode;
  /** Re-declared without the `null` cva allows, because a null padding has to
   *  resolve to the default rather than reach a lookup keyed on it. */
  padding?: ChartContainerPadding;
  titleSize?: "sm" | "md";
  titleLevel?: ChartContainerTitleLevel;
  /** The plot area. */
  children?: ReactNode;
  className?: string;
}

function ChartContainer({
  variant,
  padding = "lg",
  height,
  title,
  titleSize = "sm",
  titleLevel = 3,
  description,
  actions,
  loading = false,
  error,
  onRetry,
  isEmpty = false,
  empty,
  emptyIcon,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const { body, footers } = splitChartContainerChildren(children);

  const failed = error !== undefined && error !== null && error !== false;
  // Emptiness is decided after the footers are hoisted, so a container whose
  // only child is a legend is empty rather than a legend with no chart.
  const hasPlot = body.length > 0;
  const state: ChartContainerState = loading
    ? "loading"
    : failed
      ? "error"
      : isEmpty || !hasPlot
        ? "empty"
        : "ready";

  const hasHeader =
    title !== undefined || description !== undefined || actions !== undefined;

  // One size for all three states, so a shimmer, a failure, and an empty result
  // are the same height as each other and as the plot they stand in for.
  const stateSize: ChartContainerStateSize = "md";

  function renderBody(): ReactNode {
    if (state === "loading") {
      return (
        <ChartContainerLoading
          stateSize={stateSize}
          label={
            typeof title === "string" ? `Loading ${title}` : "Loading chart"
          }
        />
      );
    }
    if (state === "error") {
      return (
        <ChartContainerError error={error} onRetry={onRetry} stateSize={stateSize} />
      );
    }
    if (state === "empty") {
      return (
        <ChartContainerEmpty
          empty={empty}
          emptyIcon={emptyIcon}
          stateSize={stateSize}
        />
      );
    }
    return body;
  }

  return (
    <ChartContainerPaddingContext.Provider value={padding}>
      <div
        data-slot="chart-container"
        data-variant={variant ?? "panel"}
        data-state={state}
        data-padding={padding}
        aria-busy={loading}
        className={cn(
          // Padding is handed to the parts, so the box itself is unpadded.
          chartContainerVariants({ variant, padding: "none", height }),
          className,
        )}
        {...props}
      >
        {hasHeader ? (
          <ChartContainerHeader>
            <div className={chartContainerTitleBlockClass}>
              {title !== undefined && title !== null ? (
                <ChartContainerTitle size={titleSize} level={titleLevel}>
                  {title}
                </ChartContainerTitle>
              ) : null}
              {description ? (
                <ChartContainerDescription>
                  {description}
                </ChartContainerDescription>
              ) : null}
            </div>
            {actions ? (
              <ChartContainerActions>{actions}</ChartContainerActions>
            ) : null}
          </ChartContainerHeader>
        ) : null}
        {/* A state block brings its own padding, so the body hands its own over
            to it. The dashed frame's content then lands exactly where the plot's
            content would have. */}
        <ChartContainerBody padding={state === "ready" ? padding : "none"}>
          {renderBody()}
        </ChartContainerBody>
        {footers.length > 0 ? footers : null}
      </div>
    </ChartContainerPaddingContext.Provider>
  );
}

function ChartContainerHeader({
  layout,
  className,
  children,
  ...props
}: ChartContainerHeaderProps) {
  const padding = useContext(ChartContainerPaddingContext);
  return (
    <div
      data-slot="chart-container-header"
      className={cn(
        chartHeaderVariants({ layout }),
        chartContainerPaddingClass[padding].header,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ChartContainerTitle({
  size,
  level = 3,
  className,
  children,
  ...props
}: ChartContainerTitleProps) {
  const Heading = CHART_CONTAINER_HEADING_TAGS[level];
  return (
    <Heading
      data-slot="chart-container-title"
      className={cn(
        chartTitleVariants({ size }),
        // Re-asserted because tailwind-merge deletes the cva's own `leading-none`:
        // it treats a font-size class as conflicting with every `leading-*` that
        // follows it, and `chartTitleVariants` ends on a `text-*`. A title is one
        // line and should measure like one. Written last so it is the survivor.
        "leading-none",
        className,
      )}
      {...props}
    >
      {children}
    </Heading>
  );
}

function ChartContainerDescription({
  size,
  className,
  children,
  ...props
}: ChartContainerDescriptionProps) {
  return (
    <p
      data-slot="chart-container-description"
      className={cn(chartDescriptionVariants({ size }), className)}
      {...props}
    >
      {children}
    </p>
  );
}

function ChartContainerActions({
  className,
  children,
  ...props
}: ChartContainerActionsProps) {
  return (
    <div
      data-slot="chart-container-actions"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ChartContainerBody({
  padding,
  className,
  children,
  ...props
}: ChartContainerBodyProps) {
  const inherited = useContext(ChartContainerPaddingContext);
  const resolved = padding ?? inherited;
  return (
    <div
      data-slot="chart-container-body"
      className={cn(
        chartBodyVariants({ padding: resolved }),
        chartContainerPaddingClass[resolved].body,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ChartContainerFooter({
  align = "start",
  className,
  children,
  ...props
}: ChartContainerFooterProps) {
  const padding = useContext(ChartContainerPaddingContext);
  return (
    <div
      data-slot="chart-container-footer"
      className={cn(
        chartContainerPaddingClass[padding].footer,
        align === "center"
          ? "flex justify-center"
          : align === "end"
            ? "flex justify-end"
            : "flex justify-start",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Read by `splitChartContainerChildren` so a footer can be hoisted without a cycle. */
Object.assign(ChartContainerFooter, { [CHART_CONTAINER_PART]: "footer" });

export {
  ChartContainer,
  ChartContainerActions,
  ChartContainerBody,
  ChartContainerDescription,
  ChartContainerFooter,
  ChartContainerHeader,
  ChartContainerTitle,
  chartContainerVariants,
};
