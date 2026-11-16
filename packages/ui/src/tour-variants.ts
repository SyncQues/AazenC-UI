/**
 * SyncQues tour.
 * One dimmed page, one spotlight, one card beside the highlighted control.
 */

export const tourOverlayClass = "fixed inset-0 z-[calc(var(--z-popper)+1)]";

export const tourSpotlightClass =
  "pointer-events-none fixed z-[calc(var(--z-popper)+2)] rounded-md ring-2 ring-primary";

export const tourCardClass =
  "fixed z-[calc(var(--z-popper)+2)] grid w-[min(20rem,calc(100vw-1rem))] gap-3 rounded-lg border border-border bg-background p-4 text-foreground shadow-lg outline-none animate-fade-in motion-reduce:animate-none";

export const tourTitleClass = "text-sm font-semibold tracking-tight";

export const tourDescriptionClass = "mt-1 text-sm text-muted-foreground";

export const tourProgressClass = "text-xs text-muted-foreground";

export const tourFooterClass = "flex items-center justify-between gap-2";

export const tourActionsClass = "flex items-center gap-2";
