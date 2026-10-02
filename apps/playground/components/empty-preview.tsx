"use client";

import { useState } from "react";
import { Button } from "@aazenc/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@aazenc/ui/empty";
import { useTheme } from "@aazenc/themes";

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 12h5l2 3h4l2-3h5" strokeLinejoin="round" />
      <path d="M4 6h16v12H4z" />
    </svg>
  );
}

export function EmptyPreview() {
  const { mode, toggleMode } = useTheme();
  const [created, setCreated] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Component</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Empty</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One dashed message. Card fills and plain icons were the same empty state.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={toggleMode}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="mt-10">
        {created ? (
          <p className="text-sm">Created a draft.</p>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No jobs yet</EmptyTitle>
              <EmptyDescription>Post a role and it will show up here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" onClick={() => setCreated(true)}>
                Create a job
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </main>
  );
}
