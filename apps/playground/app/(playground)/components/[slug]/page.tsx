import type { Metadata } from "next";
import { ButtonPreview } from "../../../../components/button-preview";
import { CardPreview } from "../../../../components/card-preview";
import { TabsPreview } from "../../../../components/tabs-preview";
import { PlaceholderPage } from "../../../../components/placeholder-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = { button: "Button", card: "Card", tabs: "Tabs" };
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

  return (
    <PlaceholderPage
      title={slug}
      description="This component does not exist yet. Add it under packages/ui/src, then document it on this route."
    />
  );
}
