import { Slot } from "@radix-ui/react-slot";
import { type ComponentProps, type ElementType } from "react";
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

/** `as` renders another tag; `asChild` adopts the child's tag and keeps our classes. */
type LayoutElementProps = {
  as?: ElementType;
  asChild?: boolean;
  className?: string;
} & Omit<ComponentProps<"div">, "className">;

export type BoxProps = LayoutElementProps;

/** The plain box. Everything here is one of these with a direction and a gap. */
export function Box({
  as: Tag = "div",
  asChild = false,
  className,
  ...props
}: BoxProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp data-slot="box" className={cn(boxClass, className)} {...props} />
  );
}

export type StackProps = Omit<StackVariantProps, "gap"> & {
  gap?: LayoutGap;
} & LayoutElementProps;

/** A column by default. `direction="row"` and `wrap` cover the rest of flex. */
export function Stack({
  as: Tag = "div",
  asChild = false,
  direction = "col",
  gap,
  align,
  wrap,
  className,
  ...props
}: StackProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      data-slot="stack"
      data-direction={direction}
      className={cn(
        stackVariants({ direction, gap: asVariantKey(gap), align, wrap }),
        className,
      )}
      {...props}
    />
  );
}

export type GridProps = Omit<GridVariantProps, "gap" | "columns"> & {
  gap?: LayoutGap;
  columns?: LayoutColumns;
} & LayoutElementProps;

/** Equal columns. Breakpoints are `className`: `md:grid-cols-3` wins over `columns`. */
export function Grid({
  as: Tag = "div",
  asChild = false,
  columns = "1",
  gap,
  className,
  ...props
}: GridProps) {
  const Comp = asChild ? Slot : Tag;
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
      {...props}
    />
  );
}

export type FlexProps = Omit<FlexVariantProps, "gap"> & {
  gap?: LayoutGap;
} & LayoutElementProps;

/** Raw flex. It has no gap by default; `Stack` is the one with rhythm. */
export function Flex({
  as: Tag = "div",
  asChild = false,
  direction = "row",
  gap,
  align,
  justify,
  wrap,
  className,
  ...props
}: FlexProps) {
  const Comp = asChild ? Slot : Tag;
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
      {...props}
    />
  );
}

export type CenterProps = CenterVariantProps & LayoutElementProps;

/** Centres one thing on both axes. `full` gives it a whole viewport to do it in. */
export function Center({
  as: Tag = "div",
  asChild = false,
  full,
  className,
  ...props
}: CenterProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      data-slot="center"
      className={cn(centerVariants({ full }), className)}
      {...props}
    />
  );
}

export type SplitProps = Omit<SplitVariantProps, "gap"> & {
  gap?: LayoutGap;
} & LayoutElementProps;

/** A heading at one end and its action at the other. Draggable is `resizable`. */
export function Split({
  as: Tag = "div",
  asChild = false,
  direction = "row",
  gap,
  align,
  className,
  ...props
}: SplitProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      data-slot="split"
      data-direction={direction}
      className={cn(
        splitVariants({ direction, gap: asVariantKey(gap), align }),
        className,
      )}
      {...props}
    />
  );
}

export type ContainerProps = ContainerVariantProps & LayoutElementProps;

/** The centred page column. `size` is a Tailwind `max-w` step; `prose` is a measure. */
export function Container({
  as: Tag = "div",
  asChild = false,
  size = "6xl",
  className,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      data-slot="container"
      data-size={size}
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  );
}

export type SpacerProps = SpacerVariantProps & LayoutElementProps;

/** Grows to push what follows to the far end. */
export function Spacer({
  as: Tag = "div",
  asChild = false,
  grow = true,
  className,
  ...props
}: SpacerProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp
      data-slot="spacer"
      className={cn(spacerVariants({ grow }), className)}
      {...props}
    />
  );
}
