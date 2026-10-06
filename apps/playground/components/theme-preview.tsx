"use client";

/**
 * Theme showcase.
 *
 * This is a live inspector, not a picture of a theme. Every swatch below binds
 * to the CSS variable it names, and every value string next to it is read back
 * out of the cascade at runtime — so switching `theme` or `mode` repaints the
 * whole page and re-reads every number, with no duplicated palette in JS.
 *
 * That is why it works for every theme in the manifest rather than only one.
 * The token *names* are the contract (they are the same in `slate.css` and
 * `mono.css`); the *values* belong to whichever palette is active. A token the
 * active theme does not define reads back empty and is labelled as unset,
 * which is itself a useful thing to see.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@aazenc/ui/alert";
import { Badge } from "@aazenc/ui/badge";
import { Button } from "@aazenc/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aazenc/ui/card";
import { Separator } from "@aazenc/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@aazenc/ui/table";
import { ThemeSelector } from "@aazenc/ui/theme-selector";
import { useTheme, type ThemeId } from "@aazenc/themes";

/* -------------------------------------------------------------------------- */
/* Token catalog                                                              */
/* -------------------------------------------------------------------------- */

type TokenKind = "fill" | "text" | "gradient" | "shadow" | "none";

interface Token {
  /** The CSS custom property, without the leading dashes' var() wrapper. */
  name: string;
  /** What the token is for, in the wording the theme file uses. */
  hint: string;
  /** How the swatch should paint it. `text` needs a backdrop, not a fill. */
  kind?: TokenKind;
}

interface TokenGroup {
  title: string;
  note?: string;
  tokens: Token[];
}

const surfaceTokens: Token[] = [
  { name: "--background", hint: "The page itself. Everything else is measured against it." },
  { name: "--surface", hint: "The panel rung. Under data-material=solid this IS the card value." },
  { name: "--card", hint: "A panel. Forced to var(--surface) in light by the material layer." },
  { name: "--card-foreground", hint: "Text on --card." },
  { name: "--popover", hint: "Menus and tooltips. Live in dark, a genuine fourth rung." },
  { name: "--popover-foreground", hint: "Text on --popover." },
  { name: "--foreground", hint: "Body ink." },
];

const actionTokens: Token[] = [
  { name: "--primary", hint: "The thing you can act on. Always at the far end of the ladder from the page." },
  { name: "--primary-foreground", hint: "Text on --primary." },
  { name: "--secondary", hint: "Tonal resting state." },
  { name: "--secondary-foreground", hint: "Text on --secondary." },
  { name: "--muted", hint: "Quiet fill: table stripes, code blocks, disabled rows." },
  { name: "--muted-foreground", hint: "Secondary text. Budgeted against the composited mesh, not just the page." },
  { name: "--accent", hint: "Hover and selected fill: nav rows, menu items, tabs, table hover." },
  { name: "--accent-foreground", hint: "Text on --accent." },
];

const statusTokens: Token[] = [
  { name: "--destructive", hint: "The one red. Deliberately absent from the chart ramp so the two never collide." },
  { name: "--destructive-foreground", hint: "Text on a SOLID destructive fill. See the alert rule below before using it." },
  { name: "--success", hint: "Confirmation. Tinted at 10% behind alerts and toasts." },
  { name: "--success-foreground", hint: "Icon and text on bg-success/10 — not on the solid fill." },
  { name: "--warning", hint: "Attention." },
  { name: "--warning-foreground", hint: "Icon and text on bg-warning/10 — not on the solid fill." },
];

const lineTokens: Token[] = [
  { name: "--border", hint: "A decorative hairline. A divider, not a control boundary." },
  { name: "--input", hint: "A CONTROL boundary — WCAG 1.4.11 applies. Used at full opacity as border-input." },
  { name: "--ring", hint: "Focus state. Saturation is the point; a gray ring at 3:1 is invisible in practice." },
  { name: "--overlay", hint: "The modal scrim. Carries the page hue rather than greying it out." },
];

const sidebarTokens: Token[] = [
  { name: "--sidebar", hint: "The rail. Set to recede behind the content column in both modes." },
  { name: "--sidebar-foreground", hint: "Text on the rail." },
  { name: "--sidebar-primary", hint: "Active item on the rail." },
  { name: "--sidebar-primary-foreground", hint: "Text on the active item." },
  { name: "--sidebar-accent", hint: "Hover on the rail." },
  { name: "--sidebar-accent-foreground", hint: "Text on the hovered rail item." },
  { name: "--sidebar-border", hint: "The rail edge. One long vertical line, so the quietest thing on screen." },
  { name: "--sidebar-ring", hint: "Focus inside the rail." },
];

