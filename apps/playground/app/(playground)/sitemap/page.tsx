import type { Metadata } from "next";
import Link from "next/link";
import { themes } from "@aazenc/themes";

export const metadata: Metadata = { title: "Sitemap" };

const routes = [
  "/",
  "/getting-started",
  "/components",
  "/themes",
  ...themes.map((item) => `/themes/${item.id}`),
  "/guides",
  "/about",
  "/sitemap",
];

export default function SitemapPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Sitemap</h1>
      <ul className="mt-6 space-y-2 text-sm">
        {routes.map((href) => (
          <li key={href}>
            <Link href={href} className="underline underline-offset-4">
              {href}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
