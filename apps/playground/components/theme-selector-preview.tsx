"use client";

import { Button } from "@aazenc/ui/button";
import { ThemeSelector } from "@aazenc/ui/theme-selector";
import { useTheme } from "@aazenc/themes";

export function ThemeSelectorPreview() {
  const { theme, mode, setTheme, setMode, availableThemes, toggleMode } = useTheme();
  const label = availableThemes.find((item) => item.id === theme)?.label ?? theme;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Theme selector</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One menu. Light or dark, then the palette. The same control sits in the navbar.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex flex-col items-start gap-4">
        <ThemeSelector
          theme={theme}
          themes={availableThemes}
          mode={mode}
          onTheme={(id) => {
            const next = availableThemes.find((item) => item.id === id);
            if (next) setTheme(next.id);
          }}
          onMode={setMode}
        />
        <p className="text-sm text-muted-foreground">
          {label} · {mode}
        </p>
      </div>
    </main>
  );
}
