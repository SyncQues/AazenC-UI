"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import {
  toggleGroupItemVariants,
  toggleGroupItemsInClass,
  toggleGroupVariants,
  type ToggleGroupSize,
  type ToggleGroupVariant,
} from "./toggle-group-variants";
import {
  focusIntentFor,
  ITEM_SELECTOR,
  nextFocusIndex,
  selectOnly,
  toggleSelection,
  type ToggleGroupOrientation,
  type ToggleGroupType,
} from "./toggle-group-utils";

type ToggleGroupBaseProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue" | "dir" | "children"
> & {
  children?: ReactNode;
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  orientation?: ToggleGroupOrientation;
  /** Wrap past the ends. On by default, as a toolbar of buttons usually is. */
  loop?: boolean;
  dir?: "ltr" | "rtl";
  /** Names the group for a reader. Falls back to `aria-label` on the root. */
  label?: string;
  /**
   * Not omitted, unlike most components in this package. The group is a row
   * inside someone else's layout and there is always a `w-full` or an `ml-auto`
   * to merge in; omitting it would drop those on the floor.
   */
  className?: string;
};

type ToggleGroupSingleProps = {
  type: "single";
  value?: string;
  defaultValue?: string;
  /** Receives `""` when the pressed item is pressed again. */
  onValueChange?: (value: string) => void;
};

type ToggleGroupMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * Split on `type` so `onValueChange` says what it hands back. A single API typed
 * `(value: string | string[])` is the reason every consumer ends in a cast, and
 * a cast in a form is how a string array quietly reaches a string field.
 */
export type ToggleGroupProps = ToggleGroupBaseProps &
  (ToggleGroupSingleProps | ToggleGroupMultipleProps);

export interface ToggleGroupItemProps extends Omit<
  ComponentProps<"button">,
  "value" | "children"
> {
  value: string;
  children?: ReactNode;
  className?: string;
}

