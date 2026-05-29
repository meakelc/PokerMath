---
baseline_commit: 3da33a0cf86811c1f4da168c09891e788e38ae49
---

# Story 1.2: "Deep Table" design-token layer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want the app to present the calm felt-and-gold visual identity,
so that the study tool feels composed and legible from the first screen.

## Acceptance Criteria

**AC1 — `tokens.css` transcribes every DESIGN.md token**
**Given** the DESIGN.md "Deep Table" frontmatter
**When** `src/styles/tokens.css` is created
**Then** every color, typography, spacing, radius, and component-spec token is present as a kebab-case, category-prefixed CSS custom property (e.g., `--color-felt`, `--color-suit-heart`, `--space-4`, `--radius-sm`), one token per DESIGN.md entry (AR-2, UX-DR21)

**AC2 — three type families loaded & applied**
**Given** the three type families Fraunces, Inter, and JetBrains Mono
**When** the app loads
**Then** all three families are loaded and applied per the typography tokens

**AC3 — `global.css` applies felt base globally**
**Given** `src/styles/global.css`
**When** the app renders
**Then** the felt background, base Inter body typography, and resets are applied globally

**AC4 — token discipline & palette containment**
**Given** a value that has a token
**When** any component is styled
**Then** it references `var(--…)` and never hardcodes that hex/size (AR-2 enforcement)
**And** no accent hue beyond felt + gold + the two feedback states + the four fixed suit colors is introduced

## Tasks / Subtasks

