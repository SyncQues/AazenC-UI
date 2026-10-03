import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues segmented control.
 *
 * One control, one answer. The state row on a chart storyboard, the curve picker,
 * the range filter — these are all a row of exclusive options that someone has to
 * choose between, and each one was a hand-rolled map over `Button` that swapped
 * `default` for `outline`. The mark is what makes this a component rather than a
 * row of buttons: one pill slides behind the chosen option, so the choice is
 * legible as a position in the row, not just as a fill difference.
 *
 * `segmented` is the track-and-mark bar from `tabs-variants` — a muted rounded
 * track that holds the options with the primary pill behind the active one.
 * `outline` is the loose version: no track, every option carries its own border,
 * and the mark still slides. Both are the same mechanism on purpose; a second
 * mechanism for the loose row is how the two drift apart.
 *
 * Not a `ToggleGroup`: a toggle group is multi-select, and every one of these rows
 * has exactly one answer. Not a `Tabs`: a tab switches panels, and these switch
 * props. Not a `Badge`: a badge is a non-interactive mark, and these are pressed.
 */

/**
 * The track. `isolate` because the mark is absolutely positioned against it and
 * the row also carries its own stacking context from the z-10 items.
 */
export const segmentedControlVariants = cva(
  [
    "relative isolate inline-flex w-max max-w-full items-center rounded-full",
    "outline-none transition-[background-color,border-color,box-shadow] duration-300 ease-out",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        // A hairline above the fill rather than a drop shadow under it. A shadow
        // on a pill inside a pill double-darkens the seam the track is meant to
        // hide; a top highlight is what makes the track read as a surface.
        segmented:
          "gap-1 border border-border/80 bg-muted/70 p-1 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.55)] dark:bg-muted/40 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)]",
        // The chip row from `tabs-variants`: every option is its own soft pill and
        // the chosen one goes transparent for the mark. Same mark, no track.
        pill: "gap-1.5 border border-transparent bg-transparent p-1 shadow-none",
        // The loose row: separate chips on the page's own background, so they
        // read as buttons that happen to be exclusive rather than as tabs.
        outline: "gap-1.5 border border-transparent bg-transparent p-0 shadow-none",
      },
    },
    defaultVariants: {
      variant: "segmented",
    },
  },
);

/**
 * One option.
 *
 * The resting look is entirely the variant's business; the chosen look is
 * deliberately *not* restated here. The mark is already the primary pill behind
 * this option, so restating `bg-primary` here would stack a second, un-animated
 * fill exactly on top of the one that is sliding. The chosen option only changes
 * its ink and drops its own border so the mark can show through — that is the
 * whole difference between the two states.
 */
