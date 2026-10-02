import type { Metadata } from "next";
import { PlaceholderPage } from "../../../../components/placeholder-page";

export const metadata: Metadata = { title: "Guide" };

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      title={slug}
      description="This guide does not exist yet."
    />
  );
}
