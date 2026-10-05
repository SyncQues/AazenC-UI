import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues button.
 * Seven variants. Same structure is not given a second name.
 * Pill is the default shape. Rounded and square are opt-in.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium",
    "cursor-pointer transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50",
    "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ghost:
          "bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        /* Dark --destructive is a deep red and disappears on the dark canvas.
           The lighter red below stays red and clears the near-black page. */
        "destructive-soft":
          "bg-transparent text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive dark:text-[oklch(0.78_0.16_25)] dark:hover:bg-destructive/15 dark:hover:text-[oklch(0.78_0.16_25)]",
        link: "bg-transparent text-primary shadow-none underline-offset-4 hover:underline",
        /* Post-card action pill, blue held by `aria-pressed` so a reaction survives
           the pointer. The fill is `--muted`, not `--accent`: mono's inverted accent collapses against muted text and drops the label below AA, so the pressed text is blue-700 rather than blue-600 for the same reason. */
        soft:
          "border border-transparent bg-muted text-foreground hover:bg-accent hover:text-accent-foreground aria-pressed:border-blue-500/40 aria-pressed:bg-blue-500/15 aria-pressed:text-blue-700 dark:aria-pressed:border-blue-400/40 dark:aria-pressed:text-blue-400",
      },
      size: {
        xs: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 text-base has-[>svg]:px-6",
        "icon-2xs": "size-6",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-md",
        square: "rounded-none",
      },
      width: {
        auto: "",
        full: "w-full",
      },
      align: {
        center: "justify-center",
        start: "justify-start text-left",
        between: "justify-between",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        className: "h-auto rounded-none px-0 py-0 active:scale-100",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
      width: "auto",
      align: "center",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
