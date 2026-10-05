"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { checkboxClass, checkboxIndicatorClass } from "./checkbox-variants";

export interface CheckboxProps extends Omit<ComponentProps<typeof CheckboxPrimitive.Root>, "className"> {
  /** Marks the box invalid. Same box either way this is set. */
  invalid?: boolean;
  className?: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="hidden size-3.5 group-data-[state=checked]/checkbox:block">
      <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="hidden size-3 group-data-[state=indeterminate]/checkbox:block">
      <path d="M6 12h12" strokeLinecap="round" />
    </svg>
  );
}

function Checkbox({ invalid = false, "aria-invalid": ariaInvalid, className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(checkboxClass, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className={checkboxIndicatorClass}>
        <CheckIcon />
        <MinusIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
