import { cva, type VariantProps } from "class-variance-authority";

/**
 * SyncQues sheet.
 * A panel docked to an edge. Top, right, bottom, and left are the same panel
 * entering from a different edge, so the side is an axis and not four components.
 *
 * This is not the Drawer. The Drawer is a vaul surface: it has a handle, it can
 * be flicked away, and on a phone it is the only correct way to show a second
 * screen. A Sheet has no handle and no gesture, because a desktop side panel
 * that can be dragged shut invites a drag that half-works. Both are a dialog
 * underneath — the Sheet just refuses to grow a handle and a gesture.
 *
 * The anchored edge is square and the free edge is panel-rounded. A rounded
 * corner where the panel meets the viewport reads as a gap you could see
 * through, and it is the reason `w-3/4 sm:max-w-sm` and `w-3/4 sm:max-w-md`
 * are the same drawer and the same sheet, one number apart.
 */
export const sheetSides = ["top", "right", "bottom", "left"] as const;
export type SheetSide = (typeof sheetSides)[number];

/**
 * The edge a sheet takes when nobody says. It lives here rather than in the cva
 * alone because `data-side` picks the animation and the layout class has to move
 * with it: two copies of "right" drift, and the panel animates in from the wrong
 * edge while its classes say otherwise.
 */
export const sheetDefaultSide: SheetSide = "right";

/**
 * Keyed off `SheetSide` so a side added to `sheetSides` without a layout here is
 * a compile error rather than a panel that mounts unstyled and unanimated.
 */
const sheetSideClass = {
  top: "inset-x-0 top-0 max-h-[85vh] rounded-b-[var(--radius-panel)] border-b border-border",
  right:
    "inset-y-0 right-0 h-full w-3/4 rounded-l-[var(--radius-panel)] border-l border-border sm:max-w-md",
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] rounded-t-[var(--radius-panel)] border-t border-border",
  left: "inset-y-0 left-0 h-full w-3/4 rounded-r-[var(--radius-panel)] border-r border-border sm:max-w-md",
} satisfies Record<SheetSide, string>;

export const sheetOverlayClass =
  "sheet-overlay-motion pointer-events-auto fixed inset-0 z-[var(--z-overlay)] bg-black/50";

export const sheetContentVariants = cva(
  "sheet-motion pointer-events-auto fixed z-[var(--z-dialog)] flex flex-col overflow-hidden bg-background text-foreground shadow-lg outline-none",
  {
    variants: {
      side: sheetSideClass,
    },
    defaultVariants: {
      side: sheetDefaultSide,
    },
  },
);

export const sheetHeaderVariants = cva("flex flex-col gap-1 px-5 pt-5 pb-4 text-left", {
  variants: {
    close: {
      true: "pr-12",
      false: "",
    },
  },
  defaultVariants: {
    close: true,
  },
});

/**
 * The body is the only part that scrolls. The header and the action row are
 * structure and stay put, which is the whole reason they are separate parts
 * instead of padding on the content.
 */
export const sheetBodyClass = "min-h-0 flex-1 overflow-y-auto px-5 py-1 text-sm";

// shared with the drawer — see ./panel-chrome for why these live in one place.
export { panelCloseClass as sheetCloseClass } from "./panel-chrome";
export { panelDescriptionClass as sheetDescriptionClass } from "./panel-chrome";
export { panelFooterClass as sheetFooterClass } from "./panel-chrome";
export { panelTitleClass as sheetTitleClass } from "./panel-chrome";

export type SheetContentVariantProps = VariantProps<typeof sheetContentVariants>;
