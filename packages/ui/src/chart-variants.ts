import { cva, type VariantProps } from "class-variance-authority";

/**
 * Chart chrome. Geometry lives in `chart-utils`; this file is only the painted
 * box around it — the frame, the header, the axis, the tooltip, the legend.
 *
 * A charting library ships one tooltip look and one legend look and asks you to
 * override them with a `contentStyle` object. Every consumer overrides it the
 * same way, with the same three declarations, and none of it survives a theme
 * change. Here the tokens are already in the classes, so the tooltip is correct
 * in light, dark, and every palette for free.
 */

export const chartContainerVariants = cva(
  "bg-card text-card-foreground flex w-full min-w-0 flex-col",
  {
    variants: {
      variant: {
        /** The product panel — the same chrome as Card, so a chart can drop into
         *  a dashboard grid without looking bolted on. */
        panel: "border border-border rounded-lg shadow-sm overflow-hidden",
        /** No box. For a chart that already sits inside a card or a table cell. */
        bare: "border-0 bg-transparent shadow-none rounded-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        lg: "p-6",
      },
      /** Grow to the height of the grid cell instead of hugging the chart. */
      height: {
        auto: "",
        full: "h-full",
      },
    },
    defaultVariants: {
      variant: "panel",
      padding: "lg",
      height: "auto",
    },
  },
);

export const chartHeaderVariants = cva(
  "flex min-w-0 items-start justify-between gap-3",
  {
    variants: {
      layout: {
        stack: "flex-col",
        row: "flex-row items-center",
      },
    },
    defaultVariants: {
      layout: "row",
    },
  },
);

/**
 * `leading-none` is repeated inside each size rather than sitting in the base
 * string. tailwind-merge declares `font-size` as conflicting with `leading`, so
 * a base `leading-none` followed by a `text-*` size class is deleted on the way
 * out through `cn` and never reaches the DOM. Size first and leading second,
 * inside the same variant, is the only ordering that survives merge.
 */