export const segmentedControlItemVariants = cva(
  [
    "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5",
    "whitespace-nowrap font-medium",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    // The press is the only motion a pointer-driven control gets, and it has to
    // be there: without it a click on a control this small reads as a miss.
    "active:scale-[0.97] motion-reduce:active:scale-100",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ],
  {
    variants: {
      // The variant axis carries no styles of its own. What an option looks like
      // is a function of the variant *and* whether it is chosen — six
      // combinations, none of which is the other plus a delta — so the whole
      // matrix lives in `compoundVariants` below rather than being spread across
      // two axes that never quite line up. (Nesting `true`/`false` under the
      // variant keys instead is the mistake this shape exists to prevent: cva
      // reads that as a nested object and emits the literal strings "true" and
      // "false" as classes.)
      //
      // Every key the track has to be declared here too, even the empty ones, or
      // this axis's type rejects the track's variants and the component only
      // compiles with the variants that happen to share a key.
      variant: {
        segmented: "",
        pill: "",
        outline: "",
      },
      selected: {
        true: "",
        false: "",
      },
      size: {
        sm: "h-7 px-3 text-xs has-[>svg]:px-2.5",
        default: "h-8 px-3.5 text-sm has-[>svg]:px-3",
        lg: "h-9 px-4 text-sm has-[>svg]:px-3.5",
      },
    },
    compoundVariants: [
      {
        variant: "segmented",
        selected: true,
        // No fill here, and never: the mark is already a primary pill behind this
        // option. A second `bg-primary` would stack an un-animated fill exactly on
        // the one that is sliding, and the slide would look like nothing moved.
        class: "text-primary-foreground",
      },
      {
        variant: "segmented",
        selected: false,
        // Inside the track the resting option is ink only. A resting fill of its
        // own sits in front of the mark and the row reads as a strip of boxes.
        class: "text-muted-foreground hover:text-foreground",
      },
      {
        variant: "pill",
        selected: true,
        // Identical to the `tabs` pill trigger: the chip empties out and the
        // primary mark shows through it. A soft chip this size that also held a
        // dark fill would be two marks on top of each other.
        class: "border border-transparent bg-transparent text-primary-foreground shadow-none",
      },
      {
        variant: "pill",
        selected: false,
        // `bg-foreground/10` rather than the page background: these are chips, and
        // a white chip on a white page only reads as a chip because of its border.
        class:
          "border border-border bg-foreground/10 text-foreground shadow-xs hover:bg-foreground/15",
      },
      {
        variant: "outline",
        selected: true,
        // The border comes off and the fill goes transparent so the sliding mark
        // shows through — that is the whole difference between chosen and not.
        class: "border border-transparent bg-transparent text-primary-foreground shadow-none",
      },
      {
        variant: "outline",
        selected: false,
        class:
          "border border-border bg-background/80 text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30",
      },
    ],
    defaultVariants: {
      variant: "segmented",
      size: "default",
      selected: false,
    },
  },
);

/**
 * The mark: the primary pill that sits behind the chosen option and slides to the
 * next one.
 *
 * `--ease-panel`, not `--ease-spring`. A spring peaks at 1.098, and this mark has
 * to *land* on its option's exact rect — a mark that overshoots reads as a bounce
 * the control never asked for, and because the label under it is already at rest
 * there is nothing to soften the overshoot with. The expo-out curve arrives fast
 * and settles without wobble, which is the same reason a sheet uses it.
 *
 * `width` and `height` transition alongside `transform` because the options are
 * content-sized: "loading" is wider than "ready", and a mark that only moved
 * would resize under the ink. Measured in whole pixels, so a sub-pixel rect
 * never makes the mark sit a hair off its label.
 *
 * The transition is the whole component. Without it the mark is re-positioned
 * with a new inline `transform` on every change and simply teleports to the next
 * option — correct, legible, and completely inert, which is the version where
 * the user presses a control, watches nothing happen, and reasonably concludes
 * the animation was never built. `color` is in the list too so the mark
 * crossfades rather than cutting if a theme ever changes under it.
 */
export const segmentedControlMarkClass =
  "pointer-events-none absolute top-0 left-0 z-0 rounded-full bg-primary shadow-sm transition-[transform,width,height,background-color] duration-[var(--duration-slow)] ease-[var(--ease-panel)] motion-reduce:transition-none will-change-transform,opacity dark:bg-primary";

/**
 * The mount entrance, in two parts.
 *
 * The mark fades rather than scales: its `transform` is the thing that places it,
 * so an animation on that property would fight the inline style that positions
 * it. Opacity is the one channel it is not using.
 */
export const segmentedControlMarkInClass = "animate-segmented-mark-in";

/**
 * The options rise into place one after another. `backwards`, never `forwards`:
 * the keyframes end on `translateY(0) scale(1)`, and a `forwards` fill would keep
 * that transform applied forever and quietly win over `active:scale`, so every
 * press in the control would stop working after mount.
 */
export const segmentedControlItemsInClass = "segmented-items-in";

export type SegmentedControlVariantProps = VariantProps<typeof segmentedControlVariants>;
export type SegmentedControlVariant = NonNullable<SegmentedControlVariantProps["variant"]>;
export type SegmentedControlItemVariantProps = VariantProps<typeof segmentedControlItemVariants>;
export type SegmentedControlSize = NonNullable<SegmentedControlItemVariantProps["size"]>;
