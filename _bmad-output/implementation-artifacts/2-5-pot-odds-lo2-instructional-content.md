---
baseline_commit: 9b8ae6e
---

# Story 2.5: Pot Odds (LO2) instructional content

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want LO2 to ground pot odds in a real hand,
so that the ratio connects to actual betting.

## Acceptance Criteria

**AC1 — Pot odds concept + in-game contextualization (FR-4)**
**Given** the Pot Odds Section
**When** it renders
**Then** it presents the pot odds concept and at least one in-game contextualization of how the ratio shifts as players bet/call

**AC2 — Warm-coach voice (UX-DR16)**
**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice — second-person, no emoji, no hype

## Tasks / Subtasks

- [x] **Task 1: Author `PotOddsContent.svelte` (AC: #1, #2)**
  - [x] **Read first:** `InformationalScreen.svelte:66-98` — the `.prose :global()` contract covers `p`, `p+p`, `p+.group`, `.group+p`, `strong`, `code.notation`. All spacing rules in place from Story 2.3. If you introduce any new HTML element type (`ol`, `ul`, `li`, `h2`, etc.), add the corresponding `:global()` rule to `InformationalScreen.svelte`'s `.prose` block (just-in-time). Recommend using `<p>` and `<strong>` only.
  - [x] **Also read:** `EquityContent.svelte` — this is the model component to follow exactly. Same script/template structure, same import paths, same idiom.
  - [x] **New file:** `pokermath/src/content/sections/PotOddsContent.svelte` — stateless Svelte component following the exact `EquityContent.svelte`/`IntroContent.svelte` idiom.
  - [x] **Script block:** `<script lang="ts">` with `import CardGroup` from `../../lib/components/CardGroup.svelte` and `import { parseCard }` from `../../lib/cards`. Call `parseCard` **only here** (content boundary, AR-3). Parse cards in script scope; pass `Card[]` arrays to `CardGroup`. Do NOT call `parseCard` in the template or inside a child component.
  - [x] **Card literals (for in-game graphic region):** Reuse the canonical LO1 hand to bridge the sections — hand `Ah Kh`, flop `Qh 8h 7c`. All 5 unique within and across groups (no duplicate key crash risk). Valid canonical notation: `T` = ten (never `10`), lowercase suits.
  - [x] **Prose structure (AC1):** teach pot odds concept and show how the ratio shifts (FR-4):
    1. **Define pot odds.** Pot odds are the price of calling expressed as a ratio — how much is already in the pot versus what you must add.
    2. **In-game example.** Bridge from LO1: you're on the flop with `Ah Kh` and the board is `Qh 8h 7c` (a flush draw). You've established your equity is about 36%. Your opponent now bets $10 into a $40 pot. Render the hand and board `CardGroup` instances here.
    3. **Compute the ratio.** After the bet, there is $50 in the pot when the decision reaches you. Your call is $10. The ratio is $50 to $10 — or **5:1**. Five dollars already in the pot for every one dollar you put in.
    4. **Convert to required equity.** To break even over many identical situations, your equity must at least cover your share of the pot. The formula: **required equity = call ÷ (pot + call)** = $10 ÷ ($50 + $10) = $10 ÷ $60 ≈ **16.7%**. This is the minimum equity your hand needs to make the call profitable.
    5. **How the ratio shifts.** Show that a bigger bet creates worse pot odds: if the opponent had bet $25 into the same $40 pot, the new pot is $65 and your call is $25 — ratio 65:25 ≈ 2.6:1, required equity 25/90 ≈ **27.8%**. The larger the bet relative to the pot, the more equity you need to call.
    6. **Close.** In the assessment you'll compute the ratio and required equity for a specific pot and call amount. Fix the formula now: **call ÷ (pot + call)**.
  - [x] **`CardGroup` labels:** use `"Your hand"` and `"Flop"` (matching LO1 convention — consistent across sections).
  - [x] **Voice (AC2):** warm-coach, second-person, direct. "Your call is $10" not "the call amount is $10." No exclamation marks, no emoji, no hype. Warmth in explanation, not punctuation.
  - [x] **No assessment chrome** — instructional content only. No input fields, no "Assessment" kicker, no Check Answer. Epic 3 adds the assessment panel.
  - [x] **No inline `style=`** — token variables only (`var(--…)`).
  - [x] **Component stays stateless** — no `onMount`, no `$state`, no effects. `InformationalScreen` wraps it in `{#key sectionId}`, so any local state silently resets on section navigation.

- [x] **Task 2: Register `PotOddsContent` in the content registry (AC: #1)**
  - [x] **Update:** `pokermath/src/content/sections/index.ts` — add `import PotOddsContent from './PotOddsContent.svelte'` and add `'pot-odds': PotOddsContent` to the `sectionContent` object.
  - [x] The registry is `Partial<Record<SectionId, Component>>`. `SectionId` includes `'pot-odds'`; the entry type-checks without any changes to `sections.ts`.
  - [x] **No `App.svelte` change needed.** The routing condition was simplified to `sectionContent[active.id]` in Story 2.4. Registration alone is sufficient for the section to render via `InformationalScreen`.

- [x] **Task 3: Verify (AC: #1, #2)**
  - [x] `npm run check` → svelte-check + tsc, **0 errors / 0 warnings**. Confirms `PotOddsContent` type-checks and registry entry is valid.
  - [x] `npm run test -- --run` → existing suite stays green (3 files / 69 tests). **No new automated test mandated** — `PotOddsContent` is presentational Svelte (node-env Vitest cannot render it; a DOM test lib is an AR-1 violation).
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8).
  - [x] **Manual visual pass** (`npm run dev`):
    - **Pot Odds section (sidebar click or Next from Equity):** renders title "Pot Odds" + subtitle "LO2 · price of a call", the full prose (concept, in-game example, ratio computation, required equity formula, how the ratio shifts), and card graphics for hand (`Ah Kh`) and board (`Qh 8h 7c`). Prose capped ~60ch. **No assessment chrome** (no "Assessment" kicker, no input fields, no Check Answer). Back ← and Next → both present. (AC1, AC2)
    - **Formula check:** 5:1 ratio and 16.7% required equity appear in prose; larger-bet comparison (2.6:1 / 27.8%) appears.
    - **Four-color check:** ♥ red, ♦ blue, ♣ green, ♠ black; `T` not `10` on any Ten. Rank/suit legible.
    - **Introduction still works:** renders correctly with its content; navigation to/from Pot Odds intact.
    - **Equity still works:** renders correctly; navigation to/from Pot Odds intact.
    - **Calling fallback:** still renders the temporary title-only fallback (no regression — `CallingContent` doesn't exist yet).
    - **Reload:** returns to Introduction, state cleared; quiet section fade. (FR-3, UX-DR18)
    - **Keyboard:** Tab reaches Pager + sidebar with visible focus ring; full shell operable without mouse. (no regression)
  - [x] Record exact command outputs + visual-pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 2.5 authors the real Pot Odds (LO2) instructional content by creating `PotOddsContent.svelte` and registering it. This is an Epic 2 content story; the assessment panel, input fields (RatioInput, NumericInput), and validation engine belong to Epic 3 (Stories 3.2, 3.7).

**This story DOES:**
- Create `PotOddsContent.svelte` under `src/content/sections/` with LO2 instructional prose, the pot odds formula, and card graphics.
- Add `'pot-odds': PotOddsContent` to `src/content/sections/index.ts`.

**This story does NOT:**
- **Change `sections.ts`** — `kind: 'assessment'` on pot-odds is correct and tested (`sections.test.ts:18`); do not touch. [Source: sections.ts:26-30]
- **Change `App.svelte`** — routing condition already simplified to `sectionContent[active.id]` in Story 2.4. No further App.svelte change is needed for registration to take effect. [Source: 2-4-…md:Task3; App.svelte:16]
- **Build the assessment panel, input fields, or validation engine** → Epic 3.
- **Add `CallingContent`** → Story 2.6.
- **Build or wire the Cheat Sheets** → Stories 2.7–2.8.
- **Add any npm dependency** (AR-1 stack locked).
- **Add a new accent hue or hardcode any hex/size that has a token** (AR-2).

### No App.svelte change required — important difference from Story 2.4

In Story 2.4, `App.svelte` was updated from `active.kind === 'informational' && sectionContent[active.id]` to just `sectionContent[active.id]`. That change is **already in place**. Registration in `index.ts` is all that is needed for the pot-odds section to render via `InformationalScreen`. Do NOT touch `App.svelte`. [Source: App.svelte:16]

### `PotOddsContent.svelte` — content boundary idiom

Follow the exact `EquityContent.svelte` pattern (which itself follows `IntroContent.svelte`):
- `<script lang="ts">` first. Import `CardGroup` and `parseCard`. Parse all card literals in script scope; pass `Card[]` to `CardGroup` — never call `parseCard` in the template or a child component. [Source: AR-3; EquityContent.svelte:1-6]
- Stateless: no `onMount`, no `$state`, no reactive effects. `InformationalScreen` wraps the content in `{#key sectionId}`; any local state silently resets on navigation. [Source: deferred-work.md:9; InformationalScreen.svelte:20-30]
- Prose as semantic HTML: `<p>`, `<strong>`, `<code class="notation">`. No inline `style=`. No hardcoded hex or size that has a token.
- The component lives at `src/content/sections/PotOddsContent.svelte`. Relative import paths are two levels up: `../../lib/components/CardGroup.svelte`, `../../lib/cards`. [Source: EquityContent.svelte:2-3]

### Card graphics for LO2 example

Reuse the canonical LO1 hand to bridge sections (pedagogical continuity — learner already established ~36% equity in LO1, now they'll price the call):

```ts
const hand = [parseCard('Ah'), parseCard('Kh')]
const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
```

Render as two separate `CardGroup` instances — hand labeled `"Your hand"`, board labeled `"Flop"`. All 5 cards are unique across both groups; no duplicate key crash risk. [Source: deferred-work.md:13; CardGroup.svelte:11]

The `parseCard` call is at module-eval time (no error boundary). Keep all literals valid canonical notation. An invalid literal (`10h`, `AH`, `Xz`) throws synchronously at component instantiation, blanking the screen. These five literals are identical to `EquityContent.svelte` and are verified valid. [Source: deferred-work.md:5]

### Pot odds pedagogy — formula and numbers (FR-4, LDR-3)

**The canonical LO2 assessment scenario:** $40 pot + $10 bet → 5:1 ratio, 16.7% required equity.

Teach this in the instructional content so the assessment numbers feel familiar:
- After the $10 bet, pot = $50. Call = $10. Ratio = $50 : $10 = **5:1**.
- Required equity = call / (pot + call) = 10 / (50 + 10) = 10 / 60 ≈ **16.7%**.
- "How the ratio shifts" contrast: $40 pot + $25 bet → new pot = $65, call = $25, ratio ≈ 2.6:1, required equity = 25/90 ≈ 27.8%. Larger bet = worse pot odds = more equity needed.

**Formula to teach:** `required equity = call ÷ (pot + call)` — denominator is the total pot if you call (your share of the prize). This matches the `cost/(pot+cost)` validation formula in the assessment engine (AR-7). [Source: epics.md:FR-11, FR-9; architecture.md:310-313]

**Voice discipline (AC2, UX-DR16):** second-person ("your call", "you need"), warm but direct. No exclamation marks, no emoji. "Fix the formula now" for closing — firm but not harsh.

### Prose typography contract — already complete from Story 2.3

`InformationalScreen.svelte` already has all needed `:global()` rules:
- `p { margin: 0 }` + `p + p { margin-top: var(--space-4) }` — paragraph rhythm
- `p + .group { margin-top: var(--space-4) }` + `.group + p { margin-top: var(--space-4) }` — prose ↔ CardGroup boundaries
- `strong { font-weight: 600; color: var(--color-text-on-felt) }` — emphasis
- `code.notation { font: var(--font-value); color: var(--color-gold) }` — inline card notation

No new `:global()` rules needed if staying within `<p>`, `<strong>`, `<code class="notation">`. If you use `<ol>`, `<ul>`, `<h2>`, etc., you MUST add the corresponding `:global()` rules in `InformationalScreen.svelte`'s `.prose` block (just-in-time). [Source: 2-3-…md:Task1; InformationalScreen.svelte:72-98]

### Previous story intelligence (2.4 + Epic 2)

- **`EquityContent.svelte` is the direct model.** Follow its structure exactly. [Source: EquityContent.svelte:1-48]
- **`IntroContent.svelte` is the original model.** Both are valid references. [Source: IntroContent.svelte:1-48]
- **`App.svelte` routing is already simplified.** `sectionContent[active.id]` was set in Story 2.4; do not re-edit. [Source: App.svelte:16]
- **Prose rhythm is in the archetype.** `InformationalScreen.svelte`'s `.prose :global()` block owns all typography; no per-component styles. [Source: InformationalScreen.svelte:72-98]
- **CardGroup duplicate-key crash.** All five card literals are unique; no crash risk. [Source: deferred-work.md:13; CardGroup.svelte:11]
- **`parseCard` error boundary deferred.** Keep literals valid. [Source: deferred-work.md:5]
- **Token discipline is house style.** Do not hardcode anything that has a token. [Source: 2-1-…md:190-192; 2-2-…md:228]
- **Components are node-untestable.** No render test for `PotOddsContent` — manual visual pass only. Existing 3 test files / 69 tests stay green. [Source: deferred-work.md:54]
- **`{#key sectionId}` re-mount means stateless only.** Any local state in the content component resets on navigation. Stay stateless. [Source: deferred-work.md:9]

### Architecture compliance (guardrails)

- **Structure:** `content/sections/PotOddsContent.svelte` (NEW) + `content/sections/index.ts` (UPDATE). No App.svelte touch. No structural variance from architecture tree. [Source: architecture.md:437-438]
- **Naming:** PascalCase component name `PotOddsContent`. [Source: architecture.md:269-283]
- **Content boundary (AR-9):** authored prose lives only in `content/sections/`; the archetype owns shape only. [Source: AR-9; architecture.md:458-460]
- **Card notation (AR-3):** `T` for ten, lowercase suits, all encode/decode through `parseCard`/`cardToString`. [Source: AR-3; architecture.md:285-290]
- **Styling boundary:** every value from `tokens.css`. No hardcoded hex/size that has a token. [Source: architecture.md:283; tokens.css]
- **State boundary:** `PotOddsContent` is presentational; no store read/write, `appState.svelte.ts` unchanged. [Source: architecture.md:454-457]
- **Assessment formula alignment:** the `call/(pot+call)` formula in prose must match the `cost/(pot+cost)` validation formula in the future assessment engine (AR-7). Same math, same convention — consistent denominator is total pot if you call. [Source: epics.md:FR-11; architecture.md:310-313]

### Testing standards

- **No new automated test mandated.** `PotOddsContent` is presentational Svelte (node-env Vitest cannot render it; adding a DOM test lib violates AR-1). [Source: deferred-work.md:54]
- **Verification = `check`/`test`/`build` green + the Task-3 visual walkthrough.** [Source: 2-4-…md:Task4]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `9b8ae6e` (`feat(2.4)` — Equity content complete). 2.5 is purely content-authoring — lower risk than 2.4's `App.svelte` routing change (no App.svelte touch this time). The no-regression visual pass (intro, equity, calling fallback) still matters. `_bmad*/` and `docs/` stay untouched.

### Project Structure Notes

Two files touched; one existing, one new:
- `pokermath/src/content/sections/PotOddsContent.svelte` — **NEW** (per architecture.md:438)
- `pokermath/src/content/sections/index.ts` — **UPDATE** (add pot-odds registry entry)

No App.svelte change. No new directories, no new dependencies, no structural variance.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.5] — story statement + ACs (lines 371-385)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-4 per-Section instructional content (line 24), AR-3 canonical notation (56), AR-9 content split (62), AR-7 data contracts (60), UX-DR4 Informational archetype (71), UX-DR16 warm-coach voice (83), FR-9 LO2 canonical scenario (29), FR-11 validation formula (31)
- [Source: _bmad-output/planning-artifacts/architecture.md] — `PotOddsContent.svelte # pot odds + in-game contextualization (FR-4)` (438), content/screen boundary (458-460), canonical card notation single-decode (285-290), token discipline (283), naming (269-283), data contracts / formula (310-313)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — LO2 in UJ-1: Sam advances entering 5:1 ratio and ≈17% (131), warm-coach voice (42-52), pot odds formula (86-88)
- [Source: pokermath/src/App.svelte:16] — routing condition already `sectionContent[active.id]` from 2.4; do NOT change
- [Source: pokermath/src/content/sections/index.ts] — registry to update (add pot-odds entry)
- [Source: pokermath/src/content/sections.ts:26-30] — pot-odds kind:'assessment'; DO NOT CHANGE
- [Source: pokermath/src/screens/InformationalScreen.svelte:72-98] — `.prose :global()` contract complete from 2.3
- [Source: pokermath/src/content/sections/EquityContent.svelte] — model for component idiom (direct predecessor, lines 1-48)
- [Source: pokermath/src/content/sections/IntroContent.svelte] — original model for component idiom (lines 1-48)
- [Source: pokermath/src/lib/components/CardGroup.svelte:5,11] — label + cards props, keyed on cardToString
- [Source: pokermath/src/styles/tokens.css] — `--space-4` (line 53), `--font-value` (34), `--color-gold` (13), `--color-text-on-felt` (6), suit tokens (22-25)
- [Source: _bmad-output/implementation-artifacts/2-4-equity-lo1-instructional-content.md] — predecessor: App.svelte routing fixed (Task3), EquityContent idiom, same 5 card literals used and verified valid
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — `parseCard` module-eval error boundary (line 5), CardGroup dup-key (13), `{#key}` content re-mount (9), node-env / no component-test-lib (54)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean implementation, no debug iterations required.

### Completion Notes List

- ✅ Task 1: `PotOddsContent.svelte` created at `pokermath/src/content/sections/PotOddsContent.svelte`. Stateless, follows exact `EquityContent.svelte` idiom: `<script lang="ts">` first, `parseCard` in module scope only, no `onMount`/`$state`/effects. Uses `<p>` and `<strong>` only — no new `:global()` rules needed. All 5 card literals identical to LO1 (verified valid). Warm-coach second-person voice throughout.
- ✅ Task 2: `pokermath/src/content/sections/index.ts` updated — `PotOddsContent` imported and registered under `'pot-odds'`. No App.svelte touch; no sections.ts touch.
- ✅ Task 3 — `npm run check`: 98 files, **0 errors / 0 warnings**. `npm run test -- --run`: **3 files / 69 tests passed**. `npm run build`: success, `dist/` emitted (49.36 kB JS / 7.12 kB CSS).
- ✅ Visual pass (Playwright headless, port 5176): Pot Odds section renders title + subtitle, full prose with 5:1, 16.7%, 2.6:1, 27.8% confirmed in DOM; two CardGroups (Your hand: Ah Kh / Flop: Qh 8h 7c); zero assessment chrome; Back button present. Equity, Introduction, Calling fallback all regression-free. Reload → Introduction. Tab focus operable.

### File List

- `pokermath/src/content/sections/PotOddsContent.svelte` (NEW)
- `pokermath/src/content/sections/index.ts` (MODIFIED)

## Change Log

- 2026-05-30: Story 2.5 created — ready for dev
- 2026-05-30: Implementation complete — `PotOddsContent.svelte` created, registered in `index.ts`; all checks green; marked review
