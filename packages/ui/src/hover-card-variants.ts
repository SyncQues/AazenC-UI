/**
 * SyncQues hover card.
 * The popover panel on a hover trigger. Wider than a popover, because what this
 * shows is a summary — a person, a document, a queued job — and 288px cannot hold
 * one. Same radius, same fill, same shadow: it is the same floating surface.
 */
export const hoverCardContentClass =
  "menu-motion pointer-events-auto z-[var(--z-popper)] w-80 rounded-[var(--radius-panel)] border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-none";
