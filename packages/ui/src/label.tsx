"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { type ComponentProps, type ReactNode } from "react";
import { labelClass } from "./label-variants";

export interface LabelProps extends Omit<ComponentProps<typeof LabelPrimitive.Root>, "className"> {
  /** Shows a required mark. The caption stays the same size. */
  required?: boolean;
  children?: ReactNode;
}

function Label({ required = false, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root data-slot="label" className={labelClass} {...props}>
      {children}
      {required ? (
        <span data-slot="label-required" className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
}

export { Label };
