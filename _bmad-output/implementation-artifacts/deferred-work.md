# Deferred Work

## Deferred from: code review of 3-6-lo1-equity-assessment (2026-05-31)

- `sectionContent[active.id]` silently passes `undefined` for future unknown assessment sections — `Partial<Record<SectionId, Component>>` has no type enforcement that all assessment SectionIds have entries; a new section added without a corresponding sectionContent entry silently renders no prose with no error. [`App.svelte`]
- `{#if Content}` truthiness guard insufficient against truthy non-component values — a non-function truthy value in sectionContent bypasses the guard and causes a runtime mount error; TypeScript's `Component` type covers this at compile time for all current consumers. [`AssessmentScreen.svelte`]
- `.prose` CSS block duplicated verbatim from `InformationalScreen.svelte` — intentional per story spec (copy-not-share is the correct Svelte pattern for scoped styles with `:global()` selectors); future prose typography changes must be applied in both screens. [`AssessmentScreen.svelte`]
- `max-width: 60ch` on `.prose` is a no-op when the parent `.main` column is narrower than 60ch — pre-existing behavior shared with `InformationalScreen`; no overflow handling declared on `.body` or `.screen`. [`AssessmentScreen.svelte`]

## Deferred from: code review of 3-5-hint-success-feedback-rows (2026-05-31)

- `getSectionComplete` silently returns `false` for unrecognized `section.id` — hard-coded IDs only ('equity', 'pot-odds', 'calling'); a new section added to `sections.ts` without updating this function permanently shows as incomplete with no type error or warning. [`Sidebar.svelte:8-13`]
- `passed` flag never resets to `false` once set `true` — intentional per AR-5 persistent design; stale sidebar ✓ persists if assessment state is ever reset by a future story; add a reset path in that story. [`appState.svelte.ts`]
- `SidebarNavItem` CSS `::after` ✓ has no accessible label — pre-existing from Story 1.4; `.item.done .t::after { content: ' ✓'; }` is pure CSS generated content, not announced by screen readers; no `aria-label` or visually-hidden text on the nav button communicates section-complete state to AT users. [`SidebarNavItem.svelte:77-80`]

## Deferred from: code review of 3-4-assessment-screen-archetype-input-primitives (2026-05-31)

- No `{:else}` fallback for sections with neither assessment nor informational content — temp placeholder removed intentionally per story spec; a new unregistered section renders blank; add a dev-time warning or fallback when needed. [`App.svelte:main branch`]
- LO3 always fails validation (`decision` omitted from `buildSubmitted`) — intentional intermediate behavior; every LO3 submit returns `passed: false` and fires a "wrong-comparison-direction" hint even for correct numeric answers until Story 3.8 wires `CallFoldToggle`. [`AssessmentScreen.svelte:buildSubmitted`]
- `prev.rung` clamp heals in-flight copy but not persisted state — `handleSubmit` spreads `{ ...rawPrev, rung: Math.max(0, rawPrev.rung) }` but `appState.assessments[lo].hint.rung` stays negative if ever written so; on re-submit `selectHint` receives a clamped `prev.rung = 0` and returns rung 1, permanently skipping rung 0. [`AssessmentScreen.svelte:handleSubmit`]
- Rung clamp has no upper-bound cap — `prev.rung` is clamped at 0 (lower) only; a stored `hint.rung` exceeding the ladder's last index passes unchecked to `selectHint`. [`AssessmentScreen.svelte:handleSubmit`]
- Assessment state (fields/result/hint/passed) never reset on navigation — intentional persistent design per AR-5; stale `passed: true` visible if returning to a section after scenario data changes; add a reset-on-navigate hook if desired. [`appState.svelte.ts`]
- CardGroup renders an empty labeled container when `scenario.board` is empty but `scenario.hand` is non-empty — `{#if scenario.hand.length > 0}` guard enters the card-region block and renders `<CardGroup cards={[]} label="Board" />`; no current scenario has this shape; add a per-CardGroup guard if a future scenario does. [`AssessmentScreen.svelte:card-region`]
- Both `<label for>` and `aria-label` on the same NumericInput — AT uses `aria-label` (overrides `<label>`), so screen readers announce "Number of outs" while the visible label reads "Outs"; both intentionally specified by the story; address in a future ARIA pass by unifying texts or removing `aria-label` when a visual label is present. [`AssessmentScreen.svelte:field rows`]

## Deferred from: code review of 3-3-hint-selection-engine-with-unit-tests (2026-05-31)

