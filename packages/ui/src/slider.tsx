"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { meterFillClass, meterTrackClass, sliderRootClass, sliderThumbClass } from "./meter-variants";

export interface SliderProps extends Omit<ComponentProps<typeof SliderPrimitive.Root>, "className"> {
  /** One name per thumb. Used for range sliders. */
  thumbAriaLabels?: string[];
  className?: string;
}

function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  thumbAriaLabels,
  className,
  ...props
}: SliderProps) {
  const current = value ?? defaultValue ?? [min];
  const thumbs = current.length > 0 ? current : [min];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(sliderRootClass, className)}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className={meterTrackClass}>
        <SliderPrimitive.Range data-slot="slider-range" className={`absolute ${meterFillClass}`} />
      </SliderPrimitive.Track>
      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className={sliderThumbClass}
          aria-label={
            thumbAriaLabels?.[index] ??
            (thumbs.length === 1
              ? ariaLabel
              : ariaLabel
                ? `${ariaLabel} ${index === 0 ? "minimum" : index === thumbs.length - 1 ? "maximum" : index + 1}`
                : undefined)
          }
          aria-labelledby={thumbs.length === 1 ? ariaLabelledBy : undefined}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
