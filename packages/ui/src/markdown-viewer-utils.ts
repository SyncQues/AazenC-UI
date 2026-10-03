/**
 * Markdown parsing for the markdown viewer.
 *
 * The source is parsed into a node tree and the tree is rendered as React
 * elements. Nothing here builds an HTML string, so untrusted markdown — a model
 * response, a pasted comment, a README from a fork — cannot smuggle a tag
 * through this file. Raw HTML in the source stays literal text, and `safeHref`
 * drops the link targets that execute.
 *
 * Scope: the markdown a model and a person actually write. ATX headings,
 * paragraphs, fenced code, blockquotes, ordered/unordered/task lists, GFM
 * tables, thematic breaks, and the inline set (code, links, images, autolinks,
 * strong, emphasis, strikethrough, hard breaks, escapes). Setext headings,
 * reference-style links, footnotes, and HTML blocks are rendered as plain text.
 */

import {
  codeBlockLanguages,
  type CodeBlockLanguage,
} from "./code-block-highlight";

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type MarkdownInlineNode =
  | { kind: "text"; text: string }
  | { kind: "strong"; children: MarkdownInlineNode[] }
  | { kind: "emphasis"; children: MarkdownInlineNode[] }
  | { kind: "strike"; children: MarkdownInlineNode[] }
  | { kind: "code"; text: string }
  | {
      kind: "link";
      href: string;
      title?: string;
      children: MarkdownInlineNode[];
    }
  | { kind: "image"; src: string; alt: string; title?: string }
  | { kind: "break" };

export type MarkdownAlign = "left" | "center" | "right";

export type MarkdownListItem = {
  /** `null` when the item is a plain item, not a task item. */
  checked: boolean | null;
  blocks: MarkdownBlockNode[];
};

export type MarkdownBlockNode =
  | {
      kind: "heading";
      level: MarkdownHeadingLevel;
      id: string;
      children: MarkdownInlineNode[];
    }
  | { kind: "paragraph"; children: MarkdownInlineNode[] }
  | { kind: "code"; language: CodeBlockLanguage; code: string }
  | { kind: "list"; ordered: boolean; start: number; items: MarkdownListItem[] }
  | { kind: "quote"; children: MarkdownBlockNode[] }
  | {
      kind: "table";
      align: (MarkdownAlign | null)[];
      head: MarkdownInlineNode[][];
      rows: MarkdownInlineNode[][][];
    }
  | { kind: "rule" };

const HEADING = /^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;
const RULE = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const QUOTE = /^ {0,3}>[ \t]?(.*)$/;
const UNORDERED_ITEM = /^( *)([-*+])([ \t]+)(.*)$/;
const ORDERED_ITEM = /^( *)(\d{1,9})([.)])([ \t]+)(.*)$/;
const TASK_MARKER = /^\[([ xX])\][ \t]+(.*)$/;
const TABLE_DIVIDER =
  /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const AUTOLINK = /^<((?:https?:\/\/|mailto:)[^<>\s]+)>/;
