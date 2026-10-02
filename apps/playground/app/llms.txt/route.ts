export function GET() {
  const body = `# AazenC UI

Component library for product UI.
Catalog: component.md
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
