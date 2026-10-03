import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues card.
 * Default is the product panel. Plain is a group.
 * A second gray panel, a mid radius, and a stronger shadow read as the same card, so they are not options.
 * Corners are the standard 10px, or the round 24px sidebar.
 * Padding lives on the parts. After a header, the next part drops its top padding
 * so the two boxes do not stack a double gap. A part with no header above keeps it.
 */
export const cardPaddings = ["none", "sm", "lg"] as const;
export type CardPadding = (typeof cardPaddings)[number];

export const cardPaddingClass: Record<CardPadding, { header: string; content: string; footer: string }> = {
  none: {
    header: "p-0",
    content: "p-0",
    footer: "p-0",
  },
  sm: {
    header: "p-4",
    content: "px-4 pt-4 pb-4 [[data-slot=card-header]+&]:pt-0",
    footer: "px-4 pt-4 pb-4 [[data-slot=card-header]+&]:pt-0 [[data-slot=card-content]+&]:pt-0",
  },
  lg: {
    header: "p-6",
    content: "px-6 pt-6 pb-6 [[data-slot=card-header]+&]:pt-0",
    footer: "px-6 pt-6 pb-6 [[data-slot=card-header]+&]:pt-0 [[data-slot=card-content]+&]:pt-0",
  },
};

export const cardVariants = cva("animate-fade-in overflow-hidden text-card-foreground", {
  variants: {
    variant: {
      default:
        "border border-border bg-card shadow-sm transition-[translate,scale,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:translate-none motion-reduce:scale-none",
      plain: "border-0 bg-transparent shadow-none",
    },
    radius: {
      lg: "rounded-lg",
      round: "rounded-3xl",
    },
    align: {
      start: "text-left",
      center: "text-center",
    },
    interactive: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      variant: "default",
      interactive: true,
      className: "cursor-pointer active:scale-[0.985]",
    },
    {
      variant: "plain",
      interactive: true,
      className:
        "cursor-pointer transition-[translate,scale,background-color] duration-300 ease-out hover:-translate-y-1 hover:bg-accent/40 active:scale-[0.985] motion-reduce:translate-none motion-reduce:scale-none",
    },
  ],
  defaultVariants: {
    variant: "default",
    radius: "lg",
    align: "start",
    interactive: false,
  },
});

export const cardHeaderVariants = cva("flex", {
  variants: {
    layout: {
      stack: "flex-col gap-1.5",
      row: "flex-row items-center justify-between gap-3",
    },
  },
  defaultVariants: {
    layout: "stack",
  },
});

export const cardTitleVariants = cva(
  "inline-flex min-w-0 items-center gap-2 font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const cardContentVariants = cva("", {
  variants: {
    gap: {
      none: "",
      md: "space-y-4",
    },
  },
  defaultVariants: {
    gap: "none",
  },
});

export const cardFooterVariants = cva("flex items-center gap-3", {
  variants: {
    align: {
      start: "justify-start",
      center: "justify-center",
      between: "justify-between",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

export type CardVariantProps = VariantProps<typeof cardVariants>;
export type CardHeaderVariantProps = VariantProps<typeof cardHeaderVariants>;
export type CardTitleVariantProps = VariantProps<typeof cardTitleVariants>;
export type CardContentVariantProps = VariantProps<typeof cardContentVariants>;
export type CardFooterVariantProps = VariantProps<typeof cardFooterVariants>;
