import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = { title: "Guides" };

export default function GuidesPage() {
  return (
    <PlaceholderPage
      title="Guides"
      description="Guide pages are added alongside the components they explain."
    />
  );
}
