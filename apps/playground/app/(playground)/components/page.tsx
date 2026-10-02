import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Components" };

const components = [
  {
    href: "/components/button",
    name: "Button",
    description:
      "SyncQues actions. Variant, size, shape, width, and align. No class name.",
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
    description:
      "SyncQues dialog. One panel. Size, padding, and alert behavior.",
  },
  {
    href: "/components/drawer",
    name: "Drawer",
    description:
      "SyncQues drawer. One sheet, with a handle, scrolling body, and action row.",
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
    href: "/components/spinner",
    name: "Spinner",
    description:
      "SyncQues loading spinner. One arc, four sizes, labelled or quiet.",
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
    description:
      "SyncQues checkbox. One box, with a dash for a partial selection.",
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
  {
    href: "/components/file-upload",
    name: "File upload",
    description: "SyncQues file upload. One drop zone.",
  },
  {
    href: "/components/toast",
    name: "Toast",
    description:
      "SyncQues toast. One card. Success, warning, and error change the icon.",
  },
  {
    href: "/components/switch",
    name: "Switch",
    description: "SyncQues switch. One track.",
  },
  {
    href: "/components/tooltip",
    name: "Tooltip",
    description: "SyncQues tooltip. One inverse bubble.",
  },
  {
    href: "/components/popover",
    name: "Popover",
    description: "SyncQues popover. One panel, same radius as the menus.",
  },
  {
    href: "/components/avatar",
    name: "Avatar",
    description: "SyncQues avatar. One circle. Small, default, or large.",
  },
  {
    href: "/components/carousel",
    name: "Carousel",
    description: "SyncQues carousel. One horizontal frame.",
  },
  {
    href: "/components/progress",
    name: "Progress",
    description: "SyncQues progress and slider. One track.",
  },
  {
    href: "/components/table",
    name: "Table",
    description: "SyncQues table. One bordered grid.",
  },
  {
    href: "/components/navbar",
    name: "Navbar",
    description: "SyncQues navbar. One sticky bar.",
  },
  {
    href: "/components/theme-selector",
    name: "Theme selector",
    description: "One menu for appearance, surface, and palette.",
  },
  {
    href: "/components/pdf-viewer",
    name: "PDF viewer",
    description: "One framed reader. Pages, zoom, and thumbnails.",
  },
  {
    href: "/components/calendar",
    name: "Calendar",
    description:
      "One month grid. Date, range, month, time, and date-time share one pill.",
  },
  {
    href: "/components/code-block",
    name: "Code block",
    description:
      "One frame for example source. Filename, copy, and optional line numbers.",
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
              <span className="text-sm text-muted-foreground">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
