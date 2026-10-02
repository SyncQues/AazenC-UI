"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/getting-started", label: "Getting started" },
  { href: "/components", label: "Components" },
  { href: "/categories/foundation", label: "Categories" },
  { href: "/guides", label: "Guides" },
  { href: "/native", label: "Native" },
  { href: "/about", label: "About" },
  { href: "/sitemap", label: "Sitemap" },
];

export function PlaygroundNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          AazenC UI
        </Link>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {links.slice(1).map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "text-foreground" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
