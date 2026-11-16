/**
 * SyncQues radio group.
 * One circle. The chosen option shows a primary dot.
 */
export const radioGroupClass = "grid gap-3";

/** A horizontal group stays only as wide as its options. */
export const radioGroupHorizontalClass = "w-fit grid-flow-col auto-cols-max";

export const radioGroupItemClass =
  "peer group/radio border-foreground/25 bg-transparent dark:border-foreground/45 dark:bg-transparent data-[state=checked]:border-primary data-[state=checked]:text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40 size-4 shrink-0 cursor-pointer rounded-full border shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 ease-out focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

export const radioGroupIndicatorClass =
  "flex items-center justify-center text-current animate-checkbox-check";

export const radioGroupDotClass = "size-2 rounded-full bg-current";
