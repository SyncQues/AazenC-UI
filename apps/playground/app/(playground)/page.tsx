import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import { CodeBlock } from "@aazenc/ui/code-block";
import { HomeShowcase } from "../../components/home-showcase";

export const metadata: Metadata = {
  title: "AazenC UI — component library for product UI",
  description:
    "AazenC UI is a component library for product UI. 57 components, copied into your project by a CLI, themed entirely with tokens.",
};

const stats = [
  { value: "57", label: "Components in the registry" },
  { value: "48", label: "Documented, with examples" },
  { value: "2", label: "Themes — slate and mono" },
  { value: "20", label: "Catalog categories" },
];

const principles = [
  {
    title: "Copied in, not depended on",
    body: "The CLI writes components into your project and records what it wrote. update refreshes a file only when it still matches that copy, so your edits are never overwritten.",
  },
  {
    title: "Variants by default, className on top",
    body: "variant, size, shape, width, and align props carry the look, so screens stay consistent. When a preset does not cover the case, className is merged last and wins.",
  },
  {
    title: "Tokens, not hex values",
    body: "Every colour resolves from a CSS variable. Switch theme or mode and the whole page repaints, because nothing was ever hard-coded to a value.",
  },
  {
    title: "Charts without a charting dependency",
    body: "Area, bar, line, and pie share one internal engine and one set of primitives, themed by the same tokens, animating on the compositor, and readable by keyboard and screen reader.",
  },
];

const popular = [
  { href: "/components/button", name: "Button", note: "Seven variants, five sizes, pill by default" },
  { href: "/components/dialog", name: "Dialog", note: "One panel, modal or alert" },
  { href: "/components/drawer", name: "Drawer", note: "One sheet, with a scrolling body" },
  { href: "/components/command", name: "Command", note: "One list, inline or in a dialog" },
  { href: "/components/select", name: "Select", note: "One pill, plus a searchable multi-select" },
  { href: "/components/table", name: "Table", note: "One bordered grid" },
  { href: "/components/charts", name: "Charts", note: "Four chart types on one engine" },
  { href: "/components/metric-card", name: "Metric card", note: "A KPI tile, trend coloured by sentiment" },
];

const install = `npx @aazenc/cli@latest init
npx @aazenc/cli@latest add button card dialog`;

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-4 pt-16 sm:pt-24">
        <Badge variant="outline">Version 0.2.0</Badge>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          A component library for product UI, not a page of swatches.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Fifty-five components that a CLI copies into your project, themed end to end with tokens,
          and documented page by page. You own the code once it lands.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/getting-started">Get started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/components">Browse components</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/themes">See the themes</Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section
        aria-label="Library at a glance"
        className="mx-auto mt-16 max-w-5xl px-6 sm:mt-20"
      >
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col bg-background p-6">
              <dt className="order-2 mt-2 text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 font-display text-3xl tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Live showcase */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <HomeShowcase />
      </section>

      {/* Install */}
      <section className="mx-auto max-w-5xl px-6 pb-16 sm:pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">Two commands</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          init writes the config and the theme stylesheet. add copies the components you ask for
          and installs their dependencies.
        </p>
        <div className="mt-6 max-w-2xl">
          <CodeBlock code={install} language="bash" filename="terminal" />
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-5xl px-6 pb-16 sm:pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">How it is built</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {principles.map((item) => (
            <li key={item.title} className="rounded-lg border border-border p-6">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-5xl px-6 pb-16 sm:pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">Start with one of these</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {popular.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex flex-col gap-1 py-4">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/components" className="text-foreground underline underline-offset-4">
            All 48 documented components
          </Link>
        </p>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-lg border border-border bg-card p-8 sm:p-10">
          <h2 className="font-display text-2xl tracking-tight">Wire it into an app</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The getting started page covers where the files land, how to import the theme
            stylesheet, and every CLI flag. It takes about two minutes.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/getting-started">Read getting started</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
