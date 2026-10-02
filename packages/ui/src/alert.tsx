import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@aazenc/utils";
import {
  alertActionClass,
  alertDescriptionClass,
  alertIconClass,
  alertTitleClass,
  alertVariants,
  type AlertShape,
  type AlertTone,
} from "./alert-variants";

export interface AlertProps extends Omit<ComponentProps<"div">, "className">, VariantProps<typeof alertVariants> {
  /**
   * The mark in front of the message. Defaults to the tone's glyph, so an alert
   * never ships without one. Pass a node to use your own, or `false` for a plain
   * row — an alert with no icon and no tone is a border, and a border should be
   * a Divider.
   */
  icon?: ReactNode | false;
}

/** A real heading, one level under Card, so an alert is reachable while scanning. */
export type AlertTitleProps = Omit<ComponentProps<"h4">, "className">;

/** A div, not a p: descriptions carry links and lists. */
export type AlertDescriptionProps = Omit<ComponentProps<"div">, "className">;

export type AlertActionProps = Omit<ComponentProps<"div">, "className">;

const toneIcons: Record<AlertTone, ReactNode> = {
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" strokeLinecap="round" />
      <path d="M12 8h.01" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.2 11 14.7 15.8 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
      <path d="M12 9.5v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  destructive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" strokeLinecap="round" />
    </svg>
  ),
};

function Alert({ tone, shape, icon, role, children, ...props }: AlertProps) {
  const resolvedTone: AlertTone = tone ?? "default";
  const resolvedShape: AlertShape = shape ?? "rounded";
  const mark = icon === false ? null : (icon ?? toneIcons[resolvedTone]);
  // Success waits its turn; a broken save interrupts. Same box, different urgency.
  const resolvedRole = role ?? (resolvedTone === "success" ? "status" : "alert");

  // The action sits at the end of the row even when it is written before the text.
  const body: ReactNode[] = [];
  let action: ReactNode = null;
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === AlertAction) {
      action = child;
      return;
    }
    body.push(child);
  });

  return (
    <div
      data-slot="alert"
      data-tone={resolvedTone}
      data-shape={resolvedShape}
      role={resolvedRole}
      className={cn(alertVariants({ tone: resolvedTone, shape: resolvedShape }))}
      {...props}
    >
      {mark ? (
        <span data-slot="alert-icon" data-tone={resolvedTone} className={alertIconClass}>
          {mark}
        </span>
      ) : null}
      {body.length > 0 ? (
        <div data-slot="alert-body" className="min-w-0 flex-1">
          {body}
        </div>
      ) : null}
      {action}
    </div>
  );
}

function AlertTitle({ children, ...props }: AlertTitleProps) {
  return (
    <h4 data-slot="alert-title" className={alertTitleClass} {...props}>
      {children}
    </h4>
  );
}

function AlertDescription({ children, ...props }: AlertDescriptionProps) {
  return (
    <div data-slot="alert-description" className={alertDescriptionClass} {...props}>
      {children}
    </div>
  );
}

function AlertAction({ children, ...props }: AlertActionProps) {
  return (
    <div data-slot="alert-action" className={alertActionClass} {...props}>
      {children}
    </div>
  );
}

export type { AlertShape, AlertTone };
export {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  alertVariants,
};
