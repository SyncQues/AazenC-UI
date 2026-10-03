"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@aazenc/utils";
import { toastCardVariants, toastIconClass, toastViewportClass, type ToastTone } from "./toast-variants";
import { ToneIcon } from "./tone-icon";

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
  remaining: number;
  startedAt: number;
  timer: number | null;
}

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 4;
const EMPTY: ToastRecord[] = [];

let nextId = 1;
let records: ToastRecord[] = [];
let mountedToasters = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function arm(id: number) {
  const item = records.find((record) => record.id === id);
  if (!item || item.remaining <= 0 || typeof window === "undefined") return;
  item.startedAt = Date.now();
  item.timer = window.setTimeout(() => dismissToast(id), item.remaining);
}

function pauseToast(id: number) {
  const item = records.find((record) => record.id === id);
  if (!item || item.timer == null || typeof window === "undefined") return;
  item.remaining = Math.max(0, item.remaining - (Date.now() - item.startedAt));
  window.clearTimeout(item.timer);
  item.timer = null;
}

function resumeToast(id: number) {
  const item = records.find((record) => record.id === id);
  if (!item || item.duration === 0 || item.timer != null) return;
  arm(id);
}

function pushToast(title: string, tone: ToastTone, options?: ToastOptions) {
  if (typeof window === "undefined") return -1;
  if (mountedToasters === 0) {
    console.warn("toast() was called before <Toaster /> mounted.");
  }
  const id = nextId;
  nextId += 1;
  const duration = options?.duration ?? (tone === "destructive" ? 0 : DEFAULT_DURATION);
  const record: ToastRecord = {
    id,
    title,
    description: options?.description,
    tone,
    duration,
    remaining: duration,
    startedAt: Date.now(),
    timer: null,
  };
  records = [...records, record].slice(-MAX_TOASTS);
  emit();
  if (duration > 0) arm(id);
  return id;
}

function dismissToast(id: number) {
  const item = records.find((record) => record.id === id);
  if (item?.timer != null && typeof window !== "undefined") window.clearTimeout(item.timer);
  const next = records.filter((record) => record.id !== id);
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

function Toaster() {
  const items = useSyncExternalStore(subscribe, () => records, () => EMPTY);

  useEffect(() => {
    mountedToasters += 1;
    return () => {
      mountedToasters -= 1;
    };
  }, []);

  return (
    <div data-slot="toaster" className={toastViewportClass} aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <div
          key={item.id}
          data-slot="toast"
          data-tone={item.tone}
          aria-atomic="true"
          className={cn(toastCardVariants({ tone: item.tone }))}
          onMouseEnter={() => pauseToast(item.id)}
          onMouseLeave={() => resumeToast(item.id)}
          onFocusCapture={() => pauseToast(item.id)}
          onBlurCapture={() => resumeToast(item.id)}
        >
          <ToneIcon tone={item.tone} className={toastIconClass} strokeWidth={2.5} />
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
