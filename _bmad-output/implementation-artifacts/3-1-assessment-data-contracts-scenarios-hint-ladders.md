---
baseline_commit: 983927e
---

# Story 3.1: Assessment data contracts, scenarios & hint ladders

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the builder,
I want the assessment data modeled once as typed data,
So that correctness logic and UI both consume a single source of truth.

## Acceptance Criteria

**AC1 — Contract types defined (AR-7)**
**Given** `src/lib/assessment/types.ts`
**When** it is created
**Then** it defines `Scenario`, `AnswerKey`, `FieldId`, `ValidationResult`, and `HintRung` per the architecture contracts — importing `Card` from `lib/cards`, importing nothing from Svelte

**AC2 — Three canonical scenarios + answer keys (FR-8, FR-9, FR-10, AR-7)**
**Given** `src/content/scenarios.ts`
**When** it is created
**Then** it holds the three canonical scenarios as typed data — LO1 (`Ah Kh` on `Qh 8h 7c`), LO2 ($40 pot + $10 bet), LO3 (the commitment decision) — each with its `AnswerKey` (exact fields + equity ±3pp band + pot-odds `cost/(pot+cost)` values), with hands/boards routed through `parseCard`

**AC3 — Hint ladders, per-LO / per-error-type, non-revealing (UX-DR17, LDR-5)**
**Given** `src/content/hintLadders.ts`
**When** it is created
**Then** it holds per-LO, per-error-type escalating rung text (miscounted outs, wrong multiplier, denominator error, ratio/percentage confusion, wrong comparison direction), with no rung revealing the final answer

**AC4 — Number/ratio storage convention (AR-7)**
**Given** the data shapes
**When** values are stored
**Then** percentages are plain numbers (`36` = 36%) and ratios are `[antecedent, consequent]` (`[5, 1]`)

## Tasks / Subtasks

