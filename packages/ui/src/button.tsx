"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { buttonVariants } from "./button-variants";
import { Spinner } from "./spinner";

export interface ButtonProps
  extends Omit<ComponentProps<"button">, "className">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/** The button already names itself and carries the busy state, so the mark stays quiet. */
function ButtonSpinner() {
  return <Spinner size="sm" />;
}

function Button({
  variant,
  size,
  shape,
  width,
  align,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const iconOnly = typeof size === "string" && size.startsWith("icon");
  const className = cn(buttonVariants({ variant, size, shape, width, align }));

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        data-loading={loading ? "" : undefined}
        className={className}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-loading={loading ? "" : undefined}
      className={className}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <ButtonSpinner /> : null}
      {loading && iconOnly ? null : children}
    </button>
  );
}

export { Button, buttonVariants };
