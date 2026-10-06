import { cva, type VariantProps } from "class-variance-authority";

/**
 * One gap scale for every primitive, so a column's rhythm and a grid's are the
 * same numbers. Half steps up to four, whole steps after: the spacing a UI uses.
 */
const GAP = {
  "0": "gap-0",
  "0.5": "gap-0.5",
  "1": "gap-1",
  "1.5": "gap-1.5",
  "2": "gap-2",
  "2.5": "gap-2.5",
  "3": "gap-3",
  "3.5": "gap-3.5",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "8": "gap-8",
  "10": "gap-10",
  "12": "gap-12",
} as const;

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
  stretch: "items-stretch",
} as const;

const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

/**
 * Every box gets `min-w-0`. It is the one class that stops a flex or grid child
 * refusing to shrink below its content, which is the usual cause of a page that
 * scrolls sideways. Costs nothing when nothing overflows.
 */
export const boxClass = "min-w-0";

/**
 * A column by default. `wrap` turns it into a wrapping row, which is the badge
 * and tag row people otherwise write by hand, so there is no separate Cluster.
 */
export const stackVariants = cva(`flex ${boxClass}`, {
  variants: {
    direction: { col: "flex-col", row: "flex-row" },
    gap: GAP,
    align: ALIGN,
    wrap: { true: "flex-wrap", false: "" },
  },
  defaultVariants: { direction: "col", gap: "4" },
});

/**
 * A grid of equal columns. Six is the ceiling because past that a card grid wants
 * a wrapping row; a wider track count is `className="grid-cols-12"`.
 */
export const gridVariants = cva(`grid ${boxClass}`, {
  variants: {
    columns: {
      "1": "grid-cols-1",
      "2": "grid-cols-2",
      "3": "grid-cols-3",
      "4": "grid-cols-4",
      "5": "grid-cols-5",
      "6": "grid-cols-6",
    },
    gap: GAP,
  },
  defaultVariants: { columns: "1", gap: "4" },
});

/** A row with no rhythm of its own: raw flex, and the axis defaults are flex's. */
export const flexVariants = cva(`flex ${boxClass}`, {
  variants: {
    direction: { row: "flex-row", col: "flex-col" },
    gap: GAP,
    align: ALIGN,
    justify: JUSTIFY,
    wrap: { true: "flex-wrap", false: "" },
  },
  defaultVariants: { direction: "row" },
});

/** The empty state, the spinner, the drop target. `full` is a whole viewport. */
export const centerVariants = cva(
  `flex items-center justify-center ${boxClass}`,
  {
    variants: { full: { true: "min-h-svh", false: "" } },
  },
);

/**
 * Two things pushed to opposite ends — the heading and the action beside it. A
 * split you can drag is `resizable`, not this.
 */
export const splitVariants = cva(`flex flex-wrap justify-between ${boxClass}`, {
  variants: {
    direction: { row: "flex-row", col: "flex-col" },
    gap: GAP,
    align: ALIGN,
  },
  defaultVariants: { direction: "row", gap: "4" },
});

/**
 * A centred page column. Sizes are Tailwind's own `max-w` steps, so `size="7xl"`
 * is the `max-w-7xl mx-auto px-4` that every page shell repeats.
 */
export const containerVariants = cva(
  `mx-auto w-full ${boxClass} px-4 sm:px-6`,
  {
    variants: {
      size: {
        xs: "max-w-xs",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        prose: "max-w-prose",
        full: "max-w-none",
      },
    },
    defaultVariants: { size: "6xl" },
  },
);

/**
 * Grows to push a footer down. `grow={false}` reserves nothing, which is how you
 * drop one without deleting it.
 */
export const spacerVariants = cva(boxClass, {
  variants: { grow: { true: "flex-1", false: "flex-none" } },
  defaultVariants: { grow: true },
});

/**
 * cva keys a scale by string, so `gap={4}` and `gap="4"` have to reach the same
 * class. Anything off the scale still type-checks only as itself, never as a gap.
 */
export function asVariantKey<T extends string>(
  value: number | T | null | undefined,
): T | undefined {
  return value == null ? undefined : (String(value) as T);
}

/** Maps `"0.5" | "4"` to `0.5 | "0.5" | 4 | "4"`, so a number is a first-class value. */
type ScaleValue<T extends string> =
  | T
  | {
      [K in T]: K extends `${infer N extends number}` ? N : never;
    }[T];

export type StackVariantProps = VariantProps<typeof stackVariants>;
export type StackDirection = NonNullable<StackVariantProps["direction"]>;
export type StackAlign = NonNullable<StackVariantProps["align"]>;
export type LayoutGap = ScaleValue<NonNullable<StackVariantProps["gap"]>>;

export type GridVariantProps = VariantProps<typeof gridVariants>;
export type GridColumns = NonNullable<GridVariantProps["columns"]>;
export type LayoutColumns = ScaleValue<GridColumns>;

export type FlexVariantProps = VariantProps<typeof flexVariants>;
export type FlexDirection = NonNullable<FlexVariantProps["direction"]>;
export type FlexAlign = NonNullable<FlexVariantProps["align"]>;
export type FlexJustify = NonNullable<FlexVariantProps["justify"]>;

export type CenterVariantProps = VariantProps<typeof centerVariants>;

export type SplitVariantProps = VariantProps<typeof splitVariants>;
export type SplitDirection = NonNullable<SplitVariantProps["direction"]>;
export type SplitAlign = NonNullable<SplitVariantProps["align"]>;

export type ContainerVariantProps = VariantProps<typeof containerVariants>;
export type ContainerSize = NonNullable<ContainerVariantProps["size"]>;

export type SpacerVariantProps = VariantProps<typeof spacerVariants>;
