import { type ComponentProps } from "react";
import {
  emptyClass,
  emptyContentClass,
  emptyDescriptionClass,
  emptyHeaderClass,
  emptyMediaClass,
  emptyTitleClass,
} from "./empty-variants";

export type EmptyProps = Omit<ComponentProps<"div">, "className">
export type EmptyHeaderProps = Omit<ComponentProps<"div">, "className">
export type EmptyMediaProps = Omit<ComponentProps<"div">, "className">
export type EmptyTitleProps = Omit<ComponentProps<"div">, "className">
export type EmptyDescriptionProps = Omit<ComponentProps<"p">, "className">
export type EmptyContentProps = Omit<ComponentProps<"div">, "className">

function Empty(props: EmptyProps) {
  return <div data-slot="empty" className={emptyClass} {...props} />;
}

function EmptyHeader(props: EmptyHeaderProps) {
  return <div data-slot="empty-header" className={emptyHeaderClass} {...props} />;
}

function EmptyMedia(props: EmptyMediaProps) {
  return <div data-slot="empty-media" className={emptyMediaClass} {...props} />;
}

function EmptyTitle(props: EmptyTitleProps) {
  return <div data-slot="empty-title" className={emptyTitleClass} {...props} />;
}

function EmptyDescription(props: EmptyDescriptionProps) {
  return <p data-slot="empty-description" className={emptyDescriptionClass} {...props} />;
}

function EmptyContent(props: EmptyContentProps) {
  return <div data-slot="empty-content" className={emptyContentClass} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
