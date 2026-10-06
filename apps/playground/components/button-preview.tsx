"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 10v12" strokeLinecap="round" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" strokeLinecap="round" />
    </svg>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

const variants = [
  ["default", "Primary"],
  ["outline", "Outline"],
  ["ghost", "Ghost"],
  ["destructive", "Destructive"],
  ["destructive-soft", "Destructive text"],
  ["link", "Link"],
  ["soft", "Soft"],
] as const;

export function ButtonPreview() {
  const { mode, toggleMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(2);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Button</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Seven actions. Pill by default. Pass a variant, size, shape, width, or align.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Variants</h2>
        {variants.map(([variant, label]) => (
          <Row key={variant} label={label}>
            <Button type="button" variant={variant}>
              {variant === "link" ? "Open" : "Continue"}
            </Button>
          </Row>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Post card actions</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The SyncQues feed row. <code className="text-foreground">soft</code> stays quiet until
          the pointer arrives, and <code className="text-foreground">aria-pressed</code> is what
          holds the blue once a reaction is on — it is a toggle button, so it is announced as one.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="soft"
              size="sm"
              aria-pressed={liked}
              onClick={() => {
                setLiked((value) => !value);
                setLikes((value) => value + (liked ? -1 : 1));
              }}
            >
              <ThumbsUpIcon />
              {/* tabular-nums keeps the pill the same width when 9 becomes 10. */}
              <span className="tabular-nums">{likes}</span>
            </Button>
            <Button type="button" variant="soft" size="sm">
              <MessageIcon />
              <span className="tabular-nums">2</span>
            </Button>
            <Button type="button" variant="soft" size="sm">
              <ShareIcon />
              Share
            </Button>
          </div>
        </div>
        <Row label="Resting and pressed">
          <Button type="button" variant="soft" size="sm" aria-pressed={false}>
            <ThumbsUpIcon />
            <span className="tabular-nums">{likes}</span>
          </Button>
          <Button type="button" variant="soft" size="sm" aria-pressed>
            <ThumbsUpIcon />
            <span className="tabular-nums">{likes}</span>
          </Button>
          <Button type="button" variant="soft" size="sm" disabled>
            <MessageIcon />
            <span className="tabular-nums">2</span>
          </Button>
        </Row>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Sizes</h2>
        <Row label="Text">
          <Button type="button" size="xs">Extra small</Button>
          <Button type="button" size="sm">Small</Button>
          <Button type="button" size="default">Default</Button>
          <Button type="button" size="lg">Large</Button>
          <Button type="button" size="xl">Extra large</Button>
        </Row>
        <Row label="Icon">
          <Button type="button" size="icon-2xs" variant="ghost" aria-label="Tiny">
            <PlusIcon />
          </Button>
          <Button type="button" size="icon-xs" variant="outline" aria-label="Extra small icon">
            <PlusIcon />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Small icon">
            <PlusIcon />
          </Button>
          <Button type="button" size="icon" variant="default" aria-label="Icon">
            <PlusIcon />
          </Button>
          <Button type="button" size="icon-lg" aria-label="Large icon">
            <PlusIcon />
          </Button>
        </Row>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Shape, width, align</h2>
        <Row label="Shape">
          <Button type="button" variant="outline">Pill</Button>
          <Button type="button" variant="outline" shape="rounded">Rounded</Button>
          <Button type="button" variant="outline" shape="square">Square</Button>
        </Row>
        <div className="max-w-sm py-4">
          <Button type="button" width="full">Full width</Button>
        </div>
        <div className="max-w-xs py-2">
          <Button type="button" variant="ghost" align="start" width="full">
            <PlusIcon />
            Aligned to the start
          </Button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">State</h2>
        <Row label="Loading and disabled">
          <Button type="button" loading={loading} onClick={() => setLoading((value) => !value)}>
            {loading ? "Saving" : "Save"}
          </Button>
          <Button type="button" variant="outline" disabled>
            Disabled
          </Button>
          <Button type="button" variant="destructive-soft" size="icon" loading aria-label="Removing">
            <PlusIcon />
          </Button>
          <Button type="button" variant="outline" aria-invalid="true">
            Invalid
          </Button>
        </Row>
        <Row label="Link">
          <Button variant="link" asChild>
            <Link href="/components">All components</Link>
          </Button>
          <Button asChild>
            <Link href="/getting-started">Get started</Link>
          </Button>
        </Row>
      </section>
    </main>
  );
}
