import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues menu.
 * One panel. Slide-from-top and slide-from-bottom were the same menu.
 * Glass and heavier shadows were the same panel.
 * Destructive is the only item tone that reads differently.
 */
export const dropdownMenuContentClass =
  "menu-motion pointer-events-auto z-[var(--z-popper)] min-w-32 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-popover p-1.5 text-popover-foreground shadow-md outline-none";

export const dropdownMenuItemVariants = cva(
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

export const dropdownMenuCheckboxItemClass =
  "relative flex cursor-pointer items-center rounded-full py-1.5 pr-3 pl-8 text-sm outline-none select-none transition-colors duration-150 ease-out focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 motion-reduce:transition-none";

export const dropdownMenuLabelClass = "px-2 py-1.5 text-sm font-semibold";

export const dropdownMenuSeparatorClass = "bg-border mx-2 my-1 h-px";

export const dropdownMenuShortcutClass = "ml-auto text-xs tracking-widest text-muted-foreground";

export const dropdownMenuSubTriggerClass =
  "flex cursor-pointer items-center rounded-full px-3 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent";

export type DropdownMenuItemVariantProps = VariantProps<typeof dropdownMenuItemVariants>;
export type DropdownMenuTone = NonNullable<DropdownMenuItemVariantProps["tone"]>;
