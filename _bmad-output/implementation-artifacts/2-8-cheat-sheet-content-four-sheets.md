---
baseline_commit: 2962443
---

# Story 2.8: Cheat-sheet content (four sheets)

Status: review

## Story

As a learner,
I want each cheat sheet to actually teach the prerequisite,
So that the refresher is useful.

## Acceptance Criteria

**AC1 — Four sheets render content (FR-6)**
**Given** the four cheat-sheet ids `deck`, `holdem`, `rankings`, `jargon`
**When** each opens
**Then** `Deck`, `HoldEmRules`, `HandRankings`, and `Jargon` render their own reference content — the 2.7 placeholder `<p class="cs-placeholder">` is gone

**AC2 — PlayingCard primitive used for card examples (FR-7, NFR-2)**
**Given** the four-color deck scheme
**When** Deck or HandRankings show card examples
**Then** they use `PlayingCard` from `lib/components/PlayingCard.svelte` (symbol + color, never text-only)

**AC3 — All four reachable; warm-coach voice (FR-6, UX-DR16)**
**Given** any Section
**When** a learner opens any of the four sheets
**Then** all four are reachable; all copy uses the warm-coach register — encouraging, second-person, no emoji, no hype

## Tasks / Subtasks

- [x] **Task 1: Create `content/cheatsheets/index.ts` — the id→component registry (AC: #1)**
  - [x] **Read first:** `content/sections/index.ts` — the exact shape to mirror. It imports `type { Component } from 'svelte'`, types the export as `Partial<Record<SectionId, Component>>` (partial because not all sections have content yet), and imports each component. [Source: content/sections/index.ts:1-15]
  - [x] **New file:** `pokermath/src/content/cheatsheets/index.ts`
  - [x] **Key difference vs sections:** all four sheets have content in this story, so type as `Record<CheatSheetId, Component>` — **not** `Partial`. This means App.svelte can use `cheatSheetContent[openSheet.id]` without a null guard. [Source: architecture.md:440-444]
  - [x] **Exports:**
    ```ts
    import type { Component } from 'svelte'
    import type { CheatSheetId } from '../cheatsheets'
    import Deck from './Deck.svelte'
    import HoldEmRules from './HoldEmRules.svelte'
    import HandRankings from './HandRankings.svelte'
    import Jargon from './Jargon.svelte'

    export const cheatSheetContent: Record<CheatSheetId, Component> = {
      deck: Deck,
      holdem: HoldEmRules,
      rankings: HandRankings,
      jargon: Jargon,
    }
    ```
  - [x] **Naming:** `Deck`, `HoldEmRules`, `HandRankings`, `Jargon` — PascalCase file = PascalCase import (matches `sections/index.ts` convention). [Source: architecture.md:269-271]

- [x] **Task 2: Author `Deck.svelte` — The 52-card Deck (AC: #1, #2, #3)**
  - [x] **New file:** `pokermath/src/content/cheatsheets/Deck.svelte`
  - [x] **Imports needed:** `PlayingCard` from `../../lib/components/PlayingCard.svelte`; `parseCard` from `../../lib/cards`. [Source: IntroContent.svelte:2-3 — same import path pattern]
  - [x] **Content to author** (warm-coach voice, no emoji):
    - Opening: "A standard deck has 52 cards: 13 ranks in each of 4 suits."
    - **Ranks** heading (or `<strong>`): ranks high-to-low: A K Q J T 9 8 7 6 5 4 3 2. Note `T` = ten — never `10`. Reinforce the hand-notation rule from the Introduction.
    - **Suits** heading: one `PlayingCard` per suit showing the symbol + color.
      - Use `parseCard('Ah')` (♥ red), `parseCard('Kd')` (♦ blue), `parseCard('Qc')` (♣ green), `parseCard('Js')` (♠ black).
      - Render the four cards in a horizontal flex row.
      - A caption below: "♥ red · ♦ blue · ♣ green · ♠ black"
    - Closing note: "The Ace plays high (above a King) or low (below a 2) in a straight, but not both at once."
  - [x] **Styles (token-only, no hardcoded values):**
    - Card row: `display: flex; gap: var(--space-3); margin: var(--space-4) 0;`
    - Caption below cards: `font: var(--font-caption); color: var(--color-sidebar-text-dim);`
    - `<p>` spacing: `margin: 0; margin-top: var(--space-4);` on `p + p` (or inline structural spacing)
    - `code` (for notation like `T`): `font: var(--font-value); color: var(--color-sidebar-text);`
  - [x] **Do NOT** introduce a `<style>` that uses hardcoded hex/size values — use only `var(--…)` (AR-2). [Source: architecture.md:283]

- [x] **Task 3: Author `HoldEmRules.svelte` — Texas Hold 'Em Rules (AC: #1, #3)**
  - [x] **New file:** `pokermath/src/content/cheatsheets/HoldEmRules.svelte`
  - [x] **No PlayingCard import needed** — this sheet is prose/structure only (no card examples required; AC2 specifies only Deck and HandRankings).
  - [x] **Content to author** (warm-coach voice):
    - **The deal:** "Each player receives 2 private *hole cards* (yours alone). Up to 5 *community cards* are placed face-up on the board — shared by all players. You make the best 5-card hand from any combination of your 2 hole cards + the 5 board cards."
    - **Betting rounds / streets (ordered list):**
      1. **Pre-flop** — hole cards are dealt; first betting round
      2. **Flop** — first 3 board cards revealed; second betting round
      3. **Turn** — 4th board card; third betting round
      4. **River** — 5th board card; final betting round
    - **Showdown:** "When all betting is done, remaining players reveal their hands. The highest-ranked 5-card hand wins — or the last player standing if everyone else folds."
    - **Actions available each round:** Check (no bet owed, pass), Bet/Call (match the bet), Raise (increase the bet), Fold (surrender your hand).
  - [x] **Structure:** use `<ol>` for the ordered streets list. Style with token fonts, no extra complexity. `<strong>` for the round names within the list items.
  - [x] **Styles:** `ol { padding-left: var(--space-6); }` `li { margin-bottom: var(--space-2); font: var(--font-body-md); }` — token-only.

- [x] **Task 4: Author `HandRankings.svelte` — Hand Rankings (AC: #1, #2, #3)**
  - [x] **New file:** `pokermath/src/content/cheatsheets/HandRankings.svelte`
  - [x] **Imports needed:** `PlayingCard`, `parseCard`. This is the most referenced sheet in the learning flow (cited in the LO1 hint ladder). [Source: EXPERIENCE.md:84]
  - [x] **Content:** ranked list from strongest to weakest, 10 hand types. Show PlayingCard examples for the top hands to make them identifiable at a glance:

    | Rank | Hand | Example cards | Description |
    |---|---|---|---|
    | 1 | Royal Flush | Ah Kh Qh | A K Q J T all same suit |
    | 2 | Straight Flush | 9c 8c 7c | Five consecutive, same suit |
    | 3 | Four of a Kind | Kh Ks Kd | Four of the same rank |
    | 4 | Full House | — | Three of a kind + a pair |
    | 5 | Flush | — | Any five of the same suit |
    | 6 | Straight | — | Five in sequence, mixed suits |
    | 7 | Three of a Kind | — | Three of the same rank |
    | 8 | Two Pair | — | Two different pairs |
    | 9 | One Pair | — | Two of the same rank |
    | 10 | High Card | — | None of the above |

  - [x] **Rendering:** author as a numbered list or definition-style layout. For ranks 1–3, show a `PlayingCard` row inline with the hand name; for ranks 4–10, text description only (keeps the sheet scannable and avoids excessive height).
  - [x] **PlayingCard use for ranks 1–3:**
    - `[parseCard('Ah'), parseCard('Kh'), parseCard('Qh')]` for Royal Flush (label "A♥ K♥ Q♥ · · ·")
    - `[parseCard('9c'), parseCard('8c'), parseCard('7c')]` for Straight Flush
    - `[parseCard('Kh'), parseCard('Ks'), parseCard('Kd')]` for Four of a Kind (show 3)
  - [x] **Layout for each ranked item:**
    - Rank number (dim, mono) + Hand name (bold, `sidebar-text`) on one row
    - PlayingCard row below (for ranks 1–3) or description text (for ranks 4–10)
  - [x] **Styles (token-only):**
    - Outer list: no list-style; `display: flex; flex-direction: column; gap: var(--space-4); padding: 0; margin: 0;`
    - Rank number: `font: var(--font-value); color: var(--color-sidebar-text-dim); min-width: var(--space-6);`
    - Hand name: `font: var(--font-body-md); font-weight: 600; color: var(--color-sidebar-text);`
    - Card row: `display: flex; gap: var(--space-2); margin-top: var(--space-2);`
    - Description text (ranks 4–10): `font: var(--font-caption); color: var(--color-sidebar-text-dim); margin-top: var(--space-1);`
    - Divider between items: `border-bottom: 1px solid var(--color-sidebar-border); padding-bottom: var(--space-4);` on each item (except last)

- [x] **Task 5: Author `Jargon.svelte` — Poker Jargon (AC: #1, #3)**
  - [x] **New file:** `pokermath/src/content/cheatsheets/Jargon.svelte`
  - [x] **No PlayingCard import needed** — definitions only.
  - [x] **Terms to define** (definition-list style, in reading-order for the learning flow):
    - **Out** — an unseen card that, if dealt, would complete your hand into a likely winner. Example: with 4 hearts showing, any of the remaining 9 hearts is an out.
    - **Equity** — your hand's probability of winning at showdown, expressed as a percentage. Example: 9 outs × 4 (two streets) ≈ 36%.
    - **Street** — a round of community-card dealing: Flop (3 cards), Turn (1 card), River (1 card). Two streets remain after the Flop.
    - **Board** — the community cards placed face-up in the center for all players to use.
    - **Pot odds** — the ratio of the total pot to the cost of a call. Example: $50 pot and $10 to call = 5:1 pot odds.
    - **Required equity** — the break-even equity threshold from pot odds: `cost ÷ (pot + cost)`. At 5:1 odds: 10 ÷ 60 ≈ 16.7%.
    - **Expected value (EV)** — the average outcome of a decision repeated many times. Positive EV = profitable long-term, even if it loses any individual hand.
    - **All-in** — betting all remaining chips. No more action is owed from that player; the hand goes to showdown.
    - **Showdown** — the point where remaining players reveal their hands and the winner is determined.
  - [x] **Structure:** use `<dl>` with `<dt>` (term) and `<dd>` (definition) semantic pairs — the correct HTML for glossaries.
  - [x] **Styles (token-only):**
    - `dl { margin: 0; }` `dt + dd { margin-bottom: var(--space-4); }`
    - `dt { font: var(--font-body-md); font-weight: 600; color: var(--color-sidebar-text); }`
    - `dd { font: var(--font-body-md); color: var(--color-sidebar-text-dim); margin-left: 0; margin-top: var(--space-1); }`
    - Separate each term-definition pair visually (padding-bottom + border-bottom with `var(--color-sidebar-border)`, except last).

- [x] **Task 6: Update `App.svelte` — wire real content; fix scroll-reset (AC: #1)**
  - [x] **Read first:** `App.svelte` — the current modal block (lines 40–48). It has:
    - `{#if openSheet}` guarding the modal
    - `CheatSheetModal` with `title={openSheet.title}` and a temporary `<p class="cs-placeholder">` body
    - `.cs-placeholder` style in the `<style>` block [Source: App.svelte:40-48, 92-97]
  - [x] **Add import** (script block, after existing imports):
    ```ts
    import { cheatSheetContent } from './content/cheatsheets/index'
    ```
  - [x] **Replace the modal block** (lines 40–48) with:
    ```svelte
    <div class="modal-layer">
      {#if openSheet}
        {#key openSheet.id}
          {@const SheetContent = cheatSheetContent[openSheet.id]}
          <CheatSheetModal title={openSheet.title} onclose={() => (appState.openCheatSheet = null)}>
            <SheetContent />
          </CheatSheetModal>
        {/key}
      {/if}
    </div>
    ```
  - [x] **Why `{#key openSheet.id}`:** when the user clicks a different sheet while the modal is already open, `openSheet.id` changes but `{#if openSheet}` stays true — without `{#key}`, the modal stays mounted and the `.body` scroll position is stuck at where the previous sheet left off. The `{#key}` forces a remount on id change, resetting scroll and re-triggering the focus-on-open `$effect`. This resolves the deferred item from Story 2.7. [Source: deferred-work.md:12; CheatSheetModal.svelte:16-18]
  - [x] **Why `{@const SheetContent = ...}` works:** Svelte 5 `{@const}` binds a local variable inside any template block. `cheatSheetContent` is a full `Record<CheatSheetId, Component>` (not Partial), so `SheetContent` is always defined when `openSheet` is non-null — no conditional guard needed. Rendering `<SheetContent />` (capitalized variable) invokes it as a Svelte component. [Source: InformationalScreen.svelte:10-16 — same `content: Content` rename pattern]
  - [x] **Remove** the `.cs-placeholder` style block from App.svelte's `<style>` (lines 92–97). The placeholder `<p>` is gone; leaving the dead style rule would be misleading. [Source: deferred-work.md:11 — "placeholder replaced entirely in Story 2.8"]
  - [x] **Do NOT** change any other part of App.svelte — the `openSheet` derived, the `sections` / `sectionContent` / `Sidebar` / `Pager` / `InformationalScreen` blocks are all untouched.
  - [x] **Do NOT** touch `CheatSheetModal.svelte` — its shell (body slot, dismiss, focus, aria) is complete from 2.7 and requires no modification.

- [x] **Task 7: Verify (AC: #1, #2, #3)**
  - [x] `npm run check` → 0 errors / 0 warnings. Confirms `cheatSheetContent` types thread correctly: `Record<CheatSheetId, Component>` assigned to each sheet, `{@const SheetContent}` inferred as `Component`, App.svelte `.cs-placeholder` removal doesn't leave a dangling reference.
  - [x] `npm run test -- --run` → all 4 files / 72 tests still green. No new data tests required — the 2.7 `cheatsheets.test.ts` already covers `CheatSheetId` types and the fixed-order array; content components are Svelte (node-env untestable, AR-1). [Source: deferred-work.md — node-env constraint; cheatsheets.test.ts:1-22]
  - [x] `npm run build` → clean static `dist/` (AR-8).
  - [x] **Manual visual pass** (`npm run dev`):
    - **AC1 — Content renders:** open each of the four sheets. Verify:
      - *The 52-card Deck*: shows prose, rank list, four PlayingCards (one per suit), suit-color caption. No placeholder `<p>`.
      - *Texas Hold 'Em Rules*: shows deal description, ordered street list (pre-flop → flop → turn → river), showdown text, action list.
      - *Hand Rankings*: shows 10 ranked hand types; top 3 show PlayingCard examples; ranks 4–10 show text descriptions. Numbered 1–10.
      - *Poker Jargon*: shows definition list (`<dl>`) with all 9 terms. Warm, clear definitions.
    - **AC2 — PlayingCard primitive used:** in Deck and HandRankings, PlayingCard components render with the four-color suit scheme (♥ red, ♦ blue, ♣ green, ♠ black) — symbol + color, never text-only.
    - **AC3 — All four reachable from every Section:** open each of the 4 Sections → sidebar lower panel shows all 4 sheet rows → each opens its sheet.
    - **Scroll reset (deferred-work.md:12 resolved):** open HandRankings (scrollable), scroll down, then click a different sheet from the sidebar *without closing*. New sheet opens at top — scroll position reset. Verified via Playwright: scrollTop 436 → 0 after JS-triggered sheet switch.
    - **Focus on open:** when any sheet opens, focus moves to the close ✕ button.
    - **Dismiss paths (regression check):** Esc, ✕ click, scrim click — all still work for all four sheets.
    - **No navigation change:** active Section unchanged after opening/closing any sheet.
    - **Warm-coach voice:** no emoji, no hype, second-person where applicable.
    - **Token discipline:** no hardcoded color or size in any sheet component — all `var(--…)`. [AR-2]
    - **No regression:** all four Sections (Introduction, Equity, Pot Odds, Calling Profitably) still render and navigate; Back/Next still work; sidebar section nav still works.
  - [x] Record test suite totals + visual pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 2.8 fills the cheat-sheet mechanism built in 2.7. **This story DOES:**
- Create `content/cheatsheets/` folder and the four content components
- Create `content/cheatsheets/index.ts` — the `CheatSheetId → Component` registry
- Update `App.svelte` to replace the placeholder with dynamic component rendering + add `{#key openSheet.id}` for scroll reset

**This story does NOT:**
- Touch `CheatSheetModal.svelte` — shell is complete from 2.7
- Touch `content/cheatsheets.ts` (metadata) or `appState.svelte.ts` (store) or `Sidebar.svelte` — all done in 2.7
- Add any npm dependency (AR-1 stack locked)
- Hardcode any design value that has a token (AR-2)
- Build assessment chrome, hint logic, or any Epic 3 infrastructure

### Dynamic component rendering in Svelte 5 (the exact pattern)

InformationalScreen.svelte (line 10–16) establishes the house pattern for rendering a `Component` type stored in a variable:
```svelte
let { content: Content }: { content: Component } = $props()
// ...
<Content />
```

In App.svelte, `{@const SheetContent = cheatSheetContent[openSheet.id]}` is the inline equivalent — it binds the Component value to a locally-scoped capitalized name, which Svelte then invokes as a component. This works inside any template block in Svelte 5.

**Critical: `cheatSheetContent` is a full `Record`, not `Partial`.** Unlike `sectionContent` (Partial — not all sections have content), every CheatSheetId maps to a component in this story. No `{#if SheetContent}` guard needed — `SheetContent` is always a Component when `openSheet` is non-null. Do NOT add a spurious guard.

### The `{#key openSheet.id}` scroll-reset fix

This resolves `deferred-work.md:12`: "Scroll position not reset when user switches sheets without closing."

Without `{#key}`: `{#if openSheet}` is true before and after a sheet switch — modal stays mounted — `.body` keeps its scroll position from the previous sheet.

With `{#key openSheet.id}`: when `openSheet.id` changes (different sheet selected while modal is open), the entire keyed block unmounts and remounts — new `.body` element starts at `scrollTop: 0` automatically. The `$effect(() => closeButton?.focus())` in `CheatSheetModal` also re-fires on remount, moving focus to ✕ (correct behavior). The modal fade-in animation replays (natural, desirable).

Place `{#key openSheet.id}` inside `{#if openSheet}` (not around it) — `openSheet.id` is only valid when `openSheet` is non-null.

### Styling content components — the white modal context

These components render inside `.modal .body` which has a **white** background (`--color-card-face`). This differs from every prior content component (IntroContent, EquityContent, etc.) which renders on a felt surface.

Token mapping for the white context (mirror `CheatSheetModal.svelte`'s own token choices):
- Body text: `color: var(--color-sidebar-text)` (inherited from `.modal` — no override needed)
- Dim / secondary text: `var(--color-sidebar-text-dim)`
- Dividers: `var(--color-sidebar-border)`
- Body font: inherits from `body { font: var(--font-body-lg) }` (global.css:13) — use `var(--font-body-md)` or `var(--font-caption)` explicitly in components if a smaller size is desired
- Code/mono: `var(--font-value)` (JetBrains Mono — for card notation like `T`, `Ah`)
- Headings within sheets: `var(--font-heading-sm)` if section headers are needed

**Do NOT use felt-context tokens here:** `--color-text-on-felt`, `--color-text-on-felt-dim`, `--color-gold`, `--color-felt` — those are for the felt surface, not a white card surface.

### PlayingCard in cheat-sheet context

`PlayingCard` renders at its natural size (width: 60px via token, aspect-ratio 2/3 → ~90px tall). In the modal `.body` (padding `var(--space-6)` = 24px, `overflow-y: auto`), PlayingCards lay naturally in a `display: flex; gap: var(--space-2)` or `var(--space-3)` row — no scaling transforms needed.

For HandRankings, showing 3 cards per hand (ranks 1–3) fits within the modal's `width: min(560px, 90vw)` minus 48px padding = ~464–468px available, easily fitting 3 cards at 60px + 2×8px gaps = 196px.

Import path from content/cheatsheets/: `../../lib/components/PlayingCard.svelte` and `../../lib/cards` (same depth as content/sections/*Content.svelte → mirrors IntroContent.svelte:2-3). [Source: IntroContent.svelte:2-3]

### Content authoring — voice and correctness

**Warm-coach register (UX-DR16, EXPERIENCE.md §Voice):** encouraging, human, second-person where it applies. No emoji, no hype, no "you're amazing!" The cheat sheets are reference content — clarity over warmth. Plain and direct is right.

**Factual accuracy (load-bearing):**
- Deck: 52 cards = 13 ranks × 4 suits. Ten = `T`. Ace plays high AND low in straights.
- HoldEmRules: 2 hole cards + up to 5 community. Best 5 from 7. Streets in order: pre-flop → flop → turn → river.
- HandRankings: ranked 1 (best) to 10. Royal Flush is A K Q J T same suit. Straight Flush is five consecutive same suit. The order must be exact — this is a reference learners will use mid-assessment.
- Jargon: `required equity = cost / (pot + cost)`. At $50 pot + $10 call: 10/60 ≈ 16.7%. This matches FR-11's pot-odds convention. Do not write `cost / pot`. [Source: epics.md:29 — FR-11 formula]

**The `out` definition matters most** — the hint copy for LO1 says "Any heart completes your flush — count the unseen ones." [Source: EXPERIENCE.md:84]. Jargon's definition of `out` must be consistent with this: an unseen card that completes your draw.

### Architecture compliance

- **Structure:** `content/cheatsheets/` folder + 5 new files (index.ts + 4 .svelte). Matches the architecture tree exactly. [Source: architecture.md:440-444]
- **Naming:** PascalCase Svelte components (`Deck.svelte`, `HoldEmRules.svelte`, `HandRankings.svelte`, `Jargon.svelte`); camelCase registry (`cheatSheetContent`); import paths consistent with `content/sections/index.ts`. [Source: architecture.md:269-283]
- **Content boundary (AR-9):** cheat-sheet copy lives only in `content/cheatsheets/`; no content hardcoded in `CheatSheetModal.svelte` or `App.svelte`. [Source: architecture.md:458-460]
- **No Svelte imports in lib/assessment/** — this story doesn't touch that folder, but note it to prevent accidental drift. [Source: architecture.md:449-453]
- **Styling boundary (AR-2):** every design value from `tokens.css`. The white-surface token set (`--color-sidebar-*`, `--color-card-face`, `--radius-lg`, `--shadow-modal`) is already established and used by `CheatSheetModal.svelte`; the content components use the same family.

### Testing standards

- **No new automated tests** — content components are Svelte components that cannot render in node-env Vitest (AR-1; no jsdom/happy-dom added). [Source: deferred-work.md — node-env constraint]
- **2.7's `cheatsheets.test.ts`** covers the `CheatSheetId` type and fixed array order — still fully applicable and unchanged. The test suite remains 4 files / 72 tests.
- **Verification = `check`/`test`/`build` green + the Task 7 manual visual pass.**

### Previous story intelligence (from 2.7)

- **Placeholder is in `App.svelte:40-48`** — the `<p class="cs-placeholder">` body and the `.cs-placeholder` style (lines 92–97). Both are removed in this story. [Source: App.svelte:40-48, 92-97; deferred-work.md:11]
- **`CheatSheetModal` takes `children: Snippet`** — child content between the tags automatically becomes the `children` snippet in Svelte 5. `<SheetContent />` inside the modal tag becomes the body content. [Source: CheatSheetModal.svelte:4-12]
- **Token for `<code>` inside modal:** `CheatSheetModal.svelte` styles `kbd` using `var(--font-caption)`, `var(--color-sidebar)`, `var(--color-sidebar-border)`, `var(--radius-sm)`. Use the same token family for `code` in content components.
- **`.body` has `overflow-y: auto`** — content longer than the modal height scrolls cleanly. HandRankings is the longest sheet; no pagination needed. [Source: CheatSheetModal.svelte:109-113]
- **`pointer-events: auto` caveat** — already resolved in 2.7 (`.scrim` sets it). No changes needed here. [Source: deferred-work.md:2]
- **Commit cadence:** feat(2.X) per story on `main`. The 2.7 baseline is `2962443`.

### File changes summary

6 files total — 5 new, 1 updated:
- `pokermath/src/content/cheatsheets/index.ts` — **NEW** (registry: Record<CheatSheetId, Component>)
- `pokermath/src/content/cheatsheets/Deck.svelte` — **NEW** (52-card Deck content + PlayingCard)
- `pokermath/src/content/cheatsheets/HoldEmRules.svelte` — **NEW** (Hold 'Em rules content)
- `pokermath/src/content/cheatsheets/HandRankings.svelte` — **NEW** (10 ranked hands + PlayingCard examples for top 3)
- `pokermath/src/content/cheatsheets/Jargon.svelte` — **NEW** (9-term glossary, `<dl>` semantic structure)
- `pokermath/src/App.svelte` — **UPDATE** (import cheatSheetContent; replace placeholder + add `{#key openSheet.id}`; remove `.cs-placeholder` style)

No new directories beyond `content/cheatsheets/`. No new npm dependencies. No structural variance from the architecture tree.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.8] — story statement + ACs (lines 431-449)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-6 on-demand cheat sheets (26), FR-7 card rendering (27), AR-1 locked stack (54), AR-2 token discipline (55), AR-9 content split (62), UX-DR3 sidebar sheets (70), UX-DR14 modal (81), UX-DR16 voice (83), NFR-2 accessibility (38)
- [Source: _bmad-output/planning-artifacts/architecture.md] — `content/cheatsheets/` tree (440-444), content boundary (458-460), naming (269-283), AR-2 enforcement (283), node-env optional component tests (507-509)
- [Source: _bmad-output/implementation-artifacts/2-7-cheat-sheet-panel-modal-mechanism.md] — dev notes (scope, state design, presentational modal, placeholder body, tokens, a11y, patterns from 2.2–2.6)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:11] — cs-placeholder removed in 2.8 (no action before then)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:12] — scroll reset deferred to 2.8 (`{#key openSheet.id}` fix)
- [Source: pokermath/src/App.svelte:40-48,92-97] — current modal block (placeholder) + cs-placeholder style to remove
- [Source: pokermath/src/content/cheatsheets.ts:1-10] — CheatSheetId type + cheatSheets array (metadata source; 2.8 adds content, not metadata)
- [Source: pokermath/src/content/sections/index.ts:1-15] — registry shape to mirror exactly (Component type, import pattern)
- [Source: pokermath/src/screens/InformationalScreen.svelte:10-16] — `content: Content` rename pattern for dynamic component rendering (`<Content />`)
- [Source: pokermath/src/lib/components/CheatSheetModal.svelte:1-130] — shell structure, `.body` padding + overflow, `children` snippet consumption
- [Source: pokermath/src/content/sections/IntroContent.svelte:2-3] — import path pattern for PlayingCard + parseCard from content/sections/
- [Source: pokermath/src/styles/tokens.css] — `--color-sidebar-text`, `--color-sidebar-text-dim`, `--color-sidebar-border`, `--color-card-face`, `--font-body-md`, `--font-caption`, `--font-value`, `--font-heading-sm`, `--space-1` through `--space-8`, `--radius-sm`
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md:84] — LO1 hint references Hand Rankings sheet; Jargon's `out` definition must align
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/mockups/key-screen-cheatsheet-modal.html:105-118] — HandRankings mockup composition reference (ranked table structure)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation proceeded without blockers.

### Completion Notes List

- Created `content/cheatsheets/index.ts` as a full `Record<CheatSheetId, Component>` (not Partial) registry — mirrors `content/sections/index.ts` shape exactly.
- Authored `Deck.svelte`: prose + rank list + 4 PlayingCards (Ah ♥ red, Kd ♦ blue, Qc ♣ green, Js ♠ black) + suit caption + Ace-high/low note. Token-only styles.
- Authored `HoldEmRules.svelte`: deal explanation + `<ol>` of 4 streets + Showdown + Actions. Prose-only (no PlayingCards per AC2 scope). Token-only styles.
- Authored `HandRankings.svelte`: 10 ranked hands as `<ul>` with no list-style. Ranks 1–3 show 3 PlayingCards each (9 total); ranks 4–10 show caption text. Token-only styles with dividers.
- Authored `Jargon.svelte`: 9-term glossary using `<dl>`/`<dt>`/`<dd>` semantic HTML. Dividers between each term-group. Token-only styles.
- Updated `App.svelte`: added `cheatSheetContent` import; replaced placeholder block with `{#key openSheet.id}` + `{@const SheetContent}` + `<SheetContent />`; removed dead `.cs-placeholder` style rule.
- **Verification:** `npm run check` 0/0/0 · `npm run test -- --run` 4 files / 72 tests green · `npm run build` clean · Playwright visual pass: all 4 sheets render real content, PlayingCards correct colors, `<dl>` 1/9/9, scroll reset confirmed (scrollTop 436 → 0 after sheet switch), 0 console errors.
- Resolved deferred-work.md items: #11 (placeholder removed) and #12 (scroll reset via `{#key openSheet.id}`).

### File List

- `pokermath/src/content/cheatsheets/index.ts` — NEW
- `pokermath/src/content/cheatsheets/Deck.svelte` — NEW
- `pokermath/src/content/cheatsheets/HoldEmRules.svelte` — NEW
- `pokermath/src/content/cheatsheets/HandRankings.svelte` — NEW
- `pokermath/src/content/cheatsheets/Jargon.svelte` — NEW
- `pokermath/src/App.svelte` — UPDATED

## Change Log

- 2026-05-30: Story 2.8 created — ready-for-dev
- 2026-05-30: Story 2.8 implemented — 5 new files (content/cheatsheets/ registry + 4 sheet components) + App.svelte updated; deferred-work.md items #11 and #12 resolved; all checks green; status → review
