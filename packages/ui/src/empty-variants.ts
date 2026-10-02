/**
 * SyncQues empty state.
 * Card fills, glass, solid borders, and a plain icon all showed the same message.
 * This is the dashed, centered layout with one icon well.
 */
export const emptyClass =
  "animate-fade-in flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-border p-6 text-center text-balance md:p-12";

export const emptyHeaderClass = "flex max-w-sm flex-col items-center gap-2 text-center";

export const emptyMediaClass =
  "mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0";

export const emptyTitleClass = "text-lg font-medium tracking-tight";

export const emptyDescriptionClass =
  "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary";

export const emptyContentClass =
  "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-center text-sm text-balance";
