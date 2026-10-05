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
  className?: string;
}

export interface CardHeaderProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardHeaderVariants> {
  className?: string;
}

export interface CardTitleProps
  extends Omit<ComponentProps<"h3">, "className">,
    VariantProps<typeof cardTitleVariants> {
  className?: string;
}

export type CardDescriptionProps = Omit<ComponentProps<"p">, "className"> & {
  className?: string;
}

export interface CardContentProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardContentVariants> {
  className?: string;
}

export interface CardFooterProps
  extends Omit<ComponentProps<"div">, "className">,
    VariantProps<typeof cardFooterVariants> {
  className?: string;
}

function Card({
  variant,
  padding = "lg",
  radius,
  align,
  interactive,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <CardPaddingContext.Provider value={padding}>
      <div
        data-slot="card"
        data-padding={padding}
        className={cn(cardVariants({ variant, radius, align, interactive }), className)}
        {...props}
      >
        {children}
      </div>
    </CardPaddingContext.Provider>
  );
}

function CardHeader({ layout, children, className, ...props }: CardHeaderProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ layout }), cardPaddingClass[padding].header, className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ size, children, className, ...props }: CardTitleProps) {
  return (
    <h3 data-slot="card-title" className={cn(cardTitleVariants({ size }), className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

function CardContent({ gap, children, className, ...props }: CardContentProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ gap }), cardPaddingClass[padding].content, className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ align, children, className, ...props }: CardFooterProps) {
  const padding = useContext(CardPaddingContext);
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ align }), cardPaddingClass[padding].footer, className)}
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
