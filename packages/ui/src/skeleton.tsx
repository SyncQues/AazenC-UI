import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  skeletonVariants,
  type SkeletonShape,
  type SkeletonWidth,
} from "./skeleton-variants";

export interface SkeletonProps extends Omit<ComponentProps<"div">, "className" | "children"> {
  shape?: SkeletonShape;
  /** Line length. Circles and blocks ignore this. */
  width?: SkeletonWidth;
  /** Repeats a line. Circles and blocks stay a single shape. */
  count?: number;
  className?: string;
}

function Skeleton({ shape = "line", width = "medium", count = 1, className, ...props }: SkeletonProps) {
  const repeats = shape === "line" ? Math.max(1, count) : 1;
  const baseClassName = cn(skeletonVariants({ shape, width }));

  if (repeats === 1) {
    return (
      <div
        data-slot="skeleton"
        data-shape={shape}
        aria-hidden="true"
        className={cn(baseClassName, className)}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="skeleton-group"
      className={cn("flex w-full flex-col gap-2", className)}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: repeats }, (_, index) => (
        <div key={index} data-slot="skeleton" data-shape={shape} className={baseClassName} />
      ))}
    </div>
  );
}

export { Skeleton, skeletonVariants };
export type { SkeletonShape, SkeletonWidth };
