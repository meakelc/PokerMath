---
baseline_commit: c8f3140
---

# Story 1.4: Sidebar Section index & free navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a sidebar listing all four Sections with the current one highlighted, where clicking any Section jumps straight to it,
so that I always know where I am and can move freely.

## Acceptance Criteria

**AC1 — four Sections render in fixed order with title + subtitle (FR-2, UX-DR2)**
**Given** `content/sections.ts`
**When** the Sidebar renders
**Then** all four Sections appear in fixed order, each with its title (`body-md`) and one-line subtitle (`caption`, dim) (FR-2, UX-DR2)

**AC2 — active item distinguished by more than color (UX-DR2, UX-DR19)**
**Given** the current Section
**When** the sidebar renders
**Then** the active item shows the `sidebar-active` background + a 3px gold left-bar + a title weight change — distinguished by more than color alone (UX-DR2, UX-DR19)

**AC3 — clicking any item jumps to it, ungated (FR-2)**
**Given** any Section item
**When** the learner clicks it
**Then** `currentSection` is set to that Section and the content area shows it — all four are jump targets at all times, ungated (FR-2)

**AC4 — sidebar is part of the persistent frame**
**Given** any screen in the flow
**When** it renders
**Then** the sidebar is present (persistent frame)

## Tasks / Subtasks