export const chartTitleVariants = cva(
  "min-w-0 truncate font-semibold tracking-tight",
  {
    variants: {
      size: {
        sm: "text-sm leading-none",
        md: "text-base leading-none",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export const chartDescriptionVariants = cva(
  "truncate text-xs text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

/** The body below the header. `min-h-0` is load-bearing: a flex child defaults
 *  to `min-height: auto`, so without it the plot refuses to shrink and the card
 *  grows past its grid cell. */
export const chartBodyVariants = cva("relative min-w-0 min-h-0 flex-1", {
  variants: {
    padding: {
      none: "",
      sm: "pt-4",
      lg: "pt-6",
    },
  },
  defaultVariants: {
    padding: "lg",
  },
});

/** The plot frame. `touch-action: none` stops the browser from scrolling the page
 *  when a finger drags across the plot while tracking a value. */
export const chartPlotVariants = cva(
  "relative min-w-0 select-none overflow-visible [&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
  {
    variants: {
      /** Show crosshair + value on hover, keyboard, or tap. */
      interactive: {
        true: "touch-none",
        false: "",
      },
    },
    defaultVariants: {
      interactive: true,
    },
  },
);

/**
 * A transparent hit layer that turns pointer events on the plot into a data
 * index. It sits above the marks so a thin line is still easy to grab, and it
 * is transparent so it never paints over the series.
 *
 * The focus ring is a `ring` and not an `outline` because this element is the
 * size of the whole plot: a ring draws inside those bounds and hugs the chart,
 * where an outline sits outside them and reads as belonging to the card. The
 * surface is the only focusable thing in a chart, so it has to be obvious.
 */
export const chartOverlayVariants = cva(
  "absolute inset-0 cursor-crosshair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
  {
    variants: {
      shape: {
        rect: "rounded-[inherit]",
        none: "",
      },
    },
    defaultVariants: {
      shape: "rect",
    },
  },
);

/**
 * Axis text. One color for both axes: an axis that changes tone by axis reads as
 * a second data channel, and there is only one.
 */
export const chartAxisLabelVariants = cva(
  "fill-muted-foreground text-[11px] leading-none",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      weight: "normal",
    },
  },
);

export const chartGridVariants = cva("", {
  variants: {
    style: {
      /** Horizontal only. The default — vertical rules on a time series add
       *  twelve more lines to read without adding information. */
      horizontal: "",
      both: "",
      none: "",
    },
    density: {
      normal: "opacity-60",
      subtle: "opacity-35",
    },
  },
  defaultVariants: {
    style: "horizontal",
    density: "normal",
  },
});

/**
 * The tooltip. `pointer-events-none` because it tracks the pointer: if it took
 * events it would flicker as the pointer crossed the gap between the plot and
 * the bubble.
 */
export const chartTooltipVariants = cva(
  "pointer-events-none absolute z-10 min-w-[9rem] max-w-[16rem] rounded-lg border border-border bg-popover/95 px-3 py-2 text-popover-foreground shadow-md backdrop-blur-sm",
  {
    variants: {
      /** Which corner the bubble anchors to, so the value never sits under the
       *  pointer or off the edge of the plot. */
      placement: {
        auto: "",
        top: "",
        bottom: "",
      },
      /** A11y-only content (the live region) drops the paint. */
      tone: {
        default: "",
        silent: "sr-only",
      },
    },
    defaultVariants: {
      placement: "auto",
      tone: "default",
    },
  },
);

export const chartTooltipTitleVariants = cva(
  "mb-1.5 text-xs font-medium text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-[11px]",
        md: "text-xs",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const chartTooltipRowVariants = cva(
  "flex items-center justify-between gap-4 text-xs leading-5",
  {
    variants: {
      emphasis: {
        normal: "",
        strong: "font-medium",
      },
    },
    defaultVariants: {
      emphasis: "normal",
    },
  },
);

export const chartLegendVariants = cva(
  "flex flex-wrap items-center gap-x-4 gap-y-1.5",
  {
    variants: {
      align: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        // `between` is here because a legend often has a total on its right —
        // "5 channels · 100%" — and `ChartContainerFooter` already offers the
        // same three positions, so a legend that cannot match them is a
        // workaround rather than a choice.
        between: "justify-between",
      },
      orientation: {
        horizontal: "flex-row flex-wrap",
        vertical: "flex-col items-start",
      },
    },
    defaultVariants: {
      align: "start",
      orientation: "horizontal",
    },
  },
);

/** A legend swatch. `size-*` on a box rather than a glyph, so it lines up with
 *  the text baseline at any font size. */
export const chartLegendItemVariants = cva(
  "text-muted-foreground inline-flex min-w-0 items-center gap-1.5 text-xs",
  {
    variants: {
      interactive: {
        true: "cursor-pointer rounded-sm transition-opacity duration-200 opacity-70 hover:opacity-100",
        false: "",
      },
      active: {
        true: "text-foreground opacity-100",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
      active: false,
    },
  },
);

export const chartLegendSwatchVariants = cva("h-2.5 w-2.5 shrink-0", {
  variants: {
    shape: {
      square: "rounded-[3px]",
      circle: "rounded-full",
      line: "h-0.5 w-4 rounded-full",
    },
  },
  defaultVariants: {
    shape: "square",
  },
});

/**
 * The state layer. One dashed frame with an icon well, matching Empty.
 *
 * `chart-state-in` sits on the base rather than on a variant: all three
 * non-plot states are the same box changing its contents, and the one thing
 * they have to agree on is how they arrive. It also means a consumer composing
 * a state block by hand gets the cross-fade without remembering to ask for it.
 */
export const chartStateVariants = cva(
  "text-muted-foreground chart-state-in flex flex-col items-center justify-center gap-2 text-center",
  {
    variants: {
      size: {
        sm: "min-h-[8rem] p-4 text-xs",
        md: "min-h-[12rem] p-6 text-sm",
        lg: "min-h-[16rem] p-8 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const chartStateTitleVariants = cva("font-medium text-foreground", {
  variants: {
    tone: {
      neutral: "",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export type ChartContainerVariantProps = VariantProps<
  typeof chartContainerVariants
>;
export type ChartTooltipVariantProps = VariantProps<
  typeof chartTooltipVariants
>;
export type ChartLegendVariantProps = VariantProps<typeof chartLegendVariants>;
export type ChartStateVariantProps = VariantProps<typeof chartStateVariants>;
export type ChartPlotVariantProps = VariantProps<typeof chartPlotVariants>;
export type ChartGridVariantProps = VariantProps<typeof chartGridVariants>;
