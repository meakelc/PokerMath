---
baseline_commit: 45098b4
---

# Story 3.2: Validation engine with unit tests

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want my computed answers checked accurately with sensible tolerance,
So that a right answer passes and a near-miss on an approximation still counts.

## Acceptance Criteria

**AC1 — Pure validate() returning per-field + overall result (AR-4, FR-11)**
**Given** `src/lib/assessment/validation.ts`
**When** `validate(...)` runs
**Then** it returns a `ValidationResult` with per-field correctness (`perField`) and overall pass/fail (`passed`), importing nothing from Svelte

**AC2 — Exact-valued fields require exact correctness (FR-11)**
**Given** exact-valued fields (`outs`, `streets`, pot-odds `ratio`)
**When** validated
**Then** they pass only on exact correctness (off-by-one outs fails; a non-identical ratio tuple fails)

**AC3 — Rule-of-2-and-4 equity field passes within ±3 pp (FR-11, LDR-4)**
**Given** the `equity` field
**When** validated
**Then** any value within `±EQUITY_TOLERANCE_PP` of the `AnswerKey.equity` value passes — for the LO1 9-out scenario (equity 36) the accepted band is **33–39% inclusive**; 32 and 40 fail

**AC4 — LO2 pot-odds pass via `cost/(pot+cost)` (FR-11)**
**Given** the LO2 scenario
**When** validated
**Then** ratio `5:1` passes exactly and required equity in the **16–17% band** passes (covering `cost/(pot+cost)` = 10/60 ≈ 16.7); 20% (the denominator error) fails

**AC5 — Co-located tests cover all three cases (AR-4)**
**Given** co-located `src/lib/assessment/validation.test.ts`
**When** `npm run test` runs
**Then** exact-field, ±3pp-band, and 5:1 / 16.7% cases are covered and pass

## Tasks / Subtasks