const ESCAPABLE = /[\\`*_{}[\]()#+\-.!>~|"']/;
/** Schemes that run code when a link is followed. `data:` is judged per use. */
const UNSAFE_SCHEMES = new Set([
  "javascript",
  "vbscript",
  "file",
  "about",
  "blob",
]);
const SAFE_IMAGE_DATA = /^data:image\/(?:png|jpe?g|gif|webp|avif);/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
};

const CODE_LANGUAGE_ALIASES: Record<string, CodeBlockLanguage> = {
  ts: "ts",
  typescript: "ts",
  js: "js",
  javascript: "js",
  node: "js",
  jsx: "jsx",
  tsx: "tsx",
  sh: "bash",
  shell: "bash",
  bash: "bash",
  zsh: "bash",
  console: "bash",
  json: "json",
  jsonc: "json",
  yaml: "json",
  yml: "json",
  css: "css",
  scss: "css",
};

/**
 * Parses markdown source into blocks. Heading ids are unique within one call, so
 * two "## Usage" sections both stay linkable.
 */
export function parseMarkdown(source: string): MarkdownBlockNode[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  return parseBlocks(lines);
}

function parseBlocks(lines: string[]): MarkdownBlockNode[] {
  const blocks: MarkdownBlockNode[] = [];
  const usedIds = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1] ?? "```";
      const body: string[] = [];
      let cursor = index + 1;
      while (
        cursor < lines.length &&
        !closesFence(lines[cursor] ?? "", marker)
      ) {
        body.push(lines[cursor] ?? "");
        cursor += 1;
      }
      blocks.push({
        kind: "code",
        language: normalizeCodeLanguage(fence[2] ?? ""),
        code: body.join("\n"),
      });
      index = cursor < lines.length ? cursor + 1 : cursor;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = (heading[1] ?? "#").length as MarkdownHeadingLevel;
      const children = parseInline((heading[2] ?? "").trim());
      blocks.push({
        kind: "heading",
        level,
        children,
        id: uniqueId(usedIds, inlineToText(children)),
      });
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: "rule" });
      index += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length) {
        const current = lines[index] ?? "";
        const stripped = QUOTE.exec(current);
        if (stripped) {
          quoted.push(stripped[1] ?? "");
          index += 1;
          continue;
        }
        // A plain line under a quote belongs to it, until a blank line or a new block.
        if (current.trim() === "" || startsNewBlock(current)) break;
        quoted.push(current);
        index += 1;
      }
      blocks.push({ kind: "quote", children: parseBlocks(quoted) });
      continue;
    }

    const table = readTable(lines, index);
    if (table) {
      blocks.push(table.node);
      index = table.next;
      continue;
    }

    const list = readList(lines, index);
    if (list) {
      blocks.push(list.node);
      index = list.next;
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (current.trim() === "" || startsNewBlock(current)) break;
      paragraph.push(current);
      index += 1;
    }
    if (paragraph.length > 0) {
      blocks.push({
        kind: "paragraph",
        children: parseInline(paragraph.join("\n")),
      });
    }
  }

  return blocks;
}

/** A line that opens a block, so a paragraph stops before it. */
function startsNewBlock(line: string): boolean {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    UNORDERED_ITEM.test(line) ||
    ORDERED_ITEM.test(line) ||
    TABLE_DIVIDER.test(line)
  );
}

/** A closing fence is at least as long as the opening one and uses the same char. */
function closesFence(line: string, marker: string): boolean {
  const trimmed = line.trim();
  const char = marker[0] ?? "`";
  if (trimmed.length < marker.length) return false;
  return trimmed === char.repeat(trimmed.length);
}

function readTable(
  lines: string[],
  from: number,
): { node: MarkdownBlockNode & { kind: "table" }; next: number } | null {
  const headerLine = lines[from] ?? "";
  const dividerLine = lines[from + 1];
  if (
    !headerLine.includes("|") ||
    dividerLine === undefined ||
    !TABLE_DIVIDER.test(dividerLine)
  ) {
    return null;
  }

  const head = splitRow(headerLine).map((cell) => parseInline(cell));
  const align = splitRow(dividerLine).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center" as const;
    if (right) return "right" as const;
    if (left) return "left" as const;
    return null;
  });

  const rows: MarkdownInlineNode[][][] = [];
  let index = from + 2;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "" || !line.includes("|")) break;
    rows.push(splitRow(line).map((cell) => parseInline(cell)));
    index += 1;
  }

  // A short row is padded to the header, so every row keeps the same columns.
  const width = Math.max(head.length, ...rows.map((row) => row.length), 0);
  const pad = (cells: MarkdownInlineNode[][]) => [
    ...cells,
    ...Array.from({ length: width - cells.length }, () => []),
  ];

  return {
    node: { kind: "table", align, head: pad(head), rows: rows.map(pad) },
    next: index,
  };
}

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let index = 0;

  if (line.trimStart().startsWith("|")) index = line.indexOf("|") + 1;
  while (index < line.length) {
    const char = line[index] ?? "";
    if (char === "\\" && line[index + 1] === "|") {
      current += "|";
      index += 2;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      index += 1;
      continue;
    }
    current += char;
    index += 1;
  }
  if (current.trim() !== "" || cells.length === 0) cells.push(current.trim());
  // A row can be shorter than the header; pad so every row renders every column.
  return cells;
}

