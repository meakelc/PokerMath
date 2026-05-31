---
baseline_commit: 1a79794
---

# Story 2.7: Cheat-sheet panel & modal mechanism

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want to open a reference sheet from the sidebar at any time without losing my place,
so that I can refresh a prerequisite mid-task.

## Acceptance Criteria

**AC1 — Sidebar Cheat Sheets panel (UX-DR3, FR-6)**
**Given** the lower sidebar panel
**When** the frame renders
**Then** it lists the four Cheat Sheets (The 52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon) as quiet chevron rows, divided from the Section nav by the `sidebar-border`

**AC2 — Opening a sheet (FR-6, UX-DR14)**
**Given** a cheat-sheet row
**When** the learner clicks it
**Then** `CheatSheetModal` opens that sheet over a felt-tinted scrim and the active Section is unchanged

**AC3 — Dismiss + input preservation (FR-6, UX-DR14)**
**Given** an open modal
**When** the learner presses Esc, clicks the scrim, or the close control
**Then** the modal dismisses and the underlying Section is exactly as left — the underlying screen never unmounts, so any in-progress inputs are preserved

**AC4 — Store isolation (FR-6, AR-5)**
**Given** the store
**When** the modal opens or closes
**Then** only a cheat-sheet target field on `appState` flips — no navigation state changes (`currentSection` is untouched)

## Tasks / Subtasks

