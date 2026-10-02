"use client";

import { type VariantProps } from "class-variance-authority";
import { createContext, useContext, type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import {
  cardContentVariants,
  cardFooterVariants,
  cardHeaderVariants,
  cardPaddingClass,
  cardTitleVariants,
  cardVariants,
  type CardPadding,
} from "./card-variants";

const CardPaddingContext = createContext<CardPadding>("lg");

export interface CardProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardVariants> {
  padding?: CardPadding;
}

export interface CardHeaderProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardHeaderVariants> {}

export interface CardTitleProps
  extends Omit<ComponentProps<"h3">, "className">,
    VariantProps<typeof cardTitleVariants> {}

export interface CardDescriptionProps extends Omit<ComponentProps<"p">, "className"> {}

export interface CardContentProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardContentVariants> {}

export interface CardFooterProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardFooterVariants> {}

function Card({
  variant,
  padding = "lg",
  radius,
  align,
  interactive,
  children,
  ...props
}: CardProps) {
  return (
    <CardPaddingContext.Provider value={padding}>
      <div
        data-slot="card"
        data-padding={padding}
        className={cn(cardVariants({ variant, radius, align, interactive }))}
        {...props}
      >
        {children}
      </div>
    </CardPaddingContext.Provider>
  );
}

function CardHeader({ layout, children, ...props }: CardHeaderProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ layout }), cardPaddingClass[padding].header)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ size, children, ...props }: CardTitleProps) {
  return (
    <h3 data-slot="card-title" className={cn(cardTitleVariants({ size }))} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ children, ...props }: CardDescriptionProps) {
  return (
    <p data-slot="card-description" className="text-sm text-muted-foreground" {...props}>
      {children}
    </p>
  );
}

function CardContent({ gap, children, ...props }: CardContentProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ gap }), cardPaddingClass[padding].content)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ align, children, ...props }: CardFooterProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ align }), cardPaddingClass[padding].footer)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};

export type { CardPadding };
