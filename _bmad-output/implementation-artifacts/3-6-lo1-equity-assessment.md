---
baseline_commit: 80f619b
---

# Story 3.6: LO1 equity assessment

Status: review

## Story

As a learner,
I want to compute a hand's equity with the Rule of 2-and-4,
so that I can apply the shorthand under realistic conditions.

## Acceptance Criteria

**AC1 — LO1 assessment renders with card graphics and the three fields; outs not pre-supplied (FR-8, LDR-1)**
**Given** the LO1 assessment
**When** it renders
**Then** it shows hand `Ah Kh` and flop `Qh 8h 7c` as four-color card graphics, the section's instructional prose above the assessment chrome, and three fields — Outs, Streets remaining, Your equity (% suffix) — with no outs value pre-filled

**AC2 — Check Answer validates correctly: outs exact, streets exact, equity ±3pp (FR-8, FR-11)**
**Given** my submission
**When** I click Check Answer
**Then** the engine accepts outs=9 exactly, streets=2 exactly, and equity in 33–39% (±3pp of 36%)

**AC3 — Wrong outs count or wrong street multiplier shows matching escalating hint (FR-12)**
**Given** a wrong outs count (e.g., outs=7)
**When** I submit
**Then** the `miscounted-outs` hint ladder rung 0 appears; submitting again with the same error escalates to rung 1

**Given** wrong streets or a ×2 multiplier mistake (e.g., outs=9, streets=2, equity=18)
**When** I submit
**Then** the `wrong-multiplier` hint ladder rung 0 appears

**AC4 — Correct submission shows success, Section marked ✓, no auto-advance (FR-13)**
**Given** a fully-correct submission (outs=9, streets=2, equity ∈ 33–39)
**When** validated
**Then** the green success row appears, the sidebar marks the Equity section with a gold ✓, and there is no auto-advance — Next remains the learner's choice

## Tasks / Subtasks

