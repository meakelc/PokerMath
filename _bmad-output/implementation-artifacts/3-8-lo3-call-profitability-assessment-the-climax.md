---
baseline_commit: 8f1d767
---

# Story 3.8: LO3 call profitability assessment (the climax)

Status: done

## Story

As a learner,
I want to stack equity against the required threshold and commit a Call/Fold,
so that I feel expected value decide a real call.

## Acceptance Criteria

**AC1 — LO3 assessment renders with card-region, CallingContent prose, all 4 fields, and CallFoldToggle (FR-10, LDR-1)**
**Given** the LO3 assessment (Calling Profitably section)
**When** it renders
**Then** it shows CallingContent instructional prose above the "Assessment" kicker, the card-region displaying hand `Ah Kh` + board `Qh 8h 7c` as card graphics, the prompt "There's $40 in the pot and your opponent bets $10…", and fields for equity %, pot odds (RatioInput), required equity %, and a CallFoldToggle with "Call" and "Fold" buttons — neither pre-selected

**AC2 — CallFoldToggle: two large mutually-exclusive buttons, click or arrow/space selects (UX-DR10, UX-DR20)**
**Given** `CallFoldToggle`
**When** it renders
**Then** it shows two large buttons labeled "Call" and "Fold" with neither pre-selected; clicking one fills it gold with gold-ink text, deselects the other; arrow/space toggles between them when focused

**AC3 — Check Answer validates equity ±3pp, required equity 16–17%, and Call/Fold judgment (FR-10, FR-11)**
**Given** my submission
**When** I click Check Answer (enabled only when all 4 fields have input — including a decision selection)
**Then** the engine validates equity (≈36%, ±3pp — passes 33–39), required equity (16–17%), ratio (exact [5, 1]), and that `decision === 'call'` — correct judgment is Call; wrong comparison direction shows the matching escalating hint without the answer (FR-12)

**AC4 — Correct submission shows success, Section marked ✓, no auto-advance (FR-13)**
**Given** a fully-correct submission (equity ∈ 33–39, ratio [5, 1], requiredEquity ∈ 16–17, decision 'call')
**When** validated
**Then** the green success row appears, the sidebar marks Calling Profitably with a gold ✓, and there is no auto-advance — Next stays the learner's choice

## Tasks / Subtasks

