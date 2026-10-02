"use client";

import { Button } from "@aazenc/ui/button";
import { toast, Toaster } from "@aazenc/ui/toast";
import { useTheme } from "@aazenc/themes";

export function ToastPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Toaster />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Toast</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One notice in the top right. Success, warning, and error change the icon. A plain message uses the same card.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 flex max-w-md flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => toast("Draft saved", { description: "You can keep editing." })}>
          Message
        </Button>
        <Button type="button" onClick={() => toast.success("Invite sent")}>
          Success
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.warning("This link expires today")}>
          Warning
        </Button>
        <Button type="button" variant="destructive" onClick={() => toast.error("Could not save", { description: "Try again in a moment." })}>
          Error
        </Button>
      </div>
    </main>
  );
}
