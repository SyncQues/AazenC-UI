import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "packages/ui/package.json"), "utf8"));
const registry = JSON.parse(readFileSync(resolve(root, "apps/registry/registry.json"), "utf8"));

const listed = new Set();
for (const item of registry.items ?? []) {
  for (const file of item.files ?? []) {
    if (file.path) listed.add(file.path);
  }
}

const missing = [];
for (const [key, target] of Object.entries(pkg.exports ?? {})) {
  if (key === "." || typeof target !== "string" || !target.startsWith("./")) continue;
  const path = `packages/ui/${target.slice(2)}`;
  if (!listed.has(path)) missing.push(`${key} -> ${path}`);
}

if (missing.length > 0) {
  console.error("Registry is missing files for these @aazenc/ui exports:");
  for (const line of missing) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`Registry covers ${Object.keys(pkg.exports).length - 1} package exports.`);
