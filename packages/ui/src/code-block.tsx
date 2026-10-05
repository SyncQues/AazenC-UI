"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@aazenc/utils";
import { Button } from "./button";
import { highlightCode, type CodeBlockLanguage } from "./code-block-highlight";
import {
  codeBlockFilenameClass,
  codeBlockFrameClass,
  codeBlockGutterClass,
  codeBlockHeaderClass,
  codeBlockLineClass,
  codeBlockPreClass,
  codeBlockTokenClass,
} from "./code-block-variants";

export interface CodeBlockProps {
  /** Source to show. Copy uses this string, without line numbers. */
  code: string;
  language?: CodeBlockLanguage;
  /** Header label. The language is used when this is omitted. */
  filename?: string;
  /** Gutter with line numbers. Off for short snippets. */
  showLines?: boolean;
  className?: string;
}

type CopyNotice = { kind: "copied" | "failed"; at: number };

function CodeBlock({
  code,
  language = "tsx",
  filename,
  showLines = false,
  className,
}: CodeBlockProps) {
  const [notice, setNotice] = useState<CopyNotice | null>(null);
  const lines = useMemo(() => highlightCode(code, language), [code, language]);
  const label =
    notice?.kind === "copied"
      ? "Copied"
      : notice?.kind === "failed"
        ? "Copy failed"
        : "Copy";

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 1600);
    return () => window.clearTimeout(id);
  }, [notice]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setNotice({ kind: "copied", at: Date.now() });
    } catch {
      setNotice({ kind: "failed", at: Date.now() });
    }
  }

  return (
    <figure data-slot="code-block" className={cn(codeBlockFrameClass, className)}>
      <figcaption className={codeBlockHeaderClass}>
        <span className={codeBlockFilenameClass}>{filename ?? language}</span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => void copy()}
          aria-live="polite"
        >
          {label}
        </Button>
      </figcaption>
      <pre
        className={codeBlockPreClass}
        tabIndex={0}
        aria-label={filename ? `Code, ${filename}` : "Code"}
      >
        <code>
          {lines.map((tokens, lineIndex) => (
            <span key={lineIndex} className={codeBlockLineClass}>
              {showLines ? (
                <span className={codeBlockGutterClass} aria-hidden="true">
                  {lineIndex + 1}
                </span>
              ) : null}
              {tokens.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className={codeBlockTokenClass[token.kind]}
                >
                  {token.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

export { CodeBlock };
export type { CodeBlockLanguage };
