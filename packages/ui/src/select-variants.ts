/**
 * SyncQues select.
 * Width, height, and rounded-xl triggers were the same pill field.
 * The menu is one popover. Item-aligned and popper were the same list.
 */
export const selectTriggerClass =
  "group border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-full border bg-transparent px-4 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 ease-out focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm motion-reduce:transition-none aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>span]:line-clamp-1";

export const selectIconClass =
  "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none";

export const selectContentClass =
  "menu-motion pointer-events-auto z-[var(--z-popper)] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[var(--radius-panel)] border border-border bg-popover text-popover-foreground shadow-md outline-none";

export const selectViewportClass = "max-h-72 w-full min-w-[var(--radix-select-trigger-width)] overflow-y-auto p-1.5";

export const selectLabelClass = "px-3 py-1.5 text-xs font-medium text-muted-foreground";

export const selectItemClass =
  "relative flex w-full cursor-pointer items-center truncate rounded-full py-1.5 pr-3 pl-8 text-sm whitespace-nowrap outline-none select-none transition-colors duration-150 ease-out focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 motion-reduce:transition-none";

export const selectSeparatorClass = "bg-border mx-2 my-1 h-px";

export const selectScrollButtonClass = "flex items-center justify-center py-1 text-muted-foreground";