- [x] **Task 1: Create `src/lib/assessment/types.ts` — the shared contract module (AC: #1, #4)**
  - [x] **New file + new folder:** `pokermath/src/lib/assessment/types.ts`. This folder is the pure-logic firewall — **it imports nothing from Svelte** (AR-4). This story creates only `types.ts`; `validation.ts`/`hints.ts` + their tests arrive in Stories 3.2/3.3. [Source: architecture.md:407-412, 449-453]
  - [x] **Import:** `import type { Card } from '../cards'` (relative path from `lib/assessment/` → `lib/cards.ts`). [Source: cards.ts:3 — `Card = { rank: Rank; suit: Suit }`]
  - [x] **Define these exported types (the 5 named in AC1 + the supporting building blocks they require):**
    ```ts
    import type { Card } from '../cards'

    /** Which learning objective a scenario assesses. */
    export type LO = 'lo1' | 'lo2' | 'lo3'

    /** Call/Fold judgment (LO3 only). */
    export type Decision = 'call' | 'fold'

    /** A ratio as [antecedent, consequent] — 5:1 is [5, 1] (AR-7). */
    export type Ratio = [number, number]

    /** Every assessment input field across LO1–LO3. */
    export type FieldId = 'outs' | 'streets' | 'equity' | 'ratio' | 'requiredEquity' | 'decision'

    /** A single assessment scenario shown to the learner. */
    export type Scenario = {
      id: string
      lo: LO
      hand: Card[]
      board: Card[]
      pot?: number
      bet?: number
      prompt: string
    }

    /**
     * Correct answers for a scenario, keyed by field. Only the fields a scenario
     * uses are present.
     *  - Exact fields (outs, streets, ratio, decision): require exact match (FR-11).
     *  - equity: the textbook outs×4 value; the engine accepts ±EQUITY_TOLERANCE_PP (FR-11).
     *  - requiredEquity: the cost/(pot+cost) value; the engine accepts the 16–17% band (FR-11).
     * Percentages are plain numbers (36 = 36%); ratios are [antecedent, consequent] (AR-7).
     */
    export type AnswerKey = {
      outs?: number
      streets?: number
      equity?: number
      ratio?: Ratio
      requiredEquity?: number
      decision?: Decision
    }

    /** Tolerance (percentage points) for the Rule-of-2-and-4 equity field (FR-11). */
    export const EQUITY_TOLERANCE_PP = 3

    /** Detected likely-error categories that drive hint-ladder selection. */
    export type ErrorType =
      | 'miscounted-outs'
      | 'wrong-multiplier'
      | 'denominator-error'
      | 'ratio-percentage-confusion'
      | 'wrong-comparison-direction'

    /** One escalating step of a hint ladder, as returned by the hint engine (Story 3.3). */
    export type HintRung = {
      errorType: ErrorType
      rung: number // 0-based index within the ladder
      text: string
    }

    /** A ladder = ordered rungs per detected error type. Authored copy lives in content/hintLadders.ts. */
    export type HintLadder = Partial<Record<ErrorType, readonly string[]>>

    /** Result of validating a submission (Story 3.2). */
    export type ValidationResult = {
      perField: Partial<Record<FieldId, boolean>>
      passed: boolean
      hint?: HintRung
    }
    ```
  - [x] **Deliberate refinement of the architecture shorthand:** architecture.md:311 writes `perField: Record<FieldId, boolean>`. Use `Partial<Record<FieldId, boolean>>` — LO1 has no `ratio` field, so a full `Record` would force meaningless `ratio: false` entries. The engine reports only the fields a scenario actually uses. [Source: architecture.md:311 — contract; refined for partial-field scenarios]
  - [x] **Do NOT** add `validation.ts`, `hints.ts`, or test files in this story — types only. Those are Stories 3.2/3.3.
  - [x] **Do NOT** import anything from `svelte`, a component, or the store — this module is the framework-free firewall (AR-4).

- [x] **Task 2: Create `src/content/scenarios.ts` — the three canonical scenarios + answer keys (AC: #2, #4)**
  - [x] **New file:** `pokermath/src/content/scenarios.ts`
  - [x] **Imports:** `import { parseCard } from '../lib/cards'` and `import type { Scenario, AnswerKey } from '../lib/assessment/types'`. Route every hand/board card through `parseCard` (AR-3) — never hand-build `{rank,suit}` literals. [Source: architecture.md:285-290; scenarios stored as parsed `Card[]`]
  - [x] **Shape:** pair each `Scenario` with its `AnswerKey`. Export a typed structure the validation engine (3.2) and screens (3.6–3.8) consume by LO. Recommended export:
    ```ts
    export type ScenarioWithKey = { scenario: Scenario; answer: AnswerKey }
    export const assessments: Record<LO, ScenarioWithKey> = { lo1, lo2, lo3 }
    ```
    (Import `LO` from the types module alongside `Scenario`/`AnswerKey`.) A `Record<LO, …>` gives O(1) lookup by LO and a compile error if any LO is missing.
  - [x] **LO1 — Equity (FR-8):**
    - `scenario`: `{ id: 'lo1', lo: 'lo1', hand: [parseCard('Ah'), parseCard('Kh')], board: [parseCard('Qh'), parseCard('8h'), parseCard('7c')], prompt: <see below> }` (no `pot`/`bet`).
    - `answer`: `{ outs: 9, streets: 2, equity: 36 }`.
    - **Arithmetic (must be exact):** hearts in play = `Ah Kh Qh 8h` = 4 → 13 − 4 = **9** unseen hearts = outs. On the flop, **2** streets remain (turn + river). Rule of 2-and-4: 9 × 4 = **36**. [Source: epics.md:28 — FR-8 canonical scenario]
    - `prompt` (warm-coach, 2nd person): `'Your opponent moves all-in on the flop. Count your outs, note the streets still to come, and estimate your equity with the Rule of 2-and-4.'`
  - [x] **LO2 — Pot Odds (FR-9):**
    - `scenario`: `{ id: 'lo2', lo: 'lo2', hand: [], board: [], pot: 40, bet: 10, prompt: <below> }`. LO2 is pure pot-odds — no cards (FR-9 presents pot size + bet/call amount only). Empty `hand`/`board` arrays satisfy the required `Card[]` fields. [Source: epics.md:29 — FR-9]
    - `answer`: `{ ratio: [5, 1], requiredEquity: 16.7 }`.
    - **Arithmetic:** $40 pot, opponent bets $10 → you call $10 to win the $50 already out there → ratio 50:10 = **5:1**. Required equity = call ÷ (final pot if you call) = 10 ÷ (40 + 10 + 10) = 10 ÷ 60 ≈ **16.7%**. The classic *denominator error* the hint ladder targets is 10 ÷ 50 = 20% (forgetting your own call in the denominator). [Source: epics.md:29,31 — FR-9, FR-11 `cost/(pot+cost)`; EXPERIENCE.md:86]
    - `prompt`: `"There's $40 in the pot and your opponent bets $10. What pot odds are you getting, and what equity do you need to make calling break even?"`
  - [x] **LO3 — Calling Profitably / the climax (FR-10):**
    - `scenario`: `{ id: 'lo3', lo: 'lo3', hand: [parseCard('Ah'), parseCard('Kh')], board: [parseCard('Qh'), parseCard('8h'), parseCard('7c')], pot: 40, bet: 10, prompt: <below> }`.
    - `answer`: `{ equity: 36, ratio: [5, 1], requiredEquity: 16.7, decision: 'call' }`.
    - **Why these numbers (READ — source conflict resolved here, see Dev Notes §"LO3 source-conflict reconciliation"):** LO3 is the synthesis — LO1's hand/board (→ 36% equity) judged against LO2's pot odds (→ 5:1 / 16.7% required). 36% comfortably clears 16.7% → **Call**. Store **both** `ratio` and `requiredEquity` so whichever input primitive 3.8 renders (UX-DR9 → RatioInput; 3.8 AC → required-equity %) has its key. [Source: epics.md:30 (FR-10), 645 (Story 3.8 AC); EXPERIENCE.md:132-133]
    - `prompt`: `'You hold Ah Kh on Qh 8h 7c. There's $40 in the pot and your opponent bets $10, putting you to a decision. Work out your equity and the pot odds, then commit: call or fold?'`
  - [x] **All percentages are plain numbers, all ratios are tuples** (AC4) — `36`, `16.7`, `[5, 1]`; the `%`/`:` are presentation-only, added by the input primitives in 3.4. [Source: architecture.md:313-314]

- [x] **Task 3: Create `src/content/hintLadders.ts` — per-LO / per-error-type escalating copy (AC: #3)**
  - [x] **New file:** `pokermath/src/content/hintLadders.ts`
  - [x] **Import:** `import type { LO, HintLadder } from '../lib/assessment/types'`.
  - [x] **Transcribe the canonical ladders verbatim from EXPERIENCE.md:82-88** (these are the approved, warm-coach, non-revealing rungs). Structure as `Record<LO, HintLadder>`:
    ```ts
    export const hintLadders: Record<LO, HintLadder> = {
      lo1: {
        'miscounted-outs': [
          'Re-count your outs — how many unseen cards complete your draw?',
          'All your hearts are outs. Four hearts are already showing — how many of the thirteen remain?',
          'Nine hearts are unseen. Now apply the rule for two streets to come.',
        ],
        'wrong-multiplier': [
          'Check your multiplier — how many streets are still to come on the flop?',
          'Two streets remain, so the Rule of 2-and-4 says ×4, not ×2.',
          'Multiply your outs by 4.',
        ],
      },
      lo2: {
        'denominator-error': [
          'Did you include the cost of your call in the pot?',
          'The pot is $50 and it costs $10 to call — your $10 goes into the denominator too.',
          'Use cost ÷ (pot + cost), i.e. 10 ÷ 60.',
        ],
        'ratio-percentage-confusion': [
          'Re-read which field wants a ratio and which wants a percentage.',
          '5:1 means five-to-one; the percentage is the break-even equity it implies.',
          'Convert the ratio with cost ÷ (pot + cost).',
        ],
      },
      lo3: {
        'wrong-comparison-direction': [
          'Line up the two numbers you computed — which must be larger to call?',
          'Calling is profitable when your equity meets or beats the required equity.',
          'Compare your equity to the required-equity threshold, then decide.',
        ],
      },
    }
    ```
  - [x] **Non-revealing rule (LDR-5, UX-DR17):** no rung may state a final answer value. Note the deliberate edge: the EXPERIENCE.md-approved rungs *do* contain intermediate scaffolding numbers — LO1 rung 3 says "Nine hearts are unseen" (the out count) and "two streets"; LO2 says "10 ÷ 60". These are the approved canonical rungs and are NOT the *submitted-answer* values (the answers are equity `36`, ratio `5:1`, required-equity `16.7`, decision `call`). The Task 4 leak test asserts against those **final answer** strings only — see Dev Notes §"What 'never reveal the answer' means here". Do not soften or rewrite the approved copy. [Source: EXPERIENCE.md:82-88]
  - [x] **Voice (UX-DR16):** copy is warm-coach, 2nd person, no emoji — already satisfied by the verbatim EXPERIENCE.md rungs. Do not add hype.

- [x] **Task 4: Author data-integrity tests (co-located, AC: #1–#4)**
  - [x] **New file:** `pokermath/src/content/scenarios.test.ts` — Vitest, mirroring the `import { describe, it, expect } from 'vitest'` style of `sections.test.ts`. These test the **data**, not the validation/hint *logic* (that is 3.2/3.3). Cover:
    - `assessments` has exactly the three keys `lo1`, `lo2`, `lo3`; each `scenario.lo` matches its key.
    - LO1 answer: `outs === 9`, `streets === 2`, `equity === 36`, and `equity === outs * 4` (Rule-of-2-and-4 self-consistency for 2 streets).
    - LO1/LO3 hand is `['Ah','Kh']` and board is `['Qh','8h','7c']` via `cardToString` round-trip (proves `parseCard` was used and notation is canonical — `T` rule etc.).
    - LO2 answer: `ratio` equals `[5, 1]`, `requiredEquity` within `[16, 17]`; `pot === 40 && bet === 10`.
    - LO3 answer: `equity === 36`, `ratio` equals `[5, 1]`, `requiredEquity` within `[16, 17]`, `decision === 'call'`; and the climax invariant `equity > requiredEquity` (the call is +EV).
    - Convention: every present percentage field is a finite `number`; every present `ratio` is a 2-tuple of numbers.
  - [x] **New file:** `pokermath/src/content/hintLadders.test.ts` — cover:
    - Every LO key present; each LO maps only error types valid for it (lo1 → miscounted-outs, wrong-multiplier; lo2 → denominator-error, ratio-percentage-confusion; lo3 → wrong-comparison-direction).
    - Every ladder array is non-empty and ordered (length ≥ 1), every rung is a non-empty string.
    - **Answer-leak guard (LDR-5):** no rung string contains a *final submitted-answer* token. Assert no rung matches `/\b36\b/` or `/\b16\.7\b/` or `/5:1/` (the final equity/required-equity/ratio answers). Scope the guard to these final-answer values only — the approved scaffolding numbers (`9`, `4`, `60`, `50`) are intentionally present (see Task 3 note + Dev Notes). [Source: EXPERIENCE.md:82-88; LDR-5]
  - [x] **No test needed for `types.ts`** — it is type-only (plus the `EQUITY_TOLERANCE_PP` constant); type correctness is covered by `npm run check`. The scenarios/hintLadders tests import the types, giving them compile-time exercise.

- [x] **Task 5: Verify (AC: #1–#4)**
  - [x] `npm run check` → 0 errors / 0 warnings. Confirms: `types.ts` compiles with no Svelte import; `scenarios.ts` `Record<LO, ScenarioWithKey>` is exhaustive (missing-LO = compile error); `AnswerKey`/`Scenario` field types thread through; `hintLadders` conforms to `Record<LO, HintLadder>`.
  - [x] `npm run test -- --run` → all prior suites still green **plus** the 2 new files pass. Record the new totals (prior was 4 files / 72 tests as of Story 2.8 — expect 6 files now).
  - [x] `npm run build` → clean static `dist/` (AR-8). (Pure data adds negligible bundle.)
  - [x] **No manual/visual pass** — this story ships zero UI. Verification is `check` + `test` + `build` green.
  - [x] Record suite totals + any deviations in Dev Agent Record → Completion Notes.

### Review Findings

- [x] [Review][Patch] `assessments` missing `as const satisfies Record<LO, ScenarioWithKey>` — literal types widened to `number`; a typo like `equity: 63` compiles silently [pokermath/src/content/scenarios.ts:46]
- [x] [Review][Patch] `hintLadders` missing `as const satisfies Record<LO, HintLadder>` — not compile-time immutable; callers can push rungs at runtime despite `readonly string[]` annotation [pokermath/src/content/hintLadders.ts]
- [x] [Review][Patch] `VALID_ERROR_TYPES` in test typed as `Record<string, readonly string[]>` not `Record<LO, readonly ErrorType[]>` — new `ErrorType` additions go undetected at compile time [pokermath/src/content/hintLadders.test.ts]
- [x] [Review][Patch] Missing test: ratio/requiredEquity mathematical consistency invariant (`1 / (ratio[0] + 1) ≈ requiredEquity / 100`) — would catch 5:1 vs 4:1 discrepancies at the data layer [pokermath/src/content/scenarios.test.ts]
- [x] [Review][Patch] Missing test: scenario IDs are unique across the `assessments` record — prevents silent shadowing if a future scenario reuses an ID [pokermath/src/content/scenarios.test.ts]
- [x] [Review][Defer] `AnswerKey` fully optional — all six fields are `?`; downstream 3.2–3.8 must null-guard every field access — deferred, pre-existing design choice
- [x] [Review][Defer] `HintLadder` is `Partial<Record<ErrorType, ...>>` — 3.3 hint engine must guard against `undefined` when accessing an error type not defined for a given LO — deferred, pre-existing
- [x] [Review][Defer] `ValidationResult.hint` optional — 3.6–3.8 must null-guard before accessing `hint.text`/`hint.rung`; a discriminated union `{ passed: true } | { passed: false; hint: HintRung }` would enforce this at compile time — deferred, pre-existing design
- [x] [Review][Defer] `HintRung.rung` has no bounds enforcement — 3.3 must clamp rung index to ladder array length before indexing [pokermath/src/lib/assessment/types.ts] — deferred, pre-existing
- [x] [Review][Defer] `Ratio` type admits zero, negative, and NaN — `[number, number]` has no constraints; 3.2 must validate at input boundaries — deferred, pre-existing
- [x] [Review][Defer] `requiredEquity: 16.7` stored as float literal — 3.2 needs band comparison, not exact equality; no `REQUIRED_EQUITY_TOLERANCE_BAND` constant defined (contrast with `EQUITY_TOLERANCE_PP`) [pokermath/src/content/scenarios.ts] — deferred, pre-existing
- [x] [Review][Defer] `Scenario.id` typed as plain `string` with no uniqueness constraint — 3.6–3.8 should not use `id` as a lookup key [pokermath/src/lib/assessment/types.ts] — deferred, pre-existing
- [x] [Review][Defer] LO2 `hand: [], board: []` — 3.4/3.6 card-rendering screens must conditionally hide `CardGroup` when `hand.length === 0` [pokermath/src/content/scenarios.ts] — deferred, pre-existing
- [x] [Review][Defer] `ratio-percentage-confusion` rung 2 wording "what is already in the pot" is ambiguous between pre-bet ($40) and post-bet ($50) pot — minor content clarity improvement [pokermath/src/content/hintLadders.ts] — deferred, pre-existing

## Dev Notes

### Scope boundary (read first)

Story 3.1 lays the **data foundation** for all of Epic 3. **This story DOES:**
- Create `src/lib/assessment/types.ts` — the shared contract types (the only file in the pure-logic folder this story touches).
- Create `src/content/scenarios.ts` — the three canonical scenarios + answer keys as typed data.
- Create `src/content/hintLadders.ts` — the per-LO / per-error-type escalating rung copy.
- Create co-located `scenarios.test.ts` + `hintLadders.test.ts` — **data-integrity** tests only.

**This story does NOT:**
- Write `validation.ts` / `hints.ts` or their logic tests — Stories **3.2 / 3.3**.
- Build any screen, input primitive, or feedback row — Stories **3.4 / 3.5**.
- Touch `appState.svelte.ts`, `App.svelte`, `Sidebar.svelte`, or any component.
- Add any npm dependency (AR-1 stack is locked: Svelte 5 / TS / Vite / Vitest).
- Decide *how close counts* (tolerance comparison logic) — that is the validation engine's job (3.2). This story only **stores** the canonical values + the `EQUITY_TOLERANCE_PP` constant.

### LO3 source-conflict reconciliation (LOAD-BEARING — flagged for confirmation)

The source documents conflict on LO3's pot/bet amounts versus its stated required-equity answer:
- **FR-10 / EXPERIENCE.md state the required equity is ≈16.7%** (stated in FR-10, echoed in EXPERIENCE.md:132 "required equity (~16.7%)").
- **FR-10 also describes the scenario as "$40 pot, opponent all-in $40"** — but $40 into a $40 pot is 2:1 pot odds → required equity = 40 ÷ (80 + 40) = **33.3%**, NOT 16.7%. The two stated facts are mutually inconsistent.

**Resolution chosen for this story:** model LO3 with **pot = $40, bet = $10** → ratio `[5, 1]`, requiredEquity `16.7`, decision `call`. Rationale:
1. **Internal consistency is mandatory** — the validation engine (3.2) computes required equity *from* the scenario's pot/bet, so the stored `(pot, bet)` must mathematically produce the stored `(ratio, requiredEquity)`. `pot=40/bet=40` with `ratio=[5,1]/required=16.7` would be a self-contradictory data set that 3.2's tests cannot satisfy.
2. **Pedagogical soundness under the ±3pp band** — with required = 16.7%, a learner's equity estimate anywhere in the accepted band [33, 39] *clearly* clears the threshold → unambiguous Call. With required = 33.3%, an estimate of 33% (inside the ±3pp band) would be *below* 33.3% → a defensible Fold that contradicts the answer key. That is an assessment-breaking ambiguity. The "EV clears the threshold" climax (EXPERIENCE.md:133) only works when it clears comfortably.
3. **Honors the most-repeated facts** — "$40 pot" (FR-9 + FR-10), "16.7%" (×3 across docs), and the "5:1" threshold the learner just internalized in LO2. The outlier is the "all-in $40" amount, which is treated as the erroneous element.
4. **Clean synthesis** — LO3 = LO1's hand/board (36% equity) + LO2's pot odds (16.7%) + a judgment. This is exactly what LDR-2 prescribes (LO3 not performable without LO1 + LO2 internalized).

**⚠ Surface to Meakel before 3.2/3.8:** if the literal "$40 all-in" framing is canonical instead, the data must change to `pot=40, bet=40, ratio=[2,1], requiredEquity≈33.3` — and 3.8's judgment logic must handle the marginal-call ambiguity (e.g. widen the equity input or accept Call only when the *point estimate* 36 ≥ 33.3). The current data assumes the 16.7% answer is canonical.

### The data contract — single source of truth (AR-7)

`types.ts` is the **only** place answer-shape is defined; `scenarios.ts` is the **only** place the canonical answers live; `hintLadders.ts` is the **only** place hint copy lives (AR-9 content boundary). Stories 3.2–3.8 import these — **no component or engine may redefine a `Scenario`/`AnswerKey` shape or hardcode an answer value inline** (architecture.md:356-360 enforcement; anti-pattern at 373-377 "Recomputing equity/pot-odds correctness inside a component").

Field/number conventions (architecture.md:305-314):
- TS field naming: camelCase.
- Percentages: plain numbers (`36` = 36%). Ratios: `[antecedent, consequent]` (`[5,1]`). The `%` and `:` are presentation-only (added by `NumericInput`/`RatioInput` in 3.4).
- `EQUITY_TOLERANCE_PP = 3` is a module-level UPPER_SNAKE constant (architecture.md:277-278) — the single source for the Rule-of-2-and-4 band. The validation engine (3.2) imports it; do not re-hardcode `3` there.

### What "never reveal the answer" means here (LDR-5 nuance)

The non-revealing rule (LDR-5, UX-DR17) forbids a rung from handing over the **value the learner must submit**. The canonical EXPERIENCE.md rungs deliberately *do* include teaching scaffolds (LO1 rung 3: "Nine hearts are unseen … two streets to come"; LO2 rung 3: "10 ÷ 60") — these guide the *method* without stating the *final submitted answers* (equity `36`, ratio `5:1`, required-equity `16.7`, decision `call`). The Task 4 leak guard therefore asserts against **final-answer tokens only** (`36`, `16.7`, `5:1`), not against the intermediate `9`/`4`/`60`/`50`. Transcribe the rungs verbatim — do not "fix" them to remove the scaffolding numbers; they are approved copy.

### Architecture compliance

- **Structure (architecture.md:407-412, 431-434):** new files match the tree exactly — `lib/assessment/types.ts`, `content/scenarios.ts`, `content/hintLadders.ts`, with co-located `*.test.ts` in `content/`.
- **Pure-logic firewall (AR-4, architecture.md:449-453):** `lib/assessment/` imports nothing from Svelte. `types.ts` imports only `type { Card }` from `lib/cards`. Keep it that way.
- **Card notation (AR-3, architecture.md:285-290):** all cards via `parseCard` — `T` = ten, lowercase suits. Never write `'10'` or uppercase suits; never hand-build `{rank,suit}` literals in `scenarios.ts`.
- **Content boundary (AR-9, architecture.md:458-460):** authored data (scenarios, keys, hint copy) lives only under `src/content/`; types live in `lib/assessment/`. No content leaks into a component.
- **Naming (architecture.md:269-278):** PascalCase types (`Scenario`, `AnswerKey`, `ValidationResult`, `HintRung`, `HintLadder`), camelCase modules/exports (`scenarios.ts`, `hintLadders.ts`, `assessments`, `hintLadders`), UPPER_SNAKE for `EQUITY_TOLERANCE_PP`.

### Testing standards

- **This is data, not logic** — the tests assert shape, counts, canonical values, internal consistency, and the non-leak guard. They are NOT the mandated engine tests (those are `validation.test.ts` / `hints.test.ts` in 3.2/3.3, the prime test targets per AR-4).
- **Co-located** beside the data files in `content/` (architecture.md:294-296, 508-509), matching `sections.test.ts` / `cheatsheets.test.ts`.
- **node-env is fine here** — these are pure TS data imports, no Svelte component rendering (which the node-env Vitest setup cannot do; that constraint only bites component tests). [Source: 2-8 story Dev Notes — node-env constraint applies to `.svelte` rendering only]
- **Vitest style:** `import { describe, it, expect } from 'vitest'` then `describe`/`it`/`expect` — mirror `cards.test.ts` / `sections.test.ts` exactly. [Source: sections.test.ts:1-22; cards.test.ts:1-3]

### Previous-work intelligence (Epic 2 patterns to reuse)

- **Typed-data + co-located test pattern** is already established: `content/sections.ts` ↔ `content/sections.test.ts`, `content/cheatsheets.ts` ↔ `content/cheatsheets.test.ts`. `scenarios.ts`/`hintLadders.ts` follow the identical pattern. The `as const satisfies readonly T[]` idiom in `cheatsheets.ts:5-10` is a good reference for literal-narrowed typed data. [Source: cheatsheets.ts:1-10; sections.test.ts:1-22]
- **`cards.ts` is complete and correct** — `parseCard`/`cardToString`, `Card`/`Rank`/`Suit`. Import and reuse; do not duplicate. [Source: cards.ts:1-21]
- **The Jargon cheat sheet already encodes the canonical definitions** consistent with this data — out = "an unseen card that completes your draw", required equity = `cost ÷ (pot + cost)`, "$50 pot + $10 call → 10/60 ≈ 16.7%". Keep `scenarios.ts`/`hintLadders.ts` numerically consistent with `content/cheatsheets/Jargon.svelte`. [Source: 2-8 story Dev Notes — Jargon definitions]
- **Commit cadence:** `feat(3.1): …` on `main`; baseline is `983927e`.

### Reference: how 3.2/3.3 will consume this (context, not scope)

This sets expectations so the contract shapes are right — **do not implement any of this here.**
- 3.2 `validate(scenario, answers)` → reads `assessments[scenario.lo].answer`, compares submitted `answers` field-by-field (exact for outs/streets/ratio/decision; `±EQUITY_TOLERANCE_PP` for equity; the 16–17% band for requiredEquity), returns `ValidationResult`.
- 3.3 `detectError()` + rung selection → reads `hintLadders[lo][errorType]`, returns a `HintRung { errorType, rung, text }`.
- 3.6–3.8 screens → render `assessments[lo].scenario` (hand/board via `CardGroup`/`PlayingCard`, pot/bet + prompt) and submit field values for validation.

### File changes summary

4 new files, 0 modified:
- `pokermath/src/lib/assessment/types.ts` — **NEW** (contract types + `EQUITY_TOLERANCE_PP`; no Svelte import)
- `pokermath/src/content/scenarios.ts` — **NEW** (3 scenarios + answer keys, `Record<LO, ScenarioWithKey>`)
- `pokermath/src/content/hintLadders.ts` — **NEW** (per-LO / per-error-type rung copy, `Record<LO, HintLadder>`)
- `pokermath/src/content/scenarios.test.ts` — **NEW** (data-integrity tests)
- `pokermath/src/content/hintLadders.test.ts` — **NEW** (ladder shape + answer-leak guard)

(`src/lib/assessment/` is a new folder; `validation.ts`/`hints.ts` deliberately deferred to 3.2/3.3.)

### Project Structure Notes

- New `src/lib/assessment/` folder created here with only `types.ts` — matches architecture.md:407-412; the sibling files arrive in later stories. No structural variance.
- All paths align with the architecture directory tree (architecture.md:383-445). No conflicts detected.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.1] — story statement + ACs (lines 455-477)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-8 LO1 canonical scenario (28), FR-9 LO2 (29), FR-10 LO3 (30), FR-11 tolerance + `cost/(pot+cost)` (31), FR-12 hints (32), LDR-1 Bloom (44), LDR-4 compute-don't-recognize (47), LDR-5 non-revealing feedback (48), UX-DR17 hint ladders (84)
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-7 shared data contracts (60), AR-4 pure engine (57), AR-3 card notation (56), AR-9 content split (62); naming conventions (269-314); `Scenario`/`AnswerKey`/`ValidationResult` shapes (307-314); directory tree (383-445); pure-logic boundary (449-453); content boundary (458-460); test co-location (294-296, 508-509)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md:82-88] — canonical hint-ladder rung copy (verbatim transcription source)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md:127-136] — UJ-1 walkthrough; LO3 climax framing (36% vs 16.7% → Call), failure path (×2 vs ×4 ladder)
- [Source: pokermath/src/lib/cards.ts:1-21] — `Card`/`Rank`/`Suit`, `parseCard`, `cardToString` (import + reuse)
- [Source: pokermath/src/content/sections.ts:1-37] — typed-data module style to mirror
- [Source: pokermath/src/content/sections.test.ts:1-22] — co-located Vitest data-test pattern to mirror
- [Source: pokermath/src/content/cheatsheets.ts:1-10] — `as const satisfies readonly T[]` typed-data idiom
- [Source: pokermath/src/content/cheatsheets/Jargon.svelte] — canonical out/equity/pot-odds definitions to stay numerically consistent with
- [Source: _bmad-output/implementation-artifacts/2-8-cheat-sheet-content-four-sheets.md] — prior-story conventions (node-env test constraint, commit cadence, token/content boundaries)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- LO2 `ratio-percentage-confusion` rung 2 conflict: EXPERIENCE.md:87 verbatim text "5:1 means five-to-one" matches the Task 4 `/5:1/` answer-leak guard. Resolved: the test assertion is authoritative for LDR-5; rung 2 was rephrased to teach pot-odds ratio concept without stating the final answer token. Scaffolding numbers (9, 4, 60, 50) preserved per Dev Notes.

### Completion Notes List

- Created `src/lib/assessment/` folder (new) with `types.ts` — 10 exported types + 1 UPPER_SNAKE constant; no Svelte import; AR-4 firewall confirmed by `npm run check` (0 errors).
- Created `src/content/scenarios.ts` — `Record<LO, ScenarioWithKey>` with all 3 canonical scenarios + answer keys; all cards via `parseCard`; AC4 conventions (plain number %, Ratio tuple).
- Created `src/content/hintLadders.ts` — `Record<LO, HintLadder>`; lo1 × 2 error types, lo2 × 2 error types, lo3 × 1 error type; non-revealing per LDR-5 (rephrased one rung as noted above).
- Created `src/content/scenarios.test.ts` — 20 assertions covering shape, LO-key matching, LO1/LO2/LO3 canonical values, Rule-of-2-and-4 self-consistency, parseCard round-trip, climax invariant (equity > requiredEquity), field conventions.
- Created `src/content/hintLadders.test.ts` — 19 assertions covering LO key presence, valid error-type scoping, non-empty ladders, non-empty rung strings, answer-leak guard (no `36`, `16.7`, or `5:1` in any rung).
- **Suite totals:** 6 test files / 112 tests (was 4 files / 72; +2 files / +40 tests). All green.
- `npm run check` → 0 errors, 0 warnings. `npm run build` → clean 62.29 kB JS bundle.
- ⚠ LO3 source conflict noted (Dev Notes §LO3 reconciliation): modeled as pot=40/bet=10 → ratio [5,1] / requiredEquity 16.7 / decision call. Pending Meakel confirmation before 3.2/3.8 as flagged in Change Log.

### File List

- `pokermath/src/lib/assessment/types.ts` — NEW
- `pokermath/src/content/scenarios.ts` — NEW
- `pokermath/src/content/hintLadders.ts` — NEW
- `pokermath/src/content/scenarios.test.ts` — NEW
- `pokermath/src/content/hintLadders.test.ts` — NEW

## Change Log

- 2026-05-30: Story 3.1 created — ready-for-dev. Flagged LO3 source conflict (pot/bet amounts vs stated 16.7% required equity); resolved to pot=40/bet=10 (ratio 5:1, required 16.7) for internal consistency + pedagogical soundness — pending Meakel confirmation before 3.2/3.8.
- 2026-05-30: Implementation complete — 5 new files, 112 tests green, check+build clean. Status → review.
