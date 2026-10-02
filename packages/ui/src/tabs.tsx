"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import { cn } from "@aazenc/utils";
import {
  tabsBadgeClass,
  tabsListVariants,
  tabsPillIndicatorClass,
  tabsTriggerVariants,
  tabsUnderlineIndicatorClass,
  type TabsVariantProps,
} from "./tabs-variants";

type TabsVariant = NonNullable<TabsVariantProps["variant"]>;

const TabsVariantContext = createContext<TabsVariant>("default");

type IndicatorBox = { x: number; y: number; w: number; h: number };

export interface TabsProps extends Omit<ComponentProps<typeof TabsPrimitive.Root>, "className"> {
  variant?: TabsVariant;
}

export type TabsListProps = Omit<ComponentProps<typeof TabsPrimitive.List>, "className">

export type TabsIcon = ComponentType<{ className?: string }>;

export interface TabsTriggerProps
  extends Omit<ComponentProps<typeof TabsPrimitive.Trigger>, "className"> {
  icon?: TabsIcon;
  badge?: ReactNode;
}

export type TabsContentProps = Omit<ComponentProps<typeof TabsPrimitive.Content>, "className">

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

function measureIndicator(list: HTMLDivElement): IndicatorBox | null {
  const active = list.querySelector<HTMLElement>("[data-slot=tabs-trigger][data-state=active]");
  if (!active) return null;
  const listRect = list.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  return {
    x: Math.round(rect.left - listRect.left),
    y: Math.round(rect.top - listRect.top),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
  };
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

function TabsList({ children, ...props }: TabsListProps) {
  const variant = useContext(TabsVariantContext);
  const listRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const sync = () => {
      const next = measureIndicator(list);
      setBox((current) => {
        if (!next) return null;
        if (
          current &&
          current.x === next.x &&
          current.y === next.y &&
          current.w === next.w &&
          current.h === next.h
        ) {
          return current;
        }
        return next;
      });
    };

    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(list, {
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      subtree: true,
    });
    const sizes = new ResizeObserver(sync);
    sizes.observe(list);
    return () => {
      mutations.disconnect();
      sizes.disconnect();
    };
  }, []);

  const indicatorStyle = box
    ? variant === "pill"
      ? { width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }
      : { width: box.w, transform: `translateX(${box.x}px)` }
    : undefined;

  return (
    <div
      data-slot="tabs-scroll"
      className="w-full min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <TabsPrimitive.List
        ref={listRef}
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }))}
        {...props}
      >
        {box ? (
          <span
            aria-hidden
            data-slot="tabs-indicator"
            className={variant === "pill" ? tabsPillIndicatorClass : tabsUnderlineIndicatorClass}
            style={indicatorStyle}
          />
        ) : null}
        {children}
      </TabsPrimitive.List>
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
      <span className="relative z-20 inline-flex items-center gap-1.5">
        {Icon ? <Icon className="size-3.5" /> : null}
        {children}
        {showBadge ? <span className={tabsBadgeClass}>{badge}</span> : null}
      </span>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent(props: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className="animate-tab-content outline-none"
      {...props}
    />
  );
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
