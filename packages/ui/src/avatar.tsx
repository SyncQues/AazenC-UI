"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ComponentProps } from "react";
import { cn } from "@aazenc/utils";
import { avatarFallbackClass, avatarImageClass, avatarVariants, type AvatarSize } from "./avatar-variants";

export type AvatarProps = Omit<ComponentProps<typeof AvatarPrimitive.Root>, "className"> & {
  size?: AvatarSize;
  className?: string;
};

function Avatar({ size = "default", className, ...props }: AvatarProps) {
  return <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={cn(avatarVariants({ size }), className)} {...props} />;
}

export type AvatarImageProps = Omit<ComponentProps<typeof AvatarPrimitive.Image>, "className"> & {
  className?: string;
};

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn(avatarImageClass, className)} {...props} />;
}

export type AvatarFallbackProps = Omit<ComponentProps<typeof AvatarPrimitive.Fallback>, "className"> & {
  className?: string;
};

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn(avatarFallbackClass, className)} {...props} />;
}

export { Avatar, AvatarFallback, AvatarImage };
