import type { Metadata } from "next";
import { PlaceholderPage } from "../../../../components/placeholder-page";

export const metadata: Metadata = { title: "Category" };

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return (
    <PlaceholderPage
      title={category}
      description="Category pages fill in as components are grouped from component.md."
    />
  );
}