type ListItemMatch = {
  indent: number;
  ordered: boolean;
  number: number;
  /** Column where the item text starts, so continuation lines can be dedented. */
  contentIndent: number;
  content: string;
};

function matchListItem(line: string): ListItemMatch | null {
  const unordered = UNORDERED_ITEM.exec(line);
  if (unordered) {
    return {
      indent: (unordered[1] ?? "").length,
      ordered: false,
      number: 1,
      contentIndent:
        (unordered[1] ?? "").length +
        (unordered[2] ?? "").length +
        (unordered[3] ?? "").length,
      content: unordered[4] ?? "",
    };
  }
  const ordered = ORDERED_ITEM.exec(line);
  if (ordered) {
    return {
      indent: (ordered[1] ?? "").length,
      ordered: true,
      number: Number(ordered[2] ?? 1),
      contentIndent:
        (ordered[1] ?? "").length +
        (ordered[2] ?? "").length +
        (ordered[3] ?? "").length +
        (ordered[4] ?? "").length,
      content: ordered[5] ?? "",
    };
  }
  return null;
}

function readList(
  lines: string[],
  from: number,
): { node: MarkdownBlockNode & { kind: "list" }; next: number } | null {
  const first = matchListItem(lines[from] ?? "");
  if (!first) return null;

  const baseIndent = first.indent;
  const ordered = first.ordered;
  const start = first.number;
  const items: MarkdownListItem[] = [];
  let index = from;
  let blanks = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      blanks += 1;
      index += 1;
      continue;
    }

    const match = matchListItem(line);
    if (!match || match.indent !== baseIndent || match.ordered !== ordered)
      break;
    // Two blank lines end a list, and so does a marker of the other kind at this level.
    if (blanks > 1) break;

    const itemLines: string[] = [match.content];
    index += 1;
    blanks = 0;

    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (current.trim() === "") {
        blanks += 1;
        itemLines.push("");
        index += 1;
        continue;
      }

      const indent = current.length - current.trimStart().length;
      if (indent >= match.contentIndent) {
        itemLines.push(current.slice(match.contentIndent));
        blanks = 0;
        index += 1;
        continue;
      }

      // A nested marker indented less than the content still belongs to this item.
      const nested = matchListItem(current);
      if (
        nested &&
        nested.indent > baseIndent &&
        nested.indent < match.contentIndent
      ) {
        itemLines.push(current.slice(nested.indent));
        blanks = 0;
        index += 1;
        continue;
      }

      // A lazy line continues the paragraph in the item, and only that.
      if (blanks === 0 && !nested && !startsNewBlock(current)) {
        itemLines.push(current.trimStart());
        index += 1;
        continue;
      }
      break;
    }

    while (itemLines.length > 0 && itemLines[itemLines.length - 1] === "")
      itemLines.pop();

    const task = TASK_MARKER.exec(itemLines[0] ?? "");
    items.push({
      checked: task ? task[1] !== " " : null,
      blocks: parseBlocks(
        task ? [task[2] ?? "", ...itemLines.slice(1)] : itemLines,
      ),
    });
  }

  if (items.length === 0) return null;
  return { node: { kind: "list", ordered, start, items }, next: index };
}

