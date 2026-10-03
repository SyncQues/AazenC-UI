"use client";

import { useMemo, type ComponentProps, type ReactNode } from "react";
import { cn } from "@aazenc/utils";
import { CodeBlock } from "./code-block";
import { Separator } from "./separator";
import {
  markdownAlignClass,
  markdownCodeBlockClass,
  markdownHeadingClass,
  markdownHeadingLevelClass,
  markdownImageClass,
  markdownInlineCodeClass,
  markdownLinkClass,
  markdownListClass,
  markdownListContentClass,
  markdownListItemClass,
  markdownParagraphClass,
  markdownQuoteClass,
  markdownRuleClass,
  markdownTableCellClass,
  markdownTableClass,
  markdownTableHeadClass,
  markdownTableRowClass,
  markdownTableWrapClass,
  markdownTaskClass,
  markdownTaskItemClass,
  markdownTaskListClass,
  markdownViewerVariants,
  type MarkdownViewerVariantProps,
} from "./markdown-viewer-variants";
import {
  isExternalHref,
  parseMarkdown,
  safeHref,
  safeImageSrc,
  type MarkdownAlign,
  type MarkdownBlockNode,
  type MarkdownHeadingLevel,
  type MarkdownInlineNode,
  type MarkdownListItem,
} from "./markdown-viewer-utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const HEADING_TAGS: Record<MarkdownHeadingLevel, HeadingTag> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

export interface MarkdownViewerProps
  extends
    Omit<ComponentProps<"div">, "className" | "children">,
    MarkdownViewerVariantProps {
  /** Markdown source. Rendered as elements, so raw HTML in it stays visible as text. */
  source: string;
  /** Names the group for screen readers, e.g. "Model response". Off when omitted. */
  label?: string;
  className?: string;
}

/**
 * Read-only markdown. Headings, lists, task lists, tables, quotes, and fenced
 * code, with the code frames coming from `CodeBlock`, so a viewer still gets
 * highlighting and Copy.
 *
 * The source is parsed into a node tree and rendered as React elements. There is
 * no `dangerouslySetInnerHTML` in this path, which is what makes it safe to point
 * at a model response, a comment, or a README from a fork: HTML in the source
 * shows up as the literal text it is, and a `javascript:` link shows up as its
 * words instead of as a link.
 */
function MarkdownViewer({
  source,
  label,
  density,
  className,
  ...regionProps
}: MarkdownViewerProps) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  return (
    <div
      data-slot="markdown-viewer"
      role="group"
      aria-label={label}
      className={cn(markdownViewerVariants({ density }), className)}
      {...regionProps}
    >
      {renderBlocks(blocks)}
    </div>
  );
}

function renderBlocks(blocks: MarkdownBlockNode[]): ReactNode {
  return blocks.map((block, index) => (
    <MarkdownBlockView key={index} block={block} />
  ));
}

function MarkdownBlockView({ block }: { block: MarkdownBlockNode }) {
  switch (block.kind) {
    case "heading": {
      const Tag = HEADING_TAGS[block.level];
      return (
        <Tag
          id={block.id}
          className={cn(
            markdownHeadingClass,
            markdownHeadingLevelClass[block.level],
          )}
        >
          {renderInlines(block.children)}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className={markdownParagraphClass}>
          {renderInlines(block.children)}
        </p>
      );

    case "code":
      return (
        <div className={markdownCodeBlockClass}>
          <CodeBlock code={block.code} language={block.language} />
        </div>
      );

    case "quote":
      return (
        <blockquote className={markdownQuoteClass}>
          {renderBlocks(block.children)}
        </blockquote>
      );

    case "rule":
      return (
        <div className={markdownRuleClass}>
          <Separator />
        </div>
      );

    case "list": {
      // Markers only go away when every item is a task, so a list keeps one shape.
      const allTasks =
        block.items.length > 0 &&
        block.items.every((item) => item.checked !== null);
      const items = block.items.map((item, index) => (
        <MarkdownTaskOrListItem key={index} item={item} allTasks={allTasks} />
      ));

      return block.ordered ? (
        <ol start={block.start} className={markdownListClass}>
          {items}
        </ol>
      ) : (
        <ul
          className={cn(markdownListClass, allTasks && markdownTaskListClass)}
        >
          {items}
        </ul>
      );
    }

    case "table":
      return (
        <div className={markdownTableWrapClass}>
          <table className={markdownTableClass}>
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      markdownTableHeadClass,
                      alignClass(block.align, index),
                    )}
                  >
                    {renderInlines(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={markdownTableRowClass}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={cn(
                        markdownTableCellClass,
                        alignClass(block.align, cellIndex),
                      )}
                    >
                      {renderInlines(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function MarkdownTaskOrListItem({
  item,
  allTasks,
}: {
  item: MarkdownListItem;
  allTasks: boolean;
}) {
  return (
    <li
      className={cn(
        markdownListItemClass,
        item.checked !== null && markdownTaskItemClass,
      )}
    >
      {item.checked !== null ? (
        <input
          type="checkbox"
          className={markdownTaskClass}
          checked={item.checked}
          disabled
          readOnly
          aria-label={item.checked ? "Done" : "Not done"}
        />
      ) : null}
      <div className={allTasks ? markdownListContentClass : undefined}>
        {renderBlocks(item.blocks)}
      </div>
    </li>
  );
}

/** A short row is padded with the first alignment, the way a GFM table reads. */
function alignClass(align: (MarkdownAlign | null)[], index: number) {
  return markdownAlignClass[align[index] ?? "left"];
}

function renderInlines(nodes: MarkdownInlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case "text":
        return node.text;

      case "strong":
        return <strong key={index}>{renderInlines(node.children)}</strong>;

      case "emphasis":
        return <em key={index}>{renderInlines(node.children)}</em>;

      case "strike":
        return <s key={index}>{renderInlines(node.children)}</s>;

      case "code":
        return (
          <code key={index} className={markdownInlineCodeClass}>
            {node.text}
          </code>
        );

      case "break":
        return <br key={index} />;

      case "link": {
        const href = safeHref(node.href);
        // A dropped scheme leaves the words in place, so the sentence still reads.
        if (href === null)
          return <span key={index}>{renderInlines(node.children)}</span>;
        return (
          <a
            key={index}
            href={href}
            className={markdownLinkClass}
            rel={isExternalHref(href) ? "noopener noreferrer" : undefined}
          >
            {renderInlines(node.children)}
          </a>
        );
      }

      case "image": {
        const src = safeImageSrc(node.src);
        if (src === null) return <span key={index}>{node.alt}</span>;
        return (
          <img
            key={index}
            src={src}
            alt={node.alt}
            title={node.title}
            loading="lazy"
            decoding="async"
            className={markdownImageClass}
          />
        );
      }
    }
  });
}

export { MarkdownViewer, markdownViewerVariants };
