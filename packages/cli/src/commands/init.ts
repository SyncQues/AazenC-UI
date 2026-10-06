import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { flagOn, flagString, type Args } from "../lib/args.js";
import {
  AAZENC_CONFIG_FILE,
  findGlobalsCss,
  lookupConfig,
  projectRoot,
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
  const lookup = lookupConfig(cwd);

  if (lookup.kind === "invalid") {
    throw new Error(
      `${lookup.file} is not valid JSON, so init will not overwrite it. Fix or delete it, then retry.`,
    );
  }

  // Decided before anything is planned or written: the old order printed the
  // destination directory and then bailed out, so a re-run in an initialised
  // project read like it had described work it never did.
  if (lookup.kind === "found" && !force) {
    console.log(`${join(cwd, lookup.file)} already exists. Pass --force to rewrite it.`);
    return;
  }

  if (lookup.kind === "foreign") {
    const owner = lookup.schema?.includes("shadcn") ? "shadcn" : "another tool";
    // `--force` means rewrite *our* config. It must never mean "delete
    // somebody else's", which is what this file used to do.
    console.log(
      `${lookup.file} is a ${owner} config, so it is left untouched. AazenC will use ${AAZENC_CONFIG_FILE}; both tools can share the project.`,
    );
  }

  const src = usesSrc(cwd);
  const uiDir = slash(flagString(args.flags, "ui") ?? defaultUiDir(cwd, src));
  const utilsFile = slash(flagString(args.flags, "utils") ?? (src ? "src/lib/utils.ts" : "lib/utils.ts"));
  const globals = flagString(args.flags, "css") ?? findGlobalsCss(cwd);
  const themeCss = globals ? slash(join(dirname(globals), "aazenc.css")) : "aazenc.css";

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
    installed: lookup.kind === "found" ? lookup.config.installed : {},
  };
  mkdirSync(join(cwd, uiDir), { recursive: true });
  const written = writeConfig(cwd, config);
  console.log(`wrote ${written}`);
  console.log(`components go in ${uiDir}.`);
}
