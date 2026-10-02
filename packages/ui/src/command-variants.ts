/**
 * SyncQues command list.
 * The palette and the searchable select use this same list.
 * A dialog palette is this list inside the dialog, not a second skin.
 */
export const commandClass =
  "flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground";

export const commandInputWrapperClass = "flex h-10 items-center gap-2 border-b border-border px-3";

export const commandInputClass =
  "placeholder:text-muted-foreground flex h-10 w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const commandListClass = "max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto";

export const commandEmptyClass = "py-6 text-center text-sm text-muted-foreground";

export const commandGroupClass =
  "text-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";

export const commandSeparatorClass = "bg-border -mx-1 h-px";

export const commandItemClass =
  "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

export const commandShortcutClass = "ml-auto text-xs tracking-widest text-muted-foreground";

/** Contains match. Fuzzy scoring kept "Designer" visible for the query "eng". */
export function commandFilter(value: string, search: string, keywords?: string[]) {
  const needle = search.trim().toLowerCase();
  if (!needle) return 1;
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
  return haystack.includes(needle) ? 1 : 0;
}
