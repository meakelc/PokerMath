---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-05-28'
inputDocuments:
  - _bmad-output/planning-artifacts/briefs/brief-PokerMath-2026-05-28/brief.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/prd.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/addendum.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/reconcile-brief.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/reconcile-designspec.md
  - _bmad-output/planning-artifacts/prds/prd-PokerMath-2026-05-28/review-rubric.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md
workflowType: 'architecture'
project_name: 'PokerMath'
user_name: 'Meakel'
date: '2026-05-28'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
13 FRs across 5 categories. (1) Learning Flow & Navigation (FR-1–3): linear
four-Section pager + sidebar jump, ungated, single-session with no persistence.
(2) Instructional Content Delivery (FR-4–5): authored per-Section prose +
contextual graphics; hand notation taught once, used throughout. (3) Cheat
Sheet Scaffolding (FR-6): four modal reference sheets, openable anywhere,
preserving in-progress inputs. (4) Card & Board Rendering (FR-7): a reusable
four-color playing-card primitive (symbol + color), used in both content and
assessments. (5) Open-Input Assessments (FR-8–13): three computed assessments
with multi-field validation, approximation tolerance, an error-type-aware
escalating hint ladder, and success confirmation.

Architecturally, the system is a small set of view archetypes (Informational,
Assessment, Cheat-Sheet modal) over a fixed frame (sidebar + content), plus one
non-trivial pure-logic module: assessment validation + hint selection.

**Non-Functional Requirements:**
- Performance: "feels instant" — guaranteed by static client-only delivery;
  spinners/loaders explicitly banned (EXPERIENCE.md).
- Accessibility: no formal WCAG target; hard floor — suit and feedback never
  conveyed by color alone; visible focus; full keyboard operability.
- Reliability/observability: not applicable (no persistence, no users, no SLA).
- Aesthetic/tone: "Deep Table" — finalized design-token system (felt + gold,
  Fraunces/Inter/JetBrains Mono); restrained motion is a hard rule.

**Scale & Complexity:**
A deliberately small, low-complexity, single-session learning app. No server,
database, auth, multi-tenancy, real-time, or integration surface.

- Primary domain: Frontend / static web (client-only)
- Complexity level: Low
- Estimated architectural components: a fixed app frame, ~3 screen archetypes,
  a card-rendering primitive, an assessment-validation/hint engine, a content
  store, and a design-token layer.

### Technical Constraints & Dependencies

- Desktop web only; modern evergreen browsers; no responsive/mobile (PRD §8).
- Client-only static delivery; no backend/state/database required by any FR.
- Tech stack is explicitly left to the builder (FR §12 assumption).
- Pedagogy is a hard constraint (LDR-1–5): content order, compute-don't-recognize
  assessments, and non-revealing corrective feedback are requirements, not guidance.
- A finalized design-token system (DESIGN.md "Deep Table") must drive styling.

### Cross-Cutting Concerns Identified

- Design tokens: a single source of truth (DESIGN.md) must flow into every
  component's styling without drift.
- Card rendering: one four-color card primitive reused across instructional
  content and assessment screens (FR-7); accessibility (symbol+color) lives here.
- Assessment validation + hint ladder: pure, deterministic domain logic shared in
  shape across LO1–LO3; the highest-value target for unit testing.
- Accessibility floor: non-color-only cues, keyboard operability, visible focus —
  spanning cards, feedback, and navigation.
- Content management: authored instructional prose, fixed scenarios, and the
  hint-ladder copy need a defined home and a clean path into the UI.

## Starter Template Evaluation

### Primary Technology Domain

Frontend / static client-only web application (no backend, no routing-to-server,
no persistence). Single-page app with in-memory section switching.

### Starter Options Considered

- **Vite `svelte-ts` template (SELECTED)** — bare Svelte 5 + TypeScript SPA.
  Minimal, no router/SSR. Matches the single-page, client-only shape exactly.
- **SvelteKit via `npx sv create`** — rejected. Brings file-based routing and
  SSR/adapter machinery the app never uses; PokerMath has no server-backed URLs.
  Meta-framework overhead with no payoff at this scale.
- **React + Vite / Vue + Vite** — viable but heavier than the reactive-state needs
  warrant; chosen against in favor of Svelte's lower boilerplate (see decision below).
