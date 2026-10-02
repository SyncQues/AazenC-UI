import { cpSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(resolve(root, "apps/playground/package.json"));
const pkg = dirname(require.resolve("pdfjs-dist/package.json"));
const target = resolve(root, "apps/playground/public/pdfjs");

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const folder of ["cmaps", "standard_fonts", "wasm"]) {
  cpSync(resolve(pkg, folder), resolve(target, folder), { recursive: true });
}

console.log(`Copied pdf.js assets to ${target}`);
