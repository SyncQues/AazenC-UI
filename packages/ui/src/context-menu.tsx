"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  contextMenuCheckboxItemClass,
  contextMenuContentClass,
  contextMenuItemVariants,
  contextMenuLabelClass,
  contextMenuSeparatorClass,
  contextMenuShortcutClass,
  contextMenuSubTriggerClass,
  type ContextMenuTone,
} from "./menu-variants";

export type ContextMenuProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Root>, "className">

export interface ContextMenuTriggerProps
  extends Omit<ComponentProps<typeof ContextMenuPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export type ContextMenuContentProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Content>, "className">

export interface ContextMenuItemProps
  extends Omit<ComponentProps<typeof ContextMenuPrimitive.Item>, "className"> {
  tone?: ContextMenuTone;
}

export type ContextMenuCheckboxItemProps = Omit<ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>, "className">

export type ContextMenuRadioItemProps = Omit<ComponentProps<typeof ContextMenuPrimitive.RadioItem>, "className">

export type ContextMenuLabelProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Label>, "className">

export type ContextMenuSeparatorProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Separator>, "className">

export type ContextMenuShortcutProps = Omit<ComponentProps<"span">, "className">

export type ContextMenuGroupProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Group>, "className">

export type ContextMenuRadioGroupProps = Omit<ComponentProps<typeof ContextMenuPrimitive.RadioGroup>, "className">

export type ContextMenuSubProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Sub>, "className">

export type ContextMenuSubTriggerProps = Omit<ComponentProps<typeof ContextMenuPrimitive.SubTrigger>, "className">

export type ContextMenuSubContentProps = Omit<ComponentProps<typeof ContextMenuPrimitive.SubContent>, "className">

/** Same chevron and tick the dropdown draws, so the two panels read as one menu. */
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

function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({ asChild = false, ...props }: ContextMenuTriggerProps) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" asChild={asChild} {...props} />;
}

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuSub(props: ContextMenuSubProps) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

/** Radix strips the offset here, because a context menu follows the pointer. */
function ContextMenuContent(props: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <ContextMenuPrimitive.Content
          data-slot="context-menu-content"
          data-presence=""
          className={contextMenuContentClass}
          {...props}
        />
      </div>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuSubContent(props: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <ContextMenuPrimitive.SubContent
          data-slot="context-menu-sub-content"
          data-presence=""
          className={contextMenuContentClass}
          {...props}
        />
      </div>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ tone = "default", ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-tone={tone}
      className={cn(contextMenuItemVariants({ tone }))}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ children, checked, ...props }: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={contextMenuCheckboxItemClass}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <MenuCheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({ children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={contextMenuCheckboxItemClass}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <span className="size-2 rounded-full bg-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel(props: ContextMenuLabelProps) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" className={contextMenuLabelClass} {...props} />;
}

function ContextMenuSeparator(props: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={contextMenuSeparatorClass} {...props} />
  );
}

function ContextMenuShortcut(props: ContextMenuShortcutProps) {
  return <span data-slot="context-menu-shortcut" className={contextMenuShortcutClass} {...props} />;
}

function ContextMenuSubTrigger({ children, ...props }: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" className={contextMenuSubTriggerClass} {...props}>
      {children}
      <MenuChevronIcon />
    </ContextMenuPrimitive.SubTrigger>
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  contextMenuItemVariants,
};
export type { ContextMenuTone };
