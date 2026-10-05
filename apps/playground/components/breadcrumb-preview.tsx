"use client";

import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@aazenc/ui/breadcrumb";
import { Button } from "@aazenc/ui/button";
import { Separator } from "@aazenc/ui/separator";
import { useTheme } from "@aazenc/themes";

export function BreadcrumbPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Breadcrumb</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A labelled nav around a list. The chevron is drawn by each crumb and hidden on the first, so a trail
            can never come out with a separator before the first entry or a doubled one in the middle.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid gap-3">
        <p className="text-sm font-medium">The trail</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The last crumb is a span, not a link. You cannot navigate to the page you are already on, and a link
          there is a control that does nothing.
        </p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/components">Components</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/components/breadcrumb">Breadcrumb</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Default</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">Two navs need two labels</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A page with more than one nav is only navigable if the landmarks can be told apart, which is what
          <code className="mx-1 font-mono text-foreground">label</code> is for. Two breadcrumbs on one page, each
          named:
        </p>
        <div className="grid max-w-2xl gap-4 rounded-lg border border-border p-6">
          <Breadcrumb label="Project">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Acme</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Separator />
          <Breadcrumb label="Settings">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Billing</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Payment method</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">A long path wraps</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A trail scrolls sideways to hide the ancestors, which are the part you can actually navigate to. So this
          one wraps, and the current page truncates rather than pushing the rest of the row off screen. Narrow
          the window to watch it reflow.
        </p>
        <div className="max-w-sm rounded-lg border border-border p-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Infrastructure</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Clusters</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">eu-central-1</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Node pool autoscaling settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <section className="mt-12 grid gap-3">
        <p className="text-sm font-medium">One crumb is a valid trail</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A single crumb renders with no separator at all, because the first crumb always suppresses its own.
        </p>
        <div className="max-w-sm rounded-lg border border-border p-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>
    </main>
  );
}
