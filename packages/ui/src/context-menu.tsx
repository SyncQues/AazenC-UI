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

/** A root, so no `className`: `ContextMenuPrimitive.Root` renders a provider, not an element. */
export type ContextMenuProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Root>, "className">

export interface ContextMenuTriggerProps
  extends Omit<ComponentProps<typeof ContextMenuPrimitive.Trigger>, "className"> {
  asChild?: boolean;
  className?: string;
}

export type ContextMenuContentProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Content>, "className"> & {
  className?: string;
}

export interface ContextMenuItemProps
  extends Omit<ComponentProps<typeof ContextMenuPrimitive.Item>, "className"> {
  tone?: ContextMenuTone;
  className?: string;
}

export type ContextMenuCheckboxItemProps = Omit<ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>, "className"> & {
  className?: string;
}

export type ContextMenuRadioItemProps = Omit<ComponentProps<typeof ContextMenuPrimitive.RadioItem>, "className"> & {
  className?: string;
}

export type ContextMenuLabelProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Label>, "className"> & {
  className?: string;
}

export type ContextMenuSeparatorProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Separator>, "className"> & {
  className?: string;
}

export type ContextMenuShortcutProps = Omit<ComponentProps<"span">, "className"> & {
  className?: string;
}

export type ContextMenuGroupProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Group>, "className"> & {
  className?: string;
}

export type ContextMenuRadioGroupProps = Omit<ComponentProps<typeof ContextMenuPrimitive.RadioGroup>, "className"> & {
  className?: string;
}

/** A sub-root wraps a `PopperPrimitive.Root` provider, so it takes no `className`. */
export type ContextMenuSubProps = Omit<ComponentProps<typeof ContextMenuPrimitive.Sub>, "className">

export type ContextMenuSubTriggerProps = Omit<ComponentProps<typeof ContextMenuPrimitive.SubTrigger>, "className"> & {
  className?: string;
}

export type ContextMenuSubContentProps = Omit<ComponentProps<typeof ContextMenuPrimitive.SubContent>, "className"> & {
  className?: string;
}

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

/**
 * A context menu follows the pointer, so Radix settles where it goes and does not let
 * it be argued with: `side`, `align` and `sideOffset` are omitted from
 * `ContextMenuContentProps` (`@radix-ui/react-context-menu` `index.d.ts:26`), which is
 * why there is nothing to pass here. Its own runtime default is `align: "start"`,
 * `sideOffset: 2`, and that 2px is the whole difference from a dropdown — the panels are
 * otherwise the same class, which is the point of `menu-variants`.
 */
function ContextMenuContent({ className, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <ContextMenuPrimitive.Content
          data-slot="context-menu-content"
          data-presence=""
          className={cn(contextMenuContentClass, className)}
          {...props}
        />
      </div>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuSubContent({ className, ...props }: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <ContextMenuPrimitive.SubContent
          data-slot="context-menu-sub-content"
          data-presence=""
          className={cn(contextMenuContentClass, className)}
          {...props}
        />
      </div>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ tone = "default", className, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-tone={tone}
      className={cn(contextMenuItemVariants({ tone }), className)}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ children, checked, className, ...props }: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(contextMenuCheckboxItemClass, className)}
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

function ContextMenuRadioItem({ children, className, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(contextMenuCheckboxItemClass, className)}
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

function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" className={cn(contextMenuLabelClass, className)} {...props} />;
}

function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn(contextMenuSeparatorClass, className)} {...props} />
  );
}

function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  return <span data-slot="context-menu-shortcut" className={cn(contextMenuShortcutClass, className)} {...props} />;
}

function ContextMenuSubTrigger({ children, className, ...props }: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" className={cn(contextMenuSubTriggerClass, className)} {...props}>
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
