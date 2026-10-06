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

/**
 * `aazenc.json` is ours. `components.json` is shadcn's, and it predates us in
 * plenty of projects — the CLI used to write that same name, which meant a
 * shadcn project either lost its config to `--force` or, worse, had it adopted
 * as ours and then crashed on the first `add` because none of our fields were
 * there. Reading is therefore name-first but shape-checked: a foreign
 * `components.json` is reported as foreign instead of being trusted, and a
 * project running both tools keeps one file each.
 */
export const AAZENC_CONFIG_FILE = "aazenc.json";
const LEGACY_CONFIG_FILE = "components.json";

export type ConfigLookup =
  | { kind: "found"; config: AazencConfig; file: string }
  /** The file exists and parses, but it is not an AazenC config. */
  | { kind: "foreign"; file: string; schema: string | undefined }
  /** The file exists but is not parseable JSON, so we cannot judge it. */
  | { kind: "invalid"; file: string }
  | { kind: "missing" };

export function configPath(cwd: string): string {
  return join(cwd, AAZENC_CONFIG_FILE);
}

export function legacyConfigPath(cwd: string): string {
  return join(cwd, LEGACY_CONFIG_FILE);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * A structural test, not a `$schema` string comparison: the fields that make
 * this config usable are the fields the rest of the CLI joins and reads
 * blindly. Requiring them here means a malformed or foreign file fails at
 * load time with a sentence, instead of mid-install from `path.join(undefined)`.
 */
export function isAazencConfig(value: unknown): value is AazencConfig {
  if (!isObject(value)) return false;
  if (!isNonEmptyString(value.uiDir)) return false;
  if (!isNonEmptyString(value.utilsFile)) return false;
  if (!isNonEmptyString(value.themeCss)) return false;
  if (!isObject(value.installed)) return false;
  if (!isObject(value.aliases)) return false;
  return true;
}

/**
 * Own file first, then the name we used to share with shadcn. The first file
 * that exists decides: a `components.json` that is foreign is reported rather
 * than skipped, because silently preferring a config further down the list
 * would hide the collision this lookup exists to surface.
 */
export function lookupConfig(cwd: string): ConfigLookup {
  for (const file of [AAZENC_CONFIG_FILE, LEGACY_CONFIG_FILE]) {
    const path = join(cwd, file);
    if (!existsSync(path)) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      return { kind: "invalid", file };
    }

    if (isAazencConfig(parsed)) return { kind: "found", config: parsed, file };
    const schema = isObject(parsed) && typeof parsed.$schema === "string" ? parsed.$schema : undefined;
    return { kind: "foreign", file, schema };
  }

  return { kind: "missing" };
}

export function readConfig(cwd: string): AazencConfig | undefined {
  const lookup = lookupConfig(cwd);
  return lookup.kind === "found" ? lookup.config : undefined;
}

/**
 * Writes back to wherever the config was read from, so a project initialised
 * against the old `components.json` keeps updating that one file instead of
 * silently growing a second, divergent copy.
 */
export function writeConfig(cwd: string, config: AazencConfig): string {
  const lookup = lookupConfig(cwd);
  const file = lookup.kind === "found" ? lookup.file : AAZENC_CONFIG_FILE;
  writeFileSync(join(cwd, file), `${JSON.stringify(config, null, 2)}\n`);
  return file;
}

export function requireConfig(cwd: string): AazencConfig {
  const lookup = lookupConfig(cwd);
  if (lookup.kind === "found") return lookup.config;

  if (lookup.kind === "foreign") {
    const owner = lookup.schema?.includes("shadcn") ? "shadcn" : "another tool";
    throw new Error(
      `${lookup.file} is a ${owner} config, not an AazenC one. Run \`aazenc-ui init\` to write ${AAZENC_CONFIG_FILE} alongside it.`,
    );
  }
  if (lookup.kind === "invalid") {
    throw new Error(
      `${lookup.file} is not valid JSON, so this project is not initialised. Fix or delete it, then run \`aazenc-ui init\`.`,
    );
  }
  throw new Error(`This project is not initialized. Run \`aazenc-ui init\` first.`);
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