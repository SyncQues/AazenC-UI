"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@aazenc/utils";
import {
  drawerBodyClass,
  drawerCloseClass,
  drawerContentClass,
  drawerDescriptionClass,
  drawerFooterClass,
  drawerHandleClass,
  drawerHeaderClass,
  drawerOverlayClass,
  drawerTitleClass,
  type DrawerSide,
} from "./drawer-variants";

const DrawerChromeContext = createContext({ close: true });

export interface DrawerProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Root>, "className" | "direction"> {
  side?: DrawerSide;
}

export interface DrawerTriggerProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export interface DrawerCloseProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Close>, "className"> {
  asChild?: boolean;
}

export interface DrawerContentProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Content>, "className"> {
  /** Close button. Swipe and the overlay still dismiss the sheet. */
  close?: boolean;
}

export type DrawerHeaderProps = Omit<ComponentProps<"div">, "className">

export type DrawerBodyProps = Omit<ComponentProps<"div">, "className">

export type DrawerFooterProps = Omit<ComponentProps<"div">, "className">

export type DrawerTitleProps = Omit<ComponentProps<typeof DrawerPrimitive.Title>, "className">

export type DrawerDescriptionProps = Omit<ComponentProps<typeof DrawerPrimitive.Description>, "className">

function Drawer({ side = "bottom", shouldScaleBackground = false, ...props }: DrawerProps) {
  return (
    <DrawerPrimitive.Root
      {...({
        ...props,
        "data-slot": "drawer",
        direction: side,
        shouldScaleBackground,
      } as Parameters<typeof DrawerPrimitive.Root>[0])}
    />
  );
}

function DrawerTrigger({ asChild = false, ...props }: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" asChild={asChild} {...props} />;
}

function DrawerClose({ asChild = false, ...props }: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" asChild={asChild} {...props} />;
}

function DrawerCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function DrawerContent({ children, close = true, ...props }: DrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={drawerOverlayClass} />
      <DrawerPrimitive.Content data-slot="drawer-content" className={drawerContentClass} {...props}>
        <div data-slot="drawer-handle" className={drawerHandleClass} />
        <DrawerChromeContext.Provider value={{ close }}>
          {children}
          {close ? (
            <DrawerPrimitive.Close data-slot="drawer-close" className={drawerCloseClass}>
              <DrawerCloseIcon />
              <span className="sr-only">Close</span>
            </DrawerPrimitive.Close>
          ) : null}
        </DrawerChromeContext.Provider>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader(props: DrawerHeaderProps) {
  const { close } = useContext(DrawerChromeContext);
  return <div data-slot="drawer-header" className={cn(drawerHeaderClass, close && "pr-12")} {...props} />;
}

function DrawerBody(props: DrawerBodyProps) {
  return <div data-slot="drawer-body" className={drawerBodyClass} {...props} />;
}

function DrawerFooter(props: DrawerFooterProps) {
  return <div data-slot="drawer-footer" className={drawerFooterClass} {...props} />;
}

function DrawerTitle(props: DrawerTitleProps) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={drawerTitleClass} {...props} />;
}

function DrawerDescription(props: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description data-slot="drawer-description" className={drawerDescriptionClass} {...props} />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
export type { DrawerSide };