- **Vanilla HTML/CSS/TS** — viable given existing HTML mockups, but hand-managed
  DOM state across three assessments (hint/success/✓) invites avoidable bugs.

### Selected Starter: Vite `svelte-ts` (Svelte 5 + TypeScript)

**Rationale for Selection:**
The app's complexity is almost entirely reactive UI state (filled-field detection,
hint visibility, success state, session-only completion marks). Svelte 5 runes
($state/$derived) express this with minimal boilerplate and no virtual-DOM model.
Vite gives an instant dev server and a trivial static production build — the part
of the stack we most want to be unremarkable. The crown-jewel logic (validation +
hint ladder) is framework-agnostic TypeScript, so the framework only governs the
shell. TypeScript is chosen for compile-time safety over the exact numeric
validation rules and answer-key/scenario data shapes.

**Initialization Command:**

```bash
npm create vite@latest pokermath -- --template svelte-ts
cd pokermath
npm install
npm install -D vitest        # unit-test the validation/hint engine
npm run dev
```

(Requires Node.js 20.19+ or 22.12+.)

**Architectural Decisions Provided by Starter:**

**Language & Runtime:** TypeScript; Svelte 5 (runes); browser ES modules; Node 20.19+/22.12+ for tooling.

**Styling Solution:** Plain CSS with custom properties sourced from DESIGN.md
"Deep Table" tokens. No Tailwind/CSS-in-JS — the token set is small and finalized.

**Build Tooling:** Vite (dev server + static production bundle to `dist/`,
deployable to any static host).

**Testing Framework:** Vitest (Vite-native) — targeted at the pure validation/hint
engine; component/UI tests optional given the scale.

**Code Organization:** `src/` with Svelte components, a framework-free `lib/`
for validation + hint logic, a `content/` area for instructional text + scenarios,
and a `tokens.css` design-token layer. (Detailed structure decided in later steps.)

**Development Experience:** Vite HMR, TS intellisense, `svelte-check` for template
type-checking, fast Vitest watch mode.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Reactive state model (Svelte 5 runes, single store module)
- Content storage split (typed TS data for scenarios/keys/hints; Svelte
  components for instructional prose)
- Validation + hint engine as a pure, framework-free, unit-tested TS module

**Important Decisions (Shape Architecture):**
- No-router navigation (reactive section index + state-driven modals)
- Design tokens as CSS custom properties sourced from DESIGN.md
- Static-host deployment

**Deferred / Not Applicable (with rationale):**
- Database, ORM, migrations — N/A: no persistence (FR-3); content is static.
- Auth/authorization/encryption — N/A: no accounts, no backend, no PII (§8).
- API design, rate limiting, service comms — N/A: zero runtime network calls.
- CI/CD pipeline — optional at this scale; a manual `vite build` + static deploy
  is sufficient for a solo academic deliverable.
- Drill mode / procedural generation — explicitly future vision (PRD §6, addendum §E).

### Data Architecture

No database or server state. All "data" is static and bundled at build time:
- **Scenario data** (LO1–LO3): hand, board, pot/bet, prompt — as typed TS objects.
- **Answer keys**: exact fields (outs, streets, ratio) + tolerance-banded fields
  (equity ±3pp) + the pot-odds `cost/(pot+cost)` convention values.
- **Hint ladders**: per-LO, keyed by detected error type, ordered rungs.
Data validation = the pure validation engine (below), not DB constraints.

### Authentication & Security

Not applicable. No accounts, login, sessions, secrets, or PII. The app is a
static bundle with no backend and no runtime network calls — negligible attack
surface. (No formal security target per project scope.)

### API & Communication Patterns

Not applicable. The app makes no runtime API/network calls; everything required
ships in the static bundle. Section transitions and Check Answer feedback are
synchronous in-memory operations (satisfying the "feels instant" NFR with no
spinners, per EXPERIENCE.md).

### Frontend Architecture

- **State management:** Svelte 5 runes ($state/$derived) in a single reactive
  store module (`src/lib/appState.svelte.ts`). No external state library.
  State held: current Section; per-LO assessment state (field values, attempt
  status, current hint rung, detected error type, passed flag); cheat-sheet
  modal open/target. All in-memory; cleared on reload (satisfies FR-3 for free).
