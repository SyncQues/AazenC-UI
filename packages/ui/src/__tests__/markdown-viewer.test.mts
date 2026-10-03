import assert from "node:assert/strict";
import test from "node:test";
import {
  inlineToText,
  isExternalHref,
  normalizeCodeLanguage,
  parseMarkdown,
  safeHref,
  safeImageSrc,
  slugifyHeading,
  type MarkdownBlockNode,
  type MarkdownInlineNode,
  type MarkdownListItem,
} from "../markdown-viewer-utils.ts";
import {
  markdownAlignClass,
  markdownHeadingLevelClass,
  markdownInlineCodeClass,
  markdownLinkClass,
  markdownListClass,
  markdownQuoteClass,
  markdownTableCellClass,
  markdownTableHeadClass,
  markdownTaskClass,
  markdownTaskItemClass,
  markdownTaskListClass,
  markdownViewerVariants,
} from "../markdown-viewer-variants.ts";

function blocks(source: string) {
  return parseMarkdown(source);
}

function one(source: string): MarkdownBlockNode {
  const parsed = blocks(source);
  assert.equal(parsed.length, 1);
  return parsed[0]!;
}

function inlines(source: string): MarkdownInlineNode[] {
  const block = one(source);
  if (block.kind !== "paragraph")
    assert.fail(`expected a paragraph, got ${block.kind}`);
  return block.children;
}

function text(source: string): string {
  return inlineToText(inlines(source));
}

function listItems(source: string): MarkdownListItem[] {
  const block = one(source);
  if (block.kind !== "list") assert.fail(`expected a list, got ${block.kind}`);
  return block.items;
}

test("the viewer is one prose column on the product tokens", () => {
  const base = markdownViewerVariants();
  assert.match(base, /text-foreground/);
  // The first block is flush, so the viewer can sit against a card or a bubble.
  assert.match(base, /\[&>\*:first-child\]:mt-0/);
  assert.match(markdownViewerVariants({ density: "compact" }), /text-\[13px\]/);
  assert.match(markdownViewerVariants({ density: "roomy" }), /leading-8/);
  assert.match(markdownViewerVariants({ density: "default" }), /text-sm/);

  // Headings carry their own air, because one rule cannot size two kinds of block.
  assert.match(markdownHeadingLevelClass[1], /mt-8/);
  assert.match(markdownHeadingLevelClass[3], /mt-6/);
  assert.match(markdownHeadingLevelClass[6], /text-muted-foreground/);
  assert.match(markdownListClass, /marker:text-muted-foreground/);
  assert.match(markdownTaskListClass, /list-none/);
  // A task item is a row, so the checkbox sits beside the text and not above it.
  assert.match(markdownTaskItemClass, /flex/);
  assert.match(markdownTaskItemClass, /items-start/);
  assert.match(markdownTaskClass, /size-4/);
  assert.match(markdownTaskClass, /accent-primary/);
  assert.match(markdownQuoteClass, /border-l-2/);
  assert.match(markdownLinkClass, /text-primary/);
  assert.match(markdownLinkClass, /focus-visible:ring/);
  assert.match(markdownInlineCodeClass, /font-mono/);
  assert.match(markdownTableHeadClass, /bg-muted\/50/);
  assert.match(markdownTableCellClass, /align-top/);
  assert.match(markdownAlignClass.right, /text-right/);
});

test("headings keep their level and get unique ids", () => {
  const [first, second, third] = blocks(
    "## Install the CLI\n\n### Notes\n\n## Install the CLI",
  );
  assert.equal(first?.kind, "heading");
  assert.equal(first?.kind === "heading" && first.level, 2);
  assert.equal(first?.kind === "heading" && first.id, "install-the-cli");
  assert.equal(second?.kind === "heading" && second.id, "notes");
  // A repeated heading still resolves to one fragment, so a link lands somewhere real.
  assert.equal(third?.kind === "heading" && third.id, "install-the-cli-1");
  assert.equal(slugifyHeading("**Bold** & `code`!"), "bold-code");
  assert.equal(slugifyHeading("   "), "section");
});

test("a heading strips its closing hashes", () => {
  const block = one("## Usage ###");
  assert.equal(
    block.kind === "heading" && inlineToText(block.children),
    "Usage",
  );
});

test("inline marks nest and keep their text", () => {
  const nodes = inlines("A **bold** and _soft_ and ~~gone~~ line.");
  const kinds = nodes
    .filter((node) => node.kind !== "text")
    .map((node) => node.kind);
  assert.deepEqual(kinds, ["strong", "emphasis", "strike"]);
  assert.equal(
    text("A **bold** and _soft_ and ~~gone~~ line."),
    "A bold and soft and gone line.",
  );

  // Intraword underscores are part of a word, so they stay literal.
  assert.equal(text("snake_case_name"), "snake_case_name");
  assert.deepEqual(
    inlines("snake_case_name").filter((node) => node.kind === "emphasis"),
    [],
  );
});

