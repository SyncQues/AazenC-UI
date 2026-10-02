import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues separator.
 * One hairline. The two orientations are the same line turned, so this is an
 * axis and not two components.
 *
 * Decorative is the default, and that is the whole design decision. A rule
 * between two paragraphs is furniture: it adds nothing a screen reader would
 * want to hear. A rule between two groups of form fields is structure, and that
 * one needs `decorative={false}` so it can be announced and so it can hold
 * keyboard focus. Guessing wrong in the other direction announces "separator"
 * after every heading in the product, which is how this pattern gets turned off
 * by screen-reader users. So the quiet one is the default and the useful one is
 * one prop away.
 *
 * No thickness, colour, or inset options. Anything heavier than a pixel is a
 * border, anything tinted is a surface, and an indented rule is a list — all
 * already in the vocabulary the rest of the library speaks.
 */
export const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type SeparatorVariantProps = VariantProps<typeof separatorVariants>;
export type SeparatorOrientation = NonNullable<SeparatorVariantProps["orientation"]>;
