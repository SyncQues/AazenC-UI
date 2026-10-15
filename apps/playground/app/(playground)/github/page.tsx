import type { Metadata } from "next";

export const metadata: Metadata = { title: "GitHub — AazenC UI" };

export default function GithubPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">In-app browser</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">GitHub</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Browse the AazenC UI repository without leaving this app.
          </p>
        </div>
        <a
          href="https://github.com/SyncQues/AazenC-UI"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground underline underline-offset-4"
        >
          Open in new tab
        </a>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card overflow-hidden">
        <iframe
          src="https://github.com/SyncQues/AazenC-UI"
          className="w-full border-0"
          style={{ minHeight: "80vh" }}
          title="GitHub repository"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </main>
  );
}
