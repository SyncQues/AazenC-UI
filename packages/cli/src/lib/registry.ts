import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type RegistryFile = {
  path: string;
  type?: string;
  target: string;
  content: string;
};

export type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  /**
   * Style modules this component cannot render without, named against
   * `Registry.styles`. Installing the `.tsx` is only half the job for these:
   * `typeset` is a class helper over a stylesheet, so a project whose theme
   * file predates the sheet needs it appended before the component works.
   */
  css?: string[];
  files: RegistryFile[];
};

export type Registry = {
  name: string;
  items: RegistryItem[];
  sources: Record<string, string>;
  css: string;
  /** Style modules, keyed by the name an item lists in its `css` array. */
  styles: Record<string, string>;
};

export function loadRegistry(): Registry {
  const registryUrl = new URL("../registry/registry.json", import.meta.url);
  const registry = JSON.parse(readFileSync(fileURLToPath(registryUrl), "utf8")) as Registry;
  if (!Array.isArray(registry.items) || typeof registry.css !== "string" || registry.sources == null || registry.styles == null) {
    throw new Error("The built-in registry is missing. Rebuild @aazenc/cli.");
  }
  return registry;
}
