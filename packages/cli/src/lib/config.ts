import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export type InstalledFile = {
  path: string;
  hash: string;
};

export type AazencConfig = {
  $schema: "https://aazenc.dev/schema.json";
  style: "aazenc";
  rsc: boolean;
  tsx: boolean;
  tailwind: { css: string };
  aliases: { ui: string; utils: string };
  uiDir: string;
  utilsFile: string;
  themeCss: string;
  installed: Record<string, { files: InstalledFile[] }>;
};

export function configPath(cwd: string): string {
  return join(cwd, "components.json");
}

export function readConfig(cwd: string): AazencConfig | undefined {
  const file = configPath(cwd);
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8")) as AazencConfig;
}

export function writeConfig(cwd: string, config: AazencConfig): void {
  writeFileSync(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`);
}

export function requireConfig(cwd: string): AazencConfig {
  const config = readConfig(cwd);
  if (!config) throw new Error("This project is not initialized. Run `aazenc-ui init` first.");
  return config;
}

export function projectRoot(cwd: string): string {
  const root = resolve(cwd);
  if (!existsSync(join(root, "package.json"))) {
    throw new Error(`No package.json in ${root}. Run this inside your app.`);
  }
  return root;
}

export function usesSrc(cwd: string): boolean {
  if (existsSync(join(cwd, "src/app")) || existsSync(join(cwd, "src/components"))) return true;
  return existsSync(join(cwd, "src")) && !existsSync(join(cwd, "app"));
}

export function findGlobalsCss(cwd: string): string | undefined {
  const candidates = ["app/globals.css", "src/app/globals.css", "src/styles/globals.css", "styles/globals.css"];
  return candidates.find((candidate) => existsSync(join(cwd, candidate)));
}

export function recordedHash(config: AazencConfig, relativePath: string): string | undefined {
  for (const entry of Object.values(config.installed)) {
    const file = entry.files.find((item) => item.path === relativePath);
    if (file) return file.hash;
  }
  return undefined;
}
