import { flagOn, flagString, type Args } from "../lib/args.js";
import { readConfig } from "../lib/config.js";
import { loadRegistry } from "../lib/registry.js";

export function list(args: Args): void {
  const cwd = flagString(args.flags, "cwd") ?? process.cwd();
  const registry = loadRegistry();
  const config = readConfig(cwd);
  const installedOnly = flagOn(args.flags, "installed");
  const items = registry.items.filter((item) => !installedOnly || config?.installed[item.name]);

  if (items.length === 0) {
    console.log(installedOnly ? "No AazenC components are installed." : "The registry is empty.");
    return;
  }

  for (const item of items) {
    const mark = config?.installed[item.name] ? "installed" : "         ";
    const description = (item.description ?? "").replace(/\s+/g, " ");
    const short = description.length > 72 ? `${description.slice(0, 69)}...` : description;
    console.log(`${item.name.padEnd(18)} ${mark}  ${short}`);
  }
}
