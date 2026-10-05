"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "@aazenc/utils";
import { meterFillClass, meterFillMotionClass, meterTrackClass } from "./meter-variants";
import { clampProgress } from "./progress-utils";

export type ProgressProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, "className"> & {
  className?: string;
};

function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const amount = clampProgress(value, max);
  const safeMax = max > 0 ? max : 100;
  const percent = amount == null ? null : (amount / safeMax) * 100;
  const [visual, setVisual] = useState(percent ?? 0);

  useEffect(() => {
    if (percent == null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisual(percent);
      return;
    }
    const id = requestAnimationFrame(() => setVisual(percent));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={amount}
      max={safeMax}
      className={cn(meterTrackClass, className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={`${meterFillClass} ${percent == null ? "w-1/3 animate-pulse motion-reduce:animate-none" : meterFillMotionClass}`}
        style={percent == null ? undefined : { width: `${visual}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
