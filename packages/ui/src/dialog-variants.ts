import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues dialog.
 * One centered panel. Alert and confirmation use the same chrome, so they are a behavior, not a look.
 * Widths that sit a few dozen pixels apart (400, 425, 500, 512, 600) collapse into sm or default.
 * A softer corner, a card fill, and a heavier shadow read as the same panel, so they are not options.
 * Flush padding is the shell used by composers. The standard padding is the form.
 */
export const dialogSizes = ["sm", "default", "lg", "xl"] as const;
export type DialogSize = (typeof dialogSizes)[number];

export const dialogPaddings = ["default", "none"] as const;
export type DialogPadding = (typeof dialogPaddings)[number];

export const dialogKinds = ["dialog", "alert"] as const;
export type DialogKind = (typeof dialogKinds)[number];

export const dialogOverlayClass =
  "dialog-overlay-motion pointer-events-auto fixed inset-0 z-[var(--z-overlay)] bg-black/50";

export const dialogContentVariants = cva(
  "dialog-motion pointer-events-auto fixed top-1/2 left-1/2 z-[var(--z-dialog)] w-full max-h-[85vh] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background text-foreground shadow-lg outline-none",
  {
    variants: {
      size: {
        sm: "sm:max-w-md",
        default: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-5xl",
      },
      padding: {
        default: "grid gap-4 overflow-y-auto p-6",
        none: "flex flex-col gap-0 overflow-hidden p-0",
      },
    },
    defaultVariants: {
      size: "default",
      padding: "default",
    },
  },
);

export const dialogHeaderVariants = cva("flex flex-col gap-2 text-center sm:text-left", {
  variants: {
    padding: {
      default: "",
      none: "border-b border-border px-6 py-4",
    },
    close: {
      true: "pr-10",
      false: "",
    },
  },
  defaultVariants: {
    padding: "default",
    close: true,
  },
});

export const dialogBodyVariants = cva("min-h-0", {
  variants: {
    padding: {
      default: "",
      none: "flex-1 overflow-y-auto px-6 py-6",
    },
  },
  defaultVariants: {
    padding: "default",
  },
});

export const dialogFooterVariants = cva(
  "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
  {
    variants: {
      padding: {
        default: "",
        none: "border-t border-border px-6 py-4",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  },
);

export const dialogTitleClass = "text-lg leading-none font-semibold";
export const dialogDescriptionClass = "text-sm text-muted-foreground";

export const dialogCloseClass =
  "absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-70 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-accent hover:text-foreground hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export type DialogContentVariantProps = VariantProps<typeof dialogContentVariants>;