function uniqueId(used: Map<string, number>, text: string): string {
  const base = slugifyHeading(text);
  const seen = used.get(base) ?? 0;
  used.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen}`;
}

/** "Install the CLI" becomes "install-the-cli". Empty text still gets an id. */
export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return slug === "" ? "section" : slug;
}

/** Flattens inline nodes back to their text, for ids and for reading the source. */
export function inlineToText(nodes: MarkdownInlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "text":
        case "code":
          return node.text;
        case "image":
          return node.alt;
        case "break":
          return " ";
        default:
          return inlineToText(node.children);
      }
    })
    .join("");
}

function parseInline(source: string): MarkdownInlineNode[] {
  const nodes: MarkdownInlineNode[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (buffer === "") return;
    nodes.push({ kind: "text", text: decodeEntities(buffer) });
    buffer = "";
  };

  while (index < source.length) {
    const char = source[index] ?? "";

    if (char === "\\") {
      const next = source[index + 1];
      if (next === "\n") {
        flush();
        nodes.push({ kind: "break" });
        index += 2;
        continue;
      }
      if (next !== undefined && ESCAPABLE.test(next)) {
        // Its own node, so `&amp;` in an escape is not decoded afterwards.
        flush();
        nodes.push({ kind: "text", text: next });
        index += 2;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "\n") {
      const hard = /\s{2,}$/.test(buffer);
      buffer = buffer.replace(/\s+$/, "");
      flush();
      if (!hard) buffer = " ";
      else nodes.push({ kind: "break" });
      index += 1;
      continue;
    }

    if (char === "`") {
      const span = readCodeSpan(source, index);
      if (span) {
        flush();
        nodes.push({ kind: "code", text: span.text });
        index = span.next;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "<") {
      const auto = AUTOLINK.exec(source.slice(index));
      if (auto) {
        flush();
        nodes.push({
          kind: "link",
          href: auto[1] ?? "",
          children: [{ kind: "text", text: auto[1] ?? "" }],
        });
        index += auto[0].length;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "!" && source[index + 1] === "[") {
      const image = readLinkLike(source, index + 1, true);
      if (image) {
        flush();
        nodes.push({
          kind: "image",
          src: image.href,
          alt: image.alt,
          ...(image.title ? { title: image.title } : {}),
        });
        index = image.next;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "[") {
      const link = readLinkLike(source, index, false);
      if (link) {
        flush();
        nodes.push({
          kind: "link",
          href: link.href,
          children: parseInline(link.label),
          ...(link.title ? { title: link.title } : {}),
        });
        index = link.next;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "~" && source[index + 1] === "~") {
      const close = findClosingRun(source, index + 2, "~", 2);
      if (close > 0 && source[index + 2] !== "~" && source[close + 2] !== "~") {
        flush();
        nodes.push({
          kind: "strike",
          children: parseInline(source.slice(index + 2, close)),
        });
        index = close + 2;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    if (char === "*" || char === "_") {
      const width = source[index + 1] === char ? 2 : 1;
      if (width === 2 && char === "_" && source[index + 2] === "_") {
        buffer += char;
        index += 1;
        continue;
      }
      const close = findClosingRun(source, index + width, char, width);
      const inner = close > 0 ? source.slice(index + width, close) : "";
      const opensCleanly = char === "*" || !isWordCharacter(source[index - 1]);
      const closesCleanly =
        char === "*" || !isWordCharacter(source[close + width]);
      if (
        close > 0 &&
        inner !== "" &&
        !/^\s|\s$/.test(inner) &&
        opensCleanly &&
        closesCleanly
      ) {
        flush();
        nodes.push({
          kind: width === 2 ? "strong" : "emphasis",
          children: parseInline(inner),
        });
        index = close + width;
        continue;
      }
      buffer += char;
      index += 1;
      continue;
    }

    buffer += char;
    index += 1;
  }

  flush();
  return nodes;
}

function readCodeSpan(
  source: string,
  start: number,
): { text: string; next: number } | null {
  let width = 0;
  while (source[start + width] === "`") width += 1;
  const marker = "`".repeat(width);
  const close = source.indexOf(marker, start + width);
  if (close < 0 || source[close + width] === "`") return null;

  let text = source.slice(start + width, close).replace(/\n/g, " ");
  // CommonMark strips one space on each side, so `` ` `` can hold a backtick.
  if (
    text.length > 2 &&
    text.startsWith(" ") &&
    text.endsWith(" ") &&
    text.trim() !== ""
  ) {
    text = text.slice(1, -1);
  }
  return { text, next: close + width };
}

function readLinkLike(
  source: string,
  bracketStart: number,
  isImage: boolean,
): {
  href: string;
  label: string;
  alt: string;
  title?: string;
  next: number;
} | null {
  const labelEnd = matchBracket(source, bracketStart);
  if (labelEnd < 0) return null;
  if (source[labelEnd + 1] !== "(") return null;

  const destEnd = matchParen(source, labelEnd + 1);
  if (destEnd < 0) return null;

  const label = source.slice(bracketStart + 1, labelEnd);
  const destination = source.slice(labelEnd + 2, destEnd).trim();
  const titled = /^(\S*)[ \t]+(?:"([^"]*)"|'([^']*)')$/.exec(destination);
  const href = titled ? (titled[1] ?? "") : destination;
  const title = titled ? (titled[2] ?? titled[3] ?? undefined) : undefined;

  return {
    href,
    label,
    alt: isImage ? decodeEntities(label.replace(/[*_`~]/g, "")) : "",
    ...(title ? { title } : {}),
    next: destEnd + 1,
  };
}

function matchBracket(source: string, start: number): number {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function matchParen(source: string, start: number): number {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

/**
 * Finds the closing emphasis run. A code span in between is skipped, so a `*`
 * inside backticks cannot close the run.
 */
function findClosingRun(
  source: string,
  from: number,
  char: string,
  width: number,
): number {
  const marker = char.repeat(width);
  for (let index = from; index <= source.length - width; index += 1) {
    if (source[index] === "\\") {
      index += 1;
      continue;
    }
    if (source[index] === "`") {
      let ticks = 0;
      while (source[index + ticks] === "`") ticks += 1;
      const close = source.indexOf("`".repeat(ticks), index + ticks);
      if (close > 0) {
        index = close + ticks - 1;
        continue;
      }
    }
    if (source.startsWith(marker, index)) return index;
  }
  return -1;
}

function isWordCharacter(char: string | undefined): boolean {
  return char !== undefined && /[\p{Letter}\p{Number}]/u.test(char);
}

function decodeEntities(text: string): string {
  if (!text.includes("&")) return text;
  return text.replace(
    /&(#\d+|#x[0-9a-f]+|[a-z]+);/gi,
    (match, body: string) => {
      if (body.startsWith("#x") || body.startsWith("#X")) {
        const code = Number.parseInt(body.slice(2), 16);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      if (body.startsWith("#")) {
        const code = Number.parseInt(body.slice(1), 10);
        return code > 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : match;
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    },
  );
}

/** Fence info strings are written every way, so they get a small alias table. */
export function normalizeCodeLanguage(language: string): CodeBlockLanguage {
  const name =
    language
      .trim()
      .split(/[\s:;{]/)[0]
      ?.toLowerCase() ?? "";
  const alias = CODE_LANGUAGE_ALIASES[name];
  if (alias) return alias;
  return (codeBlockLanguages as readonly string[]).includes(name)
    ? (name as CodeBlockLanguage)
    : "text";
}

/**
 * `null` means "do not render this as a link". A viewer shows untrusted source,
 * so the schemes that execute are dropped and the rest is passed through.
 */
export function safeHref(href: string): string | null {
  const value = href.trim();
  if (value === "") return null;
  const scheme = schemeOf(value);
  if (UNSAFE_SCHEMES.has(scheme) || scheme === "data") return null;
  return value;
}

/** Images keep the raster `data:` forms, because those cannot carry script. */
export function safeImageSrc(src: string): string | null {
  const value = src.trim();
  if (value === "") return null;
  const scheme = schemeOf(value);
  if (UNSAFE_SCHEMES.has(scheme)) return null;
  if (scheme === "data") return SAFE_IMAGE_DATA.test(value) ? value : null;
  return value;
}

/** True for a link that leaves the app, so it can get `rel="noopener"`. */
export function isExternalHref(href: string): boolean {
  const scheme = schemeOf(href.trim());
  return scheme !== "" && !UNSAFE_SCHEMES.has(scheme);
}

/**
 * The scheme of a url, lowercased, with the noise a browser ignores removed.
 * A viewer has to ignore it too: `java<TAB>script:alert(1)` is a live target, and
 * so is every other spelling of it that survives a human reading the source.
 */
function schemeOf(value: string): string {
  // C0 controls, space, and DEL go. A browser drops them before it reads a
  // scheme, so `java<TAB>script:` is the same target as `javascript:`.
  let readable = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code > 0x20 && code !== 0x7f) readable += char;
  }
  return /^([a-z][a-z0-9+.-]*):/.exec(readable.toLowerCase())?.[1] ?? "";
}
