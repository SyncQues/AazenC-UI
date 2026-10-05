"use client";

import { useState } from "react";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import {
  Typeset,
  TypesetFit,
  typesetEmbedClass,
  typesetNotClass,
  typesetScrollClass,
} from "@aazenc/ui/typeset";
import { useTheme } from "@aazenc/themes";

export function TypesetPreview() {
  const { mode, toggleMode } = useTheme();
  const [preset, setPreset] = useState<"default" | "compact" | "chat" | "docs" | "reading" | "large">(
    "docs",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Typeset</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One class on a container, and the plain HTML inside it gets a real type
            system. Every block below is raw markup — no markdown, no components.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {(["default", "compact", "chat", "docs", "reading", "large"] as const).map(
          (value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={preset === value ? "default" : "outline"}
              onClick={() => setPreset(value)}
            >
              {value}
            </Button>
          ),
        )}
      </div>

      <section className="mt-8 rounded-lg border p-6">
        <Typeset preset={preset} measure="wide">
          <h2>Shipping a release note</h2>
          <p>
            A typeset styles whatever HTML you hand it, so a CMS field, a
            <code> dangerouslySetInnerHTML </code> block, and a parsed markdown
            document all end up with the same rhythm.
          </p>
          <h3>What changed</h3>
          <ul>
            <li>
              Tables keep <code>tabular-nums</code>, so digits line up between rows.
            </li>
            <li>
              Anchors clear the sticky navbar via <code>--navbar-height</code>.
            </li>
            <li>
              Blocks are spaced with a top margin only, so appending never
              restyles what is already on screen.
            </li>
          </ul>
          <blockquote>
            <p>
              The point is not that text is styled. It is that a long document
              stays readable without a single inline size.
            </p>
          </blockquote>
          <pre>
            <code>{`npm install @aazenc/ui`}</code>
          </pre>
          <p>
            Inline <mark>highlighting</mark>, an{" "}
            <abbr title="Abbreviation">abbr</abbr>, a <kbd>kbd</kbd>, and a nested{" "}
            <sub>sub</sub> with <sup>sup</sup>.
          </p>
        </Typeset>
      </section>

      <h2 className="mt-12 text-lg font-semibold tracking-tight">
        Embedded components keep their own look
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        <code>Button</code> and <code>Badge</code> are marked{" "}
        <code>data-slot</code>, so they are skipped automatically. No{" "}
        <code>not-typeset</code> class needed on each one.
      </p>
      <section className="mt-4 rounded-lg border p-6">
        <Typeset preset="docs">
          <p>
            <Button type="button" size="sm">
              Publish now
            </Button>{" "}
            <Badge>Draft</Badge>{" "}
            <Badge variant="soft">Autosaved 2m ago</Badge>{" "}
            <span className={typesetEmbedClass}>
              <Badge variant="outline">Opt-out</Badge>
            </span>
          </p>
        </Typeset>
      </section>

      <h2 className="mt-12 text-lg font-semibold tracking-tight">
        Opting a subtree out
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        When a whole region should be untouched, wrap it in{" "}
        <code>{typesetNotClass}</code>. Unlike the shallow{" "}
        <code>data-slot</code> skip, this takes the entire subtree.
      </p>
      <section className="mt-4 rounded-lg border p-6">
        <Typeset preset="docs">
          <p>This paragraph is typeset.</p>
          <div className={typesetNotClass}>
            <h3>This heading is left alone</h3>
            <p>And so is everything under it, exactly as written.</p>
          </div>
        </Typeset>
      </section>

      <h2 className="mt-12 text-lg font-semibold tracking-tight">
        Sizing follows the container
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        <code>TypesetFit</code> makes a narrow column bump its own type size, so a
        chat bubble and a docs page size independently of the window.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Wide — 2xl
          </p>
          <TypesetFit>
            <Typeset preset="chat" measure="narrow">
              <p>
                Same component, same preset. Nothing here knows the viewport
                width.
              </p>
            </Typeset>
          </TypesetFit>
        </div>
        <div className="w-56 rounded-lg border p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Narrow — bumped
          </p>
          <TypesetFit>
            <Typeset preset="chat">
              <p>
                Same component, same preset. Nothing here knows the viewport
                width.
              </p>
            </Typeset>
          </TypesetFit>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold tracking-tight">
        A wide table scrolls instead of squeezing
      </h2>
      <section className="mt-4 rounded-lg border p-6">
        <Typeset preset="compact">
          <p>
            Wrap the table in <code>{typesetScrollClass}</code> and it keeps its
            own width.
          </p>
          <div className={typesetScrollClass}>
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Requests</th>
                  <th>Error rate</th>
                  <th>p99 latency</th>
                  <th>Cache hit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ap-south-1</td>
                  <td>1,284,993</td>
                  <td>0.021%</td>
                  <td>184ms</td>
                  <td>97.4%</td>
                </tr>
                <tr>
                  <td>eu-west-2</td>
                  <td>842,110</td>
                  <td>0.004%</td>
                  <td>96ms</td>
                  <td>99.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Typeset>
      </section>
    </main>
  );
}
