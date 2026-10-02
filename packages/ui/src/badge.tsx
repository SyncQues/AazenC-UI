"use client";

import { Slot } from "@radix-ui/react-slot";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { badgeVariants, type BadgeVariant } from "./badge-variants";

export interface BadgeProps extends Omit<ComponentProps<"span">, "className"> {
  variant?: BadgeVariant;
  /** Render the mark as the child element. The look stays the same. */
  asChild?: boolean;
}

function Badge({ variant = "default", asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }))} {...props} />;
}

export { Badge, badgeVariants };