- [x] **Task 1: Create `CallFoldToggle.svelte` (AC: #2)**
  - [x] **Create** `pokermath/src/lib/components/CallFoldToggle.svelte`
  - [x] `value = $bindable('' as Decision | '')` — bindable prop
  - [x] Two `<button type="button">` elements: "Call" and "Fold"; container has `role="group" aria-label="Call or fold"`
  - [x] Click handler: set `value` to that button's decision (mutually exclusive)
  - [x] Keyboard handler on each button: `ArrowLeft` → 'fold', `ArrowRight` → 'call', `Space` → toggle; call `e.preventDefault()` on these keys
  - [x] Selected button styles: `background: var(--color-gold); color: var(--color-gold-ink)` (same gold as `CheckAnswerButton`)
  - [x] Unselected button styles: ghost — `border: var(--border-ghost); color: var(--color-text-on-felt); background: transparent`
  - [x] Buttons are "large" — `min-width: 80px; padding: var(--padding-button-primary)`
  - [x] `aria-pressed` attribute reflects selected state on each button
  - [x] Focus ring: `var(--color-focus)` / `var(--focus-ring-width)` / `var(--focus-ring-offset)` (matches all other controls)
  - [x] Import `Decision` type from `../../lib/assessment/types`

- [x] **Task 2: Wire `CallFoldToggle` into `AssessmentScreen.svelte` (AC: #1, #3)**
  - [x] Add import: `import CallFoldToggle from '../lib/components/CallFoldToggle.svelte'`
  - [x] Add `Decision` to existing type import: `import type { Scenario, AnswerKey, Decision } from '../lib/assessment/types'`
  - [x] **canSubmit lo3 branch (line ~43):** add `&& f.decision !== ''` — remove the "excluded — added in Story 3.8" comment
  - [x] **buildSubmitted lo3 branch (line ~69):** add `decision: f.decision as Decision` — remove the "excluded until Story 3.8" comment
  - [x] **LO3 fields block (line ~203):** replace `<!-- CallFoldToggle: Story 3.8 -->` with:
    ```svelte
    <div class="field-row">
      <span class="field-label">Your decision</span>
      <CallFoldToggle bind:value={appState.assessments.lo3.fields.decision} />
    </div>
    ```

- [x] **Task 3: End-to-end verification (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings
  - [x] `npm run test -- --run` → all prior tests pass (LO3 validation and detectError tests already cover the engine)
  - [x] `npm run build` → clean static `dist/`
  - [x] **Manual smoke test** (`npm run dev`):
    - Navigate to **Calling Profitably (LO3)** in the sidebar
    - **AC1:** CallingContent prose renders above the "Assessment" kicker; card-region visible with hand `Ah Kh` + board `Qh 8h 7c`; prompt reads "There's $40 in the pot and your opponent bets $10…"; equity %, RatioInput, required equity %, and CallFoldToggle all visible
    - **AC2 initial state:** "Call" and "Fold" buttons both unselected (no gold fill)
    - **Check Answer disabled:** until all fields AND a decision are selected
    - **AC2 interaction:** click "Call" → gold fill; click "Fold" → Fold gold, Call reverts; Tab focus + Space/Arrow toggles
    - **AC3 wrong-direction path:** enter equity `36`, ratio `5 : 1`, requiredEquity `16.7`, select Fold. Click Check Answer → amber hint row, `wrong-comparison-direction` rung 0: "Line up the two numbers you computed — which must be larger to call?"
    - **AC3 escalation:** submit again same (Fold) → rung 1: "Calling is profitable when your equity meets or beats the required equity."
    - **AC3 + AC4 correct path:** equity `36`, ratio `5 : 1`, requiredEquity `16.7`, select Call. Click Check Answer → green success row; sidebar Calling Profitably shows gold ✓; no auto-advance; Next button present
    - **AC3 equity band:** equity `33` + Call → passes; equity `39` + Call → passes; equity `32` + Call → fails
    - **AC3 requiredEquity band:** `16` passes; `17` passes; `15` fails; `18` fails
    - **Cheat sheet round-trip:** with fields filled and Call selected, open any cheat sheet → Esc closes → all fields preserved, Call still selected (FR-6)
    - **Reload behavior:** page reload returns to Introduction, LO3 fields cleared, ✓ absent (FR-3)
    - **Keyboard:** Tab → equity → ratio antecedent → ratio consequent → requiredEquity → Call button → Fold button → Check Answer; Enter submits when enabled (UX-DR20)
  - [x] Write smoke test script to `_verify/smoke-3-8.mjs` following the pattern established in `_verify/smoke-3-7.mjs`

## Dev Notes

### What already exists — do not recreate

The following LO3 infrastructure was built in Stories 3.1–3.7 and is already complete:

| Needed piece | Where it lives | Status |
|---|---|---|
| lo3 equity + ratio + requiredEquity fields | `AssessmentScreen.svelte:177–205` | ✓ built in 3.4 |
| lo3 appState fields shape (incl. `decision`) | `appState.svelte.ts:21–26` | ✓ built in 3.4 |
| lo3 scenario + answer key | `content/scenarios.ts:32–44` | ✓ built in 3.1 |
| lo3 validate: equity band, ratio, requiredEquity, decision | `lib/assessment/validation.ts:46–48` | ✓ built in 3.2 |
| lo3 detectError: wrong-comparison-direction | `lib/assessment/hints.ts:39–56` | ✓ built in 3.3 |
| lo3 hint ladder | `content/hintLadders.ts:28–34` | ✓ built in 3.1 |
| CallingContent instructional prose | `content/sections/CallingContent.svelte` | ✓ built in 2.6 |
| sectionContent registry for 'calling' | `content/sections/index.ts` | ✓ built in 2.6 |
| Content wiring to AssessmentScreen | `App.svelte:38` | ✓ built in 3.6 |
| card-region guard + CardGroup rendering | `AssessmentScreen.svelte:111–117` | ✓ built in 3.4 (lo3.hand is non-empty → region shows) |

**The only missing piece is `CallFoldToggle.svelte` and its two wiring hooks in `AssessmentScreen.svelte`.**

### Existing AssessmentScreen.svelte stubs — exact lines to patch

Three deliberate stubs were left for this story:

**canSubmit lo3 branch (~line 43):**
```ts
if (scenario.lo === 'lo3') {
  // decision (CallFoldToggle) excluded — added in Story 3.8
  const f = appState.assessments.lo3.fields
  return f.equity !== '' && f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
}
```
→ Add `&& f.decision !== ''`; remove the comment.

**buildSubmitted lo3 branch (~line 70):**
```ts
return {
  equity: f.equity,
  ratio: f.ratio as [string, string],
  requiredEquity: f.requiredEquity,
  // decision excluded until Story 3.8 wires CallFoldToggle
}
```
→ Add `decision: f.decision as Decision`; remove the comment.

**LO3 fields block (~line 203):**
```svelte
<!-- CallFoldToggle: Story 3.8 -->
```
→ Replace with the `<div class="field-row">` block shown in Task 2.

### Scenario data — do NOT modify

The lo3 scenario was authored in Story 3.1 with `bet: 10` (not `bet: 40`). The epic AC text says "opponent all-in $40" but the actual stored values (`pot: 40, bet: 10`) are consistent with the answer key (`ratio: [5, 1], requiredEquity: 16.7`):
- ratio = (40+10) : 10 = 5:1 ✓
- requiredEquity = 10/(40+10+10) = 10/60 ≈ 16.7% ✓

The prompt reads "There's $40 in the pot and your opponent bets $10" — this is correct. Do not change the prompt, `pot`, `bet`, `ratio`, or `requiredEquity` values.

### CallFoldToggle design spec (UX-DR10)

> "Two large mutually-exclusive buttons, neither pre-selected; selected fills gold with gold-ink text; arrow/space toggles when focused (LO3 only)."

Token mapping:
- Gold fill: `background: var(--color-gold)` with `color: var(--color-gold-ink)` (same as `CheckAnswerButton`)
- Ghost (unselected): `background: transparent; border: var(--border-ghost); color: var(--color-text-on-felt)`
- Focus ring: `outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: var(--focus-ring-offset)`

Keyboard contract (UX-DR20): when a button inside the toggle has focus, `Space` toggles between call/fold; `ArrowLeft` selects fold; `ArrowRight` selects call. Call `e.preventDefault()` on these keys to suppress native scroll.

`aria-pressed` on each button reflects its selected state (`true`/`false`). The container uses `role="group"` with `aria-label="Call or fold"`.

### appState lo3 decision field

`appState.svelte.ts:22`: `decision: '' as Decision | ''` is already defined. `Decision` is `'call' | 'fold'` from `lib/assessment/types.ts`. CallFoldToggle binds to this field via `bind:value`. When empty, no button appears selected; when 'call' or 'fold', the matching button is gold.

### Validation flow for LO3

When `canSubmit` is true (all 4 fields have input) and learner clicks Check Answer:
1. `buildSubmitted('lo3')` returns `{ equity, ratio, requiredEquity, decision }`
2. `validate(answer, submitted)` checks all 4 fields: equity ±3pp, ratio exact [5,1], requiredEquity 16–17%, decision exact 'call'
3. If `passed === false`: `detectError` for lo3 always returns `'wrong-comparison-direction'` (the single ladder key for lo3)
4. `selectHint` picks the next rung of `hintLadders.lo3['wrong-comparison-direction']`
5. `FeedbackRow` receives `passed={false}` + `hintText` → amber row
6. On `passed === true`: `FeedbackRow` receives `passed={true}` → green row; `appState.assessments.lo3.passed` is set; sidebar shows ✓

### LO3 detectError — always wrong-comparison-direction

`hints.ts:39–56`: for lo3, `detectError` returns `null` only if all 4 fields are correct. Any wrong submission → `'wrong-comparison-direction'`. This means all lo3 mistakes get the same ladder (3 rungs). There is no multi-ladder branching for LO3 — this is intentional (single high-level concept: compare equity to threshold).

### No new unit tests required

The existing `validation.test.ts` (describe 'LO3 — full synthesis', lines 118–169) and `hints.test.ts` (describe 'LO3', lines 45–69) already cover the engine fully. No new test files need to be created.

If desired, add a smoke test at `_verify/smoke-3-8.mjs` following the Playwright pattern from `_verify/smoke-3-7.mjs`. Check that smoke-3-7 is not broken (it doesn't test LO3).

### Pattern: no new files except CallFoldToggle

All changes are confined to:
1. **NEW:** `pokermath/src/lib/components/CallFoldToggle.svelte`
2. **MODIFY:** `pokermath/src/screens/AssessmentScreen.svelte` (3 surgical patches)

No changes to: `App.svelte`, `appState.svelte.ts`, `content/scenarios.ts`, `content/hintLadders.ts`, `lib/assessment/validation.ts`, `lib/assessment/hints.ts`, `lib/assessment/types.ts`.

### Architecture compliance

- AR-4: `lib/assessment/` untouched — remains Svelte-free.
- AR-5: `appState.svelte.ts` untouched — `decision` field already present.
- AR-7: `SubmittedAnswers.decision` already typed as `Decision` in `validation.ts:11`.
- UX-DR18: `CallFoldToggle` must not animate button transitions — direct class switch only.
- UX-DR19: selection must not rely on color alone — the selected button label text (Call/Fold) is always visible; gold fill is additive, not the sole cue.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.8] — story statement + ACs
- [Source: _bmad-output/planning-artifacts/epics.md#FR-10] — LO3 canonical scenario (note: "all-in $40" in FR-10 conflicts with actual data bet=10; data is authoritative)
- [Source: _bmad-output/implementation-artifacts/3-7-lo2-pot-odds-assessment.md#Dev-Notes] — "LO2 and LO3 inherit automatically" and "zero App.svelte changes in 3.7/3.8"
- [Source: pokermath/src/screens/AssessmentScreen.svelte:42–45,69–75,176–205] — lo3 canSubmit stubs, buildSubmitted stub, fields block with CallFoldToggle placeholder comment
- [Source: pokermath/src/lib/appState.svelte.ts:21–26] — lo3 fields: equity, ratio, requiredEquity, decision
- [Source: pokermath/src/content/scenarios.ts:32–44] — lo3 scenario (bet: 10, not 40) + answer key
- [Source: pokermath/src/lib/assessment/validation.ts:46–48] — decision exact-match check
- [Source: pokermath/src/lib/assessment/hints.ts:39–56] — lo3 detectError always returns wrong-comparison-direction
- [Source: pokermath/src/content/hintLadders.ts:28–34] — lo3 ladder: 3-rung wrong-comparison-direction
- [Source: pokermath/src/lib/assessment/validation.test.ts:118–169] — existing LO3 validation tests (no new tests needed)
- [Source: pokermath/src/lib/assessment/hints.test.ts:45–69] — existing LO3 detectError tests
- [Source: pokermath/src/lib/components/CheckAnswerButton.svelte] — gold button token pattern to reuse
- [Source: pokermath/src/styles/tokens.css] — --color-gold, --color-gold-ink, --border-ghost, --color-text-on-felt, --padding-button-primary, --focus-ring-*

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Created `CallFoldToggle.svelte`: two mutually-exclusive buttons with gold/ghost styles, ArrowLeft/Right/Space keyboard handler, `aria-pressed` state, `role="group"` container — all per UX-DR10/DR20.
- Patched `AssessmentScreen.svelte` (3 locations): added `Decision` type import + `CallFoldToggle` component import; added `&& f.decision !== ''` to `canSubmit` lo3 branch; added `decision: f.decision as Decision` to `buildSubmitted` lo3 return; replaced placeholder comment with `<CallFoldToggle bind:value={...}>` field-row.
- Verified: `npm run check` → 0 errors/warnings; `npm run test -- --run` → 170 tests passed (0 new tests needed per story spec); `npm run build` → clean dist.
- Wrote `_verify/smoke-3-8.mjs` covering AC1–AC4 including equity band, requiredEquity band, cheat sheet round-trip, and reload behavior.

### File List

- pokermath/src/lib/components/CallFoldToggle.svelte (NEW)
- pokermath/src/screens/AssessmentScreen.svelte (MODIFY — 3 patches)
- _verify/smoke-3-8.mjs (NEW)

### Review Findings

- [x] [Review][Patch] Space key selects 'call' when `value === ''` and Fold button is focused — `handleKey` ignores the `_d` parameter; fix: `select(value === '' ? _d : value === 'call' ? 'fold' : 'call')` [`pokermath/src/lib/components/CallFoldToggle.svelte:handleKey`]
- [x] [Review][Defer] `f.decision as Decision` cast has no in-function guard [`pokermath/src/screens/AssessmentScreen.svelte:buildSubmitted`] — deferred, pre-existing pattern; guarded by `canSubmit` in all current callers

### Change Log

- 2026-05-31: Implemented Story 3.8 — created `CallFoldToggle.svelte` and wired it into `AssessmentScreen.svelte`; 170 tests pass; smoke test written.
