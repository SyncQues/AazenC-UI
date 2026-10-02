"use client";

import { Button } from "@aazenc/ui/button";
import { Carousel, CarouselItem } from "@aazenc/ui/carousel";
import { useTheme } from "@aazenc/themes";

const slides = [
  { title: "Hiring", detail: "Open roles this week" },
  { title: "Interviews", detail: "Three panels scheduled" },
  { title: "Offers", detail: "One waiting on a reply" },
];

export function CarouselPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Carousel</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One horizontal frame. Previous, next, and the dots move between slides.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 max-w-xl">
      <Carousel label="Pipeline">
        {slides.map((slide) => (
          <CarouselItem key={slide.title}>
            <div className="flex h-56 flex-col justify-end bg-foreground/10 p-6">
              <p className="text-sm text-muted-foreground">{slide.detail}</p>
              <h2 className="text-2xl font-semibold">{slide.title}</h2>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
      </div>
    </main>
  );
}
