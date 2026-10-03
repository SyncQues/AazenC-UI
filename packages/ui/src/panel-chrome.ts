/**
 * SyncQues panel chrome — the classes the sheet and drawer were copying.
 * Dialog keeps its own title, description and close: a centered alert panel is
 * genuinely softer than an edge sheet. It shares the icon only.
 */

/** The action row. Docked to the bottom, so a phone's home bar stays clear of it. */
export const panelFooterClass =
  "mt-auto flex flex-col gap-2 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end";

export const panelTitleClass = "text-lg leading-snug font-semibold text-foreground";

export const panelDescriptionClass = "text-sm leading-relaxed text-muted-foreground";

export const panelCloseClass =
  "absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,opacity] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";