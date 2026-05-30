---
baseline_commit: ac08601
---

# Story 1.5: Back/Next pager

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want Back and Next controls on every screen,
so that I can step through the four Sections in order without using the sidebar.

## Acceptance Criteria

**AC1 — Next advances, Back returns (FR-1, UX-DR15)**
**Given** any Section within range
**When** the Pager renders
**Then** Next (primary gold) advances to the next Section and Back (ghost) returns to the previous (FR-1, UX-DR15)
**And** Next from the Introduction lands on Equity (LO1) and Back from Equity returns to the Introduction

**AC2 — no Back on the first Section (FR-1, UX-DR15)**
**Given** the Introduction (first Section)
**When** the Pager renders
**Then** Back is absent or disabled (no way to step before the Introduction)

**AC3 — no Next past the last Section (FR-1)**
**Given** Calling Profitably (LO3, the last Section)
**When** the Pager renders
**Then** there is no Next, or it is disabled/absent (no way to step past LO3)

**AC4 — never gated by assessment state (FR-1, UX-DR15)**
**Given** any Section within range
**When** the Pager renders
**Then** Back and Next are always enabled regardless of assessment state — advancing is never gated (FR-1, UX-DR15)

## Tasks / Subtasks

- [x] **Task 1: Create `Pager.svelte` — store-aware Back/Next control (AC: #1, #2, #3, #4)**
  - [x] Create `pokermath/src/lib/components/Pager.svelte` in the existing `lib/components/` dir (created in Story 1.4). It is the `Pager.svelte` slot in the architecture target tree. [Source: architecture.md:417]
  - [x] **Imports:** `appState` from `'../appState.svelte'` and `sections` from `'../../content/sections'` (same relative paths Sidebar uses from `lib/components/`). The Pager is store-aware — like `Sidebar.svelte`, it reads and writes the **shared** `appState.currentSection`; it owns no private state. This honors the state boundary ("components read it and write to it; no component owns cross-cutting state privately"). [Source: architecture.md:454-456; pokermath/src/lib/components/Sidebar.svelte (store-aware container precedent)]
  - [x] **Bounds (derived, runes):** `const hasBack = $derived(appState.currentSection > 0)` and `const hasNext = $derived(appState.currentSection < sections.length - 1)`. Derive from `sections.length` — never hardcode `3`/`4`; the section count is owned by `content/sections.ts`. [Source: architecture.md:458-460 (content boundary); pokermath/src/content/sections.ts:12-37]
  - [x] **Clamped writers:** `function back() { if (appState.currentSection > 0) appState.currentSection -= 1 }` and `function next() { if (appState.currentSection < sections.length - 1) appState.currentSection += 1 }`. The guards make every write land in 0…`sections.length-1` — this is the **end-clamp** the 1.3/1.4 review findings explicitly deferred to "the Pager (Story 1.5)." Direct-mutation idiom (`appState.currentSection = …`), no router, no history API. [Source: architecture.md:204-207 (no-router reactive selection); 1-3-…md & 1-4-…md Review Findings ("end-clamping belongs with the Pager (Story 1.5)")]
  - [x] **Markup — two fixed slots so layout never shifts (AC2/AC3 use *absent*, not disabled):**
    ```svelte
    <nav class="pager" aria-label="Section pager">
      <div class="slot">
        {#if hasBack}
          <button type="button" class="btn ghost" onclick={back}>← Back</button>
        {/if}
      </div>
      <div class="slot end">
        {#if hasNext}
          <button type="button" class="btn primary" onclick={next}>Next →</button>
        {/if}
      </div>
    </nav>
    ```
    Two always-present slot cells in a `justify-content: space-between` row keep **Back pinned left and Next pinned right** even when one is absent — on the Introduction the left slot is empty but Next still sits right; on LO3 the right slot is empty but Back still sits left. (A single conditional child under `space-between` would mis-place a lone Next to the left — the empty slot prevents that.) [Source: mockups/key-screen-informational.html:58,108-110; epics.md UX-DR15, FR-1]
  - [x] Use semantic `<button type="button">` (free Enter/Space activation + default focus ring), and wrap in `<nav aria-label="Section pager">` — same a11y-seam choice as Story 1.4's nav. Do **not** add focus-ring tokens, transitions, or motion — that is Story 1.6. [Source: 1-4-…md (semantic button + nav aria-label precedent); epics.md Story 1.6, UX-DR18/19/20]
  - [x] **AC4 — ungated:** there is no assessment/completion state to read in Epic 1, and you must **not** introduce one. Both controls render and fire whenever in range — never gate on a `passed`/`complete` flag. [Source: epics.md FR-1, UX-DR15; .decision-log.md:18 ("advancing never requires passing an assessment")]

- [x] **Task 2: Style the two buttons from tokens (AC: #1)**
  - [x] `.pager`: `display: flex; justify-content: space-between; margin-top: auto; padding-top: var(--space-8)`. `margin-top: auto` floats the pager to the bottom of the flex-column content area (see Task 3); the mockup's literal `28px` top-pad maps to `var(--space-8)` (32px) — use the token, not the mockup literal. [Source: mockups/key-screen-informational.html:58 (`.footer-nav`); tokens.css:54]
  - [x] `.slot` cells just hold each button (no styling needed beyond existing); the empty slot occupies its flex position so the present button stays pinned. `.slot.end` needs nothing extra — `space-between` pins it right.
  - [x] `.btn` (shared base): `font: var(--font-body-md); font-weight: 600; border-radius: var(--radius-sm); padding: var(--padding-button-primary); cursor: pointer; border: 0`. **Font-weight 600 is a deliberate component-spec literal** — `--font-body-md` bakes weight 400; the mockup `.btn` and DESIGN both render buttons at 600, so set `font: var(--font-body-md)` for size/line-height/family then override `font-weight: 600`. Same documented pattern as Story 1.4's nav-title 500/600. [Source: DESIGN.md:211-212; mockups/key-screen-informational.html:59; tokens.css:31,41,74; 1-4-…md (font-weight literal-override pattern)]
  - [x] `.btn.primary` (Next): `background: var(--color-gold); color: var(--color-gold-ink); box-shadow: var(--shadow-button-primary)`. Gold fill + gold-ink text + the 1px gold-deep bottom edge. [Source: DESIGN.md:106-112,211; tokens.css:13,15,63]
  - [x] `.btn.ghost` (Back): `background: transparent; color: var(--color-text-on-felt-dim); border: var(--border-ghost)`. Transparent with a 1px translucent-white border, dim text. [Source: DESIGN.md:113-117,212; tokens.css:7,68]
  - [x] Every value that **has** a token uses `var(--…)`. The padding `11px 22px` has token `--padding-button-primary` — use it for **both** buttons (it is the shared `.btn` padding in the mockup; DESIGN's `button-ghost` declares no own padding, inheriting the base). No new accent hue beyond felt + gold. [Source: tokens.css:74; DESIGN.md:106-117; architecture.md:462-463 (styling boundary)]

- [x] **Task 3: Wire `<Pager />` into the content area of `App.svelte` (AC: #1, #2, #3, #4)**
  - [x] In `pokermath/src/App.svelte`: `import Pager from './lib/components/Pager.svelte'` and render `<Pager />` as the **last child of `<main class="main">`**, after the title/subtitle placeholder. The pager lives inside the scrolling content region, not the frame chrome. [Source: pokermath/src/App.svelte:12-15; architecture.md:428 (archetypes host the Pager inside the content screen)]
  - [x] Make `.main` a vertical flex container so `margin-top: auto` on `.pager` pins it to the bottom: add `display: flex; flex-direction: column` to the existing `.main` rule. Keep its `background` and `padding` exactly as shipped. This is the minimal frame change the pager needs; the `248px 1fr` grid and `.modal-layer` are untouched. [Source: pokermath/src/App.svelte:27-30,45-49]
  - [x] Leave the `$derived(sections[appState.currentSection])` selector and the title/subtitle placeholder exactly as-is — clicking Next/Back mutates `appState.currentSection`, the `$derived` recomputes, and the placeholder title/subtitle swaps. That swap is the visible proof of AC1. Do **not** replace the placeholder with real archetypes (Epic 2/3). [Source: pokermath/src/App.svelte:6,13-14]

- [x] **Task 4: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run check` → svelte-check + tsc report 0 errors / 0 warnings. [Source: 1-4-…md:226]
  - [x] `npm run test` → green (existing `smoke.test.ts` + `sections.test.ts` stay passing; no new test mandated — see Testing standards). [Source: 1-4-…md:227]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] `npm run dev` → open the app and confirm visually, then stop the dev server (long-lived process):
    - On **Introduction** (cold load): **no Back**, a **Next** button on the right. Clicking Next → content swaps to "Equity & the Rule of 2-and-4 / LO1 · estimate your equity" and the sidebar highlight moves to Equity. (AC1, AC2)
    - From **Equity**, **Back** appears (left) and returns to Introduction; **Next** advances to Pot Odds. (AC1)
    - Step Next to **Calling Profitably** (LO3, last): **no Next**, **Back** remains on the left and returns to Pot Odds. (AC3)
    - Within range both controls are always clickable — there is no assessment state, so nothing gates them. (AC4)
    - Pager and sidebar stay in sync (both write the same `appState.currentSection`); reload returns to Introduction (no persistence regression — inherited from 1.3). [Source: epics.md FR-1, UX-DR15, FR-3]
  - [x] Record exact command outputs in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story adds the **second navigation control** to the walking-skeleton shell: the linear Back/Next **Pager**. Story 1.4 gave free sidebar jumps; this gives ordered stepping. It builds **one** new presentational/store-aware component — `Pager.svelte` — and wires it into the bottom of `App.svelte`'s existing content `<main>`. The store, `sections.ts`, the two-pane frame, the sidebar, and the title/subtitle placeholder all already exist; this story consumes them.

**Do NOT** in this story:
- Build the **Informational / Assessment screen archetypes** that will eventually *host* the Pager (`InformationalScreen.svelte`, `AssessmentScreen.svelte`) → **Epic 2/3**. In 1.5 the Pager mounts directly in `App.svelte`'s placeholder `<main>`; when Epic 2 builds the archetypes the Pager moves into them. This mirrors how 1.4 mounted `<Sidebar/>` in `App.svelte` ahead of the archetypes. [Source: architecture.md:427-429; 1-4-…md Scope boundary]
- Add **keyboard/focus polish, roving arrow-keys, visible-focus tokens, or Section-switch motion/transitions** → **Story 1.6**. Use semantic `<button>` (free Enter/Space + default focus ring) and leave the polish to 1.6. [Source: epics.md Story 1.6, UX-DR18/19/20]
- Introduce any **assessment / completion / `passed` state** to gate the Pager → navigation is ungated by design; LO state arrives in Epic 3. [Source: epics.md FR-1, UX-DR15; .decision-log.md:18]
- Add **persistence** (the pager position must reset on reload) → no-persistence is an Epic 1 invariant inherited from 1.3. [Source: epics.md FR-3]
- Build the lower sidebar **Cheat-Sheets panel** or any `CheatSheetModal` → **Story 2.7**. [Source: epics.md Story 2.7]
- Add any **npm dependency** — AR-1 stack is locked (Svelte 5 + TS + Vite + Vitest + svelte-check). No router, no DOM/component test library. [Source: epics.md AR-1; architecture.md:131-147]

### Component composition (authoritative)

```
App.svelte
 ├─ <Sidebar />                              (unchanged from 1.4)
 ├─ <main class="main">   ← becomes flex-column so the pager pins to the bottom
 │    ├─ <h1>{active.title}</h1>             (unchanged 1.3 placeholder)
 │    ├─ <p>{active.subtitle}</p>            (unchanged 1.3 placeholder)
 │    └─ <Pager />                           ← NEW: ← Back (ghost)  …  Next → (primary)
 └─ <div class="modal-layer">               (unchanged from 1.3)
```

- **Data flow:** `Pager` reads `appState.currentSection` to derive `hasBack`/`hasNext`; on click it writes `appState.currentSection ± 1` (clamped). `App.svelte`'s `$derived(sections[currentSection])` recomputes and the placeholder swaps. The **sidebar and pager are two writers of one store** — they stay in sync for free because the UI is a pure projection of `appState`. One-way data, single store. [Source: architecture.md:204-207,454-456]
- **Why store-aware (not fully presentational like `SidebarNavItem`):** the Pager owns the **end-clamp** — the single place that decides "no step before Intro / past LO3." Co-locating the bounds + the controls + the writers in one component is the cleanest seam and is exactly where the 1.3/1.4 reviews said the clamp belongs. It writes the *shared* store, so it owns no *private* cross-cutting state — the boundary is satisfied. [Source: architecture.md:454-456; 1-4-…md Review Findings]

### Bounds & the deferred clamp (this story closes it)

Stories 1.3 and 1.4 each carried a deferred review finding that this story resolves:

| Deferred finding | Origin | How 1.5 closes it |
|---|---|---|
| Out-of-bounds `currentSection` yields `undefined` `active` — no bounds check | 1-3-…md, 1-4-…md:239 | Pager writers are guarded (`if (… > 0)` / `if (… < len-1)`), so every write lands in 0…len-1 |
| `appState.currentSection` has no guard on writes | 1-3-…md Review Findings | The two writers (sidebar = loop index 0–3; pager = clamped ±1) are now the *only* writers, and both produce valid indices by construction |

- **No speculative guard in `App.svelte`'s `$derived`.** With the sidebar (always a valid loop index) and the clamped pager being the only two writers, `appState.currentSection` is provably in range — adding a defensive guard/clamp inside the `$derived` would be dead code. Keep `const active = $derived(sections[appState.currentSection])` as-is. [Source: pokermath/src/App.svelte:6; 1-4-…md:171-172 (same reasoning)]
- **Absent, not disabled.** AC2/AC3 allow either; this story renders the boundary control **absent** (conditional `{#if}`) inside a fixed two-slot row. Absent is the calmer, lower-chrome choice and matches the mockup (which shows both controls only on a mid-flow screen). The empty slot preserves left/right pinning so the layout never jumps between Sections. [Source: epics.md UX-DR15; mockups/key-screen-informational.html:108-110]

### Button styling — exact recipe (DESIGN.md:211-212)

Both buttons share the `.btn` base; only fill/border differ. Every tokenizable value → `var(--…)`.

| Property | `.btn` base | `.btn.primary` (Next) | `.btn.ghost` (Back) | Token |
|---|---|---|---|---|
| font | `var(--font-body-md)` + `font-weight:600` | — | — | `--font-body-md` (weight 600 is a DESIGN literal) |
| radius | `var(--radius-sm)` | — | — | `--radius-sm` |
| padding | `var(--padding-button-primary)` | — | — | `--padding-button-primary` (11px 22px) |
| background | — | `var(--color-gold)` | `transparent` | `--color-gold` |
| text color | — | `var(--color-gold-ink)` | `var(--color-text-on-felt-dim)` | `--color-gold-ink`, `--color-text-on-felt-dim` |
| border | `0` | — | `var(--border-ghost)` | `--border-ghost` |
| shadow | — | `var(--shadow-button-primary)` | none | `--shadow-button-primary` |

- **Font-weight 600 is a component-spec literal, not a token breach** — identical justification to Story 1.4's nav-title weight override: `--font-body-md` bakes 400; DESIGN/mockup render buttons at 600. Set the `font:` shorthand, then override `font-weight:600`. [Source: DESIGN.md:211; tokens.css:31; 1-4-…md:139]
- **Reuse `--padding-button-primary` for the ghost too** — DESIGN `button-ghost` declares no own padding (only bg/text/border/rounded), and the mockup's shared `.btn` rule gives both `11px 22px`. The value has a token; token discipline says use it. [Source: DESIGN.md:113-117; mockups/key-screen-informational.html:59; tokens.css:74]
- **Pager row → `--space-8`.** Mockup `.footer-nav` uses literal `padding-top:28px`; the nearest spine token is `--space-8` (32px). Use the token (the mockup's 28px is mockup-only; the spine wins). `margin-top:auto` requires `.main` to be `display:flex; flex-direction:column`. [Source: mockups/key-screen-informational.html:58; tokens.css:54; architecture.md:462 (spine over mock)]

### Svelte 5 runes idioms (use these, not legacy Svelte 4)

- **Derived bounds:** `const hasBack = $derived(appState.currentSection > 0)` / `const hasNext = $derived(appState.currentSection < sections.length - 1)` — `$derived`, not `$:`. Reading `appState.currentSection` inside `$derived` is reactive because `appState` is an exported `$state` object with a stable reference and tracked field access. [Source: architecture.md:318-326; 1-4-…md:154]
- **Direct mutation writers:** `appState.currentSection -= 1` / `+= 1` inside guarded handlers — the direct-mutation idiom 1.3/1.4 established. No setter, no event dispatcher. [Source: architecture.md:318-323]
- **Callbacks, not events:** bind clicks with `onclick={back}` / `onclick={next}` (function references). Do NOT use `createEventDispatcher` (legacy Svelte 4). [Source: architecture.md:318-322]
- `Pager.svelte` is a `.svelte` component (accesses runes directly inside the compiler) — no `.svelte.ts` needed; it imports the rune-bearing `appState` module. [Source: architecture.md:273,278-283; pokermath/src/lib/appState.svelte.ts]

### Architecture compliance (guardrails)

- **Single store rule:** navigation state lives only in `appState.currentSection`. The Pager holds no private index; it reads/writes the shared store, exactly like `Sidebar`. [Source: architecture.md:454-456]
- **No-router navigation:** Back/Next adjust an index — no URL/hash/`history` API, no router package. The screen stays a pure function of `appState.currentSection`. [Source: architecture.md:204-206]
- **Content boundary:** `sections.length` (and section identity) come from `content/sections.ts` — never hardcode the count (`3`/`4`) or titles in the Pager. [Source: architecture.md:458-460]
- **Styling boundary:** every value with a token → `var(--…)`. No undocumented literal; `font-weight:600` is the only literal and it has no token (DESIGN component spec). No accent beyond felt + gold. [Source: architecture.md:462-463; 1-4-…md:162]
- **Naming:** PascalCase component file (`Pager.svelte`); camelCase vars (`hasBack`, `hasNext`, `back`, `next`); CSS via kebab token vars. [Source: architecture.md:269-283]
- **Stack locked:** no new runtime/build/test library. [Source: epics.md AR-1]

### Files being modified — current state (read before editing)

`pokermath/src/App.svelte` (UPDATE) — current relevant state:
- L2-4: imports `appState`, `sections`, `Sidebar`. → **add** `import Pager from './lib/components/Pager.svelte'`.
- L6: `const active = $derived(sections[appState.currentSection])` → **keep as-is** (no guard added).
- L12-15: `<main class="main">` holds only `<h1>{active.title}</h1>` + `<p>{active.subtitle}</p>` → **append** `<Pager />` as the last child.
- L27-30: `.main` rule is `{ background; padding }` → **add** `display:flex; flex-direction:column`.
- L18,21-25,45-49: `.modal-layer`, `.app` grid (`248px 1fr`), and the rest of the frame → **untouched** (frame unchanged; persistent-frame invariant preserved). [Source: pokermath/src/App.svelte:1-50]

**Must be preserved:** the cold-load Introduction state, the reactive title/subtitle swap, the sidebar's existing click-to-jump (it writes the same store the pager does — verify they stay in sync), the `248px 1fr` grid, and no-persistence-on-reload. The story leaves the shell working end-to-end with *two* navigation paths, not just satisfying its own ACs.

### Previous story intelligence (Story 1.4 — direct predecessor)

- **1.4 shipped the sidebar Section index** (`Sidebar.svelte` + `SidebarNavItem.svelte`) and wired it into `App.svelte`, replacing the inline `<aside>`. The sidebar is the established **store-aware container** precedent the Pager follows: it imports `appState` + `sections` and mutates `appState.currentSection = i` directly. [Source: 1-4-…md:222-223, File List]
- **1.4 used semantic `<button>` + `<nav aria-label>`** as the deliberate a11y seam so Story 1.6's keyboard work is a formality. The Pager uses the same seam (`<button type="button">` inside `<nav aria-label="Section pager">`). [Source: 1-4-…md:173]
- **1.4 established the font-weight-literal-override pattern** (set `font: var(--font-body-md)`, then override the weight) and the spine-over-mock rule (use the token even when the mockup hardcodes a near value). Both apply directly to the button styling here. [Source: 1-4-…md:139,141]
- **1.4 left two deferred findings pointing at this story** — both are the end-clamp / write-guard, now closed by the Pager's guarded writers (see "Bounds & the deferred clamp"). [Source: 1-4-…md:239-240]
- **Work discipline (1.1–1.4):** small per-AC verified commits, `feat(x.y)` → `review(x.y)` cadence, exact command outputs recorded in Completion Notes, deferred items tracked not dropped. Follow the same. [Source: git log; 1-4-…md Change Log]

### Git intelligence

Clean per-story cadence on `main`: `feat(1.4)` (`2c45feb`) added `src/lib/components/` (Sidebar + SidebarNavItem) and edited `App.svelte`; `review(1.4)` (`ac08601`, the baseline for this story) closed it. Story 1.5 adds exactly one file — `src/lib/components/Pager.svelte` — and makes a tight, additive edit to `App.svelte` (one import, one `<Pager/>` child, two CSS props on `.main`). A strict forward step in the architecture target tree, no conflict with prior work. `_bmad*/` and `docs/` stay untouched. [Source: git log -5; architecture.md:417]

### Testing standards

- **No new automated test is mandated.** The Pager is Svelte UI; the Vitest env is `node` (`vite.config.ts:9`) which cannot render components, and adding a DOM/component test lib (`@testing-library/svelte` / `happy-dom` / `jsdom`) is a **new dependency → AR-1 violation**. The only mandated unit-test target is the assessment engine (`src/lib/assessment/`, Epic 3). Do not write a component test here. [Source: vite.config.ts:7-10; architecture.md:449-452; epics.md AR-1; 1-4-…md:183]
- The clamp is trivial (`±1` guarded by `> 0` / `< len-1`) and additionally protected by the **absent** boundary buttons, so it has belt-and-suspenders coverage at the UI level; the AC2/AC3 visual checks in Task 4 are its verification. Do not extract a helper module solely to manufacture a test — that is over-engineering for a guarded increment and breaks the 1.4 no-nav-test precedent. [Source: 1-4-…md:183-185]
- **`sections.ts` order/count is already guarded** by `sections.test.ts` (4 sections, fixed id order). The Pager derives its bounds from `sections.length`, so the contract behind AC2/AC3 (where the ends are) is already protected. Nothing to add. [Source: pokermath/src/content/sections.test.ts; 1-4-…md:184]
- **Verification = `check`/`test`/`build` green + the Task-4 visual proof** (Next/Back step in order; no Back on Intro; no Next on LO3; pager+sidebar in sync). Do not invent a brittle DOM/snapshot test. [Source: 1-4-…md:185]

### Project Structure Notes

Strict subset of the architecture target tree — adds `src/lib/components/Pager.svelte` (the `Pager.svelte` slot) and edits `App.svelte`. No structural conflict. The Pager temporarily mounts in `App.svelte`'s content `<main>`; per the target tree it will be hosted by `screens/InformationalScreen.svelte` and `screens/AssessmentScreen.svelte` once those exist (Epic 2/3) — the component itself is built to its final shape now and only its mount point moves later. [Source: architecture.md:414-429]

Files touched:
- `pokermath/src/lib/components/Pager.svelte` — **new** (store-aware Back/Next: derived bounds, clamped writers, two-slot ghost/primary buttons). [Source: architecture.md:417]
- `pokermath/src/App.svelte` — **modified** (import + render `<Pager/>` in `<main>`; `.main` → flex-column; everything else unchanged). [Source: pokermath/src/App.svelte:2-15,27-30]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.5] — story statement + acceptance criteria (lines 234-257)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-1 (linear Back/Next nav, fixed order, ends behavior, line 21), UX-DR15 (pager: Back ghost / Next primary, absent at ends, ungated, line 82), AR-1 (stack lock, line 59), AR-6 (no-router index nav, line 59), AR-8 (static build); Story 1.6 / 2.7 / Epic 2-3 scope boundaries
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — line 417 (`Pager.svelte` under `lib/components/`), 427-429 (archetype screens host the Pager); lines 447-463 (state / content / styling boundaries)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — lines 204-207 (no-router reactive index selection), 269-283 (naming), 318-326 (runes props/derived/direct-mutation idiom), 469 (FR-1 → `Pager.svelte` + `appState.svelte.ts`)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — lines 106-117 (button-primary / button-ghost component specs), 205 (radius family), 211-212 (button — primary gold-fill/gold-ink + gold-deep bottom edge; ghost transparent + translucent-white border, dim text — used for Back and the non-primary pager control)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — line 36 (free, ungated Back/Next; Back absent on Intro; no Next past LO3), line 61 (Pager surface spec)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-informational.html] — lines 58-61 (`.footer-nav` + `.btn`/`.btn.primary`/`.btn.ghost`), 108-110 (`← Back` ghost / `Next →` primary composition; strip inline hex → use tokens)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/.decision-log.md] — line 18 (advancing never requires passing an assessment), line 47 (gold = primary buttons incl. Next)
- [Source: pokermath/src/App.svelte] — current frame (lines 2-15 content `<main>` to host `<Pager/>`; 27-30 `.main` rule to make flex-column; line 6 `$derived` to keep as-is)
- [Source: pokermath/src/lib/appState.svelte.ts] — `appState.currentSection` (the index the Pager reads/clamps/writes)
- [Source: pokermath/src/content/sections.ts] — ordered `sections` (length drives the bounds); [Source: pokermath/src/content/sections.test.ts] — order/count guard behind AC2/AC3
- [Source: pokermath/src/lib/components/Sidebar.svelte] — store-aware container precedent (imports `appState` + `sections`, direct-mutates `currentSection`)
- [Source: pokermath/src/lib/components/SidebarNavItem.svelte] — semantic `<button>` + token-styling precedent
- [Source: pokermath/src/styles/tokens.css] — all `var(--…)` the Pager consumes (lines 13,15,7,31,41,54,63,68,74)
- [Source: pokermath/vite.config.ts] — `test.environment: 'node'` (why no component test)
- [Source: _bmad-output/implementation-artifacts/1-4-sidebar-section-index-free-navigation.md] — predecessor: sidebar/store wiring, semantic-button a11y seam, font-weight-literal pattern, the two deferred clamp findings this story closes

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `npm run check`: 90 files, 0 errors, 0 warnings
- `npm run test`: 2 test files, 5 tests passed (smoke.test.ts + sections.test.ts — no regressions)
- `npm run build`: 119 modules transformed → dist/index-BjGzNW-2.js 41.20 kB, dist/assets/index-DycMe7vz.css 4.24 kB — succeeded
- Visual proof (Playwright/Chromium headless, port 5200):
  - AC2: Introduction → Back absent (0), Next present (1), pinned right ✅
  - AC1: Next click → "Equity & the Rule of 2-and-4 / LO1 · estimate your equity" — sidebar highlights Equity in sync ✅
  - AC1: Back click from Equity → returns to Introduction ✅
  - AC1: Next → Pot Odds → Next → Calling Profitably — both controls present on mid-flow screens ✅
  - AC3: Calling Profitably (LO3) → Next absent (0), Back present (1), pinned left ✅
  - AC4: No assessment/completion gate — controls always fire when in range ✅
  - FR-3: Reload → returns to Introduction (no persistence) ✅
  - Pager + sidebar stay in sync via shared `appState.currentSection` write ✅
- Deferred clamp from 1.3/1.4 reviews closed: guarded writers (`> 0` / `< len-1`) make every write land in 0…3 by construction

### File List

- `pokermath/src/lib/components/Pager.svelte` — NEW
- `pokermath/src/App.svelte` — MODIFIED (Pager import + render; `.main` flex-column)

## Change Log

- 2026-05-29: Story 1.5 created — ready-for-dev. Back/Next Pager (`Pager.svelte`) wired into `App.svelte` content area; store-aware derived bounds + clamped writers close the 1.3/1.4 deferred end-clamp findings.
- 2026-05-29: Story 1.5 implemented — check/test/build green; all four ACs visually confirmed via Playwright. Status → review.
