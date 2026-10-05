import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  emptyClass,
  emptyContentClass,
  emptyDescriptionClass,
  emptyHeaderClass,
  emptyMediaClass,
  emptyTitleClass,
} from "./empty-variants";

export type EmptyProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}
export type EmptyHeaderProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}
export type EmptyMediaProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}
export type EmptyTitleProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}
export type EmptyDescriptionProps = Omit<ComponentProps<"p">, "className"> & {
  className?: string;
}
export type EmptyContentProps = Omit<ComponentProps<"div">, "className"> & {
  className?: string;
}

function Empty({ className, ...props }: EmptyProps) {
  return <div data-slot="empty" className={cn(emptyClass, className)} {...props} />;
}

function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return <div data-slot="empty-header" className={cn(emptyHeaderClass, className)} {...props} />;
}

function EmptyMedia({ className, ...props }: EmptyMediaProps) {
  return <div data-slot="empty-media" className={cn(emptyMediaClass, className)} {...props} />;
}

function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return <div data-slot="empty-title" className={cn(emptyTitleClass, className)} {...props} />;
}

function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return <p data-slot="empty-description" className={cn(emptyDescriptionClass, className)} {...props} />;
}

function EmptyContent({ className, ...props }: EmptyContentProps) {
  return <div data-slot="empty-content" className={cn(emptyContentClass, className)} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
