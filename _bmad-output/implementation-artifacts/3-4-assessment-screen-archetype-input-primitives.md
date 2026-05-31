---
baseline_commit: b8d7af3
---

# Story 3.4: Assessment screen archetype & input primitives

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a consistent assessment screen with computed-input fields and one Check Answer,
so that I enter my work clearly and submit it all at once.

## Acceptance Criteria

**AC1 — AssessmentScreen archetype renders correct structure (UX-DR5)**
**Given** `AssessmentScreen.svelte`
**When** an assessment Section renders
**Then** it shows the Section title + an "Assessment" kicker in label-caps above the title, the scenario prompt, a `CardGroup` region for board + hand (hidden when `hand.length === 0` — LO2), and a lifted `assessment-panel` holding the LO-specific input fields + `CheckAnswerButton` + a feedback-row slot position, plus the `Pager`

**AC2 — NumericInput: felt well, optional % suffix, gold border on fill, non-numeric rejection (UX-DR8)**
**Given** `NumericInput`
**When** used
**Then** it renders a `felt-deep` mono well with a translucent border; when the field has any input the border turns gold; a fixed `%` suffix is shown inside the wrapper (not inside the `<input>` value) where `suffix="%"` is passed; any non-numeric character typed is silently stripped (not stored, no error thrown)

**AC3 — RatioInput: two mono fields with fixed `:` separator (UX-DR9)**
**Given** `RatioInput`
**When** used
**Then** it shows two small mono input wells (`[5] : [1]`) with a fixed `:` glyph between them; both fields are individually bindable; non-numeric characters stripped the same way as `NumericInput`

**AC4 — CheckAnswerButton: disabled until all fields have input; Enter submits; validate() fires only on submit (FR-11, UX-DR11)**
**Given** `CheckAnswerButton`
**When** every required field of the assessment has any input
**Then** the button is enabled (gold, primary style) and submitting the form (button click or Enter key) calls `validate(answer, submitted)` then `selectHint(...)` and stores the result in `appState`; when any required field is empty the button is disabled; `validate()` never fires on keystroke

## Tasks / Subtasks

