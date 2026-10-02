/**
 * SyncQues code block.
 * One bordered frame, a quiet header, and monospace source.
 * Tones stay on the product colors: primary for structure, muted for comments.
 */

export const codeBlockFrameClass =
  "overflow-hidden rounded-lg border border-border bg-background";

export const codeBlockHeaderClass =
  "flex items-center justify-between gap-3 border-b border-border px-3 py-2";

export const codeBlockFilenameClass =
  "min-w-0 truncate font-mono text-xs text-muted-foreground";

export const codeBlockPreClass =
  "max-h-96 overflow-auto p-4 font-mono text-[13px] leading-6 text-foreground";

/** `min-h-6` matches the `leading-6` line box so blank source lines keep their height. */
export const codeBlockLineClass = "block min-h-6 whitespace-pre";

export const codeBlockGutterClass =
  "mr-4 inline-block w-8 select-none text-right text-muted-foreground";

export const codeBlockTokenClass = {
  plain: "text-foreground",
  comment: "text-muted-foreground italic",
  string: "text-foreground",
  keyword: "font-medium text-primary",
  tag: "font-medium text-primary",
  attr: "text-foreground",
  number: "text-foreground",
} as const;
