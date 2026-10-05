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

  // `margin-block:` is the same hole one level in: `margin-block: 1em 0` sets a
  // block-end in the same declaration that sets the block-start, matches none of
  // the patterns below, and would pass this test while breaking the contract.
  assert.ok(
    !/(^|[^-])margin-block:/.test(css),
    "`margin-block:` sets block-end in one declaration and cannot be audited",
  );

  // `margin-inline:` is out of scope — the inline axis cannot move a block — but
  // the shorthand form is still banned, so no declaration ever sets two axes at
  // once. `blockquote` and `figure` use it to drop the UA's default side margins.
  for (const match of css.matchAll(/(^|[^-])margin-inline:\s*([^;}]+)/g)) {
    const value = match[2]!.trim();
    assert.equal(
      value.split(/\s+/).length,
      1,
      `margin-inline: ${value} sets two values in one declaration`,
    );
  }

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
    "--typeset-mark",
  ]);
  // Declared in the token block specifically, not merely mentioned somewhere.
  // `css.includes(`${name}: var(`)` passes for a colour that is only ever read,
  // which is how an undeclared token reaches a browser as an invalid value.
  const tokenBlock = rules.find((rule) => rule.selector === ".typeset");
  assert.ok(tokenBlock, "expected the .typeset token block");
  for (const name of used) {
    if (!themed.has(name)) continue;
    assert.ok(
      tokenBlock.body.includes(`${name}: `),
      `${name} is read but never declared on .typeset`,
    );
  }
  for (const token of ["--foreground", "--muted-foreground", "--border", "--ring", "--primary", "--muted", "--radius"]) {
    assert.ok(css.includes(`var(${token})`), `expected AazenC token ${token}`);
  }
  assert.ok(!css.includes("--color-foreground"), "shadcn token names do not exist here");

  // No raw colour literal in a usage rule. `mark` had one hardcoded oklch while
  // the header promised every colour was a token; contrast was fine, the
  // contract was not. The token block and the at-rule wrappers that contain it
  // are exempt: a literal is exactly what a token's default value is.
  for (const rule of rules) {
    if (rule.selector === ".typeset" || rule.selector.startsWith("@")) continue;
    const literals = rule.body.match(/#[0-9a-f]{3,8}\b|\b(?:oklch|oklab|rgb|hsl)\(/gi) ?? [];
    assert.deepEqual(literals, [], `raw colour literal in ${rule.selector.slice(0, 40)}`);
  }
});

test("anchors clear the sticky bar", () => {
  assert.ok(
    css.includes("var(--navbar-height, 0px)"),
    "an anchor jump would land under the sticky navbar",
  );
});

test("every class the variants promise exists in the sheet", () => {
  // Every preset and every measure, not just the default: `typesetVariants({ preset:
  // undefined })` returns just "typeset", so checking that alone left the other
  // six presets to be covered by accident.
  const promised = new Set<string>();
  const presets: TypesetPreset[] = ["default", "compact", "chat", "docs", "reading", "display", "large"];
  const measures = ["default", "narrow", "wide"] as const;
  for (const preset of presets) {
    for (const measure of measures) {
      for (const className of typesetVariants({ preset, measure }).split(/\s+/)) {
        promised.add(className);
      }
    }
  }
  for (const className of [typesetFitClass, typesetScrollClass, typesetEmbedClass, typesetNotClass]) {
    promised.add(className);
  }

  for (const className of promised) {
    // A measure is a Tailwind arbitrary utility, not a `.class` this sheet
    // defines, so the sheet check does not apply. It does have to be an em cap,
    // or the prose column stops following the typeset's own size.
    if (className.startsWith("max-w-[")) {
      assert.match(className, /^max-w-\[\d+(\.\d+)?em\]$/, `measure must be an em cap: ${className}`);
      continue;
    }
    assert.ok(css.includes(`.${className}`), `.${className} is exported but not styled`);
  }
});

test("presets carry the rhythm they advertise", () => {
  const defaults: Record<TypesetPreset, { size?: string; leading?: string; flow?: string }> = {
    default: {},
    compact: { size: "0.875em", leading: "1.6", flow: "1em" },
    chat: { leading: "1.6", flow: "1em" },
    docs: { size: "0.9375em", leading: "1.75", flow: "1.5em" },
    reading: { size: "1.125em", leading: "1.9", flow: "2em" },
    display: {},
    large: { size: "1em", leading: "2", flow: "2em" },
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

  // Every preset too. A preset pinned to `14px` overrides the reader's own
  // browser text size, which is the one setting `typeset-large` advertises.
  for (const match of css.matchAll(/--typeset-size:\s*([^;}]+)/g)) {
    const value = match[1]!.trim();
    assert.match(value, /^\d*\.?\d+em$/, `--typeset-size must be em, got ${value}`);
  }
  assert.ok(
    !/font-size:\s*[^;}]*\d(px|rem)\b/.test(css),
    "a px or rem font-size ignores the reader's text size",
  );
});

