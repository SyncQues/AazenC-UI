import type { Metadata } from "next";
import type { ComponentType } from "react";
import { AccordionPreview } from "../../../../components/accordion-preview";
import { AvatarPreview } from "../../../../components/avatar-preview";
import { CarouselPreview } from "../../../../components/carousel-preview";
import { BadgePreview } from "../../../../components/badge-preview";
import { ButtonPreview } from "../../../../components/button-preview";
import { CardPreview } from "../../../../components/card-preview";
import { CheckboxPreview } from "../../../../components/checkbox-preview";
import { CollapsiblePreview } from "../../../../components/collapsible-preview";
import { CommandPreview } from "../../../../components/command-preview";
import { DialogPreview } from "../../../../components/dialog-preview";
import { DrawerPreview } from "../../../../components/drawer-preview";
import { DropdownPreview } from "../../../../components/dropdown-preview";
import { EmptyPreview } from "../../../../components/empty-preview";
import { AlertPreview } from "../../../../components/alert-preview";
import { SeparatorPreview } from "../../../../components/separator-preview";
import { SheetPreview } from "../../../../components/sheet-preview";
import { ResizablePreview } from "../../../../components/resizable-preview";
import { FileUploadPreview } from "../../../../components/file-upload-preview";
import { InputPreview } from "../../../../components/input-preview";
import { LabelPreview } from "../../../../components/label-preview";
import { NavbarPreview } from "../../../../components/navbar-preview";
import { PopoverPreview } from "../../../../components/popover-preview";
import { ProgressPreview } from "../../../../components/progress-preview";
import { SelectPreview } from "../../../../components/select-preview";
import { SkeletonPreview } from "../../../../components/skeleton-preview";
import { SpinnerPreview } from "../../../../components/spinner-preview";
import { SwitchPreview } from "../../../../components/switch-preview";
import { TablePreview } from "../../../../components/table-preview";
import { ToastPreview } from "../../../../components/toast-preview";
import { TooltipPreview } from "../../../../components/tooltip-preview";
import { TabsPreview } from "../../../../components/tabs-preview";
import { ThemeSelectorPreview } from "../../../../components/theme-selector-preview";
import { PdfViewerPreview } from "../../../../components/pdf-viewer-preview";
import { CalendarPreview } from "../../../../components/calendar-preview";
import { CodeBlockPreview } from "../../../../components/code-block-preview";
import { ExampleCode } from "../../../../components/example-code";
import { PlaceholderPage } from "../../../../components/placeholder-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = {
    button: "Button",
    card: "Card",
    tabs: "Tabs",
    dialog: "Dialog",
    drawer: "Drawer",
    command: "Command",
    skeleton: "Skeleton",
    spinner: "Spinner",
    empty: "Empty",
    alert: "Alert",
    separator: "Separator",
    sheet: "Sheet",
    resizable: "Resizable",
    dropdown: "Dropdown",
    input: "Input",
    select: "Select",
    accordion: "Accordion",
    checkbox: "Checkbox",
    collapsible: "Collapsible",
    label: "Label",
    badge: "Badge",
    "file-upload": "File upload",
    toast: "Toast",
    switch: "Switch",
    tooltip: "Tooltip",
    popover: "Popover",
    avatar: "Avatar",
    carousel: "Carousel",
    progress: "Progress",
    table: "Table",
    navbar: "Navbar",
    "theme-selector": "Theme selector",
    "pdf-viewer": "PDF viewer",
    calendar: "Calendar",
    "code-block": "Code block",
  };
  return { title: titles[slug] ?? slug };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const previews: Record<string, ComponentType> = {
    button: ButtonPreview,
    card: CardPreview,
    tabs: TabsPreview,
    dialog: DialogPreview,
    drawer: DrawerPreview,
    command: CommandPreview,
    skeleton: SkeletonPreview,
    spinner: SpinnerPreview,
    empty: EmptyPreview,
    alert: AlertPreview,
    separator: SeparatorPreview,
    sheet: SheetPreview,
    resizable: ResizablePreview,
    dropdown: DropdownPreview,
    input: InputPreview,
    select: SelectPreview,
    accordion: AccordionPreview,
    checkbox: CheckboxPreview,
    collapsible: CollapsiblePreview,
    label: LabelPreview,
    badge: BadgePreview,
    "file-upload": FileUploadPreview,
    toast: ToastPreview,
    switch: SwitchPreview,
    tooltip: TooltipPreview,
    popover: PopoverPreview,
    avatar: AvatarPreview,
    carousel: CarouselPreview,
    progress: ProgressPreview,
    table: TablePreview,
    navbar: NavbarPreview,
    "theme-selector": ThemeSelectorPreview,
    "pdf-viewer": PdfViewerPreview,
    calendar: CalendarPreview,
    "code-block": CodeBlockPreview,
  };
  const Preview = previews[slug];

  if (!Preview) {
    return (
      <PlaceholderPage
        title={slug}
        description="This component does not exist yet. Add it under packages/ui/src, then document it on this route."
      />
    );
  }

  return (
    <>
      <Preview />
      <ExampleCode slug={slug} />
    </>
  );
}
