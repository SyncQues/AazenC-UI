"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  radioGroupClass,
  radioGroupDotClass,
  radioGroupHorizontalClass,
  radioGroupIndicatorClass,
  radioGroupItemClass,
} from "./radio-group-variants";

export interface RadioGroupProps extends Omit<ComponentProps<typeof RadioGroupPrimitive.Root>, "className"> {
  /** Marks the group invalid. The circles stay the same shape. */
  invalid?: boolean;
  className?: string;
}

export interface RadioGroupItemProps extends Omit<ComponentProps<typeof RadioGroupPrimitive.Item>, "className"> {
  /** Marks this option invalid. Same circle either way this is set. */
  invalid?: boolean;
  className?: string;
}

function RadioGroup({
  invalid = false,
  "aria-invalid": ariaInvalid,
  orientation = "vertical",
  className,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation={orientation}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(radioGroupClass, orientation === "horizontal" && radioGroupHorizontalClass, className)}
      {...props}
    />
  );
}

function RadioGroupItem({ invalid = false, "aria-invalid": ariaInvalid, className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(radioGroupItemClass, className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className={radioGroupIndicatorClass}>
        <span aria-hidden="true" className={radioGroupDotClass} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
