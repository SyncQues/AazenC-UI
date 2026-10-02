/**
 * SyncQues multi-select.
 * Tags, search, select-all, and clear are one field. Hiding any of them was the same control.
 */

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const multiSelectFieldClass =
  "border-input dark:bg-input/30 relative flex min-h-9 w-full flex-wrap items-center gap-1 rounded-full border bg-transparent px-2 py-1 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 ease-out md:text-sm motion-reduce:transition-none has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

export const multiSelectContentClass =
  "menu-motion pointer-events-auto z-[var(--z-popper)] w-[var(--radix-popover-trigger-width)] min-w-56 overflow-hidden rounded-[1.125rem] border border-border bg-popover text-popover-foreground shadow-md outline-none";

export const multiSelectSearchClass =
  "placeholder:text-muted-foreground flex h-10 w-full bg-transparent text-sm outline-none";

export const multiSelectActionClass =
  "flex-1 cursor-pointer rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-foreground motion-reduce:transition-none";

export const multiSelectOptionClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-left text-sm outline-none transition-colors duration-150 ease-out hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

/** Contains match, including the value, so "eng" keeps Engineer and hides Designer. */
export function filterMultiSelectOptions<T extends { label: string; value: string }>(
  options: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...options];
  return options.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(needle));
}

export function toggleMultiSelectValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

/** Adds the enabled options in view. Selections hidden by the query stay selected. */
export function addVisibleMultiSelectValues(
  values: readonly string[],
  options: readonly { value: string; disabled?: boolean }[],
): string[] {
  const next = new Set(values);
  for (const option of options) {
    if (!option.disabled) next.add(option.value);
  }
  return [...next];
}
