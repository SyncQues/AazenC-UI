"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { type ComponentProps } from "react";
import { avatarFallbackClass, avatarImageClass, avatarVariants, type AvatarSize } from "./avatar-variants";

export type AvatarProps = Omit<ComponentProps<typeof AvatarPrimitive.Root>, "className"> & {
  size?: AvatarSize;
};

function Avatar({ size = "default", ...props }: AvatarProps) {
  return <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={avatarVariants({ size })} {...props} />;
}

export type AvatarImageProps = Omit<ComponentProps<typeof AvatarPrimitive.Image>, "className">;

function AvatarImage(props: AvatarImageProps) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={avatarImageClass} {...props} />;
}

export type AvatarFallbackProps = Omit<ComponentProps<typeof AvatarPrimitive.Fallback>, "className">;

function AvatarFallback(props: AvatarFallbackProps) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={avatarFallbackClass} {...props} />;
}

export { Avatar, AvatarFallback, AvatarImage };
