"use client";

import { Button } from "@aazenc/ui/button";
import { CodeBlock } from "@aazenc/ui/code-block";
import { useTheme } from "@aazenc/themes";

const componentSource = `import { Button } from "@aazenc/ui/button"

export function Example() {
  return (
    <Button type="button" variant="outline">
      Continue
    </Button>
  )
}`;

const shellSource = `pnpm --filter playground dev
# playground at http://localhost:3000`;

const jsonSource = `{
  "name": "code-block",
  "files": ["code-block.tsx"]
}`;

export function CodeBlockPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Code block
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One frame for example source. The header names the file, Copy writes
            the source, and line numbers stay in the gutter.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <section className="mt-10 grid gap-3">
        <h2 className="text-lg font-semibold">Source</h2>
        <CodeBlock code={componentSource} />
      </section>

      <section className="mt-10 grid gap-3">
        <h2 className="text-lg font-semibold">Filename and lines</h2>
        <CodeBlock
          filename="button.tsx"
          language="tsx"
          code={componentSource}
          showLines
        />
      </section>

      <section className="mt-10 grid gap-3">
        <h2 className="text-lg font-semibold">Shell and JSON</h2>
        <CodeBlock filename="install.sh" language="bash" code={shellSource} />
        <CodeBlock filename="registry.json" language="json" code={jsonSource} />
      </section>
    </main>
  );
}
