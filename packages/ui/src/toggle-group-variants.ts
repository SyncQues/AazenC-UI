import { cva, type VariantProps } from "class-variance-authority";
import { toggleControlClass } from "./toggle-variants";

/**
 * SyncQues toggle group.
 *
 * Any number of independent on/off choices, pressed at the same time. The
 * formatting bar, a filter set, a text-alignment row — none of them has one
 * answer, which is what separates this from `SegmentedControl`, and none of them
 * swaps a panel, which is what separates it from `Tabs`.
 *
 * The variants are the container and nothing else. What a pressed item looks
 * like is deliberately the same in every one of them: a toggle that reads "on"
 * one way in one variant and another way in the other is a toggle people have to
 * relearn.
 */

/**
 * The container. `pill` is the default, and the shape the library's `Button`
 * already defaults to; `outline` is the joined strip, `ghost` has no chrome.
 */
export const toggleGroupVariants = cva(
  [
    "relative isolate inline-flex max-w-full items-center",
    "outline-none transition-[background-color,border-color,box-shadow] duration-300 ease-out",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        // A hairline above the fill rather than a shadow under it, for the same
        // reason the segmented track has one: the track is meant to read as a
        // surface the items sit inside.
        pill: "gap-1 rounded-full border border-border/80 bg-muted/70 p-1 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.55)] dark:bg-muted/40 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)]",
        outline:
          "gap-0.5 rounded-[var(--radius)] border border-border/80 bg-muted/70 p-0.5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.55)] dark:bg-muted/40 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)]",
        ghost:
          "gap-1.5 rounded-none border border-transparent bg-transparent p-0 shadow-none",
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  },
);

export const toggleGroupItemVariants = cva(
  // The base is `toggleControlClass`, shared with the standalone `Toggle`, so an
  // item and a toggle on their own are the same control at the same size.
  [toggleControlClass, "z-10"],
  {
    variants: {
      // The variant axis carries no styles of its own; what an item looks like is
      // a function of the variant *and* whether it is pressed, so the matrix
      // lives in `compoundVariants` rather than across two axes.
      variant: {
        pill: "",
        outline: "",
        ghost: "",
      },
      pressed: {
        true: "",
        false: "",
      },
      size: {
        // The same 7/8/9 scale `SegmentedControl` uses, so the two choice
        // controls in this library sit next to each other without a seam.
        sm: "h-7 px-2.5 text-xs has-[>svg]:px-2",
        default: "h-8 px-3 text-sm has-[>svg]:px-2.5",
        lg: "h-9 px-3.5 text-sm has-[>svg]:px-3",
      },
    },
    compoundVariants: [
      {
        variant: "pill",
        pressed: true,
        class:
          "rounded-full border border-transparent bg-primary text-primary-foreground shadow-sm",
      },
      {
        variant: "pill",
        pressed: false,
        class:
          "rounded-full border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "outline",
        pressed: true,
        class:
          "rounded-[calc(var(--radius)-2px)] border border-transparent bg-primary text-primary-foreground shadow-xs",
      },
      {
        variant: "outline",
        pressed: false,
        class:
          "rounded-[calc(var(--radius)-2px)] border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "ghost",
        pressed: true,
        class:
          "rounded-[var(--radius)] border border-primary bg-primary text-primary-foreground shadow-xs",
      },
      {
        variant: "ghost",
        pressed: false,
        class:
          "rounded-[var(--radius)] border border-border bg-background/80 text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30",
      },
    ],
    defaultVariants: {
      variant: "pill",
      size: "default",
      pressed: false,
    },
  },
);

/**
 * The items arriving one after another. `backwards`, never `forwards`: a
 * `forwards` fill would pin that transform over the item's own press forever.
 */
export const toggleGroupItemsInClass = "toggle-group-items-in";

export type ToggleGroupVariantProps = VariantProps<typeof toggleGroupVariants>;
export type ToggleGroupVariant = NonNullable<
  ToggleGroupVariantProps["variant"]
>;
export type ToggleGroupItemVariantProps = VariantProps<
  typeof toggleGroupItemVariants
>;
export type ToggleGroupSize = NonNullable<ToggleGroupItemVariantProps["size"]>;