- [x] **Task 1: Expand `appState.svelte.ts` with per-LO assessment state (AC: #4)**
  - [x] Add `import type { HintRung, ValidationResult, Decision } from './assessment/types'` to `appState.svelte.ts` (already at `pokermath/src/lib/appState.svelte.ts`)
  - [x] Add per-LO state blocks inside `$state({...})`. Each LO gets: `fields` (all SubmittedAnswers-compatible strings), `result: ValidationResult | null`, `hint: HintRung | null`, `passed: boolean`. Use this exact shape:
    ```ts
    assessments: {
      lo1: {
        fields: { outs: '', streets: '', equity: '' },
        result: null as ValidationResult | null,
        hint: null as HintRung | null,
        passed: false,
      },
      lo2: {
        fields: { ratio: ['', ''] as [string, string], requiredEquity: '' },
        result: null as ValidationResult | null,
        hint: null as HintRung | null,
        passed: false,
      },
      lo3: {
        fields: { equity: '', ratio: ['', ''] as [string, string], requiredEquity: '', decision: '' as Decision | '' },
        result: null as ValidationResult | null,
        hint: null as HintRung | null,
        passed: false,
      },
    },
    ```
  - [x] Svelte 5 `$state({...})` makes nested objects deeply reactive — **no additional wrapping needed**; direct mutation `appState.assessments.lo1.fields.outs = '9'` is the correct idiom (AR-5)
  - [x] `lo3.fields.decision` is typed `Decision | ''` because `CallFoldToggle` (Story 3.8) will eventually write `'call'`|`'fold'`; `''` is the pristine unset state; this is intentionally typed wider than `Decision`

- [x] **Task 2: Create `NumericInput.svelte` (AC: #2)**
  - [x] **New file:** `pokermath/src/lib/components/NumericInput.svelte`
  - [x] Props (Svelte 5 `$props()` + `$bindable()`):
    ```ts
    let {
      value = $bindable(''),
      suffix = '',
      label,
      id,
    }: { value?: string; suffix?: string; label: string; id: string } = $props()
    ```
  - [x] Non-numeric stripping handler (allows decimals for equity/requiredEquity — outs/streets are integers but one component handles all cases; the engine validates correctness):
    ```ts
    function handleInput(e: Event) {
      const el = e.target as HTMLInputElement
      const cleaned = el.value.replace(/[^0-9.]/g, '')
      if (cleaned !== el.value) el.value = cleaned
      value = cleaned
    }
    ```
  - [x] Template:
    ```svelte
    <div class="field" class:filled={value !== ''}>
      <input
        {id}
        type="text"
        inputmode="decimal"
        autocomplete="off"
        aria-label={label}
        {value}
        oninput={handleInput}
      />
      {#if suffix}
        <span class="suffix" aria-hidden="true">{suffix}</span>
      {/if}
    </div>
    ```
  - [x] Styling — all via tokens; no hardcoded hex/size with a token equivalent:
    - `.field`: `display: flex; align-items: center; position: relative;` + `--control-height: 40px` (use `height: var(--control-height)`)
    - `.field input`: `flex: 1 1 auto; background: var(--color-felt-deep); color: var(--color-text-on-felt); font: var(--font-value); border: var(--border-control); border-radius: var(--radius-sm); height: 100%; padding: 0 var(--space-3);` (add extra right padding when suffix present; the suffix is a sibling span, not inside the input value)
    - `.field.filled input`: `border-color: var(--color-gold);` (gold border on fill — UX-DR8)
    - `.suffix`: `position: absolute; right: var(--space-3); font: var(--font-value); color: var(--color-text-on-felt-dim); pointer-events: none;`
    - Focus ring: `input:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: var(--focus-ring-offset); }`

- [x] **Task 3: Create `RatioInput.svelte` (AC: #3)**
  - [x] **New file:** `pokermath/src/lib/components/RatioInput.svelte`
  - [x] Props:
    ```ts
    let {
      antecedent = $bindable(''),
      consequent = $bindable(''),
      label = 'Pot odds ratio',
    }: { antecedent?: string; consequent?: string; label?: string } = $props()
    ```
  - [x] Same non-numeric stripping as `NumericInput`. Separate handlers for antecedent and consequent (each updates its own bindable)
  - [x] Template: two `<input>` fields with a static `:` `<span>` between them; each input gets an explicit `aria-label` (e.g., `"Ratio antecedent"` / `"Ratio consequent"`)
  - [x] Styling: each input is a small felt-deep mono well, same token set as `NumericInput` but narrower (suggest `width: 64px`; this is a justified literal — no width token for ratio fields). Gold border when each individual field is filled.
  - [x] The separator `:` is `font: var(--font-value); color: var(--color-text-on-felt-dim);`

- [x] **Task 4: Create `CheckAnswerButton.svelte` (AC: #4)**
  - [x] **New file:** `pokermath/src/lib/components/CheckAnswerButton.svelte`
  - [x] Props:
    ```ts
    let { disabled }: { disabled: boolean } = $props()
    ```
  - [x] Template: `<button type="submit" class="btn" {disabled}>Check Answer</button>`
  - [x] `type="submit"` — the AssessmentScreen wraps the form; this gives Enter-submits-when-enabled for free without any keyboard handler (UX-DR11)
  - [x] Styling: primary gold button style (same as `Pager`'s `.btn.primary`). Use tokens exactly as `Pager.svelte` does:
    - `background: var(--color-gold); color: var(--color-gold-ink); font: var(--font-body-md); font-weight: 600; border-radius: var(--radius-sm); padding: var(--padding-button-primary); border: 0; cursor: pointer; box-shadow: var(--shadow-button-primary);`
    - `&:disabled { opacity: 0.38; cursor: not-allowed; box-shadow: none; }` — disabled state; `opacity: 0.38` is a standard disabled convention (no dedicated token exists; justified literal per DESIGN.md §Components)

- [x] **Task 5: Create `AssessmentScreen.svelte` (AC: #1, #4)**
  - [x] **New file:** `pokermath/src/screens/AssessmentScreen.svelte`
  - [x] Props:
    ```ts
    let {
      sectionId,
      title,
      subtitle,
      scenario,
      answer,
    }: {
      sectionId: SectionId
      title: string
      subtitle: string
      scenario: Scenario
      answer: AnswerKey
    } = $props()
    ```
  - [x] Imports: `appState` from `../lib/appState.svelte`, `validate` from `../lib/assessment/validation`, `selectHint` from `../lib/assessment/hints`, `hintLadders` from `../content/hintLadders`, `assessments` from `../content/scenarios`, `CardGroup` from `../lib/components/CardGroup.svelte`, `Pager` from `../lib/components/Pager.svelte`, `NumericInput`, `RatioInput`, `CheckAnswerButton`, plus types `SectionId` from `../content/sections`, `Scenario`/`AnswerKey` from `../lib/assessment/types`
  - [x] Derive LO-state shorthand (direct reference to avoid repeated indexing; Svelte 5 reactive because it reads `$state` sub-objects):
    - Do NOT use `$derived` to alias — direct access like `appState.assessments.lo1` is already reactive in Svelte 5 runes
    - Use `{#if scenario.lo === 'lo1'} ... {/if}` blocks in the template instead of dynamic key access
  - [x] **`canSubmit` derivation** (per-LO, all required fields non-empty):
    ```ts
    const canSubmit = $derived.by(() => {
      if (scenario.lo === 'lo1') {
        const f = appState.assessments.lo1.fields
        return f.outs !== '' && f.streets !== '' && f.equity !== ''
      }
      if (scenario.lo === 'lo2') {
        const f = appState.assessments.lo2.fields
        return f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
      }
      if (scenario.lo === 'lo3') {
        // decision (CallFoldToggle) excluded — added in Story 3.8
        const f = appState.assessments.lo3.fields
        return f.equity !== '' && f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
      }
      return false
    })
    ```
  - [x] **`handleSubmit` — the Check Answer handler:**
    ```ts
    function handleSubmit(e: SubmitEvent) {
      e.preventDefault()
      if (!canSubmit) return

      const lo = scenario.lo
      const submitted = buildSubmitted(lo)
      const result = validate(answer, submitted)

      // Defensive clamp on prev rung (deferred-work item from 3.3 review)
      const rawPrev = appState.assessments[lo].hint
      const prev = rawPrev ? { ...rawPrev, rung: Math.max(0, rawPrev.rung) } : null
      const hint = result.passed ? null : selectHint(hintLadders[lo], scenario, answer, submitted, prev)

      appState.assessments[lo].result = result
      appState.assessments[lo].hint = hint
      appState.assessments[lo].passed = result.passed
    }
    ```
  - [x] **`buildSubmitted(lo)`** — collects the per-LO fields into a `SubmittedAnswers` shape (import `SubmittedAnswers` from `../lib/assessment/validation`):
    ```ts
    function buildSubmitted(lo: 'lo1' | 'lo2' | 'lo3') {
      if (lo === 'lo1') {
        const f = appState.assessments.lo1.fields
        return { outs: f.outs, streets: f.streets, equity: f.equity }
      }
      if (lo === 'lo2') {
        const f = appState.assessments.lo2.fields
        return { ratio: f.ratio as [string, string], requiredEquity: f.requiredEquity }
      }
      // lo3
      const f = appState.assessments.lo3.fields
      return {
        equity: f.equity,
        ratio: f.ratio as [string, string],
        requiredEquity: f.requiredEquity,
        // decision excluded until Story 3.8 wires CallFoldToggle
      }
    }
    ```
  - [x] **Template structure:**
    ```svelte
    <article class="screen">
      {#key sectionId}
        <div class="body">
          <header class="section-head">
            <span class="kicker">Assessment</span>
            <h1 class="section-title">{title}</h1>
          </header>

          <!-- Card region — hidden when hand is empty (LO2 has no hand/board) -->
          {#if scenario.hand.length > 0}
            <div class="card-region">
              <CardGroup cards={scenario.board} label="Board" />
              <CardGroup cards={scenario.hand} label="Hand" />
            </div>
          {/if}

          <p class="prompt">{scenario.prompt}</p>

          <form class="panel" onsubmit={handleSubmit}>
            <!-- LO1 fields -->
            {#if scenario.lo === 'lo1'}
              <div class="fields">
                <div class="field-row">
                  <label for="outs" class="field-label">Outs</label>
                  <NumericInput
                    id="outs"
                    label="Number of outs"
                    bind:value={appState.assessments.lo1.fields.outs}
                  />
                </div>
                <div class="field-row">
                  <label for="streets" class="field-label">Streets remaining</label>
                  <NumericInput
                    id="streets"
                    label="Streets remaining"
                    bind:value={appState.assessments.lo1.fields.streets}
                  />
                </div>
                <div class="field-row">
                  <label for="equity" class="field-label">Your equity</label>
                  <NumericInput
                    id="equity"
                    label="Your equity percentage"
                    suffix="%"
                    bind:value={appState.assessments.lo1.fields.equity}
                  />
                </div>
              </div>
            {/if}

            <!-- LO2 fields -->
            {#if scenario.lo === 'lo2'}
              <div class="fields">
                <div class="field-row">
                  <label class="field-label">Pot odds</label>
                  <RatioInput
                    bind:antecedent={appState.assessments.lo2.fields.ratio[0]}
                    bind:consequent={appState.assessments.lo2.fields.ratio[1]}
                  />
                </div>
                <div class="field-row">
                  <label for="requiredEquity" class="field-label">Required equity</label>
                  <NumericInput
                    id="requiredEquity"
                    label="Required equity percentage"
                    suffix="%"
                    bind:value={appState.assessments.lo2.fields.requiredEquity}
                  />
                </div>
              </div>
            {/if}

            <!-- LO3 fields -->
            {#if scenario.lo === 'lo3'}
              <div class="fields">
                <div class="field-row">
                  <label for="lo3-equity" class="field-label">Your equity</label>
                  <NumericInput
                    id="lo3-equity"
                    label="Your equity percentage"
                    suffix="%"
                    bind:value={appState.assessments.lo3.fields.equity}
                  />
                </div>
                <div class="field-row">
                  <label class="field-label">Pot odds</label>
                  <RatioInput
                    bind:antecedent={appState.assessments.lo3.fields.ratio[0]}
                    bind:consequent={appState.assessments.lo3.fields.ratio[1]}
                  />
                </div>
                <div class="field-row">
                  <label for="lo3-requiredEquity" class="field-label">Required equity</label>
                  <NumericInput
                    id="lo3-requiredEquity"
                    label="Required equity percentage"
                    suffix="%"
                    bind:value={appState.assessments.lo3.fields.requiredEquity}
                  />
                </div>
                <!-- CallFoldToggle: Story 3.8 -->
              </div>
            {/if}

            <!-- Feedback row slot — FeedbackRow rendered here in Story 3.5 -->

            <CheckAnswerButton disabled={!canSubmit} />
          </form>
        </div>
      {/key}

      <Pager />
    </article>
    ```
  - [x] Styling (all tokens, no hardcoded values with token equivalents):
    - `.screen`: `display: flex; flex-direction: column; flex: 1 1 auto;` (same as `InformationalScreen` — fills felt column so Pager pins to bottom)
    - `.body`: `display: flex; flex-direction: column; gap: var(--space-section-gap); animation: section-fade var(--motion-fast) var(--motion-ease); animation-fill-mode: backwards;`
    - `.section-head`: `display: flex; flex-direction: column; gap: var(--space-1);`
    - `.kicker`: `font: var(--font-label-caps); letter-spacing: var(--tracking-label-caps); text-transform: uppercase; color: var(--color-text-on-felt-dim);` (UX-DR5 "Assessment" kicker in label-caps)
    - `.section-title`: identical tokens to `InformationalScreen` (`--font-display-lg`, `--tracking-display-lg`, `--color-text-on-felt`)
    - `.card-region`: `display: flex; gap: var(--space-8);` (board and hand as distinct labeled groups with visual spacing — UX-DR7)
    - `.prompt`: `font: var(--font-body-lg); color: var(--color-text-on-felt); max-width: 60ch; margin: 0;` (justified literal — same cap as InformationalScreen prose; no token for 60ch)
    - `.panel` (the `<form>`): `background: var(--color-felt-panel); border-radius: var(--radius-md); box-shadow: var(--shadow-panel); border: var(--border-hairline); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-6);` (DESIGN.md `assessment-panel` component spec)
    - `.fields`: `display: flex; flex-direction: column; gap: var(--space-4);`
    - `.field-row`: `display: flex; align-items: center; gap: var(--space-4);`
    - `.field-label`: `font: var(--font-label-caps); letter-spacing: var(--tracking-label-caps); text-transform: uppercase; color: var(--color-text-on-felt-dim); min-width: 160px;` (justified literal for min-width alignment; no token exists for label column width)
    - `@keyframes section-fade { from { opacity: 0; } to { opacity: 1; } }` (matches InformationalScreen fade — single definition in each component is fine; global.css only sets base styles)

- [x] **Task 6: Update `App.svelte` to render `AssessmentScreen` for assessment sections (AC: #1)**
  - [x] **Modify:** `pokermath/src/App.svelte`
  - [x] Add imports:
    ```ts
    import AssessmentScreen from './screens/AssessmentScreen.svelte'
    import { assessments } from './content/scenarios'
    import type { ScenarioWithKey } from './content/scenarios'
    ```
  - [x] Add a typed assessment scenario map (derive from `sections.ts` `SectionId` — only the three assessment sections are keys):
    ```ts
    type AssessmentSectionId = 'equity' | 'pot-odds' | 'calling'
    const assessmentScenarios: Record<AssessmentSectionId, ScenarioWithKey> = {
      equity: assessments.lo1,
      'pot-odds': assessments.lo2,
      calling: assessments.lo3,
    }
    ```
  - [x] Replace the `{:else}` temporary block (lines ~27–37, the `<!-- TEMPORARY: ... -->` comment + fallback `{#key}` div + `<Pager />`) with:
    ```svelte
    {:else if active.kind === 'assessment'}
      {@const asmEntry = assessmentScenarios[active.id as AssessmentSectionId]}
      <AssessmentScreen
        sectionId={active.id}
        title={active.title}
        subtitle={active.subtitle}
        scenario={asmEntry.scenario}
        answer={asmEntry.answer}
      />
    ```
  - [x] Remove the now-unused `.section-head`, `.section-title`, `.section-subtitle` CSS rules from `App.svelte` `<style>` block — they were only for the temp fallback (the real title styles live in `AssessmentScreen.svelte` and `InformationalScreen.svelte`)
  - [x] The `Pager` import in `App.svelte` can be removed from `App.svelte` since the Pager is now rendered inside the screen components — check first: `Pager` was already only imported and used in the temp block; confirm no other use before removing

- [x] **Task 7: Verify (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings. Confirms: correct Svelte 5 rune usage; `$bindable()` on input props; `$derived.by()` for canSubmit; no Svelte import in `lib/assessment/` (existing constraint, not modified here); type safety on `lo3.fields.decision as Decision | ''`
  - [x] `npm run test -- --run` → all **170 prior tests** still green; `hints.test.ts` + `validation.test.ts` unaffected (no pure-logic changes)
  - [x] `npm run build` → clean static `dist/` (AR-8)
  - [x] **Manual smoke test** (required — this story is all UI): `npm run dev`, navigate to each assessment section (LO1 / LO2 / LO3):
    - Assessment screen renders with "Assessment" kicker, title, prompt
    - LO1: three NumericInput fields (Outs, Streets remaining, Your equity %) visible
    - LO2: RatioInput + NumericInput (Required equity %) visible; no CardGroup (LO2 hand is empty)
    - LO3: three NumericInput fields visible; no decision toggle yet (3.8)
    - Check Answer button disabled when any field is empty
    - Check Answer button enabled when all LO-required fields have any input
    - Typing letters (e.g., 'abc') into a NumericInput: character is silently stripped, not stored
    - Typing '36' in equity field → border turns gold; clearing → border returns to translucent
    - Enter key: submits when button is enabled; does nothing when disabled
    - `npm run check` again after manual check that no TS error slipped through

## Dev Notes

### Scope boundary (read first)

**This story DOES:**
- Expand `appState.svelte.ts` with per-LO assessment state (fields, result, hint, passed)
- Create `NumericInput.svelte`, `RatioInput.svelte`, `CheckAnswerButton.svelte` primitives
- Create `AssessmentScreen.svelte` — the archetype shell with all LO layouts
- Update `App.svelte` to render `AssessmentScreen` for assessment-kind sections
- Wire `validate()` + `selectHint()` on Check Answer submit (stores result in appState)

**This story does NOT:**
- Render `FeedbackRow` — the hint/success feedback row **is Story 3.5**. After AC4's `handleSubmit` stores `result` and `hint` in `appState`, there is nothing yet that renders them. The feedback-row slot position is a comment block or empty div in the `<form>` until 3.5.
- Create `CallFoldToggle` — **Story 3.8**. LO3 fields in 3.4 omit `decision`; `canSubmit` for LO3 excludes `decision` until 3.8 updates it.
- Mark sidebar sections complete (✓) — **Story 3.5** reads `appState.assessments[lo].passed` and wires the sidebar ✓.
- Create `FeedbackRow`, `CallFoldToggle`, or per-LO smoke-test scenarios — **Stories 3.5–3.8**.
- Add any npm dependency (AR-1 stack locked).

### appState expansion — design rationale

**Why one unified field shape per LO, not SubmittedAnswers directly?**
`SubmittedAnswers` has all fields optional (the type is `{ outs?: string; ... }`). Using it directly in `$state` would mean all fields start as `undefined`, and we'd need `?? ''` everywhere in templates. Using named shapes with string defaults (`''`) keeps template code clean and the `canSubmit` logic simple: `f.outs !== ''` vs `f.outs != null && f.outs !== ''`.

**`lo3.fields.decision` typed as `Decision | ''`:**
`''` is the pristine unset state before CallFoldToggle is built. `Decision = 'call' | 'fold'` from `types.ts`. TypeScript requires the type to include `''` until 3.8 narrows it. `buildSubmitted` for LO3 intentionally omits `decision` from the `SubmittedAnswers` object in this story — the engine returns `passed: false` because `decision` is `undefined` (answer.decision is `'call'`; `undefined !== 'call'`). This is expected intermediate behavior.

**Why not use `$derived` to alias `appState.assessments[lo]`?**
`$derived` creates a read-only snapshot. Binding to a derived value's sub-property (e.g., `bind:value={loState.fields.outs}`) would fail because derived values are not settable in Svelte 5. Use `{#if scenario.lo === 'lo1'}` branches and reference `appState.assessments.lo1.fields.outs` directly — this IS reactive in Svelte 5 because `appState` is `$state` and Svelte 5 tracks deep sub-property reads.

### Svelte 5 runes patterns (project-established conventions)

These patterns are used throughout the existing codebase (Pager, Sidebar, etc.) — follow them exactly:

| Pattern | Correct | Wrong |
|---|---|---|
| Reading state | `appState.currentSection` | `appState.currentSection.value` |
| Writing state | `appState.currentSection = 2` | `setCurrentSection(2)` |
| Derived value | `const x = $derived(a || b)` | `const x = writable(...)` |
| Complex derived | `const x = $derived.by(() => { ... })` | manual recompute in markup |
| Bindable prop | `let { v = $bindable('') } = $props()` | `export let v` (Svelte 4 syntax) |
| Event handler | `onclick={fn}` (Svelte 5) | `on:click={fn}` (Svelte 4 — DO NOT USE) |

### NumericInput — implementation precision

**The suffix is a positioned sibling, NOT inside the `<input>` value:**
The `<input>` only holds the number the user types. The `%` (or other suffix) is an absolutely-positioned `<span>` inside a relatively-positioned wrapper div. The input gets `padding-right` large enough to not overlap the suffix span. This is why `aria-hidden="true"` is on the suffix — screen readers read the `<label>` + the input value; the `%` is visual-only.

**`oninput` vs `onchange`:** Use `oninput` (fires on every keystroke) not `onchange` (fires on blur). This lets us strip non-numeric characters immediately as the user types rather than on focus-out.

**`type="text" inputmode="decimal"`:** `type="number"` has browser-specific issues (spinner arrows, locale-dependent decimal separator). `type="text"` with `inputmode="decimal"` gives a numeric keyboard on mobile (irrelevant here — desktop-only app per EXPERIENCE.md) and full control over input validation.

**Gold border on fill:** CSS class toggle `class:filled={value !== ''}` drives the border color change from `--border-control` (translucent white) to `--color-gold`. No JavaScript needed beyond the already-tracked `value`.

### RatioInput — binding to array indices

**Svelte 5 + array index binding:** `bind:antecedent={appState.assessments.lo2.fields.ratio[0]}` binds the `antecedent` prop (which is `$bindable`) to index 0 of the reactive ratio array. Svelte 5 tracks array element mutations through `$state` deep reactivity. This is valid — the `$state`-wrapped array mutates correctly when the input writes `antecedent = newValue` internally.

**Why two separate bindable props instead of a `bind:value` for the whole tuple?**
The `[string, string]` tuple can't be cleanly two-way bound as a whole in Svelte 5 without extra wrapping. Two separate bindable props (`antecedent` / `consequent`) mirror the visual layout (`[5] : [1]`) and produce cleaner template code in AssessmentScreen.

### CheckAnswerButton — type="submit" is intentional

Using `type="submit"` on the button and wrapping the field area in `<form onsubmit={handleSubmit}>` gives Enter-key submission for free: when the focused element is inside the form and the button is enabled, pressing Enter fires the form's `submit` event, which calls `handleSubmit`. `e.preventDefault()` in `handleSubmit` prevents any actual form navigation. This is semantically correct (the learner IS submitting their answers) and saves a global `svelte:window` keydown listener.

**`disabled` attribute disables both click and Enter submission** when any field is empty — the browser does not fire `submit` if the submit button is disabled, so `handleSubmit` only runs when the button is enabled.

### AssessmentScreen — deferred-work items addressed

1. **[From 3.1 review] LO2 empty hand/board — conditionally hide `CardGroup`**
   `deferred-work.md:23`: "LO2 `hand: [], board: []` — 3.4/3.6 card-rendering screens must conditionally hide `CardGroup` when `hand.length === 0` to avoid orphan labels." **Addressed here:** The template uses `{#if scenario.hand.length > 0}` to conditionally render the `.card-region`. LO2's scenario has `hand: [], board: []`, so the card region is hidden for LO2. LO1 and LO3 have hands.

2. **[From 3.3 review] Math.max(0,...) clamp for negative `prev.rung`**
   `deferred-work.md:6`: "Add a `Math.max(0, ...)` clamp when implementing the store in 3.4." **Addressed in `handleSubmit`:** Before calling `selectHint`, we do:
   ```ts
   const rawPrev = appState.assessments[lo].hint
   const prev = rawPrev ? { ...rawPrev, rung: Math.max(0, rawPrev.rung) } : null
   ```
   This ensures `prev.rung` is never negative when passed to `selectHint`, even if some future code path writes a negative rung to the store (currently impossible by design — selectHint always returns rung ≥ 0).

### AssessmentScreen — what `handleSubmit` stores

After `handleSubmit` runs:
- `appState.assessments[lo].result = { perField, passed }` (the `ValidationResult` — **Story 3.5's FeedbackRow** reads `result.passed` and `hint.text`)
- `appState.assessments[lo].hint = HintRung | null` (the next escalation rung — passed as `prev` on the NEXT submit)
- `appState.assessments[lo].passed = boolean` (the canonical passed flag — **Story 3.5** uses this to mark the sidebar ✓)

`result` is overwritten on every submit (no append/history). `hint` is the carry-state for escalation (`selectHint` reads `prev = appState.assessments[lo].hint` as the previous rung). On a correct submission: `result.passed = true`, `hint = null` (selectHint returns null for all-correct), `passed = true`.

### LO3 canSubmit scope in this story

`canSubmit` for LO3 in 3.4 requires: `equity !== '' && ratio[0] !== '' && ratio[1] !== '' && requiredEquity !== ''`. It does **not** require `decision`. This means a learner on LO3 can submit without a Call/Fold choice — the engine returns `passed: false` because `submitted.decision` is `undefined`, which doesn't equal `'call'`. This is acceptable intermediate behavior; the `decision` field and `canSubmit` update happen in Story 3.8 when `CallFoldToggle` is built.

### App.svelte — removing the temp fallback

The existing temp fallback block in `App.svelte` (lines ~27–37) is:
```svelte
{:else}
  <!-- TEMPORARY: Sections with no content component registered yet.
       Epic 3 replaces this with AssessmentScreen for assessment-kind sections. -->
  {#key active.id}
    <div class="section-head">
      <h1 class="section-title">{active.title}</h1>
      <p class="section-subtitle">{active.subtitle}</p>
    </div>
  {/key}
  <Pager />
{/if}
```

Replace with:
```svelte
{:else if active.kind === 'assessment'}
  {@const asmEntry = assessmentScenarios[active.id as AssessmentSectionId]}
  <AssessmentScreen ... />
{/if}
```

The `Pager` import can be removed from `App.svelte` once this block is gone — Pager is now rendered inside `AssessmentScreen` and `InformationalScreen`. Check if `Pager` is used anywhere else in `App.svelte` before removing its import.

Also remove the now-dead CSS rules from `App.svelte <style>`: `.section-head`, `.section-title`, `.section-subtitle` (lines ~71–88). These were only for the temp fallback; `InformationalScreen.svelte` and `AssessmentScreen.svelte` each define their own equivalents with the same token-driven values.

The `@keyframes section-fade` block in `App.svelte` is also scoped only to the old `.section-head` — **remove it** too. Each screen component defines its own `@keyframes section-fade` scoped to its own `.body` element.

### Previous-work intelligence (3.2 → 3.3 → 3.4 continuity)

**From 3.2 (`validation.ts`):**
- `validate(answer: AnswerKey, submitted: SubmittedAnswers): ValidationResult` — always call with `answer` first, `submitted` second (the 3.2 story documents this deliberate divergence from the architecture shorthand `validate(scenario, answers)`)
- `SubmittedAnswers` is defined in `validation.ts` — import it from there; do NOT redefine
- `parseNum` is exported (Task 1 of 3.3 exported it) — available if needed

**From 3.3 (`hints.ts`):**
- `selectHint(ladder: HintLadder, scenario: Scenario, answer: AnswerKey, submitted: SubmittedAnswers, prev: HintRung | null): HintRung | null`
- The caller (AssessmentScreen) passes `hintLadders[scenario.lo]` as `ladder` — the engine never imports content
- `prev` is `appState.assessments[lo].hint` (the previously-stored rung, or null on first miss)

**From 3.3 (`hintLadders.ts`):**
- Structure: `hintLadders = { lo1: HintLadder, lo2: HintLadder, lo3: HintLadder }` — index by `scenario.lo` exactly
- Import path: `../content/hintLadders` from the `screens/` folder

**From existing components (Pager, PlayingCard, InformationalScreen):**
- `section-fade` animation: each component defines it locally (scoped CSS in Svelte means no conflict)
- `Pager` renders `margin-top: auto` to pin to the bottom — `AssessmentScreen` must have `flex: 1 1 auto` on `.screen` for this to work (same as `InformationalScreen`)
- Token reference pattern: always `var(--token-name)`, never the hex literal

### House style

- Explicit return types on all exported functions (`handleSubmit: (e: SubmitEvent) => void`, `canSubmit: boolean`)
- No `any` — use proper types from `types.ts` and `validation.ts`
- `as const satisfies` not needed here (no typed data objects — only state mutation and function bodies)
- Commit: `feat(3.4): …` on `main`; baseline is `b8d7af3`

### Git intelligence (recent commits)

`b8d7af3 review(3.3)` → `cdc4526 feat(3.3)` → `3145433 review(2.7)` → `8dff73d review(3.2)`. The 3.3 pair is a pure-TS story (no UI). Story 3.4 is the first UI-forward story in Epic 3. The review commit after 3.4 will be the first time a reviewer sees visual assessment components — expect visual/UX findings (spacing, token correctness, color accuracy) in addition to code findings. Run `npm run dev` and actually navigate the screens as part of Task 7.

### Reference: how 3.5–3.8 consume 3.4's outputs

- **3.5 (`FeedbackRow`)** — creates `FeedbackRow.svelte` and inserts it in the feedback-row slot position of `AssessmentScreen`. Reads `appState.assessments[lo].result` (for `passed`) and `appState.assessments[lo].hint` (for `hint.text`). Also reads `appState.assessments[lo].passed` to drive the sidebar ✓ (via `SidebarNavItem.svelte`). No changes to AssessmentScreen's core logic in 3.5.
- **3.6 (LO1 assessment)** — smoke-tests the end-to-end LO1 flow with the built screen. Verifies: correct card graphics, correct field layout, validation + hint escalation working live. May apply minor fixes to AssessmentScreen if found.
- **3.7 (LO2 assessment)** — same for LO2. Verifies the ratio input, the hidden card region, correct required-equity validation.
- **3.8 (LO3 assessment)** — creates `CallFoldToggle.svelte`, adds it to the LO3 `{#if}` block in `AssessmentScreen`, updates `canSubmit` for LO3 to also require `decision !== ''`, and updates `buildSubmitted` for LO3 to include `decision`.

### File changes summary

4 new files, 2 modified:
- `pokermath/src/lib/components/NumericInput.svelte` — NEW (`$bindable` value, optional % suffix, gold border on fill, numeric-only)
- `pokermath/src/lib/components/RatioInput.svelte` — NEW (antecedent + consequent `$bindable`, `:` separator)
- `pokermath/src/lib/components/CheckAnswerButton.svelte` — NEW (`type="submit"`, `disabled` prop, primary gold style)
- `pokermath/src/screens/AssessmentScreen.svelte` — NEW (assessment archetype, all LO layouts, validate + selectHint wiring, feedback-row slot position)
- `pokermath/src/lib/appState.svelte.ts` — MODIFIED (add `assessments: { lo1, lo2, lo3 }` per-LO state blocks)
- `pokermath/src/App.svelte` — MODIFIED (replace temp fallback with `AssessmentScreen`; remove unused Pager import + dead CSS)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.4] — story statement + ACs (lines 531–553)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-11 validate-on-submit, disabled until filled (line 31); FR-12 hint on incorrect (line 32); FR-8–10 assessment fields per LO (lines 28-30)
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-4 pure engine firewall (449–452); AR-5 single reactive store, per-LO state (201–202); AR-6 no-router navigation (206–207); AR-7 shared data contracts (58–62); AR-9 content split (62–63); component architecture list (209–213); validation timing (339–342); feedback states (342–348)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — UX-DR5 assessment screen archetype (35); UX-DR8 numeric input (62); UX-DR9 ratio input (63); UX-DR11 Check Answer button (65–66); UX-DR12 hint row (67); UX-DR19/20 accessibility + keyboard (93–94); State patterns table (74–80)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — `assessment-panel` component spec (137–142); `input-field` spec (124–130); `toggle-button` spec (118–123); `button-primary` spec (106–112); `feedback-hint` / `feedback-success` specs (143–150)
- [Source: pokermath/src/lib/appState.svelte.ts:1-8] — current store shape to extend
- [Source: pokermath/src/App.svelte:19–37] — temp fallback block to replace; CSS to remove
- [Source: pokermath/src/screens/InformationalScreen.svelte:1-98] — screen archetype pattern to mirror (flex layout, section-fade animation, Pager at bottom)
- [Source: pokermath/src/lib/components/Pager.svelte:39–58] — primary/ghost button token references to copy
- [Source: pokermath/src/lib/components/PlayingCard.svelte] — token usage patterns (border-control, border-hairline, etc.)
- [Source: pokermath/src/lib/assessment/validation.ts:1-53] — `validate(answer, submitted)`, `SubmittedAnswers` type
- [Source: pokermath/src/lib/assessment/hints.ts:58-74] — `selectHint(ladder, scenario, answer, submitted, prev)` signature
- [Source: pokermath/src/content/scenarios.ts] — `assessments.lo1/lo2/lo3`, `ScenarioWithKey` type
- [Source: pokermath/src/content/hintLadders.ts] — `hintLadders` indexed by `LO`
- [Source: pokermath/src/content/sections.ts] — `SectionKind`, `SectionId`, `sections` array; equity/pot-odds/calling are `kind: 'assessment'`
- [Source: pokermath/src/styles/tokens.css] — complete token list (all styling must reference var(--token-name))
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:6] — Math.max(0,...) clamp for prev.rung (addressed in Task 5 handleSubmit)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:23] — LO2 empty hand/board conditional CardGroup (addressed in Task 5 template)

## File List

- `pokermath/src/lib/appState.svelte.ts` — MODIFIED: added `assessments` per-LO state block (lo1/lo2/lo3 fields, result, hint, passed)
- `pokermath/src/lib/components/NumericInput.svelte` — NEW: felt-deep input well, optional % suffix, gold border on fill, non-numeric stripping
- `pokermath/src/lib/components/RatioInput.svelte` — NEW: two mono wells with `:` separator, individually $bindable antecedent/consequent
- `pokermath/src/lib/components/CheckAnswerButton.svelte` — NEW: type="submit" gold primary button, disabled prop
- `pokermath/src/screens/AssessmentScreen.svelte` — NEW: assessment archetype with all LO layouts, validate+selectHint wiring, feedback-row slot
- `pokermath/src/App.svelte` — MODIFIED: routing reordered (assessment check first), AssessmentScreen wired, Pager import removed, dead CSS removed

## Dev Agent Record

### Implementation Notes

All 6 tasks implemented in sequence per story spec. 170 tests green throughout; 0 svelte-check errors/warnings.

Key decision: App.svelte routing reordered to `{#if active.kind === 'assessment'}` first — Epic 2 stories (2.4-2.6) registered assessment section IDs in `sectionContent/index.ts` as temporary placeholder content, which caused the `{:else if}` branch to never fire. Reordering fixes routing without removing Epic 2's delivered content. Verified via Playwright smoke test across all three LO sections.

Two deferred-work items addressed: `Math.max(0, rawPrev.rung)` clamp in `handleSubmit` (deferred-work.md:6), and `{#if scenario.hand.length > 0}` guard for LO2 card region (deferred-work.md:23).

A11y fix: Pot odds `<label>` elements (LO2/LO3) changed to `<span class="field-label">` — `<label>` requires a `for` target; `RatioInput` has its own `aria-label` on the wrapper and explicit `aria-label` on each input.

### Completion Notes

- AC1 ✅: AssessmentScreen renders with "ASSESSMENT" kicker, section title, conditional CardGroup (LO2 hidden), panel with fields + CheckAnswerButton + Pager
- AC2 ✅: NumericInput — felt-deep well, translucent→gold border on fill, % suffix as absolute-positioned span, non-numeric silently stripped on oninput
- AC3 ✅: RatioInput — two 64px wells with `:` separator, individual $bindable antecedent/consequent, same stripping logic
- AC4 ✅: CheckAnswerButton disabled until all per-LO required fields non-empty ($derived.by canSubmit); type="submit" gives Enter-key for free; validate()+selectHint() called only on submit event; result/hint/passed stored in appState

## Change Log

- 2026-05-31: feat(3.4) — assessment screen archetype + input primitives. Created NumericInput, RatioInput, CheckAnswerButton, AssessmentScreen. Expanded appState with per-LO assessment state. Updated App.svelte routing to render AssessmentScreen for assessment-kind sections. Addressed deferred-work items from 3.1/3.3 reviews.

### Review Findings

- [x] [Review][Patch] Multiple decimal points pass numeric filter → NaN in validate() — regex `/[^0-9.]/g` allows multiple dots; `"1.2.3"` reaches validate() as NaN [NumericInput.svelte:handleInput, RatioInput.svelte:handleAntecedent/handleConsequent]
- [x] [Review][Patch] Dead import `assessments` unused in AssessmentScreen — imported on line 7 but never referenced in script or template [AssessmentScreen.svelte:7]
- [x] [Review][Patch] `aria-label` on RatioInput wrapper `<div>` has no ARIA role — `aria-label` on a generic div is ignored by AT; group label "Pot odds ratio" is lost; add `role="group"` [RatioInput.svelte:wrapper div]
- [x] [Review][Patch] No runtime guard before `assessmentScenarios[active.id]` — `active.id as AssessmentSectionId` cast bypasses TypeScript; a future `kind: 'assessment'` section with an unregistered id silently returns `undefined` and throws on `asmEntry.scenario` [App.svelte:assessment routing block]
- [x] [Review][Defer] No `{:else}` fallback for unregistered sections — intentional per spec; temp placeholder removed; new unregistered section renders blank [App.svelte:main branch] — deferred, pre-existing
- [x] [Review][Defer] LO3 always fails validation (decision omitted from buildSubmitted) → wrong-hint loop until Story 3.8 — intentional intermediate behavior per story scope [AssessmentScreen.svelte:buildSubmitted] — deferred, pre-existing
- [x] [Review][Defer] Rung clamp heals in-flight copy but not persisted appState.hint.rung — if stored rung is ever negative, re-submits skip rung 0 [AssessmentScreen.svelte:handleSubmit] — deferred, pre-existing
- [x] [Review][Defer] Rung clamp has no upper-bound cap — stored hint.rung exceeding ladder length passes unchecked to selectHint [AssessmentScreen.svelte:handleSubmit] — deferred, pre-existing
- [x] [Review][Defer] Assessment fields/result/hint/passed never reset on navigation — intentional persistent state design per AR-5 [appState.svelte.ts] — deferred, pre-existing
- [x] [Review][Defer] CardGroup renders empty Board label when board is empty but hand is non-empty — no current scenario has this shape; hypothetical future risk [AssessmentScreen.svelte:card-region] — deferred, pre-existing
- [x] [Review][Defer] Both `<label for>` and `aria-label` on same NumericInput — AT announces aria-label text (e.g. "Number of outs") while visible label says "Outs"; both specified by story [AssessmentScreen.svelte:field rows] — deferred, pre-existing
