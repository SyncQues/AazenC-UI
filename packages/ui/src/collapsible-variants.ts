/**
 * SyncQues collapsible.
 * One disclosure. A custom trigger keeps its own control and only the panel animates.
 */
export const collapsibleTriggerClass =
  "group flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-3 text-left text-sm font-medium outline-none transition-colors duration-150 ease-out hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&[data-state=open]>svg]:rotate-180";

export const collapsibleChevronClass =
  "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none";

export const collapsibleContentClass = "collapsible-motion overflow-hidden text-sm";
