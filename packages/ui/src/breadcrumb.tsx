import { Slot } from "@radix-ui/react-slot";
import { type ComponentProps, type ReactNode } from "react";
import {
  breadcrumbClass,
  breadcrumbItemClass,
  breadcrumbLinkClass,
  breadcrumbListClass,
  breadcrumbPageClass,
  breadcrumbSeparatorClass,
} from "./breadcrumb-variants";

export interface BreadcrumbProps extends Omit<ComponentProps<"nav">, "className" | "children"> {
  children: ReactNode;
  /** Names the landmark. Two navs on one page need labels a screen reader can tell apart. */
  label?: string;
}

export interface BreadcrumbListProps extends Omit<ComponentProps<"ol">, "className" | "children"> {
  children: ReactNode;
}

export interface BreadcrumbItemProps extends Omit<ComponentProps<"li">, "className" | "children"> {
  children: ReactNode;
}

export type BreadcrumbLinkProps = Omit<ComponentProps<"a">, "className"> & {
  asChild?: boolean;
};

export type BreadcrumbPageProps = Omit<ComponentProps<"span">, "className" | "children"> & {
  children: ReactNode;
};

function Breadcrumb({ children, label = "Breadcrumb", ...props }: BreadcrumbProps) {
  return (
    <nav data-slot="breadcrumb" aria-label={label} className={breadcrumbClass} {...props}>
      {children}
    </nav>
  );
}

function BreadcrumbList({ children, ...props }: BreadcrumbListProps) {
  return (
    <ol data-slot="breadcrumb-list" className={breadcrumbListClass} {...props}>
      {children}
    </ol>
  );
}

/**
 * Each item carries its own leading chevron, hidden on the first by `first:`. That is
 * why a trail cannot come out with two separators in a row or a leading one.
 */
function BreadcrumbItem({ children, ...props }: BreadcrumbItemProps) {
  return (
    <li data-slot="breadcrumb-item" className={breadcrumbItemClass} {...props}>
      <svg
        data-slot="breadcrumb-separator"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={breadcrumbSeparatorClass}
      >
        <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function BreadcrumbLink({ asChild = false, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : "a";
  return <Comp data-slot="breadcrumb-link" className={breadcrumbLinkClass} {...props} />;
}

function BreadcrumbPage({ children, ...props }: BreadcrumbPageProps) {
  return (
    <span data-slot="breadcrumb-page" aria-current="page" className={breadcrumbPageClass} {...props}>
      {children}
    </span>
  );
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage };
