"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@aazenc/utils";
import { PanelCloseIcon } from "./panel-chrome-icon";
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
  className?: string;
}

export interface DrawerCloseProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Close>, "className"> {
  asChild?: boolean;
  className?: string;
}

export interface DrawerContentProps
  extends Omit<ComponentProps<typeof DrawerPrimitive.Content>, "className"> {
  /** Close button. Swipe and the overlay still dismiss the sheet. */
  close?: boolean;
  className?: string;
}

export type DrawerHeaderProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type DrawerBodyProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type DrawerFooterProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

export type DrawerTitleProps = Omit<ComponentProps<typeof DrawerPrimitive.Title>, "className"> & {
  className?: string;
}

export type DrawerDescriptionProps = Omit<ComponentProps<typeof DrawerPrimitive.Description>, "className"> & {
  className?: string;
}

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

function DrawerContent({ children, close = true, className, ...props }: DrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={drawerOverlayClass} />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(drawerContentClass, className)}
        {...props}
      >
        <div data-slot="drawer-handle" className={drawerHandleClass} />
        <DrawerChromeContext.Provider value={{ close }}>
          {children}
          {close ? (
            <DrawerPrimitive.Close data-slot="drawer-close-button" className={drawerCloseClass}>
              <PanelCloseIcon />
              <span className="sr-only">Close</span>
            </DrawerPrimitive.Close>
          ) : null}
        </DrawerChromeContext.Provider>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  const { close } = useContext(DrawerChromeContext);
  return <div data-slot="drawer-header" className={cn(drawerHeaderClass, close && "pr-12", className)} {...props} />;
}

function DrawerBody({ className, ...props }: DrawerBodyProps) {
  return <div data-slot="drawer-body" className={cn(drawerBodyClass, className)} {...props} />;
}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return <div data-slot="drawer-footer" className={cn(drawerFooterClass, className)} {...props} />;
}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn(drawerTitleClass, className)} {...props} />;
}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description data-slot="drawer-description" className={cn(drawerDescriptionClass, className)} {...props} />
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
