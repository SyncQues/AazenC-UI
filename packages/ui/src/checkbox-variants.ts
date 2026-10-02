/**
 * SyncQues checkbox.
 * One box. Checked and indeterminate share the primary fill.
 */
export const checkboxClass =
  "peer group/checkbox border-foreground/25 bg-transparent dark:border-foreground/45 dark:bg-transparent data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground dark:data-[state=indeterminate]:border-primary dark:data-[state=indeterminate]:bg-primary dark:data-[state=indeterminate]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40 size-4 shrink-0 cursor-pointer rounded-[4px] border shadow-xs outline-none transition-[color,box-shadow,background-color,border-color] duration-150 ease-out focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

export const checkboxIndicatorClass =
  "flex items-center justify-center text-current animate-checkbox-check";
