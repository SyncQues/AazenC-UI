import { cva, type VariantProps } from "class-variance-authority";

/** SyncQues desktop chrome: transparent header, one frosted pill around the links. */
export const navbarGlassSurface =
  "border border-border bg-background/90 shadow-[0_8px_28px_rgba(0,0,0,0.10)] ring-1 ring-foreground/5 backdrop-blur-xl dark:bg-background/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]";

export const navbarVariants = cva("z-[var(--z-sticky)]", {
  variants: {
    variant: {
      bar: "sticky top-0 border-b border-border bg-background/80 backdrop-blur-md",
      floating: "pointer-events-none fixed inset-x-0 top-0 bg-transparent",
    },
  },
  defaultVariants: { variant: "bar" },
});

export const navbarRowClass = "mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-6";

export const navbarBrandVariants = cva(
  "shrink-0 text-sm font-semibold tracking-tight text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        bar: "",
        floating: `pointer-events-auto inline-flex h-11 items-center rounded-full px-3.5 ${navbarGlassSurface}`,
      },
    },
    defaultVariants: { variant: "bar" },
  },
);

export const navbarLinksVariants = cva("relative flex min-w-0 items-center gap-1", {
  variants: {
    variant: {
      bar: "flex-1 overflow-x-auto",
      floating: `pointer-events-auto h-11 w-fit rounded-full px-1 ${navbarGlassSurface}`,
    },
  },
  defaultVariants: { variant: "bar" },
});

export const navbarIndicatorClass =
  "pointer-events-none absolute top-0 left-0 z-0 rounded-full bg-primary/15 transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none";

export const navbarLinkClass =
  "relative z-10 shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:text-foreground motion-reduce:transition-none";

export const navbarActionsVariants = cva("flex shrink-0 items-center gap-2", {
  variants: {
    variant: {
      bar: "",
      floating: "pointer-events-auto ml-auto",
    },
  },
  defaultVariants: { variant: "bar" },
});

export type NavbarVariant = NonNullable<VariantProps<typeof navbarVariants>["variant"]>;
