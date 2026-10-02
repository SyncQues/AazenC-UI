"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { type ComponentProps, type ReactNode } from "react";
import {
  accordionChevronClass,
  accordionContentClass,
  accordionContentInnerClass,
  accordionItemClass,
  accordionTriggerClass,
} from "./accordion-variants";

type AccordionShared = {
  children?: ReactNode;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  dir?: "ltr" | "rtl";
};

export type AccordionProps = AccordionShared &
  (
    | {
        type: "single";
        collapsible?: boolean;
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
      }
    | {
        type: "multiple";
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
      }
  );

export type AccordionItemProps = Omit<ComponentProps<typeof AccordionPrimitive.Item>, "className">

export type AccordionTriggerProps = Omit<ComponentProps<typeof AccordionPrimitive.Trigger>, "className">

export type AccordionContentProps = Omit<ComponentProps<typeof AccordionPrimitive.Content>, "className">

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={accordionChevronClass}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Accordion(props: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      {...(props as Parameters<typeof AccordionPrimitive.Root>[0])}
    />
  );
}

function AccordionItem(props: AccordionItemProps) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={accordionItemClass} {...props} />;
}

function AccordionTrigger({ children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={accordionTriggerClass} {...props}>
        {children}
        <ChevronIcon />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className={accordionContentClass} {...props}>
      <div className={accordionContentInnerClass}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
