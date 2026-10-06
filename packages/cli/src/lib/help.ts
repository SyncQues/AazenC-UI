export const help = `AazenC UI CLI

Usage
  aazenc-ui init [--ui <dir>] [--utils <file>] [--css <file>] [--force]
  aazenc-ui list [--installed]
  aazenc-ui add <component...> [--all] [--overwrite] [--skip-install]
  aazenc-ui update [component...] [--overwrite] [--skip-install]

Commands
  init      Write aazenc.json and the theme CSS. Does not replace your UI files.
  list      List registry components.
  add       Copy components into the project and install their npm dependencies.
  update    Refresh components this CLI installed.

Settings live in aazenc.json. A components.json belonging to another tool,
such as shadcn, is left untouched and the two can share a project.

Existing files are left in place unless you pass --overwrite.
update refreshes a file only when it still matches the last installed copy.

Options
  --ui <dir>         Component directory. Default: components/ui (created when missing).
                     If a ui folder already exists, components go in aazenc-ui next to it.
  --utils <file>     Where cn() is written. Default: lib/utils.ts, or src/lib/utils.ts.
  --css <file>       Global CSS file that should import the AazenC sheet.
  --cwd <dir>        Project directory. Default: the current directory.
  --all              Add every component.
  --installed        List only components recorded in aazenc.json.
  --overwrite        Replace files that already exist or were edited.
  --skip-install     Do not install npm dependencies.
  --force            On init, rewrite your aazenc.json and the theme CSS. Never
                     rewrites another tool's components.json.
  --yes              Accepted for scripts. Prompts are already skipped.
`;
