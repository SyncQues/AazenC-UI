"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import { separatorVariants, type SeparatorOrientation } from "./separator-variants";

export interface SeparatorProps
  extends Omit<ComponentProps<typeof SeparatorPrimitive.Root>, "className" | "orientation">,
    VariantProps<typeof separatorVariants> {
  /** horizontal draws across its container, vertical draws down it. */
  orientation?: SeparatorOrientation;
  /**
   * Default true. Pass false for a rule that divides two groups, not a rule inside
   * one: that is the difference between role="none" and role="separator", and it is
   * all the a11y this component has. It still takes no focus — the rule is static.
   */
  decorative?: boolean;
}

function Separator({ orientation, decorative = true, ...props }: SeparatorProps) {
  const resolvedOrientation: SeparatorOrientation = orientation ?? "horizontal";

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={resolvedOrientation}
      decorative={decorative}
      className={separatorVariants({ orientation: resolvedOrientation })}
      {...props}
    />
  );
}

export { Separator };
