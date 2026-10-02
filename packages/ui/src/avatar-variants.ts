import { cva, type VariantProps } from "class-variance-authority";

/** Circle only. Product sizes collapse to 32, 40, and 48. Tinted fallbacks share one fill. */
export const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "size-8 text-xs",
      default: "size-10 text-sm",
      lg: "size-12 text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const avatarImageClass = "aspect-square size-full object-cover";

export const avatarFallbackClass =
  "flex size-full items-center justify-center rounded-full bg-foreground/10 font-medium text-foreground";

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;
