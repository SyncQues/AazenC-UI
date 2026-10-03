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

If the project has no `ui` folder, `init` creates `components/ui` (or `src/components/ui`) and `add` writes components there. If a `ui` folder is already present, components go in `aazenc-ui` beside it, for example `components/aazenc-ui`. Pass `--ui <dir>` to choose the directory. Import the generated `aazenc.css` after `tailwindcss` in your global CSS. `@aazenc/cli` on npm is updated when this package is published again. Version 0.1.0 only prints a stub.

## Add a component

1. Add `packages/ui/src/<name>.tsx`.
2. Export it from `packages/ui/src/index.ts` and add an `exports` entry in `packages/ui/package.json`.
3. Add the registry item in `apps/registry/registry.json`.
4. Replace the placeholder on `apps/playground/app/(playground)/components/[slug]` when that component gets a doc page.
