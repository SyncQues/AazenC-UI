export function GET() {
  const body = `# AazenC UI

Component library skeleton. Components are added one at a time.
Catalog: component.md
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
