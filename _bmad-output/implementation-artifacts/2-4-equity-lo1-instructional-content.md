---
baseline_commit: 54bf5d3
---

# Story 2.4: Equity (LO1) instructional content

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want LO1 to derive equity before giving me the shorthand,
so that I understand the Rule of 2-and-4 rather than memorizing it.

## Acceptance Criteria

**AC1 — Derivation before shorthand (FR-4, LDR-3)**
**Given** the Equity Section
**When** it renders
**Then** it presents the addition-law equity derivation before introducing the Rule of 2-and-4 as its approximation

**AC2 — ×2/×4 framing + card graphics (FR-4)**
**Given** the content
**When** it explains the rule
**Then** it frames ×2 (one street) / ×4 (two streets) and uses card graphics for any example hands/boards

**AC3 — Warm-coach voice (UX-DR16)**
**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice — second-person, no emoji, no hype

## Tasks / Subtasks

- [x] **Task 1: Author `EquityContent.svelte` (AC: #1, #2, #3)**
  - [x] **Read first:** `InformationalScreen.svelte:66-98` — the `.prose :global()` contract already covers `p`, `p+p`, `p+.group`, `.group+p`, `strong`, `code.notation`. All needed spacing rules are in place from Story 2.3. **If you introduce any new HTML element type** (`ol`, `ul`, `li`, `h2`, etc.), add the corresponding `:global()` rule to `InformationalScreen.svelte`'s `.prose` block (just-in-time). Recommend using `<p>` and `<strong>` only to avoid this.
  - [x] **New file:** `pokermath/src/content/sections/EquityContent.svelte` — author as a stateless Svelte component following the exact `IntroContent.svelte` idiom.
  - [x] **Script block:** `<script lang="ts">` with `import CardGroup` from `../../lib/components/CardGroup.svelte` and `import { parseCard }` from `../../lib/cards`. Call `parseCard` **only here** (content boundary, AR-3 single-decode rule). Parse the hand and board cards in the script, pass `Card[]` arrays down to `CardGroup`. Do NOT call `parseCard` inside the template or inside a sub-component.
  - [x] **Card literals — must be valid canonical notation:** use `Ah`, `Kh` for the hand; `Qh`, `8h`, `7c` for the board. All unique within each group. `T` = ten (never `10`); lowercase suits; no duplicates within a single `CardGroup`.
  - [x] **Prose structure (AC1):** teach equity THEN the rule — derivation first, shorthand second (LDR-3):
    1. Open: what equity means (your probability of winning).
    2. Introduce the concept of outs — cards that complete your draw — and show the example hand + board as `CardGroup` elements.
    3. Derivation paragraph: with 47 unseen cards and 9 heart outs, each unseen card has roughly a 9/47 chance of being an out. Two streets give two chances; combined probability ≈ 35%.
    4. Rule of 2-and-4 paragraph: ×4 for two streets remaining, ×2 for one. 9 × 4 = 36% — close to the exact figure.
    5. Closing anchor: nail down the ×2/×4 split before the learner moves to the assessment.
  - [x] **`CardGroup` labels:** use descriptive strings (e.g., `"Your hand"`, `"Flop"`). Keep labels to 2–4 words; they render as the group's accessible name.
  - [x] **Voice (AC3):** warm-coach, second-person, direct. "You have a flush draw" not "The learner has a flush draw." No exclamation marks, no emoji, no hype words. Warmth in the explanation, not in punctuation.
  - [x] **No assessment chrome, no assessment prompt, no input fields** — this is instruction only; Epic 3 adds the assessment panel.
  - [x] **No inline `style=`** — token variables only (`var(--…)`).
  - [x] **Component stays stateless** — no `onMount`, no `$state`, no effects. `InformationalScreen` wraps it in `{#key sectionId}`, so any local state would silently reset on section navigation. Stay stateless.

- [x] **Task 2: Register `EquityContent` in the content registry (AC: #1)**
  - [x] **Update:** `pokermath/src/content/sections/index.ts` — add `import EquityContent from './EquityContent.svelte'` and add `equity: EquityContent` to `sectionContent`.
  - [x] The registry is `Partial<Record<SectionId, Component>>`. `SectionId` includes `'equity'`; the entry will type-check without any changes to `sections.ts`.

- [x] **Task 3: Update `App.svelte` routing condition so equity section renders via `InformationalScreen` (AC: #1)**
  - [x] **The problem:** `App.svelte:16` currently guards `InformationalScreen` with `active.kind === 'informational' && sectionContent[active.id]`. The equity section has `kind: 'assessment'` (correct — test at `sections.test.ts:17-20` asserts this; do NOT change `sections.ts`). Without removing the `kind === 'informational'` check, `InformationalScreen` will never render for equity even after registration.
  - [x] **Change:** simplify the condition to `sectionContent[active.id]` — drop the `kind` check entirely for now. `InformationalScreen` renders for any section whose content component is registered; the `{:else}` fallback handles sections with no content yet (pot-odds, calling). Epic 3 will re-introduce a kind-based split when `AssessmentScreen` is wired.
  - [x] **Update the `{:else}` comment** to reflect the new semantics: sections that have no content registered yet use the temporary fallback until Epic 3.
  - [x] **Do NOT change** `sections.ts` kinds, `sections.test.ts`, or `appState.svelte.ts`.

- [x] **Task 4: Verify (AC: #1, #2, #3)**
  - [x] `npm run check` → svelte-check + tsc, **0 errors / 0 warnings**. Confirms `EquityContent` type-checks and the registry entry is valid.
  - [x] `npm run test -- --run` → existing suite stays green (3 files / 69 tests). **No new automated test is mandated** — `EquityContent` is presentational Svelte (node-env Vitest cannot render it; a DOM test lib is an AR-1 violation).
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8).
  - [x] **Manual visual pass** (`npm run dev`):
    - **Equity section (sidebar click or Next from Intro):** renders title "Equity & the Rule of 2-and-4" + subtitle "LO1 · estimate your equity", the full derivation prose, card graphics for hand (`Ah Kh`) and board (`Qh 8h 7c`), and the Rule of 2-and-4 explanation with ×4/×2 framing. Prose capped ~60ch. **No assessment chrome** (no "Assessment" kicker, no input fields, no Check Answer). Back ← and Next → both present. (AC1, AC2, AC3)
    - **Four-color check:** ♥ red, ♦ blue, ♣ green, ♠ black; `T` not `10` on any Ten. Rank/suit legible.
    - **Introduction still works:** Intro renders correctly; navigation to/from Equity intact.
    - **Pot Odds + Calling fallback:** both still render the temporary title-only fallback (no regression — their content components don't exist yet).
    - **Reload:** returns to Introduction, state cleared; quiet section fade. (FR-3, UX-DR18)
    - **Keyboard:** Tab reaches Pager + sidebar with visible focus ring; full shell operable without mouse. (no regression)
  - [x] Record exact command outputs + the visual-pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 2.4 authors the **real Equity (LO1) instructional content** — addition-law derivation + Rule of 2-and-4 — by creating `EquityContent.svelte` and registering it. It also makes the **minimum change to `App.svelte`** so the equity section renders via `InformationalScreen` (dropping the `kind === 'informational'` guard that otherwise blocks it). This is an Epic 2 content story; the assessment panel, inputs, and validation engine all belong to Epic 3.

**This story DOES:**
- Create `EquityContent.svelte` under `src/content/sections/` with the real LO1 instructional prose and card graphics.
- Add `equity: EquityContent` to `src/content/sections/index.ts`.
- Update `App.svelte`'s routing condition (`if sectionContent[active.id]`) so any section with registered content uses `InformationalScreen`.

**This story does NOT:**
- **Change `sections.ts`** — `kind: 'assessment'` on equity/pot-odds/calling is correct and tested; do not touch. [Source: sections.test.ts:17-20]
- **Build the assessment panel, input fields, or validation engine** → Epic 3.
- **Add `PotOddsContent` or `CallingContent`** → Stories 2.5–2.6.
- **Build or wire the Cheat Sheets** → Stories 2.7–2.8.
- **Add any npm dependency** (AR-1 stack locked).
- **Add a new accent hue or hardcode any hex/size that has a token** (AR-2).

### Critical: `App.svelte` condition change

`App.svelte:16` currently reads:
```svelte
{#if active.kind === 'informational' && sectionContent[active.id]}
```
This must change to:
```svelte
{#if sectionContent[active.id]}
```
Without this change, `EquityContent` will be in the registry but the equity section will still render the fallback title-only block — the registration alone is not enough.

The `{:else}` comment block should be updated to:
```
<!-- TEMPORARY: Sections with no content component registered yet.
     Epic 3 replaces this with AssessmentScreen for assessment-kind sections. -->
```

The `kind` check is NOT used in automated tests for `App.svelte`; the `sections.test.ts` tests only cover `sections.ts` data values. This change will not break any test.

**Why not just change `sections.ts` kind to `'informational'`?** The `sections.test.ts` suite asserts `kind === 'assessment'` for equity/pot-odds/calling (`sections.test.ts:17-20`). Changing kinds would break 3 tests, violate the architecture contract, and need reverting in Epic 3. The `App.svelte` route change is the correct minimal intervention.

### `EquityContent.svelte` — content boundary idiom

Follow the exact `IntroContent.svelte` pattern established in Story 2.3:
- `<script lang="ts">` first. Import `CardGroup` and `parseCard`. Parse all card literals in script scope; pass `Card[]` to `CardGroup` — never call `parseCard` in the template or in a child component. [Source: AR-3; IntroContent.svelte:1-6]
- Stateless: no `onMount`, no `$state`, no reactive effects. `InformationalScreen` wraps the content in `{#key sectionId}`; any local state silently resets on navigation. [Source: deferred-work.md:9; InformationalScreen.svelte:20-30]
- Prose as semantic HTML: `<p>`, `<strong>`, `<code class="notation">`. No inline `style=`. No hardcoded hex or size that has a token.
- The component lives at `src/content/sections/EquityContent.svelte`. Relative import paths are two levels up: `../../lib/components/CardGroup.svelte`, `../../lib/cards`. [Source: IntroContent.svelte:2-3]

### Card graphics for LO1 example

Use the canonical LO1 scenario (FR-8): hand `Ah Kh`, flop `Qh 8h 7c`.

```ts
const hand = [parseCard('Ah'), parseCard('Kh')]
const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
```

Render as two separate `CardGroup` instances — hand labeled `"Your hand"`, board labeled `"Flop"`. All 5 cards are unique; no `CardGroup` has duplicate card keys; no crash risk. [Source: deferred-work.md:13; CardGroup.svelte:11]

The `parseCard` call is at module-eval time (no error boundary — deferred-work.md:5). Keep all literals valid canonical notation. An invalid literal (`10h`, `AH`, `Xz`) throws synchronously at component instantiation, blanking the screen. Valid: `Ah`, `Kh`, `Qh`, `8h`, `7c` — all canonical. [Source: AR-3; deferred-work.md:5]

### Prose typography contract — already complete from Story 2.3

`InformationalScreen.svelte` already has all needed `:global()` rules:
- `p { margin: 0 }` + `p + p { margin-top: var(--space-4) }` — paragraph rhythm
- `p + .group { margin-top: var(--space-4) }` + `.group + p { margin-top: var(--space-4) }` — prose ↔ CardGroup boundaries
- `strong { font-weight: 600; color: var(--color-text-on-felt) }` — emphasis
- `code.notation { font: var(--font-value); color: var(--color-gold) }` — card notation inline

No new `:global()` rules needed unless new HTML element types are introduced. **Recommend staying within `<p>`, `<strong>`, `<code class="notation">`** to avoid any `InformationalScreen.svelte` changes. If you use `<ol>`, `<ul>`, `<h2>`, etc., you MUST add the corresponding `:global()` rules in `InformationalScreen.svelte`'s `.prose` block at the same time (just-in-time; no speculative additions). [Source: 2-3-…md:Task1; InformationalScreen.svelte:72-98]

### LO1 pedagogical content (LDR-3) — derivation BEFORE Rule of 2-and-4

The addition-law derivation must appear before the shorthand (LDR-3). Suggested prose structure:

1. **What equity is.** Equity is the probability that your hand wins at showdown. At any point in the hand, some cards improve your hand to a winner — those are your outs.
2. **Show the example.** Hand: `Ah Kh`. Flop: `Qh 8h 7c`. You have a flush draw (two hearts in hand, two hearts on board). Render both `CardGroup` instances here.
3. **Count the outs.** 13 hearts in a deck. Four are visible (`Ah`, `Kh`, `Qh`, `8h`). Nine remain unseen. Nine outs.
4. **Derivation.** With 47 unseen cards, the probability of hitting on the turn is roughly 9/47 ≈ 19%. The river gives another chance — roughly 9/46 ≈ 20%. Together, these two chances combine to about 35%.
5. **Introduce the Rule of 2-and-4.** That's accurate but slow to compute at the table. The Rule of 2-and-4: when **two streets remain**, multiply outs × 4; when **one street remains**, multiply outs × 2. Nine outs × 4 = 36% — within a percentage point of the exact figure.
6. **Close.** You'll use this rule in the assessment to come. Fix the ×4/×2 split now: two streets = multiply by 4; one street = multiply by 2.

`code.notation` tokens for inline card references: `<code class="notation">Ah</code>`, `<code class="notation">Kh</code>`, etc.
`<strong>` for the rule statement: `<strong>×4 for two streets, ×2 for one</strong>`.

**Voice (AC3, UX-DR16):** warm-coach, second-person. "You have 9 outs" not "there are 9 outs." Direct but not terse. No emoji, no hype, no exclamation marks.

### Previous story intelligence (2.3 + Epic 2)

- **`IntroContent.svelte` is the exact model.** Follow its script/template structure. [Source: IntroContent.svelte:1-48]
- **Prose rhythm is in the archetype.** `InformationalScreen.svelte`'s `.prose :global()` block owns all typography; do not add per-component styles. [Source: 2-3-…md:Task1; InformationalScreen.svelte:72-98]
- **CardGroup duplicate-key crash.** Keep all card literals unique within each group. The `{#each}` in `CardGroup` is keyed on `cardToString`; duplicate cards crash. [Source: deferred-work.md:13; CardGroup.svelte:11]
- **`parseCard` error boundary deferred.** Keep literals valid to avoid silent blank screen. [Source: deferred-work.md:5]
- **Token discipline + literal-justification is house style.** Do not tokenize one-offs; do not hardcode anything with a token. [Source: 2-1-…md:190-192; 2-2-…md:228]
- **Components are node-untestable.** No render test for `EquityContent` — manual visual pass. Existing 3 test files / 69 tests stay green. [Source: 2-2-…md:300-302; deferred-work.md:54]

### Architecture compliance (guardrails)

- **Structure:** `content/sections/EquityContent.svelte` (NEW) + `content/sections/index.ts` (UPDATE) + `App.svelte` (UPDATE, condition change only). No structural variance from the architecture tree. [Source: architecture.md:427-436]
- **Naming:** PascalCase component name `EquityContent`. [Source: architecture.md:269-283]
- **Content boundary (AR-9):** authored prose lives only in `content/sections/`; the archetype owns shape only. [Source: AR-9; architecture.md:458-460]
- **Card notation (AR-3):** `T` for ten, lowercase suits, all encode/decode through `parseCard`/`cardToString`. [Source: AR-3; architecture.md:285-290]
- **Styling boundary:** every value from `tokens.css`. No hardcoded hex/size that has a token. [Source: architecture.md:283; tokens.css]
- **State boundary:** `EquityContent` is presentational; no store read/write, `appState.svelte.ts` unchanged. [Source: architecture.md:454-457]

### Testing standards

- **No new automated test mandated.** `EquityContent` is presentational Svelte (node-env Vitest cannot render it; adding a DOM test lib violates AR-1). [Source: 2-2-…md:300-302; deferred-work.md:54]
- **Verification = `check`/`test`/`build` green + the Task-4 visual walkthrough.** [Source: 2-2-…md:301]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `54bf5d3` (`review(2.3)` — Introduction content complete). 2.4 is content-authoring + a small `App.svelte` routing change — lower risk than 2.2's `App.svelte` refactor, but the no-regression visual pass (intro, pot-odds fallback, calling fallback) still matters. `_bmad*/` and `docs/` stay untouched.

### Project Structure Notes

Three files touched; two existing, one new:
- `pokermath/src/content/sections/EquityContent.svelte` — **NEW** (per architecture.md:437)
- `pokermath/src/content/sections/index.ts` — **UPDATE** (add equity registry entry)
- `pokermath/src/App.svelte` — **UPDATE** (routing condition change only; no layout change)

No new directories, no new dependencies, no structural variance.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.4] — story statement + ACs (lines 351-369)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-4 per-Section instructional content (line 24), LDR-3 concept-before-shorthand (line 48), AR-3 canonical notation (56), AR-9 content split (62), UX-DR4 Informational archetype (71), UX-DR16 warm-coach voice (83), NFR-2 accessibility floor (38), FR-8 LO1 canonical scenario (29)
- [Source: _bmad-output/planning-artifacts/architecture.md] — `EquityContent.svelte # addition law → Rule of 2-and-4 (FR-4, LDR-3)` (437), content/screen boundary (458-460), canonical card notation single-decode (285-290), token discipline (283), naming (269-283)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — LO1 UJ-1 journey: Sam reads derivation then meets Rule of 2-and-4 (127-129), warm-coach voice (42-52)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — ~60ch prose cap (193), typography voices (183-185), no second accent hue (234)
- [Source: pokermath/src/App.svelte] — routing condition to change (line 16), TEMPORARY else comment (24)
- [Source: pokermath/src/content/sections/index.ts] — registry to update (lines 1-9)
- [Source: pokermath/src/content/sections.ts] — equity kind:'assessment' (line 22-25); DO NOT CHANGE
- [Source: pokermath/src/content/sections.test.ts] — LO section kind assertions (lines 17-20); would fail if sections.ts changed
- [Source: pokermath/src/screens/InformationalScreen.svelte] — `.prose :global()` contract complete from 2.3 (lines 72-98)
- [Source: pokermath/src/content/sections/IntroContent.svelte] — model for component idiom (lines 1-48)
- [Source: pokermath/src/lib/components/CardGroup.svelte] — label + cards props, keyed on cardToString (lines 5,11)
- [Source: pokermath/src/styles/tokens.css] — `--space-4` (line 53), `--font-value` (34), `--color-gold` (13), `--color-text-on-felt` (6), suit tokens (22-25)
- [Source: _bmad-output/implementation-artifacts/2-3-introduction-content-hand-notation.md] — predecessor: prose typography contract established, IntroContent idiom (Task1, Task2), node-env testing rule (300-302)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — `parseCard` module-eval error boundary (line 5), CardGroup dup-key (13), `{#key}` content re-mount (9), node-env / no component-test-lib (54)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation was clean on first pass.

### Completion Notes List

- **Task 1:** Created `pokermath/src/content/sections/EquityContent.svelte` following exact `IntroContent.svelte` idiom. `parseCard` called only in `<script>` block (AR-3). Stateless component — no `onMount`, no `$state`. Prose uses only `<p>`, `<strong>`, `<code class="notation">` — no new `:global()` rules needed. Warm-coach second-person voice throughout. No assessment chrome.
- **Task 2:** Updated `pokermath/src/content/sections/index.ts` — added `import EquityContent` and `equity: EquityContent` entry. Type-checks without changes to `sections.ts`.
- **Task 3:** Updated `pokermath/src/App.svelte:16` — dropped `active.kind === 'informational' &&` guard, leaving `sectionContent[active.id]`. Updated `{:else}` comment for new semantics. `sections.ts`, `sections.test.ts`, `appState.svelte.ts` untouched.
- **Task 4 — Automated checks:**
  - `npm run check` → `97 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` ✅
  - `npm run test -- --run` → `3 passed (3) / 69 passed (69)` ✅
  - `npm run build` → `✓ built in 280ms`, `dist/assets/index-CV2P3INr.js 47.38 kB` ✅
- **Task 4 — Manual visual pass (Playwright/Chromium, port 5199):**
  - Equity section: title "Equity & the Rule of 2-and-4", subtitle "LO1 · estimate your equity" ✅
  - Card graphics: YOUR HAND (A♥ K♥) + FLOP (Q♥ 8♥ 7♣) rendered ✅
  - Derivation prose: 9/47 ≈ 19%, 9/46 ≈ 20%, combined 35% ✅
  - Rule of 2-and-4: "×4 for two streets remaining, ×2 for one" bold ✅
  - Four-color: ♥ red, ♦ blue, ♣ green, ♠ black ✅; T not 10 ✅
  - No assessment chrome ✅
  - Introduction still renders correctly ✅
  - Pot Odds: title-only fallback with Back/Next pager, no content ✅
  - Keyboard: Tab focuses sidebar items with visible focus ring ✅

### File List

- `pokermath/src/content/sections/EquityContent.svelte` (NEW)
- `pokermath/src/content/sections/index.ts` (MODIFIED)
- `pokermath/src/App.svelte` (MODIFIED)

## Change Log

- 2026-05-30: Story 2.4 implemented — created `EquityContent.svelte` with addition-law derivation + Rule of 2-and-4 prose and card graphics; registered in content registry; simplified `App.svelte` routing condition to `sectionContent[active.id]`
