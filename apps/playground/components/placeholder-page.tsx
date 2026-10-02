export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm text-muted-foreground">Skeleton</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
    </main>
  );
}
