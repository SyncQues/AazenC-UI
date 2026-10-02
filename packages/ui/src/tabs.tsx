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
  tabsColorVariants,
  tabsListVariants,
  tabsPillIndicatorClass,
  tabsSolidMarkColorClass,
  tabsTriggerVariants,
  tabsUnderlineIndicatorClass,
  tabsWashMarkColorClass,
  type TabsColor,
  type TabsVariantProps,
} from "./tabs-variants";

type TabsVariant = NonNullable<TabsVariantProps["variant"]>;

const TabsVariantContext = createContext<TabsVariant>("default");

/** The underline sits under the bar, so it only moves on x. Every pill mark moves on both axes. */
const TAB_MARK_CLASS: Record<TabsVariant, string> = {
  default: tabsUnderlineIndicatorClass,
  pill: tabsPillIndicatorClass,
  segmented: tabsPillIndicatorClass,
};

/** The chip row washes the mark, the underline and the segmented bar fill it. */
const TAB_MARK_COLOR_CLASS: Record<TabsVariant, Record<TabsColor, string>> = {
  default: tabsSolidMarkColorClass,
  pill: tabsWashMarkColorClass,
  segmented: tabsSolidMarkColorClass,
};

/** A trigger can carry any attribute, so the mark only trusts a name the color file has. */
const TAB_COLORS = new Set(Object.keys(tabsSolidMarkColorClass));

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
  color?: TabsColor;
}

export type TabsContentProps = Omit<ComponentProps<typeof TabsPrimitive.Content>, "className">

export type TabsItem = {
  value: string;
  label: ReactNode;
  icon?: TabsIcon;
  badge?: ReactNode;
  color?: TabsColor;
  disabled?: boolean;
};

export interface TabsItemsListProps extends TabsListProps {
  items: TabsItem[];
}

type IndicatorState = { box: IndicatorBox; color: TabsColor | null };

function readColor(trigger: HTMLElement): TabsColor | null {
  const value = trigger.dataset.color;
  return value && TAB_COLORS.has(value) ? (value as TabsColor) : null;
}

function measureIndicator(list: HTMLDivElement): IndicatorState | null {
  const active = list.querySelector<HTMLElement>("[data-slot=tabs-trigger][data-state=active]");
  if (!active) return null;
  const listRect = list.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  return {
    box: {
      x: Math.round(rect.left - listRect.left),
      y: Math.round(rect.top - listRect.top),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    },
    color: readColor(active),
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
  const [state, setState] = useState<IndicatorState | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const sync = () => {
      const next = measureIndicator(list);
      setState((current) => {
        if (!next) return null;
        if (
          current &&
          current.color === next.color &&
          current.box.x === next.box.x &&
          current.box.y === next.box.y &&
          current.box.w === next.box.w &&
          current.box.h === next.box.h
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

  const box = state?.box;
  const markColor = state?.color;
  const indicatorStyle = box
    ? variant === "default"
      ? { width: box.w, transform: `translateX(${box.x}px)` }
      : { width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }
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
            className={cn(
              TAB_MARK_CLASS[variant],
              markColor ? TAB_MARK_COLOR_CLASS[variant][markColor] : undefined,
            )}
            style={indicatorStyle}
          />
        ) : null}
        {children}
      </TabsPrimitive.List>
    </div>
  );
}

function TabsTrigger({ icon: Icon, badge, color, children, ...props }: TabsTriggerProps) {
  const variant = useContext(TabsVariantContext);
  const showBadge = badge != null && badge !== false && badge !== "";

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      data-color={color}
      className={cn(tabsTriggerVariants({ variant }), tabsColorVariants({ color }))}
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
          color={item.color}
          disabled={item.disabled}
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export {
  Tabs,
  TabsContent,
  TabsItemsList,
  TabsList,
  TabsTrigger,
  tabsColorVariants,
  tabsListVariants,
  tabsTriggerVariants,
  type TabsColor,
};
