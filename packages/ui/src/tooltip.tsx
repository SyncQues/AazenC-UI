"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { tooltipContentClass } from "./tooltip-variants";

export type TooltipProviderProps = Omit<ComponentProps<typeof TooltipPrimitive.Provider>, "className">;

export type TooltipProps = Omit<ComponentProps<typeof TooltipPrimitive.Root>, "className">;

export interface TooltipTriggerProps extends Omit<ComponentProps<typeof TooltipPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export interface TooltipContentProps extends Omit<ComponentProps<typeof TooltipPrimitive.Content>, "className"> {
  children?: ReactNode;
}

const TooltipProviderState = createContext(false);

function TooltipProvider({ delayDuration = 300, ...props }: TooltipProviderProps) {
  return (
    <TooltipProviderState.Provider value={true}>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
    </TooltipProviderState.Provider>
  );
}

function Tooltip(props: TooltipProps) {
  const nested = useContext(TooltipProviderState);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  if (nested) return root;
  return <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger({ asChild = false, ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" asChild={asChild} {...props} />;
}

function TooltipContent({ sideOffset = 6, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          data-presence=""
          sideOffset={sideOffset}
          className={tooltipContentClass}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-[var(--z-popper)] size-2.5 rotate-45 rounded-[2px] bg-primary fill-primary" />
        </TooltipPrimitive.Content>
      </div>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