const chartTokens: Token[] = [
  { name: "--chart-1", hint: "Series 1. The brand hue." },
  { name: "--chart-2", hint: "Series 2." },
  { name: "--chart-3", hint: "Series 3." },
  { name: "--chart-4", hint: "Series 4." },
  { name: "--chart-5", hint: "Series 5. Neutral by design, so it reads as 'the rest'." },
];

const brandTokens: Token[] = [
  { name: "--about-accent", hint: "SyncQues teal. Frozen product identity." },
  { name: "--brand", hint: "Gradient endpoint and active-tab colour. Mode-invariant by design." },
  { name: "--brand-accent", hint: "The other gradient endpoint. Also mode-invariant." },
  { name: "--analytics-accent", hint: "Renders as delta text in the analytics tables, so it is bound to 4.5:1." },
  { name: "--analytics-positive", hint: "Delta text, positive." },
  { name: "--analytics-negative", hint: "Delta text, negative." },
  { name: "--signal-hiring", hint: "Signal chip. Painted on a tint of itself." },
  { name: "--signal-culture", hint: "Signal chip." },
  { name: "--signal-milestone", hint: "Signal chip." },
  { name: "--signal-update", hint: "Signal chip. Kept clearly bluer than the brand ramp." },
];

const gradientTokens: Token[] = [
  { name: "--brand-gradient", hint: "The CTA ramp. Frozen in both modes — a CTA that re-points between modes is a bug.", kind: "gradient" },
  { name: "--brand-wordmark", hint: "Logo type and hero headings. This is where the theme's warm stop is allowed.", kind: "gradient" },
  { name: "--mesh-1", hint: "Community ambient, bloom one.", kind: "gradient" },
  { name: "--mesh-2", hint: "Community ambient, bloom two.", kind: "gradient" },
  { name: "--mesh-3", hint: "Community ambient, bloom three. Part of the contrast budget.", kind: "gradient" },
];

const recipeTokens: Token[] = [
  { name: "--button-filled-bg", hint: "Filled button background." },
  { name: "--button-filled-text", hint: "Filled button text.", kind: "text" },
  { name: "--button-filled-border", hint: "Filled button edge — the specular hairline." },
  { name: "--button-destructive-bg", hint: "Destructive button background." },
  { name: "--button-destructive-text", hint: "Destructive button text.", kind: "text" },
  { name: "--button-destructive-border", hint: "Destructive button edge." },
  { name: "--button-tonal-bg", hint: "Tonal button. Tinted with the primary, not gray." },
  { name: "--button-tonal-text", hint: "Tonal button text.", kind: "text" },
  { name: "--button-tonal-border", hint: "Tonal button edge." },
  { name: "--button-outline-bg", hint: "Outline button background." },
  { name: "--button-outline-text", hint: "Outline button text.", kind: "text" },
  { name: "--button-outline-border", hint: "Outline button edge. An affordance, not a divider." },
  { name: "--button-ghost-text", hint: "Ghost button text.", kind: "text" },
  { name: "--button-ghost-hover-bg", hint: "Ghost button hover fill." },
];

const GROUPS: TokenGroup[] = [
  { title: "Surfaces", note: "Panels separate by lightness before anyone looks at a shadow.", tokens: surfaceTokens },
  { title: "Text and action", tokens: actionTokens },
  { title: "Status", tokens: statusTokens },
  { title: "Lines and focus", note: "--input and --ring are control boundaries. --border is decoration. Different jobs, different standards.", tokens: lineTokens },
  { title: "Sidebar", tokens: sidebarTokens },
  { title: "Chart palette", tokens: chartTokens },
  { title: "Brand, analytics and signals", tokens: brandTokens },
  { title: "Gradients and ambient", tokens: gradientTokens },
  { title: "Button recipes", note: "Under data-material=solid most of these are set by the unlayered material block in @aazenc/config. They still ship downstream through registry.css.", tokens: recipeTokens },
];

const ALL_TOKEN_NAMES = GROUPS.flatMap((group) => group.tokens.map((token) => token.name));

/** Theme-independent tokens, defined in @aazenc/tokens/base.css for every theme. */
const RADIUS_TOKENS = [
  "--radius-xs",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-panel",
  "--radius-full",
] as const;