- **Navigation:** No router. A reactive Section index selects which screen
  renders; Back/Next adjust the index; sidebar items set it directly (free,
  ungated — FR-1, FR-2). Cheat sheets render as state-driven modal overlays,
  not routes; opening/closing never changes the active Section and preserves
  assessment inputs (FR-6).
- **Component architecture:** App frame (Sidebar + content area) hosting two
  screen archetypes (Informational, Assessment) and shared primitives:
  PlayingCard (the reusable four-color card — FR-7, accessibility lives here),
  NumericInput, RatioInput, CallFoldToggle, CheckAnswerButton, FeedbackRow
  (hint/success), Pager (Back/Next), CheatSheetModal. Instructional content is
  authored as per-Section Svelte components.
- **Validation + hint engine:** A pure, framework-free TS module
  (`src/lib/assessment/`) — deterministic `validate(scenario, answers)` returning
  per-field correctness, overall pass/fail, and (on failure) the selected hint
  via detected-error-type + escalating-rung logic (FR-11, FR-12, EXPERIENCE.md
  hint ladder). The prime unit-test target (Vitest).
- **Styling / design tokens:** Plain CSS with custom properties in
  `src/styles/tokens.css`, transcribed once from DESIGN.md "Deep Table"
  frontmatter (colors, typography, spacing, radius, component specs) as the
  single styling source of truth. No utility-CSS framework.
- **Performance:** No optimization needed beyond Vite defaults; the bundle is
  tiny and all interactions are synchronous. Restrained-motion rule honored
  (quick fades only; no spinners, no celebratory animation).

### Infrastructure & Deployment

- **Build:** `vite build` → static `dist/`.
- **Hosting:** any static host (GitHub Pages / Netlify / Vercel static) or local
  open for demo. No server, no environment configuration, no secrets.
- **CI/CD:** optional; not required for a solo academic deliverable. A manual
  build-and-deploy is sufficient.
- **Monitoring/logging/scaling:** N/A (no persistence, no users to monitor,
  no uptime SLA — per PRD §9).

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Vite svelte-ts project (starter command) + add Vitest.
2. Establish design tokens (tokens.css) and base layout frame (Sidebar + content).
3. Build the PlayingCard primitive (reused everywhere; bakes in accessibility).
4. Build the pure validation + hint engine with unit tests (no UI dependency).
5. Build the Assessment archetype + input primitives wired to the engine + store.
6. Author per-Section instructional content (Informational components) + scenarios.
7. Add cheat-sheet modals and final navigation/state polish.

**Cross-Component Dependencies:**
- The reactive store is the hub: navigation, assessment state, and modal state
  all read/write it; UI is a projection of it.
- The validation engine depends only on typed scenario/answer-key data — not on
  Svelte — so it is buildable and testable before any UI exists.
- The PlayingCard primitive and design tokens are shared foundations every
  screen depends on; build them early.
- Content split (TS data vs Svelte prose) lets content authoring proceed in
  parallel with engine/UI work.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** ~8 areas where independent
implementation passes could diverge. DB/API/auth categories are N/A (client-only
static app, no backend). Focus is on naming, shared data contracts, Svelte 5
state idioms, and assessment-feedback flow.

### Naming Patterns

**Code Naming:**
- **Svelte components:** PascalCase file = component name — `PlayingCard.svelte`,
  `CheatSheetModal.svelte`, `AssessmentScreen.svelte`.
- **TS modules:** camelCase filenames — `validation.ts`, `scenarios.ts`,
  `appState.svelte.ts` (rune-bearing modules use the `.svelte.ts` extension).
- **Functions / variables:** camelCase (`detectError`, `requiredEquity`).
- **Types / interfaces:** PascalCase (`Scenario`, `AnswerKey`, `ValidationResult`,
  `HintLadder`). No `I`-prefix.
- **Module-level constants:** UPPER_SNAKE for fixed primitives
  (`EQUITY_TOLERANCE_PP = 3`); camelCase for exported data objects (`lo1Scenario`).

**CSS Custom Properties (design tokens):** kebab-case, category-prefixed, mirroring
DESIGN.md — `--color-felt`, `--color-gold`, `--color-suit-heart`,
`--font-display-lg`, `--space-4`, `--radius-sm`. One token per DESIGN.md entry;
never hardcode a hex/size that has a token.

