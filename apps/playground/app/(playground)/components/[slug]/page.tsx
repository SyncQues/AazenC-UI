import type { Metadata } from "next";
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
import { FileUploadPreview } from "../../../../components/file-upload-preview";
import { InputPreview } from "../../../../components/input-preview";
import { LabelPreview } from "../../../../components/label-preview";
import { NavbarPreview } from "../../../../components/navbar-preview";
import { PopoverPreview } from "../../../../components/popover-preview";
import { ProgressPreview } from "../../../../components/progress-preview";
import { SelectPreview } from "../../../../components/select-preview";
import { SkeletonPreview } from "../../../../components/skeleton-preview";
import { SwitchPreview } from "../../../../components/switch-preview";
import { TablePreview } from "../../../../components/table-preview";
import { ToastPreview } from "../../../../components/toast-preview";
import { TooltipPreview } from "../../../../components/tooltip-preview";
import { TabsPreview } from "../../../../components/tabs-preview";
import { ThemeSelectorPreview } from "../../../../components/theme-selector-preview";
import { PdfViewerPreview } from "../../../../components/pdf-viewer-preview";
import { CalendarPreview } from "../../../../components/calendar-preview";
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
    empty: "Empty",
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
  };
  return { title: titles[slug] ?? slug };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "button") return <ButtonPreview />;
  if (slug === "card") return <CardPreview />;
  if (slug === "tabs") return <TabsPreview />;
  if (slug === "dialog") return <DialogPreview />;
  if (slug === "drawer") return <DrawerPreview />;
  if (slug === "command") return <CommandPreview />;
  if (slug === "skeleton") return <SkeletonPreview />;
  if (slug === "empty") return <EmptyPreview />;
  if (slug === "dropdown") return <DropdownPreview />;
  if (slug === "input") return <InputPreview />;
  if (slug === "select") return <SelectPreview />;
  if (slug === "accordion") return <AccordionPreview />;
  if (slug === "checkbox") return <CheckboxPreview />;
  if (slug === "collapsible") return <CollapsiblePreview />;
  if (slug === "label") return <LabelPreview />;
  if (slug === "badge") return <BadgePreview />;
  if (slug === "file-upload") return <FileUploadPreview />;
  if (slug === "toast") return <ToastPreview />;
  if (slug === "switch") return <SwitchPreview />;
  if (slug === "tooltip") return <TooltipPreview />;
  if (slug === "popover") return <PopoverPreview />;
  if (slug === "avatar") return <AvatarPreview />;
  if (slug === "carousel") return <CarouselPreview />;
  if (slug === "progress") return <ProgressPreview />;
  if (slug === "table") return <TablePreview />;
  if (slug === "navbar") return <NavbarPreview />;
  if (slug === "theme-selector") return <ThemeSelectorPreview />;
  if (slug === "pdf-viewer") return <PdfViewerPreview />;
  if (slug === "calendar") return <CalendarPreview />;

  return (
    <PlaceholderPage
      title={slug}
      description="This component does not exist yet. Add it under packages/ui/src, then document it on this route."
    />
  );
}
