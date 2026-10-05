"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { switchClass, switchThumbClass } from "./switch-variants";

export type SwitchProps = Omit<ComponentProps<typeof SwitchPrimitive.Root>, "className"> & {
  className?: string;
};

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn(switchClass, className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbClass} />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
