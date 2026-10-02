import type { Metadata } from "next";
import { PlaceholderPage } from "../../../../components/placeholder-page";

export const metadata: Metadata = { title: "Native component" };

export default async function NativeComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderPage
      title={slug}
      description="This native component does not exist yet."
    />
  );
}
