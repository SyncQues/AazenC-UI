# PR #4 — Review & Fix Record

**Branch** `ui/component_3` → `main` · **PR** "Add alert, resizable, separator, and sheet components"

---

## Status: all findings resolved

**2 blockers, 4 majors, ~21 minors, ~13 nits — all closed.**

```
packages/ui  check-types ... clean
packages/ui  lint ......... clean          (eslint --max-warnings 0)
packages/ui  test ......... 148 / 148 pass (was 120 before the fixes)
registry     check ......... Registry covers 41 package exports.
playground   check-types .. clean
playground   next build ... exit 0
```

---

## Blockers — fixed

### B1 — resizable chevron press started a panel drag
`react-resizable-panels` registers its `pointerdown` listener on `ownerDocument` in the **capture** phase (`react-resizable-panels.js:2037`, `u.addEventListener("pointerdown", Ct, !0)`). Capture on `document` runs before every descendant listener, so the old `onPointerDown.stopPropagation()` could never stop it — every chevron press also entered the drag state and moved focus off the button.

Fixed with a module-scope document-capture guard that calls `preventDefault()`, which is the one signal the library reads (`if (e.defaultPrevented) return`). The predicate `isCollapseAffordance()` lives in `resizable-utils.ts` so it is unit-tested, and the comment records *why* document-capture is required so nobody simplifies it back.

### B2 — destructive alert icon invisible in light mode
`--destructive-foreground` is white in light mode in all six themes, and the icon sat on `bg-destructive/10`. Measured contrast **1.25:1** against a WCAG 1.4.11 floor of 3:1 — and correct only in dark mode, so a dark-mode screenshot missed it.

Now uses `text-destructive` → **3.83:1**, matching the convention the shipped toast already used. The JSDoc's false claim ("each `-foreground` token is readable in light and dark") was rewritten to state the real rule. Guarded by a dedicated regression test.

## Majors — fixed

| | Fix |
|---|---|
| **M1** Enter on a chevron collapsed the *wrong* panel and never fired the button — the library `preventDefault()`s Enter in a bubbling keydown handler (`.js:1627`) | `onKeyDown` `stopPropagation()` on both chevrons |
| **M2** Toggling `collapsible` at runtime left chevrons inert — the ref updated but no sibling re-rendered | `registry.bump()` rewrites the entry **in place**, preserving the append-scrambles-order invariant |
| **M3** A second `<AlertAction>` was silently dropped | `splitAlertChildren()` collects every action; fragment-wrapped actions are hoisted too |
| **M4** Colored pill chips became opaque `--surface` boxes, contradicting the file's own "no solid fill" rationale | fill removed; only border, active label and hover carry the hue |

## The test gap — addressed within the repo's harness

No test in this repo renders a component, and `node --experimental-strip-types` **cannot** import `.tsx` (verified: `ERR_UNKNOWN_FILE_EXTENSION`). That is why the old suite passed 31/31 against a component whose chevrons were complete no-ops.

Within the existing harness, logic that is worth testing now lives in `*-utils.ts` modules (the repo's own convention — `resizable-utils`, `progress-utils`, `calendar-utils`): `alert-utils.ts` is new, `isCollapseAffordance` and the DOM-order sort are new. Real behavioural tests replaced source-text greps, including the test that asserted the B1 bug.

**Not addressed:** component render/DOM-interaction tests. That needs a real DOM harness (vitest/jsdom), which is a separate infrastructure change. Left deliberately rather than half-built.

## Notable structural fixes

- **`panel-chrome.ts` / `panel-chrome-icon.tsx`** — the four panel-chrome class constants and the close icon were duplicated byte-for-byte across Sheet/Drawer (and the icon across Dialog too). Now one source. All 23 resolved class strings verified byte-identical to before.
- **`tone-icon.tsx`** — Alert and Toast had near-identical tone glyphs that had already drifted apart. Now one `ToneIcon`.
- **`sheetDefaultSide`** — Sheet had two sources of truth for its default side; the cva's `defaultVariants` was unreachable and every default-path test exercised a path production never takes.
- **Brand hue tokens** — the 54 raw Tailwind palette utilities in Tabs bypassed the token layer. Rather than rewrite 54 call sites, the six hue ramps were added to the token layer and mapped in `@theme`, so the existing classes now resolve to repo tokens. Verified by A/B through the build's own minifier: **30/30 shades byte-identical, zero visual change.** They are deliberately theme-*independent* — a tab colour is an identity, not a state.
- **Extensionless panel-chrome imports** — sheet and drawer variants re-export `./panel-chrome` without a `.ts` suffix so a copied registry file typechecks. The UI test script registers a resolver that appends `.ts` for Node.

## Known, deliberate, and left

- **`className` is `Omit`ted from `TabsTrigger`** — pre-existing on `main`. Fixing it changes shipped merge semantics and needs a deliberate call. Alert and Sheet had their `Omit` removed and now merge `className`.
- **`title` on `SheetContent` / `DialogContent`** is now an accessible-name escape hatch that renders an `sr-only` Radix Title. Radix previously passed it through as the native HTML `title` tooltip attribute, so there is a semantic collision: a consumer who passed `title` for a tooltip now gets an accessible name instead. On a modal panel the accessible name is the more valuable of the two, but it is a behaviour change.
- **`aria-expanded` on chevrons can go stale** if a panel is collapsed via the separator's own Enter or its double-click reset — there is no event to subscribe to. Documented rather than papered over.
- **`apps/playground` lint fails locally** with 900 warnings, all from `public/pdfjs/wasm/openjpeg_nowasm_fallback.js`. That path is **git-ignored** (`apps/playground/.gitignore:2`) and generated by `prebuild`, so CI is unaffected — it is a local annoyance that wants an eslint ignore for `public/pdfjs/**`.