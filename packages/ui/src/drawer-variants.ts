/**
 * SyncQues drawer.
 * One sheet. Bottom, top, left, and right are the same panel entering from a different edge.
 * The handle, close control, scrolling body, and action row are the structure, not extra looks.
 * Taller max heights (90vh, 92vh) collapse into 85vh.
 */
export const drawerSides = ["bottom", "top", "left", "right"] as const;
export type DrawerSide = (typeof drawerSides)[number];

export const drawerOverlayClass =
  "drawer-overlay-motion fixed inset-0 z-[var(--z-overlay)] bg-black/50";

export const drawerContentClass =
  "group/drawer-content fixed z-[var(--z-dialog)] flex h-auto flex-col overflow-hidden border-border bg-background text-foreground shadow-lg outline-none data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:max-h-[85vh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-md data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-md data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:max-h-[85vh] data-[vaul-drawer-direction=top]:rounded-b-2xl data-[vaul-drawer-direction=top]:border-b";

export const drawerHandleClass =
  "mx-auto mt-3 mb-1 hidden h-1.5 w-12 shrink-0 rounded-full bg-foreground/30 group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:order-last group-data-[vaul-drawer-direction=top]/drawer-content:mt-1 group-data-[vaul-drawer-direction=top]/drawer-content:mb-3 group-data-[vaul-drawer-direction=top]/drawer-content:block";

export const drawerHeaderClass =
  "flex flex-col gap-1 px-5 pt-2 pb-3 text-left group-data-[vaul-drawer-direction=left]/drawer-content:pt-5 group-data-[vaul-drawer-direction=right]/drawer-content:pt-5";

export const drawerBodyClass = "min-h-0 flex-1 overflow-y-auto px-5 py-2 text-sm";

export const drawerFooterClass =
  "mt-auto flex flex-col gap-2 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end";

export const drawerTitleClass = "text-lg leading-snug font-semibold text-foreground";

export const drawerDescriptionClass = "text-sm leading-relaxed text-muted-foreground";

export const drawerCloseClass =
  "absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,opacity] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";
