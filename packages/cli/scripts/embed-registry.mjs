import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const outFile = resolve(here, "../dist/registry/registry.json");

const packageCss = {
  "@aazenc/tokens/globals.css": "packages/tokens/src/index.css",
  "@aazenc/animations/globals.css": "packages/animations/src/index.css",
  "@aazenc/themes/slate.css": "packages/themes/src/slate.css",
  "@aazenc/themes/mono.css": "packages/themes/src/mono.css",
};

function read(rel) {
  return readFileSync(resolve(repoRoot, rel), "utf8");
}

function inlineCss(rel, seen = new Set()) {
  if (seen.has(rel)) return "";
  seen.add(rel);
  const abs = resolve(repoRoot, rel);
  const text = readFileSync(abs, "utf8");
  return text.replace(/@import\s+["']([^"']+)["'];?/g, (_match, spec) => {
    if (spec === "tailwindcss") return "";
    const mapped = packageCss[spec];
    if (mapped) return inlineCss(mapped, seen);
    if (spec.startsWith(".")) return inlineCss(relative(repoRoot, resolve(dirname(abs), spec)), seen);
    throw new Error(`Cannot inline CSS import "${spec}" from ${rel}`);
  });
}

function componentSources() {
  const dir = resolve(repoRoot, "packages/ui/src");
  const sources = {};
  for (const name of readdirSync(dir)) {
    if (name === "__tests__" || name.startsWith(".")) continue;
    const abs = join(dir, name);
    if (!statSync(abs).isFile()) continue;
    if (![".ts", ".tsx"].includes(extname(name))) continue;
    sources[name] = readFileSync(abs, "utf8");
  }
  return sources;
}

const registry = JSON.parse(read("apps/registry/registry.json"));
const sources = componentSources();

for (const item of registry.items) {
  for (const file of item.files) {
    file.content = read(file.path);
  }
}

if (!registry.items.some((item) => item.name === "utils")) {
  registry.items.unshift({
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "cn and focusRing.",
    dependencies: ["clsx", "tailwind-merge"],
    registryDependencies: [],
    files: [
      {
        path: "packages/utils/src/cn.ts",
        type: "registry:lib",
        target: "lib/utils.ts",
        content: `${read("packages/utils/src/cn.ts").trim()}\n\n${read("packages/utils/src/focus-ring.ts").trim()}\n`,
      },
    ],
  });
}

const css = inlineCss("packages/config/src/globals.css")
  .split("\n")
  .filter((line) => !line.trim().startsWith("@source"))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

registry.css = `/* AazenC UI tokens, themes, and motion. Import this after tailwindcss. */\n${css}\n`;
registry.sources = sources;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(registry));
console.log(`Wrote ${outFile} (${registry.items.length} items)`);