- [x] **Task 1: Add the cheat-sheet target to the store (AC: #2, #3, #4)**
  - [x] **Read first:** `lib/appState.svelte.ts` — currently a single `$state` object holding only `currentSection: 0` (AR-5; the single source of mutable runtime state). [Source: appState.svelte.ts:1-5]
  - [x] **Update:** add one field `openCheatSheet: null as CheatSheetId | null` to the `appState` `$state` object. `null` = no modal open (cold-start default). Setting it to a `CheatSheetId` opens that sheet; setting it back to `null` closes.
  - [x] **Type import:** `import type { CheatSheetId } from '../content/cheatsheets'` (type-only — no runtime coupling, no cycle: `content/cheatsheets.ts` does not import `appState`). [Source: AR-5; architecture.md:402-404]
  - [x] **Direct-mutation idiom only** — opening/closing is `appState.openCheatSheet = id` / `= null`. No reducer, no action, no immutable copy (Svelte 5 deep reactivity). [Source: architecture.md:318-327]
  - [x] **Do NOT** add any navigation-related field or touch `currentSection`. The whole point of AC4 is that the modal is orthogonal to navigation. [Source: epics.md:427-429]

- [x] **Task 2: Define cheat-sheet metadata (AC: #1, #2)**
  - [x] **Read first:** `content/sections.ts` — the direct model. It exports a `SectionId` union, a `Section` type, and a `readonly Section[]` array in fixed order. Mirror this shape exactly. [Source: sections.ts:1-37]
  - [x] **New file:** `pokermath/src/content/cheatsheets.ts` — exports:
    - `export type CheatSheetId = 'deck' | 'holdem' | 'rankings' | 'jargon'`
    - `export type CheatSheet = { id: CheatSheetId; title: string }`
    - `export const cheatSheets: readonly CheatSheet[]` — four entries **in fixed order**:
      1. `{ id: 'deck', title: 'The 52-card Deck' }`
      2. `{ id: 'holdem', title: "Texas Hold 'Em Rules" }` — use a double-quoted TS string so the `'Em` apostrophe needs no escaping
      3. `{ id: 'rankings', title: 'Hand Rankings' }`
      4. `{ id: 'jargon', title: 'Poker Jargon' }`
    - Close with `as const` like `sections`. [Source: sections.ts:12-37; UX-DR3 epics.md:70; mockup key-screen-cheatsheet-modal.html:83-86]
  - [x] **Why metadata-only (no content yet):** this story builds the *mechanism*. The four sheets' actual reference content (`Deck.svelte`, `HoldEmRules.svelte`, `HandRankings.svelte`, `Jargon.svelte` under `content/cheatsheets/`) is **Story 2.8**. The `id → component` registry (`content/cheatsheets/index.ts`, analogous to `content/sections/index.ts`) is also 2.8. This mirrors how Story 2.2 built the Informational archetype with a temporary fallback before 2.3–2.6 authored the prose. [Source: epics.md:431-449; architecture.md:440-444; sections/index.ts:1-15]

- [x] **Task 3: Build `CheatSheetModal.svelte` (AC: #2, #3)**
  - [x] **New file:** `pokermath/src/lib/components/CheatSheetModal.svelte` — a **presentational** modal shell (props in, callback out; no store import). Follow the house pattern where the frame owns store writes and primitives take callbacks (`SidebarNavItem` takes `onselect`). [Source: SidebarNavItem.svelte:1-27; architecture.md:325-326]
  - [x] **Props (Svelte 5 `$props`):**
    ```ts
    let { title, onclose, children }: {
      title: string
      onclose: () => void
      children: import('svelte').Snippet
    } = $props()
    ```
    `children` is the body slot — in this story App passes a temporary placeholder; in 2.8 App passes the registered content component. [Source: Svelte 5 snippet idiom]
  - [x] **Structure (mirror the mockup composition):** a `.scrim` (fixed/absolute `inset:0`, `background: var(--color-scrim)`, flex-centered) wrapping a `.modal` white surface containing a `header` (title `<h3>` + close `<button class="x">✕</button>`), a `.body` rendering `{@render children()}`, and a `.footer` hint line. [Source: mockup key-screen-cheatsheet-modal.html:48-66,103-120; DESIGN.md:220]
  - [x] **CRITICAL — `pointer-events`:** the modal renders inside `App.svelte`'s `.modal-layer`, which is `pointer-events: none` (App.svelte:79). The `.scrim` **MUST** set `pointer-events: auto` or every click (close, scrim, content) is swallowed and the modal is dead. This is the exact caveat recorded in deferred-work.md:38 for this story. [Source: deferred-work.md:38; App.svelte:76-80]
  - [x] **Styling — tokens only (no hardcoded hex/size that has a token):**
    - scrim: `var(--color-scrim)` (= `rgba(7,41,29,.55)`)
    - surface: `background: var(--color-card-face)`, `color: var(--color-sidebar-text)` (dark ink on white — this is a *light* surface, not felt), `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-modal)`
    - close button radius: `var(--radius-sm)`; header title `font: var(--font-heading-sm)`, `color: var(--color-felt)`
    - footer text `font: var(--font-caption)`, dim ink (`var(--color-sidebar-text-dim)`)
    - The white modal's *internal* hairline dividers (e.g. header underline `#e7e7e3`) and the `Esc` keycap chrome have **no token** — those are sheet-content presentation that belongs to 2.8; in 2.7 keep the shell minimal (a header border using `1px solid var(--color-sidebar-border)` is the closest token and is acceptable). [Source: tokens.css:8-84; DESIGN.md:151-156,200,205]
  - [x] **Dismiss wiring (all three must call `onclose`):**
    - **Close control:** `<button class="x" onclick={onclose}>`
    - **Click-away:** `onclick` on the `.scrim` that calls `onclose` **only when the click target is the scrim itself**, not a click that bubbled from inside `.modal` — guard with `onclick={(e) => { if (e.target === e.currentTarget) onclose() }}`. Add `onclick|stopPropagation` is the old syntax; in Svelte 5 use the `e.target === e.currentTarget` guard (cleaner, no deprecated modifiers). [Source: UX-DR14 epics.md:81; EXPERIENCE.md:68]
    - **Esc:** `<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose() }} />`. Use `svelte:window` rather than a manual `$effect`/`addEventListener` — the listener auto-mounts/unmounts with the component, and the component only renders while the modal is open (App guards with `{#if}`), so no global key-leak. [Source: UX-DR20 epics.md:87; EXPERIENCE.md:93]
  - [x] **Accessibility (NFR-2, UX-DR19/20):**
    - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at the title `<h3>`'s `id`.
    - Close button gets an `aria-label="Close"` (the `✕` glyph is not a label). [Source: deferred-work.md:26 — the aria-label deferral was for the visible-text Pager; the icon-only ✕ here genuinely needs one]
    - **Focus on open:** move focus into the modal (the close button) when it mounts — a single `$effect` that calls `closeButton.focus()` on mount, or a bound element with `{@attach}`/`autofocus`. Visible focus is already global (`:focus-visible` in global.css:16-19). [Source: NFR-2; global.css:16-19]
    - **Focus restore on close:** App re-focuses the triggering sidebar row after close. See Task 4 note — simplest is for the modal not to own this; App/Sidebar handles restore, OR accept a minor focus-to-body on close as a deferred refinement (record in completion notes). Do the *focus-on-open* (high value, cheap); a full focus-trap (Tab cycling within the modal) is **out of scope** — the 2.7 modal body has only the close button, so trapping is moot until 2.8 content adds focusable elements. Note this boundary in completion notes. [Source: scale guidance — architecture.md:590-591]
  - [x] **Restrained motion (UX-DR18, hard rule):** modal appears with only a quick, quiet fade (reuse the `section-fade` idiom: a `@keyframes` fade over `var(--motion-fast) var(--motion-ease)`). **Banned:** scale/pop/bounce/slide-in flourishes, backdrop blur animation, spinners. A plain opacity fade only. [Source: UX-DR18 epics.md:85; EXPERIENCE.md:95; App.svelte:54-61]
  - [x] **Stateless otherwise** — no `$state` beyond an optional element binding for focus; no business logic. It renders what it's given and reports close.

- [x] **Task 4: Add the Cheat Sheets panel to `Sidebar.svelte` (AC: #1, #2)**
  - [x] **Read first:** `Sidebar.svelte` — it is a flex `column` `.side` holding the wordmark, a `Sections` `navlabel`, and the `nav` of `SidebarNavItem`s. It already writes the store directly (`appState.currentSection = i` at line 18). [Source: Sidebar.svelte:1-52]
  - [x] **Update:** below the existing `<nav>`, add a lower panel:
    - `import { cheatSheets } from '../../content/cheatsheets'`
    - A wrapping `<div class="sheets">` (or `<section>`) pushed to the bottom with `margin-top: auto` (matches the mockup `.sheets{margin-top:auto}`) and separated by a top divider `border-top: 1px solid var(--color-sidebar-border)`.
    - A `Cheat Sheets` label reusing the existing `.navlabel` class/style.
    - `{#each cheatSheets as sheet (sheet.id)}` → a `<button type="button" class="sheet" onclick={() => (appState.openCheatSheet = sheet.id)}>` with a leading chevron glyph (`›`) and the `sheet.title`. [Source: mockup:81-87; UX-DR3 epics.md:70; Sidebar.svelte:13-20]
  - [x] **Chevron-row style (quiet rows, per UX-DR3 / DESIGN.md:210):** small, low-emphasis — `font: var(--font-body-md)` or `--font-caption`, `color: var(--color-sidebar-text)`, padding `var(--space-2)`/`var(--space-3)`, `border-radius: var(--radius-sm)`, transparent background, full-width left-aligned. Leading `›` chevron in the dim ink. These are reference links, visually quieter than the Section nav items. [Source: DESIGN.md:210; mockup:36-37]
  - [x] **Do NOT extract a new `SidebarSheetItem.svelte` component.** The architecture file tree lists `Sidebar.svelte` + `SidebarNavItem.svelte` only — no sheet-item component. Inline the chevron rows in `Sidebar.svelte` to stay structurally faithful. [Source: architecture.md:415-416]
  - [x] **Open writes the store directly** here (consistent with the existing `currentSection` write on line 18) — `appState.openCheatSheet = sheet.id`. Only that field flips; `currentSection` is never touched (AC4). [Source: architecture.md:325-326; epics.md:427-429]
  - [x] **Keyboard (NFR-2, UX-DR20):** native `<button>`s are tab-reachable and Enter/Space-activatable with the global visible focus ring — no extra work, just don't break it (no `tabindex`, no `div`-with-onclick). [Source: SidebarNavItem.svelte:17 — same native-button pattern; global.css:16-19]

- [x] **Task 5: Wire the modal into `App.svelte` (AC: #2, #3, #4)**
  - [x] **Read first:** `App.svelte` — `.modal-layer` is currently an empty `position:fixed; inset:0; pointer-events:none` div at line 37/76-80. The content `<main>` renders the active Section and **must never unmount** when the modal opens (AC3). [Source: App.svelte:1-81]
  - [x] **Imports:** `import CheatSheetModal from './lib/components/CheatSheetModal.svelte'` and `import { cheatSheets } from './content/cheatsheets'`.
  - [x] **Derive the open sheet:** `const openSheet = $derived(cheatSheets.find((s) => s.id === appState.openCheatSheet))` — `undefined` when nothing is open. [Source: architecture.md:323-324 — `$derived` for computed values]
  - [x] **Render inside `.modal-layer`:**
    ```svelte
    <div class="modal-layer">
      {#if openSheet}
        <CheatSheetModal title={openSheet.title} onclose={() => (appState.openCheatSheet = null)}>
          <!-- TEMPORARY (Story 2.7): real sheet content arrives in Story 2.8.
               2.8 replaces this with the registered content component for openSheet.id. -->
          <p class="cs-placeholder">This reference sheet is coming together — its content arrives shortly.</p>
        </CheatSheetModal>
      {/if}
    </div>
    ```
  - [x] **Keep `.modal-layer` `pointer-events: none`** — do NOT change it. The modal's own `.scrim` re-enables pointer events (Task 3). Changing the layer would re-introduce the deferred-work.md:38 hazard for any future non-modal layer child. [Source: deferred-work.md:38; App.svelte:76-80]
  - [x] **Do NOT touch** the `{#if sectionContent[active.id]}` block or the `{:else}` fallback (App.svelte:16-33) — out of scope; the modal is an independent sibling in the modal layer. The underlying `<main>`/`InformationalScreen` stays mounted, satisfying AC3 (inputs preserved). [Source: App.svelte:16-34; epics.md:425]
  - [x] **Placeholder copy** uses warm-coach voice, no hype, no emoji (UX-DR16). It is throwaway; 2.8 removes it. [Source: UX-DR16 epics.md:83]

- [x] **Task 6: Data test for the cheat-sheet metadata (AC: #1)**
  - [x] **New file:** `pokermath/src/content/cheatsheets.test.ts` — mirror `sections.test.ts` exactly (Vitest, node env, pure data). [Source: sections.test.ts:1-22]
  - [x] Cover: (a) `cheatSheets` has exactly 4 entries; (b) ids in fixed order `['deck','holdem','rankings','jargon']`; (c) every title is a non-empty string. No DOM, no component render — pure data assertions only. [Source: sections.test.ts:4-21; AR-1 node-env constraint deferred-work.md:54]
  - [x] **Why a data test (when components get none):** the cheat-sheet list is pure typed data, exactly like `sections` — and `sections` has a co-located test. The modal, sidebar panel, and App wiring are Svelte components: **node-env Vitest cannot render them, and adding a DOM test lib (jsdom/happy-dom) would violate AR-1**, so those are verified by the Task 7 manual pass. [Source: deferred-work.md:54; architecture.md:507-509]

- [x] **Task 7: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run check` → svelte-check + tsc, **0 errors / 0 warnings**. Confirms the new `CheatSheetId` type threads through `appState`, the modal props type-check, and the Sidebar/App wiring is sound.
  - [x] `npm run test -- --run` → existing suite stays green **plus the new `cheatsheets.test.ts`** (was 3 files / 69 tests → now 4 files / 72 tests). Record the exact new totals.
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8).
  - [x] **Manual visual pass** (`npm run dev`):
    - **Sidebar panel (AC1):** lower panel shows the four sheets as quiet chevron rows — The 52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon — in that order, pushed to the bottom of the sidebar, separated from the Sections list by a visible `sidebar-border` divider.
    - **Open (AC2):** click any sheet row → modal opens centered over a felt-tinted scrim; the white surface shows the sheet **title** + close ✕ + the temporary placeholder body + footer hint; the underlying Section behind the scrim is **unchanged** (same Section still active in the sidebar, same content dimmed beneath).
    - **Dismiss ×3 (AC3):** (i) press **Esc** → closes; (ii) re-open, **click the scrim** (outside the white surface) → closes; (iii) re-open, click the **✕** control → closes. A click *inside* the white modal surface must **not** close it.
    - **No navigation change (AC4):** open a sheet from, say, the Pot Odds section, close it → still on Pot Odds, exactly as left. Open/close from each of the four Sections — active Section never changes.
    - **Underlying screen preserved (AC3):** the Section content behind the modal does not re-mount or reset on open/close (visually: no flash/re-fade of the underlying prose). *(Real input preservation is exercised in Epic 3 once assessment fields exist; the mechanism — not unmounting `<main>` — is what guarantees it.)*
    - **Keyboard (NFR-2, UX-DR20):** Tab reaches each sheet row with a visible focus ring; Enter/Space on a focused row opens the modal; focus lands inside the modal (close button) on open; Esc closes. Full open→read→close cycle completable without a mouse.
    - **Motion (UX-DR18):** modal appears with a quick quiet fade only — no pop/scale/slide/spinner.
    - **Pointer-events sanity:** confirm the close button, scrim-click, and (later) body are all clickable — proving the `.scrim` set `pointer-events: auto` against the `pointer-events: none` layer.
    - **No regression:** all four Sections still render and navigate (sidebar + Back/Next); reload returns to Introduction with state cleared and `openCheatSheet` back to `null` (FR-3, UX-DR21); quiet section fade intact.
  - [x] Record exact command outputs + visual-pass result in Dev Agent Record → Completion Notes.

### Review Findings

- [x] [Review][Patch] `as const` defeated by explicit `readonly CheatSheet[]` annotation — literal narrowing is a no-op; use `as const satisfies readonly CheatSheet[]` [content/cheatsheets.ts:5]
- [x] [Review][Patch] `kbd` padding hardcodes `4px` where `--space-1` (= 4px) exists — AR-2 token violation [lib/components/CheatSheetModal.svelte:127]
- [x] [Review][Patch] `.navlabel` `margin-top: var(--space-8)` (32px) inside `.sheets` creates a 44px gap between border divider and "Cheat Sheets" label [lib/components/Sidebar.svelte:59]
- [x] [Review][Defer] Hardcoded `id="cs-title"` would break if two modals mounted simultaneously [lib/components/CheatSheetModal.svelte:35] — deferred, single-modal arch guarantees one instance; revisit if stacked modals introduced
- [x] [Review][Defer] `modal-layer pointer-events: none` fragile for future non-modal children [src/App.svelte:89] — deferred, pre-existing; documented in deferred-work.md
- [x] [Review][Defer] Escape keydown not calling `e.stopPropagation()` [lib/components/CheatSheetModal.svelte:21] — deferred, no competing Escape listener today; add if future keyboard handlers stack
- [x] [Review][Defer] Drag-release on scrim closes modal (mouseup after text-select ending on scrim) [lib/components/CheatSheetModal.svelte:25] — deferred, minor UX edge case, not required by spec
- [x] [Review][Defer] `navlabel <span>` "Cheat Sheets" has no semantic group association for AT [lib/components/Sidebar.svelte:25] — deferred, pre-existing house pattern ("Sections" uses same shape)
- [x] [Review][Defer] Sheet buttons missing `aria-haspopup="dialog"` [lib/components/Sidebar.svelte:27-31] — deferred, enhancement beyond NFR-2 scope for 2.7
- [x] [Review][Defer] `cs-placeholder` style scoped to `App.svelte` is invisible coupling if moved to a child [src/App.svelte:92-100] — deferred, placeholder replaced entirely in Story 2.8
- [x] [Review][Defer] Scroll position not reset when switching sheets without closing [lib/components/CheatSheetModal.svelte] — deferred, placeholder body cannot scroll; address in 2.8 when content is scrollable
- [x] [Review][Defer] Invalid `openCheatSheet` value silently fails to open modal [lib/appState.svelte.ts:7] — deferred, TypeScript-guarded; direct mutation is the only write path

## Dev Notes

### Scope boundary (read first)

Story 2.7 builds the **cheat-sheet mechanism**: the sidebar panel that lists the four sheets, the `CheatSheetModal` shell, the store field that drives it, and the App-level wiring. It does **not** author the sheets' reference content — that is Story 2.8.

**This story DOES:**
- Add `openCheatSheet: CheatSheetId | null` to `appState.svelte.ts`.
- Create `content/cheatsheets.ts` (metadata: id + title, fixed order) + `content/cheatsheets.test.ts`.
- Create `lib/components/CheatSheetModal.svelte` (presentational shell: scrim, surface, header+close, body slot, footer; Esc / click-away / close; a11y; quiet fade).
- Add the lower **Cheat Sheets** panel to `Sidebar.svelte` (inline chevron rows).
- Wire the modal into `App.svelte`'s `.modal-layer` with a **temporary placeholder body**.

**This story does NOT:**
- **Author the four sheets' content** (`Deck.svelte`, `HoldEmRules.svelte`, `HandRankings.svelte`, `Jargon.svelte`) or create the `content/cheatsheets/index.ts` `id→component` registry → **Story 2.8**. [Source: epics.md:431-449; architecture.md:440-444]
- **Extract a `SidebarSheetItem.svelte`** — not in the architecture tree; inline the rows. [Source: architecture.md:415-416]
- **Touch `currentSection` or any navigation state** — AC4 demands modal/nav orthogonality. [Source: epics.md:427-429]
- **Change `.modal-layer`'s `pointer-events: none`** — the modal's scrim re-enables locally instead. [Source: deferred-work.md:38]
- **Build a focus-trap** (Tab cycling) — moot with only a close button in the 2.7 body; revisit if 2.8 content warrants. [Source: architecture.md:590-591]
- **Add any npm dependency** (AR-1 stack locked) or **add a new accent hue / hardcode a tokenized value** (AR-2).

### The `pointer-events` trap (the one thing that will silently break this)

`App.svelte`'s `.modal-layer` is `position: fixed; inset: 0; pointer-events: none` (App.svelte:76-80). That `none` is deliberate — it lets the empty layer sit over the app without blocking clicks to the content beneath. **But a modal placed inside it inherits an unclickable surface.** The fix, recorded as a standing caveat back in the Epic 1 review, is: the modal's own `.scrim` sets `pointer-events: auto`. Miss this and the modal renders perfectly but ignores every click (close, scrim, content) — a confusing "looks right, does nothing" failure.
[Source: deferred-work.md:38 — *"`modal-layer` `pointer-events: none` … document this caveat when Story 2.7 adds modal content so that component sets `pointer-events: auto` on the modal itself."*; App.svelte:76-80]

### State design — one field, direct mutation (AR-5)

`appState` is the single source of mutable runtime state and uses the **direct-mutation runes idiom** — no reducers/actions. Add exactly one field:

```ts
export const appState = $state({
  currentSection: 0,
  openCheatSheet: null as CheatSheetId | null, // null = closed; a CheatSheetId = that sheet open
})
```

Open = `appState.openCheatSheet = id`; close = `appState.openCheatSheet = null`. Because state is in-memory only, a reload clears it back to `null` for free (FR-3 / UX-DR21 — same mechanism that resets `currentSection`). The `CheatSheetId` import is **type-only**; `content/cheatsheets.ts` imports nothing from `lib/`, so there is no import cycle.
[Source: AR-5 epics.md:58; architecture.md:318-327,402-404; FR-3 epics.md:23]

### Presentational modal, frame-owned writes (house pattern)

The codebase's established pattern: **store → component (read); component → store (write) happens at the frame level**, and leaf primitives take callbacks. `SidebarNavItem` is the template — it takes `onselect: () => void` and never imports the store. Apply the same to `CheatSheetModal`: it takes `title`, `onclose`, and a `children` snippet, and stays free of `appState`. App owns the close write (`onclose={() => appState.openCheatSheet = null}`); the Sidebar owns the open write inline (consistent with its existing `currentSection` mutation on line 18).
[Source: SidebarNavItem.svelte:1-27; Sidebar.svelte:18; architecture.md:325-326]

### Why a placeholder body (content/mechanism split)

This is the same staged approach Epic 2 already used for sections: Story 2.2 shipped the Informational *archetype* with a temporary title-only fallback, and 2.3–2.6 filled the prose. Here, 2.7 ships the modal *mechanism* with a temporary placeholder body, and 2.8 fills the four sheets + the `id→component` registry (`content/cheatsheets/index.ts`, mirroring `content/sections/index.ts`). Keeping the `CheatSheetModal` body a `children` snippet means 2.8 swaps placeholder → real content with **zero changes to the modal component** — only App's render block changes.
[Source: epics.md:311-330 (2.2 archetype), 431-449 (2.8); sections/index.ts:1-15; architecture.md:440-444]

### Tokens for the modal — note the light surface

The modal is a **white** surface, unlike every felt screen so far, so its ink comes from the *sidebar* (light-context) color family, not the on-felt family:
- scrim `var(--color-scrim)` · surface `var(--color-card-face)` · surface ink `var(--color-sidebar-text)` / dim `var(--color-sidebar-text-dim)`
- radius `var(--radius-lg)` · shadow `var(--shadow-modal)` (highest elevation — the modal lifts above cards and panels) · header title `var(--font-heading-sm)` in `var(--color-felt)`
- header divider / close-button border: nearest token is `var(--color-sidebar-border)` — acceptable; the mockup's `#e7e7e3` and `Esc`-keycap chrome are sheet-content polish for 2.8, not shell tokens.

Every value that has a token must reference it (AR-2). No new accent hue. [Source: tokens.css:3-84; DESIGN.md:151-156,200,205,220]

### Restrained motion (UX-DR18 — hard rule)

The modal opens with a quick quiet **opacity fade** only. Reuse the existing idiom from `App.svelte:54-61` (`@keyframes` fade over `var(--motion-fast) var(--motion-ease)`, `animation-fill-mode: backwards`). Banned: scale/pop/bounce, slide-in, backdrop-blur transitions, spinners, attention-pulse. The global `prefers-reduced-motion` block (global.css:21-29) already collapses durations; nothing extra needed (and note deferred-work.md:20 — that block doesn't zero `*-delay`, so do not add a transition/animation *delay* here). [Source: UX-DR18 epics.md:85; App.svelte:54-61; global.css:21-29; deferred-work.md:20]

### Keyboard & accessibility (NFR-2, UX-DR19/20)

- **Esc closes** the modal (UX-DR20, EXPERIENCE.md:93) — via `<svelte:window onkeydown>`, scoped to the modal's lifetime by App's `{#if}` guard.
- Native `<button>` sheet rows are tab-reachable + Enter/Space-activatable with the global `:focus-visible` ring — keep them native (no `div`+onclick, no custom `tabindex`).
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title id; icon-only ✕ gets `aria-label="Close"`.
- **Focus-on-open** (move focus to the close button) is in scope and cheap. **Focus-trap** (Tab cycling) is out of scope — the 2.7 body has only the close button; revisit when 2.8 content adds focusable elements. Note this boundary in completion notes.
[Source: NFR-2 epics.md:38; UX-DR19/20 epics.md:86-87; EXPERIENCE.md:93,107; global.css:16-19]

### Click-away guard (Svelte 5 idiom)

Use the target-identity guard, not deprecated event modifiers:
```svelte
<div class="scrim" onclick={(e) => { if (e.target === e.currentTarget) onclose() }} role="presentation">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cs-title"> … </div>
</div>
```
A click that originates inside `.modal` has `e.target !== e.currentTarget`, so it won't close. (Svelte 5 removed `on:click|stopPropagation` — don't reach for it.) `svelte-check` may warn about a click handler on a non-interactive `<div>`; the `role="presentation"` plus the keyboard path living on the explicit close button + `svelte:window` Esc covers the a11y intent — if a warning persists, prefer satisfying it over suppressing, but do not add a redundant keyboard handler to the scrim. [Source: UX-DR14 epics.md:81; EXPERIENCE.md:68]

### Previous story intelligence (2.2–2.6 + Epic 1)

- **All four Sections now have registered content** (intro/equity/pot-odds/calling), so `App.svelte`'s `{:else}` fallback (lines 23-33) is currently dead — but **leave it untouched** (Epic 3 repurposes it for `AssessmentScreen`). [Source: sections/index.ts:10-15; App.svelte:23-33]
- **Sidebar already writes the store directly** (`appState.currentSection = i`, line 18) — the open-sheet write follows the same idiom. [Source: Sidebar.svelte:18]
- **`SidebarNavItem` is the callback-prop template** for presentational components. [Source: SidebarNavItem.svelte:1-27]
- **Components are node-untestable** — no render test for the modal/sidebar/App; only the pure `cheatsheets.ts` data gets a test (like `sections.ts`). Existing **3 files / 69 tests** stay green; the new data test brings it to **4 files / 72 tests**. [Source: deferred-work.md:54; sections.test.ts:1-22]
- **`active` is `undefined` if `currentSection` goes out of range** — not a concern here (this story never writes `currentSection`), but don't introduce any path that could. [Source: deferred-work.md:8]
- **Token discipline is house style** — never hardcode a value that has a token. [Source: architecture.md:283]

### Architecture compliance (guardrails)

- **Structure:** `lib/appState.svelte.ts` (UPDATE), `content/cheatsheets.ts` (NEW), `content/cheatsheets.test.ts` (NEW), `lib/components/CheatSheetModal.svelte` (NEW), `lib/components/Sidebar.svelte` (UPDATE), `App.svelte` (UPDATE). All match the documented tree; no structural variance, no undocumented component. [Source: architecture.md:402-425]
- **Naming:** PascalCase component `CheatSheetModal`; camelCase data module `cheatsheets.ts`; PascalCase types `CheatSheet`/`CheatSheetId`; `cheatSheets` exported data array (camelCase). [Source: architecture.md:269-283]
- **State boundary (AR-5):** one new field on the single store; direct mutation; no external state lib. [Source: architecture.md:454-457]
- **Content boundary (AR-9):** sheet metadata is typed TS under `content/`; the modal shell (shape only) lives in `lib/components/`. No content hardcoded in the shell. [Source: architecture.md:458-460]
- **Styling boundary (AR-2):** every value from `tokens.css`; no new hue. [Source: architecture.md:283,462-463]
- **No-router (AR-6):** the modal is a **state-driven overlay**, not a route; opening/closing never unmounts the underlying screen. [Source: AR-6 epics.md:59; architecture.md:204-207]

### Testing standards

- **One new automated test:** `content/cheatsheets.test.ts` (pure data, mirrors `sections.test.ts`). [Source: sections.test.ts:1-22]
- **No component render tests** — node-env Vitest can't render Svelte and a DOM test lib violates AR-1. Modal/sidebar/App behavior is verified by the Task 7 manual walkthrough. [Source: deferred-work.md:54; architecture.md:507-509]
- **Verification = `check`/`test`/`build` green + the Task-7 visual + keyboard walkthrough.**

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `1a79794` (`feat(2.6)` — Calling Profitably content complete; 3 files / 69 tests green). 2.7 is the first story to touch the **app frame** (`App.svelte`, `Sidebar.svelte`, `appState`) since Epic 1 — a wider blast radius than the pure content stories 2.3–2.6. The no-regression visual pass across all four Sections + reload matters here more than it did for content-only work. The `pointer-events` caveat (deferred-work.md:38) is the single highest-risk detail; it was logged specifically for this story.

### Project Structure Notes

Six files touched — three new, three updated:
- `pokermath/src/lib/appState.svelte.ts` — **UPDATE** (add `openCheatSheet` field + type import)
- `pokermath/src/content/cheatsheets.ts` — **NEW** (metadata + types)
- `pokermath/src/content/cheatsheets.test.ts` — **NEW** (data test)
- `pokermath/src/lib/components/CheatSheetModal.svelte` — **NEW** (modal shell)
- `pokermath/src/lib/components/Sidebar.svelte` — **UPDATE** (lower Cheat Sheets panel)
- `pokermath/src/App.svelte` — **UPDATE** (render modal in `.modal-layer`, placeholder body)

No new directories, no new dependencies, no structural variance. `content/cheatsheets/` (the folder for the four content components) and `content/cheatsheets/index.ts` are created in **Story 2.8**, not here.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.7] — story statement + ACs (lines 407-429)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-6 on-demand cheat sheets / inputs preserved (26), AR-5 single store (58), AR-6 no-router state-driven modals (59), AR-9 content split (62), UX-DR3 sidebar sheets panel (70), UX-DR14 cheat-sheet modal (81), UX-DR16 warm-coach voice (83), UX-DR18 restrained motion (85), UX-DR19/20 a11y + keyboard (86-87), NFR-2 accessibility floor (38), FR-3 no persistence (23)
- [Source: _bmad-output/planning-artifacts/architecture.md] — `CheatSheetModal.svelte` in tree (425), `appState.svelte.ts` cheat-sheet target (403-404), state/content/styling boundaries (454-463), runes direct-mutation + `$derived` (318-327), naming (269-283), no-router modals (204-207), component tests optional (507-509), focus-trap scale note (590-591)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:38] — **`.modal-layer` `pointer-events: none` caveat, logged explicitly for Story 2.7**
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:20] — reduced-motion block doesn't zero `*-delay` (don't add a transition delay)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:54] — node-env / no component-test-lib (AR-1)
- [Source: pokermath/src/App.svelte:16-34,76-80] — content render block (don't touch) + `.modal-layer` (render target; keep `pointer-events: none`)
- [Source: pokermath/src/lib/appState.svelte.ts:1-5] — store to extend
- [Source: pokermath/src/lib/components/Sidebar.svelte:1-52] — frame to extend (lower panel); direct store-write idiom at line 18
- [Source: pokermath/src/lib/components/SidebarNavItem.svelte:1-27] — callback-prop presentational template + active/done style reference
- [Source: pokermath/src/content/sections.ts:1-37] — metadata shape to mirror for `cheatsheets.ts`
- [Source: pokermath/src/content/sections.test.ts:1-22] — data-test template for `cheatsheets.test.ts`
- [Source: pokermath/src/content/sections/index.ts:1-15] — registry pattern that Story 2.8 will mirror for `content/cheatsheets/index.ts`
- [Source: pokermath/src/styles/tokens.css:3-84] — `--color-scrim`, `--color-card-face`, `--shadow-modal`, `--radius-lg`, `--color-sidebar-border`, `--color-sidebar-text(-dim)`, `--font-heading-sm`, `--font-caption`, `--motion-fast`, `--motion-ease`
- [Source: pokermath/src/styles/global.css:16-29] — global `:focus-visible` ring + `prefers-reduced-motion` block
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md:151-156,200,205,209-210,220] — cheat-sheet-modal token spec, shadow/radius roles, sidebar sheet-list item spec
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md:32,60,68,80,93,95,130] — cheat-sheet behavior contract, Esc/click-away dismiss, inputs-preserved edge case, restrained motion
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-cheatsheet-modal.html] — composition reference (sidebar sheets panel + modal over dimmed Section)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — no blocking issues encountered. The `pointer-events: auto` caveat (deferred-work.md:38) was handled correctly first-pass.

