import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues badge.
 * Secondary and the muted chips are this soft pill. Success, warning, and info
 * were one-off tints of it. Outline, solid, and destructive read as different marks.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap outline-none transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        soft: "border-transparent bg-foreground/10 text-foreground hover:bg-foreground/15",
        outline: "border-border bg-transparent text-foreground hover:bg-accent",
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
