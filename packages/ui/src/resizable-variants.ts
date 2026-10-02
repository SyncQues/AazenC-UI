import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues resizable.
 * Two panels and a handle, or three and two. The two orientations are the same
 * split turned, so orientation is an axis and not two components.
 *
 * `orientation` is the *group's* orientation, read off the prop and never off
 * the DOM: `horizontal` is panels side by side, `vertical` is panels stacked.
 * That is the library's naming, and it is exactly where the first version of
 * this file went wrong — the two axis bodies were transposed, so
 * `horizontal` shipped the classes for a stacked group and `vertical` shipped
 * the ones for a side-by-side group. The cost was not a slightly wrong picture.
 * react-resizable-panels hands the separator inline `flex-grow: 0` and
 * `flex-shrink: 0` and leaves its base size to `width`, so the `w-full` that a
 * side-by-side group was given made the handle demand the whole frame and,
 * being unable to shrink, never give any of it back. Both panels carry inline
 * `min-width: 0`, so they collapsed to nothing and left the handle alone across
 * the viewport. The default orientation was the broken one.
 *
 * What was tried and what survived:
 *
 * - Orientation as a CSS `aria-[orientation=…]` variant, which is how the
 *   wrapper this replaces did it. It does not survive. In
 *   react-resizable-panels v4 the group never receives `aria-orientation` —
 *   only the handle does, and the handle's value is inverted from the group's,
 *   because a splitter that moves left and right is a *vertical* separator. The
 *   group also sets `display` and `flex-direction` as inline styles, so a class
 *   that tried to flip the axis lost to the inline style no matter what it said.
 *   Orientation is therefore a real prop, resolved once on the group and handed
 *   down by context, which is also the only version that can be checked without
 *   a DOM in the room.
 * - A one-pixel handle with a one-pixel hit area, which is also what the
 *   replaced wrapper shipped. A pixel is not a pointer target. The handle is now
 *   ten pixels of target with the rule drawn inside it, so hover can tint the
 *   rule without tinting the ten pixels around it. The library's own notes ask
 *   for nearer twenty-seven on touch, so ten is still short of that; it is the
 *   width that fits between two panels without visibly eating into them, and
 *   the panels are what the user came for.
 * - `overflow-auto` on the panel. The library already renders an inner scroller
 *   (`overflow: auto`) inside every panel, so this would have been a no-op
 *   fighting the library for the same box. What the panel does need is
 *   `min-w-0`/`min-h-0`, so one long unbreakable token inside a panel cannot
 *   refuse to shrink below its own content and wedge the whole layout open.
 * - Cursor utilities. The library sets `col-resize`, `row-resize`, and
 *   `not-allowed` itself from the group orientation, as inline styles, where a
 *   class cannot win. One line here would have been dead weight.
 * - One look for the handle, and then two. SyncQues-Frontend's call site
 *   overrides the stock shadcn handle with `w-2 bg-transparent
 *   hover:bg-border/50` — a band that is invisible at rest and tints as a whole
 *   under the pointer. For a chrome resize — a sidebar edge, a drawer the user
 *   is reaching for rather than one they are sizing — that is a legitimate
 *   second look, because a permanent hairline is noise when the thing being
 *   resized is the page furniture. So `band` paints the target itself instead of
 *   a pseudo-element, and carries no `after:` class at all: a colour utility on a
 *   pseudo-element is what generates that element, and with none there is
 *   nothing to see.
 *
 * The rule that holds the two variants together: the target is `w-2.5`/`h-2.5`
 * either way. A variant changes how the handle paints, never how big it is to
 * grab — which is why `band` is not quietly also a wider target. Paint and size
 * are separate decisions and only one of them is the variant's job.
 */
export const resizableGroupClass = "h-full w-full overflow-hidden";

export const resizablePanelClass = "min-h-0 min-w-0";

/**
 * Size comes from `orientation`, paint from `variant`, and the two meet in
 * `compoundVariants` for the rule's geometry — a rule drawn on the upright
 * target of a side-by-side group is a vertical line, and the same rule on the
 * lying target of a stacked group is a horizontal one.
 *
 * `rule` keeps the drag state on the pseudo-element, so dragging brightens a
 * one-pixel line and not a ten-pixel slab. `band` moves the whole thing onto the
 * element's own background, which is why it has no `after:` classes at all.
 * `data-separator` is the library's own attribute and it is always one of
 * `inactive`, `active`, `focus`, or `disabled` — there is no idle absence to
 * catch.
 */