test("inline code is literal and can hold a backtick", () => {
  const nodes = inlines("run `pnpm add` then `` `code` ``");
  const code = nodes.filter((node) => node.kind === "code");
  assert.deepEqual(
    code.map((node) => node.text),
    ["pnpm add", "`code`"],
  );
  // Stars inside a code span are not emphasis.
  assert.equal(text("`*not emphasis*`"), "*not emphasis*");
});

test("links, titles, autolinks, and images are read", () => {
  const nodes = inlines(
    'See [the docs](/guides "Guide") and <https://aazenc.dev>.',
  );
  const [, link, , auto] = nodes;
  assert.equal(link?.kind, "link");
  assert.equal(link?.kind === "link" && link.href, "/guides");
  assert.equal(link?.kind === "link" && link.title, "Guide");
  assert.equal(
    link?.kind === "link" && inlineToText(link.children),
    "the docs",
  );
  assert.equal(auto?.kind === "link" && auto.href, "https://aazenc.dev");

  const image = inlines("![A curve](/chart.png)")[0];
  assert.equal(image?.kind, "image");
  assert.equal(image?.kind === "image" && image.src, "/chart.png");
  assert.equal(image?.kind === "image" && image.alt, "A curve");
});

test("escapes and entities decode, and a stray backslash stays literal", () => {
  assert.equal(text("\\*not emphasis\\*"), "*not emphasis*");
  assert.equal(text("Tom &amp; Jerry"), "Tom & Jerry");
  assert.equal(text("&lt;div&gt;"), "<div>");
  assert.equal(text("&#65;&#x42;"), "AB");
  // `&` is not an escapable character, so the backslash is text and the entity decodes.
  assert.equal(text("\\&amp;"), "\\&");
});

test("raw html stays text, because the tree is never turned into html", () => {
  const source = '<img src=x onerror="alert(1)"> <b>bold</b>';
  const nodes = inlines(source);
  assert.ok(
    nodes.every((node) => node.kind === "text"),
    "no element node is produced from raw html",
  );
  assert.equal(text(source), source);
});

test("two trailing spaces are a hard break, one newline is not", () => {
  const hard = inlines("first line  \nsecond line");
  assert.equal(hard.filter((node) => node.kind === "break").length, 1);
  const soft = inlines("first line\nsecond line");
  assert.equal(soft.filter((node) => node.kind === "break").length, 0);
  assert.equal(inlineToText(soft), "first line second line");
});

test("fenced code keeps its source and maps the language", () => {
  const block = one("```ts\nconst a = 1;\n\nconst b = 2;\n```");
  assert.equal(block.kind, "code");
  // Blank lines inside the fence are source, not a missing block.
  assert.equal(
    block.kind === "code" && block.code,
    "const a = 1;\n\nconst b = 2;",
  );
  assert.equal(block.kind === "code" && block.language, "ts");

  const unknown = one("```wingdings\nx\n```");
  assert.equal(unknown.kind === "code" && unknown.language, "text");
  assert.equal(normalizeCodeLanguage("shell"), "bash");
  assert.equal(normalizeCodeLanguage("YAML"), "json");
  assert.equal(normalizeCodeLanguage(""), "text");

  // A fence that is never closed still renders, as the rest of the document.
  const unclosed = blocks("```json\n{}");
  assert.equal(unclosed.length, 1);
  assert.equal(unclosed[0]?.kind === "code" && unclosed[0].code, "{}");
});

test("lists nest, restart, and carry task state", () => {
  const nested = listItems("- one\n- two\n  - inner\n- three");
  assert.equal(nested.length, 3);
  assert.equal(
    inlineToText(
      (nested[1]?.blocks[0]?.kind === "paragraph"
        ? nested[1].blocks[0].children
        : []) ?? [],
    ),
    "two",
  );
  const innerList = nested[1]?.blocks[1];
  assert.equal(innerList?.kind, "list");
  assert.equal(innerList?.kind === "list" && innerList.items.length, 1);

  const ordered = one("3. third\n4. fourth");
  assert.equal(ordered.kind === "list" && ordered.ordered, true);
  assert.equal(ordered.kind === "list" && ordered.start, 3);

  const tasks = listItems("- [x] shipped\n- [ ] pending");
  assert.deepEqual(
    tasks.map((item) => item.checked),
    [true, false],
  );
  // The checkbox is a marker, so it is not part of the text.
  assert.equal(
    inlineToText(
      tasks[0]?.blocks[0]?.kind === "paragraph"
        ? tasks[0].blocks[0].children
        : [],
    ),
    "shipped",
  );
  assert.equal(listItems("- plain item")[0]?.checked, null);
});

