import { cn } from "@aazenc/utils";

export interface PanelCloseIconProps {
  className?: string;
}

/** The one dismiss cross. Decorative: each caller supplies the `sr-only` name. */
export function PanelCloseIcon({ className }: PanelCloseIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={cn("size-4", className)}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}