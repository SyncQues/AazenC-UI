"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentProps } from "react";
import { switchClass, switchThumbClass } from "./switch-variants";

export type SwitchProps = Omit<ComponentProps<typeof SwitchPrimitive.Root>, "className">;

function Switch(props: SwitchProps) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={switchClass} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbClass} />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
