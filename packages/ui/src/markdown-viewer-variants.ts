import { cva, type VariantProps } from "class-variance-authority";
import type { MarkdownHeadingLevel } from "./markdown-viewer-utils";

/**
 * SyncQues markdown viewer.
 * One prose column on the product tokens: foreground for the text, muted for the
 * quiet parts, primary for links. The first block loses its top margin so the
 * viewer can sit flush against a card, a chat bubble, or a docs column.
 *
 * Blocks carry their own `mt` instead of a shared `space-y`, because a heading
 * needs more air above it than a paragraph does, and one rule cannot say that.
 * The nested containers repeat the first-child reset for the same reason.
 */
export const markdownViewerVariants = cva(
  "text-foreground [&>*:first-child]:mt-0",
  {
    variants: {
      density: {
        compact: "text-[13px] leading-6",
        default: "text-sm leading-7",
        roomy: "text-[15px] leading-8",
      },
    },
    defaultVariants: {
      density: "default",
    },
  },
);

export type MarkdownViewerDensity = NonNullable<
  VariantProps<typeof markdownViewerVariants>["density"]
>;
export type MarkdownViewerVariantProps = VariantProps<
  typeof markdownViewerVariants
>;

export const markdownHeadingClass =
  "scroll-mt-20 font-semibold tracking-tight text-balance";

/** h1 and h2 open a section, so they are the two that carry a full block of air. */
export const markdownHeadingLevelClass = {
  1: "mt-8 text-2xl",
  2: "mt-8 text-xl",
  3: "mt-6 text-lg",
  4: "mt-6 text-base",
  5: "mt-4 text-sm uppercase tracking-wide text-muted-foreground",
  6: "mt-4 text-sm text-muted-foreground",
} as const satisfies Record<MarkdownHeadingLevel, string>;

export const markdownParagraphClass = "leading-relaxed";

export const markdownListClass =
  "mt-4 space-y-1 pl-6 marker:text-muted-foreground";

/** A task list drops its markers, because the checkbox is the marker. */
export const markdownTaskListClass = "list-none pl-0";

export const markdownListItemClass = "[&>ul]:mt-1 [&>ol]:mt-1";

/** A task item puts the checkbox beside the text, so that row is a flex row. */
export const markdownTaskItemClass = "flex items-start gap-2";

export const markdownTaskClass = "mt-1 size-4 shrink-0 accent-primary";

/** The flex child beside a task checkbox. It repeats the first-child reset. */
export const markdownListContentClass = "min-w-0 flex-1 [&>*:first-child]:mt-0";

export const markdownQuoteClass =
  "mt-4 border-l-2 border-border pl-4 text-muted-foreground [&>*:first-child]:mt-0";

export const markdownInlineCodeClass =
  "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground";

export const markdownLinkClass =
  "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none";

export const markdownImageClass =
  "mt-3 max-h-[28rem] w-auto rounded-lg border border-border bg-muted/30";

export const markdownCodeBlockClass = "mt-4";

export const markdownRuleClass = "mt-6";

export const markdownTableWrapClass =
  "mt-4 overflow-x-auto rounded-lg border border-border";

export const markdownTableClass = "w-full border-collapse text-sm";

export const markdownTableHeadClass =
  "border-b border-border bg-muted/50 px-3 py-2 font-medium";

export const markdownTableCellClass =
  "border-b border-border px-3 py-2 align-top";

/** The last row has no rule under it, because the frame already draws one. */
export const markdownTableRowClass =
  "last:[&>td]:border-b-0 last:[&>th]:border-b-0";

export const markdownAlignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;
