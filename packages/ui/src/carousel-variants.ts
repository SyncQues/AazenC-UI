export const carouselFrameClass = "relative overflow-hidden rounded-[var(--radius-panel)]";

export const carouselTrackClass =
  "flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto";

export const carouselItemClass = "min-w-full shrink-0 snap-start";

export const carouselDotClass =
  "grid size-6 place-items-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active=true]:bg-primary/20";

export const carouselDotMarkClass =
  "size-2 rounded-full bg-foreground/45 transition-transform group-data-[active=true]:scale-125 group-data-[active=true]:bg-primary motion-reduce:transition-none";
