---
baseline_commit: 879eb1dc96404247f63c6d7599837dbbc71a0d13
---

# Story 1.3: Two-pane app frame & in-memory state store

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a persistent two-pane layout that always shows one Section's content, with nothing saved between visits,
so that I have a stable place to work and a reload always starts me fresh.

## Acceptance Criteria

**AC1 — single reactive store with `currentSection` (AR-5)**
**Given** `src/lib/appState.svelte.ts`
**When** the store is created
**Then** it exposes Svelte 5 `$state` including `currentSection` and is the single source of mutable runtime state (AR-5)

**AC2 — `sections.ts` lists the four Sections in fixed order**
**Given** `src/content/sections.ts`
**When** it is defined
**Then** it lists the four Sections in fixed order (Introduction, Equity/LO1, Pot Odds/LO2, Calling Profitably/LO3) with `id`, `title`, `subtitle`, and `kind`

**AC3 — fixed two-pane frame (UX-DR1)**
**Given** `App.svelte`
**When** the app mounts
**Then** it renders a fixed two-pane layout — a persistent left sidebar (~248px) + a felt content area filling the rest + a modal-layer slot — with no responsive reflow (UX-DR1)

**AC4 — reactive Section selection, no router (AR-6)**
**Given** `currentSection`
**When** the content area renders
**Then** a reactive Section index (no router) selects exactly that Section's screen (AR-6)

**AC5 — reload is a cold start; no persistence surface (FR-3, UX-DR21)**
**Given** any in-memory state
**When** the page is reloaded
**Then** the app returns to the Introduction with all state cleared — no resume prompt (FR-3, UX-DR21)
**And** no login, account, save, or resume control exists anywhere in the UI (FR-3)

## Tasks / Subtasks

- [x] **Task 1: Create `src/content/sections.ts` — the ordered Section metadata (AC: #2)**
  - [x] Create the `pokermath/src/content/` directory (does not exist yet).
  - [x] Define and export a `SectionKind` union `'informational' | 'assessment'` and a `Section` type `{ id: SectionId; title: string; subtitle: string; kind: SectionKind }`. Type names PascalCase, no `I`-prefix. [Source: architecture.md:275-276]
  - [x] Define a `SectionId` string-literal union for stable ids: `'intro' | 'equity' | 'pot-odds' | 'calling'` (kebab-case ids). Use these ids as the stable identity — never index numbers — for cross-story references.
  - [x] Export `const sections: readonly Section[]` with EXACTLY these four entries, in THIS order (verbatim copy from Dev Notes → **Section Metadata (authoritative)** — do not paraphrase titles/subtitles):
    1. `intro` — "Introduction" / "Poker & hand notation" / `informational`
    2. `equity` — "Equity & the Rule of 2-and-4" / "LO1 · estimate your equity" / `assessment`
    3. `pot-odds` — "Pot Odds" / "LO2 · price of a call" / `assessment`
    4. `calling` — "Calling Profitably" / "LO3 · is the call +EV?" / `assessment`
  - [x] Mark the array `as const` (or `readonly Section[]`) so the fixed order is type-enforced and cannot be mutated at runtime (the order encodes LDR-2 sequential dependency). [Source: epics.md LDR-2]
  - [x] Do NOT add nav-rendering logic, click handlers, or `✓`/active styling here — this file is pure data only (Sidebar rendering is Story 1.4). [Source: epics.md Story 1.4]

- [x] **Task 2: Create `src/lib/appState.svelte.ts` — the single reactive store (AC: #1, #5)**
  - [x] Create `pokermath/src/lib/` directory (does not exist yet).
  - [x] Export a single `$state` object holding mutable runtime state, starting with `currentSection: 0` (index into `sections`, so cold-start = Introduction). Use the `.svelte.ts` extension because the module bears a rune. [Source: architecture.md:273, 318-322]
  - [x] Use the direct-mutation idiom: the store is an exported `$state` object whose fields are reassigned in place (`appState.currentSection = i`). Do NOT add reducers/actions, immutable-copy ceremony, or any external state library. [Source: architecture.md:319-323, 361]
  - [x] This story seeds ONLY `currentSection`. Do NOT add per-LO assessment state or the cheat-sheet modal target yet — those fields land with their owning stories (Epic 2/3); over-seeding now is speculative scope. Add a brief comment noting the store will grow to hold those fields. [Source: architecture.md:200-202, 403-404]
  - [x] **No persistence (AC5):** the store is plain in-memory module state. Do NOT touch `localStorage`, `sessionStorage`, cookies, `IndexedDB`, or any URL/hash state. A reload re-imports the module fresh → `currentSection` is `0` → Introduction, with zero persistence code. This satisfies FR-3 by construction. [Source: architecture.md:200-202, 470-471; epics.md FR-3]

- [x] **Task 3: Build the two-pane frame in `App.svelte` (AC: #3, #4, #5)**
  - [x] Replace the Story-1.1 placeholder `<main>` in `pokermath/src/App.svelte` with the two-pane frame. This is the file Story 1.2 explicitly left untouched for this story. [Source: pokermath/src/App.svelte:1-3; 1-2-…md:87]
  - [x] Layout: a CSS Grid with `grid-template-columns: 248px 1fr` — a persistent left `<aside>` sidebar region (~248px) + a felt content `<main>` filling the rest. No media queries, no `minmax`/`fr`-collapse, no responsive reflow (desktop-only by spec, UX-DR1). [Source: DESIGN.md:191; mockups/key-screen-informational.html:22]
  - [x] Sidebar region: `background: var(--color-sidebar)`. In THIS story it is a structural placeholder — render the brand wordmark only (or an empty styled region). Do NOT build the four nav items, active highlight, `✓`, or click-to-jump — that is Story 1.4 (`Sidebar.svelte` + `SidebarNavItem.svelte`). [Source: epics.md Story 1.4; architecture.md:415-417]
  - [x] Content `<main>`: `background: var(--color-felt)`, padding `var(--space-content-pad)`. It renders the reactive Section placeholder (Task 4). Do NOT build the Pager here (Story 1.5) or the Informational/Assessment archetypes (Epic 2/3). [Source: epics.md Story 1.5, 2.2, 3.4]
  - [x] Modal-layer slot (AC3): include a reserved overlay container element (e.g., an empty `<div class="modal-layer">`) that later hosts `CheatSheetModal` (Story 2.7). Leave it empty/inert now — its presence satisfies "+ a modal-layer slot"; its behavior is out of scope. [Source: architecture.md:396, 425; epics.md Story 2.7]
  - [x] **Token discipline (inherited AC from 1.2):** every color/spacing value that has a token must be `var(--…)`; never hardcode a hex/size that has a token. The `248px` sidebar width has NO token (layout literal, not in DESIGN.md) and may stay a literal. [Source: architecture.md:358, 462; 1-2-…md AC4]
  - [x] No login/account/save/resume control anywhere in the frame markup (AC5). [Source: epics.md FR-3]

- [x] **Task 4: Wire reactive, router-free Section selection (AC: #4)**
  - [x] In `App.svelte`, import `appState` from `./lib/appState.svelte` and `sections` from `./content/sections`. Derive the active Section: `const active = $derived(sections[appState.currentSection])`. [Source: architecture.md:204-207, 318-326]
  - [x] In the content `<main>`, render the active Section via a reactive index — NOT a router, NOT URL/hash routing. A minimal placeholder is correct for this story: show `active.title` (display-lg) + `active.subtitle` so the reactive switch is provably wired. The real archetypes replace this placeholder in Epic 2/3. [Source: architecture.md:204-206, 427-429]
  - [x] Confirm there is genuinely no router: no `svelte-routing`/`page.js`/hash listener/`history` usage. The "screen" is purely a function of `appState.currentSection`. (No npm dependency may be added — AR-1 stack lock.) [Source: architecture.md:204-206; epics.md AR-1]
  - [x] Do NOT add Back/Next or sidebar click wiring to drive the index in this story — there is no UI control that changes `currentSection` yet (that arrives in 1.4 sidebar + 1.5 pager). The reactive plumbing must be correct and demonstrable; a temporary manual proof is acceptable during dev but must NOT ship (see Task 5 visual check). [Source: epics.md Story 1.4, 1.5]

- [x] **Task 5: Optional lightweight data guard + verify (AC: #1, #2, #3, #4, #5)**
  - [x] *(Recommended, not mandated)* Add `src/content/sections.test.ts` — a pure-data Vitest test (runs in the existing `node` env; `sections.ts` has no Svelte/rune imports so it imports cleanly). Assert: exactly 4 sections; ids in order `['intro','equity','pot-odds','calling']`; `sections[0].kind === 'informational'`; the three LO sections are `'assessment'`. This guards the FR-1/LDR-2 fixed order against future edits. Do NOT attempt to unit-test `appState.svelte.ts` — runes require the Svelte compiler, which the node test env does not load (out of scope; no mandate). [Source: architecture.md:294-301; epics.md LDR-2]
  - [x] `npm run check` → svelte-check + tsc report 0 errors.
  - [x] `npm run test` → green (Story 1.1 smoke test stays passing; plus the new `sections.test.ts` if added). [Source: 1-1-…md:97; 1-2-…md:71]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] `npm run dev` → open the app; confirm the two-pane frame renders (light sidebar left, felt content right, no reflow when the window resizes) and the content area shows the Introduction title/subtitle on cold load. Temporarily set `appState.currentSection = 1` in dev to confirm the content swaps to "Equity & the Rule of 2-and-4" (reactive selection works), then REVERT to `0` before committing. Reload confirms it returns to Introduction. Stop the dev server afterward (long-lived process). [Source: epics.md FR-3, UX-DR21]
  - [x] Record exact command outputs in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story builds the **walking-skeleton frame + state hub**: the single reactive store (`appState.svelte.ts`), the ordered Section data (`sections.ts`), the persistent two-pane `App.svelte` layout, and router-free reactive Section selection. Every later screen mounts inside this frame and reads/writes this store.

**Do NOT** in this story:
- Build `Sidebar.svelte` / `SidebarNavItem.svelte` nav items, active highlight, `✓`, or click-to-jump → **Story 1.4** (`FR-2`, `UX-DR2`). The sidebar is a styled *placeholder region* here.
- Build `Pager.svelte` (Back/Next) → **Story 1.5** (`FR-1`, `UX-DR15`).
- Add keyboard/focus/restrained-motion polish or Section-switch transitions → **Story 1.6** (`UX-DR18/19/20`). Render the placeholder with no transition for now.
- Build `InformationalScreen.svelte` / `AssessmentScreen.svelte` archetypes or any authored content → **Epic 2/3**. Use a minimal title/subtitle placeholder in the content area.
- Build `CheatSheetModal.svelte` or any modal behavior → **Story 2.7**. Only the empty modal-layer *slot* exists now.
- Seed assessment state or the cheat-sheet target on the store → their owning stories (Epic 2/3). Seed only `currentSection`.
- Add any npm dependency (`AR-1` stack is locked: Svelte 5 + TS + Vite + Vitest + svelte-check only). No router package. [Source: epics.md AR-1; architecture.md:131-147]

### Section Metadata (authoritative)

Transcribed from EXPERIENCE.md's Section map and the locked sidebar mockup (source of truth for the exact title/subtitle strings). Copy verbatim — these strings are reused by the sidebar (1.4) and must match. [Source: EXPERIENCE.md:28-31; mockups/key-screen-informational.html:72-77]

| order | `id` | `title` | `subtitle` | `kind` |
|---|---|---|---|---|
| 0 | `intro` | `Introduction` | `Poker & hand notation` | `informational` |
| 1 | `equity` | `Equity & the Rule of 2-and-4` | `LO1 · estimate your equity` | `assessment` |
| 2 | `pot-odds` | `Pot Odds` | `LO2 · price of a call` | `assessment` |
| 3 | `calling` | `Calling Profitably` | `LO3 · is the call +EV?` | `assessment` |

> The `·` separators in the subtitles are middle-dot `U+00B7` (as in the mockup), and the ampersand in the Introduction subtitle is a literal `&`. In `.svelte` markup these may need entity-escaping (`&amp;`, `·`); in `sections.ts` (plain TS strings) use the literal characters.

**On the `kind` field (design judgment — flagged below):** `kind` is the *screen-archetype discriminator* that Story 2.2 (`InformationalScreen` renders `kind === 'informational'`) and Story 3.4 (`AssessmentScreen` renders assessment Sections) switch on. Introduction is purely informational; the three LO Sections culminate in a computed assessment, so they are typed `'assessment'` here. The LO Sections also carry instructional prose (FR-4 / Stories 2.4–2.6); how that prose composes into the assessment-kind screen is an Epic 2/3 concern — **this story only needs the field to exist and drive the reactive placeholder.** See **Open Question** at the end. [Source: epics.md Story 2.2, 3.4, 2.4-2.6; architecture.md:427-429]

### Store shape & idiom

Target shape for `appState.svelte.ts` (grows in later stories; seed only `currentSection` now):

```ts
// src/lib/appState.svelte.ts
// Single source of mutable runtime state (AR-5). Grows to hold per-LO
// assessment state and the cheat-sheet modal target in Epic 2/3.
export const appState = $state({
  currentSection: 0, // index into content/sections.ts; 0 = Introduction (cold start)
});
```

- Mutate directly: `appState.currentSection = 2`. No setter ceremony. [Source: architecture.md:319-323]
- Read in components via the imported object; derive with `$derived` (e.g. `const active = $derived(sections[appState.currentSection])`). Never recompute derived values by hand in markup. [Source: architecture.md:324-326]
- Exporting a `$state` **object** (not a bare primitive) is deliberate — it preserves cross-module reactivity on field mutation, which a re-exported primitive would lose. [Source: architecture.md:318-322]

### Frame composition reference

The locked informational mockup is the composition reference for the frame (spine wins on conflict). The relevant skeleton (strip the mockup's inline hex — use tokens instead): [Source: mockups/key-screen-informational.html:22-41, 70-100; EXPERIENCE.md:34-38]

```
.app  → display:grid; grid-template-columns:248px 1fr;   /* the two-pane frame */
  .side  (aside) → background: var(--color-sidebar);     /* 1.3: placeholder region only */
  .main  (main)  → background: var(--color-felt);
                   padding: var(--space-content-pad);     /* reactive Section placeholder */
.modal-layer (div) → reserved overlay slot, empty in 1.3
```

- The mockup defines its own local `--felt`/`--sidebar` vars inline; **ignore those** — consume the real tokens from `tokens.css` (`var(--color-felt)`, `var(--color-sidebar)`, `var(--space-content-pad)`). The mockup hexes match the tokens, so there is no visual drift. [Source: 1-2-…md (token layer); architecture.md:462]
- `248px` is a layout literal with no DESIGN.md token — keep it literal (AC4 of 1.2 only forbids hardcoding values that *have* a token). [Source: DESIGN.md:191]
- The content area placeholder may use the `--font-display-lg` token for the title and `--color-text-on-felt-dim` for the subtitle to look intentional, but no archetype chrome (kicker, prose grid, pager, graphic region) — those are Epic 2/3.

### Architecture compliance (guardrails)

- **Single store rule:** `appState.svelte.ts` is the ONLY home for mutable cross-cutting runtime state; UI is a projection of it. No component owns navigation state privately. [Source: architecture.md:454-456, 361]
- **No-router navigation:** the rendered screen is a pure function of `appState.currentSection`; no router, no URL/hash, no `history` API. [Source: architecture.md:204-206, 59]
- **No persistence (FR-3 for free):** in-memory module state only; never touch `localStorage`/`sessionStorage`/cookies/`IndexedDB`. Reload = fresh import = Introduction. No login/account/save/resume control anywhere. [Source: architecture.md:200-202, 166-169; epics.md FR-3, UX-DR21]
- **Content boundary:** Section metadata lives in `src/content/sections.ts` as typed data — not hardcoded in `App.svelte`. [Source: architecture.md:458-460]
- **Naming:** PascalCase types (`Section`, `SectionKind`); camelCase TS data/vars; rune-bearing module uses `.svelte.ts`; CSS via kebab token vars. [Source: architecture.md:269-283]
- **Stack locked:** no new runtime/build library (no router package). [Source: epics.md AR-1; architecture.md:131-147]

### Previous story intelligence (Stories 1.1, 1.2)

- **1.2 deliberately left `App.svelte` as the minimal `<main>` placeholder** and built only the token/style layer — it explicitly deferred the two-pane frame, `appState.svelte.ts`, and `sections.ts` to THIS story. You are picking up exactly where it stopped. [Source: 1-2-…md:80-87, "Do NOT … → Story 1.3"]
- **Tokens are ready to consume:** `tokens.css` (via `global.css` `@import`, imported in `main.ts`) exposes `--color-felt`, `--color-sidebar`, `--color-text-on-felt(-dim)`, `--space-content-pad`, the `--font-*` shorthands, shadows, radii, etc. `global.css` already sets the felt body background + base Inter type — the frame layers on top; do not re-declare those globals. [Source: 1-2-…md File List + Completion Notes]
- **`main.ts` mounts `App` into `#app` via Svelte 5 `mount()`** — leave that idiom intact; this story only changes `App.svelte`'s internals, not the mount. [Source: pokermath/src/main.ts:1-9]
- **`tsconfig.app.json` excludes `*.test.ts`/`*.spec.ts`** (a 1.1 review fix) — the new `sections.test.ts` is correctly excluded from the app type-check scope but still run by Vitest. Don't reintroduce test files into the app tsconfig include. [Source: 1-1-…md Review Findings; tsconfig.app.json:exclude]
- **The `src/smoke.test.ts` is temporary but must stay green** until real engine tests land in Epic 3 — do not delete it. [Source: 1-1-…md:97; 1-2-…md:71]
- **Vitest env is `node`** (`vite.config.ts`) — fine for `sections.test.ts` (pure data); insufficient for rune modules (don't test `appState` here). [Source: pokermath/vite.config.ts]
- **Work discipline established by 1.1/1.2:** small, per-AC, verified commits with command outputs recorded; deferred review items tracked rather than silently dropped. Follow the same. Dev model on 1.1/1.2 was `claude-sonnet-4-6`; commits `3f19e1e`, `3da33a0`, `74e9e04`, `879eb1d`. [Source: git log; 1-2-…md Change Log]

### Git intelligence

Recent commits show a clean per-story cadence (`feat(x.y)` → `review(x.y)`), each touching a tight file set under `pokermath/src/`. Story 1.2 added `src/styles/`, rewired `main.ts`, deleted `app.css`. This story adds `src/lib/` and `src/content/` and rewrites `App.svelte` — a strict forward step in the architecture's target tree with no conflict against prior work. The repo root (`_bmad/`, `_bmad-output/`, `docs/`) stays untouched. [Source: git log -5; architecture.md:383-445]

### Testing standards

- **No new automated test is mandated** for this story — it is the app frame (Svelte UI) + a runes store (needs the Svelte compiler to test) + pure Section data. Only the assessment engine (Epic 3) is the mandated unit-test target. [Source: architecture.md:294-301, 449-452]
- **Recommended minimum:** the `sections.ts` order/length/kind guard (`sections.test.ts`) — cheap, runs in the existing node env, and protects the FR-1/LDR-2 fixed order. This is the pragmatic test floor, consistent with co-located-test convention (`x.ts` ↔ `x.test.ts`, no `__tests__/`). [Source: architecture.md:294-295]
- Frame/store verification is via `npm run check`/`build`/`test`/`dev` (Task 5) + the visual reactive-swap proof. Do not invent a brittle layout-snapshot test.

### Project Structure Notes

This story produces a strict subset of the architecture target tree — adds `src/lib/appState.svelte.ts`, `src/content/sections.ts` (+ optional `sections.test.ts`), and fills in `App.svelte`. No structural conflict. New directories: `src/lib/`, `src/content/`. [Source: architecture.md:383-445]

Files touched:
- `pokermath/src/content/sections.ts` — **new** (ordered Section metadata, typed data). [Source: architecture.md:432]
- `pokermath/src/content/sections.test.ts` — **new, optional** (pure-data order guard). [Source: architecture.md:294]
- `pokermath/src/lib/appState.svelte.ts` — **new** (single `$state` store, seeds `currentSection`). [Source: architecture.md:403-404]
- `pokermath/src/App.svelte` — **modified** (placeholder `<main>` → two-pane frame + reactive Section selection + modal-layer slot). [Source: architecture.md:396; pokermath/src/App.svelte:1-3]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3] — story statement + acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements] — AR-1 (stack lock), AR-5 (single store), AR-6 (no-router nav), AR-8 (static build)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-1/FR-2/FR-3, UX-DR1, UX-DR21, LDR-2; Story 1.4/1.5/1.6/2.7 scope boundaries
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — lines 197-225 (state model, no-router nav, component architecture)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — lines 269-326 (naming, runes mutation idiom, derived values)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — lines 383-463 (target tree, architectural boundaries)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — lines 24-38 (Section map + frame), 74 (cold-open/reload)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — line 191 (fixed two-pane ~248px), 209 (sidebar nav item — for 1.4 context)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-informational.html] — lines 22-41, 70-100 (frame composition reference)
- [Source: pokermath/src/App.svelte], [Source: pokermath/src/main.ts], [Source: pokermath/vite.config.ts], [Source: pokermath/tsconfig.app.json] — current scaffold state
- [Source: _bmad-output/implementation-artifacts/1-2-deep-table-design-token-layer.md] — token layer + deferred-to-1.3 boundary
- [Source: _bmad-output/implementation-artifacts/1-1-verified-project-scaffold-test-harness.md] — smoke test, tsconfig exclude, work discipline

### Open Question (non-blocking — does not gate dev)

The `kind` field is set `informational` for Introduction and `assessment` for the three LO Sections, treating `kind` as the screen-archetype discriminator (matches Story 2.2 / 3.4 language). The LO Sections also teach (FR-4, Stories 2.4–2.6), so a later refinement *might* want a richer model (e.g., a `learn` + `assess` composite, or a separate `content`/`assessmentId` field) once the Epic 2/3 screen composition is settled. This story's frame is agnostic to that — it only reads `title`/`subtitle` for the placeholder — so the choice is safe to revisit without reworking 1.3. Flagging so the Epic 2/3 author confirms the discriminator before `InformationalScreen`/`AssessmentScreen` lock the contract.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean implementation, no regressions.

### Completion Notes List

- **Task 1 (AC2):** Created `src/content/sections.ts` with `SectionKind`, `SectionId`, `Section` types and `readonly Section[]` array with 4 verbatim entries. `sections.test.ts` guards the fixed order (4 assertions passing).
- **Task 2 (AC1, AC5):** Created `src/lib/appState.svelte.ts` — single `$state({ currentSection: 0 })` export, direct-mutation idiom, no persistence surface. `svelte-check` 0 errors confirmed rune module is valid.
- **Task 3 (AC3, AC5):** Rewrote `App.svelte` with CSS Grid `248px 1fr`, `<aside class="side">` sidebar (brand wordmark placeholder, `var(--color-sidebar)`), `<main class="main">` felt content (`var(--color-felt)`, `var(--space-content-pad)`), empty `<div class="modal-layer">` fixed overlay. No login/account/save/resume controls.
- **Task 4 (AC4):** `const active = $derived(sections[appState.currentSection])` — renders `active.title` + `active.subtitle`. No router, no URL/hash, no history API. Reactive proof verified via Playwright (section 1 switch → "Equity & the Rule of 2-and-4").
- **Task 5 (all ACs):** `npm run check` → 0 errors / 0 warnings. `npm run test` → 5 passed (2 files). `npm run build` → `dist/index-*.js` 29.28 kB, `dist/index-*.css` 2.62 kB. Dev server: cold load shows Introduction; `appState.currentSection = 1` → Equity (reactive ✓); reload → Introduction (no persistence ✓). Dev server stopped before commit.

### File List

- `pokermath/src/content/sections.ts` — new
- `pokermath/src/content/sections.test.ts` — new
- `pokermath/src/lib/appState.svelte.ts` — new
- `pokermath/src/App.svelte` — modified

## Change Log

- 2026-05-29: Story 1.3 implemented — two-pane app frame, in-memory state store, reactive section selection. Added `sections.ts`, `appState.svelte.ts`, `sections.test.ts`; rewrote `App.svelte`. All 5 ACs satisfied; 5 tests passing; build clean.
