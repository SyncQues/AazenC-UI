import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { AazencConfig } from "./config.js";
import type { Registry } from "./registry.js";

/**
 * Style sheets a component needs, reconciled into the project's theme file.
 *
 * `init` writes the whole bundle to `aazenc.css` but deliberately keeps an
 * existing one, so a project that initialised before a sheet existed keeps its
 * old file forever and `add` would hand it a component that renders unstyled
 * with no error anywhere. This closes that gap: the block is marked, and a
 * project that lacks the marker gets it appended, in place, without disturbing
 * the rest of the file.
 */

const marker = (name: string, edge: "begin" | "end"): string =>
  `/* aazenc:${name}:${edge} */`;

export function styleBlock(name: string, body: string): string {
  return `${marker(name, "begin")}\n${body.trim()}\n${marker(name, "end")}\n`;
}

export function hasStyle(css: string, name: string): boolean {
  return css.includes(marker(name, "begin"));
}

export function requiredStyles(
  registry: Registry,
  items: { css?: string[] }[],
): string[] {
  const wanted = new Set<string>();
  for (const item of items) {
    for (const name of item.css ?? []) wanted.add(name);
  }
  return [...wanted].sort();
}

/**
 * Replaces a marked block when the registry body has changed, otherwise
 * appends it. Returns the file text and which names changed.
 */
export function reconcileStyles(
  css: string,
  sheets: { name: string; body: string }[],
): { css: string; added: string[]; updated: string[] } {
  let next = css;
  const added: string[] = [];
  const updated: string[] = [];

  for (const { name, body } of sheets) {
    const block = styleBlock(name, body);
    const begin = marker(name, "begin");
    const end = marker(name, "end");
    const start = next.indexOf(begin);
    if (start !== -1) {
      const endAt = next.indexOf(end, start + begin.length);
      if (endAt === -1) {
        throw new Error(
          `Theme CSS has ${begin} without ${end}, so the stylesheet cannot be refreshed.`,
        );
      }
      const endOfMarker = endAt + end.length;
      const spanEnd = next[endOfMarker] === "\n" ? endOfMarker + 1 : endOfMarker;
      if (next.slice(start, spanEnd) === block) continue;
      next = `${next.slice(0, start)}${block}${next.slice(spanEnd)}`;
      updated.push(name);
      continue;
    }
    const separator = next.endsWith("\n") || next.length === 0 ? "\n" : "\n\n";
    next = next.length === 0 ? block : `${next}${separator}${block}`;
    added.push(name);
  }

  return { css: next, added, updated };
}

/**
 * Writes any missing or changed style block into the project's theme file and
 * says what it did. Throws rather than skipping when the file is absent or the
 * registry has no such sheet: a component that cannot render is worth failing
 * the install for.
 */
export function ensureStyles(
  cwd: string,
  config: AazencConfig,
  registry: Registry,
  required: string[],
): void {
  if (required.length === 0) return;

  const path = join(cwd, config.themeCss);
  if (!existsSync(path)) {
    throw new Error(
      `No ${config.themeCss} in this project, so there is nowhere to put stylesheet rules. Run \`aazenc-ui init\`, then retry.`,
    );
  }

  const current = readFileSync(path, "utf8");
  const sheets = required.map((name) => {
    const body = registry.styles[name];
    if (body === undefined) {
      throw new Error(
        `The registry has no "${name}" stylesheet, so this install would be unstyled. Rebuild @aazenc/cli.`,
      );
    }
    if (!hasStyle(current, name) && current.includes(`.${name}`)) {
      console.warn(
        `${config.themeCss} has .${name} rules that this CLI did not write. Appending the marked block anyway; the duplicate is harmless but you may want to delete the unmarked one.`,
      );
    }
    return { name, body };
  });

  const { css: next, added, updated } = reconcileStyles(current, sheets);
  if (added.length === 0 && updated.length === 0) return;
  writeFileSync(path, next);
  const notes = [
    ...added.map((name) => `added ${name} styles`),
    ...updated.map((name) => `updated ${name} styles`),
  ];
  console.log(`${notes.join(", ")} in ${config.themeCss}`);
}
