import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { recordedHash, type AazencConfig } from "./config.js";
import type { ExtraFile } from "./resolve.js";
import type { RegistryItem } from "./registry.js";

export type InstallPlan = {
  config: AazencConfig;
  items: RegistryItem[];
  extras: ExtraFile[];
  mode: "add" | "update";
  overwrite: boolean;
  skipInstall: boolean;
  cwd: string;
};

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function slash(value: string): string {
  return value.split(sep).join("/");
}

function insideProject(cwd: string, relativePath: string): string {
  const root = resolve(cwd);
  const absolute = resolve(root, relativePath);
  if (absolute !== root && !absolute.startsWith(root + sep)) {
    throw new Error(`Refusing to write outside the project: ${relativePath}`);
  }
  return absolute;
}

function outputPath(config: AazencConfig, target: string): string {
  const normalized = slash(target);
  if (normalized === "lib/utils.ts" || normalized.endsWith("/lib/utils.ts")) return config.utilsFile;
  const marker = "components/ui/";
  const index = normalized.lastIndexOf(marker);
  if (index !== -1) return slash(join(config.uiDir, normalized.slice(index + marker.length)));
  return slash(join(config.uiDir, normalized.split("/").pop() ?? normalized));
}

function importSpecifier(fromFile: string, toFile: string): string {
  let specifier = slash(relative(dirname(fromFile), toFile)).replace(/\.(tsx|ts)$/, "");
  if (!specifier.startsWith(".")) specifier = `./${specifier}`;
  return specifier;
}

function transform(content: string, fromFile: string, utilsFile: string): string {
  const specifier = importSpecifier(fromFile, utilsFile);
  return content.replaceAll('from "@aazenc/utils"', `from "${specifier}"`);
}

function packageManager(cwd: string): "pnpm" | "yarn" | "bun" | "npm" {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

function missingDependencies(cwd: string, items: RegistryItem[]): string[] {
  const manifest = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const present = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);
  const wanted = new Set<string>();
  for (const item of items) {
    for (const dependency of item.dependencies ?? []) wanted.add(dependency);
  }
  return [...wanted].filter((dependency) => !present.has(dependency)).sort();
}

function installDependencies(cwd: string, dependencies: string[]): void {
  if (dependencies.length === 0) return;
  const manager = packageManager(cwd);
  const args = manager === "npm" ? ["install", ...dependencies] : ["add", ...dependencies];
  console.log(`\n${manager} ${args.join(" ")}`);
  const result = spawnSync(manager, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${manager} failed to install ${dependencies.join(", ")}`);
  }
}

export function installComponents(plan: InstallPlan): void {
  const { config, items, extras, mode, overwrite, cwd } = plan;
  const writtenByItem = new Map<string, { path: string; hash: string }[]>();
  let wrote = 0;
  let skipped = 0;
  let unchanged = 0;

  const queue: { owner: string; relativePath: string; content: string }[] = [];
  for (const item of items) {
    for (const file of item.files) {
      queue.push({ owner: item.name, relativePath: outputPath(config, file.target), content: file.content });
    }
  }
  for (const extra of extras) {
    queue.push({
      owner: extra.owner,
      relativePath: slash(join(config.uiDir, extra.filename)),
      content: extra.content,
    });
  }

  for (const file of queue) {
    const relativePath = file.relativePath;
    const next = transform(file.content, relativePath, config.utilsFile);
    const absolute = insideProject(cwd, relativePath);
    const nextHash = hash(next);
    const files = writtenByItem.get(file.owner) ?? [];
    writtenByItem.set(file.owner, files);

    if (!existsSync(absolute)) {
      mkdirSync(dirname(absolute), { recursive: true });
      writeFileSync(absolute, next);
      files.push({ path: relativePath, hash: nextHash });
      wrote += 1;
      console.log(`added ${relativePath}`);
      continue;
    }

    const current = readFileSync(absolute, "utf8");
    if (current === next) {
      files.push({ path: relativePath, hash: nextHash });
      unchanged += 1;
      continue;
    }

    const previous = recordedHash(config, relativePath);
    const canReplace = overwrite || (mode === "update" && previous !== undefined && hash(current) === previous);
    if (!canReplace) {
      skipped += 1;
      console.log(`skipped ${relativePath} (already exists; pass --overwrite)`);
      if (previous) files.push({ path: relativePath, hash: previous });
      continue;
    }

    writeFileSync(absolute, next);
    files.push({ path: relativePath, hash: nextHash });
    wrote += 1;
    console.log(`updated ${relativePath}`);
  }

  for (const [name, files] of writtenByItem) {
    if (files.length > 0) config.installed[name] = { files };
  }

  console.log(`\n${wrote} written, ${unchanged} unchanged, ${skipped} skipped.`);
  if (!plan.skipInstall) installDependencies(cwd, missingDependencies(cwd, items));
}
