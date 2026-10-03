import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@aazenc/themes";
import { Toaster } from "@aazenc/ui/toast";
import { TooltipProvider } from "@aazenc/ui/tooltip";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";
import "./globals.css";

// Local files, not next/font/google. The preview deploy fetches Google Fonts
// during `vercel build`, and Turbopack fails that step when the stylesheet
// URL does not parse as a single font query.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const playfair = localFont({
  src: "./fonts/playfair-display-latin.woff2",
  weight: "100 900",
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