- `detectError` missing `default: return null` — switch has no default case; unrecognized `scenario.lo` returns `undefined` (not `null`), violating the `ErrorType | null` contract; `selectHint` is accidentally safe via `== null`, but strict callers would break. Fix: add `default: return null` after the switch. [`hints.ts`, end of switch] — **patch item left as action in story file**
- `prev.rung` negative integer yields `undefined` text in `selectHint` — `Math.min(prev.rung + 1, rungs.length - 1)` with a negative `prev.rung` produces a negative index; `rungs[negative]` = `undefined`, silently violating `HintRung.text: string`. Pre-existing; 3.4/3.5 store will be the sole producer of `prev` values and always yields non-negative rungs. Add a `Math.max(0, ...)` clamp when implementing the store in 3.4. [`hints.ts:65`]
- Non-null assertions `answer.equity!`/`answer.ratio!` silent on wrong-LO data — `AnswerKey` fields are all optional in `types.ts` (frozen 3.1); `!` assertions are sound for all authored callers but fail silently (NaN) or throw if called with a mismatched scenario/answer pair. Address if `types.ts` is ever unfrozen or if LO-typed answer keys are introduced. [`hints.ts:19,33,38,42`]
- `parseNum` hex/scientific coercion (`'0x9'`→9, `'1e2'`→100, `'Infinity'`→Infinity) — pre-existing `Number()` behavior in `parseNum` from frozen 3.2 `validation.ts`; now also affects hint detection. A learner typing `'0x9'` for outs would be classified as correct. Fix requires modifying `parseNum` in `validation.ts` (e.g., rejecting non-decimal strings). [`validation.ts:17`]

## Deferred from: code review of 3-2-validation-engine-with-unit-tests (2026-05-30)

- `answer.requiredEquity` is never read by `validate()` — the `requiredEquity` check always uses the hardcoded `REQUIRED_EQUITY_BAND [16,17]` and ignores whatever `answer.requiredEquity` holds. Intentional for current LO2/LO3 scenarios (answer=16.7, within band). If a future scenario changes the `requiredEquity` answer away from ~16.7, `REQUIRED_EQUITY_BAND` must be updated in tandem — the two values are silently coupled. [`validation.ts:44`]

## Deferred from: code review of 3-1-assessment-data-contracts-scenarios-hint-ladders (2026-05-30)

- `AnswerKey` fully optional — all six fields are `?`; downstream 3.2–3.8 must null-guard every field access before use.
- `HintLadder` is `Partial<Record<ErrorType, ...>>` — 3.3 hint engine must guard against `undefined` when an error type is not defined for a given LO.
- `ValidationResult.hint` optional — 3.6–3.8 must null-guard before accessing `hint.text`/`hint.rung`; a discriminated union would enforce this at compile time.
- `HintRung.rung` no bounds enforcement — 3.3 must clamp rung index to ladder array length before indexing.
- `Ratio` admits zero, negative, NaN — 3.2 must validate ratio inputs at input boundaries.
- `requiredEquity: 16.7` stored as float literal — 3.2 needs band comparison, not exact equality; no `REQUIRED_EQUITY_TOLERANCE_BAND` constant defined (contrast with `EQUITY_TOLERANCE_PP`).
- `Scenario.id` typed as plain `string` with no uniqueness constraint — 3.6–3.8 should not use `id` as a lookup key without verifying uniqueness.
- LO2 `hand: [], board: []` — 3.4/3.6 card-rendering screens must conditionally hide `CardGroup` when `hand.length === 0` to avoid orphan labels.
- `ratio-percentage-confusion` rung 2 wording "what is already in the pot" is ambiguous between pre-bet ($40) and post-bet ($50) pot — minor content clarity improvement.

## Deferred from: code review of 2-7-cheat-sheet-panel-modal-mechanism (2026-05-30)

