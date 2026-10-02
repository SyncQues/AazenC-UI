import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Back home
        </Link>
      </p>
    </main>
  );
}