- [x] **Task 1: Create `SidebarNavItem.svelte` — one nav row (AC: #1, #2, #3)**
  - [x] Create the `pokermath/src/lib/components/` directory (does not exist yet) per the architecture target tree. [Source: architecture.md:414-416]
  - [x] Build `pokermath/src/lib/components/SidebarNavItem.svelte` as a **presentational** component — it owns NO store state; it receives everything via props and emits a select callback. [Source: architecture.md:454-456 (state boundary)]
  - [x] Declare props with Svelte 5 runes: `let { title, subtitle, active = false, complete = false, onselect }: { title: string; subtitle: string; active?: boolean; complete?: boolean; onselect: () => void } = $props()`. [Source: architecture.md:318-322 (runes idiom)]
  - [x] Render the row as a **semantic `<button type="button">`** (not a `<div>`) so it is natively focusable, clickable, and keyboard-activable (Enter/Space) — this is the correct seam for Story 1.6's keyboard/focus baseline. On click, call `onselect()`. [Source: epics.md FR-2, UX-DR20; Story 1.3 Review Findings — ARIA/semantic deferred to 1.6]
  - [x] Inside the button: a title element (`.t`) showing `{title}` and a subtitle element (`.s`) showing `{subtitle}`. Title uses `font: var(--font-body-md)` with `font-weight: 500` resting; subtitle uses `font: var(--font-caption)` and `color: var(--color-sidebar-text-dim)`. [Source: DESIGN.md:209 "title (body-md, 500) + one-line subtitle (caption, dim)"; tokens.css:31,33,10]
  - [x] **Active state** (`active === true`): apply `background: var(--color-sidebar-active)`; add a **3px gold left-bar** (`var(--color-gold)`) via a `::before` (absolutely positioned, `width: 3px`, inset ~6px top/bottom, `border-radius: 2px`); set the title to `color: var(--color-felt); font-weight: 600`. The distinction MUST be background + left-bar + weight, **never color alone** (UX-DR19). Also set `aria-current="step"` on the button when active (intrinsic to FR-2 "current-position indication"). [Source: DESIGN.md:209, components.sidebar-nav-item:99-105; tokens.css:11,13,3; epics.md UX-DR2, UX-DR19, FR-2]
  - [x] Item box: `padding: var(--space-3)`; `border-radius: var(--radius-sm)`; `position: relative` (for the left-bar); `width: 100%`; `text-align: left`; reset native button chrome (`background: none; border: 0; cursor: pointer; font: inherit; color: inherit`) so only the intended tokens style it. [Source: DESIGN.md components.sidebar-nav-item.padding={spacing.3}, rounded={rounded.sm} :100-101; tokens.css:51,41]
  - [x] **Completed ✓ (forward-compat stub only):** if `complete === true`, append a `var(--color-gold-deep)` "✓" after the title (mockup `.item.done .t::after`). In THIS story `complete` is **always false** (no completion store state exists yet) — the actual session-✓ wiring is Story 3.5 against a `passed` flag. Include the prop + render path so 3.5 is a one-line wire-up, but do NOT add any store field or read one. [Source: mockups/key-screen-informational.html:31; epics.md Story 3.5, UX-DR2, FR-13; architecture.md:416]
  - [x] Do NOT add focus-ring styling polish, motion/transitions, or arrow-key roving — that is Story 1.6. Native button focus is sufficient for now. [Source: epics.md Story 1.6, UX-DR18/19/20]

- [x] **Task 2: Create `Sidebar.svelte` — brand + Sections list (AC: #1, #2, #3, #4)**
  - [x] Build `pokermath/src/lib/components/Sidebar.svelte`. It owns the `<aside class="side">` region (moved out of `App.svelte`). [Source: architecture.md:396,415]
  - [x] Imports: `appState` from `'../appState.svelte'`, `sections` from `'../../content/sections'`, `SidebarNavItem` from `'./SidebarNavItem.svelte'`. (Relative paths from `src/lib/components/`.) [Source: architecture.md:402-403,432]
  - [x] **Brand:** move the existing wordmark from `App.svelte` **verbatim** (markup + the `.wordmark` rule) into `Sidebar.svelte` — preserve Story 1.3's shipped brand exactly. Do NOT restyle it to the mockup's gold-chip Fraunces brand; that refinement is outside every 1.4 AC and would be an unrequested visual change. [Source: pokermath/src/App.svelte:10,35-39; 1-3-…md File List]
  - [x] **"Sections" eyebrow:** a label above the list using `font: var(--font-label-caps)`, `letter-spacing: var(--tracking-label-caps)`, `text-transform: uppercase`, `color: var(--color-sidebar-text-dim)`. [Source: DESIGN.md:184 (label-caps), mockups `.navlabel`:27; tokens.css:32,38,10]
  - [x] **Nav list:** wrap the items in `<nav aria-label="Sections">` and iterate `sections`:
    ```svelte
    <nav class="nav" aria-label="Sections">
      {#each sections as section, i (section.id)}
        <SidebarNavItem
          title={section.title}
          subtitle={section.subtitle}
          active={i === appState.currentSection}
          onselect={() => (appState.currentSection = i)}
        />
      {/each}
    </nav>
    ```
    Key the `{#each}` by `section.id` (stable identity), never by index. [Source: architecture.md:204-207,318-326; epics.md FR-2; sections.ts:3]
  - [x] **Click → jump (AC3):** `onselect` sets `appState.currentSection = i` directly (direct-mutation idiom). `i` is always a valid 0–3 index because it comes from iterating `sections`, so no bounds guard is introduced or needed here. All four items are always rendered and always clickable — no gating on assessment/section state. [Source: architecture.md:319-323; epics.md FR-2 (ungated free jump)]
  - [x] **Do NOT** build the lower Cheat-Sheets panel (the four chevron rows + `sidebar-border` divider) — that is **Story 2.7 / UX-DR3**. The sidebar in 1.4 is brand + "Sections" eyebrow + the four nav items only. [Source: epics.md Story 2.7, UX-DR3]
  - [x] Sidebar `<aside class="side">` styles: `background: var(--color-sidebar)`; `display: flex; flex-direction: column`; `padding: var(--space-content-pad)` (carry the value `App.svelte` used). Keep `248px` as App's grid literal — the aside fills its grid cell, no width declared here. [Source: pokermath/src/App.svelte:28-33; DESIGN.md:191; mockups `.side`:24]

- [x] **Task 3: Wire `Sidebar.svelte` into `App.svelte` (AC: #3, #4)**
  - [x] In `pokermath/src/App.svelte`: `import Sidebar from './lib/components/Sidebar.svelte'` and replace the inline `<aside class="side">…</aside>` block (lines 9-11) with `<Sidebar />`. [Source: pokermath/src/App.svelte:9-11]
  - [x] Remove the now-dead `.side` and `.wordmark` scoped style rules from `App.svelte` (their markup moved to `Sidebar.svelte`). Keep `.app`, `.main`, `.section-title`, `.section-subtitle`, `.modal-layer`. The grid `grid-template-columns: 248px 1fr` and the modal-layer slot stay untouched (frame is unchanged — AC4). [Source: pokermath/src/App.svelte:22-63]
  - [x] The `const active = $derived(sections[appState.currentSection])` + content `<main>` placeholder stay exactly as-is — clicking a sidebar item updates `appState.currentSection`, the `$derived` recomputes, and the placeholder title/subtitle swaps. This is the visible proof of AC3. Do NOT replace the placeholder with real archetypes (Epic 2/3). [Source: pokermath/src/App.svelte:5,13-16; architecture.md:427-429]
  - [x] Confirm the sidebar renders on every Section (it is outside the reactive content swap → persistent frame, AC4). [Source: epics.md FR-2; UX-DR1]

- [x] **Task 4: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run check` → svelte-check + tsc report 0 errors / 0 warnings (the new components are type-checked). [Source: 1-3-…md Completion Notes]
  - [x] `npm run test` → green (existing `smoke.test.ts` + `sections.test.ts` stay passing; no new test is mandated — see Testing standards). [Source: 1-3-…md:226]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] `npm run dev` → open the app and confirm visually:
    - All four Sections list in order (Introduction, Equity…, Pot Odds, Calling Profitably) with title + dim subtitle. (AC1)
    - On cold load, **Introduction** is the active item (sidebar-active bg + gold left-bar + heavier title). (AC2)
    - Clicking **Pot Odds** moves the highlight to it AND swaps the content placeholder to "Pot Odds / LO2 · price of a call"; clicking back to **Introduction** restores it — all four are clickable at any time. (AC3)
    - The sidebar stays present across every Section (frame persists). (AC4)
    - Reload returns to Introduction active (no persistence regression — inherited from 1.3). 
    Stop the dev server afterward (long-lived process). [Source: epics.md FR-2, FR-3, UX-DR21]
  - [x] Record exact command outputs in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story turns the **placeholder sidebar region** (shipped in 1.3) into the real **Section index with free-jump navigation**. It builds two presentational components — `Sidebar.svelte` (brand + "Sections" eyebrow + the list) and `SidebarNavItem.svelte` (one nav row with active highlight + click-to-jump) — and wires them into `App.svelte`. The reactive store, `sections.ts`, the two-pane grid, and the content placeholder all already exist from 1.3; this story consumes them, it does not rebuild them.

**Do NOT** in this story:
- Build the lower **Cheat-Sheets panel** (four chevron rows + `sidebar-border` divider) → **Story 2.7** (`UX-DR3`). The lower sidebar stays empty for now.
- Build the **Back/Next Pager** → **Story 1.5** (`FR-1`, `UX-DR15`). The sidebar is the only navigation control this story adds.
- Add **keyboard/focus polish, roving arrow-keys, visible-focus tokens, or Section-switch motion/transitions** → **Story 1.6** (`UX-DR18/19/20`). Use a semantic `<button>` (free Enter/Space + default focus ring); leave the polish to 1.6.
- Wire the **session ✓ / completion** marker to real state → **Story 3.5** (`FR-13`, `UX-DR2`). Ship the `complete` prop as an always-false stub only; add no store field.
- Restyle the **brand** to the mockup's gold-chip Fraunces treatment — preserve 1.3's shipped wordmark verbatim.
- Build `InformationalScreen`/`AssessmentScreen` archetypes or any authored content → **Epic 2/3**. The content area keeps its 1.3 title/subtitle placeholder.
- Add any **npm dependency** — AR-1 stack is locked (Svelte 5 + TS + Vite + Vitest + svelte-check). No component/DOM test library, no router. [Source: epics.md AR-1; architecture.md:131-147]

### Component composition (authoritative)

```
App.svelte
 ├─ <Sidebar />                         ← NEW wiring (replaces inline <aside>)
 │    ├─ brand wordmark (moved verbatim from App.svelte)
 │    ├─ "Sections" label-caps eyebrow
 │    └─ <nav aria-label="Sections">
 │         {#each sections as s, i (s.id)}
 │           └─ <SidebarNavItem title subtitle active onselect />   ← NEW
 │    (lower Cheat-Sheets panel → Story 2.7, omit)
 ├─ <main> active.title / active.subtitle placeholder (unchanged from 1.3)
 └─ <div class="modal-layer"> (unchanged from 1.3)
```

- **Data flow:** `Sidebar` reads `appState.currentSection` to compute each item's `active`; on click it writes `appState.currentSection = i`. `App.svelte`'s `$derived(sections[currentSection])` recomputes and the content placeholder swaps. One-way data, single store — UI is a projection of `appState`. [Source: architecture.md:204-207,454-456]
- **Why presentational `SidebarNavItem`:** it takes props + an `onselect` callback and owns no store state, matching the architecture's state boundary ("no component owns cross-cutting state privately"). All store reads/writes live in `Sidebar`. [Source: architecture.md:454-456,416]

### Active-item styling — exact recipe (UX-DR2 / UX-DR19)

The active item must differ from resting by **three** signals (more than color alone, NFR-2 floor):

| Signal | Resting | Active | Token |
|---|---|---|---|
| Background | transparent | `sidebar-active` | `var(--color-sidebar-active)` |
| Left-bar | none | 3px gold bar (`::before`) | `var(--color-gold)` |
| Title weight | 500 | 600 | (weight literal, see below) |
| Title color | `sidebar-text` (inherited) | `felt` | `var(--color-felt)` |
| `aria-current` | absent | `"step"` | — |

- **Font-weight is a deliberate literal, not a token violation.** `--font-body-md` is `400 14px/1.5 Inter` — its baked-in weight is 400. DESIGN narrative (line 209) specifies the nav title at **500 resting / 600 active**. So set `font: var(--font-body-md)` for size/line-height/family, then override `font-weight: 500` (resting) / `600` (active). 500 and 600 are component-spec literals from DESIGN, not tokenized values — overriding them does **not** breach "never hardcode a value that has a token." [Source: DESIGN.md:209; tokens.css:31; 1-2-…md AC4 token discipline]
- **Left-bar literals with no token:** `width: 3px`, `border-radius: 2px`, and the `top/bottom: ~6px` inset are layout accents with no DESIGN token — keep them literal (the mockup uses exactly these). Token discipline forbids hardcoding values that *have* a token; these don't. [Source: mockups/key-screen-informational.html:33; 1-3-…md Task 3 (248px literal precedent)]
- **Item box tokens (spine wins over mock):** DESIGN `components.sidebar-nav-item` says `padding: {spacing.3}` (`var(--space-3)` = 12px) and `rounded: {rounded.sm}` (`var(--radius-sm)` = 6px). Use those tokens — the mockup's local `10px 11px` padding is mockup-only and the spine overrides it. [Source: DESIGN.md:99-101; tokens.css:51,41]
- Mockup reference for the exact active treatment (transcribe intent, replace inline hex with tokens): [Source: mockups/key-screen-informational.html:28-34]
  ```css
  .item.active            { background: var(--color-sidebar-active); }
  .item.active::before    { content:""; position:absolute; left:0; top:6px; bottom:6px;
                            width:3px; border-radius:2px; background: var(--color-gold); }
  .item.active .t         { color: var(--color-felt); font-weight:600; }
  ```

### Svelte 5 runes idioms (use these, not legacy Svelte 4)

- **Props:** `let { title, subtitle, active = false, complete = false, onselect } = $props()` — NOT `export let`. Svelte 5 runes mode. [Source: architecture.md:318-322; epics.md AR-1 (Svelte 5 runes)]
- **Callbacks over events:** pass `onselect={() => (appState.currentSection = i)}` as a prop and call `onselect()` on click — the Svelte 5 callback-prop idiom. Do NOT use `createEventDispatcher` (legacy). [Source: architecture.md:318-322]
- **Reactivity across modules:** `appState` is an exported `$state` **object**; reading `appState.currentSection` inside `Sidebar`'s `{#each}` and the `active={…}` expression is reactive because the object reference is stable and field access is tracked. Mutating `appState.currentSection = i` re-renders every reader (the sidebar highlight AND App's `$derived` content). [Source: 1-3-…md:134; architecture.md:318-322]
- Rune-bearing modules use `.svelte.ts`; `.svelte` components access runes directly (already inside the compiler). `Sidebar`/`SidebarNavItem` are `.svelte` — no `.svelte.ts` needed. [Source: architecture.md:273,278-283]

### Architecture compliance (guardrails)

- **Single store rule:** navigation state lives only in `appState.currentSection`. `SidebarNavItem` holds none; `Sidebar` reads/writes the store. No private nav state. [Source: architecture.md:454-456]
- **No-router navigation:** clicking an item sets an index; no URL/hash/`history` API, no router package. The screen remains a pure function of `appState.currentSection`. [Source: architecture.md:204-206]
- **Content boundary:** the four Sections come from `content/sections.ts` — never hardcode the titles/subtitles in the sidebar markup. [Source: architecture.md:458-460]
- **Styling boundary:** every value with a token → `var(--…)`; only the documented literals (248px, 3px bar, 2px radius, 6px inset, font-weight 500/600) stay literal because they have no token. No new accent hue beyond felt + gold. [Source: architecture.md:462; 1-2-…md AC4]
- **Naming:** PascalCase component files (`Sidebar.svelte`, `SidebarNavItem.svelte`); camelCase vars; CSS via kebab token vars. [Source: architecture.md:269-283]
- **Stack locked:** no new runtime/build/test library. [Source: epics.md AR-1]

### Previous story intelligence (Story 1.3 — direct predecessor)

- **1.3 left the sidebar as a styled placeholder** containing only `<span class="wordmark">PokerMath</span>` inside `<aside class="side">`, explicitly deferring the four nav items, active highlight, ✓, and click-to-jump to **this story**. You are picking up exactly there. [Source: 1-3-…md:69, Scope boundary; pokermath/src/App.svelte:9-11]
- **The store, `sections.ts`, and reactive selection already work.** `appState.currentSection` (0 = Introduction) drives `$derived(sections[appState.currentSection])` in `App.svelte`. 1.3 proved the reactive swap by manually setting `currentSection = 1`; THIS story replaces that manual proof with real sidebar click wiring. [Source: 1-3-…md:225-226; pokermath/src/App.svelte:5]
- **1.3 deferred two items that this story now resolves:**
  - *"`active` is `undefined` when `currentSection` is out-of-range — no bounds check"* — 1.4 introduces the first real writers of `currentSection`. Because every writer uses an index from iterating `sections` (0–3), no out-of-range value can be written → the existing `$derived` stays safe **without** adding a guard. Do not add a speculative bounds check here; end-clamping belongs with the Pager (Story 1.5). [Source: 1-3-…md Review Findings (deferred to 1.4/1.5)]
  - *"`appState.currentSection` has no type/value guard on writes"* — same reasoning: writes are constrained to valid loop indices by construction. No guard needed in 1.4. [Source: 1-3-…md Review Findings]
- **1.3 deferred ARIA/semantic HTML to Story 1.6.** This story still uses semantic `<button>` + `<nav aria-label>` + `aria-current` because those are intrinsic to building a correct, jump-capable nav (FR-2) and make 1.6's keyboard work a formality rather than a retrofit. Broader focus-ring tokens, tab-order audit, and the `<aside>`/heading-hierarchy cleanup remain 1.6 scope. [Source: 1-3-…md Review Findings; epics.md Story 1.6]
- **Token layer is ready:** `tokens.css` exposes everything needed — `--color-sidebar`, `--color-sidebar-active`, `--color-sidebar-text-dim`, `--color-gold`, `--color-gold-deep`, `--color-felt`, `--font-body-md`, `--font-caption`, `--font-label-caps`, `--tracking-label-caps`, `--space-3`, `--space-content-pad`, `--radius-sm`. Consume by name; don't re-declare. [Source: tokens.css:8-13,31-33,38,51,56,41]
- **Work discipline (1.1–1.3):** small per-AC verified commits, `feat(x.y)` → `review(x.y)` cadence, command outputs recorded in Completion Notes, deferred items tracked not dropped. Follow the same. [Source: git log; 1-3-…md Change Log]

### Git intelligence

Clean per-story cadence on `main`: `feat(1.3)` (`004a094`) added `src/lib/` + `src/content/` and rewrote `App.svelte`; `review(1.3)` (`c8f3140`) closed it. This story adds `src/lib/components/` (new dir, 2 files) and makes a tight edit to `App.svelte` (swap inline `<aside>` for `<Sidebar/>`, drop two dead style rules) — a strict forward step in the architecture target tree with no conflict against prior work. `_bmad*/` and `docs/` stay untouched. [Source: git log -5; architecture.md:414-416]

### Testing standards

- **No new automated test is mandated.** This story is Svelte UI (components needing the Svelte compiler + a DOM env to test). The Vitest env is `node` (`vite.config.ts`), which cannot render components, and adding a DOM test lib (`@testing-library/svelte` / `happy-dom` / `jsdom`) is a **new dependency → AR-1 violation**. So do not write a component test here. The mandated unit-test target remains the assessment engine (Epic 3). [Source: architecture.md:294-301,449-452; epics.md AR-1; 1-3-…md:168,178]
- **`sections.ts` is already order-guarded** by `sections.test.ts` (4 sections, fixed id order, kinds) — the sidebar consumes that data, so the fixed-order contract behind AC1 is already protected. Nothing to add. [Source: 1-3-…md:222; pokermath/src/content/sections.test.ts]
- **Verification is `check`/`test`/`build` green + the Task-4 visual proof** (click each Section → highlight moves + content swaps). Do not invent a brittle DOM/snapshot test. [Source: 1-3-…md:179]

### Project Structure Notes

Strict subset of the architecture target tree — adds `src/lib/components/Sidebar.svelte` and `src/lib/components/SidebarNavItem.svelte` (new `src/lib/components/` dir), and edits `App.svelte`. No structural conflict. [Source: architecture.md:414-416]

Files touched:
- `pokermath/src/lib/components/SidebarNavItem.svelte` — **new** (one nav row: title/subtitle, active highlight, click→`onselect`, ✓ stub). [Source: architecture.md:416]
- `pokermath/src/lib/components/Sidebar.svelte` — **new** (brand + "Sections" eyebrow + `{#each sections}` of `SidebarNavItem`; reads/writes `appState.currentSection`). [Source: architecture.md:415]
- `pokermath/src/App.svelte` — **modified** (import + render `<Sidebar/>` replacing inline `<aside>`; remove dead `.side`/`.wordmark` rules; everything else unchanged). [Source: pokermath/src/App.svelte:9-11,28-39]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4] — story statement + acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-2 (sidebar index + free jump), UX-DR2 (nav item spec), UX-DR3 (cheat-sheet panel → 2.7), UX-DR19 (non-color-alone active), NFR-2 (a11y floor), AR-1 (stack lock), AR-5/AR-6 (store, no-router); Story 1.5/1.6/2.7/3.5 scope boundaries
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — lines 383-463 (component tree: `Sidebar`/`SidebarNavItem` under `lib/components/`; state/content/styling boundaries)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — lines 204-207 (no-router reactive selection), 269-283 (naming), 318-326 (runes props/derived idiom)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — line 209 (sidebar nav item: body-md/500 title, caption-dim subtitle, active = sidebar-active bg + 3px gold left-bar + felt 600 title), lines 99-105 (component spec: spacing.3 padding, rounded.sm), 191 (fixed two-pane ~248px)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-informational.html] — lines 23-34, 67-83 (sidebar + nav-item composition reference; strip inline hex → use tokens)
- [Source: pokermath/src/App.svelte] — current frame (lines 9-11 inline `<aside>` to replace; 28-39 `.side`/`.wordmark` to move/remove)
- [Source: pokermath/src/lib/appState.svelte.ts] — `appState.currentSection` (the index this story reads/writes)
- [Source: pokermath/src/content/sections.ts] — the four `Section` records the sidebar lists; [Source: pokermath/src/content/sections.test.ts] — order guard
- [Source: pokermath/src/styles/tokens.css] — all `var(--…)` the sidebar consumes
- [Source: _bmad-output/implementation-artifacts/1-3-two-pane-app-frame-in-memory-state-store.md] — predecessor: placeholder sidebar, reactive store, deferred bounds-check/ARIA items this story addresses

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean implementation, no blockers.

### Completion Notes List

- **Task 1** (`SidebarNavItem.svelte`): Created `pokermath/src/lib/components/` dir. Presentational `<button type="button">` component with Svelte 5 `$props()` runes. Active state: `sidebar-active` bg + 3px `var(--color-gold)` `::before` left-bar (top/bottom: 6px inset) + title `color: var(--color-felt); font-weight: 600`. `aria-current="step"` on active. Complete-stub `.t::after` (`var(--color-gold-deep)` "✓") included; `complete` prop always-false until Story 3.5. No focus-ring polish (Story 1.6).
- **Task 2** (`Sidebar.svelte`): Wordmark moved verbatim from App.svelte. "SECTIONS" label-caps eyebrow. `<nav aria-label="Sections">` with `{#each sections as section, i (section.id)}` keyed by stable `section.id`. Direct mutation `appState.currentSection = i` on select. No Cheat-Sheets panel (Story 2.7).
- **Task 3** (`App.svelte`): Replaced inline `<aside>` with `<Sidebar />`. Removed dead `.side` and `.wordmark` scoped rules. Grid, `$derived`, content placeholder, `.modal-layer` unchanged.
- **Task 4** (Verify):
  - `npm run check`: 89 files, 0 errors, 0 warnings
  - `npm run test`: 2 test files, 5 tests, all passed (211ms)
  - `npm run build`: 117 modules transformed, dist emitted (180ms)
  - Visual (Playwright headless): AC1 ✅ four sections in order; AC2 ✅ Introduction active (gold left-bar + sidebar-active bg + bold felt title); AC3 ✅ click Pot Odds → h1="Pot Odds" + highlight moves; click Introduction → h1="Introduction" restored; AC4 ✅ sidebar persistent across all sections.

### File List

- `pokermath/src/lib/components/SidebarNavItem.svelte` — new
- `pokermath/src/lib/components/Sidebar.svelte` — new
- `pokermath/src/App.svelte` — modified (Sidebar import + wiring; removed .side/.wordmark rules)

### Review Findings

- [x] [Review][Defer] Out-of-bounds `currentSection` produces `undefined` active — `App.svelte:6`, `Sidebar.svelte:17` — deferred, pre-existing; Story 1.5 pager constrains writes to valid indices
- [x] [Review][Defer] Accessible composite name / ARIA polish on nav button — `SidebarNavItem.svelte:17-27` — deferred, pre-existing; Story 1.6 scope

## Change Log

- 2026-05-29: Story 1.4 created — ready-for-dev. Sidebar Section index + free-jump navigation (`Sidebar.svelte`, `SidebarNavItem.svelte`, `App.svelte` wiring).
- 2026-05-29: Story 1.4 implemented — all tasks complete, all ACs verified. Status → review.
- 2026-05-29: Code review complete — 0 decision-needed, 0 patches, 2 deferred, 9 dismissed. Status → done.
