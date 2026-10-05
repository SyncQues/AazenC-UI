"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@aazenc/ui/button";
import { Toggle } from "@aazenc/ui/toggle";
import { useTheme } from "@aazenc/themes";

const ICONS = {
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M19 4h-9m4 16H5M15 4 9 20" />,
  underline: <path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16" />,
  strike: (
    <path d="M4 12h16M16 7a4 3 0 0 0-4-3c-2.2 0-3.6 1-4 2.4M8 16.2A4 4 0 0 0 12 18c2.3 0 3.7-1 4-2.4" />
  ),
};

const MARKS = ["bold", "italic", "underline", "strike"] as const;
type Mark = (typeof MARKS)[number];

function Icon({ name, className }: { name: Mark; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="min-w-24 text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function TogglePreview() {
  const { mode, toggleMode } = useTheme();
  // No `value` passed: each toggle keeps its own state, which is the common case
  // for a formatting bar nobody needs to read back.
  const [marked, setMarked] = useState<Mark[]>(["bold"]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Toggle</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One button that stays down. Pill by default, and it springs as it
            turns on.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Uncontrolled — each one keeps its own state
          </h2>
          <Row label="Format">
            {MARKS.map((mark) => (
              <Toggle
                key={mark}
                aria-label={mark}
                defaultPressed={mark === "bold"}
                className="w-8 px-0"
              >
                <Icon name={mark} />
              </Toggle>
            ))}
          </Row>
          <p className="text-xs text-muted-foreground">
            An icon-only toggle still needs a name, so it takes{" "}
            <code className="font-mono">aria-label</code>. That is a plain
            button underneath: Space and Enter come from the browser, and a
            reader announces &ldquo;pressed&rdquo; on its own.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Controlled — the parent holds the answer
          </h2>
          <Row label="Format">
            {MARKS.map((mark) => (
              <Toggle
                key={mark}
                aria-label={mark}
                pressed={marked.includes(mark)}
                onPressedChange={(on) =>
                  setMarked((current) =>
                    on
                      ? [...current, mark]
                      : current.filter((entry) => entry !== mark),
                  )
                }
                className="w-8 px-0"
              >
                <Icon name={mark} />
              </Toggle>
            ))}
          </Row>
          <p className="text-xs text-muted-foreground">
            <code className="font-mono">onPressedChange</code> hands back the
            next state, not the current one, so there is nothing to invert. On:{" "}
            {marked.length ? marked.join(", ") : "nothing"}.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            With text, and the outline variant
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Toggle variant="outline">Pin</Toggle>
            <Toggle variant="outline" defaultPressed>
              Starred
            </Toggle>
            <Toggle disabled>Locked</Toggle>
          </div>
          <p className="text-xs text-muted-foreground">
            <code className="font-mono">default</code> is ink only until it is
            pressed; <code className="font-mono">outline</code> carries its own
            border. A pressed toggle looks the same in both.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            {(["sm", "default", "lg"] as const).map((size) => (
              <Toggle key={size} size={size} variant="outline" defaultPressed>
                {size === "default" ? "Default" : size.toUpperCase()}
              </Toggle>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            The same 7/8/9 scale the toggle group and the segmented control use,
            so a toggle dropped into either row sits on the baseline.
          </p>
        </section>
      </div>
    </main>
  );
}