type ToggleGroupContextValue = {
  variant: ToggleGroupVariant;
  size: ToggleGroupSize;
  type: ToggleGroupType;
  selected: string[];
  toggle: (value: string) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(part: string): ToggleGroupContextValue {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <ToggleGroup>.`);
  }
  return context;
}

function readValue(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((entry): entry is string => typeof entry === "string");
  return typeof value === "string" && value !== "" ? [value] : [];
}

function itemValueOf(child: ReactNode): string | undefined {
  if (!isValidElement(child)) return undefined;
  const value = (child.props as { value?: unknown }).value;
  return typeof value === "string" ? value : undefined;
}

function isItemNode(
  child: ReactNode,
): child is ReactElement<{ value: string; disabled?: boolean }> {
  return itemValueOf(child) !== undefined;
}

/**
 * Any number of independent on/off answers, held at the same time.
 *
 * Not `SegmentedControl`: every row that became a segmented control has exactly
 * one answer, and this one has any number of them. Not `Tabs`: nothing here
 * swaps a panel, the pressed state is the whole result.
 *
 * Arrow keys are where this deliberately parts company with the Radix toggle
 * group, and the two modes are not treated the same on purpose. `single` renders
 * a `radiogroup`, and a radiogroup that moves its focus on arrow without moving
 * its answer is not answerable by keyboard at all — measured against
 * `@radix-ui/react-toggle-group@1.1.19`, ArrowRight moves the focus ring and
 * leaves every `aria-checked` exactly as it was. So in `single`, an arrow
 * selects, as it does in every other radiogroup on the platform. `multiple`
 * renders a `toolbar`, where arrowing *must not* select: sweeping from Bold to
 * Underline to reach one would press Bold on the way past, and a toolbar whose
 * contents change as you navigate it is a toolbar nobody can use. `multiple`
 * moves the focus and leaves Space to the browser's own button activation.
 *
 * Roles, `data-state`, `aria-pressed` and the single-group `""` deselection all
 * match Radix, so this is a drop-in for the shadcn component it is named after.
 *
 * There is no Radix toggle-group in the dependency set, and `SegmentedControl`
 * already set out why: a primitive added for one component lands in every
 * consumer's `package.json` and every `registry:ui` install, and the arrow-key
 * bookkeeping is ~30 lines. That reasoning holds here — the two defects above
 * are the reason it is worth owning the keyboard rather than delegating it.
 */
function ToggleGroup({
  type,
  variant = "pill",
  size = "default",
  orientation = "horizontal",
  loop = true,
  dir,
  label,
  className,
  onKeyDown,
  children,
  // Pulled out so the rest-spread cannot put a group's own answer and callback
  // on the div: React logs `onValueChange` as an unknown handler, and `value`
  // on a div is meaningless noise in the DOM.
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: ToggleGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const isSingle = type === "single";

  // Latched on the first render, as `SegmentedControl` latches it: a parent
  // whose answer arrives with its data must not flip the group controlled and
  // discard the picks the user has already made.
  const [isControlled] = useState(valueProp !== undefined);
  const [uncontrolled, setUncontrolled] = useState<string[]>(() =>
    readValue(defaultValue),
  );
  const selected = isControlled ? readValue(valueProp) : uncontrolled;

  const commit = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    // The union hands back two different callbacks; this is where they part.
    if (isSingle) {
      (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? "");
    } else {
      (onValueChange as ((value: string[]) => void) | undefined)?.(next);
    }
  };

  const toggle = (value: string) =>
    commit(toggleSelection(type, selected, value));

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // A modified arrow belongs to the browser, not to the group: alt-arrow is a
    // word-jump and shift-arrow is a text selection, and swallowing either
    // would take the keyboard away from the page.
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    const intent = focusIntentFor(event.key, orientation, dir);
    if (!intent) return;
    const group = groupRef.current;
    if (!group) return;

    const reachable = Array.from(
      group.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR),
    ).filter((item) => !item.disabled);
    if (reachable.length === 0) return;
    event.preventDefault();

    const current = reachable.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const index = nextFocusIndex(reachable.length, current, intent, loop);
    if (index === -1) return;
    const next = reachable[index];
    if (!next) return;
    next.focus();

    if (isSingle) {
      const nextValue = next.dataset.value;
      if (nextValue !== undefined) commit(selectOnly(selected, nextValue));
    }
  }

  // One tab stop for the whole group: the answer takes it, so tabbing away and
  // back lands on what is currently on rather than on the first item. A group
  // with nothing pressed yet hands it to the first item that can be reached,
  // because a disabled item cannot take focus and would strand the group.
  const items = Children.toArray(children).filter(isItemNode);
  const tabStopValue =
    selected.find((value) => {
      const item = items.find((child) => child.props.value === value);
      return item !== undefined && !item.props.disabled;
    }) ?? items.find((child) => !child.props.disabled)?.props.value;

  return (
    <ToggleGroupContext.Provider
      value={{ variant, size, type, selected, toggle }}
    >
      <div
        ref={groupRef}
        role={isSingle ? "radiogroup" : "toolbar"}
        aria-orientation={orientation}
        aria-label={label ?? props["aria-label"]}
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        // Internal first and the caller's runs either way: the roving focus is
        // this component's contract, and a rest-spread cannot be allowed to
        // drop it the way it dropped `onKeyDown` here.
        onKeyDown={(event) => {
          handleKeyDown(event);
          onKeyDown?.(event);
        }}
        className={cn(
          toggleGroupItemsInClass,
          toggleGroupVariants({ variant }),
          className,
        )}
        {...props}
      >
        {Children.map(children, (child) => {
          const value = itemValueOf(child);
          if (value === undefined) return child;
          return cloneElement(child as ReactElement<{ tabIndex?: number }>, {
            tabIndex: value === tabStopValue ? 0 : -1,
          });
        })}
      </div>
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  value,
  disabled,
  className,
  onClick,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { variant, size, type, selected, toggle } =
    useToggleGroupContext("ToggleGroupItem");
  const isSingle = type === "single";
  const pressed = selected.includes(value);

  return (
    <button
      type="button"
      role={isSingle ? "radio" : undefined}
      aria-checked={isSingle ? pressed : undefined}
      aria-pressed={isSingle ? undefined : pressed}
      disabled={disabled}
      data-slot="toggle-group-item"
      data-state={pressed ? "on" : "off"}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      onClick={(event) => {
        onClick?.(event);
        // A caller that prevented the click has handled the press itself, which
        // is the only way to make an item read-only without removing the button.
        if (!event.defaultPrevented) toggle(value);
      }}
      className={cn(
        toggleGroupItemVariants({ variant, size, pressed }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