**Card notation (THE canonical encoding — used everywhere):**
- A card is the 2-char string `<rank><suit>`: rank ∈ `A K Q J T 9 8 7 6 5 4 3 2`
  (**`T` = ten**, never `10`); suit ∈ `h d c s` (lowercase).
- Examples: `Ah`, `Tc`, `Qh`. Boards/hands are ordered arrays of these strings.
- Internal model type: `{ rank: Rank; suit: Suit }`; a single `parseCard(s)` /
  `cardToString(c)` pair is the only place notation is encoded/decoded.

### Structure Patterns

- **Tests co-located:** `validation.ts` ↔ `validation.test.ts` in the same folder
  (Vitest). No separate `__tests__/` tree.
- **Components organized by role,** not feature: shared primitives in
  `src/lib/components/`; per-Section instructional content in `src/content/sections/`.
- **Pure logic isolated** in `src/lib/assessment/` (no Svelte imports — keeps it
  unit-testable and framework-free).
- **Static content data** (scenarios, answer keys, hint ladders, cheat-sheet copy)
  in `src/content/` as typed TS.

### Format Patterns

(No API/JSON-over-the-wire formats — these govern in-memory typed data.)
- **TS field naming:** camelCase across all data shapes.
- **Shared data contracts (single source of truth):**
  - `Scenario` — `{ id, lo, hand: Card[], board: Card[], pot?, bet?, prompt }`.
  - `AnswerKey` — exact fields (outs, streets, ratio) + banded fields
    (equity, tolerance ±3pp) + pot-odds `cost/(pot+cost)` values.
  - `ValidationResult` — `{ perField: Record<FieldId, boolean>, passed: boolean,
    hint?: HintRung }`.
- **Numbers:** percentages stored as plain numbers (`36` means 36%), ratios as
  `[antecedent, consequent]` (`[5,1]`); the `%`/`:` are presentation-only.

### Communication Patterns

**State management (Svelte 5 runes):**
- A single reactive store module (`appState.svelte.ts`) exporting `$state` objects.
- **Direct mutation is the idiom** — `appState.currentSection = i`,
  `assessment.fields.outs = '9'`. No Redux-style reducers/actions, no immutable-copy
  ceremony (Svelte 5 deep reactivity handles it).
- **Derived values use `$derived`** (`canSubmit = $derived(allFieldsFilled)`),
  never recomputed by hand in markup.
- **Data flows: store → components (read), components → store (write).** Props pass
  data *down* into presentational primitives; cross-cutting state lives in the store.
- No event bus / custom-event system; it isn't needed at this scale.

**Assessment feedback flow (not exception handling):**
- A wrong answer is a **returned `ValidationResult`, never a thrown error.**
- Invalid keystrokes in numeric fields are *rejected at input* (not accepted, not
  thrown).

### Process Patterns

**Validation timing:**
- `validate()` runs **only on Check Answer**, never on keystroke. On-change updates
  only field values + the `$derived` enabled state.
- Check Answer is disabled until every field of that assessment has input (FR-11).

**Feedback / "error" states:**
- Two terminal feedback states only: **hint** (wrong) and **success** (all correct).
  Hint never reveals the answer; success marks the Section ✓ (session-only).
- **No per-field red coloring** on wrong submit — fields stay neutral and editable
  (DESIGN.md hard rule).

**Loading states:** **None, by rule.** No spinners, skeletons, or async loading UI
anywhere — all interactions are synchronous in-memory (EXPERIENCE.md restrained-
motion rule). State transitions use only quick, quiet fades.

### Enforcement Guidelines

**All implementation work MUST:**
- Use the canonical card notation (`T` for ten, lowercase suits) and route all
  encode/decode through the single `parseCard`/`cardToString` pair.
- Consume the shared `Scenario` / `AnswerKey` / `ValidationResult` types — never
  redefine answer logic inline in a component.
- Read styling from `tokens.css` custom properties; never hardcode a value that
  has a token.
- Keep `src/lib/assessment/` free of Svelte imports (unit-testable purity).
- Mutate `$state` directly; derive with `$derived`; no external state library.

### Pattern Examples

**Good:**
- `board: ['Qh','8h','7c']` → `parseCard` → typed `Card[]` → `PlayingCard` renders
  symbol+color from `--color-suit-*`.
- `validate(lo1Scenario, answers)` returns `{ passed:false, hint: outsRung[0] }`;
  the component shows the hint row, fields untouched.

