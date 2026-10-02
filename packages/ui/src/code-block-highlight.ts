/**
 * Small highlighter for the code block.
 * Keywords, strings, comments, and JSX tags get a tone.
 * The text of every line is preserved, including spaces.
 */

export const codeBlockLanguages = [
  "tsx",
  "ts",
  "jsx",
  "js",
  "bash",
  "json",
  "css",
  "text",
] as const;

export type CodeBlockLanguage = (typeof codeBlockLanguages)[number];

export type CodeTokenKind =
  "plain" | "comment" | "string" | "keyword" | "tag" | "attr" | "number";

export type CodeToken = {
  kind: CodeTokenKind;
  text: string;
};

const KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "return",
  "switch",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "while",
]);

function isIdentStart(char: string) {
  return /[A-Za-z_$]/.test(char);
}

function isIdent(char: string) {
  return /[A-Za-z0-9_$]/.test(char);
}

function pushToken(tokens: CodeToken[], kind: CodeTokenKind, text: string) {
  if (text.length === 0) return;
  const last = tokens[tokens.length - 1];
  if (last && last.kind === kind) {
    last.text += text;
    return;
  }
  tokens.push({ kind, text });
}

function finish(tokens: CodeToken[]) {
  if (tokens.length === 0) tokens.push({ kind: "plain", text: "" });
  return tokens;
}

function scanString(line: string, start: number) {
  const quote = line[start];
  let index = start + 1;
  while (index < line.length) {
    if (line[index] === "\\") {
      index += 2;
      continue;
    }
    if (line[index] === quote) return index + 1;
    index += 1;
  }
  return line.length;
}

function canStartTag(line: string, index: number) {
  const next = line[index + 1];
  if (next === undefined || !/[A-Za-z/!]/.test(next)) return false;
  if (next === "/") return true;

  let cursor = index - 1;
  while (cursor >= 0 && line[cursor] === " ") cursor -= 1;
  if (cursor < 0 || !isIdent(line[cursor] ?? "")) return true;

  const end = cursor + 1;
  while (cursor >= 0 && isIdent(line[cursor] ?? "")) cursor -= 1;
  return KEYWORDS.has(line.slice(cursor + 1, end));
}