/*
 * The three checks below read the cascade, not the text of the file. The rest of
 * this suite is a set of regexes, which is why a heading size could collide with
 * its neighbour, a rule could be shadowed by a later one, and a declaration
 * could sit above the rule it was written to override — all three shipped green
 * for the same reason. These assert the resolved outcome.
 */

/** Resolves a `font-size` written in `em` to a number, at one scale ratio. */
function sizeInEm(body: string, scale = 1.25): number {
  const match = body.match(/font-size:\s*([^;}]+)/);
  assert.ok(match, `no font-size in: ${body.slice(0, 60)}`);
  const expr = match[1]!
    .trim()
    .replace(/^calc\(/, "")
    .replace(/\)$/, "")
    .replaceAll("var(--typeset-scale)", String(scale))
    .trim();
  assert.match(expr, /em$/, `size must be in em so it follows --typeset-size: ${expr}`);

  return expr
    .slice(0, -2)
    .split("*")
    .map((term) => {
      const t = term.trim();
      const [num, den] = t.split("/").map((n) => n.trim());
      const value = Number(num) / (den === undefined ? 1 : Number(den));
      assert.ok(Number.isFinite(value), `unreadable font-size term: ${t}`);
      return value;
    })
    .reduce((acc, term) => acc * term, 1);
}

test("all six heading levels are distinguishable", () => {
  const sizes = new Map<string, number>();
  for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
    const rule = rules.find((r) => r.selector === `&:where(${level})`);
    assert.ok(rule, `no rule for ${level}`);
    sizes.set(level, sizeInEm(rule.body));
  }

  // Two levels at the same size collapse the outline: a table of contents or a
  // skip link shows two identical rows. h3 and h4 both resolved to 1em once.
  const seen = new Map<number, string>();
  for (const [level, size] of sizes) {
    const other = seen.get(size);
    assert.equal(other, undefined, `${other} and ${level} are both ${size}em`);
    seen.set(size, level);
  }
});

test("a heading's own rhythm beats the heading-follows rule on ties", () => {
  const followsHeading = (rule: Rule): boolean => /\bh1 \+ \*/.test(rule.selector);
  const follows = rules.find(followsHeading);
  assert.ok(follows, "expected the `hN + *` rule");

  // Scoped to the element rules nested in the umbrella (`&:where(...)`). Those
  // are all (0,1,0) — `.typeset` in the selector, the element inside `:where()`
  // — so a tie with the heading-follows rule is settled by source order alone.
  // Read any higher up, `p` got 1em while `pre`, `ul`, `blockquote`, `table` and
  // `figure` each kept their own `--typeset-flow`, and the rhythm under a
  // heading came to depend on which block happened to follow it.
  //
  // The first-child resets and `hgroup + *` are outside this: the resets are a
  // different mechanism and are meant to win, and a first child by definition
  // cannot also be a heading's next sibling.
  const shadowed = rules.filter(
    (rule) =>
      rule.selector.startsWith("&:where(") &&
      /margin-block-start:/.test(rule.body) &&
      !followsHeading(rule) &&
      rule.selector !== "&:where(hgroup + *)" &&
      rules.indexOf(rule) > rules.indexOf(follows),
  );
  assert.deepEqual(
    shadowed.map((r) => r.selector.slice(0, 40)),
    [],
    "these set margin-block-start after the heading-follows rule and win the tie",
  );
});

test("the heading code size is declared after the generic one", () => {
  const generic = rules.find((r) => r.selector === "&:where(:not(pre) > code)");
  const inHeading = rules.find((r) => r.selector.includes("h1, h2, h3, h4) :is(code)"));
  assert.ok(generic, "expected the generic code size");
  assert.ok(inHeading, "expected the code-in-a-heading size");

  // Both are (0,1,0). Read any higher up this rule can never apply, and code in
  // a heading silently renders at the paragraph size.
  assert.ok(
    rules.indexOf(inHeading) > rules.indexOf(generic),
    "code in a heading is shadowed by the later generic rule and never applies",
  );
});
