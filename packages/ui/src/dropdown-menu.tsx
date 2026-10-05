"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  dropdownMenuCheckboxItemClass,
  dropdownMenuContentClass,
  dropdownMenuItemVariants,
  dropdownMenuLabelClass,
  dropdownMenuSeparatorClass,
  dropdownMenuShortcutClass,
  dropdownMenuSubTriggerClass,
  type DropdownMenuTone,
} from "./menu-variants";

/** A root, so no `className`: `DropdownMenuPrimitive.Root` renders a provider, not an element. */
export type DropdownMenuProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Root>, "className">

export interface DropdownMenuTriggerProps
  extends Omit<ComponentProps<typeof DropdownMenuPrimitive.Trigger>, "className"> {
  asChild?: boolean;
  className?: string;
}

export type DropdownMenuContentProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Content>, "className"> & {
  className?: string;
}

export interface DropdownMenuItemProps
  extends Omit<ComponentProps<typeof DropdownMenuPrimitive.Item>, "className"> {
  tone?: DropdownMenuTone;
  className?: string;
}

export type DropdownMenuCheckboxItemProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>, "className"> & {
  className?: string;
}

export type DropdownMenuRadioItemProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.RadioItem>, "className"> & {
  className?: string;
}

export type DropdownMenuLabelProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Label>, "className"> & {
  className?: string;
}

export type DropdownMenuSeparatorProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Separator>, "className"> & {
  className?: string;
}

export type DropdownMenuShortcutProps = Omit<ComponentProps<"span">, "className"> & {
  className?: string;
}

export type DropdownMenuGroupProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Group>, "className"> & {
  className?: string;
}

export type DropdownMenuRadioGroupProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>, "className"> & {
  className?: string;
}

/** A sub-root wraps a `PopperPrimitive.Root` provider, so it takes no `className`. */
export type DropdownMenuSubProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Sub>, "className">

export type DropdownMenuSubTriggerProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>, "className"> & {
  className?: string;
}

export type DropdownMenuSubContentProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.SubContent>, "className"> & {
  className?: string;
}

function MenuCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="size-4">
      <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="ml-auto size-4">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ asChild = false, ...props }: DropdownMenuTriggerProps) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" asChild={asChild} {...props} />;
}

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuContent({ sideOffset = 4, className, ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          data-presence=""
          sideOffset={sideOffset}
          className={cn(dropdownMenuContentClass, className)}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuSubContent({ className, ...props }: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <DropdownMenuPrimitive.SubContent
          data-slot="dropdown-menu-sub-content"
          data-presence=""
          className={cn(dropdownMenuContentClass, className)}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({ tone = "default", className, ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-tone={tone}
      className={cn(dropdownMenuItemVariants({ tone }), className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ children, checked, className, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(dropdownMenuCheckboxItemClass, className)}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <MenuCheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({ children, className, ...props }: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn(dropdownMenuCheckboxItemClass, className)} {...props}>
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="size-2 rounded-full bg-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn(dropdownMenuLabelClass, className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn(dropdownMenuSeparatorClass, className)} {...props} />
  );
}

function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  return <span data-slot="dropdown-menu-shortcut" className={cn(dropdownMenuShortcutClass, className)} {...props} />;
}

function DropdownMenuSubTrigger({ children, className, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" className={cn(dropdownMenuSubTriggerClass, className)} {...props}>
      {children}
      <MenuChevronIcon />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  dropdownMenuItemVariants,
};
export type { DropdownMenuTone };