- [x] **Task 1: Add optional `content` prop to `AssessmentScreen.svelte` (AC: #1)**
  - [x] **Modify:** `pokermath/src/screens/AssessmentScreen.svelte`
  - [x] Add `import type { Component } from 'svelte'` at the top of the `<script>` block (after existing imports)
  - [x] Extend the props destructure to include `content`:
    ```ts
    let {
      sectionId,
      title,
      subtitle,
      scenario,
      answer,
      content: Content = undefined,
    }: {
      sectionId: SectionId
      title: string
      subtitle: string
      scenario: Scenario
      answer: AnswerKey
      content?: Component
    } = $props()
    ```
  - [x] In the template, insert a `.prose` block **between `.section-head` and the `{#if scenario.hand.length > 0}` card-region block**:
    ```svelte
    {#if Content}
      <div class="prose">
        <Content />
      </div>
    {/if}
    ```
  - [x] Add scoped CSS for `.prose` (mirrors InformationalScreen — same visual treatment, no sharing needed since Svelte styles are scoped):
    ```css
    .prose {
      max-width: 60ch;           /* same prose cap as InformationalScreen; no token for ch */
      font: var(--font-body-lg);
      color: var(--color-text-on-felt);
    }

    .prose :global(p) { margin: 0; }
    .prose :global(p + p) { margin-top: var(--space-4); }
    .prose :global(p + .group) { margin-top: var(--space-4); }
    .prose :global(.group + p) { margin-top: var(--space-4); }
    .prose :global(strong) { font-weight: 600; color: var(--color-text-on-felt); }
    .prose :global(code.notation) { font: var(--font-value); color: var(--color-gold); }
    ```
    **Why copy, not share:** InformationalScreen's `.prose` is scoped; the `:global()` selectors only pierce into child components. Replicating them in AssessmentScreen is the correct Svelte pattern.

- [x] **Task 2: Wire `sectionContent` into AssessmentScreen in `App.svelte` (AC: #1)**
  - [x] **Modify:** `pokermath/src/App.svelte`
  - [x] `sectionContent` is **already imported** (`import { sectionContent } from './content/sections/index'`) — no new import needed
  - [x] Pass `content={sectionContent[active.id]}` to AssessmentScreen:
    ```svelte
    <AssessmentScreen
      sectionId={active.id}
      title={active.title}
      subtitle={active.subtitle}
      scenario={asmEntry.scenario}
      answer={asmEntry.answer}
      content={sectionContent[active.id]}
    />
    ```
    `sectionContent` is typed as `Partial<Record<SectionId, Component>>`, so `sectionContent[active.id]` is `Component | undefined`. The `content?: Component` prop in AssessmentScreen defaults to `undefined` when not provided — no type conflict.

- [x] **Task 3: Verify LO1 scenario data (AC: #1, #2)**
  - [x] Confirm `content/scenarios.ts` lo1 entry exactly matches FR-8 canonical scenario:
    - `hand: [parseCard('Ah'), parseCard('Kh')]` ✓
    - `board: [parseCard('Qh'), parseCard('8h'), parseCard('7c')]` ✓
    - `answer: { outs: 9, streets: 2, equity: 36 }` ✓ (9-out flush draw, 2 streets → 36%)
  - [x] Confirm `content/hintLadders.ts` lo1 ladders match EXPERIENCE.md:
    - `miscounted-outs`: 3-rung ladder starting "Re-count your outs..." ✓
    - `wrong-multiplier`: 3-rung ladder starting "Check your multiplier..." ✓
  - [x] No changes to these files unless a discrepancy is found

- [x] **Task 4: Verify (AC: #1–#4)**
  - [x] `cd pokermath && npm run check` → 0 errors / 0 warnings (new `content?` prop must be TS-clean)
  - [x] `npm run test -- --run` → all prior tests pass (no logic changes in this story)
  - [x] `npm run build` → clean static `dist/` (AR-8)
  - [x] **Manual smoke test** (`npm run dev`):
    - Navigate to **Equity (LO1)** in the sidebar
    - **AC1:** Instructional prose from `EquityContent.svelte` renders above the "Assessment" kicker; hand `Ah Kh` and board `Qh 8h 7c` appear as four-color card graphics; three input fields (Outs, Streets remaining, Your equity %) are present and empty; outs value is NOT pre-filled ✓
    - **Check Answer disabled:** until all three fields have input, the button is disabled (gold state absent) ✓
    - **AC3 miscounted-outs path:** Enter outs=7, streets=2, equity=28. Click Check Answer → amber hint row, rung 0: "Re-count your outs...". Submit again with same wrong outs → rung 1 escalates: "All your hearts are outs..." ✓
    - **AC3 wrong-multiplier path:** Enter outs=9, streets=2, equity=18. Click Check Answer → amber hint row, rung 0: "Check your multiplier..." ✓
    - **AC2 + AC4 correct path:** Enter outs=9, streets=2, equity=36. Click Check Answer → green success row; sidebar Equity item now shows gold ✓; no auto-advance; Next button still present and manually usable ✓
    - **Equity ±3pp tolerance:** Verify outs=9, streets=2, equity=33 passes; outs=9, streets=2, equity=39 passes; equity=32 fails ✓
    - **Cheat sheet round-trip:** While LO1 assessment has outs=9 typed, open Hand Rankings from sidebar → modal opens, Esc closes → outs field still shows 9 (inputs preserved, FR-6) ✓
    - **Reload behavior:** Page reload returns to Introduction with LO1 fields cleared and ✓ absent (FR-3) ✓
    - **Keyboard:** Tab through outs → streets → equity → Check Answer; Enter submits when enabled (UX-DR20) ✓

## Dev Notes

### Why this story: completing the `sectionContent` wiring deferred since Story 2.4

`src/content/sections/index.ts` (line 8–9) contains this explicit deferral comment:
```ts
// Per-Section instructional content (AR-9). Partial: assessment-kind Sections
// wire their teaching content in later stories / Epic 3.
```
All four content components (`IntroContent`, `EquityContent`, `PotOddsContent`, `CallingContent`) are already registered in `sectionContent`. This story fulfills that deferral for LO1 by adding a `content?` prop to `AssessmentScreen` and wiring it in `App.svelte`. Stories 3.7 and 3.8 inherit the same mechanism for LO2 and LO3 at zero additional cost.

### Screen layout after this change

Current AssessmentScreen layout (before this story):
1. `.section-head` (kicker "ASSESSMENT" + section title H1)
2. `.card-region` (board + hand, if `scenario.hand.length > 0`)
3. `.prompt`
4. `.panel` (fields + feedback + Check Answer)
5. `<Pager />`

After this story (when `content` is provided):
1. `.section-head` (kicker "ASSESSMENT" + section title H1)
2. `.prose` (instructional content — EquityContent for LO1)
3. `.card-region` (board + hand)
4. `.prompt`
5. `.panel` (fields + feedback + Check Answer)
6. `<Pager />`

The kicker "ASSESSMENT" stays first — it orients the learner to the section type. Prose follows immediately, teaching the concept before the assessment chrome. This satisfies FR-4 (per-Section instructional text) and LDR-3 (concept before shorthand).

### LO2 and LO3 inherit automatically

The `App.svelte` change passes `content={sectionContent[active.id]}` unconditionally for all assessment sections. `sectionContent` has entries for 'equity', 'pot-odds', and 'calling', so PotOddsContent and CallingContent will render in LO2 and LO3 assessments once those stories are exercised. No additional App.svelte changes in 3.7 or 3.8.

### What `sectionContent[active.id]` returns for assessment sections

`sectionContent` is typed `Partial<Record<SectionId, Component>>`. For assessment section IDs ('equity', 'pot-odds', 'calling'), the record has Component values. For 'intro' (kind: 'informational'), the lookup in the `{#if active.kind === 'assessment'}` branch never runs. No type guard needed — `content?: Component` defaults to `undefined` when the key happens to be absent.

### Svelte 5 component-as-prop pattern

Passing a Svelte 5 component as a prop and rendering it dynamically:
```svelte
let { content: Content = undefined }: { content?: Component } = $props()
// Template:
{#if Content}<div class="prose"><Content /></div>{/if}
```
`Content` (capitalized per Svelte convention) is required for the compiler to treat it as a component call rather than a plain expression. If `undefined`, the `{#if}` block is not mounted — no empty DOM node.

### EquityContent.svelte — what it renders

`EquityContent.svelte` is the instructional prose component built in Story 2.4. It renders the addition-law derivation and Rule of 2-and-4 explanation. It uses the same prose conventions as other content components: `<p>` tags, `<strong>` for emphasis, and `<code class="notation">` for hand notation (e.g., `Ah`, `Kh`). The `.prose :global()` rules in AssessmentScreen will style it identically to how it renders in InformationalScreen.

### LO1 scenario data sanity check

| Field | Stored value | Derivation | Accepts |
|---|---|---|---|
| `outs` | 9 | 13 hearts − 4 showing (Qh, 8h, Ah, Kh) = 9 | exact: 9 |
| `streets` | 2 | flop → turn and turn → river remain | exact: 2 |
| `equity` | 36 | 9 × 4 = 36% | 33–39% (±3pp band) |

The flush draw: Ah Kh needs one more heart. Hearts showing: Qh (board), 8h (board), Ah (hand), Kh (hand) = 4 hearts. Remaining hearts: 13 − 4 = 9 outs. Two streets (turn + river). Rule of 2-and-4: 9 × 4 = 36%. ✓

### Hint ladder — error detection for LO1

The hint engine (`src/lib/assessment/hints.ts`) and ladders (`content/hintLadders.ts`) are complete from Stories 3.2–3.3. No changes needed. For reference:

| Submitted | Detected error | Ladder first rung |
|---|---|---|
| outs ≠ 9 | `miscounted-outs` | "Re-count your outs — how many unseen cards complete your draw?" |
| outs = 9, streets = 2, equity = 18 (9 × 2) | `wrong-multiplier` | "Check your multiplier — how many streets are still to come on the flop?" |

### No LO-specific success message needed

The default `successMessage = 'Well done — your answer is correct.'` (from `FeedbackRow`) is appropriate for LO1. The 3.5 dev notes left the door open for LO-specific wording but it is not required. Do not add it unless UX feedback demands it — keep scope minimal.

### Svelte 5 runes — no new patterns

All rune patterns used in this story were established in 3.4 and 3.5. Nothing new. The `content` prop is a standard Svelte 5 `$props()` addition with a default value.

### File changes summary

2 files touched:
- `pokermath/src/screens/AssessmentScreen.svelte` — MODIFIED (add `content?: Component` prop + `{#if Content}` prose block + `.prose` CSS)
- `pokermath/src/App.svelte` — MODIFIED (pass `content={sectionContent[active.id]}` to AssessmentScreen)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.6] — story statement + ACs
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-8 LO1 canonical scenario (outs=9, streets=2, equity≈36%); FR-11 ±3pp tolerance; FR-12 hint; FR-13 success + ✓
- [Source: _bmad-output/planning-artifacts/architecture.md] — AR-9 content split; AR-5 single store
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — UX-DR5 assessment archetype; UX-DR12 hint row; UX-DR13 success row; LDR-3 concept before shorthand
- [Source: pokermath/src/content/sections/index.ts:8-9] — deferral comment "wire their teaching content in later stories / Epic 3"
- [Source: pokermath/src/screens/AssessmentScreen.svelte] — existing props, template structure, and CSS to be extended
- [Source: pokermath/src/App.svelte:11,18-39] — sectionContent already imported; AssessmentScreen render block to update
- [Source: pokermath/src/screens/InformationalScreen.svelte:26-98] — `.prose` CSS to replicate in AssessmentScreen scoped styles
- [Source: pokermath/src/content/scenarios.ts] — lo1 scenario: hand Ah Kh, board Qh 8h 7c, answer {outs:9, streets:2, equity:36}
- [Source: pokermath/src/content/hintLadders.ts] — lo1 ladders: miscounted-outs (3 rungs), wrong-multiplier (3 rungs)
- [Source: _bmad-output/implementation-artifacts/3-5-hint-success-feedback-rows.md#Dev-Notes] — established FeedbackRow 3-state design; successMessage default; scope boundary 3.6 consumes

## File List

- `pokermath/src/screens/AssessmentScreen.svelte` — MODIFIED: add `content?: Component` prop; insert `{#if Content}<div class="prose"><Content /></div>{/if}` between section-head and card-region; add scoped `.prose` CSS block
- `pokermath/src/App.svelte` — MODIFIED: pass `content={sectionContent[active.id]}` to AssessmentScreen (sectionContent already imported)

## Dev Agent Record

### Implementation Notes

Fulfilled the `sectionContent` deferral noted in `src/content/sections/index.ts` (lines 8–9). Two files touched:

1. `AssessmentScreen.svelte` — added `import type { Component } from 'svelte'`; extended `$props()` destructure with `content: Content = undefined`; inserted `{#if Content}<div class="prose"><Content /></div>{/if}` between `.section-head` and `.card-region`; added `.prose` scoped CSS block (6 rules with `:global()` selectors to pierce into the child component).

2. `App.svelte` — added `content={sectionContent[active.id]}` to the `<AssessmentScreen>` call. `sectionContent` was already imported; no new imports required.

Scenario data (`scenarios.ts`) and hint ladders (`hintLadders.ts`) verified exact match to spec — no changes needed.

### Completion Notes

- `npm run check`: 0 errors, 0 warnings (116 files)
- `npm run test -- --run`: 170/170 tests pass, 8 test files
- `npm run build`: clean dist (74.94 kB JS, 15.27 kB CSS)
- All AC1–AC4 smoke-tested via Playwright headless (13 screenshots in `_verify/3-6/`)
- AC1: prose renders above card-region, three fields empty on load
- AC2: equity 33–39 all pass; equity 32 fails
- AC3: miscounted-outs ladder escalates rung 0→1; wrong-multiplier fires on equity=18
- AC4: green success row, sidebar `done` class (gold ✓), no auto-advance, Next present
- Cheat sheet round-trip preserves fields; reload returns to Introduction with state cleared

## Change Log

- 2026-05-31: Story 3.6 implemented — added `content?: Component` prop to `AssessmentScreen.svelte`; wired `sectionContent[active.id]` in `App.svelte`; fulfils the Epic 3 content-wiring deferral for LO1 (and implicitly LO2/LO3 via same prop)
