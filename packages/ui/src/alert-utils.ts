import { Children, Fragment, isValidElement, type ComponentProps, type ReactNode } from "react";
import type { AlertTone } from "./alert-variants";

/** Stamped on AlertAction so Alert can hoist it without an import cycle. */
export const ALERT_PART = "aazencAlertPart";

type AlertRole = ComponentProps<"div">["role"];

// Only a tone that costs the user something should interrupt; `role` always wins.
export function resolveAlertRole(tone: AlertTone, role?: AlertRole): AlertRole {
  return role ?? (tone === "destructive" || tone === "warning" ? "alert" : "status");
}

/** Heading level to element. */
export const ALERT_HEADING_TAGS = { 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

export type AlertHeadingLevel = keyof typeof ALERT_HEADING_TAGS;

// Keeps every action, not just the last: a second one used to be overwritten and vanish.
// A fragment is looked into, so an action wrapped in `<>…</>` still hoists.
export function splitAlertChildren(children: ReactNode): { body: ReactNode[]; actions: ReactNode[] } {
  const body: ReactNode[] = [];
  const actions: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isAlertAction(child)) {
      actions.push(child);
      return;
    }
    if (isValidElement(child) && child.type === Fragment) {
      const nested = splitAlertChildren((child.props as { children?: ReactNode }).children);
      body.push(...nested.body);
      actions.push(...nested.actions);
      return;
    }
    // `0` is content. Only the values React actually renders as nothing go.
    if (rendersNothing(child)) return;
    body.push(child);
  });

  return { body, actions };
}

function isAlertAction(child: ReactNode): boolean {
  if (!isValidElement(child)) return false;
  if (partOf(child.type) === "action") return true;
  // Also honour a hand-rolled <div data-slot="alert-action">.
  return (child.props as { "data-slot"?: string })["data-slot"] === "alert-action";
}

// `child.type` is a JSX constructor, which TS will not index.
function partOf(type: unknown): string | undefined {
  if (typeof type !== "function") return undefined;
  const flag = (type as unknown as Record<string, unknown>)[ALERT_PART];
  return typeof flag === "string" ? flag : undefined;
}

function rendersNothing(child: ReactNode): boolean {
  return child === null || child === undefined || typeof child === "boolean" || child === "";
}