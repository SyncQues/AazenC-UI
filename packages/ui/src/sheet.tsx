"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { type VariantProps } from "class-variance-authority";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { PanelCloseIcon } from "./panel-chrome-icon";
import {
  sheetBodyClass,
  sheetCloseClass,
  sheetContentVariants,
  sheetDefaultSide,
  sheetDescriptionClass,
  sheetFooterClass,
  sheetHeaderVariants,
  sheetOverlayClass,
  sheetTitleClass,
  type SheetSide,
} from "./sheet-variants";

type SheetChrome = { close: boolean };

const SheetChromeContext = createContext<SheetChrome>({ close: true });

/** A root, so no `className`: `SheetPrimitive.Root` renders a provider, not an element. */
export type SheetProps = Omit<ComponentProps<typeof SheetPrimitive.Root>, "className">

export interface SheetTriggerProps
  extends Omit<ComponentProps<typeof SheetPrimitive.Trigger>, "className"> {
  asChild?: boolean;
  className?: string;
}

export interface SheetCloseProps
  extends Omit<ComponentProps<typeof SheetPrimitive.Close>, "className"> {
  asChild?: boolean;
  className?: string;
}

export interface SheetContentProps
  extends ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  /** Re-declared to drop the `null` the cva's `VariantProps` widens the key with. */
  side?: SheetSide;
  /** Close button. The overlay and the escape key still dismiss the sheet. */
  close?: boolean;
  /**
   * An accessible name for a panel with no visible heading. Either this or a
   * `SheetTitle` is required; never guessed, since an invented name gets read.
   */
  title?: string;
}

export type SheetHeaderProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type SheetBodyProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type SheetFooterProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type SheetTitleProps = Omit<ComponentProps<typeof SheetPrimitive.Title>, "className"> & {
  className?: string;
}

export type SheetDescriptionProps = Omit<
  ComponentProps<typeof SheetPrimitive.Description>,
  "className"
> & {
  className?: string;
}

function Sheet({ ...props }: SheetProps) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ asChild = false, ...props }: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" asChild={asChild} {...props} />;
}

function SheetClose({ asChild = false, ...props }: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" asChild={asChild} {...props} />;
}

function SheetContent({ side, close, title, className, children, ...props }: SheetContentProps) {
  const resolvedSide: SheetSide = side ?? sheetDefaultSide;
  const showClose = close ?? true;

  return (
    <SheetPrimitive.Portal>
      <div className="sheet-presence pointer-events-none fixed inset-0 z-[var(--z-overlay)]">
        <SheetPrimitive.Overlay data-slot="sheet-overlay" className={sheetOverlayClass} />
        <SheetChromeContext.Provider value={{ close: showClose }}>
          <SheetPrimitive.Content
            data-slot="sheet-content"
            data-side={resolvedSide}
            className={cn(sheetContentVariants({ side: resolvedSide }), className)}
            {...props}
          >
            {title ? <SheetPrimitive.Title className="sr-only">{title}</SheetPrimitive.Title> : null}
            {children}
            {showClose ? (
              <SheetPrimitive.Close data-slot="sheet-close-button" className={sheetCloseClass}>
                <PanelCloseIcon />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            ) : null}
          </SheetPrimitive.Content>
        </SheetChromeContext.Provider>
      </div>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ children, className, ...props }: SheetHeaderProps) {
  const chrome = useContext(SheetChromeContext);
  return (
    <div
      data-slot="sheet-header"
      className={cn(sheetHeaderVariants({ close: chrome.close }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SheetBody({ children, className, ...props }: SheetBodyProps) {
  return (
    <div data-slot="sheet-body" className={cn(sheetBodyClass, className)} {...props}>
      {children}
    </div>
  );
}

function SheetFooter({ children, className, ...props }: SheetFooterProps) {
  return (
    <div data-slot="sheet-footer" className={cn(sheetFooterClass, className)} {...props}>
      {children}
    </div>
  );
}

function SheetTitle({ children, className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title data-slot="sheet-title" className={cn(sheetTitleClass, className)} {...props}>
      {children}
    </SheetPrimitive.Title>
  );
}

function SheetDescription({ children, className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(sheetDescriptionClass, className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Description>
  );
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  sheetContentVariants,
};
export type { SheetSide };
