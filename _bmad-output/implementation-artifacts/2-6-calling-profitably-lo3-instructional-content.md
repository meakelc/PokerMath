---
baseline_commit: 31b0b42
---

# Story 2.6: Calling Profitably (LO3) instructional content

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want LO3 to build calling intuition before the formula,
so that the stacking method feels motivated.

## Acceptance Criteria

**AC1 — Law-of-large-numbers framing + toy-game example (FR-4, LDR-3)**
**Given** the Calling Profitably Section
**When** it renders
**Then** it presents a law-of-large-numbers framing with at least one toy-game example before the formula application

**AC2 — Stacking method (FR-4)**
**Given** the content
**When** it teaches the method
**Then** it explains stacking equity against the required-equity threshold derived from pot odds

**AC3 — Warm-coach voice (UX-DR16)**
**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice — second-person, no emoji, no hype

## Tasks / Subtasks

- [x] **Task 1: Author `CallingContent.svelte` (AC: #1, #2, #3)**
  - [x] **Read first:** `InformationalScreen.svelte:72-98` — the `.prose :global()` contract covers `p`, `p+p`, `p+.group`, `.group+p`, `strong`, `code.notation`. All spacing rules in place from Story 2.3. If you introduce any new HTML element type (`ol`, `ul`, `li`, `h2`, etc.), add the corresponding `:global()` rule to `InformationalScreen.svelte`'s `.prose` block (just-in-time). Recommend using `<p>` and `<strong>` only.
  - [x] **Also read:** `PotOddsContent.svelte` — this is the direct model to follow exactly. Same script/template structure, same import paths, same idiom. `EquityContent.svelte` is the prior model and also valid.
  - [x] **New file:** `pokermath/src/content/sections/CallingContent.svelte` — stateless Svelte component following the exact `PotOddsContent.svelte` idiom.
  - [x] **Script block:** `<script lang="ts">` with `import CardGroup from '../../lib/components/CardGroup.svelte'` and `import { parseCard } from '../../lib/cards'`. Call `parseCard` **only here** (content boundary, AR-3). Parse cards in script scope; pass `Card[]` arrays to `CardGroup`. Do NOT call `parseCard` in the template or inside a child component.
  - [x] **Card literals (for in-game worked example):** Reuse the canonical hand — `hand = [parseCard('Ah'), parseCard('Kh')]`, `board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]`. All 5 unique within and across groups (no duplicate key crash risk). These five literals are identical to `EquityContent.svelte` and `PotOddsContent.svelte` — verified valid across two prior stories. Valid canonical notation: `T` = ten (never `10`), lowercase suits.
  - [x] **Prose structure (AC1, AC2) — ordered strictly LLN first, formula last (LDR-3):**
    1. **Law of large numbers framing.** Each poker decision is one of many identical situations you will face over a lifetime of play. The question is never "did I win this hand?" but "was the call correct given the information available?" A good call loses sometimes. That is not a reason to fold.
    2. **Toy-game example.** Imagine a friend offers you this game: flip a fair coin. Heads, you collect $5. Tails, you pay $1. You will lose roughly half the flips — but over 100 plays you collect $250 and pay out $50, a profit of $200. You should take every single flip without hesitation. The math decides, not any individual outcome.
    3. **Bridge to poker calling.** Calling a bet works the same way. If your equity in the hand exceeds the required equity threshold set by the pot odds, the call is profitable over many repetitions — even when this particular hand does not come through.
    4. **The two-step method.** Step one: compute your equity (the Rule of 2-and-4 from LO1 gives you a fast estimate). Step two: compute the required equity from the pot odds formula — **call ÷ (pot + call)** — the same formula you applied in LO2. If your equity exceeds the required equity, calling is the correct, profitable play. If it falls short, folding is correct.
    5. **Worked example — stacking the two numbers.** Return to `Ah Kh` on the `Qh 8h 7c` flop — the 9-out flush draw you have now seen in both LO1 and LO2. Show card graphics here. Step one: equity ≈ 9 × 4 = **36%** (two streets remaining). Step two: opponent bets $10 into a $40 pot — required equity = $10 ÷ ($50 + $10) = $10 ÷ $60 ≈ **16.7%**. Stack them side by side: 36% against 16.7%. Your equity clears the threshold by a wide margin. The call is correct.
    6. **Close.** In the assessment you will be given a hand, a board, a pot, and a bet. Compute both values yourself, then commit to a decision. The method is always the same: equity versus threshold.
  - [x] **`CardGroup` labels:** use `"Your hand"` and `"Flop"` (matching the convention established in LO1 and LO2).
  - [x] **Voice (AC3):** warm-coach, second-person, direct. "Your equity" not "the equity." No exclamation marks, no emoji, no hype. Warmth in the explanation, not in punctuation.
  - [x] **No assessment chrome** — instructional content only. No input fields, no "Assessment" kicker, no Check Answer button, no Call/Fold toggle. Epic 3 (Story 3.8) adds the assessment panel.
  - [x] **No inline `style=`** — token variables only (`var(--…)`).
  - [x] **Component stays stateless** — no `onMount`, no `$state`, no effects. `InformationalScreen` wraps it in `{#key sectionId}`, so any local state silently resets on section navigation.

- [x] **Task 2: Register `CallingContent` in the content registry (AC: #1, #2)**
  - [x] **Update:** `pokermath/src/content/sections/index.ts` — add `import CallingContent from './CallingContent.svelte'` and add `'calling': CallingContent` to the `sectionContent` object.
  - [x] The registry is `Partial<Record<SectionId, Component>>`. `SectionId` includes `'calling'` (sections.ts:33); the entry type-checks without any changes to `sections.ts`.
  - [x] **No `App.svelte` change needed.** The routing condition at `App.svelte:16` is already `sectionContent[active.id]` (simplified in Story 2.4). Registration alone is sufficient for the calling section to render via `InformationalScreen` instead of the temporary title-only fallback.

- [x] **Task 3: Verify (AC: #1, #2, #3)**
  - [x] `npm run check` → svelte-check + tsc, **0 errors / 0 warnings**. Confirms `CallingContent` type-checks and registry entry is valid.
  - [x] `npm run test -- --run` → existing suite stays green (**3 files / 69 tests**). **No new automated test mandated** — `CallingContent` is presentational Svelte (node-env Vitest cannot render it; a DOM test lib violates AR-1).
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8).
  - [x] **Manual visual pass** (`npm run dev`):
    - **Calling Profitably section (sidebar click or Next from Pot Odds):** renders title "Calling Profitably" + subtitle "LO3 · is the call +EV?", full prose (LLN framing → toy-game example → bridge → two-step method → worked example with 36% and 16.7% → close), and two `CardGroup` instances (hand: `Ah Kh`, board: `Qh 8h 7c`). Prose capped ~60ch. **No assessment chrome** (no "Assessment" kicker, no input fields, no Check Answer, no Call/Fold toggle). Back ← present; Next absent or disabled (Calling Profitably is the last section — FR-1, UX-DR15). (AC1, AC2, AC3)
    - **Key content check:** toy-game example appears before the method; 36% equity and 16.7% required equity appear in worked example; "equity versus threshold" framing in close.
    - **Four-color check:** ♥ red, ♦ blue, ♣ green, ♠ black; `T` not `10` on any Ten. Rank/suit legible.
    - **Introduction still works:** renders correctly; navigation intact. (no regression)
    - **Equity still works:** renders correctly; navigation intact. (no regression)
    - **Pot Odds still works:** renders correctly; navigation intact. (no regression)
    - **Temporary fallback gone:** Calling Profitably now shows full prose content, not the title-only fallback from Story 2.5.
    - **Reload:** returns to Introduction, state cleared; quiet section fade. (FR-3, UX-DR18)
    - **Keyboard:** Tab reaches Pager + sidebar with visible focus ring; full shell operable without mouse. (no regression)
  - [x] Record exact command outputs + visual-pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 2.6 authors the real Calling Profitably (LO3) instructional content by creating `CallingContent.svelte` and registering it. This is an Epic 2 content story; the Call/Fold toggle, input fields (NumericInput, RatioInput), and validation engine belong to Epic 3 (Stories 3.1–3.2, 3.8).

**This story DOES:**
- Create `CallingContent.svelte` under `src/content/sections/` with LO3 instructional prose — LLN framing, toy-game example, two-step stacking method, and worked example with card graphics.
- Add `'calling': CallingContent` to `src/content/sections/index.ts`.

**This story does NOT:**
- **Change `sections.ts`** — `kind: 'assessment'` on calling is already correct and tested (`sections.test.ts:17-21`); do not touch. [Source: sections.ts:33-36]
- **Change `App.svelte`** — routing condition already `sectionContent[active.id]` (App.svelte:16); no change needed. [Source: App.svelte:16]
- **Build the assessment panel, Call/Fold toggle, input fields, or validation engine** → Epic 3 (Stories 3.1, 3.2, 3.8).
- **Add cheat-sheet content** → Stories 2.7–2.8.
- **Add any npm dependency** (AR-1 stack locked).
- **Add a new accent hue or hardcode any hex/size that has a token** (AR-2).

### No App.svelte change required

`App.svelte:16` already reads `sectionContent[active.id]`. When `CallingContent` is registered in `index.ts`, the calling section will render via `InformationalScreen` instead of the `{:else}` fallback block (App.svelte:23-33). Do NOT touch `App.svelte`. [Source: App.svelte:16-33; 2-5-…md:Dev Notes §"No App.svelte change required"]

### `CallingContent.svelte` — content boundary idiom

Follow the exact `PotOddsContent.svelte` pattern:
- `<script lang="ts">` first. Import `CardGroup` and `parseCard`. Parse all card literals in script scope; pass `Card[]` to `CardGroup` — never call `parseCard` in the template or a child component. [Source: AR-3; PotOddsContent.svelte:1-6]
- Stateless: no `onMount`, no `$state`, no reactive effects. `InformationalScreen` wraps the content in `{#key sectionId}`; any local state silently resets on navigation. [Source: deferred-work.md:9; InformationalScreen.svelte:20-30]
- Prose as semantic HTML: `<p>`, `<strong>`, `<code class="notation">`. No inline `style=`. No hardcoded hex or size that has a token.
- The component lives at `src/content/sections/CallingContent.svelte`. Relative import paths are two levels up: `../../lib/components/CardGroup.svelte`, `../../lib/cards`. [Source: PotOddsContent.svelte:2-3]

### Card graphics for the LO3 worked example

```ts
const hand = [parseCard('Ah'), parseCard('Kh')]
const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
```

Render as two separate `CardGroup` instances — hand labeled `"Your hand"`, board labeled `"Flop"`. All 5 cards are unique across both groups; no duplicate key crash risk. [Source: deferred-work.md:13; CardGroup.svelte:11]

The `parseCard` call is at module-eval time (no error boundary). Keep all literals valid canonical notation. These five literals are identical to `EquityContent.svelte` and `PotOddsContent.svelte` — verified valid across two prior stories. An invalid literal (e.g., `10h`, `AH`, `Xz`) throws synchronously at component instantiation and blanks the screen. [Source: deferred-work.md:5]

### LO3 pedagogy — LLN framing and stacking method (FR-4, LDR-3)

**LDR-3 is a hard constraint:** profitable-calling intuition (law of large numbers, toy games) MUST precede the stacking formula application. The required prose order is:
1. LLN framing → 2. Toy game → 3. Bridge to poker → 4. The two-step method → 5. Worked example → 6. Close.

Do NOT flip the order (formula first, intuition second). That violates LDR-3.

**Toy-game example:** Use a repeated coin-flip game with asymmetric payoffs to demonstrate EV without poker jargon. Suggested scenario: pay $1 per flip, collect $5 on heads (fair coin). Over 100 flips: collect $250, pay $50 → $200 profit despite losing half the flips. The key insight: "the math decides, not any individual outcome."

**The two-step method:**
- Step 1: equity via Rule of 2-and-4 (LO1) — familiar to the learner
- Step 2: required equity via `call ÷ (pot + call)` (LO2) — familiar to the learner
- If equity > required equity → calling is the +EV play
- If equity < required equity → folding is correct
- "Expected value" / "+EV" terminology is acceptable here; define it implicitly as "profitable over time"

**Worked example numbers (must match the LO3 canonical scenario exactly):**
- Hand: `Ah Kh`, Flop: `Qh 8h 7c`, 9-out flush draw
- Equity: 9 × 4 = **36%** (two streets remaining) — identical to LO1 derivation
- Scenario: opponent bets $10 into $40 pot; required equity = $10 ÷ ($50 + $10) = $10 ÷ $60 ≈ **16.7%** — identical to LO2 canonical scenario
- Result: 36% > 16.7% → **Call** — matches FR-10 canonical outcome and Story 3.8 validation target

By reusing LO1 and LO2's canonical numbers, the worked example serves double duty: it teaches the stacking method AND acts as recognition priming for the LO3 assessment.

**Close paragraph:** prime the learner for the assessment without describing UI chrome. "Hand, board, pot, bet — compute both values, then decide." Brief; no description of input fields, buttons, or toggle.

### Prose typography contract — already complete from Story 2.3

`InformationalScreen.svelte:72-98` already has all needed `:global()` rules for `<p>`, `<strong>`, `<code class="notation">`, and `.group` spacing. No new `:global()` rules needed if staying within `<p>` and `<strong>`. If you use `<ol>`, `<ul>`, `<h2>`, etc., you MUST add corresponding `:global()` rules in `InformationalScreen.svelte`'s `.prose` block (just-in-time). [Source: InformationalScreen.svelte:72-98; 2-3-…md:Task1]

### Previous story intelligence (2.5 + Epic 2)

- **`PotOddsContent.svelte` is the direct model.** Follow its structure exactly. [Source: PotOddsContent.svelte:1-53]
- **`EquityContent.svelte` is the prior model.** Also valid reference. [Source: EquityContent.svelte:1-48]
- **`App.svelte` routing is already simplified.** `sectionContent[active.id]` at App.svelte:16; do not re-edit. [Source: App.svelte:16]
- **Prose rhythm is in the archetype.** `InformationalScreen.svelte`'s `.prose :global()` block owns all typography; no per-component styles. [Source: InformationalScreen.svelte:72-98]
- **CardGroup duplicate-key crash.** All five card literals are unique; no crash risk. [Source: deferred-work.md:13; CardGroup.svelte:11]
- **`parseCard` error boundary deferred.** Keep literals valid. [Source: deferred-work.md:5]
- **Token discipline is house style.** Do not hardcode anything that has a token. [Source: architecture.md:283]
- **Components are node-untestable.** No render test for `CallingContent` — manual visual pass only. Existing **3 files / 69 tests** stay green. [Source: deferred-work.md:54; 2-5-…md:Completion Notes]
- **`{#key sectionId}` re-mount means stateless only.** Stay stateless. [Source: deferred-work.md:9]
- **Calling Profitably is the LAST section.** Pager's Next button will be absent or disabled — already implemented in `Pager.svelte` from Story 1.5, no change needed; just verify during manual pass. [Source: FR-1; UX-DR15; Pager.svelte]
- **Temporary fallback eliminated.** Once `CallingContent` is registered, `App.svelte:23-33` (the `{:else}` title-only fallback) will no longer render for this section. Story 2.5 completion notes confirmed the fallback was still showing; this story removes it. [Source: 2-5-…md:Completion Notes — "Calling fallback: still renders the temporary title-only fallback"]

### Architecture compliance (guardrails)

- **Structure:** `content/sections/CallingContent.svelte` (NEW) + `content/sections/index.ts` (UPDATE). No App.svelte touch. No structural variance from architecture tree. [Source: architecture.md:439]
- **Naming:** PascalCase component name `CallingContent`. [Source: architecture.md:269-283]
- **Content boundary (AR-9):** authored prose lives only in `content/sections/`; the archetype owns shape only. [Source: AR-9; architecture.md:458-460]
- **Card notation (AR-3):** `T` for ten, lowercase suits, all encode/decode through `parseCard`/`cardToString`. [Source: AR-3; architecture.md:285-290]
- **Styling boundary:** every value from `tokens.css`. No hardcoded hex/size that has a token. [Source: architecture.md:283]
- **State boundary:** `CallingContent` is presentational; no store read/write, `appState.svelte.ts` unchanged. [Source: architecture.md:454-457]
- **Assessment formula alignment:** equity (Rule of 2-and-4) and required equity (`call ÷ (pot + call)`) in prose must match the validation formulas in Epic 3 (AR-4, AR-7). [Source: architecture.md:310-313]

### Testing standards

- **No new automated test mandated.** `CallingContent` is presentational Svelte (node-env Vitest cannot render it; adding a DOM test lib violates AR-1). [Source: deferred-work.md:54]
- **Verification = `check`/`test`/`build` green + the Task-3 visual walkthrough.** [Source: 2-5-…md:Task3]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `31b0b42` (`feat(2.5)` — Pot Odds content complete). 2.6 is purely content-authoring — same risk profile as 2.5 (no App.svelte touch). The no-regression visual pass (intro, equity, pot-odds) matters. Completing `CallingContent` eliminates the temporary title-only fallback that was present at end of 2.5.

### Project Structure Notes

Two files touched; one existing, one new:
- `pokermath/src/content/sections/CallingContent.svelte` — **NEW** (per architecture.md:439)
- `pokermath/src/content/sections/index.ts` — **UPDATE** (add `'calling': CallingContent` entry)

No App.svelte change. No new directories, no new dependencies, no structural variance.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.6] — story statement + ACs (lines 387-405)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-4 per-Section content (24), LDR-3 concept-before-shorthand (46), AR-3 canonical notation (56), AR-9 content split (62), AR-7 data contracts (60), UX-DR4 Informational archetype (71), UX-DR16 warm-coach voice (83), FR-10 LO3 canonical scenario (30), FR-1 no Next past LO3 (22), UX-DR15 Pager (82)
- [Source: _bmad-output/planning-artifacts/architecture.md] — `CallingContent.svelte # LLN/toy games → stacking method (FR-4, LDR-3)` (line 439), content/screen boundary (458-460), canonical card notation (285-290), token discipline (283), naming (269-283), assessment formula convention (310-313)
- [Source: pokermath/src/App.svelte:16] — routing condition already `sectionContent[active.id]`; do NOT change
- [Source: pokermath/src/App.svelte:23-33] — `{:else}` fallback block (title-only) currently rendering for calling section; registration in index.ts eliminates it
- [Source: pokermath/src/content/sections/index.ts] — registry to update (add calling entry)
- [Source: pokermath/src/content/sections.ts:33-36] — calling `kind:'assessment'`, `id:'calling'`; DO NOT CHANGE
- [Source: pokermath/src/content/sections.test.ts:17-21] — three LO sections are 'assessment'; test must stay green unchanged
- [Source: pokermath/src/screens/InformationalScreen.svelte:72-98] — `.prose :global()` contract complete from 2.3
- [Source: pokermath/src/content/sections/PotOddsContent.svelte:1-53] — direct model for component idiom
- [Source: pokermath/src/content/sections/EquityContent.svelte:1-48] — prior model for component idiom
- [Source: pokermath/src/lib/components/CardGroup.svelte:5,11] — label + cards props, keyed on cardToString
- [Source: pokermath/src/styles/tokens.css] — `--space-4`, `--font-value`, `--color-gold`, `--color-text-on-felt`, suit tokens
- [Source: _bmad-output/implementation-artifacts/2-5-pot-odds-lo2-instructional-content.md] — predecessor: PotOddsContent idiom, same 5 card literals verified valid, App.svelte NOT changed, 3 files / 69 tests baseline, Completion Notes confirming calling fallback still showing
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — `parseCard` module-eval error boundary (line 5), CardGroup dup-key (13), `{#key}` re-mount (9), node-env / no component-test-lib (54)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No blockers encountered. Clean implementation — direct follow of PotOddsContent.svelte idiom.

### Completion Notes List

- Created `CallingContent.svelte` following exact `PotOddsContent.svelte` pattern: `<script lang="ts">`, `parseCard` called in script scope only, stateless, `<p>` + `<strong>` only (no new `:global()` rules needed).
- Prose order strictly LDR-3 compliant: LLN framing → coin-flip toy game → bridge → two-step method → worked example → close.
- Canonical card literals `Ah Kh` / `Qh 8h 7c` identical to LO1 and LO2 — verified valid. No duplicate key risk.
- Registered `'calling': CallingContent` in `index.ts`. No `App.svelte` touch required.
- `npm run check` → 0 errors / 0 warnings
- `npm run test -- --run` → 3 files / 69 tests passed (zero regressions)
- `npm run build` → succeeded, dist/ emitted (51.72 kB JS / 7.12 kB CSS)
- Manual visual pass (Playwright headless): all checks PASS — title/subtitle correct, prose in correct order, 36% and 16.7% visible, two CardGroup instances (YOUR HAND / FLOP), four-color rendering correct (♥ red, ♣ green), T notation only, no assessment chrome, Back ← present, Next absent (last section), all three regression sections intact, reload → Introduction.
- Temporary title-only fallback from Story 2.5 eliminated: `CallingContent` now renders via `InformationalScreen`.

### File List

- `pokermath/src/content/sections/CallingContent.svelte` — NEW
- `pokermath/src/content/sections/index.ts` — UPDATED (added CallingContent import + `'calling': CallingContent` entry)
- `_bmad-output/implementation-artifacts/2-6-calling-profitably-lo3-instructional-content.md` — story file updated
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status updated

### Change Log

- 2026-05-30: Story 2.6 implemented — `CallingContent.svelte` authored and registered. LO3 instructional content (LLN/toy-game → stacking method → worked example 36% vs 16.7%) complete.
