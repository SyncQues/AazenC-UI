"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { FileUpload } from "@aazenc/ui/file-upload";
import { useTheme } from "@aazenc/themes";

export function FileUploadPreview() {
  const { mode, toggleMode } = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  function start() {
    if (files.length === 0) {
      setError("Choose a file first.");
      return;
    }
    setError("");
    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = (current ?? 0) + 20;
        if (next >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 200);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">File upload</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One drop zone. It stages the file, rejects the wrong type or a file over the limit, and shows progress while the page uploads.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10 grid max-w-md gap-4">
        <FileUpload
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          value={files}
          onValueChange={setFiles}
          onReject={setError}
          error={error}
          invalid={Boolean(error)}
          progress={progress}
          hint="PDF, PNG, or JPG. Up to 10 MB."
        />
        <Button type="button" onClick={start} disabled={progress !== null && progress < 100}>
          {progress !== null && progress < 100 ? "Uploading" : "Upload"}
        </Button>
      </div>
    </main>
  );
}
