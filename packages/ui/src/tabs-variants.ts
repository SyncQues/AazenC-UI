import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues tabs.
 * Default is the product underline. Pill is the company and community chip row.
 * Accent colors, a second underline, a taller bar, and a stretched grid are the same two looks.
 * The active mark is the near-black primary in both, so the label stays readable in dark mode.
 * That mark slides between tabs with a CSS transition. It is not a second color.
 */
export const tabsListVariants = cva("", {
  variants: {
    variant: {
      default: "relative flex w-max min-w-full items-end gap-1 border-b border-border bg-transparent p-0",
      pill: "relative inline-flex w-max items-center gap-2 bg-transparent p-1",
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
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const tabsUnderlineIndicatorClass =
  "pointer-events-none absolute -bottom-px left-0 z-10 h-0.5 rounded-full bg-primary transition-[transform,width] duration-300 ease-out motion-reduce:transition-none";

export const tabsPillIndicatorClass =
  "pointer-events-none absolute top-0 left-0 z-10 rounded-full bg-primary transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none";

export const tabsBadgeClass =
  "inline-flex min-w-5 items-center justify-center rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground";

export type TabsVariantProps = VariantProps<typeof tabsListVariants>;
