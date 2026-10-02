export const tableContainerClass = "relative w-full overflow-x-auto rounded-[var(--radius-panel)] border border-border";

export const tableClass = "w-full caption-bottom text-sm";

export const tableHeaderClass = "[&_tr]:border-b";

export const tableBodyClass = "[&_tr:last-child]:border-0";

export const tableFooterClass = "border-t bg-foreground/5 font-medium [&>tr]:last:border-b-0";

export const tableRowClass =
  "border-b transition-colors duration-150 hover:bg-foreground/5 data-[state=selected]:bg-foreground/15 data-[state=selected]:shadow-[inset_3px_0_0_var(--color-primary)] motion-reduce:transition-none";

export const tableHeadClass = "h-auto min-h-10 px-3 py-2 text-left align-middle font-medium whitespace-nowrap text-muted-foreground data-[wrap=true]:whitespace-normal";

export const tableCellClass = "px-3 py-2.5 align-middle whitespace-nowrap data-[wrap=true]:whitespace-normal";

export const tableCaptionClass = "mt-3 text-sm text-muted-foreground";
