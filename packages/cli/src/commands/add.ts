import { flagOn, flagString, type Args } from "../lib/args.js";
import { projectRoot, readConfig, writeConfig } from "../lib/config.js";
import { installComponents } from "../lib/install.js";
import { loadRegistry } from "../lib/registry.js";
import { resolveClosure } from "../lib/resolve.js";
import { ensureStyles, requiredStyles } from "../lib/styles.js";
import { init } from "./init.js";

export function add(args: Args): void {
  const cwd = projectRoot(flagString(args.flags, "cwd") ?? process.cwd());
  if (!readConfig(cwd)) init({ ...args, command: "init", positionals: [], flags: args.flags });
  const config = readConfig(cwd);
  if (!config) throw new Error("Could not write components.json.");

  const registry = loadRegistry();
  const names = flagOn(args.flags, "all") ? registry.items.map((item) => item.name).filter((name) => name !== "utils") : args.positionals;
  if (names.length === 0) throw new Error("Name a component, or pass --all. Run `aazenc-ui list`.");

  const resolved = resolveClosure(registry, names);
  // Before the components, not after: `typeset` is class helpers over a sheet,
  // and writing the `.tsx` first would leave a window where the install looks
  // complete and renders unstyled.
  ensureStyles(cwd, config, registry, requiredStyles(registry, resolved.items));
  installComponents({
    config,
    items: resolved.items,
    extras: resolved.extras,
    mode: "add",
    overwrite: flagOn(args.flags, "overwrite"),
    skipInstall: flagOn(args.flags, "skip-install"),
    cwd,
  });
  writeConfig(cwd, config);
}