- [x] **Task 1: Create `src/styles/tokens.css` — the single styling source of truth (AC: #1, #4)**
  - [x] Create the `pokermath/src/styles/` directory (does not exist yet).
  - [x] Define ALL tokens on a single `:root { … }` block as CSS custom properties. Transcribe **verbatim** from the DESIGN.md frontmatter — values are pre-verified in Dev Notes → **Token Reference (authoritative)**. Do not re-derive or "improve" values; copy them.
  - [x] **Colors** (`--color-<key>`): all 22 color entries (felt, felt-deep, felt-panel, text-on-felt, text-on-felt-dim, sidebar, sidebar-text, sidebar-text-dim, sidebar-active, sidebar-border, gold, gold-deep, gold-ink, success, success-tint, hint, hint-tint, card-face, suit-heart, suit-diamond, suit-club, suit-spade).
  - [x] **Typography** (`--font-<key>`): all 9 entries as CSS `font` shorthand (`weight size/line-height family`), plus `--tracking-display-lg` and `--tracking-label-caps` for the two entries carrying `letterSpacing`.
  - [x] **Radius** (`--radius-<key>`): all 5 entries from the `rounded` block (sm, md, lg, card, full).
  - [x] **Spacing** (`--space-<key>`): all 10 entries (unit, 1, 2, 3, 4, 6, 8, 10, content-pad, section-gap).
  - [x] **Component-spec tokens**: tokenize only the *raw literal values* introduced by the `components` block that are NOT already a token — shadows, translucent hairline borders, scrim, card ratio, control height, primary-button padding. Component entries that are pure `{…}` references to existing tokens do NOT get a duplicate token (see Dev Notes → **Component-spec token scope**).
  - [x] Verify against AC4: introduce no color outside felt + gold(+gold-deep/gold-ink) + success/hint(+tints) + the four suit colors + the neutrals already in the frontmatter (sidebar greys, card-face white, text-on-felt). No new hues.

- [x] **Task 2: Load the three font families (AC: #2)**
  - [x] Add the Google Fonts `<link>` (with `preconnect`) to `pokermath/index.html` `<head>`, using the exact URL from the mockups (Dev Notes → **Font loading**). This is the approach the locked mockups used and adds **no** npm dependency (honors AR-1 stack lock).
  - [x] Confirm the requested weights cover what the tokens use: Fraunces 500/600, Inter 400/500/600, JetBrains Mono 600 (the mockup URL already requests these supersets).

- [x] **Task 3: Create `src/styles/global.css` — base resets + felt canvas (AC: #2, #3, #4)**
  - [x] First line: `@import './tokens.css';` so tokens resolve wherever global.css is loaded.
  - [x] Apply a minimal reset: `*, *::before, *::after { box-sizing: border-box; }` and zero default margins on `body`.
  - [x] Set the felt canvas on `body`: `background: var(--color-felt);` and base text `color: var(--color-text-on-felt);`.
  - [x] Apply base Inter body typography on `body`: `font: var(--font-body-lg);` (this is the Inter `body-lg` token). Every value via `var(--…)` — no hardcoded hex/size (AC4).
  - [x] Do NOT build the two-pane frame, sidebar, or any layout here — that is Story 1.3 (UX-DR1, AR-6). Keep global.css to resets + base type + felt background only.

- [x] **Task 4: Wire the new style layer into the app & retire `app.css` (AC: #2, #3)**
  - [x] In `pokermath/src/main.ts`, replace `import './app.css'` with `import './styles/global.css'` (global.css pulls in tokens.css via its `@import`).
  - [x] Delete `pokermath/src/app.css` (its `body { margin: 0 }` reset is now subsumed by global.css; the architecture target tree has no `app.css` — only `styles/tokens.css` + `styles/global.css`).
  - [x] Confirm no other file imports `./app.css` (only `main.ts` did per Story 1.1).

- [x] **Task 5: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run check` → svelte-check + tsc report 0 errors (CSS-only change must not regress type-checking).
  - [x] `npm run build` → succeeds and emits `dist/` with the bundled CSS (AR-8); confirm the Google Fonts `<link>` is present in the built `dist/index.html`.
  - [x] `npm run test` → still green (the Story 1.1 smoke test must keep passing; no new unit tests are introduced — see Dev Notes → **Testing standards**).
  - [x] `npm run dev` → open the app and visually confirm: the page background is the deep felt green and body text renders in Inter (not the browser default serif/sans). Stop the dev server afterward (long-lived process).
  - [x] Record exact command outputs in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story builds **only** the styling foundation: `tokens.css`, `global.css`, font loading, and the `main.ts`/`app.css` rewiring. It is the visual base every later screen inherits.

**Do NOT** in this story:
- Build the two-pane layout, Sidebar, or content frame → Story 1.3 (`AR-6`, `UX-DR1`).
- Create `appState.svelte.ts` or `sections.ts` → Story 1.3 (`AR-5`).
- Build any component (PlayingCard, inputs, Pager, etc.) → those tokens are *defined* here but *consumed* in later stories.
- Add any npm dependency (`AR-1` stack is locked: Svelte 5 + TS + Vite + Vitest + svelte-check only). Fonts load via `<link>`, not a package. [Source: epics.md AR-1; architecture.md:131-147]

`App.svelte` stays the minimal `<main>` placeholder from Story 1.1 — do not touch it.

### Token Reference (authoritative)

Transcribed and verified against `DESIGN.md` frontmatter (the source of truth). Naming follows the architecture convention: **kebab-case, category-prefixed, one token per entry**. [Source: DESIGN.md:10-157; architecture.md:280-283]

**Colors** — `--color-<key>`:
```
--color-felt: #0b3d2c;
--color-felt-deep: #07291d;
--color-felt-panel: #0e4a36;
--color-text-on-felt: #eef2ef;
--color-text-on-felt-dim: #a9c2b6;
--color-sidebar: #eef0ee;
--color-sidebar-text: #20262a;
--color-sidebar-text-dim: #79847c;
--color-sidebar-active: #dfe6e2;
--color-sidebar-border: #dcdfda;
--color-gold: #e0b24c;
--color-gold-deep: #c8973a;
--color-gold-ink: #241a07;
--color-success: #34b27a;
--color-success-tint: rgba(52,178,122,0.14);
--color-hint: #e08a3c;
--color-hint-tint: rgba(224,138,60,0.14);
--color-card-face: #ffffff;
--color-suit-heart: #d0322f;
--color-suit-diamond: #2e6fd6;
--color-suit-club: #1f9d55;
--color-suit-spade: #1a1a1a;
```

**Typography** — `--font-<key>` as the CSS `font` shorthand (`weight size/line-height family`), with fallback stacks. The two `letterSpacing` values become companion `--tracking-*` tokens (letter-spacing is not part of the `font` shorthand):
```
--font-display-lg: 600 30px/1.15 'Fraunces', serif;
--font-heading-md: 600 23px/1.2 'Fraunces', serif;
--font-heading-sm: 500 19px/1.3 'Fraunces', serif;
--font-body-lg: 400 16px/1.6 'Inter', sans-serif;
--font-body-md: 400 14px/1.5 'Inter', sans-serif;
--font-label-caps: 600 11px/1.4 'Inter', sans-serif;
--font-caption: 400 12px/1.4 'Inter', sans-serif;
--font-value: 600 15px/1.2 'JetBrains Mono', monospace;
--font-value-lg: 600 24px/1.1 'JetBrains Mono', monospace;
--tracking-display-lg: -0.01em;
--tracking-label-caps: 0.09em;
```
> Mono values (`value`, `value-lg`) want tabular figures where used (`font-variant-numeric: tabular-nums`), per DESIGN.md ("Monospace + tabular figures"). That is applied per-use in the consuming component, not on the global body — note it, don't globally force it here. [Source: DESIGN.md:185]

**Radius** (DESIGN.md `rounded`) — `--radius-<key>`:
```
--radius-sm: 6px;
--radius-md: 9px;
--radius-lg: 12px;
--radius-card: 8px;
--radius-full: 9999px;
```

**Spacing** (DESIGN.md `spacing`) — `--space-<key>`:
```
--space-unit: 8px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-content-pad: 36px;
--space-section-gap: 24px;
```

**Component-spec tokens** — the raw literal values the `components` block introduces that no other token covers. Recommended names (kebab-case, category-prefixed); the dev may refine names but must keep one token per distinct raw value and never hardcode these later:
```
/* elevation — DESIGN.md "Elevation & Depth" / component shadows */
--shadow-card: 0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.22);
--shadow-panel: 0 4px 20px rgba(0,0,0,0.28);
--shadow-modal: 0 24px 60px rgba(0,0,0,0.5);
--shadow-button-primary: 0 1px 0 var(--color-gold-deep);
/* translucent white hairline borders (distinct opacities) */
--border-hairline: 1px solid rgba(255,255,255,0.06);   /* assessment-panel */
--border-control: 1px solid rgba(255,255,255,0.16);    /* input-field, toggle-button */
--border-ghost: 1px solid rgba(255,255,255,0.2);       /* button-ghost */
/* misc component literals */
--color-scrim: rgba(7,41,29,0.55);   /* cheat-sheet-modal scrim */
--ratio-card: 2 / 3;                 /* playing-card face aspect-ratio */
--control-height: 40px;              /* input-field height */
--padding-button-primary: 11px 22px; /* button-primary (11/22 are not on the 8px scale) */
```

### Component-spec token scope

DESIGN.md's `components` block mostly *references* existing tokens via `{colors.x}` / `{rounded.y}` / `{spacing.z}` / `{typography.t}`. Those references do **not** each become a new token — the consuming component (built in a later story) composes them inline as `var(--color-gold)`, `var(--radius-sm)`, etc. Only the **raw literals** that have no upstream token (the shadows, the three translucent border opacities, the scrim, the card ratio, the control height, and the `11px 22px` primary-button padding) get tokenized now — listed above. This prevents two failure modes: hardcoded shadow/border values appearing in later components (violates AR-2), and a bloat of redundant alias tokens. [Source: DESIGN.md:98-157; architecture.md:358, 462]

### Font loading

The locked mockups load the three families via Google Fonts `<link>` in `<head>` — copy this exactly into `pokermath/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```
This adds no dependency and matches the mockup reference. Tradeoff (noted, not blocking): it is a runtime network fetch, so a fully offline `file://` open would fall back to the stack fallbacks (`serif`/`sans-serif`/`monospace`). The spec requires "opened locally OR static host" (AR-8) but does not mandate offline-with-fonts; the `<link>` approach is the intended one per the mockups. If true offline fidelity is later required, self-hosting via `@fontsource` would be a separate, dependency-adding change — out of scope here. [Source: mockups/key-screen-assessment.html:7-9; epics.md AR-8]

### File structure & rewiring

Target end-state for touched paths (subset of the architecture's directory tree):
- `pokermath/src/styles/tokens.css` — **new**, all tokens on `:root` (the styling SoT). [Source: architecture.md:398-400, 462]
- `pokermath/src/styles/global.css` — **new**, `@import './tokens.css';` + resets + felt body background + base Inter type. [Source: architecture.md:400]
- `pokermath/index.html` — **modified**, add font `<link>`s in `<head>` (after the existing `<link rel="icon">`). [Source: pokermath/index.html:3-8]
- `pokermath/src/main.ts` — **modified**, swap `import './app.css'` → `import './styles/global.css'`. [Source: pokermath/src/main.ts:2]
- `pokermath/src/app.css` — **deleted** (subsumed; not in architecture target tree). [Source: architecture.md:394-400]

Current state of files being modified (verified 2026-05-29):
- `src/main.ts` mounts `App` into `#app` via Svelte 5 `mount()`; line 2 is `import './app.css'`. Leave the `mount()` idiom intact — only change the CSS import path. [Source: pokermath/src/main.ts:1-9]
- `src/app.css` currently holds only `body { margin: 0; }` (Story 1.1 minimal reset). Safe to delete once global.css covers the reset. [Source: pokermath/src/app.css:1-3]
- `index.html` has `<div id="app">` mount target and favicon link; no font links yet. [Source: pokermath/index.html:1-13]
- `App.svelte` is the minimal `<main>` placeholder — **not touched** by this story. [Source: pokermath/src/App.svelte:1-3]
- No `src/styles/` directory exists yet — create it. [Source: verified scaffold tree]

### Architecture compliance (guardrails)

- **Plain CSS + custom properties only.** No Tailwind, no CSS-in-JS, no preprocessor. `styles/tokens.css` is the single home for design values; everything references `var(--…)`. [Source: architecture.md:133-134, 219-222, 462-463; epics.md AR-2]
- **Token naming:** kebab-case, category-prefixed, one token per DESIGN.md entry, mirroring DESIGN.md. Never hardcode a hex/size that has a token. [Source: architecture.md:280-283, 358]
- **Stack locked:** no new runtime/build library (fonts via `<link>`, not a package). [Source: epics.md AR-1; architecture.md:131-147]
- **Build is static:** `vite build` → `dist/`; CSS is bundled, the font `<link>` rides in `index.html`. [Source: architecture.md:519-522; epics.md AR-8]

### Previous story intelligence (Story 1.1)

- Story 1.1 finalized the scaffold: added `"test": "vitest run"`, configured Vitest in `vite.config.ts` (`environment: 'node'`), added a temporary `src/smoke.test.ts`, and stripped demo cruft. All four commands (`dev`/`build`/`check`/`test`) verified green. [Source: 1-1-…md Completion Notes]
- 1.1 deliberately left `app.css` as a minimal `body { margin: 0 }` and **did not** create `tokens.css`/`global.css` — it explicitly deferred the token layer to this story (AR-2). You are picking up exactly where it stopped. [Source: 1-1-…md Task 3, Dev Notes scope boundary]
- The smoke test is temporary but must stay green until real engine tests land in Epic 3 — do not delete it here. [Source: 1-1-…md:97, Testing standards]
- `tsconfig.app.json` excludes `*.test.ts`/`*.spec.ts` (a 1.1 review fix). CSS-only work here doesn't interact with that, but don't reintroduce test files into the app tsconfig scope. [Source: 1-1-…md Review Findings]
- Dev model on 1.1 was `claude-sonnet-4-6`; commits `3f19e1e` (scaffold) and `3da33a0` (review complete). Recent work pattern: small, verified, per-AC commits with command outputs recorded. Follow the same discipline.

### Testing standards

- **No new automated tests required for this story.** It is pure CSS + markup (font link) + an import rewire. Component/visual tests are optional at this scale; only the assessment engine (Epic 3) is mandated for unit tests. [Source: architecture.md:294-301; 1-1-…md Testing standards]
- Verification is via the four commands (Task 5) + a visual confirmation in `npm run dev` that the felt background and Inter body type render. Do not invent a brittle CSS-snapshot test.
- Co-located-test convention (`x.ts` ↔ `x.test.ts`, no `__tests__/`) still governs any future tests. [Source: architecture.md:294-295]

### Project Structure Notes

- All work happens inside `pokermath/` (the Vite project root). The repo root (`_bmad/`, `_bmad-output/`, `docs/`) is untouched.
- This story produces a strict subset of the architecture's target tree (adds `src/styles/`, removes the transitional `app.css`). No structural conflicts. [Source: architecture.md:383-445]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2] — story statement + acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements] — AR-1 (stack lock), AR-2 (design tokens layer), AR-8 (static deploy)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — frontmatter (lines 10-157) = token source of truth; prose (Colors/Typography/Layout/Elevation/Shapes/Components) = intent
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Conventions] — lines 280-283 (CSS custom property naming)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Directory-Structure] — lines 383-445 (`src/styles/tokens.css` + `global.css`; no `app.css`)
- [Source: _bmad-output/planning-artifacts/architecture.md#Architectural-Boundaries] — line 462 (styling boundary: tokens.css is the only home for design values)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-assessment.html] — lines 7-9 (font `<link>` approach)
- [Source: pokermath/index.html], [Source: pokermath/src/main.ts], [Source: pokermath/src/app.css] — current scaffold state
- [Source: _bmad-output/implementation-artifacts/1-1-verified-project-scaffold-test-harness.md] — previous-story learnings + deferred token layer

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation proceeded without errors.

### Completion Notes List

- Created `pokermath/src/styles/` directory (new).
- `tokens.css`: 22 color tokens, 9 font + 2 tracking tokens, 5 radius, 10 spacing, 11 component-spec tokens. All values copied verbatim from Dev Notes Token Reference. AC4 palette containment verified — no hue outside felt/gold/success/hint/suits/neutrals.
- `index.html`: Added preconnect + Google Fonts `<link>` for Fraunces (400/500/600 optical size), Inter (400/500/600/700), JetBrains Mono (400/600). No npm dependency added (AR-1 compliant).
- `global.css`: `@import './tokens.css'` → box-sizing reset → `body { margin:0; background: var(--color-felt); color: var(--color-text-on-felt); font: var(--font-body-lg); }`. No layout, no hardcoded values.
- `main.ts`: swapped `import './app.css'` → `import './styles/global.css'`. No other changes.
- `app.css`: deleted (subsumed; not in architecture target tree).
- Command outputs:
  - `npm run check`: 85 files, 0 errors, 0 warnings
  - `npm run build`: ✓ built in 156ms — `dist/assets/index-OvYbLPUl.css` (1.89 kB), Google Fonts link confirmed in `dist/index.html`
  - `npm run test`: 1 passed (1) — smoke test green
  - `npm run dev`: server started at localhost:5173, CSS served confirmed body rules `background: var(--color-felt)` and `font: var(--font-body-lg)` active, server stopped.

### File List

- pokermath/src/styles/tokens.css (new)
- pokermath/src/styles/global.css (new)
- pokermath/index.html (modified)
- pokermath/src/main.ts (modified)
- pokermath/src/app.css (deleted)

### Review Findings

- [x] [Review][Defer] Google Fonts offline/blocked — silent font degradation [pokermath/index.html:6-8] — deferred, acknowledged tradeoff per spec; fallback stacks present in all font tokens
- [x] [Review][Defer] `font-display: swap` behavior controlled by CDN URL — invisible in code [pokermath/index.html:8] — deferred, documentation concern only
- [x] [Review][Defer] Typography companion tokens (`--tracking-*`) must be applied separately; `--font-label-caps` implies caps but no `text-transform` companion [pokermath/src/styles/tokens.css:27-40] — deferred, intentional per CSS `font` shorthand limitations
- [x] [Review][Defer] `--ratio-card: 2 / 3` browser compatibility — older browsers without `aspect-ratio` support; token not yet consumed [pokermath/src/styles/tokens.css:68] — deferred, pre-existing browser target concern
- [x] [Review][Defer] `--shadow-button-primary` lacks hover/active state variants [pokermath/src/styles/tokens.css:60] — deferred, future story scope (button component)
- [x] [Review][Defer] rgba() tints duplicate base color RGB literals (`success-tint`, `hint-tint`) [pokermath/src/styles/tokens.css:16,18] — deferred, verbatim DESIGN.md transcription; `color-mix()` refactor is future work

### Change Log

- 2026-05-29: Story 1.2 implemented — design-token layer established. Created `tokens.css` (all DESIGN.md tokens) and `global.css` (resets + felt canvas). Loaded Fraunces/Inter/JetBrains Mono via Google Fonts `<link>`. Rewired `main.ts` import, deleted transitional `app.css`. All four verification commands pass.
- 2026-05-29: Code review complete — 0 patches, 6 deferred, 6 dismissed. Story marked done.
