"use client";

import {
  type ChangeEvent,
  type ComponentProps,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@aazenc/utils";
import {
  counterLimit,
  counterRootClass,
  lengthOf,
  showsCount,
  textareaCounterClass,
} from "./field-counter";
import { autoHeight } from "./textarea-measure";
import { type TextareaShape, textareaVariants } from "./textarea-variants";

const DEFAULT_MAX_ROWS = 8;
const DEFAULT_MIN_ROWS = 3;
/** A textarea with no usable line-height reports `normal`, which has no number in it. */
const FALLBACK_LINE_HEIGHT = 20;

export interface TextareaProps extends Omit<ComponentProps<"textarea">, "className"> {
  /** Marks the field invalid. Same border either way this is set. */
  invalid?: boolean;
  /** `rounded` is the default box; `pill` is a heavily round one, not a full radius. */
  shape?: TextareaShape;
  /** Grows with the text instead of scrolling, up to `maxRows`. */
  autoResize?: boolean;
  /** Stops the growth, after which the text scrolls again. Only read with `autoResize`. */
  maxRows?: number;
  /** Shows `used / maxLength` inside the field. Needs `maxLength` to say anything. */
  showCount?: boolean;
  className?: string;
}

function Textarea({
  invalid = false,
  shape = "rounded",
  autoResize = false,
  maxRows = DEFAULT_MAX_ROWS,
  showCount = false,
  rows,
  value,
  defaultValue,
  maxLength,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
  ...props
}: TextareaProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const counterId = useId();
  const [length, setLength] = useState(() => lengthOf(value ?? defaultValue));

  // A controlled field can be cleared from outside, so mirror the prop rather than the keystrokes.
  useEffect(() => {
    if (value !== undefined) setLength(lengthOf(value));
  }, [value]);

  // `field-sizing: content` would do this in CSS, but it needs Chrome 123 and the
  // library supports 111, so the height is measured instead.
  const measure = useCallback(() => {
    const field = fieldRef.current;
    if (!autoResize || !field) return;
    // Collapse first. Measuring the standing box only ever lets the field grow.
    field.style.height = "auto";
    const styles = window.getComputedStyle(field);
    const lineHeight = Number.parseFloat(styles.lineHeight) || FALLBACK_LINE_HEIGHT;
    const chrome =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom) +
      Number.parseFloat(styles.borderTopWidth) +
      Number.parseFloat(styles.borderBottomWidth);
    field.style.height = `${autoHeight({
      scrollHeight: field.scrollHeight,
      lineHeight,
      chrome,
      minRows: rows ?? DEFAULT_MIN_ROWS,
      maxRows,
    })}px`;
  }, [autoResize, maxRows, rows]);

  useLayoutEffect(measure, [measure, length, value]);

  // A ref, so the observer below survives a keystroke instead of being torn down and
  // rebuilt on one. The measure it calls is always the one from the latest render.
  const measureRef = useRef(measure);
  useLayoutEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  // The field is `text-base` under `md:` and `text-sm` above it, so crossing the
  // breakpoint changes the row height every measurement is taken against. Watching
  // width only: the height write above is this observer's own output, and letting it
  // back in would measure against a box it had just resized.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!autoResize || !field || typeof ResizeObserver === "undefined") return;
    let lastWidth = field.clientWidth;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width === undefined || Math.abs(width - lastWidth) < 0.5) return;
      lastWidth = width;
      measureRef.current();
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [autoResize]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setLength(event.target.value.length);
      onChange?.(event);
    },
    [onChange],
  );

  const limit = counterLimit(maxLength);
  const withCount = showsCount({ showCount, maxLength });
  // The count rides along on the field's own description, so the consumer's error text keeps its slot.
  const describedBy = [ariaDescribedBy, withCount ? counterId : null].filter(Boolean).join(" ") || undefined;

  const field = (
    <textarea
      ref={fieldRef}
      data-slot="textarea"
      rows={rows}
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      aria-describedby={describedBy}
      className={cn(
        textareaVariants({ shape, resize: autoResize ? "none" : "manual", count: withCount }),
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );

  if (!withCount || limit === null) return field;

  // The counter floats over the padding the count axis reserved, so it never sits on the text.
  return (
    <div data-slot="textarea-root" className={cn("relative", counterRootClass)}>
      {field}
      <p
        id={counterId}
        data-slot="textarea-counter"
        // Not a live region. It would fire on every keystroke; read on focus instead.
        className={cn(textareaCounterClass, length >= limit && "text-destructive")}
      >
        {length} / {limit}
      </p>
    </div>
  );
}

export { Textarea, textareaVariants };
export type { TextareaResize, TextareaShape, TextareaVariantProps } from "./textarea-variants";
