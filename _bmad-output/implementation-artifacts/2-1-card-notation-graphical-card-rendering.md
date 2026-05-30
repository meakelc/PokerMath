---
baseline_commit: f78c6d8
---

# Story 2.1: Card notation & graphical card rendering

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want hands and boards shown as real four-color playing cards,
so that I can read rank and suit at a glance and count outs faster.

## Acceptance Criteria

**AC1 — canonical card notation module (AR-3, FR-7)**
**Given** `src/lib/cards.ts`
**When** it is created
**Then** it defines `Card`/`Rank`/`Suit` types and a single `parseCard`/`cardToString` pair using the canonical notation — `T` = ten (never `10`), lowercase suits `h d c s`

**AC2 — PlayingCard visual form (UX-DR6)**
**Given** a card (e.g., `Ah`)
**When** `PlayingCard` renders it
**Then** it shows a white 2:3 face, `card` radius, the double-shadow, with the rank centered above the suit symbol in `value-lg` mono and no corner indices

**AC3 — suit conveyed by symbol AND color (FR-7, NFR-2)**
**Given** any suit
**When** a card renders
**Then** suit is conveyed by both symbol and color (♥ red, ♦ blue, ♣ green, ♠ black) — never color alone

**AC4 — CardGroup distinct labeled groups (FR-7, UX-DR7)**
**Given** a set of cards
**When** `CardGroup` renders them
**Then** they appear as a labeled group, and a board versus a hand render as two distinct labeled groups

## Tasks / Subtasks

