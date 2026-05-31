---
baseline_commit: 3145433
---

# Story 3.3: Hint-selection engine with unit tests

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a wrong answer to point at my likely mistake and get more pointed if I keep missing,
so that I can recover without being handed the answer.

## Acceptance Criteria

**AC1 — Error classification + next-rung selection on an incorrect submission (FR-12, AR-4, LDR-5)**
**Given** `src/lib/assessment/hints.ts`
**When** a submission is incorrect
**Then** the engine identifies the likely `ErrorType` for that scenario and returns the next escalating `HintRung` (`{ errorType, rung, text }`) for that error, importing nothing from Svelte, the store, or `src/content/`

**AC2 — Same error type escalates one rung at a time, never revealing the answer (FR-12, UX-DR17)**
**Given** repeated wrong submissions classified as the **same** error type
**When** each is checked
**Then** the returned rung advances by exactly one (`prev.rung + 1`), clamped at the last rung of that ladder, and no returned text states the final answer value

**AC3 — Error-type change between attempts switches ladders and resets to its first rung (UX-DR17)**
**Given** a submission whose detected error type **differs** from the previous attempt's
**When** checked
**Then** the engine switches to the new error's ladder and returns its **rung 0** (escalation restarts per error type)

**AC4 — Co-located tests: each error type maps to its correct ladder rung and no rung leaks the answer (AR-4)**
**Given** co-located `src/lib/assessment/hints.test.ts`
**When** `npm run test` runs
**Then** every authored `ErrorType` resolves to the expected rung text, escalation + ladder-switch behavior is covered, and an assertion proves no rung in any ladder contains the scenario's final answer value (equity `36`, requiredEquity `16.7`, ratio `5:1`)

## Tasks / Subtasks

