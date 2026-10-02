"use client";

import { useState } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@aazenc/ui/sheet";
import type { SheetSide } from "@aazenc/ui/sheet";
import { Button } from "@aazenc/ui/button";
import { Input } from "@aazenc/ui/input";
import { Label } from "@aazenc/ui/label";
import { Separator } from "@aazenc/ui/separator";
import { useTheme } from "@aazenc/themes";

const sides: SheetSide[] = ["right", "left", "bottom", "top"];

function WorkspaceRow() {
  return (
    <div className="grid gap-1.5 py-3">
      <p className="text-sm font-medium">SyncQues</p>
      <p className="text-sm text-muted-foreground">Owner. 12 open roles, 3 drafts.</p>
    </div>
  );
}

export function SheetPreview() {
  const { mode, toggleMode } = useTheme();
  const [lastSide, setLastSide] = useState<SheetSide>("right");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sheet</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A panel docked to an edge. Same panel from all four, right by default. No handle and no drag, which
            is the whole difference from Drawer.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">Sides</p>
        <p className="text-sm text-muted-foreground">
          Each one slides in from its own edge. The edge it is docked to is square, the free edge carries the
          panel radius, so it never looks like it is floating off the screen.
        </p>
        <div className="flex flex-wrap gap-2">
          {sides.map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="sm" onClick={() => setLastSide(side)}>
                  {side}
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Invite a teammate</SheetTitle>
                  <SheetDescription>
                    They get an email with a link that expires in seven days.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`sheet-email-${side}`}>Email</Label>
                      <Input
                        id={`sheet-email-${side}`}
                        type="email"
                        placeholder="name@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`sheet-role-${side}`}>Role</Label>
                      <Input id={`sheet-role-${side}`} type="text" defaultValue="Recruiter" />
                    </div>
                  </div>
                  <Separator />
                  <WorkspaceRow />
                  <Separator />
                  <WorkspaceRow />
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="button">Send invite</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Last opened from the {lastSide} edge.</p>
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">A settings sheet, the common case</p>
        <p className="text-sm text-muted-foreground">
          The header and the action row stay put and only the body scrolls, so the primary action is never the
          thing that scrolled off the screen.
        </p>
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline">
                Notification settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>Choose what lands in your inbox.</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="grid gap-4 py-4">
                  {["New applications", "Interview reminders", "Weekly digest", "Product updates"].map(
                    (label) => (
                      <label key={label} className="flex items-center justify-between gap-4 text-sm">
                        <span>{label}</span>
                        <input type="checkbox" defaultChecked className="size-4 accent-[var(--foreground)]" />
                      </label>
                    ),
                  )}
                </div>
              </SheetBody>
              <SheetFooter>
                <Button type="button">Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <section className="mt-12 grid max-w-2xl gap-3">
        <p className="text-sm font-medium">Without the close button</p>
        <p className="text-sm text-muted-foreground">
          The overlay and the escape key still dismiss it. Use this when the panel is a step in a flow, not a
          place you wander into.
        </p>
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline">
                Step one of two
              </Button>
            </SheetTrigger>
            <SheetContent close={false}>
              <SheetHeader>
                <SheetTitle>Connect a source</SheetTitle>
                <SheetDescription>Pick where your roles should sync from.</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <p className="py-4 text-sm text-muted-foreground">
                  There is no X in the corner here. The scrim and the escape key are still there, and the header
                  keeps the same padding, so the title does not jump.
                </p>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </section>
    </main>
  );
}
