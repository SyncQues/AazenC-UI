"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@aazenc/ui/alert";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import { Progress } from "@aazenc/ui/progress";
import { Spinner } from "@aazenc/ui/spinner";
import { Switch } from "@aazenc/ui/switch";
import { useTheme } from "@aazenc/themes";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * The landing page runs the library against itself, so the first screen is proof
 * rather than a claim. Mode toggle lives here because the swatches below are read
 * out of the cascade — they repaint when the mode or theme changes.
 */
export function HomeShowcase() {
  const { mode, toggleMode } = useTheme();
  const [on, setOn] = useState(true);
  const [value, setValue] = useState(64);

  return (
    <section
      aria-labelledby="showcase-heading"
      className="rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Live</p>
          <h2 id="showcase-heading" className="mt-2 text-lg font-semibold">
            The components, running here
          </h2>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-6">
        <Row label="Buttons">
          <Button type="button" size="sm">
            Primary
          </Button>
          <Button type="button" size="sm" variant="outline">
            Outline
          </Button>
          <Button type="button" size="sm" variant="ghost">
            Ghost
          </Button>
          <Button type="button" size="sm" variant="destructive-soft">
            Destructive
          </Button>
        </Row>

        <Row label="Badges">
          <Badge>Default</Badge>
          <Badge variant="soft">Soft</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Row>

        <Row label="Progress">
          {/* Progress omits className, so the width belongs on a wrapper. */}
          <div className="w-40">
            <Progress value={value} />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setValue((current) => (current >= 100 ? 12 : current + 16))}
          >
            {value}%
          </Button>
        </Row>

        <Row label="Switch and spinner">
          <Switch checked={on} onCheckedChange={setOn} aria-label="Notifications" />
          <span className="text-sm text-muted-foreground">{on ? "On" : "Off"}</span>
          <Spinner label="Loading the workspace" />
          <Spinner size="sm" label="Loading the workspace, small size" />
        </Row>
      </div>

      <div className="mt-6">
        <Alert tone="warning">
          <AlertTitle headingLevel={3}>Every colour is a token</AlertTitle>
          <AlertDescription>
            Switch theme or mode from the navbar and this alert repaints with it. Nothing here is
            a hard-coded hex.
          </AlertDescription>
        </Alert>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Each one has its own page with the full variant list and a copyable example.{" "}
        <Link href="/components" className="text-foreground underline underline-offset-4">
          Browse all components
        </Link>
        .
      </p>
    </section>
  );
}
