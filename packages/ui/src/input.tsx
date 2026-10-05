"use client";

import {
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@aazenc/utils";
import {
  counterClearance,
  counterLimit,
  counterRootClass,
  inputCounterClass,
  lengthOf,
  showsCount,
} from "./field-counter";
import { inputVariants } from "./input-variants";

export interface InputProps extends Omit<ComponentProps<"input">, "className" | "size"> {
  /** Marks the field invalid. Same border either way this is set. */
  invalid?: boolean;
  /** Native type, so password, search, email, number, and file keep their own behaviour. */
  type?: ComponentProps<"input">["type"];
  /** Leading icon. The field chrome stays the same. */
  icon?: ReactNode;
  /** Shows `used / maxLength` inside the field. Needs `maxLength` to say anything. */
  showCount?: boolean;
  className?: string;
}

function Input({
  type = "text",
  invalid = false,
  icon,
  showCount = false,
  value,
  defaultValue,
  maxLength,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
  ...props
}: InputProps) {
  const fieldRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const counterId = useId();
  const [length, setLength] = useState(() => lengthOf(value ?? defaultValue));

  // A controlled field can be cleared from outside, so mirror the prop rather than the keystrokes.
  useEffect(() => {
    if (value !== undefined) setLength(lengthOf(value));
  }, [value]);

  const limit = counterLimit(maxLength);
  const withCount = showsCount({ showCount, maxLength, type });

  // Re-measured whenever the count could have changed width, which is every time the
  // *used* number gains a digit and not only when the limit's does.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.paddingRight = `${counterClearance(field, counterRef.current)}px`;
  }, [withCount, maxLength, length]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLength(event.target.value.length);
      onChange?.(event);
    },
    [onChange],
  );

  // The count rides along on the field's own description, so the consumer's error text keeps its slot.
  const describedBy = [ariaDescribedBy, withCount ? counterId : null].filter(Boolean).join(" ") || undefined;

  const field = (
    <input
      ref={fieldRef}
      type={type}
      data-slot="input"
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      aria-describedby={describedBy}
      className={cn(inputVariants({ icon: Boolean(icon) }), className)}
      onChange={handleChange}
      {...props}
    />
  );

  if (!icon && !withCount) return field;

  // The counter floats, so this box is the field's own height and the icon still centres on it.
  return (
    <div data-slot="input-root" className={cn("relative w-full", counterRootClass)}>
      {icon ? (
        <span
          data-slot="input-icon"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      {field}
      {withCount && limit !== null ? (
        <p
          ref={counterRef}
          id={counterId}
          data-slot="input-counter"
          // Not a live region. It would fire on every keystroke; read on focus instead.
          className={cn(inputCounterClass, length >= limit && "text-destructive")}
        >
          {length} / {limit}
        </p>
      ) : null}
    </div>
  );
}

export { Input, inputVariants };
