import { cva, type VariantProps } from "class-variance-authority";

/**
 * AazenC Typeset.
 * A container class, not a set of component props. The CSS in `@aazenc/tokens`
 * styles whatever HTML sits inside, so this only picks a rhythm and a face.
 *
 * `preset` stays the three-knob presets; reach for a CSS custom property when
 * you need to tune one knob alone (`style={{ "--typeset-flow": "2.5em" }}`).
 */
export const typesetVariants = cva("typeset", {
  variants: {
    preset: {
      default: "",
      compact: "typeset-compact",
      chat: "typeset-chat",
      docs: "typeset-docs",
      reading: "typeset-reading",
      display: "typeset-display",
      large: "typeset-large",
    },
    measure: {
      default: "",
      narrow: "max-w-[34em]",
      wide: "max-w-[42em]",
    },
  },
  defaultVariants: {
    preset: "default",
    measure: "default",
  },
});

/** Opt-in ancestor. Container-relative sizing needs a query container above it. */
export const typesetFitClass = "typeset-fit";

/** Wrap a table wider than its column so it scrolls instead of compressing. */
export const typesetScrollClass = "typeset-scroll";

/** Gives an embedded component flow spacing without prose styling it. */
export const typesetEmbedClass = "typeset-embed";

/** Skips a subtree entirely, like `not-typeset` but from React. */
export const typesetNotClass = "not-typeset";

export type TypesetPreset = NonNullable<VariantProps<typeof typesetVariants>["preset"]>;
export type TypesetMeasure = NonNullable<
  VariantProps<typeof typesetVariants>["measure"]
>;
export type TypesetVariantProps = VariantProps<typeof typesetVariants>;
