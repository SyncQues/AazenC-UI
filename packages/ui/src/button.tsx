"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { buttonVariants } from "./button-variants";

export interface ButtonProps
  extends Omit<ComponentProps<"button">, "className">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function ButtonSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4 animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
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