- Hardcoded `id="cs-title"` would conflict if two `CheatSheetModal` instances are ever mounted simultaneously — `lib/components/CheatSheetModal.svelte:35`; single-modal architecture guarantees one instance today; revisit if stacked modals are ever introduced.
- `modal-layer pointer-events: none` + scrim `pointer-events: auto` coupling is fragile for future non-modal layer children — `App.svelte:89`; pre-existing documented caveat; any future layer child that omits `pointer-events: auto` will silently receive no mouse events.
- Escape keydown in `CheatSheetModal` does not call `e.stopPropagation()` — `lib/components/CheatSheetModal.svelte:21`; no competing Escape listener exists today; add if future keyboard handlers stack on `svelte:window`.
- Drag-release on scrim closes modal (mouseup after text-select ending on scrim passes the `e.target === e.currentTarget` guard) — `lib/components/CheatSheetModal.svelte:25`; minor UX edge case, not required by spec.
- `navlabel <span>` "Cheat Sheets" has no semantic group association for assistive technology — `lib/components/Sidebar.svelte:25`; pre-existing house pattern (the "Sections" navlabel uses the same `<span>` shape); address in a future a11y pass.
- Sheet buttons missing `aria-haspopup="dialog"` — `lib/components/Sidebar.svelte:27-31`; enhancement beyond NFR-2 scope for 2.7; add when doing a full ARIA pass.
- ~~`cs-placeholder` style scoped to `App.svelte` is invisibly coupled to the snippet location~~ — **RESOLVED in Story 2.8**: placeholder `<p>` and `.cs-placeholder` style both removed from `App.svelte`.
- ~~Scroll position not reset when user switches sheets without closing~~ — **RESOLVED in Story 2.8**: `{#key openSheet.id}` added to `App.svelte` modal block; forces full remount on sheet switch, resetting `.body` `scrollTop` to 0.
- Invalid `openCheatSheet` value silently fails to open modal — `lib/appState.svelte.ts:7`; TypeScript-guarded at compile time; direct mutation is the only runtime write path; add a runtime guard only if a serialized/restored state mechanism is introduced.

## Deferred from: code review of 2-2-informational-screen-archetype (2026-05-30)

- `parseCard` called at module-eval time in `IntroContent.svelte` with no error boundary — `content/sections/IntroContent.svelte:11`; current hardcoded literals (`Ah`, `Tc`) are valid; a typo on any future card literal throws synchronously during component instantiation and tears down the component tree with a blank screen.
- Informational section in `sections.ts` with no matching `sectionContent` entry silently renders the assessment fallback (title + Pager, no prose) — `App.svelte:16`; the `{#if … && sectionContent[active.id]}` guard is intentional; a registry-completeness check is desirable but deferred per deferred-work.md:46.
- Empty `CardGroup` (`cards = []` default now reachable) renders a visible label with no cards beneath it — `CardGroup.svelte:5,9-13`; no current consumer hits this state; add an empty-state guard (hide group or show placeholder) when a real consumer needs `cards` to be optional.
- `appState.currentSection` unbounded — any write outside `[0, sections.length-1]` makes `active` `undefined` and crashes every `active.*` access in `App.svelte` — `App.svelte:9`; Pager clamps its own handlers; the guard belongs at the state write-site or derivation; pre-existing from Epic 1.
- `{#key sectionId}` in `InformationalScreen` re-mounts the slotted `Content` component on every section switch — `InformationalScreen.svelte:19-30`; stateless for current `IntroContent`; any future content component using `onMount`, async effects, or local state will have those silently reset on navigation.

## Deferred from: code review of 2-1-card-notation-graphical-card-rendering (2026-05-29)

- Duplicate card keys crash `CardGroup` keyed `{#each}` — `CardGroup.svelte:11`; in poker cards are unique per deck so same-card duplicates are an authoring bug; add upstream dedup guard or uniqueness assertion when content authors build groups in Story 2.2.
- RANKS/SUITS arrays duplicated in `cards.test.ts` instead of imported from `cards.ts` — `cards.test.ts:64-65`; divergence risk if source arrays change; export `RANKS`/`SUITS` from `cards.ts` and import in test when convenient.
- ~~`CardGroup` `cards` prop has no default value~~ — **RESOLVED in Story 2.2**: added `cards = []` default at `CardGroup.svelte:5`.
- `PlayingCard` `width: 60px` + `aspect-ratio` has no overflow handling — `PlayingCard.svelte:21-22`; no overflow scenario with current token values; add `overflow: hidden` or tune width if `--font-value-lg` changes in a future story.

## Deferred from: code review of 1-6-keyboard-operability-visible-focus-restrained-motion-baseline (2026-05-29)

- Reduced-motion guard doesn't zero `animation-delay`/`transition-delay` — `global.css:21-29`; no animation or transition currently uses a delay; add `animation-delay: 0ms !important; transition-delay: 0ms !important;` to the `@media prefers-reduced-motion` block when Epic 2 introduces its first delayed transition.
- `{#key active.id}` remount will lose focus when interactive content is placed inside the keyed block — `App.svelte:14-19`; no interactive elements inside `.section-head` currently; when Epic 2 extends the `{#key}` scope to wrap full screen content, add focus-restore logic (e.g., `focus()` the screen heading on mount).


## Deferred from: code review of 1-5-back-next-pager (2026-05-29)