- [x] **Task 1: Create `src/lib/assessment/validation.ts` — the pure validation engine (AC: #1–#4)**
  - [x] **New file:** `pokermath/src/lib/assessment/validation.ts`. This is the second file in the pure-logic firewall (`types.ts` already exists from 3.1). **It imports nothing from Svelte, nothing from a component, nothing from the store, and nothing from `src/content/`** (AR-4, architecture.md:449-452). The only imports are the type/constant from `./types`. [Source: architecture.md:407-412, 449-452]
  - [x] **Imports:**
    ```ts
    import type { AnswerKey, FieldId, Ratio, ValidationResult } from './types'
    import { EQUITY_TOLERANCE_PP } from './types'
    ```
    `EQUITY_TOLERANCE_PP` is the single source for the equity band — **do NOT re-hardcode `3`** (architecture.md:264; 3.1 created the constant for exactly this consumer). [Source: types.ts:44]
  - [x] **Define the engine's input contract `SubmittedAnswers`** — the shape the UI hands to `validate()`. Numeric/ratio fields arrive as **strings** (the store/`NumericInput` holds raw field text — architecture.md:320 `assessment.fields.outs = '9'`); `decision` arrives as the already-discrete `Decision` union from `CallFoldToggle`. Define it **here in `validation.ts`** (not in `types.ts` — keep the done 3.1 deliverable frozen):
    ```ts
    import type { Decision } from './types'
    /** Raw learner input as captured by the input primitives (Story 3.4). */
    export type SubmittedAnswers = {
      outs?: string
      streets?: string
      equity?: string
      ratio?: [string, string] // [antecedent, consequent] from RatioInput
      requiredEquity?: string
      decision?: Decision      // from CallFoldToggle — already 'call' | 'fold'
    }
    ```
  - [x] **Define the required-equity accept band** as a named module constant (addresses the 3.1 review note that no `REQUIRED_EQUITY` band existed — contrast with `EQUITY_TOLERANCE_PP`). Keep it in `validation.ts`:
    ```ts
    /** Accept window (percent) for the cost/(pot+cost) required-equity field — covers 10/60 ≈ 16.7 and learner rounding to 16 or 17 (FR-11). */
    export const REQUIRED_EQUITY_BAND: readonly [number, number] = [16, 17]
    ```
  - [x] **Signature — answer-key-driven, fully pure:**
    ```ts
    export function validate(answer: AnswerKey, submitted: SubmittedAnswers): ValidationResult
    ```
    **Rationale (READ — slight, deliberate divergence from the architecture shorthand):** architecture.md:368/497 writes `validate(scenario, answers)`. The correctness-bearing half of a scenario is its `AnswerKey`, and the engine must NOT import `content/scenarios.ts` (that is a reverse dependency across the content→engine boundary — architecture.md:458-460). Passing the `AnswerKey` keeps the engine pure and free of any unused parameter. The caller (`AssessmentScreen`, Stories 3.6–3.8) has `assessments[lo] = { scenario, answer }` in hand and calls `validate(assessments[lo].answer, submitted)`. `scenario` is intentionally **not** a parameter — `validate` needs nothing from it; `detectError()` in Story 3.3 takes the scenario separately. [Source: architecture.md:449-452, 458-460, 489-490]
  - [x] **Field-by-field rules (the heart of the engine):**
    - **`outs` / `streets` — exact integer match.** `parseNum(submitted.outs) === answer.outs`. (AC2, FR-11)
    - **`equity` — ±`EQUITY_TOLERANCE_PP` band, inclusive.** `Math.abs(parseNum(submitted.equity) - answer.equity) <= EQUITY_TOLERANCE_PP`. For equity 36 → [33, 39] inclusive; 32/40 fail. (AC3, FR-11, LDR-4)
    - **`ratio` — exact tuple match.** Both members must match the stored `Ratio`: `parseNum(r[0]) === answer.ratio[0] && parseNum(r[1]) === answer.ratio[1]`. `[5,1]` passes; `[5,2]`, `[1,5]`, **and the unreduced-equivalent `[50,10]`** fail under FR-11 "exact." (AC2, AC4) — see Dev Notes §"Ratio exactness (flagged)".
    - **`requiredEquity` — `REQUIRED_EQUITY_BAND` inclusive.** `v >= 16 && v <= 17`. 16.7 / 16 / 17 pass; 20 (denominator error) and 15 fail. (AC4, FR-11)
    - **`decision` — exact string match.** `submitted.decision === answer.decision`. (AC2)
  - [x] **Drive off the answer key, not a fixed field list.** Build `perField` by iterating only the `FieldId`s **present in `answer`** (LO1 has no `ratio`/`requiredEquity`/`decision` — its `perField` must NOT contain them). A scenario's answer key is the authority on which fields are required. [Source: types.ts:34-41 — `AnswerKey` fields all optional]
  - [x] **`passed` = every present field correct.** `passed = Object.values(perField).every(Boolean)` over the keys derived from `answer`. An empty answer key would be vacuously `true` — not a real case, but keep the reduction honest.
  - [x] **`hint` is left `undefined` here.** `ValidationResult.hint` is populated by the hint engine in Story 3.3 (`detectError()` consumes the failing result). `validate()` only decides correctness — it never selects a hint. (AR-4 separation; architecture.md:411 hints.ts is a separate module)
  - [x] **Defensive numeric parse — never throw (architecture.md:330-332).** A wrong answer is a *returned result, never an exception*. Use a small helper:
    ```ts
    function parseNum(s: string | undefined): number {
      if (s == null || s.trim() === '') return NaN
      return Number(s)
    }
    ```
    `NaN` compared with `===`/`<=` yields `false` → the field is simply marked incorrect. Whitespace is trimmed so `' 9 '` passes. Empty/undefined → `NaN` → incorrect (CheckAnswer is disabled until all fields are filled, so this is a guard, not a normal path — architecture.md:339). **Do not** let `Number('')===0` slip a false pass through.
  - [x] **No content import, no Svelte import, no store import.** Confirm by `npm run check` (Svelte import in this folder is an AR-4 violation). [Source: architecture.md:360, 449-452]

- [x] **Task 2: Author the engine unit tests (the prime test target — AR-4) (AC: #1–#5)**
  - [x] **New file:** `pokermath/src/lib/assessment/validation.test.ts` — Vitest, `import { describe, it, expect } from 'vitest'`, mirroring `content/scenarios.test.ts` / `lib/cards.test.ts` style. node-env is fine (pure TS, no Svelte render). [Source: scenarios.test.ts:1; 3.1 Dev Notes §"node-env" — constraint bites only `.svelte` rendering]
  - [x] **Import the real answer keys** to validate against the canonical data (proves the engine + data agree): `import { assessments } from '../../content/scenarios'` and `import { validate } from './validation'`. Using the real keys (not hand-built fixtures) is the integration guarantee the AC implies ("the LO2 scenario … 5:1 and 16.7%"). [Source: scenarios.ts:46]
  - [x] **LO1 — exact + equity band (AC2, AC3):**
    - Correct: `validate(assessments.lo1.answer, { outs:'9', streets:'2', equity:'36' })` → `passed === true`; `perField` is exactly `{ outs:true, streets:true, equity:true }` (assert no `ratio`/`decision` key present).
    - Equity band edges: equity `'33'` → pass, `'39'` → pass, `'32'` → fail, `'40'` → fail, `'36'` → pass (assert via `perField.equity` and `passed`).
    - Exact outs: `'8'` fail, `'10'` fail, `'9'` pass.
    - Exact streets: `'1'` fail, `'2'` pass.
    - One-field-wrong → `passed === false` while the other two `perField` entries stay `true`.
  - [x] **LO2 — ratio + required equity (AC4):**
    - Correct: `validate(assessments.lo2.answer, { ratio:['5','1'], requiredEquity:'16.7' })` → `passed`, `perField === { ratio:true, requiredEquity:true }`.
    - Required-equity band: `'16'` pass, `'17'` pass, `'16.7'` pass, `'20'` fail (the denominator error), `'15'` fail.
    - Ratio exactness: `['5','1']` pass; `['5','2']` fail; `['1','5']` (inverted) fail; `['50','10']` (unreduced equivalent) fail.
  - [x] **LO3 — full synthesis (AC2, AC3, AC4):**
    - Correct: `validate(assessments.lo3.answer, { equity:'36', ratio:['5','1'], requiredEquity:'16.7', decision:'call' })` → `passed`, all four `perField` true.
    - `decision:'fold'` → `perField.decision === false`, `passed === false`.
    - equity `'33'`/`'39'` still pass within the band (same ±3pp rule applies in the climax).
  - [x] **Robustness / convention:**
    - Whitespace: `{ outs:'  9  ' }` (with the rest correct) → outs passes.
    - Non-numeric: `equity:'abc'` → `perField.equity === false`, no throw.
    - Empty: `outs:''` → `perField.outs === false`, no throw.
    - `EQUITY_TOLERANCE_PP` is honored, not a literal `3`: assert the band uses the imported constant (e.g. compute `36 - EQUITY_TOLERANCE_PP` and `36 + EQUITY_TOLERANCE_PP` as the pass edges in the test so a future constant change keeps the test meaningful).
  - [x] **Do NOT** test hint selection here — `validate()` returns `hint: undefined`; hint-ladder behavior is Story 3.3's `hints.test.ts`. Optionally assert `result.hint === undefined` to lock the boundary.

- [x] **Task 3: Verify (AC: #1–#5)**
  - [x] `npm run check` → 0 errors / 0 warnings. Confirms: no Svelte/content/store import in `validation.ts`; `SubmittedAnswers`/`ValidationResult` thread through; `perField: Partial<Record<FieldId, boolean>>` typing holds.
  - [x] `npm run test -- --run` → all prior suites green **plus** the new `validation.test.ts`. Prior total was **6 files / 112 tests** (end of Story 3.1) → expect **7 files** now. Record the new totals.
  - [x] `npm run build` → clean static `dist/` (AR-8). (Pure logic, negligible bundle delta.)
  - [x] **No manual/visual pass** — this story ships zero UI. Verification is `check` + `test` + `build` green.
  - [x] Record suite totals + any deviations in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 3.2 builds the **correctness half** of the pure assessment engine. **This story DOES:**
- Create `src/lib/assessment/validation.ts` — `validate(answer, submitted): ValidationResult`, pure (no Svelte/content/store import).
- Define the `SubmittedAnswers` input contract + the `REQUIRED_EQUITY_BAND` constant (both in `validation.ts`).
- Create co-located `src/lib/assessment/validation.test.ts` — the prime, mandated engine test suite (AR-4).

**This story does NOT:**
- Write `hints.ts` / `detectError()` or hint selection — Story **3.3**. `validate()` returns `hint: undefined`.
- Build any screen, input primitive, feedback row, or store field — Stories **3.4 / 3.5**.
- Touch `appState.svelte.ts`, `App.svelte`, or any component.
- Modify `types.ts`, `scenarios.ts`, or `hintLadders.ts` (the 3.1 deliverables) — import them read-only.
- Add any npm dependency (AR-1 stack is locked: Svelte 5 / TS / Vite / Vitest).

### The engine contract — what `validate` consumes and returns

- **Input `answer: AnswerKey`** — the canonical correct values from `assessments[lo].answer` (3.1). Only the fields a scenario uses are present (LO1: `outs/streets/equity`; LO2: `ratio/requiredEquity`; LO3: all four of `equity/ratio/requiredEquity/decision`). [Source: scenarios.ts:15,29,43]
- **Input `submitted: SubmittedAnswers`** — raw learner text per field (strings), `decision` as the discrete `'call'|'fold'` union. Defined in `validation.ts`. The store (3.4) will conform to this shape.
- **Output `ValidationResult`** (from `types.ts:64-69`): `{ perField: Partial<Record<FieldId, boolean>>, passed: boolean, hint?: HintRung }`. This story sets `perField` + `passed`; leaves `hint` undefined.
- **`perField` includes only answer-key fields** — `Partial<Record<…>>` was chosen in 3.1 precisely so LO1 carries no meaningless `ratio:false`. Iterate the keys present in `answer`. [Source: 3.1 story line 116 — refinement of architecture shorthand]

### Tolerance rules — the exact numbers

| Field | Rule | Source of band | LO1 (eq 36) | LO2 / LO3 |
|---|---|---|---|---|
| `outs` | exact `===` | — | 9 only | — |
| `streets` | exact `===` | — | 2 only | — |
| `equity` | `|v − key| ≤ EQUITY_TOLERANCE_PP` | `types.ts` const (=3) | 33–39 incl. | LO3: 33–39 incl. |
| `ratio` | exact tuple `===` both members | — | — | `[5,1]` only |
| `requiredEquity` | `16 ≤ v ≤ 17` | `REQUIRED_EQUITY_BAND` (new, this story) | — | 16–17 incl. |
| `decision` | exact `===` | — | — | LO3: `'call'` only |

- **Equity band is inclusive at both edges** (33 and 39 pass) — the AC says "within ±3 pp … e.g., 33–39%". Use `<=`, not `<`.
- **Required-equity band `[16,17]`** is the AC's "16–17%" window. It comfortably accepts the textbook `10/60 = 16.67` and a learner who rounds to 16 or 17, while rejecting the classic **denominator error** `10/50 = 20%` (the LO2 `denominator-error` hint target — 3.1 scenarios.ts:137). Defining it as a named constant closes the 3.1 review gap ("no `REQUIRED_EQUITY_TOLERANCE_BAND` … contrast with `EQUITY_TOLERANCE_PP`", 3.1 line 221). [Source: epics.md:501; scenarios.ts Dev Notes on 10/60]

### Ratio exactness (flagged — confirm before 3.7 if it bites)

FR-11 lists `ratio` under **exact-valued fields**, so this story validates `ratio` by exact tuple match against the stored `[5,1]`. Consequence: a learner who enters the mathematically-equivalent **unreduced** form `50:10` or `10:2` is marked **incorrect** even though the pot odds are identical. This is the literal reading of "exact correctness (FR-11)" and is what the tests assert.

**Surface to Meakel if 3.7 (LO2 assessment) UX testing shows learners entering unreduced ratios:** an alternative is "equivalent-ratio" acceptance — pass when `a/b === key[0]/key[1]` (i.e. `a*key[1] === b*key[0]`, guarding `b !== 0`). That is a small, localized change to the `ratio` rule only and would not alter any other field. Current implementation intentionally takes the strict reading; the equivalent-ratio softening is a one-line swap if desired. No action needed now — recorded so 3.7 doesn't rediscover it cold.

### Why `validate(answer, submitted)` and not `validate(scenario, answers)`

The architecture's `validate(scenario, answers)` (architecture.md:368, 497) is shorthand. Two hard constraints shape the real signature:
1. **Engine purity / no reverse dependency (AR-4, architecture.md:458-460):** `validation.ts` must not import `content/scenarios.ts`. So it cannot look the answer key up internally from a bare `scenario` — the key must be **passed in**.
2. **No unused parameters:** `validate` reads nothing from `scenario` (cards/prompt/pot/bet are irrelevant to comparing submitted values against stored answers; `requiredEquity` is compared to a band, not recomputed from pot/bet). Including `scenario` purely for signature-fidelity would be dead weight a reviewer flags.

So the engine takes the `AnswerKey` (the correctness-bearing half of the `ScenarioWithKey` pair). Callers already hold `assessments[lo]` and pass `.answer`. Story 3.3's `detectError()` will take the `scenario` (it needs pot/bet/cards to classify errors) — that is a separate function, separate signature. [Source: architecture.md:449-452, 489-490]

### Pure-logic firewall (AR-4) — non-negotiable

`src/lib/assessment/` is the framework-free, unit-testable core. `validation.ts`:
- imports **only** from `./types` (a type-only + one constant import);
- imports **nothing** from `svelte`, a `.svelte` component, `appState.svelte.ts`, or `src/content/`;
- **throws nothing** on bad input — a wrong/empty/garbage answer is a returned `ValidationResult` with `false` fields (architecture.md:330-332).
The test file may import `content/scenarios.ts` (tests are not the firewall — they exercise the engine against real data). The engine module itself may not. [Source: architecture.md:449-452; types.ts:1 is the only-allowed import shape]

### Previous-work intelligence (3.1 → 3.2 continuity)

- **`types.ts` is done and frozen** — `AnswerKey`, `FieldId`, `Ratio`, `ValidationResult`, `EQUITY_TOLERANCE_PP` (=3) are all defined and shipped. Import them; do **not** redefine or edit `types.ts`. [Source: types.ts:1-69]
- **`scenarios.ts` answer keys are the canonical fixtures** — `assessments.lo1.answer = {outs:9,streets:2,equity:36}`, `lo2 = {ratio:[5,1],requiredEquity:16.7}`, `lo3 = {equity:36,ratio:[5,1],requiredEquity:16.7,decision:'call'}`. Test against these, not hand-rolled copies. [Source: scenarios.ts:15,29,43]
- **`EQUITY_TOLERANCE_PP` exists for this exact consumer** — 3.1 deliberately put the band constant in `types.ts` "the validation engine (3.2) imports it; do not re-hardcode `3`". Honor that. [Source: 3.1 story line 264]
- **`as const satisfies` typed-data idiom** is the house style (scenarios.ts:46, cheatsheets.ts) — not needed for the engine functions, but match the project's TS strictness (no `any`, explicit return types on exports).
- **Co-located test pattern + Vitest import style** — mirror `scenarios.test.ts:1` / `cards.test.ts` exactly. [Source: scenarios.test.ts:1-3]
- **LO3 data assumes the pot=40/bet=10 reconciliation** (3.1 flagged the FR-10 "$40 all-in" source conflict, resolved to ratio `[5,1]`/required `16.7`). This story inherits that resolution unchanged — the engine just validates whatever the answer key holds. If Meakel later flips LO3 to pot=40/bet=40 (ratio `[2,1]`, required ≈33.3), **only the data changes**; `validation.ts` and `REQUIRED_EQUITY_BAND` would need a revisit then (the band `[16,17]` is coupled to the 16.7 answer). [Source: 3.1 story Dev Notes §"LO3 source-conflict reconciliation", lines 243-255]
- **Commit cadence:** `feat(3.2): …` on `main`; baseline is `45098b4` (the 3.1 commit).

### Reference: how 3.3 / 3.4–3.8 consume this (context, not scope — do not implement here)

- **3.3 `hints.ts`** → after `validate()` returns `passed:false`, `detectError(scenario, submitted, answer)` classifies the likely error and fills `ValidationResult.hint`. `validate()` and `detectError()` are separate pure functions; `AssessmentScreen` orchestrates both.
- **3.4 store/inputs** → `appState.svelte.ts` assessment state holds field strings conforming to `SubmittedAnswers`; `CheckAnswerButton` calls `validate(assessments[lo].answer, submitted)` only on click (never on keystroke — architecture.md:336-339).
- **3.5 `FeedbackRow`** → renders hint (wrong) vs success (all `perField` true) from the `ValidationResult`; no per-field red (architecture.md:344-345).
- **3.6–3.8 screens** → pass `assessments[lo].answer` into `validate`; success marks the Section ✓ (session-only).

### Project Structure Notes

- `validation.ts` + `validation.test.ts` land exactly where the architecture tree places them: `src/lib/assessment/` (architecture.md:407-412). No structural variance. The sibling `hints.ts`/`hints.test.ts` remain deferred to 3.3.
- `SubmittedAnswers` and `REQUIRED_EQUITY_BAND` live in `validation.ts` (not `types.ts`) to keep the done 3.1 contract module frozen; both could migrate to `types.ts` in a later consolidation if desired — noted, not required.

### File changes summary

2 new files, 0 modified:
- `pokermath/src/lib/assessment/validation.ts` — **NEW** (pure `validate()` + `SubmittedAnswers` + `REQUIRED_EQUITY_BAND`; imports only `./types`)
- `pokermath/src/lib/assessment/validation.test.ts` — **NEW** (exact-field, ±3pp-band, 5:1 / 16.7% coverage against the real `assessments` keys)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.2] — story statement + ACs (lines 479-505)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-11 answer checking + tolerance + `cost/(pot+cost)` (102, 502); FR-8/9/10 scenarios (99-101); LDR-4 compute-don't-recognize (108); LDR-5 non-revealing (deferred to 3.3)
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-4 pure engine firewall (449-452), AR-7 contracts (307-314); validation timing / no-keystroke (336-339); feedback-is-returned-not-thrown (330-332); no per-field red (344-345); content boundary / no reverse import (458-460); enforcement (353-361); directory tree (407-412); `validate(...)` pattern (368, 489-490, 497)
- [Source: pokermath/src/lib/assessment/types.ts:1-69] — `AnswerKey`, `FieldId`, `Ratio`, `ValidationResult`, `Decision`, `EQUITY_TOLERANCE_PP` (import, do not edit)
- [Source: pokermath/src/content/scenarios.ts:15,29,43,46] — canonical `assessments` answer keys to validate against in tests
- [Source: pokermath/src/content/scenarios.test.ts:1-3] — co-located Vitest data-test style to mirror
- [Source: pokermath/src/lib/cards.ts:1-21] — `Card`/`parseCard` (transitive via types; no direct use expected in the engine)
- [Source: _bmad-output/implementation-artifacts/3-1-assessment-data-contracts-scenarios-hint-ladders.md] — prior-story conventions (frozen types.ts, EQUITY_TOLERANCE_PP intent line 264, LO3 reconciliation 243-255, REQUIRED_EQUITY band gap line 221, node-env test constraint, commit cadence)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean implementation, no debugging required.

### Completion Notes List

- Implemented `validation.ts` as a pure engine: imports only `./types`, zero Svelte/content/store imports. AR-4 firewall intact (confirmed by `npm run check` → 0 errors, 0 warnings).
- `SubmittedAnswers` type and `REQUIRED_EQUITY_BAND [16,17]` constant defined in `validation.ts` (not `types.ts`) to keep the 3.1 deliverable frozen.
- `parseNum()` helper returns `NaN` on empty/undefined/non-numeric → field marked incorrect, never throws.
- `perField` built by iterating only keys present in `answer` — LO1 result contains no `ratio`/`decision`/`requiredEquity` entries.
- `validate()` leaves `hint: undefined`; hint ladder deferred to Story 3.3.
- `validation.test.ts` imports the real `assessments` answer keys (not hand-rolled fixtures), proving engine + data agreement.
- Equity band tests driven by `EQUITY_TOLERANCE_PP` constant, not literal `3` — future constant changes keep tests meaningful.
- `REQUIRED_EQUITY_BAND` edges tested explicitly (16 pass, 17 pass, 15 fail, 18 fail).
- Suite totals: baseline was 6 files / 114 tests (story spec cited 112 — minor deviation, 2 extra pre-existing tests); final is **7 files / 146 tests** (+32 new tests, 0 regressions).
- `npm run build` → clean 62 kB bundle, negligible delta from pure-TS addition.

### File List

- `pokermath/src/lib/assessment/validation.ts` — NEW
- `pokermath/src/lib/assessment/validation.test.ts` — NEW

### Review Findings

- [x] [Review][Defer] `answer.requiredEquity` is never read by `validate()` — band always uses hardcoded `REQUIRED_EQUITY_BAND [16,17]` [`validation.ts:44`] — deferred, intentional design per spec Dev Notes; `answer.requiredEquity` stores canonical display value (used by 3.3 `detectError()`), not the validation boundary. If a future scenario changes `requiredEquity` away from ~16.7, `REQUIRED_EQUITY_BAND` must be updated in tandem.

## Change Log

- 2026-05-30: Story 3.2 implemented — `validation.ts` + `validation.test.ts` shipped. 32 new tests (7 files / 146 total). check/test/build all green. Status → review.
- 2026-05-30: Story 3.2 created — ready-for-dev. Engine contract decided: `validate(answer: AnswerKey, submitted: SubmittedAnswers): ValidationResult`, pure (imports only `./types`), `hint` left undefined for 3.3. Defined `SubmittedAnswers` (string fields) + `REQUIRED_EQUITY_BAND [16,17]` in `validation.ts` (closes 3.1 review gap line 221). Flagged: ratio validated by exact-tuple match per FR-11 — unreduced equivalents (`50:10`) fail; equivalent-ratio softening offered for confirmation if 3.7 UX testing warrants. Inherits 3.1's LO3 pot=40/bet=10 reconciliation unchanged.
