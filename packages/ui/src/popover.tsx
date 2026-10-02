"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentProps } from "react";
import { popoverContentClass } from "./popover-variants";

export type PopoverProps = Omit<ComponentProps<typeof PopoverPrimitive.Root>, "className">;

export interface PopoverTriggerProps extends Omit<ComponentProps<typeof PopoverPrimitive.Trigger>, "className"> {
  asChild?: boolean;
}

export type PopoverContentProps = Omit<ComponentProps<typeof PopoverPrimitive.Content>, "className">;

export type PopoverAnchorProps = Omit<ComponentProps<typeof PopoverPrimitive.Anchor>, "className">;

function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ asChild = false, ...props }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" asChild={asChild} {...props} />;
}

function PopoverAnchor(props: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({ align = "center", sideOffset = 8, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
        <PopoverPrimitive.Content
          data-slot="popover-content"
          data-presence=""
          align={align}
          sideOffset={sideOffset}
          className={popoverContentClass}
          {...props}
        />
      </div>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
