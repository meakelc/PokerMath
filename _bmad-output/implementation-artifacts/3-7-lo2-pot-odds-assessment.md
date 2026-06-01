---
baseline_commit: 6f4ed35
---

# Story 3.7: LO2 pot odds assessment

Status: review

## Story

As a learner,
I want to compute pot odds as a ratio and a percentage,
so that I can express the break-even threshold both ways.

## Acceptance Criteria

**AC1 — LO2 assessment renders with pot/bet amounts, RatioInput + NumericInput; no card-region (FR-9)**
**Given** the LO2 assessment
**When** it renders
**Then** it shows the PotOddsContent instructional prose above the "Assessment" kicker, the prompt stating $40 pot and $10 bet, a RatioInput for pot odds, and a NumericInput with `%` suffix for required equity — no card-region renders (LO2 scenario has empty hand and board)

**AC2 — Check Answer validates correctly: ratio 5:1 exact, required equity 16–17% (FR-9, FR-11)**
**Given** my submission
**When** I click Check Answer
**Then** ratio `[5, 1]` passes exactly, and any `requiredEquity` in 16–17 (inclusive) passes

**AC3 — Denominator error and ratio/percentage confusion show matching escalating hints (FR-12)**
**Given** a `requiredEquity ≈ 20%` submission (the `10/50` denominator error)
**When** I submit
**Then** the `denominator-error` hint ladder rung 0 appears; submitting again with the same error escalates to rung 1

**Given** a correct requiredEquity but garbled ratio (e.g., antecedent `16`, consequent `7`)
**When** I submit
**Then** the `ratio-percentage-confusion` hint ladder rung 0 appears

**AC4 — Correct submission shows success, Section marked ✓, no auto-advance (FR-13)**
**Given** a fully-correct submission (ratio 5:1, requiredEquity ∈ 16–17)
**When** validated
**Then** the green success row appears, the sidebar marks the Pot Odds section with a gold ✓, and there is no auto-advance — Next remains the learner's choice

## Tasks / Subtasks

