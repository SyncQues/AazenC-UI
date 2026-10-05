import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  typesetEmbedClass,
  typesetFitClass,
  typesetNotClass,
  typesetScrollClass,
  typesetVariants,
  type TypesetPreset,
} from "../typeset-variants.ts";

const css = readFileSync(
  fileURLToPath(new URL("../../../tokens/src/typeset.css", import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

type Rule = { selector: string; body: string; depth: number };

/** Brace-match the sheet so nesting still reports its own selector. */
function parseRules(source: string): Rule[] {
  const out: Rule[] = [];
  const stack: { selector: string; bodyStart: number; depth: number }[] = [];
  let depth = 0;
  let selectorStart = 0;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") {
      stack.push({
        selector: source.slice(selectorStart, i).trim(),
        bodyStart: i + 1,
        depth,
      });
      depth += 1;
      selectorStart = i + 1;
    } else if (ch === ";" || ch === "}") {
      depth -= ch === "}" ? 1 : 0;
      if (ch === "}") {
        const frame = stack.pop();
        if (frame) {
          out.push({
            selector: frame.selector,
            body: source.slice(frame.bodyStart, i),
            depth: frame.depth,
          });
        }
      }
      selectorStart = i + 1;
    }
  }
  return out;
}

const rules = parseRules(css);

test("contract: styles never depend on what comes after them", () => {
  // A streaming LLM response appends blocks, so any rule that reads a
  // following sibling would restyle the blocks already on screen.
  const forwardLooking = [
    ":last-child",
    ":last-of-type",
    ":nth-last-child",
    ":nth-last-of-type",
    ":only-child",
    ":only-of-type",
    ":has(",
    ":empty",
  ];
  for (const token of forwardLooking) {
    assert.ok(
      !css.includes(token),
      `${token} looks at later content; append-stability breaks`,
    );
  }
});

test("contract: spacing only ever comes from the top margin", () => {
  assert.ok(!/\bmargin-(top|bottom)\b/.test(css), "use logical block margins");

  // The `margin:` shorthand could set bottom alongside top in one declaration.
  assert.ok(
    !/(^|[^-])margin:/.test(css),
    "bare `margin:` shorthand cannot be audited for direction",
  );

  const endings = [...css.matchAll(/margin-block-end:\s*([^;}]+)/g)];
  assert.ok(endings.length > 0, "expected explicit block-end resets");
  for (const [, value] of endings) {
    assert.equal(
      value.trim(),
      "0",
      "a bottom margin would let an existing block push a newly appended one",
    );
  }
});

test("contract: element rules stay overridable by utilities", () => {
  // A Tailwind utility must beat the typeset without !important, which only
  // holds while the element selector contributes zero specificity.
  const bare = [...css.matchAll(/&(:[a-z-]+)/g)]
    .map(([, pseudo]) => pseudo)
    .filter((pseudo) => pseudo !== ":where");
  assert.deepEqual(bare, [], "nest element rules as `&:where(...)`");
});

test("contract: every descendant rule carries both opt-out markers", () => {
  // Inside `@layer` the depth is not meaningful, so decide by shape: a real
  // rule never starts with `&` and never leaks its at-rule wrapper.
  const flat = rules.filter(
    (rule) =>
      !rule.selector.startsWith("&") &&
      !rule.selector.startsWith("@") &&
      !rule.selector.includes("{"),
  );
  const descendants = flat.filter((rule) => /\.typeset\s*[>*]/.test(rule.selector));
  assert.ok(
    descendants.length >= 2,
    "expected the umbrella and first-child rules, got " +
      descendants.length,
  );

  for (const rule of descendants) {
    assert.ok(
      rule.selector.includes(".not-typeset"),
      `unguarded .not-typeset: ${rule.selector.slice(0, 60)}`,
    );
    assert.ok(
      rule.selector.includes("[data-not-typeset]"),
      `unguarded [data-not-typeset]: ${rule.selector.slice(0, 60)}`,
    );
  }
});

test("opt-out has two depths so a renderer keeps its prose", () => {
  const umbrella = rules.find((rule) => /^\.typeset\s*\*/.test(rule.selector));
  assert.ok(umbrella, "expected the umbrella rule");

  // Deep: opting out takes the whole subtree, for content we never want touched.
  assert.ok(umbrella.selector.includes(".not-typeset *"));
  assert.ok(umbrella.selector.includes("[data-not-typeset] *"));

  // Shallow: `data-slot` skips only the component itself. MarkdownViewer is
  // `data-slot`, and opting its subtree out would be the one thing that must
  // not happen, so `[data-slot] *` must stay out of the exclusion.
  assert.ok(umbrella.selector.includes("[data-slot]"));
  assert.ok(
    !umbrella.selector.includes("[data-slot] *"),
    "[data-slot] * would unstyle prose rendered inside a component",
  );
});

