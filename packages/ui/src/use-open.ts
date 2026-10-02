"use client";

import { useState } from "react";

export function useOpen(open: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const current = open ?? uncontrolled;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return [current, setOpen] as const;
}
