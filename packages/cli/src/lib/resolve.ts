import type { Registry, RegistryItem } from "./registry.js";

export type ExtraFile = {
  filename: string;
  content: string;
  owner: string;
};

const importPattern = /from\s+["'](\.[^"']+)["']/g;

function localImports(content: string): string[] {
  return [...content.matchAll(importPattern)].map((match) => match[1] ?? "").filter(Boolean);
}

function specifierName(specifier: string): string {
  const file = specifier.split("/").pop() ?? specifier;
  return file.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, "");
}

function fileName(target: string): string {
  return target.split("/").pop() ?? target;
}

function sourceFilename(sources: Record<string, string>, name: string): string | undefined {
  for (const extension of [".tsx", ".ts"]) {
    const filename = `${name}${extension}`;
    if (sources[filename] !== undefined) return filename;
  }
  return undefined;
}

export function resolveClosure(registry: Registry, roots: string[]): { items: RegistryItem[]; extras: ExtraFile[] } {
  const byName = new Map(registry.items.map((item) => [item.name, item]));
  const items: RegistryItem[] = [];
  const selected = new Set<string>();
  const extras = new Map<string, ExtraFile>();
  const pending = [...roots];

  const written = (): Set<string> => {
    const names = new Set(extras.keys());
    for (const item of items) {
      for (const file of item.files) names.add(fileName(file.target));
    }
    return names;
  };

  const noteImports = (content: string, owner: string) => {
    const have = written();
    for (const specifier of localImports(content)) {
      const name = specifierName(specifier);
      if (byName.has(name)) {
        if (!selected.has(name)) pending.push(name);
        continue;
      }
      const filename = sourceFilename(registry.sources, name);
      if (!filename || have.has(filename)) continue;
      const source = registry.sources[filename];
      if (source === undefined) continue;
      extras.set(filename, { filename, content: source, owner });
    }
  };

  for (let guard = 0; guard < 1000; guard += 1) {
    const extrasBefore = extras.size;
    const selectedBefore = selected.size;

    while (pending.length > 0) {
      const name = pending.shift();
      if (name === undefined || selected.has(name)) continue;
      const item = byName.get(name);
      if (!item) throw new Error(`Unknown component "${name}". Run \`aazenc-ui list\`.`);
      selected.add(name);
      items.push(item);
      for (const dependency of item.registryDependencies ?? []) {
        if (!selected.has(dependency)) pending.push(dependency);
      }
      for (const file of item.files) noteImports(file.content, item.name);
    }

    for (const extra of [...extras.values()]) noteImports(extra.content, extra.owner);
    if (pending.length === 0 && extras.size === extrasBefore && selected.size === selectedBefore) {
      return { items, extras: [...extras.values()] };
    }
  }

  throw new Error("Could not resolve component dependencies.");
}
