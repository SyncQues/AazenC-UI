"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { type VariantProps } from "class-variance-authority";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  sheetBodyClass,
  sheetCloseClass,
  sheetContentVariants,
  sheetDescriptionClass,
  sheetFooterClass,
  sheetHeaderVariants,
  sheetOverlayClass,
  sheetTitleClass,
  type SheetSide,
} from "./sheet-variants";

type SheetChrome = { close: boolean };

const SheetChromeContext = createContext<SheetChrome>({ close: true });

export type SheetProps = Omit<ComponentProps<typeof SheetPrimitive.Root>, "className">

export interface SheetTriggerProps
  extends Omit<ComponentProps<typeof SheetPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export interface SheetCloseProps
  extends Omit<ComponentProps<typeof SheetPrimitive.Close>, "className"> {
  asChild?: boolean;
}

export interface SheetContentProps
  extends Omit<ComponentProps<typeof SheetPrimitive.Content>, "className">,
    VariantProps<typeof sheetContentVariants> {
  /** Which edge the panel is docked to. */
  side?: SheetSide;
  /** Close button. The overlay and the escape key still dismiss the sheet. */
  close?: boolean;
}

export type SheetHeaderProps = Omit<ComponentProps<"div">, "className">

export type SheetBodyProps = Omit<ComponentProps<"div">, "className">

export type SheetFooterProps = Omit<ComponentProps<"div">, "className">

export type SheetTitleProps = Omit<ComponentProps<typeof SheetPrimitive.Title>, "className">

export type SheetDescriptionProps = Omit<
  ComponentProps<typeof SheetPrimitive.Description>,
  "className"
>

function SheetCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
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

function SheetContent({ side, close, children, ...props }: SheetContentProps) {
  const resolvedSide: SheetSide = side ?? "right";
  const showClose = close ?? true;

  return (
    <SheetPrimitive.Portal>
      <div className="sheet-presence pointer-events-none fixed inset-0 z-[var(--z-overlay)]">
        <SheetPrimitive.Overlay data-slot="sheet-overlay" className={sheetOverlayClass} />
        <SheetChromeContext.Provider value={{ close: showClose }}>
          <SheetPrimitive.Content
            data-slot="sheet-content"
            data-side={resolvedSide}
            className={cn(sheetContentVariants({ side: resolvedSide }))}
            {...props}
          >
            {children}
            {showClose ? (
              <SheetPrimitive.Close data-slot="sheet-close" className={sheetCloseClass}>
                <SheetCloseIcon />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            ) : null}
          </SheetPrimitive.Content>
        </SheetChromeContext.Provider>
      </div>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ children, ...props }: SheetHeaderProps) {
  const chrome = useContext(SheetChromeContext);
  return (
    <div
      data-slot="sheet-header"
      className={cn(sheetHeaderVariants({ close: chrome.close }))}
      {...props}
    >
      {children}
    </div>
  );
}

function SheetBody({ children, ...props }: SheetBodyProps) {
  return (
    <div data-slot="sheet-body" className={sheetBodyClass} {...props}>
      {children}
    </div>
  );
}

function SheetFooter({ children, ...props }: SheetFooterProps) {
  return (
    <div data-slot="sheet-footer" className={sheetFooterClass} {...props}>
      {children}
    </div>
  );
}

function SheetTitle({ children, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title data-slot="sheet-title" className={sheetTitleClass} {...props}>
      {children}
    </SheetPrimitive.Title>
  );
}

function SheetDescription({ children, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={sheetDescriptionClass}
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
