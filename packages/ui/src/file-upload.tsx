"use client";

import { type ChangeEvent, type ComponentProps, type DragEvent, useId, useRef, useState } from "react";
import { cn } from "@aazenc/utils";
import { fileUploadClass, fileUploadFileClass } from "./file-upload-variants";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export interface FileUploadProps extends Omit<ComponentProps<"div">, "className" | "children" | "onChange"> {
  /** `accept` for the file input. Extensions or MIME types. */
  accept?: string;
  multiple?: boolean;
  /** Largest file, in bytes. */
  maxBytes?: number;
  disabled?: boolean;
  /** Marks the zone invalid. */
  invalid?: boolean;
  /** Shown under the zone when set. */
  error?: string;
  label?: string;
  hint?: string;
  /** 0–100 while a parent upload is running. Hidden when null. */
  progress?: number | null;
  value?: File[];
  onValueChange?: (files: File[]) => void;
  onReject?: (message: string) => void;
  className?: string;
}

function extensionOf(file: File) {
  const part = file.name.split(".").pop()?.toLowerCase();
  return part ? `.${part}` : "";
}

function acceptsFile(file: File, accept: string | undefined) {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const ext = extensionOf(file);
  const mime = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return ext === rule;
    if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUpload({
  accept,
  multiple = false,
  maxBytes = DEFAULT_MAX_BYTES,
  disabled = false,
  invalid = false,
  error,
  label = "Drop a file or browse",
  hint,
  progress = null,
  value,
  onValueChange,
  onReject,
  className,
  ...zoneProps
}: FileUploadProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolled, setUncontrolled] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const files = value ?? uncontrolled;
  const shownHint = hint ?? `Up to ${formatBytes(maxBytes)}`;
  const message = error ?? rejected;

  function commit(next: File[]) {
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  function reject(message: string) {
    setRejected(message);
    onReject?.(message);
  }

  function take(list: FileList | File[] | null) {
    // Copy before clearing. The change event's FileList is live and empties with the input.
    const incoming = list ? Array.from(list) : [];
    if (inputRef.current) inputRef.current.value = "";
    if (disabled || incoming.length === 0) return;
    const accepted: File[] = [];
    let rejection: string | null = null;
    for (const file of incoming) {
      if (!acceptsFile(file, accept)) {
        rejection = `${file.name} is not an allowed type.`;
        continue;
      }
      if (file.size > maxBytes) {
        rejection = `${file.name} is larger than ${formatBytes(maxBytes)}.`;
        continue;
      }
      accepted.push(file);
      if (!multiple) break;
    }
    if (rejection) reject(rejection);
    if (accepted.length === 0) return;
    setRejected(null);
    commit(multiple ? [...files, ...accepted] : accepted);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files);
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    take(event.target.files);
  }

  const showProgress = progress !== null && progress !== undefined;

  return (
    <div data-slot="file-upload" className={cn("grid gap-3", className)} {...zoneProps}>
      <label
        htmlFor={inputId}
        data-dragging={dragging ? "true" : "false"}
        data-disabled={disabled ? "true" : "false"}
        data-invalid={invalid || message ? "true" : undefined}
        className={fileUploadClass}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={onDrop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="size-6 text-muted-foreground">
          <path d="M12 16V5" strokeLinecap="round" />
          <path d="m8 8 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 16.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{shownHint}</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={invalid || message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className="sr-only"
          onChange={onInput}
        />
      </label>

      {showProgress ? (
        <div
          data-slot="file-upload-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="h-1.5 overflow-hidden rounded-full bg-foreground/15"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      ) : null}

      {files.length > 0 ? (
        <ul className="grid gap-2" aria-live="polite">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className={fileUploadFileClass}>
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                className="cursor-pointer rounded-full p-1 text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
                onClick={() => commit(files.filter((_, itemIndex) => itemIndex !== index))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-3.5">
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export { FileUpload };
