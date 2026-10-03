/**
 * SyncQues tone marks — one drawing per tone, shared by alert and toast, which
 * had drifted apart. Every mark is `aria-hidden`: the role and the words carry
 * the tone, never the picture.
 */

export type Tone = "default" | "success" | "warning" | "destructive";

export interface ToneIconProps {
  tone: Tone;
  className?: string;
  /** Defaults to the weight the alert uses; toast asks for its own. */
  strokeWidth?: number;
}

export function ToneIcon({ tone, className, strokeWidth = 2 }: ToneIconProps) {
  const frame = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    "aria-hidden": true,
    "data-tone": tone,
    className,
  } as const;

  if (tone === "success") {
    return (
      <svg {...frame}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.2 11 14.7 15.8 9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tone === "warning") {
    return (
      <svg {...frame}>
        <path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
        <path d="M12 9.5v4" strokeLinecap="round" />
        <path d="M12 17h.01" strokeLinecap="round" />
      </svg>
    );
  }

  if (tone === "destructive") {
    return (
      <svg {...frame}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...frame}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" strokeLinecap="round" />
      <path d="M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}