import type { Metadata } from "next";
import { AccordionPreview } from "../../../../components/accordion-preview";
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
import { InputPreview } from "../../../../components/input-preview";
import { LabelPreview } from "../../../../components/label-preview";
import { SelectPreview } from "../../../../components/select-preview";
import { SkeletonPreview } from "../../../../components/skeleton-preview";
import { TabsPreview } from "../../../../components/tabs-preview";
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

  return (
    <PlaceholderPage
      title={slug}
      description="This component does not exist yet. Add it under packages/ui/src, then document it on this route."
    />
  );
}
