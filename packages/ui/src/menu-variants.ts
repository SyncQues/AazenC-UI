import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues menu, shared by the dropdown and the context menu.
 *
 * A right-click menu and a click menu are the same panel reached two ways, so
 * there is one set of classes here under two names. A second copy of these
 * strings is how the two menus start disagreeing about padding.
 *
 * Destructive is the only item tone that reads differently, and the tone axis
 * stays shared so a new tone cannot land in one menu and not the other.
 */
const MENU_PANEL =
  "menu-motion pointer-events-auto z-[var(--z-popper)] min-w-32 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-popover p-1.5 text-popover-foreground shadow-md outline-none";

const menuItemVariants = cva(
  "relative flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm outline-none select-none transition-colors duration-150 ease-out focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        default: "",
        destructive:
          "text-destructive focus:bg-destructive/10 focus:text-destructive dark:text-[oklch(0.78_0.16_25)] dark:focus:text-[oklch(0.78_0.16_25)]",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

const MENU_CHECKABLE = "relative flex cursor-pointer items-center rounded-full py-1.5 pr-3 pl-8 text-sm outline-none select-none transition-colors duration-150 ease-out focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 motion-reduce:transition-none";

const MENU_LABEL = "px-2 py-1.5 text-sm font-semibold";

const MENU_SEPARATOR = "bg-border mx-2 my-1 h-px";

const MENU_SHORTCUT = "ml-auto text-xs tracking-widest text-muted-foreground";

const MENU_SUB_TRIGGER =
  "flex cursor-pointer items-center rounded-full px-3 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent";

export const dropdownMenuContentClass = MENU_PANEL;
export const contextMenuContentClass = MENU_PANEL;

export const dropdownMenuItemVariants = menuItemVariants;
export const contextMenuItemVariants = menuItemVariants;

export const dropdownMenuCheckboxItemClass = MENU_CHECKABLE;
export const contextMenuCheckboxItemClass = MENU_CHECKABLE;

export const dropdownMenuLabelClass = MENU_LABEL;
export const contextMenuLabelClass = MENU_LABEL;

export const dropdownMenuSeparatorClass = MENU_SEPARATOR;
export const contextMenuSeparatorClass = MENU_SEPARATOR;

export const dropdownMenuShortcutClass = MENU_SHORTCUT;
export const contextMenuShortcutClass = MENU_SHORTCUT;

export const dropdownMenuSubTriggerClass = MENU_SUB_TRIGGER;
export const contextMenuSubTriggerClass = MENU_SUB_TRIGGER;

export type MenuItemVariantProps = VariantProps<typeof menuItemVariants>;
export type MenuItemTone = NonNullable<MenuItemVariantProps["tone"]>;

export type DropdownMenuItemVariantProps = MenuItemVariantProps;
export type DropdownMenuTone = MenuItemTone;
export type ContextMenuItemVariantProps = MenuItemVariantProps;
export type ContextMenuTone = MenuItemTone;