**Anti-patterns (avoid):**
- Writing `'10'` for ten, or uppercase suits (`AH`) — breaks `parseCard`.
- Hardcoding `#0b3d2c` instead of `var(--color-felt)`.
- Recomputing equity/pot-odds correctness inside a Svelte component instead of
  calling the engine.
- Adding a spinner or success confetti.
- Coloring a wrong field red.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pokermath/
├── README.md
├── package.json
├── tsconfig.json
├── svelte.config.js
├── vite.config.ts                 # Vite + Vitest config
├── .gitignore
├── index.html                     # single entry point; mounts App
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts                    # bootstraps App.svelte into #app
    ├── App.svelte                 # root frame: Sidebar + content area + modal layer
    │
    ├── styles/
    │   ├── tokens.css             # DESIGN.md "Deep Table" tokens as CSS vars (SoT)
    │   └── global.css             # resets, base typography, felt background
    │
    ├── lib/
    │   ├── appState.svelte.ts     # single reactive store ($state): section, per-LO
    │   │                          #   assessment state, cheat-sheet modal target (FR-1–3,6)
    │   ├── cards.ts               # Card/Rank/Suit types, parseCard, cardToString (FR-7)
    │   │
    │   ├── assessment/            # PURE logic — no Svelte imports
    │   │   ├── types.ts           # Scenario, AnswerKey, FieldId, ValidationResult, HintRung
    │   │   ├── validation.ts      # validate(scenario, answers) (FR-11)
    │   │   ├── validation.test.ts # exact fields, ±3pp band, 5:1 / 16.7% cases
    │   │   ├── hints.ts           # detectError() + escalating rung selection (FR-12)
    │   │   └── hints.test.ts      # error-type → correct hint ladder rung
    │   │
    │   └── components/            # shared presentational primitives
    │       ├── Sidebar.svelte             # section nav + cheat-sheet panel (FR-2)
    │       ├── SidebarNavItem.svelte      # active highlight + session ✓ (FR-2, FR-13)
    │       ├── Pager.svelte               # Back/Next, ungated (FR-1)
    │       ├── PlayingCard.svelte         # four-color card, symbol+color (FR-7)
    │       ├── CardGroup.svelte           # labeled hand/board group (FR-7)
    │       ├── NumericInput.svelte        # mono field, % suffix, reject non-numeric
    │       ├── RatioInput.svelte          # [n] : [n] paired fields (LO2/LO3)
    │       ├── CallFoldToggle.svelte      # two buttons, none preselected (LO3)
    │       ├── CheckAnswerButton.svelte   # disabled until all fields filled (FR-11)
    │       ├── FeedbackRow.svelte         # hint | success states (FR-12, FR-13)
    │       └── CheatSheetModal.svelte     # overlay, Esc/click-away, preserves inputs (FR-6)
    │
    ├── screens/                   # the two screen archetypes
    │   ├── InformationalScreen.svelte     # title/subtitle, prose slot, graphic, Pager (FR-4)
    │   └── AssessmentScreen.svelte        # prompt, CardGroup, fields, Check, Feedback (FR-8–13)
    │
    └── content/                   # authored content (data + prose)
        ├── sections.ts            # ordered Section metadata: id, title, subtitle, kind
        ├── scenarios.ts           # lo1/lo2/lo3 Scenario + AnswerKey data (typed)
        ├── hintLadders.ts         # per-LO, per-error-type rung text (FR-12)
        ├── sections/              # instructional prose as Svelte components (FR-4–5)
        │   ├── IntroContent.svelte        # baseline + hand notation (FR-5)
        │   ├── EquityContent.svelte       # addition law → Rule of 2-and-4 (FR-4, LDR-3)
        │   ├── PotOddsContent.svelte      # pot odds + in-game contextualization (FR-4)
        │   └── CallingContent.svelte      # LLN/toy games → stacking method (FR-4, LDR-3)
        └── cheatsheets/           # cheat-sheet content (FR-6)
            ├── Deck.svelte
            ├── HoldEmRules.svelte
            ├── HandRankings.svelte
            └── Jargon.svelte
