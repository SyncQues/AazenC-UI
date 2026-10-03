"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarLinks } from "@aazenc/ui/navbar";
import { ThemeSelector } from "@aazenc/ui/theme-selector";
import { useTheme } from "@aazenc/themes";

const links = [
  { href: "/getting-started", label: "Getting started" },
  { href: "/components", label: "Components" },
  { href: "/themes", label: "Themes" },
  { href: "/categories/foundation", label: "Categories" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/sitemap", label: "Sitemap" },
];

export function PlaygroundNav() {
  const pathname = usePathname();
  const { theme, mode, setTheme, setMode, availableThemes } = useTheme();

  return (
    <Navbar variant="floating">
      <NavbarBrand asChild>
        <Link href="/">AazenC UI</Link>
      </NavbarBrand>
      <NavbarLinks>
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <NavbarLink key={link.href} asChild active={active}>
              <Link href={link.href}>{link.label}</Link>
            </NavbarLink>
          );
        })}
      </NavbarLinks>
      <NavbarActions>
        <ThemeSelector
          theme={theme}
          themes={availableThemes}
          mode={mode}
          onTheme={(id) => {
            const next = availableThemes.find((item) => item.id === id);
            if (next) setTheme(next.id);
          }}
          onMode={setMode}
        />
      </NavbarActions>
    </Navbar>
  );
}
