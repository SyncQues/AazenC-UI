"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ComponentProps } from "react";
import { meterFillClass, meterTrackClass, sliderRootClass, sliderThumbClass } from "./meter-variants";

export type SliderProps = Omit<ComponentProps<typeof SliderPrimitive.Root>, "className">;

function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
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
      className={sliderRootClass}
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
          aria-label={thumbs.length === 1 ? ariaLabel : undefined}
          aria-labelledby={thumbs.length === 1 ? ariaLabelledBy : undefined}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
