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

export type DropdownMenuProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Root>, "className">

export interface DropdownMenuTriggerProps
  extends Omit<ComponentProps<typeof DropdownMenuPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export type DropdownMenuContentProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Content>, "className">

export interface DropdownMenuItemProps
  extends Omit<ComponentProps<typeof DropdownMenuPrimitive.Item>, "className"> {
  tone?: DropdownMenuTone;
}

export type DropdownMenuCheckboxItemProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>, "className">

export type DropdownMenuRadioItemProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.RadioItem>, "className">

export type DropdownMenuLabelProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Label>, "className">

export type DropdownMenuSeparatorProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Separator>, "className">

export type DropdownMenuShortcutProps = Omit<ComponentProps<"span">, "className">

export type DropdownMenuGroupProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Group>, "className">

export type DropdownMenuRadioGroupProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>, "className">

export type DropdownMenuSubProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.Sub>, "className">

export type DropdownMenuSubTriggerProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>, "className">

export type DropdownMenuSubContentProps = Omit<ComponentProps<typeof DropdownMenuPrimitive.SubContent>, "className">

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

function DropdownMenuContent({ sideOffset = 4, ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          data-presence=""
          sideOffset={sideOffset}
          className={dropdownMenuContentClass}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <DropdownMenuPrimitive.SubContent
          data-slot="dropdown-menu-sub-content"
          data-presence=""
          className={dropdownMenuContentClass}
          {...props}
        />
      </div>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({ tone = "default", ...props }: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-tone={tone}
      className={cn(dropdownMenuItemVariants({ tone }))}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ children, checked, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={dropdownMenuCheckboxItemClass}
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

function DropdownMenuRadioItem({ children, ...props }: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={dropdownMenuCheckboxItemClass} {...props}>
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="size-2 rounded-full bg-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel(props: DropdownMenuLabelProps) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={dropdownMenuLabelClass} {...props} />;
}

function DropdownMenuSeparator(props: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={dropdownMenuSeparatorClass} {...props} />
  );
}

function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  return <span data-slot="dropdown-menu-shortcut" className={dropdownMenuShortcutClass} {...props} />;
}

function DropdownMenuSubTrigger({ children, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger data-slot="dropdown-menu-sub-trigger" className={dropdownMenuSubTriggerClass} {...props}>
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
