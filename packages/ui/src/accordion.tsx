"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
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
  className?: string;
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

export type AccordionItemProps = Omit<ComponentProps<typeof AccordionPrimitive.Item>, "className"> & {
  className?: string;
}

export type AccordionTriggerProps = Omit<ComponentProps<typeof AccordionPrimitive.Trigger>, "className"> & {
  className?: string;
}

export type AccordionContentProps = Omit<ComponentProps<typeof AccordionPrimitive.Content>, "className"> & {
  className?: string;
}

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

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn(accordionItemClass, className)} {...props} />;
}

function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={cn(accordionTriggerClass, className)} {...props}>
        {children}
        <ChevronIcon />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ children, className, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(accordionContentClass, className)}
      {...props}
    >
      <div className={accordionContentInnerClass}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
