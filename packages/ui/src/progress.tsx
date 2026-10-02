"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentProps, useEffect, useState } from "react";
import { meterFillClass, meterFillMotionClass, meterTrackClass } from "./meter-variants";

export type ProgressProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, "className">;

function Progress({ value = 0, max = 100, ...props }: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const amount =
    typeof value === "number" && Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0;
  const percent = (amount / safeMax) * 100;
  const [visual, setVisual] = useState(0);

  useEffect(() => {
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
        className={`${meterFillClass} ${meterFillMotionClass}`}
        style={{ width: `${visual}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
