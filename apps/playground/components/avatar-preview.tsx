"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@aazenc/ui/avatar";
import { Button } from "@aazenc/ui/button";
import { useTheme } from "@aazenc/themes";

const portrait =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#334155"/><circle cx="40" cy="32" r="14" fill="#e2e8f0"/><ellipse cx="40" cy="68" rx="22" ry="16" fill="#e2e8f0"/></svg>`,
  );

export function AvatarPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Avatar</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One circle. Small, default, or large. Initials show when the photo is missing.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-8">
      <div className="flex items-end gap-4">
        <Avatar size="sm">
          <AvatarImage src={portrait} alt="Ada" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={portrait} alt="Ada" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src={portrait} alt="Ada" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/missing-portrait.png" alt="" />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">Initials show when the photo fails.</p>
      </div>
      </div>
    </main>
  );
}
