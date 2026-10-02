import type { Metadata } from "next";
import { PlaceholderPage } from "../../../components/placeholder-page";

export const metadata: Metadata = { title: "Native" };

export default function NativePage() {
  return (
    <PlaceholderPage
      title="Native components"
      description="React Native components will be listed here. Source lives in packages/ui-native/src/components."
    />
  );
}
