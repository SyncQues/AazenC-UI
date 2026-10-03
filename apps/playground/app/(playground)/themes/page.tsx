import type { Metadata } from "next";
import Link from "next/link";
import { themes } from "@aazenc/themes";

export const metadata: Metadata = { title: "Themes" };

/**
 * The showcase is theme-agnostic — it reads whatever palette is active out of
 * the cascade — so this index is generated from the manifest rather than
 * hard-coded. A new theme in @aazenc/themes gets a showcase page for free.
 */
export default function ThemesPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm text-muted-foreground">Foundation</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Themes</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every palette in the token contract, side by side. Each page is a live inspector: the swatches bind to
        the CSS variables they name, so switching theme or mode repaints the page rather than loading a different
        one.
      </p>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {themes.map((item) => (
          <li key={item.id}>
            <Link href={`/themes/${item.id}`} className="flex flex-col gap-1 py-4">
              <span className="font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.description}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-muted-foreground">
        Every swatch above is bound to the CSS variable it names, so the tables are read out of the cascade rather
        than copied into JS.
      </p>
    </main>
  );
}
