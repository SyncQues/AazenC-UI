"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { createContext, useContext, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
import { tabsBadgeClass, tabsListVariants, tabsTriggerVariants, type TabsVariantProps } from "./tabs-variants";

type TabsVariant = NonNullable<TabsVariantProps["variant"]>;

const TabsVariantContext = createContext<TabsVariant>("default");

export interface TabsProps extends Omit<ComponentProps<typeof TabsPrimitive.Root>, "className"> {
  variant?: TabsVariant;
}

export interface TabsListProps extends Omit<ComponentProps<typeof TabsPrimitive.List>, "className"> {}

export type TabsIcon = ComponentType<{ className?: string }>;

export interface TabsTriggerProps
  extends Omit<ComponentProps<typeof TabsPrimitive.Trigger>, "className"> {
  icon?: TabsIcon;
  badge?: ReactNode;
}

export interface TabsContentProps
  extends Omit<ComponentProps<typeof TabsPrimitive.Content>, "className"> {}

export type TabsItem = {
  value: string;
  label: ReactNode;
  icon?: TabsIcon;
  badge?: ReactNode;
  disabled?: boolean;
};

export interface TabsItemsListProps extends TabsListProps {
  items: TabsItem[];
}

function Tabs({ variant = "default", ...props }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-variant={variant}
        className="flex w-full min-w-0 flex-col gap-4"
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

function TabsList({ ...props }: TabsListProps) {
  const variant = useContext(TabsVariantContext);
  return (
    <div
      data-slot="tabs-scroll"
      className="w-full min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }))}
        {...props}
      />
    </div>
  );
}

function TabsTrigger({ icon: Icon, badge, children, ...props }: TabsTriggerProps) {
  const variant = useContext(TabsVariantContext);
  const showBadge = badge != null && badge !== false && badge !== "";

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(tabsTriggerVariants({ variant }))}
      {...props}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
      {showBadge ? <span className={tabsBadgeClass}>{badge}</span> : null}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent(props: TabsContentProps) {
  return <TabsPrimitive.Content data-slot="tabs-content" className="outline-none" {...props} />;
}

function TabsItemsList({ items, ...listProps }: TabsItemsListProps) {
  return (
    <TabsList {...listProps}>
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          icon={item.icon}
          badge={item.badge}
          disabled={item.disabled}
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export { Tabs, TabsContent, TabsItemsList, TabsList, TabsTrigger, tabsListVariants, tabsTriggerVariants };