- `Pager.svelte` `<button>` elements lack individual `aria-label` — `Pager.svelte:19,23`; visible text "← Back"/"Next →" is sufficient for now; full ARIA audit (aria-label, focus-ring, heading hierarchy) is Story 1.6 scope.

## Deferred from: code review of 1-4-sidebar-section-index-free-navigation (2026-05-29)

- Out-of-bounds `currentSection` produces `undefined` active — `App.svelte:6`, `Sidebar.svelte:17`; Story 1.5 pager will constrain all writes to valid indices (0–3); no speculative guard here per spec.
- Accessible composite name / ARIA polish on nav `<button>` — `SidebarNavItem.svelte:17-27`; native button with visible text sufficient for now; full ARIA audit (aria-label, focus-ring, heading hierarchy) is Story 1.6 scope.

## Deferred from: code review of 1-3-two-pane-app-frame-in-memory-state-store (2026-05-29)

- `active` is `undefined` when `currentSection` is out-of-range — no bounds check on `sections[appState.currentSection]` in `App.svelte:5`; fix belongs with Story 1.4/1.5 when nav controls are added.
- `appState.currentSection` has no type or value guard on writes — `appState.svelte.ts:3`; any caller can set an arbitrary integer; fix belongs with Story 1.4/1.5.
- `noUncheckedIndexedAccess` not enabled in `tsconfig.app.json` — TypeScript reports `Section` (not `Section | undefined`) on array index access, masking the out-of-range risk; pre-existing config decision.
- `modal-layer` `pointer-events: none` at container level silently blocks future child interactive elements — `App.svelte:62`; document this caveat when Story 2.7 adds modal content so that component sets `pointer-events: auto` on the modal itself.
- ARIA / semantic HTML — `<span>` wordmark has no heading role, `<aside>` has no `aria-label`, `<h1>` heading hierarchy inverted (wordmark should be `<h1>`, section title `<h2>`) — `App.svelte:9-10,14`; Story 1.6 scope.
- No `overflow` handling on `.side`/`.main` panels — `App.svelte:28,41`; content will bleed out of `100vh` container when long; address in a future layout story.

## Deferred from: code review of 1-2-deep-table-design-token-layer (2026-05-29)

- Google Fonts offline/blocked — silent font degradation [pokermath/index.html:6-8] — acknowledged tradeoff per spec; fallback stacks (`serif`/`sans-serif`/`monospace`) present in all font tokens. Revisit if true offline fidelity is required (would need `@fontsource` self-hosting).
- `font-display: swap` behavior controlled by CDN URL parameter — invisible to code readers [pokermath/index.html:8] — documentation concern only; add a comment if team needs visibility.
- Typography companion tokens (`--tracking-*`) must be applied separately alongside font shorthand tokens; `--font-label-caps` implies caps styling but no `text-transform` companion token exists [pokermath/src/styles/tokens.css:27-40] — intentional per CSS `font` shorthand limitations; consuming components must apply `letter-spacing` and `text-transform` manually.
- `--ratio-card: 2 / 3` browser compatibility — older browsers without `aspect-ratio` support [pokermath/src/styles/tokens.css:68] — pre-existing browser target concern; token is not yet consumed; address when PlayingCard component is built.
- `--shadow-button-primary` lacks hover/active/focus state variants [pokermath/src/styles/tokens.css:60] — future story scope; address when button component is built.
- rgba() tints duplicate base color RGB literals (`--color-success-tint`, `--color-hint-tint`) [pokermath/src/styles/tokens.css:16,18] — verbatim DESIGN.md transcription; `color-mix()` refactor is future work when browser support is sufficient.

## Deferred from: code review of 1-1-verified-project-scaffold-test-harness (2026-05-29)

- No CI pipeline — `.github/workflows` absent; test/check/build scripts only enforce locally. Address when setting up deployment/CI infrastructure.
- `environment: 'node'` in Vitest config is a latent constraint — component tests will need `jsdom`/`happy-dom` (not currently a dependency). Revisit when writing the first component test in Epic 2 or 3.
- No `engines` field in `package.json` — Node 24.x implied by `@types/node^24` but not documented. Add when setting up CI so runner version is explicit.
- Non-null assertion `!` on `getElementById('app')` in `main.ts` — pre-existing; safe because `index.html` has `<div id="app">`, but silently dangerous if mount target ever moves.
- Bleeding-edge version ranges (TypeScript 6, Vite 8, Vitest 4) — intentional per AC4; lockfile reproducibility depends on the git repo structure decision (see story 1.1 decision-needed findings).
