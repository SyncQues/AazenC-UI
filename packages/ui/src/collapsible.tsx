"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { type ComponentProps } from "react";
import {
  collapsibleChevronClass,
  collapsibleContentClass,
  collapsibleTriggerClass,
} from "./collapsible-variants";

export type CollapsibleProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Root>, "className">

export type CollapsibleTriggerProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Trigger>, "className">

export type CollapsibleContentProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Content>, "className">

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={collapsibleChevronClass}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Collapsible(props: CollapsibleProps) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ asChild = false, children, ...props }: CollapsibleTriggerProps) {
  if (asChild) {
    return (
      <CollapsiblePrimitive.Trigger asChild data-slot="collapsible-trigger" {...props}>
        {children}
      </CollapsiblePrimitive.Trigger>
    );
  }

  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" className={collapsibleTriggerClass} {...props}>
      {children}
      <ChevronIcon />
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsibleContent({ children, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Content data-slot="collapsible-content" className={collapsibleContentClass} {...props}>
      {children}
    </CollapsiblePrimitive.Content>
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
