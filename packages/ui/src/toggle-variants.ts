import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues toggle.
 *
 * One button that stays down — and the base every toggle-shaped control in this
 * package is built on, which `ToggleGroupItem` imports rather than restating.
 */

/**
 * `scale` is in the transition list because that is the property the press is
 * animated on; the `active` override is what makes it instant.
 */
export const toggleControlClass = [
  "animate-toggle-press-in",
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5",
  "whitespace-nowrap font-medium",
  "transition-[color,background-color,border-color,box-shadow,scale] duration-200 ease-out",
  "active:transition-[scale] active:duration-100",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50",
  // Without the press a click on a control this small reads as a miss.
  "active:scale-[0.95] motion-reduce:active:scale-100",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
].join(" ");

/**
 * Pill by default, as `Button` is: a toggle is a small control that sits inside
 * dense rows, and a rounded rectangle among pills reads as a mistake.
 */
export const toggleVariants = cva([toggleControlClass], {
  variants: {
    // The variant axis carries no styles of its own: what a toggle looks like is
    // a function of the variant *and* whether it is pressed.
    variant: {
      default: "",
      outline: "",
    },
    pressed: {
      true: "",
      false: "",
    },
    size: {
      // The same 7/8/9 scale `SegmentedControl` and `ToggleGroupItem` use.
      sm: "h-7 px-2.5 text-xs has-[>svg]:px-2",
      default: "h-8 px-3 text-sm has-[>svg]:px-2.5",
      lg: "h-9 px-3.5 text-sm has-[>svg]:px-3",
    },
  },
  compoundVariants: [
    {
      variant: "default",
      pressed: true,
      class:
        "rounded-full border border-transparent bg-primary text-primary-foreground shadow-sm",
    },
    {
      variant: "default",
      pressed: false,
      class:
        "rounded-full border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    },
    {
      variant: "outline",
      pressed: true,
      class:
        "rounded-full border border-primary bg-primary text-primary-foreground shadow-sm",
    },
    {
      variant: "outline",
      pressed: false,
      class:
        "rounded-full border border-border bg-background/80 text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
    pressed: false,
  },
});

export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
export type ToggleVariant = NonNullable<ToggleVariantProps["variant"]>;
export type ToggleSize = NonNullable<ToggleVariantProps["size"]>;
