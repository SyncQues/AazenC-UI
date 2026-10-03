"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { MarkdownViewer } from "@aazenc/ui/markdown-viewer";
import { useTheme } from "@aazenc/themes";

const response = `## What the change does

A **markdown viewer** turns stored source into readable content, so a model
response, a job description, or a pull request body can be shown as itself
instead of as a wall of punctuation.

- Headings become real headings, with ids you can link to
- Task lists keep their state, as a read-only checkbox
- Fenced code keeps its language, highlighting, and Copy
- Tables keep their column alignment

### What it does not do

Inline \`code\`, [links](/components/code-block), and ~~strikethrough~~ all read
the way the source wrote them. Raw HTML stays text:

<div onmouseover="alert(1)">not an element</div>

> Anything the source cannot express is left as the words the author wrote.
`;

const modelAnswer = `Here is the shortest path to a first render.

1. Install the package.
2. Add the CSS import after \`tailwindcss\`.
3. Render one \`MarkdownViewer\` with your source.

\`\`\`tsx
<MarkdownViewer source={answer} label="Model response" />
\`\`\`

| Prop | Type | Default |
| --- | --- | --- |
| source | string | required |
| density | compact, default, roomy | default |
| label | string | off |

Already done? Tick it off:

- [x] Source is parsed into a node tree
- [x] Links cannot run code
- [ ] Write the docs page
`;

const unsafeSource = `This sentence holds a [link that would execute](javascript:alert(1)) and an
<img src="x" onerror="alert(1)"> tag. The first renders as its words, and the
second renders as the text you can read here.
`;

export function MarkdownViewerPreview() {
  const { mode, toggleMode } = useTheme();
  const [density, setDensity] = useState<"compact" | "default" | "roomy">(
    "default",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Markdown viewer
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Read-only markdown. The source is parsed into a node tree and
            rendered as elements, so nothing in it can become a tag or a script.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Response</h2>
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Density"
          >
            {(["compact", "default", "roomy"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={density === option ? "default" : "ghost"}
                size="xs"
                aria-pressed={density === option}
                onClick={() => setDensity(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-border p-6">
          <MarkdownViewer
            source={response}
            density={density}
            label="Example response"
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Lists, code, and a table</h2>
        <div className="mt-3 rounded-lg border border-border p-6">
          <MarkdownViewer source={modelAnswer} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Untrusted source</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A viewer usually shows something it did not write. This is the same
          source with the parts that execute.
        </p>
        <div className="mt-3 rounded-lg border border-border p-6">
          <MarkdownViewer source={unsafeSource} label="Untrusted source" />
        </div>
      </section>
    </main>
  );
}
