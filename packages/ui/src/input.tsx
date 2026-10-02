import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
import { inputVariants } from "./input-variants";

export interface InputProps extends Omit<ComponentProps<"input">, "className" | "size"> {
  /** Marks the field invalid. Same border either way this is set. */
  invalid?: boolean;
  /** Leading icon. The field chrome stays the same. */
  icon?: ReactNode;
}

function Input({ type = "text", invalid = false, icon, "aria-invalid": ariaInvalid, ...props }: InputProps) {
  const field = (
    <input
      type={type}
      data-slot="input"
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(inputVariants({ icon: Boolean(icon) }))}
      {...props}
    />
  );

  if (!icon) return field;

  return (
    <div data-slot="input-root" className="relative w-full">
      <span
        data-slot="input-icon"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground [&_svg]:size-4"
      >
        {icon}
      </span>
      {field}
    </div>
  );
}

export { Input, inputVariants };
