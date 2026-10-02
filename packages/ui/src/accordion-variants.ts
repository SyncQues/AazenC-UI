/**
 * SyncQues accordion.
 * One bordered list. Single and multiple are behavior, not a second skin.
 */
export const accordionItemClass = "border-b border-border last:border-b-0";

export const accordionTriggerClass =
  "group flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-4 text-left text-sm font-medium outline-none transition-colors duration-150 ease-out hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&[data-state=open]>svg]:rotate-180";

export const accordionChevronClass =
  "size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none";

export const accordionContentClass =
  "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down";

export const accordionContentInnerClass = "pt-0 pb-4";
