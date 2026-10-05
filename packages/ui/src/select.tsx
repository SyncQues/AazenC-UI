"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  selectContentClass,
  selectIconClass,
  selectItemClass,
  selectLabelClass,
  selectScrollButtonClass,
  selectSeparatorClass,
  selectTriggerClass,
  selectViewportClass,
} from "./select-variants";

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>

export type SelectGroupProps = Omit<ComponentProps<typeof SelectPrimitive.Group>, "className"> & {
  className?: string;
}

/**
 * No `className`, and the omission is load-bearing rather than an oversight:
 * Radix destructures `className` off `Value` and never re-applies it
 * (`@radix-ui/react-select` `index.mjs:236`), so accepting one would type-check
 * and then render nothing. Style the `SelectTrigger`'s children instead.
 */
export type SelectValueProps = Omit<ComponentProps<typeof SelectPrimitive.Value>, "className">

export interface SelectTriggerProps extends Omit<ComponentProps<typeof SelectPrimitive.Trigger>, "className"> {
  /** Marks the field invalid. Same pill either way this is set. */
  invalid?: boolean;
  className?: string;
}

export type SelectContentProps = Omit<ComponentProps<typeof SelectPrimitive.Content>, "className" | "position"> & {
  className?: string;
}

export type SelectLabelProps = Omit<ComponentProps<typeof SelectPrimitive.Label>, "className"> & {
  className?: string;
}

export type SelectItemProps = Omit<ComponentProps<typeof SelectPrimitive.Item>, "className"> & {
  className?: string;
}

export type SelectSeparatorProps = Omit<ComponentProps<typeof SelectPrimitive.Separator>, "className"> & {
  className?: string;
}

function ChevronIcon({ direction }: { direction: "down" | "up" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={direction === "down" ? selectIconClass : "size-4"}>
      {direction === "down" ? (
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-4">
      <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Select(props: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectGroup(props: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ invalid = false, "aria-invalid": ariaInvalid, children, className, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(selectTriggerClass, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronIcon direction="down" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollUpButton() {
  return (
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up" className={selectScrollButtonClass}>
      <ChevronIcon direction="up" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton() {
  return (
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down" className={selectScrollButtonClass}>
      <ChevronIcon direction="down" />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectContent({ sideOffset = 4, children, className, ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <SelectPrimitive.Content
          data-slot="select-content"
          data-presence=""
          position="popper"
          sideOffset={sideOffset}
          className={cn(selectContentClass, className)}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport className={selectViewportClass}>{children}</SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </div>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn(selectLabelClass, className)} {...props} />;
}

function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(selectItemClass, className)} {...props}>
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn(selectSeparatorClass, className)} {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
