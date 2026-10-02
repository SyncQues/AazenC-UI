"use client";

import { type ComponentProps } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export type ThemeChoice = {
  id: string;
  label: string;
};

export interface ThemeSelectorProps extends Omit<ComponentProps<"button">, "className" | "children" | "value"> {
  theme: string;
  themes: ThemeChoice[];
  mode: "light" | "dark";
  material: "solid" | "glass";
  onTheme: (theme: string) => void;
  onMode: (mode: "light" | "dark") => void;
  onMaterial: (material: "solid" | "glass") => void;
}

function ThemeSelector({ theme, themes, mode, material, onTheme, onMode, onMaterial, ...triggerProps }: ThemeSelectorProps) {
  const current = themes.find((item) => item.id === theme)?.label ?? theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={`Theme, ${current}, ${mode}`} {...triggerProps}>
          {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mode} onValueChange={(value) => onMode(value === "dark" ? "dark" : "light")}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Surface</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={material} onValueChange={(value) => onMaterial(value === "glass" ? "glass" : "solid")}>
          <DropdownMenuRadioItem value="solid">Solid</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="glass">Glass</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={onTheme}>
          {themes.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id}>
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeSelector };
