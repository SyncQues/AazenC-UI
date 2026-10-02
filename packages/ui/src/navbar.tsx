"use client";

import { Slot } from "@radix-ui/react-slot";
import { type ComponentProps, createContext, type ReactNode, useContext, useLayoutEffect, useRef, useState } from "react";
import {
  navbarActionsVariants,
  navbarBrandVariants,
  navbarIndicatorClass,
  navbarLinksVariants,
  navbarLinkClass,
  navbarRowClass,
  navbarVariants,
  type NavbarVariant,
} from "./navbar-variants";

type IndicatorBox = { x: number; y: number; w: number; h: number };

function measureActiveLink(nav: HTMLElement): IndicatorBox | null {
  const active = nav.querySelector<HTMLElement>('[data-slot="navbar-link"][data-active="true"]');
  if (!active) return null;
  return {
    x: active.offsetLeft,
    y: active.offsetTop,
    w: active.offsetWidth,
    h: active.offsetHeight,
  };
}

const NavbarVariantContext = createContext<NavbarVariant>("bar");

export interface NavbarProps extends Omit<ComponentProps<"header">, "className" | "children"> {
  children: ReactNode;
  /** `bar` is the sticky docs header. `floating` is the SyncQues glass pill. */
  variant?: NavbarVariant;
}

function Navbar({ children, variant = "bar", ...props }: NavbarProps) {
  return (
    <header data-slot="navbar" data-variant={variant} className={navbarVariants({ variant })} {...props}>
      <NavbarVariantContext.Provider value={variant}>
        <div className={navbarRowClass}>{children}</div>
      </NavbarVariantContext.Provider>
    </header>
  );
}

export type NavbarBrandProps = Omit<ComponentProps<"a">, "className"> & {
  asChild?: boolean;
};

function NavbarBrand({ asChild = false, ...props }: NavbarBrandProps) {
  const variant = useContext(NavbarVariantContext);
  const Comp = asChild ? Slot : "a";
  return <Comp data-slot="navbar-brand" className={navbarBrandVariants({ variant })} {...props} />;
}

export interface NavbarLinksProps extends Omit<ComponentProps<"nav">, "className" | "children"> {
  children: ReactNode;
  label?: string;
}

function NavbarLinks({ children, label = "Main", ...props }: NavbarLinksProps) {
  const variant = useContext(NavbarVariantContext);
  const navRef = useRef<HTMLElement>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const sync = () => {
      const next = measureActiveLink(nav);
      setBox((current) => {
        if (!next) return null;
        if (current && current.x === next.x && current.y === next.y && current.w === next.w && current.h === next.h) {
          return current;
        }
        return next;
      });
    };

    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(nav, { attributes: true, attributeFilter: ["data-active"], subtree: true, childList: true });
    const sizes = new ResizeObserver(sync);
    sizes.observe(nav);
    for (const link of nav.querySelectorAll("[data-slot=navbar-link]")) sizes.observe(link);
    return () => {
      mutations.disconnect();
      sizes.disconnect();
    };
  }, []);

  return (
    <nav {...props} ref={navRef} data-slot="navbar-links" aria-label={label} className={navbarLinksVariants({ variant })}>
      {box ? (
        <span
          aria-hidden
          data-slot="navbar-indicator"
          className={navbarIndicatorClass}
          style={{ width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }}
        />
      ) : null}
      {children}
    </nav>
  );
}

export type NavbarLinkProps = Omit<ComponentProps<"a">, "className"> & {
  active?: boolean;
  asChild?: boolean;
};

function NavbarLink({ active = false, asChild = false, ...props }: NavbarLinkProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="navbar-link"
      data-active={active}
      aria-current={active ? "page" : undefined}
      className={navbarLinkClass}
      {...props}
    />
  );
}

export interface NavbarActionsProps extends Omit<ComponentProps<"div">, "className" | "children"> {
  children: ReactNode;
}

function NavbarActions({ children, ...props }: NavbarActionsProps) {
  const variant = useContext(NavbarVariantContext);
  return (
    <div {...props} data-slot="navbar-actions" className={navbarActionsVariants({ variant })}>
      {children}
    </div>
  );
}

export { Navbar, NavbarActions, NavbarBrand, NavbarLink, NavbarLinks };
