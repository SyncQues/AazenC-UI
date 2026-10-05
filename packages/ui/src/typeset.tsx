import { createElement, type ComponentProps, type ElementType } from "react";
import { cn } from "@aazenc/utils";
import {
  typesetFitClass,
  typesetVariants,
  type TypesetVariantProps,
} from "./typeset-variants";

export {
  typesetEmbedClass,
  typesetFitClass,
  typesetNotClass,
  typesetScrollClass,
  typesetVariants,
} from "./typeset-variants";
export type {
  TypesetMeasure,
  TypesetPreset,
  TypesetVariantProps,
} from "./typeset-variants";

/**
 * Prose container. Styles the HTML inside it, so the value over a bare
 * `className="typeset"` is the preset, the measure, and a typed `as`.
 *
 * Takes `className` like every component here, and leans on it harder than most: a
 * prose column is a layout box, so callers need to set width, grid, and flex on it.
 */
export function Typeset({
  as: Tag = "div",
  preset,
  measure,
  className,
  ...props
}: TypesetVariantProps & {
  as?: ElementType;
  className?: string;
} & Omit<ComponentProps<"div">, "className">) {
  return createElement(Tag, {
    ...props,
    className: cn(typesetVariants({ preset, measure }), className),
  });
}

/**
 * Opt-in ancestor for `Typeset`. Narrow typesets get a readability bump based
 * on their own width, so a chat bubble and a docs column size independently of
 * the viewport. Only needed when a prose column can render narrow.
 */
export function TypesetFit({
  as: Tag = "div",
  className,
  ...props
}: {
  as?: ElementType;
  className?: string;
} & Omit<ComponentProps<"div">, "className">) {
  return createElement(Tag, {
    ...props,
    className: cn(typesetFitClass, className),
  });
}
