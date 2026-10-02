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
  {
    href: "/components/dialog",
    name: "Dialog",
    description: "SyncQues dialog. One panel. Size, padding, and alert behavior.",
  },
  {
    href: "/components/drawer",
    name: "Drawer",
    description: "SyncQues drawer. One sheet, with a handle, scrolling body, and action row.",
  },
  {
    href: "/components/command",
    name: "Command",
    description: "SyncQues command. One list, inline or in a dialog.",
  },
  {
    href: "/components/skeleton",
    name: "Skeleton",
    description: "SyncQues skeleton. Line, circle, or block.",
  },
  {
    href: "/components/empty",
    name: "Empty",
    description: "SyncQues empty state. One dashed layout.",
  },
  {
    href: "/components/dropdown",
    name: "Dropdown",
    description: "SyncQues dropdown. One menu. Destructive is the only tone.",
  },
  {
    href: "/components/input",
    name: "Input",
    description: "SyncQues input. One field for every native type.",
  },
  {
    href: "/components/select",
    name: "Select",
    description: "SyncQues select. One pill, plus a searchable multi-select.",
  },
  {
    href: "/components/accordion",
    name: "Accordion",
    description: "SyncQues accordion. One bordered list.",
  },
  {
    href: "/components/checkbox",
    name: "Checkbox",
    description: "SyncQues checkbox. One box, with a dash for a partial selection.",
  },
  {
    href: "/components/collapsible",
    name: "Collapsible",
    description: "SyncQues collapsible. One disclosure.",
  },
  {
    href: "/components/label",
    name: "Label",
    description: "SyncQues label. One caption, with an optional required mark.",
  },
  {
    href: "/components/badge",
    name: "Badge",
    description: "SyncQues badge. Solid, soft, outline, or destructive.",
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
