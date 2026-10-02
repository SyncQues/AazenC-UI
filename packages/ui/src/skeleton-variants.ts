import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues placeholder.
 * One pulse. Line, circle, and block are the shapes that actually differ.
 * The many heights (h-3 through h-96) and corner radii collapse into those three.
 * Light --muted sits almost on the page, so the fill is foreground at 20%.
 */
export const skeletonShapes = ["line", "circle", "block"] as const;
export type SkeletonShape = (typeof skeletonShapes)[number];

export const skeletonWidths = ["short", "medium", "long", "full"] as const;
export type SkeletonWidth = (typeof skeletonWidths)[number];

export const skeletonVariants = cva("skeleton-motion bg-foreground/20", {
  variants: {
    shape: {
      line: "h-4 rounded-md",
      circle: "size-10 rounded-full",
      block: "h-24 rounded-lg",
    },
    width: {
      short: "w-16",
      medium: "w-40",
      long: "w-64",
      full: "w-full",
    },
  },
  compoundVariants: [
    { shape: "circle", className: "w-10" },
    { shape: "block", className: "w-full" },
  ],
  defaultVariants: {
    shape: "line",
    width: "medium",
  },
});

export type SkeletonVariantProps = VariantProps<typeof skeletonVariants>;
