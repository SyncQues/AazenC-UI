import assert from "node:assert/strict";
import test from "node:test";
import { highlightCode, type CodeToken } from "../code-block-highlight.ts";
import {
  codeBlockFrameClass,
  codeBlockGutterClass,
  codeBlockLineClass,
  codeBlockPreClass,
  codeBlockTokenClass,
} from "../code-block-variants.ts";

function textOf(lines: CodeToken[][]) {
  return lines
    .map((line) => line.map((token) => token.text).join(""))
    .join("\n");
}

function kinds(line: CodeToken[] | undefined, kind: CodeToken["kind"]) {
  return (line ?? [])
    .filter((token) => token.kind === kind)
    .map((token) => token.text);
}

test("code block is one bordered monospace frame", () => {
  assert.match(codeBlockFrameClass, /rounded-lg/);
  assert.match(codeBlockFrameClass, /border-border/);
  assert.match(codeBlockFrameClass, /bg-background/);
  assert.doesNotMatch(codeBlockFrameClass, /shadow-xl|backdrop-blur/);
  assert.match(codeBlockPreClass, /font-mono/);
  assert.match(codeBlockPreClass, /overflow-auto/);
  assert.match(codeBlockGutterClass, /text-muted-foreground/);
  assert.match(codeBlockTokenClass.keyword, /text-primary/);
  assert.match(codeBlockTokenClass.comment, /text-muted-foreground/);
});

test("blank source lines keep the line box height", () => {
  assert.match(codeBlockPreClass, /leading-6/);
  assert.match(codeBlockLineClass, /block/);
  assert.match(codeBlockLineClass, /whitespace-pre/);
  // An empty line has no in-flow content, so the row must supply its own height.
  assert.match(codeBlockLineClass, /min-h-6/);

  const source = "const a = 1;\n\nconst b = 2;";
  const lines = highlightCode(source, "ts");
  assert.equal(lines.length, 3);
  assert.deepEqual(lines[1], [{ kind: "plain", text: "" }]);
  assert.equal(textOf(lines), source);
});

test("tsx highlighting keeps the source and marks structure", () => {
  const source = [
    'import { Button } from "@aazenc/ui/button"',
    "",
    "export function Example() {",
    "  // save the draft",
    '  return <Button type="button">Continue</Button>',
    "}",
  ].join("\n");

  const lines = highlightCode(source, "tsx");
  assert.equal(textOf(lines), source);
  assert.deepEqual(kinds(lines[0], "keyword"), ["import", "from"]);
  assert.deepEqual(kinds(lines[0], "string"), ['"@aazenc/ui/button"']);
  assert.deepEqual(kinds(lines[3], "comment"), ["// save the draft"]);
  assert.ok(kinds(lines[4], "tag").includes("Button"));
  assert.ok(kinds(lines[4], "attr").includes("type"));
  assert.ok(kinds(lines[4], "string").includes('"button"'));
});

test("a type argument is not painted as a jsx tag", () => {
  const lines = highlightCode("const day = useState<Date | null>(null)", "tsx");
  assert.equal(textOf(lines), "const day = useState<Date | null>(null)");
  assert.deepEqual(kinds(lines[0], "tag"), []);
  assert.ok(kinds(lines[0], "keyword").includes("const"));
  assert.ok(kinds(lines[0], "keyword").includes("null"));
});

test("a block comment can cross lines, and a trailing newline is dropped", () => {
  const lines = highlightCode("/*\nnote\n*/\n", "ts");
  assert.equal(lines.length, 3);
  assert.ok(
    lines.every((line) =>
      line.every((token) => token.kind === "comment" || token.text === ""),
    ),
  );
  assert.equal(textOf(lines), "/*\nnote\n*/");
});

test("bash, json, and css use their own tones", () => {
  const shell = highlightCode(
    "npx cli add button -y\n# installs the button",
    "bash",
  );
  assert.deepEqual(kinds(shell[0], "attr"), ["-y"]);
  assert.deepEqual(kinds(shell[1], "comment"), ["# installs the button"]);

  const json = highlightCode('{ "ok": true, "count": 2 }', "json");
  assert.ok(kinds(json[0], "string").includes('"ok"'));
  assert.ok(kinds(json[0], "keyword").includes("true"));
  assert.ok(kinds(json[0], "number").includes("2"));

  const css = highlightCode("button { color: red; }", "css");
  assert.ok(kinds(css[0], "attr").includes("color"));
});

test("an empty snippet is one blank line", () => {
  assert.deepEqual(highlightCode("", "text"), [[{ kind: "plain", text: "" }]]);
});
