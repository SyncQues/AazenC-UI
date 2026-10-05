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
    description: "SyncQues panels. Default or plain.",
  },
  {
    href: "/components/tabs",
    name: "Tabs",
    description: "SyncQues tabs. Underline, pill, or segmented.",
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
    href: "/components/typeset",
    name: "Typeset",
    description:
      "A prose container. One class styles the plain HTML inside it, and appending never restyles what is already there.",
  },
  {
    href: "/components/alert",
    name: "Alert",
    description:
      "SyncQues alert. One inline message, four tones, rounded by default. Actions at the end.",
  },
  {
    href: "/components/separator",
    name: "Separator",
    description:
      "SyncQues separator. One hairline, either way. Decorative until you say otherwise.",
  },
  {
    href: "/components/sheet",
    name: "Sheet",
    description:
      "SyncQues sheet. A panel from any edge, right by default. No handle, no drag.",
  },
  {
    href: "/components/resizable",
    name: "Resizable",
    description:
      "SyncQues resizable. A split you can drag, either way round. Hairline rule, ten pixel target.",
  },
  {
    href: "/components/dropdown",
    name: "Dropdown",
    description: "SyncQues dropdown. One menu. Destructive is the only tone.",
  },
  {
    href: "/components/context-menu",
    name: "Context Menu",
    description:
      "SyncQues context menu. The same panel as the dropdown, opened on right-click.",
  },
  {
    href: "/components/breadcrumb",
    name: "Breadcrumb",
    description:
      "SyncQues breadcrumb. A labelled nav around a list, with the separator built in.",
  },
  {
    href: "/components/input",
    name: "Input",
    description:
      "SyncQues input. One field for every native type, with a count against a limit.",
  },
  {
    href: "/components/textarea",
    name: "Textarea",
    description:
      "The input field with a shape. Rounded or pill, grows with the text or takes a count against a limit. No class name.",
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
    href: "/components/segmented-control",
    name: "Segmented control",
    description:
      "SyncQues segmented control. One exclusive answer, with the mark sliding behind it.",
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
    href: "/components/hover-card",
    name: "Hover card",
    description:
      "SyncQues hover card. A preview that opens on hover and focus, and stays open under the pointer.",
  },
  {
    href: "/components/toggle-group",
    name: "Toggle group",
    description:
      "SyncQues toggle group. Any number of on/off answers held at once, with arrow keys.",
  },
  {
    href: "/components/toggle",
    name: "Toggle",
    description:
      "SyncQues toggle. One button that stays down, pill shaped and springing as it turns on.",
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
  {
    href: "/components/markdown-viewer",
    name: "Markdown viewer",
    description:
      "Read-only markdown. Headings, lists, tables, and code, with no HTML injection.",
  },
  {
    href: "/components/charts",
    name: "Charts",
    description:
      "Area, bar, line, and pie on one dependency-free engine. Token colors, animated reveals, keyboard and screen-reader readable.",
  },
  {
    href: "/components/heat-map",
    name: "Heat Map",
    description:
      "A matrix on a ramp mixed in oklch, so lightness climbs the whole way. Bands, not a gradient — and a missing reading is a gap, never a zero.",
  },
  {
    href: "/components/metric-card",
    name: "Metric card",
    description:
      "A KPI tile. The trend is coloured by sentiment, not by sign, and never by colour alone.",
  },
  {
    href: "/components/layout",
    name: "Layout",
    description:
      "The boxes a page is made of. Stack, Grid, Flex, Center, Split, Container, Box, Spacer.",
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
