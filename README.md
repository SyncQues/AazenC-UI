# AazenC UI

pnpm + Turborepo monorepo for the AazenC component library. The folder layout matches [intelli-ui](https://github.com/IntelliHelper/IntelliHelper-UI). The build list is [component.md](./component.md).

## Layout

```
apps/
  playground/          # Next.js docs shell and registry host
  registry/            # shadcn-style registry.json (items start empty)
packages/
  ui/                  # Web components (@aazenc/ui)
  cli/                 # CLI + MCP skeleton (@aazenc/cli)
                       # src/commands, src/lib, src/mcp, src/registry
  themes/              # Theme CSS + ThemeProvider (@aazenc/themes)
  tokens/              # Design tokens (@aazenc/tokens)
  animations/          # Shared motion CSS (@aazenc/animations)
  utils/               # cn + focus ring (@aazenc/utils)
  config/              # PostCSS + global CSS entry (@aazenc/config)
  eslint-config/       # Shared ESLint presets (@repo/eslint-config)
  typescript-config/   # Shared tsconfig (@repo/typescript-config)
  locale/              # Empty locale package
docs/                  # Docs slot
scripts/               # Registry bundle scripts
```

## Customizing a component

Every component takes `className`, and it wins. The caller's classes are merged
last, so a caller can override any size, colour, or spacing the variant set chose:

```tsx
<Button size="default" className="h-12 px-10" />   // h-12 and px-10 win
<Card className="max-w-sm" />
<TableCell className="text-destructive" />
```

Three layers, each with a clear owner:

| Layer | Scope | Mechanism |
| --- | --- | --- |
| `className` | one instance | `cn(variants(...), className)` |
| `variant` / `size` | named presets | cva, exported per component |
| tokens | the whole product | CSS variables in `@aazenc/tokens` |

`cn` is `twMerge(clsx(...))`, so conflicting Tailwind utilities resolve in the
caller's favour rather than depending on stylesheet order. Two things that are
not class overrides, and stay the component's own: the `data-slot` attributes
every element carries, and the ARIA and state attributes a variant cannot
express.

## What is already here

Shared foundation the components sit on: tokens, the two themes (slate, mono), animations, `cn` / `focusRing`, and the web `ThemeProvider`.

The playground has the same routes as intelli-ui (`/`, `/components`, `/components/[slug]`, `/guides`, `/categories/[category]`, `/getting-started`, `/about`, `/sitemap`, `/llms.txt`, `/rss.xml`) with placeholder pages.

## What is not here

- Some catalog entries in component.md that are not built yet

## Develop

Node.js 22.6 or newer, pnpm 10.

```bash
pnpm install
pnpm dev          # turbo dev
pnpm --filter playground dev
pnpm lint
pnpm check-types
```

## Use it in an app

The CLI copies components into your project. It does not replace files that are already there.

```bash
npx @aazenc/cli@latest init
npx @aazenc/cli@latest list
npx @aazenc/cli@latest add button card dialog
npx @aazenc/cli@latest update
npx @aazenc/cli@latest update button --overwrite
```

If the project has no `ui` folder, `init` creates `components/ui` (or `src/components/ui`) and `add` writes components there. If a `ui` folder is already present, components go in `aazenc-ui` beside it, for example `components/aazenc-ui`. Pass `--ui <dir>` to choose the directory. Import the generated `aazenc.css` after `tailwindcss` in your global CSS.

You own the copied files, so you can edit them freely. `update` only replaces a file whose current content still matches the hash recorded at install, so local edits are skipped rather than overwritten — merge upstream changes by hand, or pass `--overwrite` to discard your version.

## Add a component

1. Add `packages/ui/src/<name>.tsx`.
2. Export it from `packages/ui/src/index.ts` and add an `exports` entry in `packages/ui/package.json`.
3. Add the registry item in `apps/registry/registry.json`.
4. Replace the placeholder on `apps/playground/app/(playground)/components/[slug]` when that component gets a doc page.