- [x] **Task 1: Verify LO2 scenario data (AC: #1, #2)**
  - [x] **Confirm** `pokermath/src/content/scenarios.ts` lo2 entry matches FR-9 canonical:
    - `hand: []` and `board: []` (no card region rendered)
    - `pot: 40, bet: 10`
    - prompt includes "$40 in the pot" and "bets $10"
    - `answer: { ratio: [5, 1], requiredEquity: 16.7 }`
  - [x] **Confirm** `pokermath/src/content/hintLadders.ts` lo2 ladders:
    - `denominator-error`: 3-rung ladder, rung 0 starts "Did you include the cost of your call..."
    - `ratio-percentage-confusion`: 3-rung ladder, rung 0 starts "Re-read which field..."
  - [x] No changes to these files unless a discrepancy is found

- [x] **Task 2: Verify end-to-end (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings
  - [x] `npm run test -- --run` → all prior tests pass
  - [x] `npm run build` → clean static `dist/` (AR-8)
  - [x] **Manual smoke test** (`npm run dev`):
    - Navigate to **Pot Odds (LO2)** in the sidebar
    - **AC1:** PotOddsContent prose renders above the "Assessment" kicker; no card-region visible; RatioInput shows two mono fields with fixed `:` between; NumericInput shows a `%` suffix; prompt reads "There's $40 in the pot and your opponent bets $10" ✓ VERIFIED
    - **Check Answer disabled:** until both ratio fields AND requiredEquity have input, button is disabled ✓ VERIFIED
    - **AC3 denominator-error path:** Enter ratio `5 : 1`, requiredEquity `20`. Click Check Answer → amber hint row, rung 0: "Did you include the cost of your call in the pot?" Submit again same error → rung 1: "The pot is $50 and it costs $10 to call..." ✓ VERIFIED
    - **AC3 ratio-percentage-confusion path:** Enter ratio antecedent `16`, consequent `7`, requiredEquity `16.7`. Click Check Answer → amber hint row, rung 0: "Re-read which field wants a ratio and which wants a percentage." ✓ VERIFIED
    - **AC2 + AC4 correct path:** Enter ratio `5 : 1`, requiredEquity `16.7`. Click Check Answer → green success row; sidebar Pot Odds item shows gold ✓; no auto-advance; Next button present ✓ VERIFIED
    - **Required equity band tolerance:** `16` passes; `17` passes; `15` fails; `18` fails ✓ VERIFIED
    - **Cheat sheet round-trip:** With ratio fields filled, open any cheat sheet → modal opens, Esc closes → ratio fields preserved (FR-6) ✓ VERIFIED
    - **Reload behavior:** Page reload returns to Introduction with LO2 fields cleared and ✓ absent (FR-3) ✓ VERIFIED
    - **Keyboard:** Tab through ratio antecedent → ratio consequent → requiredEquity → Check Answer; Enter submits when enabled (UX-DR20) ✓

## Dev Notes

### Zero new code — pure verification story

As documented in Story 3.6 Dev Notes (§"LO2 and LO3 inherit automatically"):
> The App.svelte change passes `content={sectionContent[active.id]}` unconditionally for all assessment sections. PotOddsContent and CallingContent will render in LO2 and LO3 assessments once those stories are exercised. No additional App.svelte changes in 3.7 or 3.8.

All infrastructure for LO2 was built across Stories 3.1–3.6:

| Needed piece | Where it lives | Status |
|---|---|---|
| LO2 fields (RatioInput + NumericInput) | `AssessmentScreen.svelte:154–173` | ✓ built in 3.4 |
| canSubmit for LO2 | `AssessmentScreen.svelte:39–42` | ✓ built in 3.4 |
| buildSubmitted for LO2 | `AssessmentScreen.svelte:64–67` | ✓ built in 3.4 |
| lo2 appState shape | `appState.svelte.ts:15–17` | ✓ built in 3.4 |
| LO2 scenario + answer | `content/scenarios.ts:18–30` | ✓ built in 3.1 |
| ratio + requiredEquity validation | `lib/assessment/validation.ts:35–44` | ✓ built in 3.2 |
| LO2 detectError (denominator-error, ratio-percentage-confusion) | `lib/assessment/hints.ts:24–37` | ✓ built in 3.3 |
| LO2 hint ladders | `content/hintLadders.ts:16–27` | ✓ built in 3.1 |
| PotOddsContent instructional prose | `content/sections/PotOddsContent.svelte` | ✓ built in 2.5 |
| Content wiring to AssessmentScreen | `App.svelte:38` | ✓ built in 3.6 |
| sectionContent registry for 'pot-odds' | `content/sections/index.ts:11` | ✓ built in 2.5 |

**Do not create any new files or modify any existing files.** If verification reveals a discrepancy in scenario data or hint ladders, correct only that specific value.

### LO2 scenario data sanity

| Field | Stored value | Derivation | Validation accepts |
|---|---|---|---|
| `pot` | 40 | Initial pot before bet | — (display only via prompt) |
| `bet` | 10 | Opponent's bet | — (display only via prompt) |
| `ratio` | [5, 1] | (pot+bet) : call = 50 : 10 = 5:1 | exact [5, 1] |
| `requiredEquity` | 16.7 | call/(pot+bet+call) = 10/60 ≈ 16.7% | 16–17% band |

Rationale: after the $10 bet, the pot is $50. To call, you add $10 more — total pot becomes $60. Your share of $60 you contribute is $10 → required equity = 10/60 ≈ 16.7%. The `REQUIRED_EQUITY_BAND = [16, 17]` (validation.ts:15) accepts integer rounding.

### Denominator-error detection (10/50 = 20% mistake)

`hints.ts:25`: `denomErrVal = (scenario.bet / (scenario.pot + scenario.bet)) * 100 = (10/50)*100 = 20%`

A learner who uses `10/50` (pot+bet, not including their own call in the denominator) gets 20%. Detection window: `Math.abs(reqVal - 20) <= 3`, so 17–23%. If `requiredEquity` falls in this range AND fails validation → `denominator-error`. ✓

Edge: 17 is both the top of the acceptance band AND the bottom of the detection window. `REQUIRED_EQUITY_BAND` check runs first in `validate()` — a value of 17 passes validation, so the hint path never fires. No overlap conflict.

### canSubmit for LO2

`CheckAnswerButton` stays disabled until all three fields are non-empty (FR-11, UX-DR11):
```ts
// AssessmentScreen.svelte:39–42
if (scenario.lo === 'lo2') {
  const f = appState.assessments.lo2.fields
  return f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
}
```
`RatioInput` binds `ratio[0]` (antecedent) and `ratio[1]` (consequent); both must be non-empty alongside `requiredEquity`.

### PotOddsContent renders LO1 cards inline — no conflict

`PotOddsContent.svelte` includes `CardGroup` for `Ah Kh` and `Qh 8h 7c` as contextual narrative about the LO1 scenario. These render inside the `.prose` block above the assessment panel. The LO2 scenario has `hand: []` and `board: []`, so `AssessmentScreen`'s `{#if scenario.hand.length > 0}` guard (line 112) hides the card-region. The prose cards and the card-region are visually separate; there is no duplication or conflict.

### No pot/bet widget — prompt text is the display

The AC says "shows the pot size and bet/call amount". This is fulfilled by the prompt text: "There's $40 in the pot and your opponent bets $10." There is no separate visual UI element for pot and bet amounts. UX-DR5 specifies only a prompt paragraph, not a dedicated numeric display. Do not add a pot/bet widget.

### answer.requiredEquity is not read by validate()

`validate()` uses `REQUIRED_EQUITY_BAND = [16, 17]` directly (validation.ts:44) — `answer.requiredEquity = 16.7` is stored but ignored (see deferred-work.md: "answer.requiredEquity is never read by validate()"). This is an acknowledged silent coupling: if the scenario answer changes from 16.7, `REQUIRED_EQUITY_BAND` must be updated in tandem. No action needed for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.7] — story statement + ACs
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-9 ($40 pot + $10 bet → 5:1, ≈16.7%); FR-11 validation tolerance; FR-12 hint ladder; FR-13 success + ✓
- [Source: _bmad-output/implementation-artifacts/3-6-lo1-equity-assessment.md#Dev-Notes] — "LO2 and LO3 inherit automatically"; zero App.svelte changes in 3.7/3.8; content wiring mechanism
- [Source: pokermath/src/screens/AssessmentScreen.svelte:39–42,64–67,112,154–173] — LO2 canSubmit; buildSubmitted; card-region guard; field rendering
- [Source: pokermath/src/lib/appState.svelte.ts:15–17] — lo2 fields: `{ ratio: ['', ''], requiredEquity: '' }`
- [Source: pokermath/src/content/scenarios.ts:18–30] — lo2 scenario + answer key
- [Source: pokermath/src/lib/assessment/validation.ts:15,35–44] — REQUIRED_EQUITY_BAND [16,17]; ratio exact check; requiredEquity band check
- [Source: pokermath/src/lib/assessment/hints.ts:24–37] — lo2 detectError: denominator-error (window ±3pp of 20%), ratio-percentage-confusion
- [Source: pokermath/src/content/hintLadders.ts:16–27] — lo2 ladders: denominator-error (3 rungs), ratio-percentage-confusion (3 rungs)
- [Source: pokermath/src/content/sections/PotOddsContent.svelte] — instructional prose with contextual LO1 cards
- [Source: pokermath/src/content/sections/index.ts:11] — `'pot-odds': PotOddsContent` in sectionContent registry
- [Source: pokermath/src/App.svelte:38] — `content={sectionContent[active.id]}` passes PotOddsContent to AssessmentScreen

## File List

No file changes expected — this is a verification story. If scenario data or hint copy discrepancies are found in Task 1, correct only the specific value.

## Dev Agent Record

### Implementation Notes

Pure verification story — no code was written or modified. All LO2 infrastructure was confirmed in-place from Stories 3.1–3.6. Smoke test script written to `_verify/smoke-3-7.mjs`, screenshots captured to `_verify/3-7/` (10 frames).

### Completion Notes

All 4 ACs verified via Playwright smoke test (2026-05-31):
- AC1: PotOddsContent prose renders, "Assessment" kicker present, no `.card-region`, RatioInput with `:` separator, `%` suffix on RequiredEquity, correct prompt text
- AC2: ratio `[5,1]` exact pass; `requiredEquity` 16, 16.7, 17 all pass; 15 and 18 both fail — band correct
- AC3: `denominator-error` rung 0 "Did you include..." → rung 1 "$50/$10" escalation; `ratio-percentage-confusion` rung 0 "Re-read which field..."
- AC4: Green success row, sidebar `.done` class set (gold ✓ via CSS), no auto-advance confirmed
- Bonus: cheat sheet round-trip preserves fields; reload resets to Intro with `.done` absent

`npm run check`: 0 errors / 0 warnings | `npm run test`: 170/170 | `npm run build`: clean dist

### Change Log

- 2026-05-31: Story 3.7 verification complete — all ACs confirmed, no source file changes required. Smoke test artifacts in `_verify/3-7/`.
