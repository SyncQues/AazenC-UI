"use client";

import { Button } from "@aazenc/ui/button";
import { PdfViewer } from "@aazenc/ui/pdf-viewer";
import { useTheme } from "@aazenc/themes";

export function PdfViewerPreview() {
  const { mode, toggleMode } = useTheme();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">PDF viewer</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One framed reader. Turn the page, zoom, and open thumbnails when the file has more than one page.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10">
        <PdfViewer src="/sample.pdf" title="Sample" />
      </div>
    </main>
  );
}
