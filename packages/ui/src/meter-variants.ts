/** Shared by the read-only progress bar and the slider. One track, one primary fill. */
export const meterTrackClass = "relative h-2 w-full overflow-hidden rounded-full bg-foreground/15";

export const meterFillClass = "h-full bg-primary";

/** Width eases in. Scale would squash the rounded leading edge. */
export const meterFillMotionClass =
  "rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none";

export const sliderRootClass =
  "relative flex w-full touch-none items-center select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

export const sliderThumbClass =
  "block size-5 shrink-0 rounded-full border border-primary bg-background shadow-sm outline-none transition-[box-shadow] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none motion-reduce:transition-none";
