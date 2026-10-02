import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  spinnerLabelClass,
  spinnerOverlayClass,
  spinnerVariants,
  type SpinnerSize,
} from "./spinner-variants";

export interface SpinnerProps extends Omit<ComponentProps<"svg">, "className"> {
  size?: SpinnerSize;
  /**
   * Names the wait for screen readers. Without a name the mark is decorative,
   * which is right inside a button that already says what it is doing.
   */
  label?: string;
}

export type SpinnerLabelProps = Omit<ComponentProps<"p">, "className">;
export type SpinnerOverlayProps = Omit<ComponentProps<"div">, "className">;

function Spinner({ size = "md", label, ...props }: SpinnerProps) {
  const name = props["aria-label"] ?? label;
  const named = typeof name === "string" && name.length > 0;

  return (
    <svg
      data-slot="spinner"
      viewBox="0 0 24 24"
      fill="none"
      role={props.role ?? (named ? "status" : undefined)}
      aria-label={named ? name : undefined}
      aria-hidden={named ? undefined : true}
      className={cn(spinnerVariants({ size }))}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerLabel(props: SpinnerLabelProps) {
  return <p data-slot="spinner-label" className={spinnerLabelClass} {...props} />;
}

function SpinnerOverlay(props: SpinnerOverlayProps) {
  return <div data-slot="spinner-overlay" className={spinnerOverlayClass} {...props} />;
}

export { Spinner, SpinnerLabel, SpinnerOverlay, spinnerVariants };
export type { SpinnerSize };
