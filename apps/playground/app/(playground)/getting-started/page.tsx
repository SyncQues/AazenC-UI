import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = { title: "Getting started" };

export default function GettingStartedPage() {
  return (
    <PlaceholderPage
      title="Getting started"
      description="Install and usage docs land here after the CLI and the first components exist."
    />
  );
}
