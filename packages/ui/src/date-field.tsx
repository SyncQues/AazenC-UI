"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
import { dateFieldClass, datePanelClass } from "./calendar-variants";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0 text-muted-foreground">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0 text-muted-foreground">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface DateFieldProps extends Omit<ComponentProps<typeof PopoverPrimitive.Trigger>, "className" | "children"> {
  label: string;
  empty?: boolean;
  invalid?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: "date" | "time";
  children: ReactNode;
  className?: string;
}

function DateField({
  label,
  empty = false,
  invalid = false,
  open,
  onOpenChange,
  icon = "date",
  children,
  "aria-invalid": ariaInvalid,
  className,
  ...triggerProps
}: DateFieldProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} modal>
      <PopoverPrimitive.Trigger
        type="button"
        data-slot="date-field"
        data-empty={empty ? "true" : undefined}
        aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
        className={cn(dateFieldClass, className)}
        {...triggerProps}
      >
        {icon === "time" ? <ClockIcon /> : <CalendarIcon />}
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
          <PopoverPrimitive.Content
            data-slot="date-field-panel"
            data-presence=""
            align="start"
            sideOffset={8}
            collisionPadding={16}
            aria-label={label}
            className={datePanelClass}
          >
            {children}
          </PopoverPrimitive.Content>
        </div>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { DateField };