export const resizableHandleVariants = cva(
  "relative flex shrink-0 items-center justify-center outline-none transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[separator=disabled]:opacity-50",
  {
    variants: {
      orientation: {
        horizontal: "h-full w-2.5",
        vertical: "h-2.5 w-full",
      },
      variant: {
        rule: "after:absolute after:bg-border after:transition-colors after:duration-150 after:ease-out hover:after:bg-foreground/40 focus-visible:after:bg-foreground/40 data-[separator=active]:after:bg-primary motion-reduce:after:transition-none",
        band: "z-10 bg-transparent hover:bg-border/50 data-[separator=active]:bg-border",
      },
    },
    compoundVariants: [
      {
        orientation: "horizontal",
        variant: "rule",
        className: "after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2",
      },
      {
        orientation: "vertical",
        variant: "rule",
        className: "after:inset-x-0 after:top-1/2 after:h-px after:-translate-y-1/2",
      },
    ],
    defaultVariants: {
      orientation: "horizontal",
      variant: "rule",
    },
  },
);

/**
 * The grip is the shape of the rule it sits on: panels side by side means an
 * upright rule, so an upright pill, and stacked means a lying rule, so a lying
 * pill. The six dots run *along* the rule, which is why only the vertical grip
 * turns its icon — the pill keeps the footprint that fits the line, and the icon
 * inside is what rotates.
 */
export const resizableHandleGripVariants = cva(
  "z-10 flex items-center justify-center rounded-full border border-border bg-muted text-muted-foreground",
  {
    variants: {
      orientation: {
        horizontal: "h-4 w-2.5",
        vertical: "h-2.5 w-4 [&>svg]:rotate-90",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

/**
 * The collapse control is a pill that sits in the middle of the handle with a
 * chevron at each end and the six dots between them, the arrangement a sidebar
 * edge has used for twenty years. The left chevron takes down the panel before
 * the handle, the right one the panel after it, and both are toggles, so the
 * second press puts the panel back the way it was.
 *
 * The pill is far wider than the ten pixel handle it lives in and is centred on
 * it, overlapping both panels. That is the arrangement, not an accident: a
 * control the width of the target would put two hit areas in ten pixels. The
 * handle itself carries `z-10`, and a flex item honours z-index even unpositioned,
 * so the pill paints over the panel content it covers.
 *
 * It is its own thing rather than a mode of the grip because it is a different
 * kind of control: the grip says "this moves", the chevrons say "this closes".
 * A stacked group turns the whole pill on its side, chevrons included, so the
 * top panel is reached from the top.
 */
export const resizableCollapseVariants = cva(
  "z-10 flex items-center rounded-md border border-border bg-background text-muted-foreground shadow-xs",
  {
    variants: {
      orientation: {
        horizontal: "h-6 flex-row",
        vertical: "w-6 flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

/**
 * The buttons fill the ends of the pill, so the hit area is the whole end rather
 * than the few pixels the chevron itself covers.
 */
export const resizableCollapseButtonVariants = cva(
  "flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-2.5",
  {
    variants: {
      orientation: {
        horizontal: "h-full w-5",
        vertical: "w-full h-5 [&>svg]:rotate-90",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

/**
 * The dots between the chevrons carry no border or fill of their own: they are
 * inside a pill that already has one, and a second rounded box in the middle of
 * the first reads as a mistake. Only the turn is variant-driven, for the same
 * reason it is on the standalone grip — the dots run along the axis the panels
 * are stacked on.
 */
export const resizableCollapseGripVariants = cva(
  "flex shrink-0 items-center justify-center",
  {
    variants: {
      orientation: {
        horizontal: "h-full w-4",
        vertical: "w-full h-4 [&>svg]:rotate-90",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export type ResizableHandleVariantProps = VariantProps<typeof resizableHandleVariants>;
export type ResizableCollapseVariantProps = VariantProps<typeof resizableCollapseVariants>;
export type ResizableOrientation = NonNullable<ResizableHandleVariantProps["orientation"]>;
