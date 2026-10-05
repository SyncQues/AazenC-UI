"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
import {
  toggleVariants,
  type ToggleSize,
  type ToggleVariant,
} from "./toggle-variants";

export interface ToggleProps extends Omit<
  ComponentProps<"button">,
  "value" | "children"
> {
  /** Controlled pressed state. Omit it to let the toggle keep its own. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  children?: ReactNode;
  className?: string;
}

/**
 * One button that stays down.
 *
 * A plain `<button>` with `aria-pressed`: Space and Enter come from the browser,
 * and `onPressedChange` hands back the *next* state, so it wires to a setter.
 */
function Toggle({
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  variant = "default",
  size = "default",
  // Pulled out rather than left in the spread so a form can still ask for a submit
  // toggle, while the attributes below stay this component's to decide.
  type = "button",
  className,
  onClick,
  children,
  ...props
}: ToggleProps) {
  // Latched on the first render, as `SegmentedControl` and `ToggleGroup` latch
  // it: a parent whose state arrives late must not discard the user's own press.
  const [isControlled] = useState(pressedProp !== undefined);
  const [uncontrolled, setUncontrolled] = useState(defaultPressed);
  const pressed = isControlled ? Boolean(pressedProp) : uncontrolled;

  return (
    <button
      // The caller's attributes land first: `aria-pressed` and `data-state` are the
      // toggle's whole outward contract, and a rest-spread that could replace either
      // would be able to describe a button as something it is not.
      {...props}
      type={type}
      aria-pressed={pressed}
      data-slot="toggle"
      data-state={pressed ? "on" : "off"}
      onClick={(event) => {
        onClick?.(event);
        // A caller that prevented the click has handled the press itself, which
        // is the only way to make a toggle read-only without removing the button.
        if (event.defaultPrevented) return;
        const next = !pressed;
        if (!isControlled) setUncontrolled(next);
        onPressedChange?.(next);
      }}
      className={cn(toggleVariants({ variant, size, pressed }), className)}
    >
      {children}
    </button>
  );
}

export { Toggle };
