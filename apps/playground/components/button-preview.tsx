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
] as const;

export function ButtonPreview() {
  const { mode, toggleMode } = useTheme();
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Button</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Six actions. Pill by default. Pass a variant, size, shape, width, or align.
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
