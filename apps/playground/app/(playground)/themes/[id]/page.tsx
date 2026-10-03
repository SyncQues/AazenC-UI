import type { Metadata } from "next";
import { themes } from "@aazenc/themes";
import { PlaceholderPage } from "../../../../components/placeholder-page";
import { ThemePreview } from "../../../../components/theme-preview";

/** Pre-render one showcase per theme in the manifest. */
export function generateStaticParams() {
  return themes.map((item) => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = themes.find((item) => item.id === id);
  return {
    title: match ? `${match.label} theme` : id,
    description: match?.description,
  };
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = themes.find((item) => item.id === id);

  if (!match) {
    return (
      <PlaceholderPage
        title={id}
        description="No theme with that id. Add it to the themes array in packages/themes/src/manifest.ts and it will appear here."
      />
    );
  }

  return <ThemePreview themeId={match.id} />;
}
