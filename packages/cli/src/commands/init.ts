import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { flagOn, flagString, type Args } from "../lib/args.js";
import {
  configPath,
  findGlobalsCss,
  projectRoot,
  readConfig,
  usesSrc,
  writeConfig,
  type AazencConfig,
} from "../lib/config.js";
import { loadRegistry } from "../lib/registry.js";

function slash(value: string): string {
  return value.replaceAll("\\", "/");
}

function findUiDir(cwd: string): string | undefined {
  const candidates = ["src/components/ui", "components/ui", "src/ui", "ui"];
  return candidates.find((dir) => existsSync(join(cwd, dir)));
}

function defaultUiDir(cwd: string, src: boolean): string {
  const existing = findUiDir(cwd);
  if (!existing) return src ? "src/components/ui" : "components/ui";
  const separate = existing.replace(/(^|\/)ui$/, "$1aazenc-ui");
  console.log(`${existing} already exists, so AazenC components will go in ${separate}.`);
  return separate;
}

export function init(args: Args): void {
  const cwd = projectRoot(flagString(args.flags, "cwd") ?? process.cwd());
  const force = flagOn(args.flags, "force");
  const src = usesSrc(cwd);
  const uiDir = slash(flagString(args.flags, "ui") ?? defaultUiDir(cwd, src));
  const utilsFile = slash(flagString(args.flags, "utils") ?? (src ? "src/lib/utils.ts" : "lib/utils.ts"));
  const globals = flagString(args.flags, "css") ?? findGlobalsCss(cwd);
  const themeCss = globals ? slash(join(dirname(globals), "aazenc.css")) : "aazenc.css";
  const existing = readConfig(cwd);

  if (existing && !force) {
    console.log(`${configPath(cwd)} already exists. Pass --force to rewrite it.`);
    return;
  }

  const registry = loadRegistry();
  const themePath = join(cwd, themeCss);
  if (!existsSync(themePath) || force) {
    mkdirSync(dirname(themePath), { recursive: true });
    writeFileSync(themePath, registry.css);
    console.log(`wrote ${themeCss}`);
  } else {
    console.log(`kept ${themeCss}`);
  }

  const importFrom = globals ? slash(join(dirname(globals), "aazenc.css")) : themeCss;
  console.log(`Import ${importFrom} from your global CSS, after tailwindcss:`);
  console.log(`  @import "./${importFrom.split("/").pop()}";`);

  const config: AazencConfig = {
    $schema: "https://aazenc.dev/schema.json",
    style: "aazenc",
    rsc: true,
    tsx: true,
    tailwind: { css: globals ?? themeCss },
    aliases: {
      ui: `@/${uiDir.replace(/^src\//, "")}`,
      utils: `@/${utilsFile.replace(/^src\//, "").replace(/\.(tsx|ts)$/, "")}`,
    },
    uiDir,
    utilsFile,
    themeCss,
    installed: existing?.installed ?? {},
  };
  mkdirSync(join(cwd, uiDir), { recursive: true });
  writeConfig(cwd, config);
  console.log(`wrote components.json`);
  console.log(`components go in ${uiDir}.`);
}
