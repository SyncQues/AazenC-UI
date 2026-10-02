import { CodeBlock } from "@aazenc/ui/code-block";
import { componentExamples } from "../lib/examples/components";

export function ExampleCode({ slug }: { slug: string }) {
  const example = componentExamples[slug];
  if (!example) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <h2 className="text-lg font-semibold">Example</h2>
      <div className="mt-4">
        <CodeBlock
          filename={example.filename}
          language="tsx"
          code={example.code}
          showLines
        />
      </div>
    </section>
  );
}
