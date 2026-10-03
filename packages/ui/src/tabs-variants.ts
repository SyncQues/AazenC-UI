import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues tabs.
 * Default is the product underline. Pill is the company and community chip row.
 * Segmented is the dashboard and settings bar: one rounded track that holds the
 * tabs, with the same primary pill mark sitting behind the active one. The track
 * is what separates it from the chip row, not the mark.
 * Accent colors, a second underline, a taller bar, and a stretched grid are the same three looks.
 * All three marks are the near-black primary, so the label stays readable in dark mode.
 * That mark slides between tabs with a CSS transition. It is not a second color.
 * A tab that asks for a color is the one exception: see tabsColorVariants.
 */
export const tabsListVariants = cva("", {
  variants: {
    variant: {
      default: "relative flex w-max min-w-full items-end gap-1 border-b border-border bg-transparent p-0",
      pill: "relative inline-flex w-max items-center gap-2 bg-transparent p-1",
      segmented:
        "relative inline-flex w-max items-center gap-1 rounded-full border border-border bg-muted p-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const tabsTriggerVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium",
    "transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ],
  {
    variants: {
      variant: {
        default:
          "relative rounded-none border-0 bg-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:text-foreground",
        pill:
          "relative rounded-full border border-border bg-foreground/10 px-4 py-2 text-foreground shadow-xs transition-colors hover:bg-foreground/15 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground data-[state=active]:shadow-none",
        segmented:
          "relative rounded-full border border-transparent bg-transparent px-4 py-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * The mark's hue changes on the same clock it moves on, or a colored row slides
 * grey under a hard-swapping mark. Both washes are 10%, so the crossfade never
 * dips through transparent.
 */
export const tabsUnderlineIndicatorClass =
  "pointer-events-none absolute -bottom-px left-0 z-10 h-0.5 rounded-full bg-primary transition-[transform,width,background-color] duration-300 ease-out motion-reduce:transition-none";

export const tabsPillIndicatorClass =
  "pointer-events-none absolute top-0 left-0 z-10 rounded-full bg-primary transition-[transform,width,height,background-color] duration-300 ease-out motion-reduce:transition-none";

export const tabsBadgeClass =
  "inline-flex min-w-5 items-center justify-center rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground";

/**
 * SyncQues tab color.
 * A tab color is an identity, not a state: Feed is blue because Feed is blue,
 * so a person finds the section by its icon before they read the label.
 *
 * Nothing paints an inactive chip: the resting fill is the shared
 * `bg-foreground/10` on every tab, colored or not. A per-tab fill was tried and
 * reverted — it turned the row into a strip of boxes, and a row mixing colored
 * and plain tabs ended up with two chip backgrounds side by side.
 *
 * A 600 that reads on white turns muddy on black, so dark takes the 400 for the
 * icon and the 300 for the active label. The active icon rule is written twice
 * on purpose: `dark:` ties with the plain rule on specificity, so without the
 * twin the 400 would win and sit on top of the active fill.
 */
export const tabsColorVariants = cva("", {
  variants: {
    color: {
      blue: [
        "[&_svg]:text-blue-600 dark:[&_svg]:text-blue-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=blue]:data-[state=active]:text-blue-700",
        "dark:data-[variant=default]:data-[color=blue]:data-[state=active]:text-blue-300",
        "data-[variant=pill]:data-[color=blue]:data-[state=active]:border-blue-400/60",
        "data-[variant=pill]:data-[color=blue]:data-[state=active]:text-blue-700",
        "dark:data-[variant=pill]:data-[color=blue]:data-[state=active]:text-blue-300",
        "data-[variant=pill]:data-[color=blue]:not-data-[state=active]:hover:bg-blue-500/10",
      ].join(" "),
      green: [
        "[&_svg]:text-green-600 dark:[&_svg]:text-green-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=green]:data-[state=active]:text-green-700",
        "dark:data-[variant=default]:data-[color=green]:data-[state=active]:text-green-300",
        "data-[variant=pill]:data-[color=green]:data-[state=active]:border-green-400/60",
        "data-[variant=pill]:data-[color=green]:data-[state=active]:text-green-700",
        "dark:data-[variant=pill]:data-[color=green]:data-[state=active]:text-green-300",
        "data-[variant=pill]:data-[color=green]:not-data-[state=active]:hover:bg-green-500/10",
      ].join(" "),
      orange: [
        "[&_svg]:text-orange-600 dark:[&_svg]:text-orange-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=orange]:data-[state=active]:text-orange-700",
        "dark:data-[variant=default]:data-[color=orange]:data-[state=active]:text-orange-300",
        "data-[variant=pill]:data-[color=orange]:data-[state=active]:border-orange-400/60",
        "data-[variant=pill]:data-[color=orange]:data-[state=active]:text-orange-700",
        "dark:data-[variant=pill]:data-[color=orange]:data-[state=active]:text-orange-300",
        "data-[variant=pill]:data-[color=orange]:not-data-[state=active]:hover:bg-orange-500/10",
      ].join(" "),
      teal: [
        "[&_svg]:text-teal-600 dark:[&_svg]:text-teal-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=teal]:data-[state=active]:text-teal-700",
        "dark:data-[variant=default]:data-[color=teal]:data-[state=active]:text-teal-300",
        "data-[variant=pill]:data-[color=teal]:data-[state=active]:border-teal-400/60",
        "data-[variant=pill]:data-[color=teal]:data-[state=active]:text-teal-700",
        "dark:data-[variant=pill]:data-[color=teal]:data-[state=active]:text-teal-300",
        "data-[variant=pill]:data-[color=teal]:not-data-[state=active]:hover:bg-teal-500/10",
      ].join(" "),
      purple: [
        "[&_svg]:text-purple-600 dark:[&_svg]:text-purple-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=purple]:data-[state=active]:text-purple-700",
        "dark:data-[variant=default]:data-[color=purple]:data-[state=active]:text-purple-300",
        "data-[variant=pill]:data-[color=purple]:data-[state=active]:border-purple-400/60",
        "data-[variant=pill]:data-[color=purple]:data-[state=active]:text-purple-700",
        "dark:data-[variant=pill]:data-[color=purple]:data-[state=active]:text-purple-300",
        "data-[variant=pill]:data-[color=purple]:not-data-[state=active]:hover:bg-purple-500/10",
      ].join(" "),
      pink: [
        "[&_svg]:text-pink-600 dark:[&_svg]:text-pink-400",
        "data-[state=active]:[&_svg]:text-current",
        "dark:data-[state=active]:[&_svg]:text-current",
        "data-[variant=default]:data-[color=pink]:data-[state=active]:text-pink-700",
        "dark:data-[variant=default]:data-[color=pink]:data-[state=active]:text-pink-300",
        "data-[variant=pill]:data-[color=pink]:data-[state=active]:border-pink-400/60",
        "data-[variant=pill]:data-[color=pink]:data-[state=active]:text-pink-700",
        "dark:data-[variant=pill]:data-[color=pink]:data-[state=active]:text-pink-300",
        "data-[variant=pill]:data-[color=pink]:not-data-[state=active]:hover:bg-pink-500/10",
      ].join(" "),
    },
  },
});

/**
 * The mark follows the active tab's hue, so a colored row slides blue into
 * purple rather than grey. `satisfies`, so a hue in one table and not the other
 * is a compile error rather than an undefined lookup.
 */
export const tabsSolidMarkColorClass = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  teal: "bg-teal-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
} satisfies Record<TabsColor, string>;

export const tabsWashMarkColorClass = {
  blue: "bg-blue-500/10",
  green: "bg-green-500/10",
  orange: "bg-orange-500/10",
  teal: "bg-teal-500/10",
  purple: "bg-purple-500/10",
  pink: "bg-pink-500/10",
} satisfies Record<TabsColor, string>;

export type TabsVariantProps = VariantProps<typeof tabsListVariants>;
export type TabsColorVariantProps = VariantProps<typeof tabsColorVariants>;
export type TabsColor = NonNullable<TabsColorVariantProps["color"]>;
