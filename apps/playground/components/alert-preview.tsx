"use client";

import { useState } from "react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@aazenc/ui/alert";
import { Button } from "@aazenc/ui/button";
import { Input } from "@aazenc/ui/input";
import { Label } from "@aazenc/ui/label";
import { useTheme } from "@aazenc/themes";

const tones = [
  { tone: "default", title: "Draft saved as private", copy: "Only you can see this role until you publish it." },
  { tone: "success", title: "Profile is live", copy: "Your profile is public and open to applications." },
  { tone: "warning", title: "This link expires today", copy: "Share it before midnight or ask for a new one." },
  { tone: "destructive", title: "Could not save the role", copy: "The server refused the change. Your edits are still here." },
] as const;

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertPreview() {
  const { mode, toggleMode } = useTheme();
  const [offline, setOffline] = useState(true);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Alert</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One inline message. The tone picks the border, the wash, and the icon, so saved, careful, it broke, and
            heads up are four tints of one box.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid max-w-2xl gap-4">
        {tones.map((item) => (
          <Alert key={item.tone} tone={item.tone}>
            <AlertTitle>{item.title}</AlertTitle>
            <AlertDescription>{item.copy}</AlertDescription>
          </Alert>
        ))}
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">With actions</p>
        <p className="text-sm text-muted-foreground">
          An action row sits at the end of the row, and wraps onto its own line when the message is long. Keep the
          box on the page by holding the state here.
        </p>
        {offline ? (
          <Alert tone="warning">
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Drafts are saved on this device and sent when the connection is back.
            </AlertDescription>
            <AlertAction>
              <Button type="button" variant="outline" size="sm" onClick={() => setOffline(false)}>
                Got it
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground">Back online.</p>
        )}
      </section>

      <section className="mt-12 grid max-w-2xl gap-4">
        <p className="text-sm font-medium">Shapes</p>
        <p className="text-sm text-muted-foreground">
          The same three shapes as Button, but rounded first. A pill swallows a two-line message, so the default is
          the panel radius, the one a toast card uses.
        </p>
        {(["rounded", "pill", "square"] as const).map((shape) => (
          <Alert key={shape} shape={shape}>
            <AlertTitle>{shape}</AlertTitle>
            <AlertDescription>A role expires in three days. Renew it to keep it in the search results.</AlertDescription>
          </Alert>
        ))}
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">Beside a field</p>
        <div className="grid gap-2">
          <Label htmlFor="workspace">Workspace name</Label>
          <Input id="workspace" defaultValue="SyncQues" aria-describedby="workspace-error" />
          <Alert id="workspace-error" tone="destructive">
            <AlertDescription>A workspace name has to be unique.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="mt-12 grid max-w-2xl gap-4">
        <p className="text-sm font-medium">Your own icon, and no icon</p>
        <Alert icon={<ClockIcon />}>
          <AlertTitle>Interviews run for 30 minutes</AlertTitle>
          <AlertDescription>Candidates get a reminder 10 minutes before.</AlertDescription>
        </Alert>
        <Alert icon={false}>
          <AlertTitle>Scheduled maintenance on Sunday</AlertTitle>
          <AlertDescription>Nothing to do. The site comes back on its own.</AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          An alert with no icon and no tone is a border. That should be a Divider.
        </p>
      </section>
    </main>
  );
}