const HUE_RAMPS = ["--blue-500", "--green-500", "--orange-500", "--teal-500", "--purple-500", "--pink-500"];

const SHARED_MOTION_TOKENS = [
  "--duration-fast",
  "--duration-normal",
  "--duration-slow",
  "--ease-default",
  "--ease-spring",
  "--ease-panel",
  "--font-sans",
  "--font-mono",
] as const;

/* -------------------------------------------------------------------------- */
/* Reading the cascade                                                        */
/* -------------------------------------------------------------------------- */

type TokenValues = Record<string, string>;

function readRootTokens(names: string[]): TokenValues {
  if (typeof window === "undefined") return {};
  const computed = getComputedStyle(document.documentElement);
  const out: TokenValues = {};
  for (const name of names) {
    const value = computed.getPropertyValue(name).trim();
    if (value) out[name] = value;
  }
  return out;
}

/**
 * Re-read the cascade whenever the palette under the page changes.
 * The values are the *computed* ones, so they reflect the material layer and
 * the cascade order, not just the theme block that authored them.
 */
function useTokenValues(names: string[], deps: readonly unknown[]): TokenValues {
  const [values, setValues] = useState<TokenValues>({});

  useEffect(() => {
    setValues(readRootTokens(names));
    // `names` is a stable module-level constant; the deps are the palette switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return values;
}

function visitStyleRules(rules: CSSRuleList, visit: (rule: CSSStyleRule) => void): void {
  for (const rule of Array.from(rules)) {
    const nested = (rule as CSSRule & { cssRules?: CSSRuleList }).cssRules;
    if (nested) {
      visitStyleRules(nested, visit);
      continue;
    }
    const selector = (rule as CSSStyleRule).selectorText;
    const style = (rule as CSSStyleRule).style;
    if (selector && style) visit(rule as CSSStyleRule);
  }
}

/**
 * Pull one theme's custom properties for one mode straight out of the shipped
 * stylesheets, so the page can render a side-by-side of two modes at once.
 *
 * Scope: rules scoped to `[data-theme="<id>"]`, with `.dark` deciding the
 * mode. The unlayered `[data-material="solid"]` block is merged afterwards
 * because unlayered rules beat layered ones at any specificity, and the
 * playground always runs `data-material="solid"`.
 *
 * Best effort by design. A cross-origin stylesheet throws on `cssRules`, and
 * minified selector text may differ from the source, so callers must treat an
 * empty result as "not available" rather than "no tokens".
 */
function readThemeModeTokens(themeId: string, mode: "light" | "dark"): TokenValues {
  if (typeof window === "undefined") return {};

  const themeScope = new RegExp(`data-theme\\s*=\\s*["']?${themeId}["']?`);
  const materialScope = /data-material\s*=\s*["']?solid["']?/;
  const out: TokenValues = {};

  const collect = (scope: RegExp, into: TokenValues) => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin sheet
      }
      visitStyleRules(rules, (rule) => {
        const selector = rule.selectorText;
        if (!scope.test(selector)) return;
        if ((mode === "dark") !== /\.dark\b/.test(selector)) return;
        const style = rule.style;
        for (let i = 0; i < style.length; i += 1) {
          const property = style.item(i);
          if (property.startsWith("--")) {
            into[property] = style.getPropertyValue(property).trim();
          }
        }
      });
    }
  };

  collect(themeScope, out);
  collect(materialScope, out); // unlayered, so it wins
  return out;
}

