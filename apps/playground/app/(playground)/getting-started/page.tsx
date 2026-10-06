import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import { CodeBlock } from "@aazenc/ui/code-block";
import { themes } from "@aazenc/themes";

export const metadata: Metadata = {
  title: "Getting started",
  description:
    "Install the AazenC CLI, add your first components, and wire the theme stylesheet into an existing app.",
};

function Step({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-muted-foreground">
          {String(step).padStart(2, "0")}
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const init = `npx @aazenc/cli@latest init`;

const addComponents = `npx @aazenc/cli@latest add button card dialog
npx @aazenc/cli@latest add --all`;

const cssImport = `@import "tailwindcss";
@import "./aazenc.css";`;

const useButton = `import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <div className="flex items-center gap-2">
      <Button type="button">Save changes</Button>
      <Button type="button" variant="outline">
        Cancel
      </Button>
    </div>
  )
}`;

const listCommand = `npx @aazenc/cli@latest list
npx @aazenc/cli@latest list --installed`;

const updateCommand = `npx @aazenc/cli@latest update
npx @aazenc/cli@latest update button --overwrite`;

const themeProvider = `"use client";

import { ThemeProvider } from "@aazenc/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="slate" defaultMode="light">
      {children}
    </ThemeProvider>
  )
}`;

const commands = [
  {
    command: "init [--ui <dir>] [--utils <file>] [--css <file>] [--force]",
    detail:
      "Write components.json and the theme stylesheet. Does not replace your UI files. Without --force an existing components.json is left alone.",
  },
  {
    command: "list [--installed]",
    detail:
      "List the registry components. --installed narrows it to the ones recorded in components.json.",
  },
  {
    command: "add <component...> [--all] [--overwrite] [--skip-install]",
    detail:
      "Copy components into the project and install their npm dependencies. Dependencies are resolved for you, so adding a dialog also brings what it imports.",
  },
  {
    command: "update [component...] [--overwrite] [--skip-install]",
    detail:
      "Refresh components this CLI installed. A file is only rewritten when it still matches the copy that was installed, so local edits are kept.",
  },
];

const commonFlags = [
  { flag: "--ui <dir>", detail: "Component directory. Default components/ui, created when missing." },
  { flag: "--utils <file>", detail: "Where cn() is written. Default lib/utils.ts, or src/lib/utils.ts." },
  { flag: "--css <file>", detail: "The global CSS file that should import the AazenC sheet." },
  { flag: "--cwd <dir>", detail: "Project directory. Default is the current directory." },
  { flag: "--overwrite", detail: "Replace files that already exist or were edited." },
  { flag: "--skip-install", detail: "Do not install npm dependencies." },
  { flag: "--installed", detail: "On list, show only components recorded in components.json." },
  { flag: "--force", detail: "On init, rewrite components.json and the theme stylesheet." },
];

const conventions = [
  {
    title: "className is the escape hatch",
    body: "Start from the variant, size, shape, width, and align props. Every component also takes className, merged last, so a one-off override does not need a new variant.",
  },
  {
    title: "Colour comes from tokens",
    body: "Every fill and border resolves from a CSS variable such as --primary or --muted-foreground, which is what makes a theme switch repaint the screen.",
  },
  {
    title: "Interactive components are client components",
    body: "Anything with state — dialog, select, tabs, toast — is marked use client. Import it from a client component, or let a server component render it with static props.",
  },
  {
    title: "Accessibility is part of the component",
    body: "Focus rings, keyboard handling, and the screen-reader names come from the component. A spinner inside a button that already says what it is doing stays decorative.",
  },
];

export default function GettingStartedPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Badge variant="outline">Start here</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Getting started</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Four steps, about two minutes. The CLI copies components into your project, so there is no
        runtime dependency to keep in step with and no wrapper to configure.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Before you start</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Node.js 22.6 or newer.</li>
          <li>
            Run every command from your project root, the folder holding package.json. The CLI looks
            for it before it writes anything.
          </li>
          <li>
            A Tailwind v4 project. AazenC ships a Tailwind stylesheet, not a prebuilt CSS file, so
            it needs the same pipeline your app already uses.
          </li>
        </ul>
      </div>

      <Step step={1} title="Initialize">
        <p className="text-muted-foreground">
          init writes two files: <code className="font-mono text-foreground">components.json</code>,
          which records what the CLI installs, and{" "}
          <code className="font-mono text-foreground">aazenc.css</code>, the theme stylesheet. It
          does not touch your own UI components.
        </p>
        <CodeBlock code={init} language="bash" filename="terminal" />
        <p className="text-sm text-muted-foreground">
          Already have a components.json? init leaves it in place. Pass{" "}
          <code className="font-mono text-foreground">--force</code> to rewrite both files.
        </p>
      </Step>

      <Step step={2} title="Import the stylesheet">
        <p className="text-muted-foreground">
          init prints the exact line to add. It has to come after{" "}
          <code className="font-mono text-foreground">tailwindcss</code> so the theme layer wins.
        </p>
        <CodeBlock code={cssImport} language="css" filename="app/globals.css" />
        <p className="text-sm text-muted-foreground">
          init looks for <code className="font-mono text-foreground">app/globals.css</code>,{" "}
          <code className="font-mono text-foreground">src/app/globals.css</code>,{" "}
          <code className="font-mono text-foreground">src/styles/globals.css</code>, then{" "}
          <code className="font-mono text-foreground">styles/globals.css</code>. Point it somewhere
          else with <code className="font-mono text-foreground">--css</code>.
        </p>
      </Step>

      <Step step={3} title="Add components">
        <p className="text-muted-foreground">
          Add them by slug — the same slug the docs route and the registry use. Dependencies are
          resolved for you, so a dialog also brings the button and overlay it imports.
        </p>
        <CodeBlock code={addComponents} language="bash" filename="terminal" />
        <p className="text-sm text-muted-foreground">
          Not sure of a slug?{" "}
          <Link href="/components" className="text-foreground underline underline-offset-4">
            Browse the catalog
          </Link>{" "}
          or run <code className="font-mono text-foreground">list</code> to see all 57.
        </p>
      </Step>

      <Step step={4} title="Use one">
        <p className="text-muted-foreground">
          Components import from the directory the CLI chose, which init also prints. The default is{" "}
          <code className="font-mono text-foreground">@/components/ui</code>.
        </p>
        <CodeBlock code={useButton} language="tsx" filename="example.tsx" showLines />
      </Step>

      {/* Where files land */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Where the files land</h2>
        <p className="mt-3 text-muted-foreground">
          init picks a directory that will not collide with what you already have. If the project
          has no UI folder, it creates one; if it does, AazenC goes beside it rather than into it.
        </p>
        <div className="mt-6 divide-y divide-border border-y border-border">
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <p className="font-medium">No UI folder</p>
            <p className="text-sm text-muted-foreground">
              components/ui, or src/components/ui in a src project. The folder is created for you.
            </p>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <p className="font-medium">A UI folder exists</p>
            <p className="text-sm text-muted-foreground">
              Aazenc components go next to it, for example components/aazenc-ui, and init tells you
              where.
            </p>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <p className="font-medium">You want your own path</p>
            <p className="text-sm text-muted-foreground">
              Pass --ui on init to choose the directory yourself.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          init also writes the cn helper to lib/utils.ts, or src/lib/utils.ts in a src project, and
          records both paths in components.json.
        </p>
      </section>

      {/* Commands */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Commands</h2>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-medium">
              <code className="font-mono text-sm">list</code>
            </h3>
            <CodeBlock code={listCommand} language="bash" filename="terminal" />
          </div>
          <div>
            <h3 className="font-medium">
              <code className="font-mono text-sm">update</code>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Brings your copies forward. A file is only rewritten when it still matches the copy the
              CLI installed, so anything you edited by hand is left alone. --overwrite takes the
              newer version regardless.
            </p>
            <CodeBlock code={updateCommand} language="bash" filename="terminal" />
          </div>
        </div>

        <h3 className="mt-8 font-medium">Full reference</h3>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {commands.map((item) => (
            <div key={item.command} className="py-4">
              <p className="font-mono text-sm">{item.command}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-medium">Options</h3>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {commonFlags.map((item) => (
            <div
              key={item.flag}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <p className="font-mono text-sm sm:w-40 sm:shrink-0">{item.flag}</p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Theming */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Theming</h2>
        <p className="mt-3 text-muted-foreground">
          Colour is entirely tokens. The stylesheet defines the variables, a theme sets their values,
          and a provider owns which theme and mode are active.
        </p>

        <div className="mt-6 divide-y divide-border border-y border-border">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <p className="font-medium">{theme.label}</p>
              <p className="text-sm text-muted-foreground">{theme.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-muted-foreground">
          Wrap your app once and every component below it follows. Light and dark are a mode on the
          same provider, not a second theme.
        </p>
        <div className="mt-4">
          <CodeBlock code={themeProvider} language="tsx" filename="providers.tsx" showLines />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          There is also a ready-made{" "}
          <Link href="/components/theme-selector" className="text-foreground underline underline-offset-4">
            theme selector
          </Link>{" "}
          for appearance, surface, and palette, and{" "}
          <Link href="/themes" className="text-foreground underline underline-offset-4">
            a page per theme
          </Link>{" "}
          that shows every token the palette defines.
        </p>
      </section>

      {/* Conventions */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Conventions worth knowing</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {conventions.map((item) => (
            <li key={item.title} className="rounded-lg border border-border p-5">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Next */}
      <section className="mt-14 mb-8 rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-semibold tracking-tight">Next</h2>
        <p className="mt-2 text-muted-foreground">
          Pick a component and read its variants, or look at the palettes the whole library is
          built on.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/components">Browse components</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/themes">View the themes</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
