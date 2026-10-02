import { flagOn, flagString, type Args } from "../lib/args.js";
import { projectRoot, requireConfig, writeConfig } from "../lib/config.js";
import { installComponents } from "../lib/install.js";
import { loadRegistry } from "../lib/registry.js";
import { resolveClosure } from "../lib/resolve.js";

export function update(args: Args): void {
  const cwd = projectRoot(flagString(args.flags, "cwd") ?? process.cwd());
  const config = requireConfig(cwd);
  const installed = Object.keys(config.installed);
  const names = args.positionals.length > 0 ? args.positionals : installed;

  if (names.length === 0) {
    console.log("No AazenC components are installed.");
    return;
  }

  const missing = names.filter((name) => config.installed[name] === undefined);
  if (missing.length > 0) {
    throw new Error(`${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not installed. Run \`aazenc-ui add ${missing.join(" ")}\`.`);
  }

  const resolved = resolveClosure(loadRegistry(), names);
  installComponents({
    config,
    items: resolved.items,
    extras: resolved.extras,
    mode: "update",
    overwrite: flagOn(args.flags, "overwrite"),
    skipInstall: flagOn(args.flags, "skip-install"),
    cwd,
  });
  writeConfig(cwd, config);
}
