import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "apps/registry/registry.json");
const target = resolve(root, "apps/playground/public/r/registry.json");

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, readFileSync(source));
console.log(`Wrote ${target}`);
