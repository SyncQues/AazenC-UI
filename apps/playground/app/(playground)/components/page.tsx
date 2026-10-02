import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Components" };

const components = [
  {
    href: "/components/button",
    name: "Button",
    description: "SyncQues actions. Variant, size, shape, width, and align. No class name.",
  },
  {
    href: "/components/card",
    name: "Card",
    description: "SyncQues panels. Default, glass, or plain.",
  },
  {
    href: "/components/tabs",
    name: "Tabs",
    description: "SyncQues tabs. Underline or pill.",
  },
];

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm text-muted-foreground">Catalog</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Components</h1>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {components.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex flex-col gap-1 py-4">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
