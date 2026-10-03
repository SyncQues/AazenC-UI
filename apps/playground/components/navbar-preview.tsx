"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarLinks } from "@aazenc/ui/navbar";
import { useTheme } from "@aazenc/themes";

const pages = ["Home", "Components", "Guides"] as const;

export function NavbarPreview() {
  const { mode, toggleMode } = useTheme();
  const [floatingPage, setFloatingPage] = useState<(typeof pages)[number]>("Components");
  const [barPage, setBarPage] = useState<(typeof pages)[number]>("Components");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Navbar</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The bar is the sticky header. Floating is the SyncQues pill: a clear header, the brand and the links each sit in a solid capsule, and the current page washes with the theme color.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="relative mt-10 h-28 overflow-hidden rounded-[1.125rem] border border-border [transform:translateZ(0)]">
        <Navbar variant="floating">
          <NavbarBrand href="#floating" onClick={(event) => event.preventDefault()}>
            AazenC
          </NavbarBrand>
          <NavbarLinks>
            {pages.map((page) => (
              <NavbarLink
                key={page}
                href={`#${page.toLowerCase()}`}
                active={floatingPage === page}
                onClick={(event) => {
                  event.preventDefault();
                  setFloatingPage(page);
                }}
              >
                {page}
              </NavbarLink>
            ))}
          </NavbarLinks>
          <NavbarActions>
            <Button type="button" size="sm">
              Sign in
            </Button>
          </NavbarActions>
        </Navbar>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Floating page: {floatingPage}</p>

      <div className="mt-6 overflow-hidden rounded-[1.125rem] border border-border">
        <Navbar>
          <NavbarBrand href="#brand" onClick={(event) => event.preventDefault()}>
            AazenC
          </NavbarBrand>
          <NavbarLinks>
            {pages.map((page) => (
              <NavbarLink
                key={page}
                href={`#${page.toLowerCase()}-bar`}
                active={barPage === page}
                onClick={(event) => {
                  event.preventDefault();
                  setBarPage(page);
                }}
              >
                {page}
              </NavbarLink>
            ))}
          </NavbarLinks>
          <NavbarActions>
            <Button type="button" size="sm">
              Sign in
            </Button>
          </NavbarActions>
        </Navbar>
        <p className="px-6 py-10 text-sm text-muted-foreground">Page content sits under the bar. Current page: {barPage}.</p>
      </div>
    </main>
  );
}
