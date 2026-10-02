"use client";

import { useEffect, useState } from "react";
import { cn } from "@aazenc/utils";
import { toastCardVariants, toastIconClass, toastViewportClass, type ToastTone } from "./toast-variants";

export interface ToastOptions {
  description?: string;
  /** Milliseconds before it leaves. 0 stays until dismissed. */
  duration?: number;
}

interface ToastRecord {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 4;

let nextId = 1;
let records: ToastRecord[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function pushToast(title: string, tone: ToastTone, options?: ToastOptions) {
  const id = nextId;
  nextId += 1;
  const duration = options?.duration ?? DEFAULT_DURATION;
  records = [...records, { id, title, description: options?.description, tone, duration }].slice(-MAX_TOASTS);
  emit();
  if (duration > 0) {
    window.setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

function dismissToast(id: number) {
  const next = records.filter((item) => item.id !== id);
  if (next.length === records.length) return;
  records = next;
  emit();
}

export const toast = Object.assign((title: string, options?: ToastOptions) => pushToast(title, "default", options), {
  success: (title: string, options?: ToastOptions) => pushToast(title, "success", options),
  warning: (title: string, options?: ToastOptions) => pushToast(title, "warning", options),
  error: (title: string, options?: ToastOptions) => pushToast(title, "destructive", options),
  dismiss: dismissToast,
});

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" data-tone={tone} className={toastIconClass}>
        <path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "warning" || tone === "destructive") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" data-tone={tone} className={toastIconClass}>
        <path d="M12 8v5" strokeLinecap="round" />
        <path d="M12 16.5h.01" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" data-tone={tone} className={toastIconClass}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" strokeLinecap="round" />
      <path d="M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

function Toaster() {
  const [items, setItems] = useState<ToastRecord[]>(records);

  useEffect(() => {
    const sync = () => setItems(records);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return (
    <div data-slot="toaster" className={toastViewportClass} aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <div key={item.id} data-slot="toast" data-tone={item.tone} role={item.tone === "destructive" ? "alert" : "status"} className={cn(toastCardVariants({ tone: item.tone }))}>
          <ToastIcon tone={item.tone} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description ? <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            className="cursor-pointer rounded-full p-1 text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={() => dismissToast(item.id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-3.5">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export { Toaster };
