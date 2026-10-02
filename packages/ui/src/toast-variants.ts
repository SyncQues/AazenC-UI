import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues toast.
 * One card. Info is this default. Success, warning, and destructive change the icon
 * because those are the messages people tell apart. Filled, glass, and banner skins
 * were the same notice.
 */
export const toastViewportClass =
  "pointer-events-none fixed top-4 right-4 z-[var(--z-overlay)] flex w-[min(100%-2rem,22rem)] flex-col gap-2";

export const toastCardVariants = cva(
  "pointer-events-auto flex w-full items-start gap-3 rounded-[1.125rem] border border-border bg-popover p-3 text-popover-foreground shadow-md animate-fade-in-up",
  {
    variants: {
      tone: {
        default: "",
        success: "",
        warning: "",
        destructive: "",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export const toastIconClass =
  "mt-0.5 size-4 shrink-0 text-foreground data-[tone=success]:text-[oklch(0.62_0.15_155)] data-[tone=warning]:text-[oklch(0.769_0.169_70)] data-[tone=destructive]:text-destructive data-[tone=destructive]:dark:text-[oklch(0.78_0.16_25)]";

export type ToastTone = NonNullable<VariantProps<typeof toastCardVariants>["tone"]>;
