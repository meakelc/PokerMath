---
baseline_commit: 5f7fb5e
---

# Story 3.5: Hint & success feedback rows

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want clear corrective and success feedback that never relies on color alone,
so that I always know whether I passed and what to fix.

## Acceptance Criteria

**AC1 — Incorrect submission shows amber hint row; no per-field coloring (FR-12, UX-DR12, UX-DR19)**
**Given** an incorrect submission
**When** the result returns
**Then** `FeedbackRow` shows the amber hint state with a leading `!` glyph and the selected hint copy — with no per-field red coloring; all fields stay neutral and editable

**AC2 — Correct submission shows green success row, replacing any hint (FR-13, UX-DR13)**
**Given** a fully-correct submission
**When** the result returns
**Then** `FeedbackRow` shows the green success state with a leading ✓ and warm affirmation, replacing any prior hint

**AC3 — Passed assessment marks sidebar section complete; no auto-advance (FR-13, UX-DR13)**
**Given** a passed assessment
**When** success shows
**Then** the sidebar marks that Section complete with a gold ✓ (session-only) and there is no auto-advance — Next stays the learner's choice

**AC4 — Feedback transition is a quick quiet fade; no celebratory animation (UX-DR18)**
**Given** any feedback
**When** it appears
**Then** the transition is a quick, quiet fade — no celebratory animation, no spinner, no confetti

## Tasks / Subtasks

