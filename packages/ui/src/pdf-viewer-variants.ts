/** One framed viewer. Glass, outline, and borderless skins were the same control. */
export const pdfViewerClass =
  "flex h-[32rem] w-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border bg-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[expanded=true]:fixed data-[expanded=true]:inset-0 data-[expanded=true]:z-[var(--z-dialog)] data-[expanded=true]:h-dvh data-[expanded=true]:rounded-none";

export const pdfToolbarClass =
  "flex shrink-0 items-center justify-between gap-2 border-b border-border bg-foreground/5 px-2 py-1.5";

export const pdfStageClass = "relative flex min-h-0 min-w-0 flex-1";

export const pdfThumbsClass =
  "z-10 flex w-28 shrink-0 flex-col overflow-y-auto border-r border-border bg-background max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-md";

export const pdfPagePaneClass =
  "flex min-h-0 min-w-0 flex-1 justify-center overflow-auto bg-foreground/10 p-4 data-[expanded=false]:cursor-zoom-in";
