import { type ComponentProps, type ReactNode } from "react";
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
import { ALERT_HEADING_TAGS, ALERT_PART, resolveAlertRole, splitAlertChildren, type AlertHeadingLevel } from "./alert-utils";
import { ToneIcon } from "./tone-icon";

export interface AlertProps extends ComponentProps<"div">, VariantProps<typeof alertVariants> {
  /** Defaults to the tone's glyph; `false` for a plain row. */
  icon?: ReactNode | false;
}

export interface AlertTitleProps extends Omit<ComponentProps<"h4">, "className"> {
  /** Defaults to `h4`; lift it when the alert is not under a Card. */
  headingLevel?: AlertHeadingLevel;
  className?: string;
}

/** A div, not a p: descriptions carry links and lists. */
export type AlertDescriptionProps = ComponentProps<"div">;

export type AlertActionProps = ComponentProps<"div">;

function Alert({ tone, shape, icon, role, className, children, ...props }: AlertProps) {
  const resolvedTone: AlertTone = tone ?? "default";
  const resolvedShape: AlertShape = shape ?? "rounded";
  const mark = icon === false ? null : (icon ?? <ToneIcon tone={resolvedTone} />);
  const resolvedRole = resolveAlertRole(resolvedTone, role);
  const { body, actions } = splitAlertChildren(children);

  return (
    <div
      data-slot="alert"
      data-tone={resolvedTone}
      data-shape={resolvedShape}
      role={resolvedRole}
      className={cn(alertVariants({ tone: resolvedTone, shape: resolvedShape }), className)}
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
      {actions}
    </div>
  );
}

function AlertTitle({ headingLevel = 4, className, children, ...props }: AlertTitleProps) {
  const Heading = ALERT_HEADING_TAGS[headingLevel];
  return (
    <Heading data-slot="alert-title" className={cn(alertTitleClass, className)} {...props}>
      {children}
    </Heading>
  );
}

function AlertDescription({ className, children, ...props }: AlertDescriptionProps) {
  return (
    <div data-slot="alert-description" className={cn(alertDescriptionClass, className)} {...props}>
      {children}
    </div>
  );
}

function AlertAction({ className, children, ...props }: AlertActionProps) {
  return (
    <div data-slot="alert-action" className={cn(alertActionClass, className)} {...props}>
      {children}
    </div>
  );
}

/** Read by `splitAlertChildren` so an action can be hoisted without a cycle. */
Object.assign(AlertAction, { [ALERT_PART]: "action" });

export type { AlertShape, AlertTone };
export {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  alertVariants,
};