import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@aazenc/themes";
import { Toaster } from "@aazenc/ui/toast";
import { TooltipProvider } from "@aazenc/ui/tooltip";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} light`}
      data-theme="slate"
      data-material="solid"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          defaultTheme="slate"
          defaultMode="light"
          defaultMaterial="solid"
          storageKey="aazenc-ui-theme-v2"
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