test("container-relative sizing uses a named container, not the viewport", () => {
  assert.ok(
    css.includes("container: typeset-fit / inline-size"),
    "the fit wrapper must establish the query container",
  );
  assert.ok(css.includes("@container typeset-fit ("));

  // A viewport query would size a chat bubble by the window, not by the bubble.
  assert.ok(
    !/@media\s*\(min-width[^)]*\)[\s\S]{0,120}typeset/.test(css),
    "sizing must not be driven by a viewport media query",
  );
});

test("colours resolve to AazenC tokens, not shadcn's names", () => {
  // A straight port of shadcn's file would silently fall back to currentColor.
  const used = [...css.matchAll(/var\((--typeset-[\w-]+)/g)].map(
    ([, name]) => name,
  );
  const themed = new Set([
    "--typeset-ink",
    "--typeset-muted",
    "--typeset-rule",
    "--typeset-accent",
    "--typeset-surface",
    "--typeset-focus",
    "--typeset-radius",
  ]);
  for (const name of used) {
    if (!themed.has(name)) continue;
    assert.ok(css.includes(`${name}: var(`), `${name} is read but never declared`);
  }
  for (const token of ["--foreground", "--muted-foreground", "--border", "--ring", "--primary", "--muted", "--radius"]) {
    assert.ok(css.includes(`var(${token})`), `expected AazenC token ${token}`);
  }
  assert.ok(!css.includes("--color-foreground"), "shadcn token names do not exist here");
});

test("anchors clear the sticky bar", () => {
  assert.ok(
    css.includes("var(--navbar-height, 0px)"),
    "an anchor jump would land under the sticky navbar",
  );
});

test("every class the variants promise exists in the sheet", () => {
  const promised = [
    ...Object.keys(typesetVariants({ preset: undefined }).split(/\s+/)),
    ...["fit", "scroll", "embed", "not"].map(
      (k) => ({ fit: typesetFitClass, scroll: typesetScrollClass, embed: typesetEmbedClass, not: typesetNotClass })[k]!,
    ),
  ];
  for (const className of promised) {
    assert.ok(css.includes(`.${className}`), `.${className} is exported but not styled`);
  }
});

test("presets carry the rhythm they advertise", () => {
  const defaults: Record<TypesetPreset, { size?: string; leading?: string; flow?: string }> = {
    default: {},
    compact: { size: "14px", leading: "1.6", flow: "1em" },
    chat: { leading: "1.6", flow: "1em" },
    docs: { size: "15px", leading: "1.75", flow: "1.5em" },
    reading: { size: "18px", leading: "1.9", flow: "2em" },
    display: {},
    large: { size: "16px", leading: "2", flow: "2em" },
  };

  for (const [preset, expected] of Object.entries(defaults) as [TypesetPreset, typeof defaults[TypesetPreset]][]) {
    const className = typesetVariants({ preset }).split(/\s+/).pop();
    const rule = rules.find((r) => r.selector === `.${className}`);
    assert.ok(rule, `no rule for preset ${preset}`);
    for (const [prop, value] of Object.entries(expected)) {
      assert.ok(
        rule.body.includes(`--typeset-${prop}: ${value};`),
        `${preset} should set --typeset-${prop}: ${value}`,
      );
    }
  }
});

test("the base rhythm is three knobs and everything else derives", () => {
  // First `.typeset` block is the custom property defaults.
  const base = rules.find((rule) => rule.selector === ".typeset");
  assert.ok(base);
  for (const knob of ["--typeset-size: 1em", "--typeset-leading: 1.75", "--typeset-flow: 1.25em"]) {
    assert.ok(base.body.includes(knob), `base should default ${knob}`);
  }
});

test("size is relative, so a typeset inherits its context", () => {
  const base = rules.find((rule) => rule.selector === ".typeset");
  assert.ok(base?.body.includes("--typeset-size: 1em"));
  // Heading sizes are `em`, not `rem`, or they would ignore --typeset-size.
  assert.ok(!css.includes("font-size: 1.5rem"), "rem sizes break the scale");
});
