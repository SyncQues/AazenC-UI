import { cva, type VariantProps } from "class-variance-authority";
import { textareaCounterStripClass } from "./field-counter";

/**
 * SyncQues field, multi-line.
 * Shares the Input chrome — border, focus ring, invalid ring, placeholder — and its
 * shape names, but `pill` here is `rounded-3xl` and not `rounded-full` as on the
 * Button: a full radius is half the height of the box, so three lines of text sit in
 * a lozenge. A field has to read as a field, and the Button's pill never had to.
 * Only the bottom edge is draggable: a horizontal handle would break `w-full`.
 */
export const textareaVariants = cva(
  "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex min-h-20 w-full min-w-0 resize-y border bg-transparent px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      shape: {
        rounded: "rounded-lg",
        pill: "rounded-3xl",
      },
      resize: {
        manual: "resize-y",
        // The handle goes, the scrolling stays: `autoResize` stops the box growing at
        // `maxRows`, so past that the excess is only reachable by scrolling. Clipping it
        // instead would strand whatever the user typed or pasted below the last row.
        none: "resize-none overflow-y-auto",
      },
      count: {
        // The count lives in this strip below the last line, so counting costs a line of
        // text. The strip is the shared one, so the field reserves exactly what the
        // counter is positioned into.
        true: `min-h-24 ${textareaCounterStripClass}`,
        false: "",
      },
    },
    defaultVariants: {
      shape: "rounded",
      resize: "manual",
      count: false,
    },
  },
);

export type TextareaVariantProps = VariantProps<typeof textareaVariants>;
export type TextareaResize = NonNullable<TextareaVariantProps["resize"]>;
export type TextareaShape = NonNullable<TextareaVariantProps["shape"]>;
