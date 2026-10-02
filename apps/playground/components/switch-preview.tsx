"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Label } from "@aazenc/ui/label";
import { Switch } from "@aazenc/ui/switch";
import { useTheme } from "@aazenc/themes";

export function SwitchPreview() {
  const { mode, toggleMode } = useTheme();
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Switch</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One track. On fills with the theme primary. Off stays an outline, including in dark mode.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-sm gap-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="email-alerts">Email alerts</Label>
          <Switch id="email-alerts" checked={email} onCheckedChange={setEmail} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="push-alerts">Push alerts</Label>
          <Switch id="push-alerts" checked={push} onCheckedChange={setPush} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sms-alerts">SMS alerts</Label>
          <Switch id="sms-alerts" disabled checked />
        </div>
        <p className="text-sm text-muted-foreground">On: {[email ? "Email" : null, push ? "Push" : null].filter(Boolean).join(", ") || "none"}</p>
      </div>
    </main>
  );
}