function highlightScript(code: string, jsx: boolean): CodeToken[][] {
  let block = false;
  return code.split("\n").map((line) => {
    const tokens: CodeToken[] = [];
    let index = 0;

    while (index < line.length) {
      const char = line[index] ?? "";
      const next = line[index + 1];

      if (block) {
        const end = line.indexOf("*/", index);
        if (end === -1) {
          pushToken(tokens, "comment", line.slice(index));
          index = line.length;
        } else {
          pushToken(tokens, "comment", line.slice(index, end + 2));
          index = end + 2;
          block = false;
        }
        continue;
      }

      if (char === "/" && next === "/") {
        pushToken(tokens, "comment", line.slice(index));
        break;
      }

      if (char === "/" && next === "*") {
        const end = line.indexOf("*/", index + 2);
        if (end === -1) {
          block = true;
          pushToken(tokens, "comment", line.slice(index));
          index = line.length;
        } else {
          pushToken(tokens, "comment", line.slice(index, end + 2));
          index = end + 2;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === "`") {
        const end = scanString(line, index);
        pushToken(tokens, "string", line.slice(index, end));
        index = end;
        continue;
      }

      if (jsx && char === "<" && canStartTag(line, index)) {
        pushToken(tokens, "plain", "<");
        index += 1;
        if (line[index] === "/") {
          pushToken(tokens, "plain", "/");
          index += 1;
        }
        const nameStart = index;
        while (index < line.length && isIdent(line[index] ?? "")) index += 1;
        pushToken(tokens, "tag", line.slice(nameStart, index));

        while (index < line.length && line[index] !== ">") {
          const current = line[index] ?? "";
          if (current === '"' || current === "'" || current === "`") {
            const end = scanString(line, index);
            pushToken(tokens, "string", line.slice(index, end));
            index = end;
            continue;
          }
          if (current === "{") break;
          if (isIdentStart(current)) {
            const attrStart = index;
            while (index < line.length && isIdent(line[index] ?? ""))
              index += 1;
            const kind = line[index] === "=" ? "attr" : "plain";
            pushToken(tokens, kind, line.slice(attrStart, index));
            continue;
          }
          pushToken(tokens, "plain", current);
          index += 1;
        }
        continue;
      }

      if (/[0-9]/.test(char) && !isIdent(line[index - 1] ?? "")) {
        let end = index + 1;
        while (end < line.length && /[0-9.]/.test(line[end] ?? "")) end += 1;
        pushToken(tokens, "number", line.slice(index, end));
        index = end;
        continue;
      }

      if (isIdentStart(char)) {
        let end = index + 1;
        while (end < line.length && isIdent(line[end] ?? "")) end += 1;
        const word = line.slice(index, end);
        pushToken(tokens, KEYWORDS.has(word) ? "keyword" : "plain", word);
        index = end;
        continue;
      }

      pushToken(tokens, "plain", char);
      index += 1;
    }

    return finish(tokens);
  });
}

function highlightBash(code: string): CodeToken[][] {
  return code.split("\n").map((line) => {
    const tokens: CodeToken[] = [];
    let index = 0;
    while (index < line.length) {
      const char = line[index] ?? "";
      if (char === "#") {
        pushToken(tokens, "comment", line.slice(index));
        break;
      }
      if (char === '"' || char === "'") {
        const end = scanString(line, index);
        pushToken(tokens, "string", line.slice(index, end));
        index = end;
        continue;
      }
      if (char === "-" && (index === 0 || line[index - 1] === " ")) {
        let end = index + 1;
        while (end < line.length && line[end] !== " ") end += 1;
        pushToken(tokens, "attr", line.slice(index, end));
        index = end;
        continue;
      }
      pushToken(tokens, "plain", char);
      index += 1;
    }
    return finish(tokens);
  });
}

function highlightJson(code: string): CodeToken[][] {
  return code.split("\n").map((line) => {
    const tokens: CodeToken[] = [];
    let index = 0;
    while (index < line.length) {
      const char = line[index] ?? "";
      if (char === '"') {
        const end = scanString(line, index);
        pushToken(tokens, "string", line.slice(index, end));
        index = end;
        continue;
      }
      if (/[0-9]/.test(char) && !/[0-9]/.test(line[index - 1] ?? "")) {
        let end = index + 1;
        while (end < line.length && /[0-9.eE+-]/.test(line[end] ?? ""))
          end += 1;
        pushToken(tokens, "number", line.slice(index, end));
        index = end;
        continue;
      }
      if (isIdentStart(char)) {
        let end = index + 1;
        while (end < line.length && isIdent(line[end] ?? "")) end += 1;
        const word = line.slice(index, end);
        const kind =
          word === "true" || word === "false" || word === "null"
            ? "keyword"
            : "plain";
        pushToken(tokens, kind, word);
        index = end;
        continue;
      }
      pushToken(tokens, "plain", char);
      index += 1;
    }
    return finish(tokens);
  });
}

function highlightCss(code: string): CodeToken[][] {
  let block = false;
  return code.split("\n").map((line) => {
    const tokens: CodeToken[] = [];
    let index = 0;
    while (index < line.length) {
      const char = line[index] ?? "";
      const next = line[index + 1];
      if (block) {
        const end = line.indexOf("*/", index);
        if (end === -1) {
          pushToken(tokens, "comment", line.slice(index));
          index = line.length;
        } else {
          pushToken(tokens, "comment", line.slice(index, end + 2));
          index = end + 2;
          block = false;
        }
        continue;
      }
      if (char === "/" && next === "*") {
        const end = line.indexOf("*/", index + 2);
        if (end === -1) {
          block = true;
          pushToken(tokens, "comment", line.slice(index));
          index = line.length;
        } else {
          pushToken(tokens, "comment", line.slice(index, end + 2));
          index = end + 2;
        }
        continue;
      }
      if (char === '"' || char === "'") {
        const end = scanString(line, index);
        pushToken(tokens, "string", line.slice(index, end));
        index = end;
        continue;
      }
      if (isIdentStart(char)) {
        let end = index + 1;
        while (
          end < line.length &&
          (isIdent(line[end] ?? "") || line[end] === "-")
        )
          end += 1;
        let look = end;
        while (look < line.length && line[look] === " ") look += 1;
        const kind = line[look] === ":" ? "attr" : "plain";
        pushToken(tokens, kind, line.slice(index, end));
        index = end;
        continue;
      }
      if (/[0-9]/.test(char)) {
        let end = index + 1;
        while (end < line.length && /[0-9.%]/.test(line[end] ?? "")) end += 1;
        pushToken(tokens, "number", line.slice(index, end));
        index = end;
        continue;
      }
      pushToken(tokens, "plain", char);
      index += 1;
    }
    return finish(tokens);
  });
}

export function highlightCode(
  source: string,
  language: CodeBlockLanguage = "tsx",
): CodeToken[][] {
  const code = source.endsWith("\n") ? source.slice(0, -1) : source;
  if (code.length === 0) return [[{ kind: "plain", text: "" }]];
  if (language === "text") {
    return code.split("\n").map((line) => [{ kind: "plain", text: line }]);
  }
  if (language === "bash") return highlightBash(code);
  if (language === "json") return highlightJson(code);
  if (language === "css") return highlightCss(code);
  return highlightScript(code, language === "tsx" || language === "jsx");
}
