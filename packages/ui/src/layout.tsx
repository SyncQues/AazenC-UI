import { Slot } from "@radix-ui/react-slot";
import { type ComponentPropsWithRef, type ElementType } from "react";
import { cn } from "@aazenc/utils";
import {
  asVariantKey,
  boxClass,
  centerVariants,
  containerVariants,
  flexVariants,
  gridVariants,
  spacerVariants,
  splitVariants,
  stackVariants,
  type CenterVariantProps,
  type ContainerVariantProps,
  type FlexVariantProps,
  type GridVariantProps,
  type LayoutColumns,
  type LayoutGap,
  type SpacerVariantProps,
  type SplitVariantProps,
  type StackVariantProps,
} from "./layout-variants";

export {
  asVariantKey,
  boxClass,
  centerVariants,
  containerVariants,
  flexVariants,
  gridVariants,
  spacerVariants,
  splitVariants,
  stackVariants,
} from "./layout-variants";
export type {
  CenterVariantProps,
  ContainerSize,
  ContainerVariantProps,
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexVariantProps,
  GridColumns,
  GridVariantProps,
  LayoutColumns,
  LayoutGap,
  SpacerVariantProps,
  SplitAlign,
  SplitDirection,
  SplitVariantProps,
  StackAlign,
  StackDirection,
  StackVariantProps,
} from "./layout-variants";

/**
 * `as` renders another tag and re-types the props with it, so a Stack can be a
 * link; `asChild` adopts the child's tag and keeps our classes.
 */
type LayoutElementProps<E extends ElementType, OwnProps> = OwnProps & {
  as?: E;
  asChild?: boolean;
} & Omit<ComponentPropsWithRef<E>, keyof OwnProps | "as" | "asChild">;

/** The tag to render: the child's own element under `asChild`, otherwise `as`. */
const resolveTag = (as: ElementType | undefined, asChild: boolean): ElementType =>
  asChild ? Slot : (as ?? "div");

export type BoxProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  Record<never, never>
>;

/** The plain box. Everything here is one of these with a direction and a gap. */
export function Box<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  className,
  ...props
}: BoxProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="box"
      className={cn(boxClass, className)}
      {...(props as object)}
    />
  );
}

export type StackProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  Omit<StackVariantProps, "gap"> & { gap?: LayoutGap }
>;

/** A column by default. `direction="row"` and `wrap` cover the rest of flex. */
export function Stack<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  direction = "col",
  gap,
  align,
  wrap,
  className,
  ...props
}: StackProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="stack"
      data-direction={direction}
      className={cn(
        stackVariants({ direction, gap: asVariantKey(gap), align, wrap }),
        className,
      )}
      {...(props as object)}
    />
  );
}

export type GridProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  Omit<GridVariantProps, "gap" | "columns"> & {
    gap?: LayoutGap;
    columns?: LayoutColumns;
  }
>;

/** Equal columns. Breakpoints are `className`: `md:grid-cols-3` wins over `columns`. */
export function Grid<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  columns = "1",
  gap,
  className,
  ...props
}: GridProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="grid"
      className={cn(
        gridVariants({
          columns: asVariantKey(columns),
          gap: asVariantKey(gap),
        }),
        className,
      )}
      {...(props as object)}
    />
  );
}

export type FlexProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  Omit<FlexVariantProps, "gap"> & { gap?: LayoutGap }
>;

/** Raw flex. It has no gap by default; `Stack` is the one with rhythm. */
export function Flex<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  direction = "row",
  gap,
  align,
  justify,
  wrap,
  className,
  ...props
}: FlexProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="flex"
      data-direction={direction}
      className={cn(
        flexVariants({
          direction,
          gap: asVariantKey(gap),
          align,
          justify,
          wrap,
        }),
        className,
      )}
      {...(props as object)}
    />
  );
}

export type CenterProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  CenterVariantProps
>;

/** Centres one thing on both axes. `full` gives it a whole viewport to do it in. */
export function Center<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  full,
  className,
  ...props
}: CenterProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="center"
      className={cn(centerVariants({ full }), className)}
      {...(props as object)}
    />
  );
}

export type SplitProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  Omit<SplitVariantProps, "gap"> & { gap?: LayoutGap }
>;

/** A heading at one end and its action at the other. Draggable is `resizable`. */
export function Split<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  direction = "row",
  gap,
  align,
  className,
  ...props
}: SplitProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="split"
      data-direction={direction}
      className={cn(
        splitVariants({ direction, gap: asVariantKey(gap), align }),
        className,
      )}
      {...(props as object)}
    />
  );
}

export type ContainerProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  ContainerVariantProps
>;

/** The centred page column. `size` is a Tailwind `max-w` step; `prose` is a measure. */
export function Container<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  size = "6xl",
  className,
  ...props
}: ContainerProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="container"
      data-size={size}
      className={cn(containerVariants({ size }), className)}
      {...(props as object)}
    />
  );
}

export type SpacerProps<E extends ElementType = "div"> = LayoutElementProps<
  E,
  SpacerVariantProps
>;

/** Grows to push what follows to the far end. */
export function Spacer<E extends ElementType = "div">({
  as: Tag,
  asChild = false,
  grow = true,
  className,
  ...props
}: SpacerProps<E>) {
  const Comp = resolveTag(Tag, asChild);
  return (
    <Comp
      data-slot="spacer"
      className={cn(spacerVariants({ grow }), className)}
      {...(props as object)}
    />
  );
}
