import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues loading spinner.
 * One arc chasing one track. Size is the only thing that changes.
 * No color of its own: the mark takes currentColor, so the same spinner
 * sits on a page, on a card, and inside a button without a second variant.
 * One turn a second. Reduced motion stops it rather than slowing it down,
 * because a still circle next to a still label still reads as loading.
 */
export const spinnerVariants = cva("animate-spin motion-reduce:animate-none", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** Sits under the mark in a centered stack, or beside it in an inline row. */
export const spinnerLabelClass = "text-sm text-pretty text-muted-foreground";

/** Fills the box it is given and centers the mark. Never sets a height. */
export const spinnerOverlayClass =
  "flex min-h-40 w-full flex-col items-center justify-center gap-3 text-center";

export type SpinnerVariantProps = VariantProps<typeof spinnerVariants>;
export type SpinnerSize = NonNullable<SpinnerVariantProps["size"]>;