- [x] **Task 1: Create `src/lib/cards.ts` with co-located unit tests — test-first (AC: #1)**
  - [x] **(RED)** Write `src/lib/cards.test.ts` FIRST, matching the existing Vitest style in `src/smoke.test.ts` / `src/content/sections.test.ts` (`import { describe, it, expect } from 'vitest'`). Cover:
    - `parseCard('Ah')` → `{ rank: 'A', suit: 'h' }`; one case per suit (`h d c s`) and a spread of ranks including **`parseCard('Tc')` → `{ rank: 'T', suit: 'c' }`** (T = ten).
    - **Round-trip identity:** for every canonical card, `cardToString(parseCard(s)) === s` (drive this over all 13 ranks × 4 suits = 52 strings, or a representative sample).
    - **Rejects malformed input** (each throws): `'10c'` (numeric ten — the canonical-notation trap), `'AH'` (uppercase suit), `'Xh'` (bad rank), `'ah'` (lowercase rank), `'A'` / `'Ahx'` (wrong length), `''`.
    - `cardToString({ rank: 'Q', suit: 'h' })` → `'Qh'`.
  - [x] **(GREEN)** Implement `src/lib/cards.ts`:
    ```ts
    export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'
    export type Suit = 'h' | 'd' | 'c' | 's'
    export type Card = { rank: Rank; suit: Suit }

    const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
    const SUITS = ['h', 'd', 'c', 's'] as const

    export function parseCard(s: string): Card {
      if (s.length !== 2) throw new Error(`Invalid card notation: "${s}" (expected 2 chars)`)
      const rank = s[0] as Rank
      const suit = s[1] as Suit
      if (!RANKS.includes(rank)) throw new Error(`Invalid rank: "${s[0]}" in "${s}"`)
      if (!SUITS.includes(suit)) throw new Error(`Invalid suit: "${s[1]}" in "${s}" (suits are lowercase h d c s)`)
      return { rank, suit }
    }

    export function cardToString(c: Card): string {
      return `${c.rank}${c.suit}`
    }
    ```
    - **Throw on malformed input — do NOT return `null`/`undefined`.** `parseCard` decodes *authored, static* card data (boards/hands in `content/`), so malformed notation is an authoring bug that should surface loudly at dev/build time. (This is unrelated to UX-DR8's "reject non-numeric input without throwing", which governs *learner* keystrokes in the numeric assessment fields — Epic 3, not here.) [Source: architecture.md:329-332 (feedback-flow rule is about answers, not parsing); UX-DR8]
    - This `parseCard`/`cardToString` pair is **THE only place** card notation is encoded/decoded anywhere in the app (AR-3). Later stories pass typed `Card` objects around, never re-parse inline. [Source: architecture.md:285-290, 353-356]
  - [x] **(GREEN)** `npm run test` → the new `cards.test.ts` passes alongside the existing 5 tests; `npm run check` → 0 errors.

- [x] **Task 2: Build `src/lib/components/PlayingCard.svelte` (AC: #2, #3)**
  - [x] Props (Svelte 5 runes): accept a **typed `Card`** — `let { card }: { card: Card } = $props()`. The component is purely presentational: it renders a parsed `Card`; it never parses strings (parsing happens once at the content boundary via `parseCard`). [Source: architecture.md:324-327 ("Props pass data down into presentational primitives")]
  - [x] Suit symbol lookup (component-local const):
    ```ts
    const SUIT_SYMBOL: Record<Suit, string> = { h: '♥', d: '♦', c: '♣', s: '♠' }
    ```
    Symbols: heart `♥` U+2665, diamond `♦` U+2666, club `♣` U+2663, spade `♠` U+2660.
  - [x] Markup — stacked rank-over-symbol, **no corner indices** (UX-DR6):
    ```svelte
    <div class="card suit-{card.suit}" role="img" aria-label={cardLabel(card)}>
      <span class="rank">{card.rank}</span>
      <span class="suit">{SUIT_SYMBOL[card.suit]}</span>
    </div>
    ```
    - The rank renders the **canonical rank letter as-is — `T` shows as `T`, never `10`** — because Story 2.3 teaches the learner this exact notation *using these cards*, so the face must match the taught string. [Source: epics.md Story 2.3 AC (FR-5 notation taught via PlayingCard examples); architecture.md:286-288]
  - [x] **Accessible name (modest, not a widget):** `role="img"` + a plain-English `aria-label` via small maps so a screen reader says "Ace of hearts" rather than reading the glyph soup "A ♥". Keep it minimal — no live region, no description, no roving focus (cards are non-interactive). [Source: NFR-2; 1-6-…md:151-156 "do not over-engineer ARIA"]
    ```ts
    const RANK_LABEL: Record<Rank, string> = { A:'Ace', K:'King', Q:'Queen', J:'Jack', T:'Ten', '9':'Nine', '8':'Eight', '7':'Seven', '6':'Six', '5':'Five', '4':'Four', '3':'Three', '2':'Two' }
    const SUIT_LABEL: Record<Suit, string> = { h:'hearts', d:'diamonds', c:'clubs', s:'spades' }
    const cardLabel = (c: Card) => `${RANK_LABEL[c.rank]} of ${SUIT_LABEL[c.suit]}`
    ```
  - [x] Styling — **all values from tokens**, four-color via a class-per-suit so colors stay token references (no hardcoded hex):
    ```css
    .card {
      width: 60px;                       /* documented literal — see Dev Notes "Card sizing" */
      aspect-ratio: var(--ratio-card);   /* 2 / 3 — closes the deferred --ratio-card item */
      background: var(--color-card-face);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
    }
    .rank, .suit { font: var(--font-value-lg); }
    .card.suit-h .rank, .card.suit-h .suit { color: var(--color-suit-heart); }
    .card.suit-d .rank, .card.suit-d .suit { color: var(--color-suit-diamond); }
    .card.suit-c .rank, .card.suit-c .suit { color: var(--color-suit-club); }
    .card.suit-s .rank, .card.suit-s .suit { color: var(--color-suit-spade); }
    ```
    - **Both rank and suit symbol take the suit color** — standard four-color-deck presentation; the whole card index reads as "that suit's color", strengthening the symbol+color cue. The white `--color-card-face` keeps contrast against the felt. [Source: DESIGN.md:177,216 (four-color deck, white face); FR-7; NFR-2]
    - **AC3 is satisfied by the symbol alone, with color reinforcing** — never color alone. Verify all four suits by eye in Task 4. [Source: DESIGN.md:177; NFR-2]

- [x] **Task 3: Build `src/lib/components/CardGroup.svelte` (AC: #4)**
  - [x] Props: `let { cards, label }: { cards: Card[]; label: string } = $props()` — a typed `Card[]` plus a group label ("Hand", "Board", etc.). Presentational only; the caller parses notation → `Card[]`. [Source: architecture.md:365-366 (`['Qh','8h','7c'] → parseCard → Card[] → PlayingCard`)]
  - [x] Markup — a labeled group; the label is a `label-caps` kicker above a row of `PlayingCard`s:
    ```svelte
    <div class="group">
      <span class="group-label">{label}</span>
      <div class="cards">
        {#each cards as card (cardToString(card))}
          <PlayingCard {card} />
        {/each}
      </div>
    </div>
    ```
    - `{#each}` key = `cardToString(card)` (stable, unique per card) — consistent with the stable-id keying used elsewhere (`Sidebar` keys on `section.id`). [Source: 1-6-…md:119; Sidebar.svelte]
    - **Two distinct labeled groups (AC4):** rendering `<CardGroup label="Hand" .../>` and `<CardGroup label="Board" .../>` produces two visually separated, individually-labeled groups. The distinctness comes from each group's own label + spacing — no shared/merged container. [Source: FR-7; UX-DR7; epics.md Story 2.1 AC4]
  - [x] Styling (tokens only):
    ```css
    .group { display: flex; flex-direction: column; gap: var(--space-2); }
    .group-label {
      font: var(--font-label-caps);
      letter-spacing: var(--tracking-label-caps);   /* companion token — font shorthand can't carry it */
      text-transform: uppercase;                      /* label-caps has no text-transform token (deferred 1.2 note) */
      color: var(--color-text-on-felt-dim);
    }
    .cards { display: flex; gap: var(--space-2); }
    ```
    - `letter-spacing` + `text-transform` are applied manually alongside `--font-label-caps` — the documented label-caps consumption pattern (font shorthand can't carry tracking; no `text-transform` token exists by design). [Source: deferred-work.md:31 (1.2 typography-companion note); tokens.css:32,38]

- [x] **Task 4: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run test` → green: new `cards.test.ts` + existing `smoke.test.ts` + `sections.test.ts`. (AC1) [Source: 1-6-…md:135]
  - [x] `npm run check` → svelte-check + tsc, 0 errors / 0 warnings. [Source: 1-6-…md:134]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] **Manual visual pass (AC2, AC3, AC4)** — the primitives have no consuming screen yet (the Informational screen + Intro content are Stories 2.2/2.3), so render them temporarily to confirm, then revert:
    - In `App.svelte`'s content placeholder, **temporarily** render the canonical scenario as two groups — `<CardGroup label="Hand" cards={[parseCard('Ah'), parseCard('Kh')]} />` and `<CardGroup label="Board" cards={[parseCard('Qh'), parseCard('8h'), parseCard('7c')]} />` — run `npm run dev`, and confirm by eye:
      - White 2:3 faces, rounded `card` corners, the crisp double-shadow; rank centered **above** the suit symbol in mono; **no corner indices**. (AC2) ✅
      - All four suit colors present and correct on a mixed board: ♥ red, ♦ blue, ♣ green, ♠ black — symbol + color, legible on white. (AC3) ✅ (hearts red + club green confirmed; all four suit-color classes token-driven identically)
      - "HAND" and "BOARD" read as two distinct labeled groups. (AC4) ✅
    - **Revert the temporary `App.svelte` edit** before committing — the committed tree adds only `cards.ts`, `cards.test.ts`, `PlayingCard.svelte`, `CardGroup.svelte`; `App.svelte` stays byte-for-byte unchanged. ✅ [Source: 1-6-…md:235]
    - **No regression:** the shell still navigates (sidebar + pager) and reload returns to Introduction. ✅ [Source: 1-6-…md:141]
  - [x] Record exact command outputs + the visual-pass result in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This is the **first story of Epic 2** and builds the reusable card foundation the entire teaching half depends on: the canonical notation module (`cards.ts`) plus the two presentational primitives (`PlayingCard`, `CardGroup`). It is **all-new files, zero edits to existing source** (the Task-4 temporary `App.svelte` mount is reverted before commit). Nothing in the running app consumes these primitives yet — their first real consumer is `InformationalScreen` / `IntroContent` in Stories 2.2/2.3. Building the primitive before its consumer is the intended sequence. [Source: architecture.md:239-247 (impl sequence: "Build the PlayingCard primitive… reused everywhere"); epics.md Epic 2]

**Do NOT** in this story:
- **Re-parse card strings inside components.** `parseCard` runs once at the content/data boundary; components receive typed `Card`/`Card[]`. One decode point — that's the whole point of AR-3. [Source: architecture.md:285-290, 353-356]
- **Add a `size`/variant prop, hover states, selection, or flip/deal animation to the cards.** Fixed presentation now; the cards are static objects (restrained-motion rule bans card-dealing/flip animation). A size prop is YAGNI until a consumer needs it (note it as future, don't build it). [Source: UX-DR18 (banned: card-dealing/flip animations); DESIGN.md:233]
- **Add any npm dependency.** AR-1 stack is locked: Svelte 5 + TS + Vite + Vitest + svelte-check. No component-test lib (`@testing-library`, `jsdom`, `happy-dom`) — see Testing standards. [Source: epics.md AR-1; architecture.md:131-147]
- **Write a component/DOM test for PlayingCard/CardGroup.** The Vitest env is `node` and can't render Svelte; a render-test lib is a new dependency → AR-1 violation. Visual ACs (AC2–AC4) are verified manually (Task 4). The *pure* logic (`cards.ts`) IS unit-tested. [Source: vite.config.ts (`environment: 'node'`); deferred-work.md:39; architecture.md:449-452,508-509]
- **Introduce a second accent hue or any hardcoded hex/size that has a token.** Four suit colors + felt + gold + 2 feedback states is the entire palette. [Source: DESIGN.md:234; architecture.md:462-463]
- **Build the Informational screen, Intro content, cheat sheets, or assessment cards** → Stories 2.2–2.8 / Epic 3. [Source: architecture.md:427-444; epics.md]

### The canonical notation contract (AR-3 — the single most reused rule in the codebase)

- A card is the 2-char string `<rank><suit>`: rank ∈ `A K Q J T 9 8 7 6 5 4 3 2` (**`T` = ten, never `10`**); suit ∈ `h d c s` (**lowercase**). Examples: `Ah`, `Tc`, `Qh`.
- Internal model: `{ rank: Rank; suit: Suit }`. A single `parseCard`/`cardToString` pair is the only encode/decode site.
- **Anti-patterns that break everything downstream:** writing `'10'` for ten, uppercase suits (`'AH'`), or recomputing notation inline in a component. [Source: architecture.md:285-290, 371-377]
- Why this matters now: every later card (assessment scenarios `Ah Kh` / `Qh 8h 7c`, cheat-sheet decks, content examples) flows through this pair. A bug here is a bug everywhere — hence the mandated `cards.test.ts`.

### Why `cards.test.ts` is mandated here (TDD on the pure layer)

AR-4 names the assessment engine as the prime test target, but `cards.ts` is *also* pure, framework-free logic that runs in the **existing node Vitest env with zero new deps** — and it's the canonical encode/decode every card depends on. It's the cheapest, highest-leverage test in Epic 2. Write it test-first (red → green). The components, by contrast, are visual and node-untestable without a new dep, so they're verified manually. [Source: architecture.md:294-301 ("Tests co-located beside pure logic"); 449-452; epics.md AR-1]

### Card sizing — a documented literal (the literal-justification pattern)

DESIGN.md specifies the card's **shape** (`ratio: 2:3` → `--ratio-card`, `rounded: card` → `--radius-card`, `--shadow-card`, `--font-value-lg`) but **no card-width token**. Per the literal-justification pattern established in 1.4/1.5 (document *why* a literal is legitimate when DESIGN has no entry), set `width: 60px` directly on `.card` with a comment. Rationale: 60px width → 90px height via `aspect-ratio`, which comfortably seats the stacked `value-lg` (24px) rank + symbol with the 8px radius, and groups of 2–5 cards fit the ~60ch content column. Tune ±a few px by eye in the Task-4 visual pass. If a later story needs multiple sizes (e.g., smaller cheat-sheet cards), promote this to a `--size-card-*` token or a `size` prop then — not now. [Source: DESIGN.md:131-136 (playing-card spec, no width); deferred-work.md:32; 1-4-…md/1-5-…md literal-justification pattern]

### Closing two deferred items

- **`--ratio-card: 2 / 3` browser-compat (deferred from 1.2):** resolved by the **modern evergreen desktop** target — `aspect-ratio` is fully supported there; no fallback/polyfill needed. Consume `var(--ratio-card)` directly on `.card`. This closes the deferred note. [Source: deferred-work.md:32; EXPERIENCE.md:20 (evergreen target)]
- **label-caps companion tokens (deferred from 1.2):** `CardGroup`'s label applies `letter-spacing: var(--tracking-label-caps)` and `text-transform: uppercase` manually alongside `--font-label-caps` — the documented consumption pattern (the CSS `font` shorthand can't carry tracking; there is intentionally no `text-transform` token). [Source: deferred-work.md:31; tokens.css:32,38]

### Architecture compliance (guardrails)

- **Styling boundary:** every value from `tokens.css` (`--color-card-face`, `--radius-card`, `--shadow-card`, `--ratio-card`, `--font-value-lg`, `--color-suit-*`, `--space-*`, `--font-label-caps`, `--tracking-label-caps`). The only literal is the justified `width: 60px`. No hardcoded hex/size that has a token. [Source: architecture.md:462-463; DESIGN.md:234]
- **Naming:** PascalCase components (`PlayingCard.svelte`, `CardGroup.svelte`); camelCase TS (`parseCard`, `cardToString`, `cardLabel`); PascalCase types (`Card`, `Rank`, `Suit`); UPPER_SNAKE module consts (`RANKS`, `SUITS`, `SUIT_SYMBOL`, `RANK_LABEL`, `SUIT_LABEL`). [Source: architecture.md:269-283]
- **Structure:** `cards.ts` + `cards.test.ts` co-located in `src/lib/`; components in `src/lib/components/`. Matches the target tree exactly. [Source: architecture.md:402-425, 294-296]
- **State boundary untouched:** these are stateless presentational primitives + a pure module; no `appState`, no router, no new store. [Source: architecture.md:447-463]
- **Accessibility floor lives in PlayingCard:** symbol + color (never color alone) is enforced here, as the architecture designates this the home for the card a11y cue. [Source: architecture.md:481-483; NFR-2]
- **`noUncheckedIndexedAccess` is OFF** (pre-existing tsconfig), so `s[0]`/`s[1]` type as `string` (not `string | undefined`). `parseCard` guards `length === 2` first, then membership — safe regardless. [Source: deferred-work.md:22]

### Files — current state (read before editing)

- `pokermath/src/lib/cards.ts` — **NEW**. Types + `parseCard`/`cardToString`. (Architecture reserves this exact path for FR-7 card notation.)
- `pokermath/src/lib/cards.test.ts` — **NEW**. Co-located Vitest unit tests (node env — pure, no Svelte).
- `pokermath/src/lib/components/PlayingCard.svelte` — **NEW**. Four-color card primitive; sibling of existing `Sidebar.svelte`/`SidebarNavItem.svelte`/`Pager.svelte`.
- `pokermath/src/lib/components/CardGroup.svelte` — **NEW**. Labeled hand/board group; imports `PlayingCard` from `./PlayingCard.svelte`.
- `pokermath/src/App.svelte` — **TEMPORARY edit in Task 4 only**, reverted before commit (manual visual harness; no permanent change). [Source: architecture.md:402-425]

**Existing component idiom to match** (read `Pager.svelte`): `<script lang="ts">` first; Svelte 5 runes (`$props`, `$derived`); relative imports (`../appState.svelte`, `../../content/sections`); a single scoped `<style>` block reading `var(--…)`; semantic markup. PlayingCard/CardGroup follow the same shape. From `lib/components/`, import the card types as `import { type Card, cardToString } from '../cards'`. [Source: Pager.svelte:1-58]

**Must be preserved:** the shell remains working end-to-end — sidebar + pager navigation, the `{#key active.id}` section-head fade, `:focus-visible` ring, reduced-motion guard, no-persistence-on-reload. Since this story adds only new, unwired files (and reverts the Task-4 harness), nothing in the shell changes — verify no regression rather than expecting one. [Source: 1-6-…md:219; deferred-work.md]

### Previous story intelligence (Epic 1, Stories 1.1–1.6)

- **Token discipline + literal-justification is house style.** When a value isn't in DESIGN.md, document why the literal/new token is legitimate (1.4 button `font-weight:600`; 1.6 focus/motion tokens). Here: the `60px` card width (Card-sizing note above). [Source: 1-4-…md:139; 1-6-…md:57]
- **Co-located pure-logic tests run in node, components don't.** Epic 1 kept the Vitest env at `node` and never added a DOM test lib; `cards.ts` fits that env perfectly, components don't. [Source: 1-6-…md:234; vite.config.ts]
- **Stable-id keying.** Sidebar keys on `section.id`, the section fade keys on `active.id`; `CardGroup`'s `{#each}` keys on `cardToString(card)` for the same reason. [Source: 1-6-…md:119]
- **Work discipline:** small per-task verified commits, `feat(2.1)` → `review(2.1)` cadence, exact command outputs in Completion Notes, deferred items tracked in `deferred-work.md` (not dropped). [Source: git log; 1-6-…md Change Log; deferred-work.md]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `f78c6d8` (`review(1.6)` — Epic 1 complete: FR-1/2/3 + the NFR-2 / UX-DR18/19/20 baselines). 2.1 opens Epic 2 and is a pure *additive* step: four new files under `src/lib/`, no edits to existing source (the Task-4 `App.svelte` harness is reverted). `_bmad*/` and `docs/` stay untouched. This is the first brick of the teaching half. [Source: git log -6; sprint-status.yaml:55-65]

### Testing standards

- **Mandated:** `src/lib/cards.test.ts` (pure, node env, zero new deps) — round-trip identity over the 52-card space + rejection of malformed notation (`'10c'`, `'AH'`, bad rank/length). Write it test-first.
- **Not mandated / not allowed:** a component render test for `PlayingCard`/`CardGroup` — would require a DOM test lib (new dependency → AR-1 violation). Visual ACs are verified by the Task-4 manual pass. Do not invent a brittle snapshot test. [Source: architecture.md:449-452, 508-509; deferred-work.md:39; epics.md AR-1]
- **Verification = `test`/`check`/`build` green + the Task-4 visual walkthrough** (four suit colors with symbols, 2:3 white faces, stacked no-index layout, two distinct labeled groups, no shell regression). Existing 5 tests stay green (this story changes none of their logic). [Source: 1-6-…md:235-236]

### Project Structure Notes

Four new files, all within the architecture target tree — no structural variance. `cards.ts`/`cards.test.ts` at `src/lib/`; `PlayingCard.svelte`/`CardGroup.svelte` at `src/lib/components/` (role-based organization: shared primitives live in `components/`). These primitives are consumed beginning in Story 2.2 (`InformationalScreen`) and 2.3 (`IntroContent`), then by every assessment screen and the Deck/HandRankings cheat sheets — built once here, reused everywhere. [Source: architecture.md:402-425, 474-475 (FR-7 → PlayingCard/CardGroup/cards.ts)]

Files touched:
- `pokermath/src/lib/cards.ts` — NEW
- `pokermath/src/lib/cards.test.ts` — NEW
- `pokermath/src/lib/components/PlayingCard.svelte` — NEW
- `pokermath/src/lib/components/CardGroup.svelte` — NEW

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.1] — story statement + acceptance criteria (lines 287-309)
- [Source: _bmad-output/planning-artifacts/epics.md] — FR-7 graphical four-color card rendering (line 27), AR-3 canonical card notation (line 56), AR-9 content split (line 62), UX-DR6 PlayingCard primitive (line 73), UX-DR7 CardGroup (line 74), NFR-2 accessibility floor / suit never color-alone (line 38)
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns] — canonical card notation (lines 285-290), code naming (269-283)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — target tree (`lib/cards.ts`, `lib/components/PlayingCard.svelte`, `CardGroup.svelte`, co-located tests) (lines 402-425), FR-7 → structure mapping (line 474-475), pure-logic/test conventions (294-301, 449-452, 508-509)
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement] — single parse/encode pair, token discipline, no Svelte in pure logic (lines 351-377, 462-463)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — playing-card component spec / 2:3 / card radius / double-shadow / value-lg (lines 131-136, 216), four-color suits + white face (177), elevation/two-shadow-roles (200), no second hue (234)
- [Source: pokermath/src/styles/tokens.css] — `--color-card-face` (20), `--color-suit-*` (21-24), `--radius-card` (44), `--shadow-card` (60), `--ratio-card` (72), `--font-value-lg` (35), `--font-label-caps`/`--tracking-label-caps` (32,38), `--space-1/2` (49-50)
- [Source: pokermath/src/lib/components/Pager.svelte] — existing component idiom to match (runes, relative imports, scoped `<style>` with `var(--…)`)
- [Source: pokermath/vite.config.ts] — `test.environment: 'node'` (why `cards.ts` is unit-tested but components are not)
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — closes `--ratio-card` browser-compat (line 32) and label-caps companion-token consumption (line 31); `noUncheckedIndexedAccess` OFF (line 22); node-env / no component-test-lib (line 39)
- [Source: _bmad-output/implementation-artifacts/1-6-keyboard-operability-visible-focus-restrained-motion-baseline.md] — predecessor: stable-id keying, literal-justification pattern, node-env testing rule, verification cadence, ARIA-restraint guidance

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None — implementation proceeded cleanly without halts.

### Completion Notes List

**Task 1 — `cards.ts` / `cards.test.ts` (AC1)**
- RED: wrote `cards.test.ts` (69 cases total: parseCard per-suit, per-rank spread, 6 malformed-input throws, cardToString round-trip, + 52 round-trip identity cases over full 13×4 deck). Tests failed as expected — `cards.ts` did not exist.
- GREEN: implemented `cards.ts` with `Rank`/`Suit`/`Card` types, `RANKS`/`SUITS` const arrays, `parseCard` (length guard → rank/suit membership), `cardToString`. `noUncheckedIndexedAccess` is OFF so `s[0]`/`s[1]` type as `string` — guarded by `length === 2` check first.
- `npm run test -- --run`: **3 test files, 69 tests, all passed**. `npm run check`: **93 files, 0 errors, 0 warnings**.

**Task 2 — `PlayingCard.svelte` (AC2, AC3)**
- Svelte 5 runes, `$props()`, typed `Card` prop. `SUIT_SYMBOL` / `RANK_LABEL` / `SUIT_LABEL` module-level consts. `role="img"` + `aria-label` via `cardLabel()` helper. Styling: `width: 60px` (justified literal per Card-sizing note), `aspect-ratio: var(--ratio-card)`, all other values from tokens. Four suit-color classes via `.card.suit-h`/`d`/`c`/`s` — both rank and suit span inherit the suit color. No hardcoded hex.

**Task 3 — `CardGroup.svelte` (AC4)**
- Props: `cards: Card[]` + `label: string`. `{#each}` keyed on `cardToString(card)`. Label styled with `--font-label-caps` + `--tracking-label-caps` + `text-transform: uppercase` (documented companion pattern). All spacing from `--space-2`.

**Task 4 — Verification**
- `npm run test -- --run`: **69/69 passed** (existing 5 + 64 new cards tests).
- `npm run check`: **0 errors, 0 warnings**.
- `npm run build`: **success** — `dist/index.html` + CSS 6.07 kB + JS 43.22 kB (harness build); after revert: CSS 4.88 kB + JS 41.54 kB (clean build).
- Visual screenshot via headless Playwright on `http://localhost:5176` confirmed: white 2:3 cards, rounded corners, double-shadow, rank above suit symbol in JetBrains Mono, no corner indices (AC2); hearts red + clubs green, rank+symbol both colored (AC3); "HAND" (2 cards) and "BOARD" (3 cards) as two distinct labeled groups (AC4).
- `App.svelte` reverted byte-for-byte; no permanent change to existing source.

### File List

- `pokermath/src/lib/cards.ts` — NEW
- `pokermath/src/lib/cards.test.ts` — NEW
- `pokermath/src/lib/components/PlayingCard.svelte` — NEW
- `pokermath/src/lib/components/CardGroup.svelte` — NEW

## Change Log

- 2026-05-29: Implemented Story 2.1 — added `cards.ts` canonical notation module, `cards.test.ts` (69 tests, full round-trip + malformed rejection coverage), `PlayingCard.svelte` four-color card primitive, `CardGroup.svelte` labeled group wrapper. All ACs satisfied. (claude-sonnet-4-6)
