import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues alert.
 * One inline message. The tone picks the border, the wash, and the icon, so the
 * four words people actually say — saved, careful, it broke, heads up — are four
 * tints of one row instead of four components.
 * Success, warning, and error were separate components in SyncQues-Frontend. They
 * were the same alert with a different word in it.
 *
 * The wash is 10% of the tone over the page, never a solid fill: an alert sits
 * inside a form or a card, and a solid block would fight the panel it is in.
 * Text stays foreground so it keeps the same contrast in every tone.
 */
export const alertVariants = cva(
  "relative flex w-full flex-wrap items-start gap-3 border p-4 text-sm animate-fade-in",
  {
    variants: {
      tone: {
        default: "border-border bg-muted/40",
        success: "border-success/30 bg-success/10",
        warning: "border-warning/40 bg-warning/10",
        destructive: "border-destructive/40 bg-destructive/10",
      },
      /* Same three shapes as Button, but rounded first. A pill swallows a two-line
         message, and this box is usually two lines. The default is the panel radius,
         the same one a toast card uses, so the two messages look like a pair. */
      shape: {
        rounded: "rounded-[var(--radius-panel)]",
        pill: "rounded-full",
        square: "rounded-none",
      },
    },
    defaultVariants: {
      tone: "default",
      shape: "rounded",
    },
  },
);

// The hue token, not `-foreground`: that one is white on a 10% wash in light mode (1.25:1).
// The svg guard is the one Button uses, so a Lucide icon does not overflow at its 24px default.
export const alertIconClass =
  "mt-0.5 size-5 shrink-0 text-foreground data-[tone=success]:text-success-foreground data-[tone=warning]:text-warning-foreground data-[tone=destructive]:text-destructive [&_svg:not([class*='size-'])]:size-5";

/**
 * One size. An alert that shrinks stops being readable at the one moment somebody
 * needs it, and a dense form is the wrong place to save four pixels.
 */
export const alertTitleClass = "font-medium leading-snug tracking-tight text-balance";

/** Muted on purpose: the tone already did the shouting in the icon. */
export const alertDescriptionClass = "mt-1 text-sm/relaxed text-muted-foreground [&_p+p]:mt-2";

// `ml-auto` would split the free space between two actions; only the first pushes.
export const alertActionClass =
  "ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 [&_a]:underline [&_a]:underline-offset-4 [&+&]:ml-0";

export type AlertVariantProps = VariantProps<typeof alertVariants>;
export type AlertTone = NonNullable<AlertVariantProps["tone"]>;
export type AlertShape = NonNullable<AlertVariantProps["shape"]>;