```

### Architectural Boundaries

**Pure-logic boundary (the firewall):** `src/lib/assessment/` imports nothing from
Svelte. It takes typed `Scenario`/`AnswerKey` data + submitted answers and returns
a `ValidationResult`. This is the only place answer correctness or hint selection is
decided, and it is fully unit-testable in isolation.

**State boundary:** `appState.svelte.ts` is the single source of mutable runtime
state. Screens and components read it and write to it; no component owns
cross-cutting state privately. UI is a projection of the store.

**Content boundary:** Authored content lives only under `src/content/`. Data
(scenarios, answer keys, hint text) is typed TS; prose is Svelte components. No
component hardcodes a scenario or hint string inline.

**Styling boundary:** `styles/tokens.css` is the only home for design values;
components reference `var(--…)`. No data/API boundaries exist (client-only).

### Requirements to Structure Mapping

| FR(s) | Lives in |
|---|---|
| FR-1 Linear nav | `Pager.svelte`, `appState.svelte.ts` |
| FR-2 Sidebar index | `Sidebar.svelte`, `SidebarNavItem.svelte`, `content/sections.ts` |
| FR-3 No persistence | `appState.svelte.ts` (in-memory only; reload = fresh) |
| FR-4 Per-Section content | `content/sections/*Content.svelte`, `InformationalScreen.svelte` |
| FR-5 Intro + notation | `IntroContent.svelte`, `lib/cards.ts` |
| FR-6 Cheat sheets | `CheatSheetModal.svelte`, `content/cheatsheets/*` |
| FR-7 Card rendering | `PlayingCard.svelte`, `CardGroup.svelte`, `lib/cards.ts` |
| FR-8–10 Assessments | `AssessmentScreen.svelte`, input primitives, `content/scenarios.ts` |
| FR-11 Answer checking | `lib/assessment/validation.ts` (+ tests) |
| FR-12 Hint + retry | `lib/assessment/hints.ts`, `content/hintLadders.ts`, `FeedbackRow.svelte` |
| FR-13 Success confirm | `FeedbackRow.svelte`, `SidebarNavItem.svelte` (✓) |

**Cross-cutting concerns:**
- Accessibility floor (symbol+color, glyph+words, focus) → enforced in
  `PlayingCard.svelte` and `FeedbackRow.svelte`.
- Design tokens → `styles/tokens.css`, referenced everywhere.

### Integration Points

**Internal communication:** Components ↔ `appState.svelte.ts` (read via runes,
write via direct mutation). `AssessmentScreen` calls `validate()`/`detectError()`
from `lib/assessment/`, passing data sourced from `content/scenarios.ts` +
`content/hintLadders.ts`. Cheat-sheet open/close flips a field on the store; the
underlying screen never unmounts (inputs preserved — FR-6).

**External integrations:** None. No runtime network, no third-party services.

**Data flow:** `content/*` (build-time typed data + prose) → store/screens →
primitives render. On Check Answer: field values → `validate()` → `ValidationResult`
→ `FeedbackRow` (hint or success) + store updates ✓ on pass.

### File Organization Patterns

**Configuration files:** root-level (`package.json`, `tsconfig.json`,
`vite.config.ts`, `svelte.config.js`). No env files (no secrets/config).

**Source organization:** by role — `lib/` (logic + primitives), `screens/`
(archetypes), `content/` (authored data + prose), `styles/` (tokens + global).

**Test organization:** co-located `*.test.ts` beside the pure logic in
`lib/assessment/`. Component tests optional at this scale.

**Asset organization:** minimal `public/`; cards are rendered (CSS/markup), not
image assets, so there is no card-image library to manage.

### Development Workflow Integration

**Development server:** `npm run dev` → Vite HMR at localhost; edits to content,
components, or tokens hot-reload instantly.

**Build process:** `npm run build` → `vite build` → static `dist/` (HTML/CSS/JS).
`npm run test` → Vitest over the assessment engine.

**Deployment:** copy `dist/` to any static host (GitHub Pages / Netlify) or open
locally. No server runtime, no environment configuration.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** Svelte 5 + Vite + TypeScript + Vitest is a standard,
mutually compatible stack (verified current). No backend/DB/auth choices to
conflict. All decisions reinforce the client-only, static, single-session design.

**Pattern Consistency:** Naming (PascalCase components, camelCase TS, kebab token
vars), state idiom (runes + direct mutation), co-located tests, and the canonical
card notation are consistent with the chosen stack and with each other. No
pattern contradicts a decision.

**Structure Alignment:** The directory tree realizes every decision — the
`lib/assessment/` pure-logic firewall, the single `appState.svelte.ts` store, the
typed-data-vs-Svelte-prose content split, and `styles/tokens.css` as the styling
source of truth. Boundaries are explicit and enforceable.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:** All 13 FRs are mapped to specific files
(see Requirements-to-Structure table). FR-1–3 nav/persistence → store + Pager +
Sidebar; FR-4–5 content → `content/sections/*`; FR-6 cheat sheets → modal +
content; FR-7 cards → `PlayingCard` + `lib/cards.ts`; FR-8–10 assessments →
`AssessmentScreen` + inputs + `scenarios.ts`; FR-11 validation + FR-12 hints →
`lib/assessment/`; FR-13 success → `FeedbackRow` + sidebar ✓.

**Learning Design Requirements (LDR-1–5):** Architecturally supported — content
order encoded in `sections.ts` (LDR-2,3); compute-only inputs via numeric/ratio/
toggle primitives, no multiple-choice (LDR-4); non-revealing escalating hints in
`hints.ts` + `hintLadders.ts` (LDR-5); Bloom alignment is a content concern the
structure accommodates (LDR-1).

**Non-Functional Requirements Coverage:**
- Performance ("feels instant") → synchronous in-memory ops, no async/loaders.
- Accessibility floor → symbol+color in `PlayingCard`, glyph+words in `FeedbackRow`,
  visible focus + keyboard operability as component rules.
- Restrained motion → enforced as a process pattern (no spinners/confetti).
- Reliability/observability/scaling → N/A by design, documented.

### Implementation Readiness Validation ✅

**Decision Completeness:** Stack and versions specified (Svelte 5, Vite, TS,
Vitest, Node 20.19+/22.12+); init command provided; deferred/N-A categories
justified rather than left silent.

**Structure Completeness:** Concrete tree with real filenames (not placeholders),
explicit boundaries, FR-to-file mapping, and three existing UX mockups as
composition references.

**Pattern Completeness:** The likely conflict points are pinned — card notation
(`T`/lowercase suits, single parse/encode pair), shared `Scenario`/`AnswerKey`/
`ValidationResult` contracts, runes mutation idiom, validation timing, and the
no-loading-states rule — each with good/anti-pattern examples.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:** None blocking.

**Minor / Nice-to-Have:**
- The `validate()` / `detectError()` signatures are specified as contracts, not
  final TypeScript — intentionally deferred to the first implementation task
  (define `types.ts` shapes). Non-blocking.
- Component-level tests are optional (only the engine is mandated for tests);
  acceptable at this scale.

### Validation Issues Addressed

No critical or important issues found. The minor items above are recorded as
expected first-implementation detail, not gaps that block handoff.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (all 16 checklist items confirmed; no
critical gaps).

**Confidence Level:** High — the scope is small and well-bounded, the planning
inputs (PRD + UX + design tokens + mockups) are unusually complete, and the
architecture is right-sized to the stakes rather than over-engineered.

**Key Strengths:**
- Pure-logic firewall makes the highest-risk logic (validation + hint ladder)
  trivially testable and framework-independent.
- The constraints enforce themselves: no persistence makes FR-3 free; no router
  removes a whole class of state bugs.
- Single design-token source + canonical card notation eliminate the two most
  likely sources of implementation drift.

**Areas for Future Enhancement:**
- Drill mode / procedurally generated scenarios (PRD §6 future vision) would
  introduce a scenario-generator module behind the same `Scenario`/`AnswerKey`
  contracts — the engine and UI would largely carry over.
- Optional CI (build + Vitest on push) if the project outgrows solo/manual flow.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently — especially card notation and the
  shared data contracts.
- Respect the `lib/assessment/` purity boundary and the single-store rule.
- Consult the UX mockups (`mockups/key-screen-*.html`) for composition and
  DESIGN.md/EXPERIENCE.md for the authoritative spec (spines win over mocks).

**First Implementation Priority:**
```bash
npm create vite@latest pokermath -- --template svelte-ts
cd pokermath && npm install && npm install -D vitest
```
Then: tokens.css + layout frame → PlayingCard → assessment engine (with tests)
→ assessment screens → content authoring → cheat sheets + polish.
