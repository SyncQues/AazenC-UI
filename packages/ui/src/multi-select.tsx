"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useId, useRef, useState, type UIEvent } from "react";
import { cn } from "@aazenc/utils";
import { Badge } from "./badge";
import {
  addVisibleMultiSelectValues,
  filterMultiSelectOptions,
  multiSelectActionClass,
  multiSelectContentClass,
  multiSelectFieldClass,
  multiSelectOptionClass,
  multiSelectSearchClass,
  toggleMultiSelectValue,
  type MultiSelectOption,
} from "./multi-select-variants";

export interface MultiSelectProps {
  options: readonly MultiSelectOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  /** Shown when the list, or the search, has nothing to pick. */
  empty?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Marks the field invalid. Same pill either way this is set. */
  invalid?: boolean;
  id?: string;
  /** Submits one hidden input per selected value. */
  name?: string;
  onScrollEnd?: () => void;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-4 shrink-0 text-muted-foreground">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={cn(
        "pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
        open && "rotate-180",
      )}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" className="size-3">
      <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" />
    </svg>
  );
}

function optionLabel(options: readonly MultiSelectOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  empty = "No options",
  loading = false,
  disabled = false,
  invalid = false,
  id,
  name,
  onScrollEnd,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const visible = filterMultiSelectOptions(options, query);
  const selected = value.map((item) => ({ value: item, label: optionLabel(options, item) }));

  function onListScroll(event: UIEvent<HTMLDivElement>) {
    if (!onScrollEnd) return;
    const node = event.currentTarget;
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 10) onScrollEnd();
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <div
        data-slot="multi-select"
        aria-invalid={invalid || undefined}
        className={cn(multiSelectFieldClass, disabled && "pointer-events-none opacity-50")}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-controls={listId}
            className="absolute inset-0 rounded-full outline-none"
            aria-label={selected.length === 0 ? placeholder : `${selected.length} selected. Edit selection`}
          />
        </PopoverPrimitive.Trigger>
        <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 ? (
            <span className="px-2 text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((option) => (
              <Badge key={option.value} asChild variant="soft">
                <button
                  type="button"
                  className="pointer-events-auto"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => onValueChange(toggleMultiSelectValue(value, option.value))}
                >
                  {option.label}
                  <RemoveIcon />
                </button>
              </Badge>
            ))
          )}
        </div>
        <ChevronIcon open={open} />
        {name
          ? value.map((item) => <input key={item} type="hidden" name={name} value={item} />)
          : null}
      </div>
      <PopoverPrimitive.Portal>
        <div className="menu-presence pointer-events-none fixed inset-0 z-[var(--z-popper)]">
          <PopoverPrimitive.Content
            data-slot="multi-select-content"
            data-presence=""
            align="start"
            sideOffset={6}
            className={multiSelectContentClass}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              if (window.matchMedia("(min-width: 768px)").matches) searchRef.current?.focus();
            }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <SearchIcon />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search"
                aria-label="Search options"
                className={multiSelectSearchClass}
              />
            </div>
            <div className="flex gap-1 border-b border-border p-1">
              <button
                type="button"
                className={multiSelectActionClass}
                onClick={() => onValueChange(addVisibleMultiSelectValues(value, visible))}
              >
                Select all
              </button>
              <button
                type="button"
                className={cn(
                  multiSelectActionClass,
                  "hover:bg-destructive/10 hover:text-destructive dark:hover:text-[oklch(0.78_0.16_25)]",
                )}
                onClick={() => onValueChange([])}
              >
                Clear
              </button>
            </div>
            <div
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              className="max-h-60 overflow-y-auto p-1"
              onScroll={onListScroll}
            >
              {loading ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading options…</p>
              ) : visible.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">{empty}</p>
              ) : (
                visible.map((option) => {
                  const selectedOption = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selectedOption}
                      disabled={option.disabled}
                      data-slot="multi-select-option"
                      className={multiSelectOptionClass}
                      onClick={() => onValueChange(toggleMultiSelectValue(value, option.value))}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                          selectedOption && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {selectedOption ? <CheckIcon /> : null}
                      </span>
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </div>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { MultiSelect };
export type { MultiSelectOption };
