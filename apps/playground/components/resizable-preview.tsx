"use client";

import { useState, type ReactNode } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@aazenc/ui/resizable";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import { Separator } from "@aazenc/ui/separator";
import { useTheme } from "@aazenc/themes";

const roles = [
  { title: "Senior Frontend Engineer", company: "Northwind", stage: "Interview" },
  { title: "Product Designer", company: "Lumen", stage: "Offer" },
  { title: "Backend Engineer, Go", company: "Fernwood", stage: "Applied" },
  { title: "Data Analyst", company: "Halcyon", stage: "Interview" },
  { title: "DevOps Engineer", company: "Ardent", stage: "Rejected" },
  { title: "Technical Writer", company: "Brightwell", stage: "Applied" },
  { title: "Mobile Engineer, iOS", company: "Kestrel", stage: "Applied" },
  { title: "Engineering Manager", company: "Solace", stage: "Offer" },
];

function RoleList() {
  return (
    <div className="grid gap-1 p-3">
      {roles.map((role) => (
        <div key={role.title} className="grid gap-0.5 rounded-lg px-2 py-1.5 odd:bg-muted/50">
          <p className="truncate text-sm font-medium">{role.title}</p>
          <p className="truncate text-xs text-muted-foreground">{role.company}</p>
        </div>
      ))}
    </div>
  );
}

function RoleDetail() {
  return (
    <div className="grid gap-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Senior Frontend Engineer</h2>
        <Badge variant="soft">Interview</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Northwind · Remote · Posted 3 days ago. The list beside this panel scrolls on its own, so widening
        the split does not need the panel to grow a scrollbar of its own.
      </p>
      <Separator />
      <div className="grid gap-3 text-sm">
        <div>
          <p className="font-medium">Scorecard</p>
          <p className="text-muted-foreground">System design 4.2, frontend 4.6, communication 3.9.</p>
        </div>
        <div>
          <p className="font-medium">Next step</p>
          <p className="text-muted-foreground">Onsite loop, Thursday.</p>
        </div>
      </div>
    </div>
  );
}

/** Every group needs a parent with a height. This is the frame that gives it one. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="h-80 overflow-hidden rounded-[var(--radius-panel)] border border-border">{children}</div>
  );
}

export function ResizablePreview() {
  const { mode, toggleMode } = useTheme();
  const [layout, setLayout] = useState<Record<string, number>>({});

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Resizable</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A split you can drag, either way round. The handle is a ten pixel target in both of its looks:
            by default a hairline drawn inside it, so hovering brightens a line and not a slab, or a band
            that tints the whole target, for chrome you resize by its edge.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid gap-3">
        <p className="text-sm font-medium">Side by side, with the grip</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The default split. Ten pixels of target with a one pixel rule drawn inside it, so the size you grab
          and the line you see are two different things, and the six dots are opt-in. Drag it, or tab to it
          and use the arrow keys.
        </p>
        <Frame>
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={34}>
              <RoleList />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={66}>
              <RoleDetail />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Frame>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">Stacked, without the grip</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Same component, one prop. The handle turns with the group, so the same
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">ResizableHandle</code>
          is a lying-down rule here and an upright one above. Drop
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">withHandle</code>
          and the line is all that is left.
        </p>
        <Frame>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={55}>
              <RoleList />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={45}>
              <RoleDetail />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Frame>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">Three panels, and a split worth remembering</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          An <code className="rounded bg-muted px-1 py-0.5 text-xs">id</code> plus a
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">defaultLayout</code> is how the group
          remembers where you left it. Sizes come back as percentages, keyed by panel. The inbox panel is the
          one part that takes a{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">className</code>, which is what makes it a
          flex column, so the heading stays put and the links take the height that is left.
        </p>
        <div className="h-64 overflow-hidden rounded-[var(--radius-panel)] border border-border">
          <ResizablePanelGroup
            id="preview-three"
            defaultLayout={{ inbox: 26, list: 40, detail: 34 }}
            onLayoutChanged={(next) => setLayout(next as Record<string, number>)}
          >
            <ResizablePanel id="inbox" className="flex flex-col">
              <p className="p-3 pb-1 text-xs font-medium text-muted-foreground">Inbox</p>
              <div className="grid flex-1 gap-1 px-3 pb-3">
                {["Mentions", "Assigned", "Archived", "Spam"].map((label) => (
                  <p key={label} className="rounded-lg px-2 py-1.5 text-sm odd:bg-muted/50">
                    {label}
                  </p>
                ))}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="list">
              <RoleList />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="detail">
              <RoleDetail />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {Object.keys(layout).length > 0
            ? JSON.stringify(layout)
            : "Drag a handle to see the layout it reports."}
        </p>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">An edge, and nothing at rest</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The band variant is the same ten pixel target with the hairline left out, so the target size never
          changes and only the paint does. Nothing at rest, the whole ten pixels tinted on hover, a solid
          line while you drag. That suits chrome you pull by its edge, a sidebar beside a page, where a
          permanent rule would be noise.
        </p>
        <Frame>
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={24}>
              <RoleList />
            </ResizablePanel>
            <ResizableHandle variant="band" />
            <ResizablePanel defaultSize={76}>
              <RoleDetail />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Frame>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Left empty, the strip stays invisible until a pointer finds it, which is the trade the band is
          making. When the edge does need to be seen, the next section puts a mark on it on purpose.
        </p>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">Chevrons, and the panel behind each one</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A band that shows nothing at rest is fine until people stop noticing it. That is what{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">collapsible</code> is for: the handle grows
          a pill in the middle of its own ten pixels, a chevron at each end and the six dots between them. It
          is a prop of its own rather than another variant, and it draws the same pill on the default rule
          handle.
        </p>
        <Frame>
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={28}>
              <RoleList />
            </ResizablePanel>
            <ResizableHandle variant="band" collapsible />
            <ResizablePanel defaultSize={72}>
              <RoleDetail />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Frame>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Each chevron works on the panel behind it, not the one in front of it, so the left chevron takes
          down the left panel and the right one the right panel. Both are toggles: press the same chevron
          again and the panel comes back at the size it had. The pill is wider than the handle it sits on
          and is centred on it, so it lays a strip across both panels, and a panel beside a collapsible
          handle turns collapsible on its own, so that panel can be dragged shut as well as buttoned shut.
          Stack the group and the whole pill lies down with it, chevrons included, so the top panel is
          reached from the top.
        </p>
      </section>
    </main>
  );
}
