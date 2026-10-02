"use client";

import { Command as CommandPrimitive } from "cmdk";
import { type ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  type DialogProps,
} from "./dialog";
import {
  commandClass,
  commandEmptyClass,
  commandGroupClass,
  commandInputClass,
  commandInputWrapperClass,
  commandItemClass,
  commandListClass,
  commandFilter,
  commandSeparatorClass,
  commandShortcutClass,
} from "./command-variants";

export type CommandProps = Omit<ComponentProps<typeof CommandPrimitive>, "className">

export interface CommandDialogProps extends Omit<DialogProps, "children"> {
  title?: string;
  description?: string;
  children?: ComponentProps<typeof CommandPrimitive>["children"];
}

export type CommandInputProps = Omit<ComponentProps<typeof CommandPrimitive.Input>, "className">

export type CommandListProps = Omit<ComponentProps<typeof CommandPrimitive.List>, "className">

export type CommandEmptyProps = Omit<ComponentProps<typeof CommandPrimitive.Empty>, "className">

export type CommandGroupProps = Omit<ComponentProps<typeof CommandPrimitive.Group>, "className">

export type CommandSeparatorProps = Omit<ComponentProps<typeof CommandPrimitive.Separator>, "className">

export type CommandItemProps = Omit<ComponentProps<typeof CommandPrimitive.Item>, "className">

export type CommandShortcutProps = Omit<ComponentProps<"span">, "className">

function CommandSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4 shrink-0 opacity-50">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function Command({ filter = commandFilter, ...props }: CommandProps) {
  return <CommandPrimitive data-slot="command" className={commandClass} filter={filter} {...props} />;
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run.",
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent padding="none">
        <div className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput(props: CommandInputProps) {
  return (
    <div data-slot="command-input-wrapper" className={commandInputWrapperClass}>
      <CommandSearchIcon />
      <CommandPrimitive.Input data-slot="command-input" className={commandInputClass} {...props} />
    </div>
  );
}

function CommandList(props: CommandListProps) {
  return <CommandPrimitive.List data-slot="command-list" className={commandListClass} {...props} />;
}

function CommandEmpty(props: CommandEmptyProps) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={commandEmptyClass} {...props} />;
}

function CommandGroup(props: CommandGroupProps) {
  return <CommandPrimitive.Group data-slot="command-group" className={commandGroupClass} {...props} />;
}

function CommandSeparator(props: CommandSeparatorProps) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={commandSeparatorClass} {...props} />;
}

function CommandItem(props: CommandItemProps) {
  return <CommandPrimitive.Item data-slot="command-item" className={commandItemClass} {...props} />;
}

function CommandShortcut(props: CommandShortcutProps) {
  return <span data-slot="command-shortcut" className={commandShortcutClass} {...props} />;
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
