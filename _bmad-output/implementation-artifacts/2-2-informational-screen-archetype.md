---
baseline_commit: 2da472b
---

# Story 2.2: Informational screen archetype

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a consistent reading screen for each Section,
so that instructional content is calm and easy to follow.

## Acceptance Criteria

**AC1 — Informational archetype structure (FR-4, UX-DR4)**
**Given** `InformationalScreen.svelte`
**When** a Section of kind `"informational"` renders
**Then** it shows the Section title + subtitle, an instructional prose region (capped ~60ch), and at least one contextual graphic region

**AC2 — Hosts the Pager, no assessment chrome (UX-DR4, UX-DR15)**
**Given** the archetype
**When** it renders
**Then** it hosts the Back/Next Pager and shows no assessment chrome (no panel, no input fields, no Check Answer)

**AC3 — Content slotted, not hardcoded (AR-9)**
**Given** per-Section prose authored as Svelte components under `src/content/sections/`
**When** a Section renders
**Then** its content is slotted into the archetype rather than hardcoded in the screen

## Tasks / Subtasks

- [x] **Task 1: Create the `src/screens/` archetype directory and `InformationalScreen.svelte` (AC: #1, #2, #3)**
  - [x] Create the new folder `pokermath/src/screens/` — this is the architecture-designated home for the two screen archetypes (`InformationalScreen`, later `AssessmentScreen`). It does **not** exist yet; this story creates it. [Source: architecture.md:427-429]
  - [x] Create `pokermath/src/screens/InformationalScreen.svelte`. **Props (Svelte 5 runes):**
    ```svelte
    <script lang="ts">
      import type { Component } from 'svelte'
      import Pager from '../lib/components/Pager.svelte'
      import type { SectionId } from '../content/sections'

      let {
        sectionId,
        title,
        subtitle,
        content: Content,
      }: {
        sectionId: SectionId
        title: string
        subtitle: string
        content: Component
      } = $props()
    </script>
    ```
    - Rename the `content` prop to the local `Content` (capitalized) so it can be rendered directly as `<Content />` — the Svelte 5 idiom for a component passed as a value (no `<svelte:component>`, which is deprecated in Svelte 5). [Source: Svelte 5 dynamic components; architecture.md:131 (Svelte 5 runes)]
  - [x] **Markup** — the archetype owns the section head + a content region + the Pager. Wrap **only the head + content** in `{#key sectionId}` for the quiet fade; keep `<Pager />` **outside** the keyed block:
    ```svelte
    <article class="screen">
      {#key sectionId}
        <div class="body">
          <header class="section-head">
            <h1 class="section-title">{title}</h1>
            <p class="section-subtitle">{subtitle}</p>
          </header>
          <div class="prose">
            <Content />
          </div>
        </div>
      {/key}
      <Pager />
    </article>
    ```
    - **Why Pager is outside `{#key}`:** the keyed block re-mounts on section change. Keeping the (interactive) Pager out of it means no interactive element ever lives inside the keyed region — which is exactly the condition deferred-work.md:13 flagged (focus loss on keyed re-mount). By construction there is nothing to focus-restore. The keyed block holds only the head + non-interactive prose/cards. **Do not** add focus() logic; it isn't needed with this layout. [Source: deferred-work.md:13]
    - **No assessment chrome (AC2):** no `assessment-panel`, no `NumericInput`/`RatioInput`/`CheckAnswerButton`/`FeedbackRow`. Those are Epic 3. The informational screen is title + subtitle + prose + graphic + Pager, nothing else. [Source: EXPERIENCE.md:75 ("No assessment chrome"); UX-DR4]
  - [x] **Styling (tokens only; one justified literal):**
    ```css
    .screen {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;            /* fill the felt .main column so Pager margin-top:auto pins to the bottom */
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: var(--space-section-gap);   /* heading → content rhythm (24px) */
      animation: section-fade var(--motion-fast) var(--motion-ease);
      animation-fill-mode: backwards;
    }
    @keyframes section-fade { from { opacity: 0; } to { opacity: 1; } }
    .section-head { display: flex; flex-direction: column; gap: var(--space-2); }
    .section-title {
      font: var(--font-display-lg);
      letter-spacing: var(--tracking-display-lg);
      color: var(--color-text-on-felt);
      margin: 0;
    }
    .section-subtitle {
      font: var(--font-body-lg);
      color: var(--color-text-on-felt-dim);
      margin: 0;
    }
    .prose {
      max-width: 60ch;           /* justified literal — DESIGN.md caps prose at ~60ch; no token exists. ch unit is the typographic measure, not a hex/size that has a token. See Dev Notes "Prose measure". */
      font: var(--font-body-lg);
      color: var(--color-text-on-felt);
    }
    ```
    - The `.section-title`/`.section-subtitle`/`section-fade` rules are **moved from `App.svelte`** (they live there today at App.svelte:40-61). The visual result must be byte-identical to the current head. [Source: App.svelte:40-61; DESIGN.md:187,193]
    - `max-width: 60ch` is the only literal — it's the DESIGN-mandated prose measure with no corresponding token (literal-justification house style, per 1.4/1.5/2.1). Do **not** invent a `--measure-*` token unless a second consumer needs it. [Source: DESIGN.md:193; 2-1-…md:190-192 (literal-justification pattern)]

- [x] **Task 2: Establish the content-slot mechanism — content registry + Intro placeholder (AC: #3)**
  - [x] Create `pokermath/src/content/sections/IntroContent.svelte` as a **minimal placeholder** the archetype slots in. **Story 2.3 expands this same file** with the real baseline + hand-notation copy — do not author the full Introduction here; create just enough to prove the slot is wired end-to-end:
    ```svelte
    <script lang="ts">
      import CardGroup from '../../lib/components/CardGroup.svelte'
      import { parseCard } from '../../lib/cards'
    </script>

    <p>
      Welcome to PokerMath. Each Section teaches one idea and then asks you to use it.
      <!-- Story 2.3 replaces this with the real Introduction: prerequisites + hand-notation teaching. -->
    </p>

    <CardGroup label="Hand notation" cards={[parseCard('Ah'), parseCard('Tc')]} />
    ```
    - The contextual graphic region (AC1's "at least one contextual graphic region") is supplied by the content component via `CardGroup` — the Introduction's natural graphic is the hand-notation example (`Ah`, `Tc`), which is also what FR-5 / Story 2.3 will teach. This makes 2.2's placeholder a true seam into 2.3, not throwaway. [Source: FR-4, FR-5; UX-DR4; EXPERIENCE.md:28]
    - **`parseCard` runs here — at the content boundary** — producing `Card[]` passed down to `CardGroup`. Components never re-parse strings (AR-3 single-decode rule). `Ah`/`Tc` are unique cards, so the `CardGroup` duplicate-key concern (deferred-work.md:5) does not arise. [Source: architecture.md:285-290; 2-1-…md:172]
  - [x] Create `pokermath/src/content/sections/index.ts` — the content registry mapping `SectionId → Component`. This is the extensible home where Stories 2.4–2.6 register their content components:
    ```ts
    import type { Component } from 'svelte'
    import type { SectionId } from '../sections'
    import IntroContent from './IntroContent.svelte'

    // Per-Section instructional content (AR-9). Partial: assessment-kind Sections
    // wire their teaching content in later stories / Epic 3.
    export const sectionContent: Partial<Record<SectionId, Component>> = {
      intro: IntroContent,
    }
    ```
    - Keep this a thin lookup. Do not add logic. Later stories add `equity`/`pot-odds`/`calling` entries. [Source: architecture.md:435-439 (content/sections/*Content.svelte); AR-9]

- [x] **Task 3: Wire `App.svelte` to delegate informational Sections to the archetype (AC: #1, #2, #3)**
  - [x] In `App.svelte`, branch on `active.kind`. Informational Sections render `InformationalScreen` with content from the registry; assessment Sections keep a **temporary** head+Pager fallback until `AssessmentScreen` arrives in Epic 3. Replace the current `.main` body:
    ```svelte
    <script lang="ts">
      import { appState } from './lib/appState.svelte'
      import { sections } from './content/sections'
      import { sectionContent } from './content/sections'
      import Sidebar from './lib/components/Sidebar.svelte'
      import Pager from './lib/components/Pager.svelte'
      import InformationalScreen from './screens/InformationalScreen.svelte'

      const active = $derived(sections[appState.currentSection])
    </script>

    <div class="app">
      <Sidebar />

      <main class="main">
        {#if active.kind === 'informational' && sectionContent[active.id]}
          <InformationalScreen
            sectionId={active.id}
            title={active.title}
            subtitle={active.subtitle}
            content={sectionContent[active.id]}
          />
        {:else}
          <!-- TEMPORARY: assessment Sections get their AssessmentScreen in Epic 3.
               Until then, keep the title + Pager so the shell stays navigable end-to-end. -->
          {#key active.id}
            <div class="section-head">
              <h1 class="section-title">{active.title}</h1>
              <p class="section-subtitle">{active.subtitle}</p>
            </div>
          {/key}
          <Pager />
        {/if}
      </main>
    </div>

    <div class="modal-layer"></div>
    ```
    - Import `sectionContent` from `./content/sections` only if you re-export it there; the registry lives in `./content/sections/index.ts`, which resolves via `./content/sections`. **Caution:** `./content/sections` currently resolves to `sections.ts` (the file), not a directory index. Adding `content/sections/index.ts` creates a name collision (`sections.ts` vs `sections/` dir). **Import the registry explicitly from `./content/sections/index`** to avoid ambiguity: `import { sectionContent } from './content/sections/index'`. Keep `import { sections } from './content/sections'` (the file) as-is. [Source: existing App.svelte:2-3; architecture.md:431-435]
  - [x] **Keep the assessment-branch head styles** (`.section-head`, `.section-title`, `.section-subtitle`, `section-fade` keyframe) in `App.svelte`'s `<style>` — the fallback branch still renders a head. Svelte scopes styles per-component, so the archetype has its own copy (Task 1); this temporary duplication is removed when Epic 3 replaces the fallback with `AssessmentScreen`. Leave `.app`, `.main`, `.modal-layer` styles unchanged. [Source: App.svelte:26-68]
  - [x] **`.main` already provides `display:flex; flex-direction:column` + `--space-content-pad`** — `InformationalScreen`'s `flex:1 1 auto` fills it, and the Pager's existing `margin-top:auto` (Pager.svelte:34) pins it to the bottom exactly as today. Do not re-pad inside the archetype. [Source: App.svelte:33-38; Pager.svelte:31-36]

- [x] **Task 4: Address the first-consumer `CardGroup` default (deferred-work.md:5,7)**
  - [x] `CardGroup` is now wired to its **first real consumer** (`IntroContent`). Add the deferred default so an omitted `cards` prop degrades gracefully instead of failing `svelte-check`:
    ```svelte
    let { cards = [], label }: { cards?: Card[]; label: string } = $props()
    ```
    Update `CardGroup.svelte:5`. This closes deferred-work.md:7 (CardGroup `cards` prop has no default). [Source: deferred-work.md:7]
  - [x] **Do not** add a duplicate-key dedup guard (deferred-work.md:5) — the Intro graphic uses unique cards (`Ah`, `Tc`); leave that item deferred until a content author needs a group that could repeat a card. Note it stays in `deferred-work.md`. [Source: deferred-work.md:5]
  - [x] Update `deferred-work.md`: mark the CardGroup-default item resolved in this story (move/annotate, don't silently drop), consistent with the 2.1 cadence of tracking deferred items. [Source: deferred-work.md; 2-1-…md:225]

- [x] **Task 5: Verify (AC: #1, #2, #3)**
  - [x] `npm run check` → svelte-check + tsc, **0 errors / 0 warnings**. Confirms the `Component` typing, the registry, and the `App.svelte` branch type-check. [Source: 2-1-…md:147]
  - [x] `npm run test -- --run` → existing suite stays green (smoke + sections + cards = 3 files). No new test is mandated — `InformationalScreen`/`IntroContent` are presentational (node-env Vitest can't render Svelte; adding a DOM test lib is an AR-1 violation). Pure data (`sections.ts`) is already covered. [Source: 2-1-…md:174-175,232-235; deferred-work.md:46]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] **Manual visual pass** (`npm run dev`):
    - **Introduction (cold load):** renders the title "Introduction" + subtitle, the placeholder prose, and the `Ah`/`Tc` `CardGroup` graphic, with Back absent and Next present at the bottom. Prose column is visibly capped (~60ch), not full-width. **No assessment panel/fields.** (AC1, AC2, AC3) [Source: UX-DR4; EXPERIENCE.md:75]
    - **Next → Equity:** the assessment fallback shows the title + Pager (Back + Next). Navigation through all four Sections still works (sidebar + pager). (no regression) [Source: 2-1-…md:155]
    - **Reload:** returns to Introduction, state cleared. The quiet section fade still plays on switch; no spinner, no celebratory motion. (FR-3, UX-DR18) [Source: EXPERIENCE.md:74,95]
    - **Keyboard:** Tab reaches the Pager Back/Next and sidebar items with a visible focus ring; full shell operable without a mouse (no regression from 1.6). [Source: 1-6-…md; NFR-2]
  - [x] Record exact command outputs + the visual-pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story builds the **Informational screen archetype** — the reusable reading-screen shell (`src/screens/InformationalScreen.svelte`) — and the **content-slot mechanism** (registry + first content component) that lets authored prose drop into it. It is the second brick of Epic 2's teaching half, consuming the `PlayingCard`/`CardGroup` primitives built in 2.1. [Source: epics.md Story 2.2; architecture.md:208-213,427-429]

**This story DOES:**
- Create `src/screens/` (new dir) + `InformationalScreen.svelte` — title/subtitle + ~60ch prose region + ≥1 graphic region + Pager, no assessment chrome.
- Create the `content/sections/index.ts` registry and a **minimal** `IntroContent.svelte` placeholder (real copy = Story 2.3) to prove the slot end-to-end.
- Refactor `App.svelte` to delegate informational Sections to the archetype, with a temporary fallback for assessment Sections.
- Close the deferred `CardGroup` `cards = []` default (first real consumer).

**This story does NOT:**
- **Author the real Introduction copy or notation teaching** → Story 2.3 (expands `IntroContent.svelte`). Keep the placeholder one sentence + one card example. [Source: epics.md Story 2.3]
- **Author LO1/LO2/LO3 instructional content** → Stories 2.4–2.6. Do not add their content components or registry entries. [Source: epics.md Stories 2.4-2.6]
- **Build `AssessmentScreen`, input primitives, the validation/hint engine, or any assessment chrome** → Epic 3. The assessment-kind Sections get only a temporary title+Pager fallback. [Source: architecture.md:427-444; epics.md Epic 3]
- **Build the cheat-sheet panel/modal** → Stories 2.7–2.8. The `modal-layer` div in `App.svelte` stays exactly as-is. [Source: epics.md Stories 2.7-2.8; App.svelte:24]
- **Add any npm dependency.** AR-1 stack is locked (Svelte 5 + TS + Vite + Vitest + svelte-check). No DOM/component test lib. [Source: epics.md AR-1; deferred-work.md:46]
- **Add a second accent hue or any hardcoded hex/size that has a token.** The only literal is the justified `max-width: 60ch`. [Source: DESIGN.md:234; architecture.md:283]

### The screen-archetype pattern (what InformationalScreen is)

The app is "a small set of view archetypes (Informational, Assessment, Cheat-Sheet modal) over a fixed frame (sidebar + content)." `InformationalScreen` is the first of the two **content-area** archetypes. The fixed frame (Sidebar + `.main` + modal layer) already exists in `App.svelte`; the archetype renders **inside** `.main`. [Source: architecture.md:41-44,208-213]

- **Archetype = layout + slot, not content.** `InformationalScreen` owns the *shape* (head, prose measure, graphic placement, Pager); the *words and graphics* come from a slotted content component (AR-9 content split). This is the same separation the architecture draws between `screens/` (archetypes) and `content/sections/*Content.svelte` (authored prose). [Source: architecture.md:427-444,458-460]
- **One archetype, many Sections.** After 2.2 only the Introduction is `informational`, but the archetype is built to serve any informational Section by props (`sectionId`, `title`, `subtitle`, `content`). [Source: architecture.md:472 (FR-4 → InformationalScreen)]

### Content slotting — the Svelte 5 idiom (AR-9)

- Content components are **passed as values** through the `sectionContent` registry and rendered with `<Content />` (capitalized local binding). Svelte 5 renders a component held in a variable directly; `<svelte:component>` is deprecated — do not use it. [Source: architecture.md:131; Svelte 5]
- **Why a registry, not children/snippets:** the registry (`SectionId → Component`) is the clean, extensible seam for Stories 2.4–2.6 to register their content without touching `InformationalScreen` or `App.svelte`'s branch logic. It also keeps `App.svelte` declarative. [Source: architecture.md:435-439; AR-9]
- **Single decode point holds:** content components call `parseCard` at the content boundary and pass `Card[]` into `CardGroup`/`PlayingCard`. Never re-parse inside a presentational component (AR-3). [Source: architecture.md:285-290; 2-1-…md:172]

### The `content/sections` name collision (read before importing)

`src/content/sections.ts` (the Section metadata file) and the new `src/content/sections/` (the content-component directory) **coexist**. Node/Vite module resolution: `./content/sections` resolves to the **file** `sections.ts`, while `./content/sections/index` resolves to the **directory index**. To stay unambiguous:
- `import { sections } from './content/sections'` → the metadata array (existing, unchanged).
- `import { sectionContent } from './content/sections/index'` → the content registry (new).

This mirrors the architecture tree, which places both `sections.ts` and `sections/` under `content/`. Verify `npm run check` passes — TS/Vite resolve both cleanly with explicit paths. [Source: architecture.md:431-435]

### Layout / Pager / fade — preserve current behavior

Today `App.svelte` renders one `.section-head` (faded via `{#key active.id}`) and one shared `<Pager>` (pinned bottom via `margin-top:auto`). After this story:
- **InformationalScreen** owns its head + Pager; the head+content fade on `{#key sectionId}`; the Pager sits outside the key. `flex:1 1 auto` on `.screen` lets the Pager's `margin-top:auto` pin to the bottom of `.main` exactly as before. [Source: App.svelte:14-20,33-67; Pager.svelte:31-36]
- **Assessment fallback** keeps the existing head + Pager pattern verbatim (temporary). [Source: App.svelte:13-21]
- **Quiet fade only** (`section-fade`, `--motion-fast` 120ms) — no spinner, no celebratory motion (restrained-motion hard rule). Reduced-motion is already neutralized globally by `global.css:21-29`. [Source: EXPERIENCE.md:95; UX-DR18; global.css:21-29]
- **Focus note (deferred-work.md:13):** the only interactive control (Pager) is kept *outside* the keyed block, so the keyed re-mount never drops focus from an interactive element. No focus-restore logic is needed. Do not add an auto-focus heading. The deferred item remains correctly deferred (still no interactive content inside `{#key}`). [Source: deferred-work.md:13]
- **Minor accepted behavior change:** crossing the informational↔assessment boundary (Intro ↔ Equity via Next/Back) now re-mounts the Pager (two branch instances) instead of sharing one, so focus returns to `<body>` on that crossing rather than staying on the button. This is acceptable and self-resolves in Epic 3 when both archetypes host their own Pager consistently. Within a single archetype, focus is unaffected. [Source: this story's branch design]

### Prose measure — a documented literal (literal-justification pattern)

DESIGN.md specifies the content column "caps prose at ~60ch" but provides **no measure token**. Per the literal-justification house style (1.4 button weight, 1.5/2.1 card width), set `max-width: 60ch` directly on `.prose` with a comment. Rationale: `ch` is the correct typographic measure unit (≈ character width of the running font), not a hex/spacing value that DESIGN tokenizes — so it is not a "hardcoded value that has a token." If a second screen later needs the same cap, promote to a `--measure-prose` token then, not now. [Source: DESIGN.md:193; 2-1-…md:190-192; 1-4-…md/1-5-…md literal-justification pattern]

### Architecture compliance (guardrails)

- **Structure:** new `src/screens/InformationalScreen.svelte`; new `src/content/sections/IntroContent.svelte` + `src/content/sections/index.ts`; `App.svelte` updated; `CardGroup.svelte` updated. All within the architecture target tree (screens/ archetypes, content/sections/ prose). No structural variance. [Source: architecture.md:427-444]
- **Naming:** PascalCase components (`InformationalScreen.svelte`, `IntroContent.svelte`); camelCase TS export (`sectionContent`); PascalCase types (`SectionId`, `Component`). [Source: architecture.md:269-283]
- **Styling boundary:** every value from `tokens.css`; one justified literal (`60ch`). No hardcoded hex/size that has a token. [Source: architecture.md:283; DESIGN.md:234]
- **State boundary untouched:** `InformationalScreen` is presentational; it reads no store, owns no state. Navigation still flows through `appState.currentSection` via the Pager/Sidebar. `appState.svelte.ts` is **not** modified in this story. [Source: architecture.md:454-457; appState.svelte.ts]
- **Content boundary:** authored prose lives only under `src/content/sections/`; the archetype hardcodes no copy. [Source: architecture.md:458-460; AR-9]
- **Component idiom (match `Pager.svelte`):** `<script lang="ts">` first; Svelte 5 runes (`$props`, `$derived`); relative imports; single scoped `<style>` reading `var(--…)`; semantic markup (`<article>`, `<header>`, `<h1>`). [Source: Pager.svelte:1-58; Sidebar.svelte]

### Files — current state (read before editing)

- `pokermath/src/screens/InformationalScreen.svelte` — **NEW** (new `screens/` dir). The archetype.
- `pokermath/src/content/sections/IntroContent.svelte` — **NEW**. Minimal placeholder; **Story 2.3 expands it**.
- `pokermath/src/content/sections/index.ts` — **NEW**. `SectionId → Component` registry.
- `pokermath/src/App.svelte` — **UPDATE**. Currently renders one head (keyed fade) + one Pager for *all* Sections (App.svelte:10-22) with head/fade styles at 40-61. Change: branch on `active.kind` → `InformationalScreen` for informational, temp head+Pager fallback for assessment. Keep `.app`/`.main`/`.modal-layer` styles and the `modal-layer` div unchanged.
- `pokermath/src/lib/components/CardGroup.svelte` — **UPDATE**. Add `cards = []` default at line 5 (deferred-work.md:7). No other change.
- `pokermath/src/lib/components/PlayingCard.svelte` — **read-only** (consumed via CardGroup; do not edit).
- `pokermath/src/lib/cards.ts` — **read-only** (`parseCard` used at the content boundary).

**Must be preserved:** the shell remains working end-to-end — sidebar jumps + Back/Next pager across all four Sections, the quiet section fade, `:focus-visible` ring, reduced-motion guard, no-persistence-on-reload (lands on Introduction). The two-pane frame, `.main` padding, and the `modal-layer` slot are unchanged. [Source: 1-6-…md:218; App.svelte:26-68; deferred-work.md]

### Previous story intelligence (2.1 + Epic 1)

- **2.1 built the primitives this story consumes.** `CardGroup label=… cards={Card[]}` and `PlayingCard card={Card}` are presentational; `parseCard` runs at the content boundary (here, in `IntroContent`). `CardGroup` keys `{#each}` on `cardToString(card)`. [Source: 2-1-…md:117-131,239]
- **2.1 deferred a `CardGroup` default + dup-key guard "when the first consumer is wired in Story 2.2."** This story is that moment: add the `cards = []` default (Task 4); leave the dup-key guard deferred (Intro uses unique cards). [Source: deferred-work.md:5,7]
- **Token discipline + literal-justification is house style.** Document any literal that DESIGN doesn't tokenize (here: `60ch`). [Source: 2-1-…md:190-192; 1-4-…md:139]
- **Components are node-untestable; only pure logic is unit-tested.** No render test for the archetype — manual visual pass (Task 5). Existing 3 test files stay green. [Source: 2-1-…md:174-175,232-235; deferred-work.md:46]
- **Work discipline:** small per-task verified commits, `feat(2.2)` → `review(2.2)` cadence, exact command outputs in Completion Notes, deferred items tracked in `deferred-work.md` (not dropped). [Source: git log; 2-1-…md:225]
- **Deferred focus item (1.6):** addressed by *layout* here (Pager outside `{#key}`), not by adding focus code. [Source: deferred-work.md:13]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `2da472b` (`review(2.1)` — Epic 2 opened: `cards.ts` + `PlayingCard`/`CardGroup`). 2.2 is the first story that **edits existing source** (`App.svelte`, `CardGroup.svelte`) rather than pure-additive — so the no-regression visual pass (Task 5) matters more than in 2.1. `_bmad*/` and `docs/` stay untouched. [Source: git log; sprint-status.yaml:55-65]

### Testing standards

- **No new automated test mandated.** The new files are presentational Svelte (node-env Vitest can't render them; a DOM test lib is an AR-1 violation). Pure Section data (`sections.ts`) is already covered by `sections.test.ts`. [Source: 2-1-…md:232-235; deferred-work.md:46; architecture.md:508-509]
- **Verification = `check`/`test`/`build` green + the Task-5 visual walkthrough** (Intro renders title+subtitle+prose+card graphic+Pager with no assessment chrome; ~60ch prose cap; assessment fallback + full navigation intact; reload → Introduction; keyboard + focus ring intact). Existing tests stay green (this story changes none of their logic). [Source: 2-1-…md:235-236]
- **A registry-completeness check** (every informational Section has a `sectionContent` entry) is *desirable* but would require importing compiled `.svelte` modules into Vitest — deferred until/unless a DOM test env is added. The `{#if … && sectionContent[active.id]}` guard in `App.svelte` makes a missing entry degrade to the fallback rather than crash. [Source: deferred-work.md:46]

### Project Structure Notes

Creates the `src/screens/` archetype directory and the `src/content/sections/` content-component directory — both architecture-designated, neither existed before. `sections.ts` (metadata file) and `sections/` (component dir) intentionally coexist under `content/` (see name-collision note). No structural variance from the target tree. [Source: architecture.md:427-444]

Files touched:
- `pokermath/src/screens/InformationalScreen.svelte` — NEW
- `pokermath/src/content/sections/IntroContent.svelte` — NEW
- `pokermath/src/content/sections/index.ts` — NEW
- `pokermath/src/App.svelte` — UPDATE
- `pokermath/src/lib/components/CardGroup.svelte` — UPDATE
- `_bmad-output/implementation-artifacts/deferred-work.md` — UPDATE (mark CardGroup-default resolved)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.2] — story statement + acceptance criteria (lines 311-329)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-4 per-Section content (line 24), AR-9 content split (line 62), UX-DR4 Informational screen archetype (line 71), UX-DR15 Pager (line 82), UX-DR18 restrained motion (line 85)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — `screens/InformationalScreen.svelte` (427-429), `content/sections/*Content.svelte` + `sections.ts` (431-439), content/screen boundaries (458-460), FR-4 → InformationalScreen mapping (472)
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — two screen archetypes over fixed frame (208-213), Svelte 5 runes / no router (198-207), naming patterns (269-283), token discipline (283)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — Informational archetype (35), "No assessment chrome" (75), Pager behavior (61), restrained motion (95), cold-open/reload (74)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — content-pad/section-gap rhythm + ~60ch prose cap (193), typography voices (183-185), no second hue (234)
- [Source: pokermath/src/App.svelte] — current frame: head + keyed fade + shared Pager (10-24), head/fade styles (40-61), `.main`/`.app`/`modal-layer` (26-68)
- [Source: pokermath/src/lib/components/Pager.svelte] — `margin-top:auto` bottom-pin (34), component idiom to match (1-58)
- [Source: pokermath/src/content/sections.ts] — Section metadata + `SectionId`/`SectionKind` types (1-37); intro is the only `informational` Section
- [Source: pokermath/src/lib/components/CardGroup.svelte] — current props (5), `{#each}` keyed on `cardToString` (11); add `cards = []` default
- [Source: pokermath/src/styles/tokens.css] — `--space-section-gap` (57), `--space-content-pad` (56), `--font-display-lg`/`--tracking-display-lg` (27,37), `--font-body-lg` (30), `--color-text-on-felt`/`-dim` (6-7), `--motion-fast`/`--motion-ease` (82-83)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — CardGroup `cards` default + dup-key (5,7), `{#key}`-focus on full-content wrap (13), node-env / no component-test-lib (46)
- [Source: _bmad-output/implementation-artifacts/2-1-card-notation-graphical-card-rendering.md] — predecessor: PlayingCard/CardGroup API, single-decode rule, literal-justification, node-env testing rule, verification cadence

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `check` iteration 1: `Type 'Component | undefined' is not assignable to type 'Component'` at `App.svelte` — Svelte template `{#if}` guards don't narrow `Partial<Record>` access; fixed with non-null assertion `sectionContent[active.id]!` (safe: guarded by the same `&&` condition). Iteration 2: 0 errors.

### Completion Notes List

- **Task 1** — Created `pokermath/src/screens/InformationalScreen.svelte`. Props: `sectionId`, `title`, `subtitle`, `content: Component` (Svelte 5 runes). Markup: `<article>` with `{#key sectionId}` wrapping only `.body` (head + prose); `<Pager />` outside key block (resolves deferred-work.md:13 by layout, not by focus code). Styling: all tokens; one justified literal `max-width: 60ch` per DESIGN.md prose-measure spec.
- **Task 2** — Created `IntroContent.svelte` (placeholder: one sentence + `Ah`/`Tc` `CardGroup`; Story 2.3 expands). Created `content/sections/index.ts` registry (`intro → IntroContent`). `parseCard` runs at content boundary per AR-3.
- **Task 3** — Updated `App.svelte`: branches on `active.kind`. Informational → `InformationalScreen`; assessment → temporary title+Pager fallback. Registry imported from `./content/sections/index` (explicit path avoids `sections.ts`/`sections/` name collision). Head styles retained in `App.svelte` for assessment fallback. Non-null assertion used for `sectionContent` prop.
- **Task 4** — Added `cards = []` default to `CardGroup.svelte:5`. Updated `deferred-work.md` to mark item resolved. Dup-key guard left deferred (Intro cards are unique).
- **Task 5 — Verification outputs:**
  - `npm run check`: `96 FILES 0 ERRORS 0 WARNINGS` ✅
  - `npm run test -- --run`: `3 passed (3) | 69 passed (69)` ✅
  - `npm run build`: `128 modules transformed | dist/ emitted in 206ms` ✅
  - **Visual pass (Playwright / headless Chromium):**
    - Intro cold load: title "Introduction", subtitle "Poker & hand notation", placeholder prose, Ah+Tc CardGroup visible, Back absent, Next present, no assessment chrome, prose capped at ~606px (~60ch) ✅
    - Next → Equity: assessment fallback — title + Back/Next pager, no content chrome ✅
    - Full navigation through all 4 sections intact ✅
    - Calling (last section): Next absent ✅
    - Reload: returns to Introduction ✅

### File List

- `pokermath/src/screens/InformationalScreen.svelte` — NEW
- `pokermath/src/content/sections/IntroContent.svelte` — NEW
- `pokermath/src/content/sections/index.ts` — NEW
- `pokermath/src/App.svelte` — MODIFIED
- `pokermath/src/lib/components/CardGroup.svelte` — MODIFIED
- `_bmad-output/implementation-artifacts/deferred-work.md` — MODIFIED
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED
- `_bmad-output/implementation-artifacts/2-2-informational-screen-archetype.md` — MODIFIED (this file)

## Change Log

- 2026-05-30: Story 2.2 implemented — InformationalScreen archetype, content registry, IntroContent placeholder, App.svelte branching, CardGroup default. All ACs satisfied; check/test/build green; visual pass confirmed.