/* -------------------------------------------------------------------------- */
/* Presentation primitives                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {note ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Swatch({
  token,
  value,
  onCopy,
  copied,
}: {
  token: Token;
  value: string;
  onCopy: (name: string) => void;
  copied: boolean;
}) {
  const unset = !value;
  const kind = token.kind ?? "fill";
  // `none` renders a checkerboard so an unset token is visibly absent rather
  // than quietly reading as a white swatch.
  const fill =
    kind === "none"
      ? "repeating-conic-gradient(var(--border) 0% 25%, transparent 0% 50%) 50% / 12px 12px"
      : `var(${token.name})`;

  return (
    <div className="flex items-start gap-3 border-b border-border py-3">
      <span
        aria-hidden="true"
        className="size-10 shrink-0 rounded-md border border-border"
        style={
          kind === "shadow"
            ? { background: "var(--card)", boxShadow: `var(${token.name})` }
            : kind === "text"
              ? { background: "var(--card)", color: `var(${token.name})` }
              : { background: fill }
        }
      >
        {kind === "text" ? <span className="flex h-full items-center justify-center text-sm font-semibold">Aa</span> : null}
      </span>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onCopy(token.name)}
          className="cursor-pointer text-left font-mono text-xs text-foreground"
          title={copied ? "Copied" : `Copy ${token.name}`}
        >
          {token.name}
        </button>
        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground" title={value || undefined}>
          {copied ? "copied" : unset ? "not set by this theme" : value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{token.hint}</p>
      </div>
    </div>
  );
}

function TokenGroupBlock({
  group,
  values,
  onCopy,
  copied,
}: {
  group: TokenGroup;
  values: TokenValues;
  onCopy: (name: string) => void;
  copied: string | null;
}) {
  return (
    <Card padding="sm">
      <CardHeader>
        <CardTitle>{group.title}</CardTitle>
        {group.note ? <CardDescription>{group.note}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {group.tokens.map((token) => (
          <Swatch
            key={token.name}
            token={token}
            value={values[token.name] ?? ""}
            onCopy={onCopy}
            copied={copied === token.name}
          />
        ))}
      </CardContent>
    </Card>
  );
}

/* A miniature application, used to render a theme inside the comparison panels. */
function MiniSample({ mode }: { mode: "light" | "dark" }) {
  return (
    <div
      className="p-5"
      style={{ background: "var(--background)", color: "var(--foreground)", colorScheme: mode }}
    >
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        {mode === "dark" ? "Dark" : "Light"}
      </p>
      <p className="mt-1 text-sm font-semibold">Weekly brief</p>
      <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Secondary text sits on this surface.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm">
          Continue
        </Button>
        <Button type="button" size="sm" variant="outline">
          Outline
        </Button>
        <Badge variant="soft">Badge</Badge>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Input
        </span>
        <span
          className="h-8 w-28 rounded-md border"
          style={{ borderColor: "var(--input)", background: "var(--card)" }}
        />
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md border"
          style={{ borderColor: "var(--ring)", boxShadow: "0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)" }}
          aria-label="Focus ring sample"
          role="img"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The showcase                                                               */
/* -------------------------------------------------------------------------- */

export function ThemePreview({ themeId }: { themeId?: ThemeId }) {
  const { theme, mode, setTheme, setMode, availableThemes, toggleMode } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const active = availableThemes.find((item) => item.id === theme);
  const label = active?.label ?? theme;
  const description = active?.description ?? "";

  // A deep link such as /themes/mono should land on that palette, the same
  // way /components/theme-selector switches it by hand.
  useEffect(() => {
    if (themeId && themeId !== theme) setTheme(themeId);
  }, [themeId, theme, setTheme]);

  const values = useTokenValues(ALL_TOKEN_NAMES, [theme, mode]);
  const radiusValues = useTokenValues(
    [...RADIUS_TOKENS, ...HUE_RAMPS, ...SHARED_MOTION_TOKENS],
    [theme, mode],
  );
  const comparison = useComparisonTokens(themeId ?? theme, mode);

  const copy = useCallback((name: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!value) return;
    try {
      void navigator.clipboard?.writeText(`${name}: ${value};`);
    } catch {
      // Clipboard is unavailable outside a secure context. The value is still
      // on screen and selectable, so a failure here is not worth interrupting.
    }
    setCopied(name);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  const linked = Boolean(themeId) && themeId === theme;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* ---- Header ---------------------------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Theme</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{label}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {description || "A palette in the @aazenc/themes contract."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector
            theme={theme}
            themes={availableThemes}
            mode={mode}
            onTheme={(id) => {
              const next = availableThemes.find((item) => item.id === id);
              if (next) setTheme(next.id);
            }}
            onMode={setMode}
          />
          <Button type="button" variant="outline" onClick={toggleMode}>
            {mode === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </div>

      {linked ? (
        <div className="mt-4">
          <Badge variant="soft">Linked to /themes/{theme}</Badge>
        </div>
      ) : null}

      {/* ---- Hero ------------------------------------------------------ */}
      <div
        className="mt-10 overflow-hidden rounded-[var(--radius-panel)] p-8 sm:p-12"
        style={{ background: "var(--brand-gradient)" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#ffffff" }}>
          {label} · {mode}
        </p>
        <p
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ color: "#ffffff" }}
        >
          The CTA ramp, frozen.
        </p>
        <p className="mt-3 max-w-xl text-sm" style={{ color: "rgba(255 255 255 / 0.86)" }}>
          This band is <span className="font-mono">--brand-gradient</span>. It is deliberately identical in
          light and dark: a call to action that re-points between modes is a bug, not a theme. The warm stop
          lives in <span className="font-mono">--brand-wordmark</span> instead, where no white text sits on top.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{
              background: "var(--brand-wordmark)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            SyncQues
          </span>
        </div>
      </div>

      {/* ---- Usage rule the components actually follow ---------------- */}
      <div className="mt-10">
        <Alert tone="warning">
          <AlertTitle headingLevel={3} className="text-base">
            Status colours are three different things
          </AlertTitle>
          <AlertDescription>
            <p>
              <span className="font-medium">--success-foreground</span> and{" "}
              <span className="font-medium">--warning-foreground</span> are icon and text colours for the
              10% tint an alert or toast paints (<span className="font-mono">bg-success/10</span>). They are not
              text on the solid fill.
            </p>
            <p className="mt-2">
              <span className="font-medium">--destructive-foreground</span> is the exception: it is text on a
              solid destructive fill, and on a 10% wash it is close to invisible. That is why the destructive
              alert icon uses <span className="font-mono">text-destructive</span> instead.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Alert tone="success">
          <AlertTitle headingLevel={3} className="text-base">
            Success
          </AlertTitle>
          <AlertDescription>Text stays foreground; the tone lives in the 10% wash and the icon.</AlertDescription>
        </Alert>
        <Alert tone="destructive">
          <AlertTitle headingLevel={3} className="text-base">
            Destructive
          </AlertTitle>
          <AlertDescription>The icon uses the hue token, not --destructive-foreground.</AlertDescription>
        </Alert>
      </div>

      {/* ---- Surfaces ladder ------------------------------------------ */}
      <Section
        title="Surface ladder"
        note="Panels separate by lightness before anyone looks at a shadow. Read top to bottom as the page gets closer to the reader."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["--background", "--surface", "--card", "--popover"] as const).map((name) => (
            <div
              key={name}
              className="rounded-[var(--radius-panel)] border p-5"
              style={{ background: `var(${name})`, borderColor: "var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {name}
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                {values[name] ?? "unset"}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- Chart palette -------------------------------------------- */}
      <Section
        title="Chart palette"
        note="Series separate primarily by hue, with alternating luminance as a reinforcing second cue. Deliberately no red, so a series never collides with --destructive."
      >
        <div className="grid gap-3 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="rounded-md border border-border p-3">
              <span
                aria-hidden="true"
                className="block h-16 w-full rounded-sm"
                style={{ background: `var(--chart-${n})` }}
              />
              <p className="mt-2 font-mono text-xs text-foreground">--chart-{n}</p>
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                {values[`--chart-${n}`] ?? "unset"}
              </p>
            </div>
          ))}
        </div>
        <div
          className="mt-4 flex h-32 items-end gap-2 rounded-[var(--radius-panel)] border border-border p-4"
          role="img"
          aria-label="Example bar chart using the chart palette"
        >
          {[62, 38, 84, 45, 70].map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-t-sm"
              style={{ height: `${height}%`, background: `var(--chart-${index + 1})` }}
            />
          ))}
        </div>
      </Section>

      {/* ---- Buttons --------------------------------------------------- */}
      <Section title="Buttons" note="Every variant, rendered with the real component so the recipes are visible in context.">
        <Card>
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>Seven variants, three shapes, the same structure in every theme.</CardDescription>
          </CardHeader>
          <CardContent gap="md">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button">Default</Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
              <Button type="button" variant="ghost">
                Ghost
              </Button>
              <Button type="button" variant="destructive">
                Destructive
              </Button>
              <Button type="button" variant="destructive-soft">
                Destructive text
              </Button>
              <Button type="button" variant="link">
                Link
              </Button>
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" shape="pill">
                Pill
              </Button>
              <Button type="button" variant="outline" shape="rounded">
                Rounded
              </Button>
              <Button type="button" variant="outline" shape="square">
                Square
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" disabled>
                Disabled
              </Button>
              <Button type="button" size="sm" variant="outline" aria-invalid="true">
                Invalid
              </Button>
              <Button type="button" size="sm" variant="ghost" loading>
                Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ---- Light / dark comparison ----------------------------------- */}
      <Section
        title="Light and dark, side by side"
        note="Both panels re-declare the theme's tokens as inline custom properties on their own subtree, so the real components inside them resolve against a palette that is not the page's."
      >
        {comparison.supported ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {(["light", "dark"] as const).map((panel) => (
              <div
                key={panel}
                className={panel === "dark" ? "dark overflow-hidden rounded-[var(--radius-panel)] border border-border" : "light overflow-hidden rounded-[var(--radius-panel)] border border-border"}
                style={comparison[panel] as CSSProperties}
              >
                <MiniSample mode={panel} />
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertTitle headingLevel={3} className="text-base">
              Side-by-side unavailable
            </AlertTitle>
            <AlertDescription>
              This page could not read the theme blocks out of the loaded stylesheets, so it will not fake the
              second mode. Switch modes with the control above to see the other one live.
            </AlertDescription>
          </Alert>
        )}
      </Section>

      {/* ---- Token reference ------------------------------------------ */}
      <Section
        title="Token reference"
        note="Every value is read from the cascade at runtime, not from a copy of the theme. Click a token name to copy its declaration."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {GROUPS.map((group) => (
            <TokenGroupBlock
              key={group.title}
              group={group}
              values={values}
              onCopy={copy}
              copied={copied}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Values are the computed ones. A production build runs the stylesheet through a minifier that rewrites
          oklch() to its equivalent hex and strips quotes from attribute selectors, so devtools may show a hex
          value where this page shows oklch(). The colour is identical; only the notation differs.
        </p>
      </Section>

      {/* ---- Theme-independent ----------------------------------------- */}
      <Section
        title="Theme-independent tokens"
        note="Defined once in @aazenc/tokens/base.css and shared by every theme. They appear here only to make the boundary explicit — a theme must not redefine them."
      >
        <Card>
          <CardHeader>
            <CardTitle>Radii</CardTitle>
            <CardDescription>
              One <span className="font-mono">--radius</span> drives the shadcn steps. Corner geometry is
              structure, not branding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              {RADIUS_TOKENS.map((name) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-14 border-2 border-primary bg-primary/20"
                    style={{ borderRadius: `var(${name})` }}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">{name.replace("--radius-", "")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Brand hue ramps</CardTitle>
              <CardDescription>
                A blue tab is blue in every theme, because the hue is the identity. Dark mode moves the shade,
                never the hue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {HUE_RAMPS.map((name) => (
                  <span
                    key={name}
                    className="size-10 rounded-md border border-border"
                    style={{ background: `var(${name})` }}
                    title={name}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motion and type</CardTitle>
              <CardDescription>
                Durations, easings and the font stack are shared. A theme that re-tunes them changes how the
                whole product feels, not how it looks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {SHARED_MOTION_TOKENS.map((name) => (
                <div key={name} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                  <span className="font-mono text-xs text-foreground">{name}</span>
                  <span className="max-w-[60%] truncate font-mono text-xs text-muted-foreground">
                    {radiusValues[name] ?? "not set by this theme"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ---- Token table ----------------------------------------------- */}
      <Section
        title="Applied tokens"
        note="A flat read of the same values, for scanning and for diffing against a theme file."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Value</TableHead>
              <TableHead wrap>Reads as</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(values)
              .sort()
              .map((name) => (
                <TableRow key={name}>
                  <TableCell>
                    <span className="font-mono text-xs">{name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{values[name]}</span>
                  </TableCell>
                  <TableCell wrap>
                    <span className="text-xs text-muted-foreground">
                      {GROUPS.flatMap((group) => group.tokens).find((token) => token.name === name)?.hint ?? "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Section>
    </main>
  );
}

/**
 * Token blocks for both modes of the active theme, pulled from the stylesheets.
 * Returns empty objects when the sheets cannot be read; `supported` is the
 * honest signal for that, so the page can say so instead of rendering a lie.
 */
function useComparisonTokens(themeId: string, mode: "light" | "dark") {
  const [state, setState] = useState<{
    light: TokenValues;
    dark: TokenValues;
    supported: boolean;
  }>({ light: {}, dark: {}, supported: false });

  useEffect(() => {
    const light = readThemeModeTokens(themeId, "light");
    const dark = readThemeModeTokens(themeId, "dark");
    // Either mode being empty means the sheets were not readable, or the
    // theme is not scoped the way the reader assumes. Do not half-render it.
    const supported = Object.keys(light).length > 0 && Object.keys(dark).length > 0;
    setState({ light, dark, supported });
  }, [themeId, mode]);

  return useMemo(() => state, [state]);
}