- [x] **Task 1: Create `FeedbackRow.svelte` (AC: #1, #2, #4)**
  - [x] **New file:** `pokermath/src/lib/components/FeedbackRow.svelte`
  - [x] Props (Svelte 5 `$props()`; no `$bindable` — component is purely presentational):
    ```ts
    let {
      passed = null,
      hintText = null,
      successMessage = 'Well done — your answer is correct.',
    }: {
      passed?: boolean | null
      hintText?: string | null
      successMessage?: string
    } = $props()
    ```
  - [x] Template — three states: nothing when pristine, amber hint row when wrong, green success row when correct:
    ```svelte
    {#if passed === false}
      <div class="row hint" role="alert">
        <span class="glyph" aria-hidden="true">!</span>
        <p class="message">{hintText}</p>
      </div>
    {:else if passed === true}
      <div class="row success" role="alert">
        <span class="glyph" aria-hidden="true">✓</span>
        <p class="message">{successMessage}</p>
      </div>
    {/if}
    ```
    **Why `role="alert"`:** AT announces the feedback text when the row first appears (mounted) — learner does not need to tab to it to hear the result. Both glyph spans are `aria-hidden="true"` so screen readers read only the message text, not "! Not quite..." or "✓ Well done...".
  - [x] Styling — all via tokens; no hardcoded hex/size with a token equivalent:
    ```css
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      border-radius: var(--radius-sm);
      padding: var(--space-3) var(--space-4);
      animation: feedback-fade var(--motion-fast) var(--motion-ease);
      animation-fill-mode: backwards;
    }

    .row.hint {
      background: var(--color-hint-tint);
      border: 1px solid var(--color-hint);
    }

    .row.success {
      background: var(--color-success-tint);
      border: 1px solid var(--color-success);
    }

    .glyph {
      font: var(--font-value);
      flex-shrink: 0;
      margin-top: 1px; /* optical alignment with message first line — no token for 1px nudge */
    }

    .row.hint .glyph { color: var(--color-hint); }
    .row.success .glyph { color: var(--color-success); }

    .message {
      font: var(--font-body-md);
      color: var(--color-text-on-felt);
      margin: 0;
    }

    @keyframes feedback-fade {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    ```
    **Why `translateY(-4px)` + `opacity`:** matches "quick, quiet fade/position shift" pattern from UX-DR18 and `InformationalScreen.svelte`'s section-fade. Not a bounce, not a slide — just a subtle settle.
    **Why glyph is colored (hint amber / success green):** glyph color reinforces the border/bg tone; the *copy* also conveys the state in words, so this is color-plus-not-color-alone (UX-DR19 satisfied).

- [x] **Task 2: Insert `FeedbackRow` in `AssessmentScreen.svelte` (AC: #1, #2)**
  - [x] **Modify:** `pokermath/src/screens/AssessmentScreen.svelte`
  - [x] Add import after existing imports:
    ```ts
    import FeedbackRow from '../lib/components/FeedbackRow.svelte'
    ```
  - [x] Add two `$derived` values after `buildSubmitted` (before `handleSubmit`):
    ```ts
    const feedbackPassed = $derived.by(() => {
      const result = appState.assessments[scenario.lo].result
      return result === null ? null : result.passed
    })

    const feedbackHintText = $derived.by(
      () => appState.assessments[scenario.lo].hint?.text ?? null
    )
    ```
    **Why derived, not inline:** `feedbackPassed` and `feedbackHintText` are read twice (both passed as props). `$derived` caches them and avoids double-read inside the template.
  - [x] Replace the comment `<!-- Feedback row slot — FeedbackRow rendered here in Story 3.5 -->` with the component, placed **inside `.panel` (the `<form>`), between the fields block and `<CheckAnswerButton>`**:
    ```svelte
    <FeedbackRow passed={feedbackPassed} hintText={feedbackHintText} />
    ```
    The full form block order is: fields `{#if}` → `<FeedbackRow>` → `<CheckAnswerButton>`. The feedback row sits visually below the input fields and above the submit button, inside the lifted panel.

- [x] **Task 3: Wire sidebar `complete` prop in `Sidebar.svelte` (AC: #3)**
  - [x] **Modify:** `pokermath/src/lib/components/Sidebar.svelte`
  - [x] Add a helper function after the imports (before the template):
    ```ts
    import type { Section } from '../../content/sections'

    function getSectionComplete(section: Section): boolean {
      if (section.id === 'equity')    return appState.assessments.lo1.passed
      if (section.id === 'pot-odds')  return appState.assessments.lo2.passed
      if (section.id === 'calling')   return appState.assessments.lo3.passed
      return false
    }
    ```
    **Why id-based, not index-based:** `sections.ts` uses `as const`-typed `SectionId` strings; reading by `id` is more explicit and survives a hypothetical reorder without silently mapping the wrong LO.
  - [x] Update the `SidebarNavItem` rendering to pass `complete`:
    ```svelte
    <SidebarNavItem
      title={section.title}
      subtitle={section.subtitle}
      active={i === appState.currentSection}
      complete={getSectionComplete(section)}
      onselect={() => (appState.currentSection = i)}
    />
    ```
    **`SidebarNavItem.svelte` already implements the ✓** — the `done` class and `.item.done .t::after { content: ' ✓'; color: var(--color-gold-deep); }` are already present from Story 1.4. This task only supplies the correct data.

- [x] **Task 4: Verify (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings
  - [x] `npm run test -- --run` → all prior tests still green (no pure-logic changes in this story)
  - [x] `npm run build` → clean static `dist/` (AR-8)
  - [x] **Manual smoke test** (`npm run dev`):
    - Navigate to **LO1 (Equity)** assessment. Fill all three fields with wrong values (e.g., outs=5, streets=2, equity=20). Click Check Answer.
      - Amber hint row appears below fields with `!` glyph and hint text — **no field borders change color**
      - Sidebar LO1 section still shows no ✓
    - Submit again with a different wrong answer → hint escalates (different or next rung)
    - Enter the correct values (outs=9, streets=2, equity anything 33–39). Click Check Answer.
      - Amber row **replaced** by green success row with ✓ glyph and success message
      - Sidebar LO1 section **now shows gold ✓** appended to the title
      - No auto-advance — Next button is still present and learner must click it
    - Navigate away (click LO2 in sidebar) and back to LO1 → success row and ✓ are still showing (persistent per AR-5)
    - Navigate to **LO2 (Pot Odds)** — repeat: wrong → hint, correct → success + sidebar ✓
    - Navigate to **LO3 (Calling Profitably)** — submit wrong (LO3 still always fails in this story per 3.4 deferred-work, because `decision` is not wired yet); confirm amber hint appears
    - Check that feedback transitions are a quick quiet fade — no bounce, no flash, no confetti
    - Verify focus is not disrupted by the feedback row appearing (tab order continues normally through fields and Check Answer button)

## Dev Notes

### Scope boundary (read first)

**This story DOES:**
- Create `FeedbackRow.svelte` — the visual hint/success states
- Insert `FeedbackRow` into `AssessmentScreen.svelte`'s panel (fills the `<!-- Feedback row slot -->` placeholder from 3.4)
- Wire `Sidebar.svelte` to pass `complete={getSectionComplete(section)}` to each `SidebarNavItem`

**This story does NOT:**
- Create `CallFoldToggle` — **Story 3.8**
- Build the per-LO assessment smoke-test flows — **Stories 3.6–3.8**
- Fix LO3 always-failing validation (decision excluded from `buildSubmitted`) — **Story 3.8** deferred item
- Change any validation or hint engine logic — pure UI integration story
- Add any npm dependency (AR-1 stack locked)

### FeedbackRow — three-state design

| `passed` value | Visible state |
|---|---|
| `null` | Nothing rendered (pristine, no submit yet) |
| `false` | Amber hint row with `!` glyph + `hintText` |
| `true` | Green success row with `✓` glyph + `successMessage` |

`null` is the pristine state (before any `handleSubmit` fires). `appState.assessments[lo].result` starts as `null` (set in 3.4), so `feedbackPassed = $derived(result === null ? null : result.passed)` correctly returns `null` until the first submit.

On a correct submit: `handleSubmit` sets `result.passed = true`, `hint = null`, `passed = true`. `feedbackPassed` → `true`. `feedbackHintText` → `null` (unused in success state). Green row appears.

On an incorrect submit: `handleSubmit` sets `result.passed = false`, `hint = HintRung`, `passed = false`. `feedbackPassed` → `false`. `feedbackHintText` → `hint.text`. Amber row appears with hint copy.

On a subsequent correct submit: `result.passed` flips to `true`, `hint` is set to `null`. `feedbackPassed` → `true`. Green row replaces amber — the `{#if passed === false}` block unmounts and `{:else if passed === true}` mounts. The fade animation fires on the new mount.

### FeedbackRow — no per-field coloring is automatic

The AC explicitly states "no per-field red coloring — all fields stay neutral and editable". `FeedbackRow` is a sibling element to the fields; it never touches field styling. The `NumericInput` border-color is driven solely by `class:filled={value !== ''}` (gold border on fill). No red color is introduced anywhere in this story. This constraint is satisfied by the component boundary itself.

### Why `role="alert"` on both states

`role="alert"` causes AT to announce the container's text content when it appears in the DOM. This applies to both hint and success. The alternative (`aria-live="polite"`) would delay announcement until after the current focus interaction completes — `role="alert"` (equivalent to `aria-live="assertive"`) is appropriate here because feedback is the *direct result* of the user's Check Answer action and deserves immediate announcement.

**Why both `!` and `✓` glyphs are `aria-hidden="true"`:**
The glyph is a visual cue; the `<p class="message">` carries the full meaning in text. If glyphs are not aria-hidden, AT announces "! Not quite — recount your outs" — the `!` prefix adds no semantic value and breaks the sentence rhythm. With `aria-hidden`, AT announces only the message text.

### AssessmentScreen — why `$derived` not inline template expressions

Svelte 5 allows inline reactive expressions (e.g., `{appState.assessments[scenario.lo].result?.passed ?? null}`), but two-level optional chaining expressions in the template are harder to read and error-prone for Svelte 5's compiler on complex chained access. Using `$derived.by` with named variables (`feedbackPassed`, `feedbackHintText`) also makes the component's data flow explicit and matches the established pattern in `AssessmentScreen.svelte` (`canSubmit` already uses `$derived.by`).

### Sidebar — `getSectionComplete` function reactivity in Svelte 5

In Svelte 5, a regular function that reads `$state` sub-properties is reactive when called from a reactive context (component template or `$derived`). `{#each sections as section, i}` is a reactive context; calling `getSectionComplete(section)` inside it reads `appState.assessments.lo1.passed` (etc.), which Svelte 5 tracks. When any `passed` flag flips, the relevant `SidebarNavItem` re-renders with the updated `complete` prop. No `$derived` wrapper is needed for the function itself — it's called with `section` as an argument, so it can't be memoized without a `$derived.by` per-section, which would be over-engineering.

### `SidebarNavItem.svelte` ✓ mechanism (already implemented)

From Story 1.4, `SidebarNavItem.svelte` already has:
```css
.item.done .t::after {
  content: ' ✓';
  color: var(--color-gold-deep);
}
```
The `complete` prop maps to the `class:done={complete}` binding. **No changes to `SidebarNavItem.svelte` are needed in this story** — it already renders the ✓ correctly when `complete=true`.

### Svelte 5 runes patterns (project-established conventions)

Same conventions as established in prior stories and documented in 3.4:

| Pattern | Correct | Wrong |
|---|---|---|
| Derived value | `const x = $derived(expr)` | `const x = writable(...)` |
| Complex derived | `const x = $derived.by(() => { ... })` | manual recompute in markup |
| Reading state in template | `{appState.foo}` | `{appState.foo.value}` |
| Event handler | `onclick={fn}` (Svelte 5) | `on:click={fn}` (Svelte 4 — DO NOT USE) |

### Previous-work intelligence (3.4 → 3.5 continuity)

**From 3.4 (`appState.svelte.ts`):**
- `appState.assessments[lo].result: ValidationResult | null` — `null` on cold start; set by `handleSubmit`
- `appState.assessments[lo].hint: HintRung | null` — `null` on cold start or correct submit; set to `HintRung` on wrong submit
- `appState.assessments[lo].passed: boolean` — `false` on cold start; set `true` on correct submit

**From 3.4 (`AssessmentScreen.svelte`):**
- Imports already present: `appState`, `validate`, `selectHint`, `hintLadders`, etc.
- `handleSubmit` already stores results into `appState` — FeedbackRow merely *reads* those stored values via `$derived`
- The `<!-- Feedback row slot — FeedbackRow rendered here in Story 3.5 -->` comment is the exact insertion point (inside `<form class="panel">`, before `<CheckAnswerButton>`)
- `{#key sectionId}` wraps the `.body` div — **FeedbackRow is inside this keyed block** via the panel, so navigating away and back will re-render with the persisted state (correct behavior per AR-5)

**From 3.4 (`SidebarNavItem.svelte`):**
- `complete` prop and `.item.done .t::after` ✓ styling are already implemented
- In 3.4, `Sidebar.svelte` did not pass `complete` — it was always `false` (omitted = default `false`). This story supplies the actual data.

### What 3.6–3.8 consume from 3.5's outputs

- **3.6 (LO1 assessment)** — smoke-tests the full LO1 end-to-end flow including hint and success states. If hint copy or success message needs LO-specific wording, `successMessage` prop can be passed from `AssessmentScreen` at the LO level. No changes to `FeedbackRow` itself expected.
- **3.7 (LO2 assessment)** — same for LO2. `FeedbackRow` renders identically; only the hint text differs (driven by engine).
- **3.8 (LO3 assessment)** — wires `CallFoldToggle`, adds `decision` to `buildSubmitted` and `canSubmit`. Once wired, LO3 can return `passed: true` and the success row + sidebar ✓ will work automatically.

### Deferred-work items relevant to this story

From `deferred-work.md`:
- **LO3 always fails** (`decision` omitted from `buildSubmitted`) → amber hint row appears on every LO3 submit even with correct numeric answers until 3.8. This is expected intermediate behavior; no action in 3.5.
- **`prev.rung` upper-bound cap absent** → deferred; 3.5 makes no rung-handling changes.
- **Assessment state never resets on navigation** → intentional per AR-5. `FeedbackRow` reading persisted state on re-navigation is correct — the learner left the screen mid-attempt and returns to find their last feedback.

### File changes summary

3 files touched:
- `pokermath/src/lib/components/FeedbackRow.svelte` — NEW (hint/success presentational component)
- `pokermath/src/screens/AssessmentScreen.svelte` — MODIFIED (import + two $derived + FeedbackRow insertion)
- `pokermath/src/lib/components/Sidebar.svelte` — MODIFIED (getSectionComplete + complete prop pass-through)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.5] — story statement + ACs (lines 555–577)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-12 context-aware hint (line 32); FR-13 success confirm + sidebar ✓ (line 33)
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-5 single reactive store, appState shape (199–202); AR-9 content split, no inline hint strings (62–63); feedback states (342–348)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — UX-DR12 hint row behavior (78); UX-DR13 success row behavior (79); restrained motion rule (95); accessibility floor (103–104); State Patterns table feedback states (78–79)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — `feedback-hint` component spec (143–146); `feedback-success` component spec (147–150); sidebar-nav-item complete-mark spec (105); color palette (hint, success, hint-tint, success-tint, gold-deep) (25–29)
- [Source: pokermath/src/lib/components/SidebarNavItem.svelte:77-80] — `.item.done .t::after` already implemented; no changes needed
- [Source: pokermath/src/lib/components/Sidebar.svelte:14-20] — section iteration loop to update with `complete` prop
- [Source: pokermath/src/screens/AssessmentScreen.svelte:188] — `<!-- Feedback row slot -->` insertion point
- [Source: pokermath/src/screens/AssessmentScreen.svelte:29-44] — `$derived.by` canSubmit pattern to follow
- [Source: pokermath/src/lib/appState.svelte.ts:8-28] — per-LO `result`, `hint`, `passed` fields to read
- [Source: pokermath/src/styles/tokens.css:17-19] — `--color-hint-tint`, `--color-success-tint`, `--color-hint`, `--color-success` tokens
- [Source: pokermath/src/styles/tokens.css:80] — `--motion-fast`, `--motion-ease` tokens
- [Source: _bmad-output/implementation-artifacts/deferred-work.md:3-6] — LO3 always-failing, rung-cap deferred items (no action in 3.5)
- [Source: _bmad-output/implementation-artifacts/3-4-assessment-screen-archetype-input-primitives.md#Dev-Notes] — scope boundary definition for 3.5; appState consumption patterns; Svelte 5 $derived conventions

## File List

- `pokermath/src/lib/components/FeedbackRow.svelte` — NEW: presentational hint/success feedback row (three states: null/false/true; `role="alert"`; quick fade animation)
- `pokermath/src/screens/AssessmentScreen.svelte` — MODIFIED: import FeedbackRow; add `feedbackPassed` and `feedbackHintText` $derived; insert `<FeedbackRow>` in panel
- `pokermath/src/lib/components/Sidebar.svelte` — MODIFIED: add `getSectionComplete(section)` function; pass `complete` prop to SidebarNavItem

## Dev Agent Record

### Completion Notes

- `FeedbackRow.svelte` created as a pure presentational component: three-state (`null`/`false`/`true`), `role="alert"` on both rows, glyphs `aria-hidden`, all styling via tokens, `feedback-fade` keyframe animation (`translateY(-4px)` + opacity).
- `AssessmentScreen.svelte`: `feedbackPassed` and `feedbackHintText` added as `$derived.by` values (cached reads of `appState.assessments[lo].result` and `.hint`); `<FeedbackRow>` inserted between fields block and `<CheckAnswerButton>`, inside the `.panel` form — fills the Story 3.4 placeholder comment.
- `Sidebar.svelte`: `getSectionComplete(section)` function maps `section.id` → `appState.assessments.loN.passed`; `complete` prop now passed to each `SidebarNavItem`. `SidebarNavItem` already had `.item.done .t::after { content: ' ✓'; }` from Story 1.4 — no changes needed there.
- Validations: `npm run check` 0 errors/warnings; `npm run test -- --run` 170/170 pass; `npm run build` clean. Manual smoke: LO1 wrong → amber hint (no field coloring), LO1 correct → success + sidebar ✓ + no auto-advance, LO3 wrong → amber hint (expected deferred behavior).
- `_verify/3-5/` screenshots captured via Playwright.

## Change Log

- 2026-05-31: Story 3.5 implemented — created `FeedbackRow.svelte`; wired into `AssessmentScreen.svelte`; wired sidebar `complete` in `Sidebar.svelte`. All ACs satisfied. Status → review.
