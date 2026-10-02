import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues field.
 * Password, search, email, url, number, and file share this chrome. The native `type` changes behavior.
 * Taller bars and zinc fills were one-off skins of this same field.
 * The shape is a pill. A leading icon only adds padding.
 */
export const inputVariants = cva(
  "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-full border bg-transparent px-4 py-1 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 ease-out file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      icon: {
        true: "pl-10",
        false: "",
      },
    },
    defaultVariants: {
      icon: false,
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