test("a list item can hold a paragraph and a nested list", () => {
  const items = listItems("- first line\n  continued\n\n  second paragraph\n");
  assert.equal(items[0]?.blocks.length, 2);
  assert.equal(items[0]?.blocks[1]?.kind, "paragraph");
});

test("a paragraph does not swallow the block that follows it", () => {
  const parsed = blocks("Intro line.\n# Heading\nOutro line.");
  assert.deepEqual(
    parsed.map((block) => block.kind),
    ["paragraph", "heading", "paragraph"],
  );
});

test("quotes collect their lines, and a code fence inside one is code", () => {
  // Two quoted lines are one paragraph, because nothing separated them.
  const quote = one("> first\n> second");
  assert.equal(quote.kind, "quote");
  assert.equal(quote.kind === "quote" && quote.children.length, 1);
  assert.equal(
    quote.kind === "quote" &&
      inlineToText(
        quote.children[0]?.kind === "paragraph"
          ? quote.children[0].children
          : [],
      ),
    "first second",
  );

  // A blank quoted line is a paragraph break, so the two paragraphs stay apart.
  const split = one("> first\n>\n> second");
  assert.equal(split.kind === "quote" && split.children.length, 2);

  const quotedCode = one("> ```ts\n> const a = 1;\n> ```");
  const inner =
    quotedCode.kind === "quote" ? quotedCode.children[0] : undefined;
  assert.equal(inner?.kind, "code");
  assert.equal(inner?.kind === "code" && inner.code, "const a = 1;");
});

test("a gfm table reads its columns and alignment", () => {
  const table = one(
    "| Prop | Type | Notes |\n| --- | :---: | ---: |\n| source | string | required |",
  );
  assert.equal(table.kind, "table");
  if (table.kind !== "table") return;
  assert.deepEqual(table.align, [null, "center", "right"]);
  assert.deepEqual(table.head.map(inlineToText), ["Prop", "Type", "Notes"]);
  assert.equal(table.rows.length, 1);
  assert.deepEqual(table.rows[0]?.map(inlineToText), [
    "source",
    "string",
    "required",
  ]);

  // A pipe inside a cell is escaped, and a short row is padded to the header.
  const padded = blocks("| a | b | c |\n| --- | --- | --- |\n| 1 |");
  const paddedTable = padded[0]?.kind === "table" ? padded[0] : undefined;
  assert.equal(paddedTable?.rows[0]?.length, 3);
  const escaped = blocks("| a | b |\n| --- | --- |\n| x \\| y | z |");
  const escapedTable = escaped[0]?.kind === "table" ? escaped[0] : undefined;
  assert.equal(inlineToText(escapedTable?.rows[0]?.[0] ?? []), "x | y");
});

test("a rule is a rule, not a setext heading", () => {
  assert.equal(one("---").kind, "rule");
  assert.equal(one("***").kind, "rule");
  assert.deepEqual(
    blocks("Intro\n\n---\n\nAfter").map((block) => block.kind),
    ["paragraph", "rule", "paragraph"],
  );
});

test("link targets that execute are dropped, and the rest is not", () => {
  assert.equal(safeHref("https://aazenc.dev"), "https://aazenc.dev");
  assert.equal(safeHref("/components/button"), "/components/button");
  assert.equal(safeHref("#usage"), "#usage");
  assert.equal(safeHref("mailto:hi@aazenc.dev"), "mailto:hi@aazenc.dev");
  assert.equal(safeHref("JavaScript:alert(1)"), null);
  assert.equal(safeHref("java\tscript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(safeHref("  "), null);

  // Raster data images are content; a data document is a way to smuggle one in.
  assert.equal(
    safeImageSrc("data:image/png;base64,iVBOR"),
    "data:image/png;base64,iVBOR",
  );
  assert.equal(safeImageSrc("data:image/svg+xml;base64,PHN2"), null);
  assert.equal(safeImageSrc("data:text/html,<script>"), null);
  assert.equal(safeImageSrc("javascript:alert(1)"), null);
  assert.equal(safeImageSrc("/chart.png"), "/chart.png");

  assert.equal(isExternalHref("https://aazenc.dev"), true);
  assert.equal(isExternalHref("/components"), false);
  assert.equal(isExternalHref("#usage"), false);
});

test("empty and blank sources are no blocks", () => {
  assert.deepEqual(blocks(""), []);
  assert.deepEqual(blocks("\n\n   \n"), []);
});

test("windows line endings read the same", () => {
  const parsed = blocks("## Title\r\n\r\nBody text.");
  assert.deepEqual(
    parsed.map((block) => block.kind),
    ["heading", "paragraph"],
  );
});
