"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type VariantProps } from "class-variance-authority";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  dialogBodyVariants,
  dialogCloseClass,
  dialogContentVariants,
  dialogDescriptionClass,
  dialogFooterVariants,
  dialogHeaderVariants,
  dialogOverlayClass,
  dialogTitleClass,
  type DialogKind,
  type DialogPadding,
  type DialogSize,
} from "./dialog-variants";

type DialogChrome = {
  padding: DialogPadding;
  close: boolean;
};

const DialogChromeContext = createContext<DialogChrome>({ padding: "default", close: true });

export type DialogProps = Omit<ComponentProps<typeof DialogPrimitive.Root>, "className">

export interface DialogTriggerProps
  extends Omit<ComponentProps<typeof DialogPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export interface DialogCloseProps
  extends Omit<ComponentProps<typeof DialogPrimitive.Close>, "className"> {
  asChild?: boolean;
}

export interface DialogContentProps
  extends Omit<ComponentProps<typeof DialogPrimitive.Content>, "className">,
    VariantProps<typeof dialogContentVariants> {
  /** Dialog can be dismissed. Alert stays up until an action closes it. */
  kind?: DialogKind;
  /** Close button. Alerts hide it unless this is set. */
  close?: boolean;
}

export type DialogHeaderProps = Omit<ComponentProps<"div">, "className">

export type DialogBodyProps = Omit<ComponentProps<"div">, "className">

export type DialogFooterProps = Omit<ComponentProps<"div">, "className">

export type DialogTitleProps = Omit<ComponentProps<typeof DialogPrimitive.Title>, "className">

export type DialogDescriptionProps = Omit<ComponentProps<typeof DialogPrimitive.Description>, "className">

function DialogCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ asChild = false, ...props }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" asChild={asChild} {...props} />;
}

function DialogClose({ asChild = false, ...props }: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" asChild={asChild} {...props} />;
}

function DialogContent({
  size,
  padding,
  kind = "dialog",
  close,
  role,
  children,
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: DialogContentProps) {
  const resolvedPadding: DialogPadding = padding ?? "default";
  const showClose = close ?? kind !== "alert";
  const blockDismiss = kind === "alert";

  return (
    <DialogPrimitive.Portal>
      <div className="dialog-presence pointer-events-none fixed inset-0 z-[var(--z-overlay)]">
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={dialogOverlayClass} />
        <DialogChromeContext.Provider value={{ padding: resolvedPadding, close: showClose }}>
          <DialogPrimitive.Content
            data-slot="dialog-content"
            data-size={size ?? "default"}
            data-padding={resolvedPadding}
            data-kind={kind}
            {...(kind === "alert" || role ? { role: role ?? "alertdialog" } : {})}
            className={cn(dialogContentVariants({ size, padding: resolvedPadding }))}
            onPointerDownOutside={(event) => {
              if (blockDismiss) event.preventDefault();
              onPointerDownOutside?.(event);
            }}
            onEscapeKeyDown={(event) => {
              if (blockDismiss) event.preventDefault();
              onEscapeKeyDown?.(event);
            }}
            {...props}
          >
            {children}
            {showClose ? (
              <DialogPrimitive.Close data-slot="dialog-close" className={dialogCloseClass}>
                <DialogCloseIcon />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            ) : null}
          </DialogPrimitive.Content>
        </DialogChromeContext.Provider>
      </div>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ children, ...props }: DialogHeaderProps) {
  const chrome = useContext(DialogChromeContext);
  return (
    <div
      data-slot="dialog-header"
      className={cn(dialogHeaderVariants({ padding: chrome.padding, close: chrome.close }))}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogBody({ children, ...props }: DialogBodyProps) {
  const chrome = useContext(DialogChromeContext);
  return (
    <div
      data-slot="dialog-body"
      className={cn(dialogBodyVariants({ padding: chrome.padding }))}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogFooter({ children, ...props }: DialogFooterProps) {
  const chrome = useContext(DialogChromeContext);
  return (
    <div
      data-slot="dialog-footer"
      className={cn(dialogFooterVariants({ padding: chrome.padding }))}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogTitle({ children, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" className={dialogTitleClass} {...props}>
      {children}
    </DialogPrimitive.Title>
  );
}

function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={dialogDescriptionClass}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

export type { DialogKind, DialogPadding, DialogSize };
export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
};
