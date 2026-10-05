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

Every component that renders an element takes `className`, and it wins. The
caller's classes are merged last, so a caller can override any size, colour, or
spacing the variant set chose:

```tsx
<Button size="default" className="h-12 px-10" />   // h-12 and px-10 win
<Card className="max-w-sm" />
<TableCell className="text-destructive" />
```

The roots are the exception, and they say so in their types: `Dialog`,
`Popover`, `Tooltip`, `Drawer`, `Sheet`, `HoverCard`, `DropdownMenu`,
`ContextMenu` and their `Sub`s are Radix context providers that render no
element, so they take no `className` — style the `Trigger` or `Content`.
`Accordion` and `Collapsible` are not in that list: their roots render a `div`.
`SelectValue` is the same case for a different reason: Radix drops the prop on
it. Omitting the prop rather than accepting-and-discarding it is deliberate, so
the compiler catches the next person.

Three layers, each with a clear owner:

| Layer | Scope | Mechanism |
| --- | --- | --- |
| `className` | one instance | `cn(variants(...), className)` |
| `variant` / `size` | named presets | cva, exported per component |
| tokens | the whole product | CSS variables, inlined into the `aazenc.css` the CLI writes |

`cn` is `twMerge(clsx(...))`, so conflicting Tailwind utilities resolve in the
caller's favour rather than depending on stylesheet order. Two things that are
not class overrides, and stay the component's own: the `data-slot` attributes
every element carries, and the ARIA and state attributes a variant cannot
express.

One hole worth knowing: on an `asChild` component (`Badge`, `BreadcrumbLink`,
`NavbarLink`, …) Radix's `Slot` joins the two class strings with a plain space
and no `twMerge`, so a genuine conflict there is settled by stylesheet order
rather than in the caller's favour. The classes all apply; only the tie is
decided elsewhere.

## Typeset

`typeset` is the one component whose value is CSS. `add typeset` writes the
stylesheet into your `aazenc.css` between `/* aazenc:typeset:begin */` and
`/* aazenc:typeset:end */` markers — it appends that block to an existing theme
file rather than overwriting it, so a project that ran `init` before typeset
existed is upgraded in place. Nothing else in the library needs this: every
other component's styles travel inside the copied `.tsx` as Tailwind utilities.

```tsx
<Typeset preset="docs" measure="narrow" as="article" className="mx-auto">
  <MarkdownViewer html={post.body} />
</Typeset>
```

`className="typeset"` on any element does the same job without the component.
Seven presets (`default`, `compact`, `chat`, `docs`, `reading`, `display`,
`large`) and three measures. `TypesetFit` is an opt-in ancestor that sizes
narrow columns by their own width instead of the viewport.

Two opt-out depths, and they are not interchangeable:

- `not-typeset` / `[data-not-typeset]` skips the element **and its subtree**.
  Right for anything you do not want touched.
- `[data-slot]` skips **only that element**, so a component keeps its own look
  while prose rendered inside it stays styled. Every component root here carries
  one, which is why a `Button` or a `Table` inside a typeset looks like a button
  or a table.

If the component renders but nothing is styled, the sheet is missing from your
`aazenc.css` — the CLI writes it, so this means the file was replaced by hand
after install.

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