### Completion Notes List

- **Task ordering:** `cheatsheets.ts` (Task 2) created before `appState.svelte.ts` update (Task 1) since the type import requires the source to exist. Test written (Task 6 RED) then source created (GREEN) per TDD discipline.
- **`pointer-events` caveat resolved:** `.scrim` sets `pointer-events: auto`; `.modal-layer` remains `pointer-events: none`. Verified all three dismiss paths (✕, Esc, scrim-click) clickable; inner modal surface does not close on click.
- **Focus-on-open:** `$effect` binds close button reference and calls `.focus()` on mount. Playwright confirmed `BUTTON[aria-label="Close"]` receives focus immediately after modal opens.
- **Focus-trap:** Out of scope for 2.7 (only the close button is focusable in the body). Revisit when 2.8 content adds focusable elements.
- **Focus-restore on close:** Not implemented — focus returns to body on dismiss. Acceptable per story scope; record here as a deferred refinement for 2.8 or Epic 3.
- **`cs-placeholder` style scoping:** Placed in `App.svelte` `<style>` block; Svelte 5 applies parent component scope to snippet content, so this is correct.
- **Test suite:** `check` 0 errors/warnings · `test` 4 files / 72 tests (was 3/69) · `build` clean 376ms.
- **Playwright visual pass:** AC1–AC4 all confirmed. Screenshots at `_verify/2-7/`.

### File List

- `pokermath/src/lib/appState.svelte.ts` — updated (added `openCheatSheet` field + `CheatSheetId` type import)
- `pokermath/src/content/cheatsheets.ts` — new (CheatSheetId type, CheatSheet type, cheatSheets array)
- `pokermath/src/content/cheatsheets.test.ts` — new (data test: 3 assertions, mirrors sections.test.ts)
- `pokermath/src/lib/components/CheatSheetModal.svelte` — new (presentational modal shell)
- `pokermath/src/lib/components/Sidebar.svelte` — updated (Cheat Sheets lower panel)
- `pokermath/src/App.svelte` — updated (modal wiring in .modal-layer, openSheet derived)

## Change Log

- 2026-05-30: Story 2.7 implemented — cheat-sheet panel & modal mechanism. 3 new files, 3 updated files; 4 files / 72 tests green; check 0 errors. Story → review.
