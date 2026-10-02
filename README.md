# AazenC UI

pnpm + Turborepo skeleton for the AazenC component library. The folder layout matches [intelli-ui](https://github.com/IntelliHelper/IntelliHelper-UI). Component implementations are not copied. Add them one at a time. The build list is [component.md](./component.md).

## Layout

```
apps/
  playground/          # Next.js docs shell and registry host
  native-playground/   # Expo shell for native components
  registry/            # shadcn-style registry.json (items start empty)
packages/
  ui/                  # Web components (@aazenc/ui) — src/index.ts only
  ui-native/           # Native components (@aazenc/ui-native)
                       # theme + utils are in place; components/ is empty
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

Shared foundation the components sit on: tokens, the five themes (mono, aurora, sunset, frost, ocean), animations, `cn` / `focusRing`, the web `ThemeProvider`, and the native theme plus style helpers.

The playground has the same routes as intelli-ui (`/`, `/components`, `/components/[slug]`, `/native`, `/guides`, `/categories/[category]`, `/getting-started`, `/about`, `/sitemap`, `/llms.txt`, `/rss.xml`) with placeholder pages.

## What is not here

- Web component files (`packages/ui/src/*.tsx` in intelli-ui)
- Native component files (`packages/ui-native/src/components/*.tsx`)
- Playground demos
- CLI install / MCP implementation
- Registry items

## Develop

Node.js 18 or newer, pnpm 10.

```bash
pnpm install
pnpm dev          # turbo dev
pnpm --filter playground dev
pnpm native       # Expo playground
pnpm lint
pnpm check-types
```

## Add a component

1. Add `packages/ui/src/<name>.tsx` (and the native file under `packages/ui-native/src/components` when it has a native version).
2. Export it from `packages/ui/src/index.ts` and add an `exports` entry in `packages/ui/package.json`.
3. Add the registry item in `apps/registry/registry.json`.
4. Replace the placeholder on `apps/playground/app/(playground)/components/[slug]` when that component gets a doc page.
