"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentProps, useEffect, useState } from "react";
import { meterFillClass, meterFillMotionClass, meterTrackClass } from "./meter-variants";
import { clampProgress } from "./progress-utils";

export type ProgressProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, "className">;

function Progress({ value, max = 100, ...props }: ProgressProps) {
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
    <ProgressPrimitive.Root data-slot="progress" value={amount} max={safeMax} className={meterTrackClass} {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={`${meterFillClass} ${percent == null ? "w-1/3 animate-pulse motion-reduce:animate-none" : meterFillMotionClass}`}
        style={percent == null ? undefined : { width: `${visual}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
