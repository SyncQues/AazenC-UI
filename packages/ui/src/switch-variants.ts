/**
 * SyncQues switch.
 * One track. Size and color skins of the same pill were the same control.
 * The unchecked track stays a light outline. A dark input fill looked solid gray
 * and, at equal specificity, covered the checked primary.
 */
export const switchClass =
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-foreground/25 bg-foreground/15 p-0.5 shadow-xs outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out dark:border-foreground/45 dark:bg-foreground/15 data-[state=checked]:border-primary data-[state=checked]:bg-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

export const switchThumbClass =
  "pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-[translate] duration-150 ease-out data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground motion-reduce:transition-none";
