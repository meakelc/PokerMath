---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/prd.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/addendum.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md
---

# PokerMath - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PokerMath, decomposing the requirements from the PRD (+ addendum), UX Design (EXPERIENCE.md + DESIGN.md), and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Linear Section navigation — a learner can move forward and backward through the four ordered Sections (Introduction → Equity/LO1 → Pot Odds/LO2 → Calling Profitably/LO3) using Next and Back controls. Next on Intro lands on LO1; Next on LO3 is the end (no/disabled Next); Back is absent/disabled on Intro; Section order is fixed.
FR-2: Sidebar Section index with current-position indication — all four Sections render with titles + one-line subtitles in fixed order; the active Section is visually distinguished; selecting any Section jumps directly to it (all four are free jump targets at all times).
FR-3: Single-session, no persistence — a page reload returns the learner to the Introduction with all inputs and progress cleared; no login/account/save/resume exists; no score/grade/completion record is persisted.
FR-4: Per-Section instructional content — each of the four Sections renders its own instructional text with at least one contextual graphic region. LO1 includes the addition-law equity derivation AND the Rule of 2-and-4 as its approximation; LO2 includes the pot odds concept + at least one in-game contextualization; LO3 includes a law-of-large-numbers framing with at least one toy-game example + the method for stacking equity vs. required equity threshold.
FR-5: Introduction & poker hand notation — the Introduction states assumed prerequisites (52-card deck, Hold 'Em rules) and points to the Cheat Sheets; hand notation (rank letter + suit letter, e.g., Ah, Tc) is taught in the Introduction and used consistently in all later Sections.
FR-6: On-demand Cheat Sheets — all four Cheat Sheets (52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon) are accessible from every Section; opening/closing a Cheat Sheet does not change the active Section; any text entered in an in-progress assessment is preserved across opening/closing a Cheat Sheet (presented as an overlay/expandable panel, not a route change).
FR-7: Graphical card rendering — the system renders any specified card or set of cards as visual playing-card graphics showing rank and suit; suit is conveyed by both symbol and color, never color alone (♥ red, ♦ blue, ♣ green, ♠ black); board and hand render as distinct labeled groups on assessment screens.
FR-8: LO1 equity assessment — a learner can compute and submit a hand's equity for a given board and hand using the Rule of 2-and-4. Fields for outs, remaining streets, and resulting equity %; the learner derives the out count themselves (outs not pre-supplied); the scenario presents hand + flop as card graphics; submitted via Check Answer; validated per FR-11. Canonical scenario: hand Ah Kh, flop Qh 8h 7c (9-out flush draw, 2 streets → ≈36%).
FR-9: LO2 pot odds assessment — a learner can compute and submit pot odds for a given pot size and call cost, as both a ratio and a percentage. Fields for the ratio and the equivalent percentage; scenario presents pot size and bet/call amount; submitted via Check Answer; validated per FR-11. Canonical scenario: $40 pot + $10 bet → 5:1 ratio, ≈16.7% required equity.
FR-10: LO3 call profitability assessment — a learner can compute equity and pot odds for a given scenario and submit a Call/Fold judgment. Fields for equity, pot odds (or required equity threshold), and a Call/Fold decision; the scenario presents hand, board, pot, and bet (the all-in example); the Call/Fold judgment validates against the correct equity-vs-threshold comparison. Canonical scenario: Ah Kh on Qh 8h 7c, $40 pot, opponent all-in $40 → equity ≈36% vs required ≈16.7%, correct judgment is Call.
FR-11: Answer checking with approximation tolerance — the system validates each submitted assessment field and reports correct/incorrect. Exact-valued fields (outs, remaining streets, pot odds ratio) require exact correctness; the Rule-of-2-and-4 equity field accepts any value within ±3 percentage points of the textbook `outs × 4` value (e.g., 33–39% for the LO1 scenario); pot odds use the `cost/(pot+cost)` break-even convention (5:1 / ≈16.7%, accept 16–17%); an assessment is "passed" only when all of its fields validate as correct. Check Answer is disabled until every field has input.
FR-12: Context-aware hint and retry on incorrect answer — on an incorrect submission, the system shows a context-aware, escalating hint tied to the likely mistake (miscounted outs, wrong street multiplier ×2 vs ×4, 10/50=20% denominator error, ratio/percentage confusion, wrong comparison direction) without revealing the correct answer; the learner can resubmit after a hint with prior inputs editable; retries are unlimited (no lockout).
FR-13: Correct-answer confirmation — on a fully-correct submission, the system confirms success with a clear indication distinct from the hint state; advancing remains available (passing is not required to use Next, but success is acknowledged) and the Section is marked complete (session-only ✓).

### NonFunctional Requirements

NFR-1 (Performance): Section transitions and Check Answer feedback feel instant — no perceptible spinner/loader under normal conditions (guaranteed by client-only, static, single-session design; loaders explicitly banned).
NFR-2 (Accessibility floor): No formal WCAG/508 conformance target. Hard floor: basic legibility, adequate contrast, and non-color-dependent cues — suit information must never rely on color alone (symbol + color), feedback must never rely on color alone (glyph + words), active Section indicated by more than color, visible focus on all interactive elements, full keyboard operability, no text smaller than the caption token.
NFR-3 (Aesthetic & tone): Calm, focused "study tool" feel per the finalized "Deep Table" design system (deep felt green + disciplined gold accent, Fraunces/Inter/JetBrains Mono). Instructional voice is plain, encouraging, second-person ("warm coach"). Restrained motion is a hard rule.
NFR-4 (Reliability/observability): Not applicable at meaningful scale — no persistence, no users to monitor, no uptime SLA.

**Learning Design Requirements (LDR — course-prescribed, load-bearing pedagogical constraints):**

LDR-1 (Bloom alignment): LO1 and LO2 must target procedural knowledge at the *Executing* level (applying the Rule of 2-and-4 and the pot odds formula); LO3 must target conceptual knowledge at the *Evaluating* level (judging a call by comparing two computed values). Assessments must require the cognitive act named, not a lower one.
LDR-2 (Sequential dependency): Content order must reflect that LO3 is not meaningfully performable without LO1 and LO2 internalized; the linear flow encodes this dependency structurally.
LDR-3 (Concept before shorthand): The Rule of 2-and-4 must be introduced *after* its underlying derivation (addition law of probability); profitable-calling intuition (law of large numbers, toy games) must precede formula application in LO3.
LDR-4 (Compute, don't recognize): Assessments must require computed open input, never multiple choice.
LDR-5 (Corrective, non-revealing feedback): Incorrect feedback must diagnose the likely error and prompt another attempt without giving the answer.

### Additional Requirements

*Technical requirements derived from the Architecture Decision Document that affect implementation sequence and structure.*

- AR-1 (Starter template — FIRST story): Stack: Svelte 5 (runes) + TypeScript + Vite + Vitest; requires Node 20.19+/22.12+. **STATUS (2026-05-28): scaffold already initialized at `pokermath/`** via `npm create vite@latest pokermath -- --template svelte-ts` with Vitest installed (Svelte 5.55, TypeScript 6.0, Vite 8, Vitest 4.1.7, `node_modules` present). Remaining work for the first story: (a) add a `test` script (`vitest`) to `package.json` — currently only `dev`/`build`/`preview`/`check` exist; (b) verify `npm run dev`, `npm run build`, `npm run check`, and `npm run test` all succeed; (c) strip the demo scaffold cruft (`src/lib/Counter.svelte`, `src/assets/hero.png` + demo svgs, boilerplate in `App.svelte`/`app.css`) to a clean base. **This must be the first implementation story.**
- AR-2 (Design tokens layer): Transcribe the DESIGN.md "Deep Table" frontmatter (colors, typography, spacing, radius, component specs) once into `src/styles/tokens.css` as CSS custom properties — the single styling source of truth. Plain CSS, no Tailwind/CSS-in-JS. No hardcoded value that has a token.
- AR-3 (Canonical card notation): A card is the 2-char string `<rank><suit>` (rank ∈ A K Q J T 9 8 7 6 5 4 3 2 with **T = ten, never 10**; suit ∈ h d c s lowercase). All encode/decode routes through a single `parseCard`/`cardToString` pair in `src/lib/cards.ts`. Internal model `{ rank: Rank; suit: Suit }`.
- AR-4 (Pure validation + hint engine): `src/lib/assessment/` imports nothing from Svelte. Deterministic `validate(scenario, answers)` returns per-field correctness + overall pass/fail + (on failure) the selected hint via detected-error-type + escalating-rung logic. Unit-tested with Vitest (co-located `*.test.ts`). This is the prime test target (the only mandated tests).
- AR-5 (Single reactive store): All mutable runtime state lives in `src/lib/appState.svelte.ts` using Svelte 5 runes ($state/$derived). State held: current Section; per-LO assessment state (field values, attempt status, current hint rung, detected error type, passed flag); cheat-sheet modal open/target. Direct-mutation idiom; derived values via $derived; no external state library; all in-memory (clears on reload → satisfies FR-3 for free).
- AR-6 (No-router navigation): No router. A reactive Section index selects which screen renders; Back/Next adjust the index; sidebar items set it directly. Cheat sheets render as state-driven modal overlays, not routes; the underlying screen never unmounts (preserves inputs — FR-6).
- AR-7 (Shared data contracts): Single source of truth types — `Scenario` `{ id, lo, hand: Card[], board: Card[], pot?, bet?, prompt }`; `AnswerKey` (exact fields + banded equity ±3pp + pot-odds `cost/(pot+cost)` values); `ValidationResult` `{ perField, passed, hint? }`. Percentages stored as plain numbers (36 = 36%); ratios as `[antecedent, consequent]`. Never redefine answer logic inline in a component.
- AR-8 (Static-host deployment): `vite build` → static `dist/`, deployable to any static host (GitHub Pages / Netlify / Vercel static) or opened locally. No server, env config, or secrets. CI/CD optional.
- AR-9 (Content split): Authored content lives only under `src/content/` — scenarios, answer keys, hint-ladder copy, cheat-sheet copy as typed TS; instructional prose as per-Section Svelte components. No component hardcodes a scenario or hint string inline.

### UX Design Requirements

*Actionable design/build items extracted from EXPERIENCE.md (behavior) and DESIGN.md (visual identity). Each is specific enough to drive a story with testable acceptance criteria.*

UX-DR1 (Two-pane app frame): Fixed desktop two-pane layout — persistent left sidebar (~248px) + felt content area filling the rest. No responsive reflow. The frame never changes between screens.
UX-DR2 (Sidebar Section nav): Upper sidebar region listing the four Sections, each with title (body-md, 500) + one-line subtitle (caption, dim). Active item = `sidebar-active` background + 3px gold left-bar + title weight change (not color alone). Completed item shows a gold-deep ✓ appended to the title (session-only). All four always present and clickable.
UX-DR3 (Sidebar Cheat Sheets panel): Lower sidebar region (divided by `sidebar-border`) listing the four Cheat Sheets as quiet chevron rows; click opens the corresponding modal.
UX-DR4 (Informational screen archetype): Title + subtitle, instructional prose (capped ~60ch), at least one contextual graphic region, Back/Next pager. No assessment chrome.
UX-DR5 (Assessment screen archetype): Title + "Assessment" kicker (label-caps), prompt, a lifted `assessment-panel` (felt-panel) holding labeled input fields + Check Answer + feedback row, a card-graphic region for board + hand, Back/Next pager.
UX-DR6 (PlayingCard primitive): White 2:3 card face, `card` radius (8px), crisp double-shadow. Stacked layout — rank centered above suit symbol, both in value-lg mono, no corner indices. Four-color suit tokens. Accessibility (symbol + color, never color alone) is enforced here.
UX-DR7 (CardGroup): Renders a hand or board as a labeled group of PlayingCards; board and hand are visually distinct labeled groups on assessment screens.
UX-DR8 (Numeric input): Felt-deep mono well, translucent border that turns gold once filled; fixed `%` suffix shown inside where relevant (learner types only the number); rejects non-numeric input at entry (no thrown error); editable at all times including after a hint.
UX-DR9 (Ratio input): Two small mono fields with a fixed `:` glyph between (`[5] : [1]`); both required for the ratio to validate (LO2, LO3).
UX-DR10 (Call/Fold toggle): Two large mutually-exclusive buttons, neither pre-selected; selected fills gold with gold-ink text; arrow/space toggles when focused (LO3 only).
UX-DR11 (Check Answer button): Primary gold button; validates all fields together; disabled until every field of the assessment has input; one button per assessment; Enter submits when enabled.
UX-DR12 (Hint feedback row): Amber-bordered `feedback-hint` (hint-tint bg) with a leading `!` glyph + corrective words below the panel on a wrong submission; escalating ladder for the detected error; never reveals the answer; NO per-field red coloring — all fields stay neutral and editable.
UX-DR13 (Success feedback row): Green-bordered `feedback-success` (success-tint bg) with a leading ✓ + warm affirmation, replacing any hint on a fully-correct submission; marks the Section complete in the sidebar; NO auto-advance.
UX-DR14 (Cheat-sheet modal): White surface over a felt-tinted scrim, `lg` radius, highest shadow; close control + Esc + click-away dismiss; the underlying Section is unchanged and all in-progress inputs preserved on close.
UX-DR15 (Pager): Back (ghost button) = previous Section; Next (primary gold) = next Section; Back absent on Intro, no Next past LO3; always enabled within range regardless of assessment state (ungated).
UX-DR16 (Voice & tone microcopy): Warm-coach register — encouraging, human, second-person; no emoji, no hype, no cutesy. Plain in instruction; warmth concentrated in feedback. Applies to all UI copy, prompts, and feedback.
UX-DR17 (Hint ladder copy): Authored per-LO, per-error-type escalating rungs (e.g., LO1 miscounted-outs 3-rung ladder, LO1 wrong-multiplier ladder, LO2 denominator-error ladder, LO2 ratio/percentage ladder, LO3 wrong-comparison-direction ladder), each rung more pointed but never the final number.
UX-DR18 (Restrained motion — hard rule): State changes use only quick, quiet fades/position shifts. Banned: spinners/loaders, celebratory animation/confetti, card-dealing/flip animations, attention-pulsing, auto-advancing carousels.
UX-DR19 (Accessibility floor implementation): Suit never color-alone (symbol + color); feedback never color-alone (glyph + words); active Section indicated by gold bar + weight/background; focus always visible; tab order follows reading order on every screen; legible defaults (body-lg on felt, mono values, nothing below caption); full flow keyboard-completable.
UX-DR20 (Keyboard interaction model): Tab moves through fields in reading order; Enter submits Check Answer when enabled; Esc closes the cheat-sheet modal; arrow/space toggles Call/Fold when focused; no hover-dependent functionality.
UX-DR21 (Cold-open / reload behavior): App always lands on Introduction; all inputs, hints, and ✓ marks cleared; no resume prompt (UX surface of FR-3).

### FR Coverage Map

FR-1: Epic 1 — Linear Section navigation (Back/Next pager, fixed order)
FR-2: Epic 1 — Sidebar Section index with active highlight + free jumps
FR-3: Epic 1 — Single-session, no persistence (in-memory store; reload = fresh)
FR-4: Epic 2 — Per-Section instructional content (prose + graphic regions)
FR-5: Epic 2 — Introduction + hand notation taught and reused
FR-6: Epic 2 — On-demand cheat sheets (modal, inputs preserved)
FR-7: Epic 2 — Graphical four-color card rendering (PlayingCard + CardGroup)
FR-8: Epic 3 — LO1 equity assessment (outs / streets / equity %)
FR-9: Epic 3 — LO2 pot odds assessment (ratio + percentage)
FR-10: Epic 3 — LO3 call profitability assessment (equity vs threshold → Call/Fold)
FR-11: Epic 3 — Answer checking with approximation tolerance (validation engine)
FR-12: Epic 3 — Context-aware escalating hint + unlimited retry
FR-13: Epic 3 — Correct-answer confirmation + sidebar ✓

**NFR / LDR coverage:** NFR-1–4 baselines established in Epic 1 and honored throughout. LDR-2, LDR-3 (sequencing, concept-before-shorthand) realized in Epic 2 content. LDR-1, LDR-4, LDR-5 (Bloom alignment, compute-don't-recognize, corrective non-revealing feedback) realized in Epic 3 assessments.

**Additional (Architecture) coverage:** AR-1 (scaffold), AR-2 (tokens), AR-5 (store), AR-6 (no-router nav), AR-8 (build/deploy) → Epic 1. AR-3 (card notation), AR-9 (content split) → Epic 2. AR-4 (validation/hint engine), AR-7 (data contracts) → Epic 3.

**UX Design coverage:** UX-DR1, 2, 15, 18, 19, 20, 21 → Epic 1. UX-DR3, 4, 6, 7, 14, 16 → Epic 2. UX-DR5, 8, 9, 10, 11, 12, 13, 17 → Epic 3.

## Epic List

### Epic 1: Navigable Learning Shell
A learner can open PokerMath and move freely through all four Sections — via the sidebar or Back/Next — on the finished "Deep Table" visual base, with nothing persisted across reloads. This is the walking skeleton: it finalizes the scaffold, lays down the design-token layer, the two-pane frame, the single reactive store, no-router navigation, and the accessibility/motion/keyboard baselines that everything else inherits.
**FRs covered:** FR-1, FR-2, FR-3 (+ AR-1, AR-2, AR-5, AR-6, AR-8; UX-DR1, 2, 15, 18, 19, 20, 21; NFR-1–4)

### Epic 2: Learn the Concepts
A learner can read all instructional content across the four Sections — with graphical four-color cards and hand notation — and open any of the four cheat sheets on demand without losing their place. Builds the reusable PlayingCard primitive, the Informational screen archetype, all authored per-Section content (concept-before-shorthand), and the cheat-sheet panel + modal. This is the entire teaching half of the product.
**FRs covered:** FR-4, FR-5, FR-6, FR-7 (+ AR-3, AR-9; UX-DR3, 4, 6, 7, 14, 16; LDR-2, LDR-3)

### Epic 3: Practice & Prove Mastery
A learner can compute answers for all three assessments, get error-aware escalating hints on mistakes, and receive success confirmation — the climax where expected value becomes concrete. Builds the pure validation + hint engine (unit-tested), the Assessment screen archetype, all input primitives, the three scenarios + hint ladders, and the feedback rows. Completes UJ-1.
**FRs covered:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13 (+ AR-4, AR-7; UX-DR5, 8, 9, 10, 11, 12, 13, 17; LDR-1, LDR-4, LDR-5)

## Epic 1: Navigable Learning Shell

A learner can open PokerMath and move freely through all four Sections — via the sidebar or Back/Next — on the finished "Deep Table" visual base, with nothing persisted across reloads. This walking skeleton finalizes the scaffold, lays down the design-token layer, the two-pane frame, the single reactive store, no-router navigation, and the accessibility/motion/keyboard baselines that everything else inherits.

### Story 1.1: Verified project scaffold & test harness

As the builder,
I want a clean, verified Svelte 5 + TS + Vite + Vitest base with demo content removed,
So that all later work starts from a known-good foundation that builds, type-checks, and runs tests.

**Acceptance Criteria:**

**Given** the existing `pokermath/` scaffold
**When** I inspect `package.json`
**Then** a `test` script running `vitest` exists alongside `dev`, `build`, `preview`, and `check`

**Given** the scaffold
**When** I run `npm run dev`, `npm run build`, `npm run check`, and `npm run test`
**Then** each command succeeds (zero passing tests is acceptable at this stage)
**And** `npm run build` emits a static `dist/` bundle (AR-8)

**Given** the demo scaffold cruft
**When** I open the project
**Then** `src/lib/Counter.svelte`, `src/assets/hero.png`, and the Vite/Svelte demo svgs are removed
**And** `App.svelte` and `app.css` contain no boilerplate demo markup — only a minimal mount point

**Given** the approved stack (Svelte 5, TypeScript, Vite, Vitest, svelte-check)
**When** the scaffold is finalized
**Then** no additional runtime or build library is introduced

### Story 1.2: "Deep Table" design-token layer

As a learner,
I want the app to present the calm felt-and-gold visual identity,
So that the study tool feels composed and legible from the first screen.

**Acceptance Criteria:**

**Given** the DESIGN.md "Deep Table" frontmatter
**When** `src/styles/tokens.css` is created
**Then** every color, typography, spacing, radius, and component-spec token is present as a kebab-case, category-prefixed CSS custom property (e.g., `--color-felt`, `--color-suit-heart`, `--space-4`, `--radius-sm`), one token per DESIGN.md entry (AR-2, UX-DR21)

**Given** the three type families Fraunces, Inter, and JetBrains Mono
**When** the app loads
**Then** all three families are loaded and applied per the typography tokens

**Given** `src/styles/global.css`
**When** the app renders
**Then** the felt background, base Inter body typography, and resets are applied globally

**Given** a value that has a token
**When** any component is styled
**Then** it references `var(--…)` and never hardcodes that hex/size (AR-2 enforcement)
**And** no accent hue beyond felt + gold + the two feedback states + the four fixed suit colors is introduced

### Story 1.3: Two-pane app frame & in-memory state store

As a learner,
I want a persistent two-pane layout that always shows one Section's content, with nothing saved between visits,
So that I have a stable place to work and a reload always starts me fresh.

**Acceptance Criteria:**

**Given** `src/lib/appState.svelte.ts`
**When** the store is created
**Then** it exposes Svelte 5 `$state` including `currentSection` and is the single source of mutable runtime state (AR-5)

**Given** `src/content/sections.ts`
**When** it is defined
**Then** it lists the four Sections in fixed order (Introduction, Equity/LO1, Pot Odds/LO2, Calling Profitably/LO3) with id, title, subtitle, and kind

**Given** `App.svelte`
**When** the app mounts
**Then** it renders a fixed two-pane layout — a persistent left sidebar (~248px) + a felt content area filling the rest + a modal-layer slot — with no responsive reflow (UX-DR1)

**Given** `currentSection`
**When** the content area renders
**Then** a reactive Section index (no router) selects exactly that Section's screen (AR-6)

**Given** any in-memory state
**When** the page is reloaded
**Then** the app returns to the Introduction with all state cleared — no resume prompt (FR-3, UX-DR21)
**And** no login, account, save, or resume control exists anywhere in the UI (FR-3)

### Story 1.4: Sidebar Section index & free navigation

As a learner,
I want a sidebar listing all four Sections with the current one highlighted, where clicking any Section jumps straight to it,
So that I always know where I am and can move freely.

**Acceptance Criteria:**

**Given** `content/sections.ts`
**When** the Sidebar renders
**Then** all four Sections appear in fixed order, each with its title (body-md) and one-line subtitle (caption, dim) (FR-2, UX-DR2)

**Given** the current Section
**When** the sidebar renders
**Then** the active item shows the `sidebar-active` background + a 3px gold left-bar + a title weight change — distinguished by more than color alone (UX-DR2, UX-DR19)

**Given** any Section item
**When** the learner clicks it
**Then** `currentSection` is set to that Section and the content area shows it — all four are jump targets at all times, ungated (FR-2)

**Given** any screen in the flow
**When** it renders
**Then** the sidebar is present (persistent frame)

### Story 1.5: Back/Next pager

As a learner,
I want Back and Next controls on every screen,
So that I can step through the Sections in order without using the sidebar.

**Acceptance Criteria:**

**Given** any Section
**When** the Pager renders
**Then** Next (primary gold) advances to the next Section and Back (ghost) returns to the previous (FR-1, UX-DR15)

**Given** the Introduction
**When** the Pager renders
**Then** Back is absent or disabled

**Given** Calling Profitably (LO3, the last Section)
**When** the Pager renders
**Then** there is no Next, or it is disabled/absent (FR-1)

**Given** any Section within range
**When** the Pager renders
**Then** Back and Next are always enabled regardless of assessment state — advancing is never gated (FR-1, UX-DR15)
**And** Next from the Introduction lands on Equity (LO1) and Back from Equity returns to the Introduction

### Story 1.6: Keyboard operability, visible focus & restrained-motion baseline

As a learner who may rely on the keyboard or be sensitive to motion,
I want the whole shell to be keyboard-operable with visible focus and only quiet transitions,
So that I can navigate comfortably without a mouse and without distracting animation.

**Acceptance Criteria:**

**Given** the shell
**When** I navigate with Tab
**Then** focus moves through interactive elements in reading order and is always visibly indicated (UX-DR19, UX-DR20, NFR-2)

**Given** the keyboard only
**When** I use it
**Then** every sidebar Section item and the Back/Next controls are reachable and activatable — the full shell is operable without a mouse (UX-DR20, NFR-2)

**Given** a Section switch
**When** it occurs
**Then** the transition uses only a quick, quiet fade/position shift — no spinner, no celebratory animation, no auto-advance (UX-DR18, NFR-1)

**Given** any interactive element
**When** the learner interacts
**Then** no functionality is hidden behind hover (UX-DR20)

## Epic 2: Learn the Concepts

A learner can read all instructional content across the four Sections — with graphical four-color cards and hand notation — and open any of the four cheat sheets on demand without losing their place. This epic builds the reusable PlayingCard primitive, the Informational screen archetype, all authored per-Section content (concept-before-shorthand), and the cheat-sheet panel + modal. It is the entire teaching half of the product.

### Story 2.1: Card notation & graphical card rendering

As a learner,
I want hands and boards shown as real four-color playing cards,
So that I can read rank and suit at a glance and count outs faster.

**Acceptance Criteria:**

**Given** `src/lib/cards.ts`
**When** it is created
**Then** it defines `Card`/`Rank`/`Suit` types and a single `parseCard`/`cardToString` pair using the canonical notation — `T` = ten (never `10`), lowercase suits `h d c s` (AR-3)

**Given** a card string (e.g., `Ah`)
**When** `PlayingCard` renders it
**Then** it shows a white 2:3 face, `card` radius, double-shadow, with rank centered above the suit symbol in `value-lg` mono and no corner indices (UX-DR6)

**Given** any suit
**When** a card renders
**Then** suit is conveyed by both symbol and color (♥ red, ♦ blue, ♣ green, ♠ black) — never color alone (FR-7, NFR-2)

**Given** a set of cards
**When** `CardGroup` renders them
**Then** they appear as a labeled group, and a board versus a hand render as distinct labeled groups (FR-7, UX-DR7)

### Story 2.2: Informational screen archetype

As a learner,
I want a consistent reading screen for each Section,
So that instructional content is calm and easy to follow.

**Acceptance Criteria:**

**Given** `InformationalScreen.svelte`
**When** a Section of kind "informational" renders
**Then** it shows the Section title + subtitle, an instructional prose region (capped ~60ch), and at least one contextual graphic region (FR-4, UX-DR4)

**Given** the archetype
**When** it renders
**Then** it hosts the Back/Next Pager and shows no assessment chrome

**Given** per-Section prose authored as Svelte components under `src/content/sections/`
**When** a Section renders
**Then** its content is slotted into the archetype rather than hardcoded in the screen (AR-9)

### Story 2.3: Introduction content & hand notation

As a learner,
I want the Introduction to set my baseline and teach the hand notation,
So that I can read every later Section fluently.

**Acceptance Criteria:**

**Given** the Introduction
**When** it renders
**Then** it states the assumed prerequisites (52-card deck, Hold 'Em rules) and points to the Cheat Sheets for refreshers (FR-5)

**Given** the Introduction
**When** it teaches notation
**Then** it explains rank-letter + suit-letter (e.g., `Ah`, `Tc`) using PlayingCard examples, establishing the notation used consistently in all later Sections (FR-5)

**Given** all instructional copy
**When** it is authored
**Then** it uses the warm-coach, second-person voice — no emoji, no hype (UX-DR16)

### Story 2.4: Equity (LO1) instructional content

As a learner,
I want LO1 to derive equity before giving me the shorthand,
So that I understand the Rule of 2-and-4 rather than memorizing it.

**Acceptance Criteria:**

**Given** the Equity Section
**When** it renders
**Then** it presents the addition-law equity derivation before introducing the Rule of 2-and-4 as its approximation (FR-4, LDR-3)

**Given** the content
**When** it explains the rule
**Then** it frames ×2 (one street) / ×4 (two streets) and uses card graphics for any example hands/boards (FR-4)

**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice (UX-DR16)

### Story 2.5: Pot Odds (LO2) instructional content

As a learner,
I want LO2 to ground pot odds in a real hand,
So that the ratio connects to actual betting.

**Acceptance Criteria:**

**Given** the Pot Odds Section
**When** it renders
**Then** it presents the pot odds concept and at least one in-game contextualization of how the ratio shifts as players bet/call (FR-4)

**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice (UX-DR16)

### Story 2.6: Calling Profitably (LO3) instructional content

As a learner,
I want LO3 to build calling intuition before the formula,
So that the stacking method feels motivated.

**Acceptance Criteria:**

**Given** the Calling Profitably Section
**When** it renders
**Then** it presents a law-of-large-numbers framing with at least one toy-game example before the formula application (FR-4, LDR-3)

**Given** the content
**When** it teaches the method
**Then** it explains stacking equity against the required-equity threshold derived from pot odds (FR-4)

**Given** the copy
**When** it is authored
**Then** it uses the warm-coach voice (UX-DR16)

### Story 2.7: Cheat-sheet panel & modal mechanism

As a learner,
I want to open a reference sheet from the sidebar at any time without losing my place,
So that I can refresh a prerequisite mid-task.

**Acceptance Criteria:**

**Given** the lower sidebar panel
**When** the frame renders
**Then** it lists the four Cheat Sheets (52-card Deck, Hold 'Em Rules, Hand Rankings, Poker Jargon) as quiet chevron rows, divided from the Section nav (UX-DR3)

**Given** a cheat-sheet row
**When** the learner clicks it
**Then** `CheatSheetModal` opens that sheet over a felt-tinted scrim and the active Section is unchanged (FR-6, UX-DR14)

**Given** an open modal
**When** the learner presses Esc, clicks the scrim, or the close control
**Then** the modal dismisses and the underlying Section is exactly as left — the underlying screen never unmounts, so any in-progress inputs are preserved (FR-6, UX-DR14)

**Given** the store
**When** the modal opens or closes
**Then** only a cheat-sheet target field on `appState` flips — no navigation state changes

### Story 2.8: Cheat-sheet content (four sheets)

As a learner,
I want each cheat sheet to actually teach the prerequisite,
So that the refresher is useful.

**Acceptance Criteria:**

**Given** the four sheets
**When** each opens
**Then** `Deck`, `HoldEmRules`, `HandRankings`, and `Jargon` render their reference content (FR-6)

**Given** the four-color deck scheme
**When** the Deck or Hand Rankings sheets show cards
**Then** they use the PlayingCard primitive (consistent symbol + color)

**Given** any Section in the flow
**When** the learner opens a sheet
**Then** all four sheets are reachable, and the copy uses the warm-coach voice (FR-6, UX-DR16)

## Epic 3: Practice & Prove Mastery

A learner can compute answers for all three assessments, get error-aware escalating hints on mistakes, and receive success confirmation — the climax where expected value becomes concrete. This epic builds the pure validation + hint engine (unit-tested), the Assessment screen archetype, all input primitives, the three scenarios + hint ladders, and the feedback rows. It completes UJ-1.

### Story 3.1: Assessment data contracts, scenarios & hint ladders

As the builder,
I want the assessment data modeled once as typed data,
So that correctness logic and UI both consume a single source of truth.

**Acceptance Criteria:**

**Given** `src/lib/assessment/types.ts`
**When** it is created
**Then** it defines `Scenario`, `AnswerKey`, `FieldId`, `ValidationResult`, and `HintRung` per the architecture contracts (AR-7)

**Given** `content/scenarios.ts`
**When** it is created
**Then** it holds the three canonical scenarios as typed data — LO1 (`Ah Kh` on `Qh 8h 7c`), LO2 ($40 pot + $10 bet), LO3 (the all-in) — each with its `AnswerKey` (exact fields + equity ±3pp band + pot-odds `cost/(pot+cost)` values) (FR-8, FR-9, FR-10, AR-7)

**Given** `content/hintLadders.ts`
**When** it is created
**Then** it holds per-LO, per-error-type escalating rung text (miscounted outs, wrong multiplier, denominator error, ratio/percentage confusion, wrong comparison direction), with no rung revealing the final answer (UX-DR17)

**Given** the data shapes
**When** values are stored
**Then** percentages are plain numbers and ratios are `[antecedent, consequent]`

### Story 3.2: Validation engine with unit tests

As a learner,
I want my computed answers checked accurately with sensible tolerance,
So that a right answer passes and a near-miss on an approximation still counts.

**Acceptance Criteria:**

**Given** `src/lib/assessment/validation.ts`
**When** `validate(scenario, answers)` runs
**Then** it returns per-field correctness and overall pass/fail, importing nothing from Svelte (AR-4)

**Given** exact-valued fields (outs, remaining streets, pot-odds ratio)
**When** validated
**Then** they require exact correctness (FR-11)

**Given** the Rule-of-2-and-4 equity field
**When** validated
**Then** any value within ±3 pp of the `outs × 4` value passes (e.g., 33–39% for the LO1 9-out scenario) (FR-11, LDR-4)

**Given** the LO2 scenario
**When** validated
**Then** ratio `5:1` and required equity 16–17% pass via `cost/(pot+cost)` (FR-11)

**Given** co-located `validation.test.ts`
**When** `npm run test` runs
**Then** exact-field, ±3pp-band, and 5:1 / 16.7% cases are covered and pass

### Story 3.3: Hint-selection engine with unit tests

As a learner,
I want a wrong answer to point at my likely mistake and get more pointed if I keep missing,
So that I can recover without being handed the answer.

**Acceptance Criteria:**

**Given** `src/lib/assessment/hints.ts`
**When** a submission is incorrect
**Then** `detectError()` identifies the likely error type and selects the next escalating rung for that error (FR-12, AR-4, LDR-5)

**Given** repeated wrong submissions of the same error type
**When** each is checked
**Then** the hint escalates one rung at a time without ever stating the answer (FR-12, UX-DR17)

**Given** a change in error type between attempts
**When** checked
**Then** the ladder switches to the new error's rungs (UX-DR17)

**Given** co-located `hints.test.ts`
**When** tests run
**Then** each error type maps to the correct ladder rung and no rung contains the answer value

### Story 3.4: Assessment screen archetype & input primitives

As a learner,
I want a consistent assessment screen with computed-input fields and one Check Answer,
So that I enter my work clearly and submit it all at once.

**Acceptance Criteria:**

**Given** `AssessmentScreen.svelte`
**When** an assessment Section renders
**Then** it shows the title + "Assessment" kicker, the prompt, a CardGroup region for board + hand, and a lifted `assessment-panel` holding the fields + Check Answer + a feedback-row slot, plus the Pager (UX-DR5)

**Given** `NumericInput`
**When** used
**Then** it is a felt-deep mono well with a fixed `%` suffix where relevant, a border that turns gold once filled, and it rejects non-numeric entry rather than throwing (UX-DR8)

**Given** `RatioInput`
**When** used
**Then** it shows two mono fields with a fixed `:` between (`[5] : [1]`), both required to validate (UX-DR9)

**Given** `CheckAnswerButton`
**When** any field of the assessment is empty
**Then** it is disabled; when all fields have input it is enabled (gold), and `validate()` runs only on click — never on keystroke (FR-11)

### Story 3.5: Hint & success feedback rows

As a learner,
I want clear corrective and success feedback that never relies on color alone,
So that I always know whether I passed and what to fix.

**Acceptance Criteria:**

**Given** an incorrect submission
**When** the result returns
**Then** `FeedbackRow` shows the amber hint state with a leading `!` glyph and the selected hint copy below the panel — with no per-field red coloring; all fields stay neutral and editable (FR-12, UX-DR12, UX-DR19)

**Given** a fully-correct submission
**When** the result returns
**Then** `FeedbackRow` shows the green success state with a leading ✓ and warm affirmation, replacing any hint (FR-13, UX-DR13)

**Given** a passed assessment
**When** success shows
**Then** the sidebar marks that Section complete with a gold ✓ (session-only) and there is no auto-advance — Next stays the learner's choice (FR-13, UX-DR13)

**Given** any feedback
**When** it appears
**Then** the transition is a quick, quiet fade — no celebratory animation (UX-DR18)

### Story 3.6: LO1 equity assessment

As a learner,
I want to compute a hand's equity with the Rule of 2-and-4,
So that I can apply the shorthand under realistic conditions.

**Acceptance Criteria:**

**Given** the LO1 assessment
**When** it renders
**Then** it shows hand `Ah Kh` and flop `Qh 8h 7c` as card graphics with the prompt to estimate equity, and fields for outs, remaining streets, and equity % — outs are not pre-supplied (FR-8, LDR-1)

**Given** my submission
**When** I click Check Answer
**Then** it validates via the engine (outs and streets exact, equity ±3pp) (FR-8, FR-11)

**Given** a wrong outs count or wrong street multiplier
**When** I submit
**Then** the matching escalating hint appears without the answer (FR-12)

**Given** a fully-correct submission
**When** validated
**Then** success confirms and the Section is marked ✓ (FR-13)

### Story 3.7: LO2 pot odds assessment

As a learner,
I want to compute pot odds as a ratio and a percentage,
So that I can express the break-even threshold both ways.

**Acceptance Criteria:**

**Given** the LO2 assessment
**When** it renders
**Then** it shows the pot size and bet/call amount with fields for the ratio (RatioInput) and the equivalent percentage (FR-9)

**Given** my submission
**When** I click Check Answer
**Then** ratio `5:1` and 16–17% pass via the engine (FR-9, FR-11)

**Given** the `10/50 = 20%` denominator error or ratio/percentage confusion
**When** I submit
**Then** the matching escalating hint appears without the answer (FR-12)

**Given** a fully-correct submission
**When** validated
**Then** success confirms and the Section is marked ✓ (FR-13)

### Story 3.8: LO3 call profitability assessment (the climax)

As a learner,
I want to stack equity against the required threshold and commit a Call/Fold,
So that I feel expected value decide a real call.

**Acceptance Criteria:**

**Given** the LO3 assessment
**When** it renders
**Then** it shows hand `Ah Kh`, board `Qh 8h 7c`, $40 pot, opponent all-in $40, with fields for equity, pot odds (or required-equity threshold), and a Call/Fold toggle (FR-10, LDR-1)

**Given** `CallFoldToggle`
**When** it renders
**Then** it is two large mutually-exclusive buttons with neither pre-selected, selectable by click or arrow/space when focused (UX-DR10, UX-DR20)

**Given** my submission
**When** I click Check Answer
**Then** the engine validates equity (≈36%, ±3pp), required equity (≈16.7%), and that the Call/Fold judgment matches the equity-vs-threshold comparison — correct judgment is Call (FR-10, FR-11)

**Given** a wrong comparison direction
**When** I submit
**Then** the matching escalating hint appears; and given a fully-correct submission, success confirms the call was mathematically right and the Section is marked ✓ (FR-12, FR-13)