- [x] **Task 1: (Pre-req) Export the shared numeric parser from `validation.ts` (AC: #1)**
  - [x] **Modify (1 line, additive):** `pokermath/src/lib/assessment/validation.ts`. Change `function parseNum(...)` to `export function parseNum(...)`. **Rationale — this is correctness, not just DRY:** the hint engine's error-detection math (`equity ≈ outs × 2`, `requiredEquity ≈ bet/(pot+bet)`) must parse learner strings with **identical semantics** to `validate()`. If `hints.ts` re-implemented its own parse and the two ever diverged (e.g. trimming, `NaN` handling), detection and validation could disagree on the same input — a silent, ugly class of bug. One parser, one truth. [Source: validation.ts:17-20]
  - [x] This is the **only** edit to a previously-"done" file. It is purely additive (adds an `export` keyword); `validation.ts` behavior and `validation.test.ts` are unaffected. Confirm by re-running `validation.test.ts` (Task 4) — it must stay green. Do **not** touch any other line of `validation.ts`, `types.ts`, `scenarios.ts`, or `hintLadders.ts`. [Source: 3.2 story §"Scope boundary" — 3.1/3.2 deliverables frozen except this sanctioned export]

- [x] **Task 2: Create `src/lib/assessment/hints.ts` — the pure hint engine (AC: #1, #2, #3)**
  - [ ] **New file:** `pokermath/src/lib/assessment/hints.ts`. This is the **third and final** file in the pure-logic firewall (`types.ts`, `validation.ts` already exist). **It imports nothing from Svelte, nothing from a component, nothing from the store, and nothing from `src/content/`.** Allowed imports only: types/constant from `./types`, and `parseNum` from `./validation`. [Source: architecture.md:449-452; 3.2 story §"Pure-logic firewall"]
  - [ ] **Imports:**
    ```ts
    import type { AnswerKey, ErrorType, HintLadder, HintRung, Scenario } from './types'
    import { EQUITY_TOLERANCE_PP } from './types'
    import type { SubmittedAnswers } from './validation'
    import { parseNum } from './validation'
    ```
    Reuse `SubmittedAnswers` (defined in `validation.ts` by 3.2) — do **not** redefine the input contract. `ErrorType`, `HintRung`, `HintLadder` already exist in `types.ts` from 3.1 — import, do not redefine. [Source: types.ts:46-62; validation.ts:5-12]
  - [ ] **Detection tolerance constant** (named, not a literal — mirrors the 3.2 `REQUIRED_EQUITY_BAND` convention):
    ```ts
    /** Half-window (pp) for matching a submitted value to a *canonical mistake* signature during error classification (e.g. the 20% denominator error). */
    export const DETECT_TOLERANCE_PP = 3
    ```
  - [ ] **`detectError()` — the named contract function, pure classification (AR-4, architecture.md:489).** Signature:
    ```ts
    export function detectError(
      scenario: Scenario,
      answer: AnswerKey,
      submitted: SubmittedAnswers,
    ): ErrorType | null
    ```
    Returns the **likely** error type (heuristic — the AC says "likely"), or `null` when nothing is misclassifiable (e.g. an all-correct submission, or an LO with no detectable signature). Switch on `scenario.lo`. Per-LO rules below. Compare every learner value through the shared `parseNum` (Task 1). [Source: architecture.md:489-490; 3.2 story line 176 "detectError() will take the scenario"]
    - **LO1** (`answer = { outs:9, streets:2, equity:36 }`; precedence = upstream cause first):
      1. `outs` wrong (`parseNum(submitted.outs) !== answer.outs`) → **`'miscounted-outs'`** — the outs count is the upstream input; correct it before the multiplier.
      2. else if `streets` wrong **or** `equity` wrong (`|parseNum(equity) − answer.equity| > EQUITY_TOLERANCE_PP`) → **`'wrong-multiplier'`** — streets/equity errors are the multiplier family (e.g. `9×2=18` instead of `9×4=36`; the equity-band reuse keeps the "wrong" boundary identical to `validate()`).
      3. else → `null`.
    - **LO2** (`answer = { ratio:[5,1], requiredEquity:16.7 }`; `scenario.pot=40`, `scenario.bet=10`):
      - Compute the **denominator-error signature** from the scenario, not a literal: `denomErrVal = scenario.bet! / (scenario.pot! + scenario.bet!) * 100` → `10/50*100 = 20`. (This is the `10/50` mistake — forgetting your own call in the denominator. Computing it from `pot`/`bet` keeps the engine data-driven if the scenario ever changes.)
      - `reqWrong = !(parseNum(submitted.requiredEquity) >= 16 && ... <= 17)` — **reuse the same 16–17 band `validate()` uses** so detection and validation agree on "wrong." Import the band: add `import { REQUIRED_EQUITY_BAND } from './validation'` and test `v >= REQUIRED_EQUITY_BAND[0] && v <= REQUIRED_EQUITY_BAND[1]`.
      - `ratioWrong = !(parseNum(r?.[0]) === answer.ratio![0] && parseNum(r?.[1]) === answer.ratio![1])` (same exact-tuple rule as `validate()`).
      - Precedence:
        1. `reqWrong && |parseNum(requiredEquity) − denomErrVal| <= DETECT_TOLERANCE_PP` → **`'denominator-error'`** (the canonical ~20% mistake).
        2. else if `ratioWrong` → **`'ratio-percentage-confusion'`** (the ratio field is off — the learner conflated the ratio and the percentage).
        3. else if `reqWrong` → **`'denominator-error'`** (requiredEquity wrong by some other amount — the denominator family is the closest authored coaching).
        4. else → `null`.
    - **LO3** (`answer = { equity:36, ratio:[5,1], requiredEquity:16.7, decision:'call' }`): the authored ladder for LO3 is **`wrong-comparison-direction` only** (hintLadders.ts:28-34). LO3 is the synthesis/decision step; its coaching is "line up your two numbers and compare." So: **any** incorrect LO3 submission → **`'wrong-comparison-direction'`**. (Whether the decision is wrong, or the decision is right but a computed input is off, the comparison hint is the available, on-point coaching.) Return `null` only if the submission is actually all-correct. See Dev Notes §"LO3 detection scope + flagged gap."
  - [ ] **`selectHint()` — the orchestrator the UI calls; owns escalation (AC2, AC3).** Signature (caller passes the content-sourced ladder in — engine never imports `content/`):
    ```ts
    export function selectHint(
      ladder: HintLadder,         // hintLadders[scenario.lo], sourced by the caller from content/
      scenario: Scenario,
      answer: AnswerKey,
      submitted: SubmittedAnswers,
      prev: HintRung | null,      // the previously-shown rung from the store (Story 3.4/3.5), or null on first miss
    ): HintRung | null
    ```
    Body:
    1. `const errorType = detectError(scenario, answer, submitted)`.
    2. `if (errorType == null) return null` — nothing to coach (e.g. correct submission).
    3. `const rungs = ladder[errorType]` — **guard the `Partial` lookup:** `if (rungs == null || rungs.length === 0) return null` (an `ErrorType` with no authored rungs for this LO yields no hint rather than crashing — closes the 3.1 deferred-work note: "3.3 hint engine must guard against `undefined` when an error type is not defined for a given LO").
    4. Escalation:
       ```ts
       const rung =
         prev == null || prev.errorType !== errorType
           ? 0                                          // first miss OR error type changed → rung 0 (AC3)
           : Math.min(prev.rung + 1, rungs.length - 1)  // same error → escalate one, clamp at top (AC2)
       ```
       The `Math.min(..., rungs.length - 1)` clamp closes the 3.1 deferred-work note ("3.3 must clamp rung index to ladder array length before indexing"). Once at the deepest rung, repeated same-error misses **stay** on the last rung (no out-of-bounds, no answer-reveal).
    5. `return { errorType, rung, text: rungs[rung] }`.
  - [ ] **Why two functions (`detectError` + `selectHint`) and not one (read — deliberate divergence from the AC's single-`detectError()` phrasing):** AC1 reads as "`detectError()` identifies the error type **and** selects the next rung." Folding classification + escalation + ladder lookup into one function named `detectError` would (a) make `detectError` impure-feeling (it would need the ladder and the prior rung), and (b) be hard to unit-test in isolation (AC4 wants "each error type maps to the correct ladder rung" — that is cleanest tested against a pure classifier). So `detectError` stays a **pure classifier** (the architecture's named contract, architecture.md:489) and `selectHint` is the escalation-aware orchestrator the UI calls. This mirrors the 3.2 precedent of documenting a slight, intentional contract refinement (`validate(answer, …)` vs the architecture shorthand `validate(scenario, …)`). [Source: 3.2 story §"Why validate(answer, submitted)…"; architecture.md:587-589 — signatures are contracts, finalized at implementation]
  - [ ] **`HintRung` is the carried escalation state — no new type needed.** The store (3.4/3.5) already holds "current hint rung, detected error type" (architecture.md:201) — that is exactly a `HintRung`. `selectHint` reads `prev?.errorType`/`prev?.rung` and returns the next `HintRung`; the store persists it. Do **not** invent a separate `HintState` type. [Source: types.ts:55-59; architecture.md:201]
  - [ ] **Throws nothing.** A garbage/empty submission yields a returned `HintRung` or `null`, never an exception (same firewall rule as `validate()` — architecture.md:330-332). `parseNum` already returns `NaN` (→ comparisons `false`) on bad input.

- [x] **Task 3: Author the engine unit tests (AR-4 prime target) (AC: #1–#4)**
  - [ ] **New file:** `pokermath/src/lib/assessment/hints.test.ts` — Vitest, `import { describe, it, expect } from 'vitest'`, mirroring `validation.test.ts` style exactly (node-env, no Svelte render). [Source: validation.test.ts:1-4]
  - [ ] **Import real data, pass it in** (the integration guarantee — engine + authored data agree): `import { assessments } from '../../content/scenarios'`, `import { hintLadders } from '../../content/hintLadders'`, `import { detectError, selectHint, DETECT_TOLERANCE_PP } from './hints'`. The test file may import `content/` (tests are not the firewall); the engine module may not. [Source: 3.2 story §"Pure-logic firewall" — test exception]
  - [ ] **`detectError()` classification (AC1):**
    - LO1: `{ outs:'8', streets:'2', equity:'36' }` → `'miscounted-outs'`; `{ outs:'9', streets:'2', equity:'18' }` (×2 mistake) → `'wrong-multiplier'`; `{ outs:'9', streets:'1', equity:'36' }` (streets wrong) → `'wrong-multiplier'`; all-correct `{ outs:'9', streets:'2', equity:'36' }` → `null`.
    - LO2: `{ ratio:['5','1'], requiredEquity:'20' }` (10/50) → `'denominator-error'`; `{ ratio:['16','7'], requiredEquity:'16.7' }` (ratio garbled, req ok) → `'ratio-percentage-confusion'`; all-correct `{ ratio:['5','1'], requiredEquity:'16.7' }` → `null`.
    - LO3: `{ equity:'36', ratio:['5','1'], requiredEquity:'16.7', decision:'fold' }` (wrong decision) → `'wrong-comparison-direction'`; all-correct (`decision:'call'`) → `null`.
  - [ ] **`selectHint()` escalation — same error type (AC2):**
    - First miss (`prev = null`) → rung 0; assert `text === hintLadders.lo1['miscounted-outs']![0]`.
    - Feed the returned rung back as `prev`, same error type again → rung 1; again → rung 2; again → **stays at rung 2** (clamp; ladder length 3). Assert `rung` and `text` at each step against `hintLadders` (never a literal string copy — assert against the authored array so a future content edit keeps the test honest).
  - [ ] **`selectHint()` ladder switch (AC3):**
    - `prev = { errorType:'miscounted-outs', rung:2, text:… }`, then a submission detected as `'wrong-multiplier'` → returns `{ errorType:'wrong-multiplier', rung:0, … }` (resets to rung 0 of the new ladder, not rung 3).
  - [ ] **`selectHint()` guards:**
    - All-correct submission → `selectHint(...)` returns `null`.
    - (Optional boundary) A `HintLadder` missing the detected error type → `null` (construct a stripped ladder fixture, or assert the LO3 ladder lacks `'miscounted-outs'`).
  - [ ] **AC4 — no rung leaks the final answer (content-guard regression test):** iterate every rung string in `hintLadders` and assert none contains the final answer value:
    - LO1 ladders: no rung contains `'36'` (the equity answer). (Intermediate scaffolding like "Nine hearts", "×4", "two streets" is **allowed** — those teach the method; only the final equity `36` is forbidden.)
    - LO2 ladders: no rung contains `'16.7'` and no rung contains `'5:1'` or `'5 : 1'`.
    - LO3 ladder: no rung contains `'36'`, `'16.7'`, or `'5:1'`.
    - **Do NOT** assert absence of the word "call"/"Calling" in LO3 — the rung states the decision *rule* ("Calling is profitable when your equity beats the required equity"), not the verdict; that wording is intentional and non-revealing. AC4 targets the answer **value**, not method vocabulary. See Dev Notes §"What 'reveals the answer' means."
  - [ ] **Robustness:** whitespace (`outs:'  8  '` still classifies as `'miscounted-outs'`); non-numeric (`equity:'abc'` → LO1 detects `'wrong-multiplier'`, no throw); empty submission on a failed assessment → a rung or `null`, never a throw.

- [x] **Task 4: Verify (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings. Confirms: no Svelte/content/store import in `hints.ts`; the `export function parseNum` change typechecks; `HintLadder` `Partial` lookups are guarded; `scenario.pot!`/`scenario.bet!`/`answer.ratio!` non-null uses are sound for the LO2 path.
  - [x] `npm run test -- --run` → all prior suites green **plus** the new `hints.test.ts`, **and** `validation.test.ts` still green (proves the `parseNum` export didn't regress 3.2). Prior total end of Story 3.2 was **7 files / 146 tests** → **8 files / 170 tests** (+24 tests).
  - [x] `npm run build` → clean static `dist/` (AR-8). Pure logic; negligible bundle delta.
  - [x] **No manual/visual pass** — this story ships zero UI. Verification is `check` + `test` + `build` green. The first time a hint renders on screen is Story 3.5 (`FeedbackRow`).
  - [x] Record suite totals + any deviations in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

Story 3.3 builds the **diagnosis half** of the pure assessment engine — the sibling to 3.2's correctness half. **This story DOES:**
- Create `src/lib/assessment/hints.ts` — `detectError(scenario, answer, submitted): ErrorType | null` (pure classifier) + `selectHint(ladder, scenario, answer, submitted, prev): HintRung | null` (escalation-aware orchestrator) + the `DETECT_TOLERANCE_PP` constant. Imports only `./types` and `./validation`.
- Export `parseNum` from `validation.ts` (the single sanctioned edit to a done file — additive only).
- Create co-located `src/lib/assessment/hints.test.ts` — the prime, mandated engine test suite (AR-4).

**This story does NOT:**
- Render any hint, feedback row, or screen — Stories **3.4 / 3.5**. `selectHint` returns data; nothing draws it.
- Touch `appState.svelte.ts`, `App.svelte`, or any `.svelte` component. The store will hold the `prev: HintRung | null` and call `selectHint` — that wiring is **3.4/3.5**, not here.
- Author or edit hint-ladder **copy** — that is 3.1's `content/hintLadders.ts` (frozen). This story *selects* from it; it never writes rung text.
- Modify `types.ts`, `scenarios.ts`, `hintLadders.ts` (3.1 deliverables) or any of `validation.ts` beyond the one `export` keyword.
- Add any npm dependency (AR-1 stack locked: Svelte 5 / TS / Vite / Vitest).

### The engine contract — what the two functions consume and return

- **`detectError(scenario, answer, submitted)`** — pure classifier. `scenario` supplies `lo` (which rule set applies) and, for LO2, `pot`/`bet` (to compute the `10/50` denominator-error signature). `answer` supplies the canonical correct values to diff against. `submitted` is the raw learner text (`SubmittedAnswers`, from 3.2). Returns the likely `ErrorType` or `null`. [Source: types.ts:46-52; scenarios.ts:24-25 (pot/bet)]
- **`selectHint(ladder, scenario, answer, submitted, prev)`** — orchestrator. Calls `detectError`, looks up `ladder[errorType]` (the caller passes `hintLadders[scenario.lo]`), applies escalation against `prev`, returns the next `HintRung` or `null`. This is what `AssessmentScreen` calls after `validate()` returns `passed: false`. [Source: architecture.md:489-490, 497-498]
- **Output `HintRung`** (from `types.ts:55-59`): `{ errorType, rung, text }`. `rung` is the 0-based index within the ladder; `text` is the authored copy at that index. The store persists the returned `HintRung` as the next call's `prev`.

### Escalation state model — where the memory lives

The engine is **pure and stateless**; the *memory* of "which rung are we on" lives in the **store** (architecture.md:201: store holds "current hint rung, detected error type"). The flow per Check Answer click (wired in 3.4/3.5):
1. `result = validate(answer, submitted)` → if `passed`, show success, done.
2. `next = selectHint(hintLadders[lo], scenario, answer, submitted, store.assessment[lo].hint ?? null)`.
3. Store `store.assessment[lo].hint = next`; `FeedbackRow` renders `next.text`.

Because `prev` is threaded in and the next `HintRung` is threaded out, escalation is a **pure function of (detected error, prior rung)** — fully unit-testable without a store (AC2/AC3 tests just pass the returned rung back in as `prev`). This is the same "pass the state, return the state" shape the 3.2 engine used for correctness.

### Error-detection rules — the exact signatures

| LO | Error type | Detection signature (after `validate` already returned `passed:false`) | Canonical mistake |
|---|---|---|---|
| LO1 | `miscounted-outs` | `outs` exact-wrong (checked **first** — upstream cause) | entered 8 or 10 instead of 9 |
| LO1 | `wrong-multiplier` | `outs` correct **and** (`streets` wrong **or** `equity` outside ±`EQUITY_TOLERANCE_PP`) | `9×2=18` instead of `9×4=36`; streets=1 |
| LO2 | `denominator-error` | `requiredEquity` ≈ `bet/(pot+bet)·100` within `DETECT_TOLERANCE_PP` (=20), **or** `requiredEquity` wrong with `ratio` correct | `10/50 = 20%` (forgot own call) |
| LO2 | `ratio-percentage-confusion` | `ratio` exact-wrong (and not the denom signature) | put % in the ratio field / inverted |
| LO3 | `wrong-comparison-direction` | **any** incorrect LO3 submission (only authored LO3 ladder) | folded a profitable call |

- **Precedence matters.** LO1 checks `outs` before the multiplier (fix the upstream input first). LO2 checks the specific `20%` denominator signature before the broad `ratio` check, then falls back to `denominator-error` for any other `requiredEquity` miss.
- **Reuse the `validate()` boundaries.** Equity "wrong" uses the same `EQUITY_TOLERANCE_PP`; requiredEquity "wrong" uses the same `REQUIRED_EQUITY_BAND`; ratio "wrong" uses the same exact-tuple rule. Detection and validation must never disagree about whether a field is wrong — sharing `parseNum` and the bands guarantees that.
- **"Likely," not certain.** The AC and EXPERIENCE.md both say the system diagnoses the *likely* error. These heuristics are tuned to the canonical mistakes in the authored ladders (EXPERIENCE.md:84-88). Off-pattern inputs fall through to the most relevant authored ladder rather than `null` wherever a sensible default exists (LO2 step 3, LO3 catch-all).

### LO3 detection scope + flagged gap (confirm before 3.8 if it bites)

`content/hintLadders.ts` authors **one** ladder for LO3: `wrong-comparison-direction`. So this engine routes **every** failing LO3 submission to that ladder. Consequence: a learner who picks the right decision but fat-fingers the equity (e.g. `equity:'80'`, still `decision:'call'`) gets the comparison hint ("line up your two numbers — which must be larger to call?"), not an arithmetic-level hint. That is the correct *scope* for 3.3 — the engine **selects** from authored ladders; it cannot **author** new LO3 arithmetic rungs (that's a 3.1 content decision). The comparison hint is still on-point for the synthesis step.

**Surface to Meakel if 3.8 (LO3 climax) UX testing shows learners need equity/ratio-level coaching inside LO3:** the fix is to **add** `miscounted-outs`/`wrong-multiplier`/`denominator-error` ladders under `lo3` in `content/hintLadders.ts` (3.1 content) — at which point `detectError`'s LO3 branch should delegate to the LO1/LO2 signatures before the comparison catch-all. No engine rewrite needed; the precedence slots in cleanly. Recorded so 3.8 doesn't rediscover it cold. [Source: hintLadders.ts:28-34; epics.md §3.8]

### What "reveals the answer" means (AC4 boundary)

UX-DR17 / LDR-5: hints are "corrective, non-revealing, escalating … without ever stating the **answer**" (EXPERIENCE.md:82, 114). The **answer** is the *final* computed value the field asks for — LO1 equity `36%`, LO2 ratio `5:1` / required `16.7%`, LO3 the same plus the verdict. The authored ladders deliberately scaffold toward it with **intermediate** facts and **method**:
- LO1 deepest rung *does* state the outs count ("Nine hearts are unseen") and the streets ("two streets to come") — those are **inputs/method**, not the final equity. Allowed.
- LO2 deepest rung gives the **formula and operands** ("Use cost ÷ (pot + cost), i.e. 10 ÷ 60") but not the quotient `16.7`. Allowed.
- LO3 rung states the **rule** ("Calling is profitable when your equity beats the required equity"), not the verdict for *this* hand. Allowed.

So AC4's test asserts no rung contains the final **value** strings (`'36'`, `'16.7'`, `'5:1'`) — it must **not** forbid method words like "call", "4", "Nine", or "60", which legitimately appear. This test doubles as a **regression guard** on `content/hintLadders.ts`: if a future content edit pastes the final answer into a rung, the engine suite goes red.

### Pure-logic firewall (AR-4) — non-negotiable

`src/lib/assessment/` is the framework-free, unit-testable core. `hints.ts`:
- imports **only** from `./types` (types + `EQUITY_TOLERANCE_PP`) and `./validation` (`parseNum`, `REQUIRED_EQUITY_BAND`, `SubmittedAnswers`);
- imports **nothing** from `svelte`, a `.svelte` component, `appState.svelte.ts`, or `src/content/` — the ladder data is **passed in** by the caller, never imported by the engine (same inversion as `validate(answer, …)`);
- **throws nothing** — bad input → returned `HintRung` or `null`.
The test file may import `content/scenarios.ts` + `content/hintLadders.ts` (tests exercise the engine against real authored data). The engine module may not. `npm run check` enforces the import boundary. [Source: architecture.md:449-452, 458-460]

### Previous-work intelligence (3.1 → 3.2 → 3.3 continuity)

- **`types.ts` is frozen and already has everything this story needs:** `ErrorType` (5 members), `HintRung` (`{errorType, rung, text}`), `HintLadder` (`Partial<Record<ErrorType, readonly string[]>>`), `EQUITY_TOLERANCE_PP`. Import; do not edit. [Source: types.ts:46-62]
- **`validation.ts` (3.2) is the sibling:** reuse its `SubmittedAnswers`, `REQUIRED_EQUITY_BAND`, and (after Task 1) `parseNum`. The engine's "is this field wrong?" logic must mirror `validate()`'s exactly. [Source: validation.ts:1-53]
- **`content/hintLadders.ts` (3.1) is the authored copy:** lo1 = `miscounted-outs`(3) + `wrong-multiplier`(3); lo2 = `denominator-error`(3) + `ratio-percentage-confusion`(3); lo3 = `wrong-comparison-direction`(3). Each ladder has exactly 3 rungs today — but **do not hardcode "3"**; always clamp with `rungs.length - 1`. [Source: hintLadders.ts:3-35]
- **`content/scenarios.ts` (3.1) answer keys** are the canonical fixtures: `lo1={outs:9,streets:2,equity:36}`, `lo2={ratio:[5,1],requiredEquity:16.7}`(pot40/bet10), `lo3={equity:36,ratio:[5,1],requiredEquity:16.7,decision:'call'}`(pot40/bet10). Test against these, not hand-rolled copies. [Source: scenarios.ts:15,29,43]
- **Deferred-work notes this story explicitly closes** (from `_bmad-output/implementation-artifacts/deferred-work.md`): "3.3 hint engine must guard against `undefined` when an error type is not defined for a given LO" → the `rungs == null` guard; "3.3 must clamp rung index to ladder array length before indexing" → the `Math.min(..., rungs.length-1)` clamp.
- **Open coupling inherited from 3.2 (no action here):** `REQUIRED_EQUITY_BAND [16,17]` is silently coupled to the `16.7` answer; if LO3 is ever re-reconciled to pot=40/bet=40 (ratio `[2,1]`, required ≈33.3), both the band **and** this engine's `denomErrVal` math auto-follow `pot`/`bet` — but the band constant would need a manual revisit. Out of scope now; flagged in `deferred-work.md:5`.
- **House style:** `as const satisfies` for typed data (not needed for these functions); explicit return types on all exports; no `any`; node-env Vitest with co-located `*.test.ts`; mirror `validation.test.ts` structure. [Source: validation.test.ts:1-4; scenarios.ts:46]
- **Commit cadence:** `feat(3.3): …` on `main`; baseline is `3145433`.

### Git intelligence (recent commits)

`3145433 review(2.7)` → `8dff73d review(3.2)` → `ac8a055 feat(3.2)` → `45098b4 feat(3.1)`. The 3.2 pair (`ac8a055` + review `8dff73d`) is the direct template: a pure `*.ts` engine module + a co-located `*.test.ts` importing real `content/` data, shipped with `check`/`test`/`build` green and a Review Findings → `deferred-work.md` handoff. Replicate that shape exactly. The `review(...)` commits show the project's pattern of a follow-up review commit applying patches and flipping status to `done` — expect the same after `dev-story`.

### Reference: how 3.4–3.8 consume this (context, not scope — do not implement here)

- **3.4 store/inputs** → `appState.svelte.ts` holds per-LO assessment state including `hint: HintRung | null`. `CheckAnswerButton` (on click only) runs `validate()`; on `passed:false` runs `selectHint(hintLadders[lo], scenario, answer, submitted, prevHint)` and stores the result.
- **3.5 `FeedbackRow`** → renders the amber hint state from `HintRung.text` with a `!` glyph (no per-field red); replaced by the green success row when `passed`. [Source: epics.md §3.5; architecture.md:342-345]
- **3.6–3.8 screens** → each assessment passes its `scenario`/`answer`/`hintLadders[lo]` through the engine; LO3 (3.8) is the climax where wrong-comparison-direction coaching matters most.

### Project Structure Notes

- `hints.ts` + `hints.test.ts` land exactly where the architecture tree places them: `src/lib/assessment/` (architecture.md:411-412). No structural variance. This **completes** the `src/lib/assessment/` engine directory (`types.ts`, `validation.ts`, `hints.ts` + their tests).
- `DETECT_TOLERANCE_PP` lives in `hints.ts` (alongside the detection logic it serves), mirroring how `REQUIRED_EQUITY_BAND` lives in `validation.ts`. Both could migrate to `types.ts` in a later consolidation — noted, not required.
- The one cross-file edit (`export function parseNum` in `validation.ts`) is the deliberate, documented exception to the "3.2 frozen" rule, justified by shared-parse-semantics correctness (Task 1).

### File changes summary

2 new files, 1 modified (1 line):
- `pokermath/src/lib/assessment/hints.ts` — **NEW** (`detectError` + `selectHint` + `DETECT_TOLERANCE_PP`; imports only `./types` + `./validation`)
- `pokermath/src/lib/assessment/hints.test.ts` — **NEW** (classification, escalation, ladder-switch, and no-answer-leak coverage against real `assessments` + `hintLadders`)
- `pokermath/src/lib/assessment/validation.ts` — **MODIFIED** (`function parseNum` → `export function parseNum`; additive, no behavior change)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.3] — story statement + ACs (lines 507-529)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-12 escalating hint + unlimited retry (103); LDR-5 corrective non-revealing (106, 108); UX-DR17 (110, 525)
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-4 pure engine firewall (449-452); `detectError()` contract + caller passes content data (489-490, 497-498); store holds current rung + error type (201); hint engine returns selected hint via detected-error + escalating-rung logic (214-218); two terminal states, hint never reveals answer (342-345); feedback-is-returned-not-thrown (330-332); directory tree (408-412); signatures-as-contracts (587-589)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — hint-ladder escalation + ladder-switch behavior + canonical per-error examples (82-88); non-revealing pedagogy (114); incorrect/correct state rows (78-79)
- [Source: pokermath/src/lib/assessment/types.ts:46-62] — `ErrorType`, `HintRung`, `HintLadder` (import, do not edit)
- [Source: pokermath/src/lib/assessment/validation.ts:1-53] — `SubmittedAnswers`, `REQUIRED_EQUITY_BAND`, `parseNum` (to be exported), shared field-correctness boundaries
- [Source: pokermath/src/content/hintLadders.ts:3-35] — authored per-LO, per-error-type rungs to select from
- [Source: pokermath/src/content/scenarios.ts:15,29,43] — canonical answer keys + pot/bet for detection signatures
- [Source: pokermath/src/lib/assessment/validation.test.ts:1-4] — co-located Vitest style to mirror
- [Source: _bmad-output/implementation-artifacts/3-2-validation-engine-with-unit-tests.md] — sibling-engine conventions, frozen-3.1 rule, `validate(answer,…)` divergence precedent, suite-total reporting, Review Findings → deferred-work handoff
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:10,12] — the two 3.1 guards this story closes (Partial-lookup undefined; rung clamp)

### Review Findings

- [x] [Review][Patch] `detectError` missing `default` return — returns `undefined` not `null` for unrecognized `scenario.lo`, violating the `ErrorType | null` contract [`hints.ts`, end of switch]
- [x] [Review][Defer] `prev.rung` negative integer in `selectHint` yields `undefined` text — `Math.min(prev.rung + 1, rungs.length - 1)` can produce a negative index; pre-existing, 3.4/3.5 store will be sole producer of valid rungs [`hints.ts:65`] — deferred, pre-existing
- [x] [Review][Defer] Non-null assertions `answer.equity!`/`answer.ratio!` silent on wrong-LO data — pre-existing type design from frozen `types.ts` (3.1); `!` assertions sound for all authored callers [`hints.ts:19,33,38,42`] — deferred, pre-existing
- [x] [Review][Defer] `parseNum` hex/scientific coercion (`'0x9'`→9, `'1e2'`→100) inherited from `validation.ts` (3.2); pre-existing behavior, fixing requires touching frozen 3.2 code [`validation.ts:17`] — deferred, pre-existing

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — clean run, no deviations.

### Completion Notes List

- Suite totals: **8 files / 170 tests** (was 7 / 146 at end of 3.2; +24 new tests from `hints.test.ts`).
- `parseNum` export: purely additive — `validation.test.ts` stayed green, no behaviour change.
- Equity-wrong detection uses `!(Math.abs(v - answer.equity!) <= EQUITY_TOLERANCE_PP)` (negated-passing form) rather than `> EQUITY_TOLERANCE_PP` so that `NaN` inputs (non-numeric equity) are correctly classified as wrong — matches `validate()`'s own semantics.
- Both deferred-work items from 3.1 closed: Partial-lookup `undefined` guard (`rungs == null || rungs.length === 0`) and rung-index clamp (`Math.min(prev.rung + 1, rungs.length - 1)`).
- No deviations from story spec; no new deferred-work items surfaced.

### File List

- `pokermath/src/lib/assessment/hints.ts` — NEW (`detectError` + `selectHint` + `DETECT_TOLERANCE_PP`)
- `pokermath/src/lib/assessment/hints.test.ts` — NEW (24 tests: classification, escalation, ladder-switch, guards, AC4 no-answer-leak, robustness)
- `pokermath/src/lib/assessment/validation.ts` — MODIFIED (1 line: `function parseNum` → `export function parseNum`)
