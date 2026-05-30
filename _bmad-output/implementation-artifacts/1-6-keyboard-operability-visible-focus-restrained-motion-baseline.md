---
baseline_commit: 49821fb
---

# Story 1.6: Keyboard operability, visible focus & restrained-motion baseline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner who may rely on the keyboard or be sensitive to motion,
I want the whole shell to be keyboard-operable with visible focus and only quiet transitions,
so that I can navigate comfortably without a mouse and without distracting animation.

## Acceptance Criteria

**AC1 — visible focus in reading order (UX-DR19, UX-DR20, NFR-2)**
**Given** the shell
**When** I navigate with Tab
**Then** focus moves through interactive elements in reading order and is always visibly indicated — on both the light sidebar and the felt content area

**AC2 — full keyboard operability (UX-DR20, NFR-2)**
**Given** the keyboard only
**When** I use it
**Then** every sidebar Section item and the Back/Next controls are reachable and activatable (Enter/Space) — the full shell is operable without a mouse

**AC3 — restrained Section-switch motion (UX-DR18, NFR-1)**
**Given** a Section switch
**When** it occurs
**Then** the transition uses only a quick, quiet fade — no spinner, no celebratory animation, no auto-advance
**And** when the OS requests reduced motion, the switch is instant (no animation)

**AC4 — no hover-dependent functionality (UX-DR20)**
**Given** any interactive element
**When** the learner interacts
**Then** no functionality is hidden behind hover — everything operable is reachable by keyboard and click

## Tasks / Subtasks

- [x] **Task 1: Add focus + motion tokens to `tokens.css` (AC: #1, #3)**
  - [x] In `pokermath/src/styles/tokens.css`, add a **Focus** block:
    ```css
    /* Focus */
    --color-focus: var(--color-gold);
    --focus-ring-width: 2px;
    --focus-ring-offset: 2px;
    ```
    `--color-focus` defaults to gold (the accent) — high-contrast on the felt content area. It is a **cascading override point**: the light sidebar re-sets it (Task 3) so the ring stays visible on near-white without introducing a new hue. [Source: DESIGN.md:174,234 (gold is the accent; no second hue); EXPERIENCE.md:105 ("Focus is always visible")]
  - [x] Add a **Motion** block:
    ```css
    /* Motion */
    --motion-fast: 120ms;
    --motion-ease: ease;
    ```
    These are the restrained-motion baseline every later epic inherits. **Why a NEW token (not a DESIGN.md transcription):** DESIGN.md enumerates color/type/space/radius/component tokens but no focus or motion token — yet EXPERIENCE.md mandates *visible focus* and *quick, quiet fades* as behavioral rules. 1.6 establishes the tokens that encode those mandated behaviors. This is **not** a token-discipline breach (there is no DESIGN entry being ignored); it is the story whose job is to lay this baseline down. [Source: epics.md Story 1.6 title; EXPERIENCE.md:95,105; DESIGN.md:167,228 ("motion is restrained by rule … quick and quiet")]
  - [x] Do **not** hardcode `120ms`, `2px`, or a ring color in any component — every focus/motion value flows from these tokens (same styling-boundary discipline as 1.2–1.5). [Source: architecture.md:462-463; 1-5-…md (token discipline)]

- [x] **Task 2: Global `:focus-visible` ring + reduced-motion guard in `global.css` (AC: #1, #3)**
  - [x] In `pokermath/src/styles/global.css`, add ONE global focus rule:
    ```css
    :focus-visible {
      outline: var(--focus-ring-width) solid var(--color-focus);
      outline-offset: var(--focus-ring-offset);
    }
    ```
    Use **`:focus-visible`, not `:focus`** — the ring shows for keyboard focus but not on mouse click, matching the calm/quiet aesthetic (no ring flashing when clicking). `:focus-visible` is fully supported in the modern evergreen target browsers. [Source: EXPERIENCE.md:20 (evergreen target), 105 (focus visible); DESIGN.md:167,228 (quiet)]
  - [x] **Never suppress focus** — do not add `outline: none` anywhere (no component currently does; keep it that way). The whole point of this story is a visible ring. [Source: EXPERIENCE.md:105; NFR-2]
  - [x] Add the standard **reduced-motion guard** (the inheritable baseline):
    ```css
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```
    This neutralizes any CSS animation/transition when the OS requests reduced motion — including the Task 4 Section fade and everything Epic 2/3 add later. It only governs **CSS** motion, which is exactly why Task 4 uses a CSS animation (not a Svelte JS transition — those would bypass this guard). [Source: EXPERIENCE.md:95 (restrained motion hard rule); UX-DR18]

- [x] **Task 3: Keep the focus ring visible on the light sidebar (AC: #1)**
  - [x] In `pokermath/src/lib/components/Sidebar.svelte`, override the focus color on the sidebar container so descendants inherit a ring that contrasts against the near-white surface:
    ```css
    .side {
      --color-focus: var(--color-sidebar-text);
      /* …existing rules unchanged… */
    }
    ```
    **Why:** gold (`#e0b24c`) on the near-white sidebar (`--color-sidebar` `#eef0ee` / active `#dfe6e2`) is only ≈1.7:1 — too faint to read as a focus indicator. `--color-sidebar-text` (`#20262a`, the ink already used for sidebar titles) gives a strong, in-palette ring (a neutral, **not a new accent hue**). Because `--color-focus` is a CSS custom property, re-setting it on `.side` cascades to every focusable descendant (the nav buttons) with no change to the global rule. The felt content area keeps the gold ring from `:root`. [Source: tokens.css:8-9,13; DESIGN.md:234 (no second hue — neutral ink is allowed); EXPERIENCE.md:105]
  - [x] Verify the sidebar nav buttons (`SidebarNavItem`) pick up the ink ring and the Pager buttons (on felt) keep the gold ring. No per-component outline rule is needed — both inherit the single global `:focus-visible`. [Source: SidebarNavItem.svelte:17; Pager.svelte:20,25]

- [x] **Task 4: Quiet Section-switch fade in `App.svelte` (AC: #3)**
  - [x] In `pokermath/src/App.svelte`, wrap the per-Section title/subtitle in a keyed block so a fresh node mounts on each Section change, and animate that mount with a short CSS fade. Leave `<Pager />` **outside** the key so it does not flicker on every step:
    ```svelte
    <main class="main">
      {#key active.id}
        <div class="section-head">
          <h1 class="section-title">{active.title}</h1>
          <p class="section-subtitle">{active.subtitle}</p>
        </div>
      {/key}
      <Pager />
    </main>
    ```
  - [x] Add the fade as a **CSS animation** (so the reduced-motion guard in Task 2 governs it automatically):
    ```css
    .section-head {
      animation: section-fade var(--motion-fast) var(--motion-ease);
    }
    @keyframes section-fade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    ```
    Opacity-only is the most restrained choice (DESIGN: "prefer an instant state change to an animated one"). A tiny `translateY` is *permitted* by UX-DR18 ("fades/position shifts") but not required — keep it to opacity unless it reads better. **Do NOT** use `svelte/transition`'s JS `fade` here: Svelte JS transitions animate via inline styles and would **bypass** the `prefers-reduced-motion` CSS guard, breaking AC3's reduced-motion clause. CSS animation inherits the guard for free. [Source: EXPERIENCE.md:95; DESIGN.md:228; UX-DR18]
  - [x] `{#key active.id}` keys on the stable Section id (not the numeric index) — consistent with the `(section.id)` keying the Sidebar already uses. The incoming node fades in; the outgoing node is removed instantly (no cross-fade) — quick and quiet. [Source: Sidebar.svelte:13; content/sections.ts:13 (stable ids)]
  - [x] Keep `.main`'s existing `display:flex; flex-direction:column` and the `margin-top:auto` pager pin intact — wrapping the head in `.section-head` must not break the Pager floating to the bottom. The `.section-head` is a normal flow child above the pager. [Source: App.svelte:29-34; Pager.svelte:31-36 (`margin-top:auto`)]

- [x] **Task 5: Close deferred a11y items from 1.3–1.5 (AC: #1, #2)**
  - [x] **Pager arrow glyphs (closes 1.5 defer).** In `pokermath/src/lib/components/Pager.svelte`, mark the decorative arrows so the buttons' accessible names are the clean words "Back" / "Next" (not "left-arrow Back"):
    ```svelte
    <button type="button" class="btn ghost" onclick={back}><span aria-hidden="true">←</span> Back</button>
    …
    <button type="button" class="btn primary" onclick={next}>Next <span aria-hidden="true">→</span></button>
    ```
    Prefer `aria-hidden` on the glyph over a redundant `aria-label` (which would duplicate the visible text). The visible label stays unchanged. [Source: 1-5-…md Review Findings ("Pager `<button>` elements lack individual aria-label → Story 1.6"); Pager.svelte:20,25]
  - [x] **SidebarNavItem accessible name (closes 1.4 defer — verify, likely no change).** The button's accessible name is the concatenation of its two spans → e.g. "Introduction Poker & hand notation", with `aria-current="step"` on the active item. Confirm this reads sensibly to a screen reader and `aria-current` is announced. **No code change is required** unless the composite name reads poorly; if so, the minimal fix is to make the subtitle a description rather than part of the name — do not over-engineer ARIA here. [Source: SidebarNavItem.svelte:17-27; 1-4-…md Review Findings line 240]
  - [x] **Heading / landmark audit (closes 1.3 defer — verify, likely no change).** Confirm exactly one `<h1>` renders per screen (`.section-title`), `<aside>` (sidebar) and `<main>` (content) landmarks are present, and the "PokerMath" wordmark stays a non-heading `<span>` (it is app chrome, not section content). The current structure already satisfies this — this is an audit, not a refactor. [Source: App.svelte:13-17; Sidebar.svelte:7-8; 1-4-…md Dev Notes line 173 ("aside/heading-hierarchy cleanup … 1.6 scope")]

- [x] **Task 6: Verify (AC: #1, #2, #3, #4)**
  - [x] `npm run check` → svelte-check + tsc report 0 errors / 0 warnings. [Source: 1-5-…md Completion Notes]
  - [x] `npm run test` → green (existing `smoke.test.ts` + `sections.test.ts` stay passing; **no new test mandated** — see Testing standards). [Source: 1-5-…md:238]
  - [x] `npm run build` → succeeds, emits static `dist/` (AR-8). [Source: epics.md AR-8]
  - [x] `npm run dev` → open the app and confirm manually, then stop the dev server (long-lived process):
    - **AC2/AC1 keyboard + focus:** From a cold load press **Tab** repeatedly. Focus lands, in order, on the four sidebar Section items, then **Back** (when present), then **Next** — i.e. left pane top-to-bottom, then content pane. A **visible ring** shows on each: **dark ink** on the light sidebar items, **gold** on the felt Back/Next. Press **Enter/Space** on a focused sidebar item → it jumps to that Section; on **Next/Back** → it steps. The full flow is completable with no mouse. (AC1, AC2)
    - **AC3 motion:** Switching Section (via Tab+Enter or click) shows a single quick, quiet fade of the new title/subtitle — no spinner, no bounce, no auto-advance; the Pager does not flicker. Then enable OS "reduce motion" (macOS: System Settings → Accessibility → Display → Reduce motion; Windows: Settings → Accessibility → Visual effects → Animation effects off) and reload → the Section switch is **instant** with no fade. (AC3)
    - **AC4 no hover-dependence:** Nothing is revealed or enabled only on hover — confirm by operating the entire shell with the keyboard alone (already covered above). There are no `:hover` rules that gate functionality. (AC4)
    - **No regressions:** sidebar + pager still navigate and stay in sync; reload returns to Introduction (no persistence). [Source: 1-5-…md:240-248]
  - [x] Record exact command outputs in Dev Agent Record → Completion Notes.

## Dev Notes

### Scope boundary (read first)

This story adds the **accessibility & motion baseline** to the finished walking-skeleton shell — the floor that **every later screen inherits**. It is small and mostly *styling + verification*: focus + motion tokens, one global `:focus-visible` rule, one global reduced-motion guard, one sidebar token override, one quiet Section-switch fade, and closing three deferred a11y findings. The sidebar, pager, store, sections, and two-pane frame all already exist (Stories 1.1–1.5); this story polishes how they respond to the keyboard and to motion preferences.

**Do NOT** in this story:
- **Add arrow-key "roving tabindex" / custom keyboard navigation.** The ACs require Tab-in-reading-order + Enter/Space activation — which native `<button>`s already provide (1.4/1.5 chose semantic buttons precisely so 1.6 is a formality). Roving arrow-key nav is not required and would be gold-plating. [Source: epics.md Story 1.6 AC; 1-4-…md:45,50; 1-5-…md:63]
- **Suppress or restyle the focus ring per-component.** One global `:focus-visible` rule + one cascading `--color-focus` override is the entire focus system. No per-button outline rules. [Source: this story Tasks 2-3]
- **Use a JS animation library or `svelte/transition`'s JS `fade` for the Section switch** — it would bypass the `prefers-reduced-motion` guard (AC3). Use a CSS animation. No new dependency. [Source: EXPERIENCE.md:95; epics.md AR-1]
- **Add any npm dependency** (no `@testing-library`, `jsdom`, `happy-dom`, axe, focus-trap, etc.). The AR-1 stack is locked: Svelte 5 + TS + Vite + Vitest + svelte-check. [Source: epics.md AR-1; architecture.md:131-147]
- **Build screen archetypes, cheat-sheet panel/modal, hover affordances, or assessment state** → Epic 2/3. The fade attaches to the current title/subtitle placeholder; when Epic 2 builds `InformationalScreen.svelte` the same baseline (tokens + global rules) carries over unchanged. [Source: architecture.md:427-429; epics.md Epic 2/3]
- **Introduce a second accent hue.** Focus uses gold (felt) + the existing neutral sidebar ink (light surface); both are already in the palette. [Source: DESIGN.md:234]

### What is ALREADY done (so you verify, not rebuild)

The keyboard-operability ACs are largely satisfied by construction — confirm, don't re-engineer:

| Already in place | Where | What 1.6 does |
|---|---|---|
| Semantic `<button type="button">` for every nav/pager control (native Tab + Enter/Space) | `SidebarNavItem.svelte:17`, `Pager.svelte:20,25` | verify reachable/activatable (AC2) |
| `<nav aria-label>` landmarks + `<aside>`/`<main>` | `Sidebar.svelte:12`, `Pager.svelte:17`, `App.svelte:13` | audit (Task 5) |
| `aria-current="step"` on active Section | `SidebarNavItem.svelte:22` | verify announced (Task 5) |
| DOM order = reading order (sidebar then content) | `App.svelte:10-18` | verify Tab order (AC1) |
| No `:hover` rules anywhere (none in code or mockups) | (grep-confirmed) | audit no hover-dependence (AC4) |

What is **missing** and is the real work: **(a)** no focus styling at all (only the inconsistent UA default ring) → Tasks 1-3; **(b)** no motion tokens / reduced-motion guard / Section transition → Tasks 1,2,4.

### Component composition (after this story)

```
App.svelte
 ├─ <Sidebar />                         (+ .side { --color-focus: ink } — Task 3)
 ├─ <main class="main">                 (flex-column, unchanged)
 │    ├─ {#key active.id}               ← NEW: remount per Section
 │    │    └─ <div class="section-head"> ← NEW: CSS fade-in (--motion-fast)
 │    │         ├─ <h1 class="section-title">
 │    │         └─ <p class="section-subtitle">
 │    └─ <Pager />                       (outside the key; arrows → aria-hidden — Task 5)
 └─ <div class="modal-layer">           (unchanged)

styles/tokens.css   + Focus block (--color-focus, --focus-ring-width/-offset) + Motion block (--motion-fast, --motion-ease)
styles/global.css   + :focus-visible rule + @media (prefers-reduced-motion: reduce) guard
```

- **Focus system (the cascade trick):** `:root` sets `--color-focus: var(--color-gold)`; the single global `:focus-visible` reads it. `.side` re-sets `--color-focus` to the neutral ink, so sidebar descendants inherit a visible ring on near-white while the felt content area keeps gold. One rule, one token, surface-aware — no per-component focus CSS. [Source: tokens.css:8,13; global.css; Sidebar.svelte]
- **Motion system:** `--motion-fast`/`--motion-ease` drive the fade; the `prefers-reduced-motion` guard zeroes all CSS animation/transition durations. Because the fade is CSS, it is governed by the guard automatically — this is the inheritable baseline for Epic 2/3 (hint/success fades, modal open). [Source: EXPERIENCE.md:95; UX-DR18]

### Why CSS animation, not Svelte JS transition (the one real trap)

Svelte's `svelte/transition` `fade` animates with JS-driven inline styles and does **not** consult `prefers-reduced-motion`. If you use it, AC3's reduced-motion clause fails (the fade still plays). A plain CSS `@keyframes` + `animation` on a `{#key}`-remounted node runs on mount and **is** subject to the global `@media (prefers-reduced-motion: reduce)` guard → instant when reduced motion is on. Use CSS. (This also keeps the dependency surface at zero.) [Source: EXPERIENCE.md:95; epics.md AR-1]

### Focus-ring contrast — the sidebar gotcha (don't ship a gold ring there)

- Felt content area (Back/Next): gold `#e0b24c` on felt `#0b3d2c` ≈ high contrast → great.
- Light sidebar (nav items): gold `#e0b24c` on `#eef0ee`/`#dfe6e2` ≈ **1.7:1** → effectively invisible. This is why Task 3 overrides `--color-focus` to the sidebar ink `#20262a` (≈13:1 on near-white). Verify both rings by eye in Task 6 — "focus always visible" (NFR-2) is the bar, and a faint gold ring on the sidebar would fail AC1. [Source: tokens.css:3,8,11,13; EXPERIENCE.md:105]

### Architecture compliance (guardrails)

- **Styling boundary:** all focus/motion values are tokens in `tokens.css`; components/global reference `var(--…)`. No hardcoded `2px`/`120ms`/ring color. The two new token *families* are justified above (spec-mandated behavior with no prior DESIGN entry). [Source: architecture.md:462-463]
- **No-router / single store untouched:** this story adds no state and no navigation logic; `{#key active.id}` reads the existing `$derived(active)`. [Source: architecture.md:198-207; App.svelte:7]
- **Accessibility floor is a cross-cutting component rule** realized here for the shell: visible focus, keyboard-operable, no color-only/ hover-only cues. [Source: architecture.md:481-484, 558-562; NFR-2]
- **Restrained motion is a process pattern** ("No spinners/confetti; quick quiet fades"): the fade + reduced-motion guard implement it for the shell. [Source: architecture.md:347-349; DESIGN.md:228]
- **Naming:** kebab CSS token vars (`--color-focus`, `--motion-fast`); PascalCase components unchanged. [Source: architecture.md:280-283]
- **Stack locked:** no new runtime/build/test library. [Source: epics.md AR-1]

### Files being modified — current state (read before editing)

- `pokermath/src/styles/tokens.css` (UPDATE) — `:root` token block; **append** a Focus block and a Motion block. Existing tokens untouched. [Source: tokens.css:1-75]
- `pokermath/src/styles/global.css` (UPDATE) — currently `@import './tokens.css'`, box-sizing reset, `body`. **Append** the `:focus-visible` rule and the `prefers-reduced-motion` `@media` block. [Source: global.css:1-15]
- `pokermath/src/lib/components/Sidebar.svelte` (UPDATE) — **add** `--color-focus: var(--color-sidebar-text)` to the existing `.side` rule (one line). Everything else unchanged. [Source: Sidebar.svelte:25-30]
- `pokermath/src/App.svelte` (UPDATE) — wrap title/subtitle in `{#key active.id}` + `.section-head`; add `.section-head` animation + `@keyframes` in `<style>`. Keep `.main` flex-column + Pager-outside-the-key. `active`, the grid, `.modal-layer` unchanged. [Source: App.svelte:13-17,29-54]
- `pokermath/src/lib/components/Pager.svelte` (UPDATE) — wrap the `←`/`→` glyphs in `<span aria-hidden="true">`. Markup labels and styles otherwise unchanged. [Source: Pager.svelte:20,25]
- `pokermath/src/lib/components/SidebarNavItem.svelte` — **verify only** (accessible name + `aria-current`); change only if the composite name reads poorly. [Source: SidebarNavItem.svelte:17-27]

**Must be preserved:** the two navigation paths (sidebar jump + pager step) and their store sync, the reactive title/subtitle swap, no-persistence-on-reload, the `248px 1fr` grid, the pager pinned to the bottom of `.main`. The shell must remain working end-to-end with the new a11y/motion baseline layered on — not just satisfy the four ACs. [Source: 1-5-…md:179]

### Previous story intelligence (Stories 1.3–1.5)

- **The semantic-button a11y seam was planted for this story.** 1.4 (`SidebarNavItem`) and 1.5 (`Pager`) used `<button type="button">` + `<nav aria-label>` + `aria-current` explicitly so 1.6's keyboard work is verification, not a retrofit. Trust that seam — do not convert to custom widgets. [Source: 1-4-…md:45,50,173; 1-5-…md:63]
- **Three deferred findings funnel into 1.6** (all closed in Task 5): 1.3 → ARIA/semantic + aside/heading cleanup; 1.4 → SidebarNavItem composite name (`SidebarNavItem.svelte:17-27`); 1.5 → Pager button arrow/aria-label (`Pager.svelte:19,23`). [Source: 1-3-…md, 1-4-…md:240, 1-5-…md:81]
- **Token discipline + literal-justification pattern:** when a value isn't in DESIGN.md, 1.4/1.5 documented *why* the literal/new token is legitimate (e.g. button `font-weight:600`). Same here: the focus/motion tokens are documented as spec-mandated baselines, not drift. [Source: 1-4-…md:139; 1-5-…md:150]
- **Work discipline (1.1–1.5):** small per-AC verified commits, `feat(1.6)` → `review(1.6)` cadence, exact command outputs in Completion Notes, deferred items tracked not dropped. Follow the same. [Source: git log; 1-5-…md Change Log]

### Git intelligence

Clean per-story cadence on `main`; baseline for this story is `49821fb` (`review(1.5)` — story done). 1.5 added `Pager.svelte` and edited `App.svelte`. 1.6 touches no new files — it edits five existing files (two CSS, three Svelte) with small additive changes (token blocks, one global rule + one media query, one `.side` line, one `{#key}` wrap + keyframes, two `aria-hidden` spans). A strict forward step; `_bmad*/` and `docs/` stay untouched. This is the last story of Epic 1 — after `review(1.6)` the shell (FR-1, FR-2, FR-3 + the NFR-2/UX-DR18/19/20 baselines) is complete. [Source: git log -5; sprint-status.yaml:52-53]

### Testing standards

- **No new automated test is mandated.** Focus visibility, Tab order, the fade, and reduced-motion are DOM/visual/computed-style behaviors; the Vitest env is `node` (`vite.config.ts:9`) and cannot render components or read `prefers-reduced-motion`. Adding a DOM/component test lib (`@testing-library/svelte` / `jsdom` / `happy-dom`) is a **new dependency → AR-1 violation**. The only mandated unit-test target is the assessment engine (Epic 3). Do not write a component test here. [Source: vite.config.ts:7-10; architecture.md:449-452,508-509; epics.md AR-1; 1-5-…md:195]
- **Verification = `check`/`test`/`build` green + the Task-6 manual walkthrough** (Tab order + visible ring on both surfaces; Enter/Space activation; quick fade on switch; instant under reduced-motion; no hover-dependence; no nav regression). A headless-browser visual pass (as 1.5 did ad hoc, without adding it to `package.json`) is acceptable but optional. Do not invent a brittle snapshot test. [Source: 1-5-…md:240-248]
- Existing tests must stay green: `smoke.test.ts` + `sections.test.ts` (5 tests). This story changes no logic they cover. [Source: 1-5-…md:238]

### Project Structure Notes

No new files — a strict in-place hardening of existing shell files, fully within the architecture target tree. The Section-switch fade currently attaches to the `App.svelte` title/subtitle placeholder; per the target tree, when Epic 2 introduces `screens/InformationalScreen.svelte` the placeholder is replaced, but the **baseline** established here (focus tokens + global `:focus-visible` + reduced-motion guard + motion tokens) is global and carries over with zero change — later screens inherit it for free. No structural conflict. [Source: architecture.md:383-445,427-429]

Files touched:
- `pokermath/src/styles/tokens.css` — MODIFIED (Focus + Motion token blocks)
- `pokermath/src/styles/global.css` — MODIFIED (`:focus-visible` rule + reduced-motion guard)
- `pokermath/src/lib/components/Sidebar.svelte` — MODIFIED (`.side` `--color-focus` override)
- `pokermath/src/App.svelte` — MODIFIED (`{#key}` + `.section-head` fade)
- `pokermath/src/lib/components/Pager.svelte` — MODIFIED (arrow glyphs → `aria-hidden`)
- `pokermath/src/lib/components/SidebarNavItem.svelte` — VERIFIED (change only if composite name reads poorly)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.6] — story statement + acceptance criteria (lines 259-281)
- [Source: _bmad-output/planning-artifacts/epics.md] — UX-DR18 (restrained motion, banned animations, line 85), UX-DR19 (a11y floor: focus always visible, tab order = reading order, line 86), UX-DR20 (keyboard model: Tab/Enter/Esc/arrows, no hover-dependence, line 87), NFR-1 (instant, no loaders, line 37), NFR-2 (a11y floor: visible focus + full keyboard operability, line 38), AR-1 (stack lock, line 54)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/EXPERIENCE.md] — line 20 (evergreen desktop browsers), 92-95 (Interaction Primitives: click-to-act / keyboard Tab-Enter-Esc-arrow / restrained-motion hard rule + banned list), 98-107 (Accessibility Floor: focus always visible, tab = reading order, keyboard-operable full flow)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-PokerMath-2026-05-28/DESIGN.md] — line 167 (motion restrained by rule — quick/quiet, no spinners), 174 (gold = the accent / actionable), 228 ("Keep motion quick and quiet; prefer an instant state change to an animated one"), 234 (no second accent hue — palette is felt + gold + 2 feedback + 4 suit)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — lines 347-349 (no loading states; quick quiet fades), 280-283 (kebab token naming), 462-463 (styling boundary), 481-484 & 558-562 (accessibility floor as component rule)
- [Source: pokermath/src/styles/tokens.css] — `:root` tokens to extend (colors at 3,8,11,13; gold 13)
- [Source: pokermath/src/styles/global.css] — base file to extend (`:focus-visible` + reduced-motion guard)
- [Source: pokermath/src/App.svelte] — content `<main>` (lines 13-17) to wrap in `{#key}`; `.main` flex-column (29-34)
- [Source: pokermath/src/lib/components/Sidebar.svelte] — `.side` rule (25-30) to add the `--color-focus` override
- [Source: pokermath/src/lib/components/SidebarNavItem.svelte] — semantic button + `aria-current` (17-27) to verify
- [Source: pokermath/src/lib/components/Pager.svelte] — Back/Next buttons (20,25) to make arrows decorative
- [Source: pokermath/vite.config.ts] — `test.environment: 'node'` (why no component test)
- [Source: _bmad-output/implementation-artifacts/1-5-back-next-pager.md] — predecessor: Pager + semantic-button seam, deferred Pager aria-label, verification cadence
- [Source: _bmad-output/implementation-artifacts/1-4-sidebar-section-index-free-navigation.md] — semantic-button/`<nav>`/`aria-current` seam, deferred SidebarNavItem composite-name + aside/heading-hierarchy items (lines 173, 240)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- Task 1: Appended Focus block (`--color-focus`, `--focus-ring-width`, `--focus-ring-offset`) and Motion block (`--motion-fast: 120ms`, `--motion-ease: ease`) to `tokens.css`. No hardcoded values in any component.
- Task 2: Appended global `:focus-visible` rule (2px solid, 2px offset, reads `--color-focus`) and universal `prefers-reduced-motion` guard to `global.css`. No `outline:none` added anywhere — confirmed via Playwright CSS rule scan.
- Task 3: Added `--color-focus: var(--color-sidebar-text)` as first property on `.side` in `Sidebar.svelte`. Verified at runtime: sidebar reports `#20262a` (ink), felt content area keeps `#e0b24c` (gold). Playwright screenshot confirms dark ink ring on sidebar items vs gold ring on Next button.
- Task 4: Wrapped `<h1>` + `<p>` in `{#key active.id}<div class="section-head">` in `App.svelte`. Added CSS `@keyframes section-fade` opacity 0→1 animation driven by `--motion-fast`/`--motion-ease`. Svelte scopes the keyframe name (`svelte-...-section-fade`) — animation confirmed running at runtime (animationName reported). `<Pager />` stays outside the key; pager-bottom pin preserved.
- Task 5: Wrapped `←`/`→` glyphs in `<span aria-hidden="true">` in `Pager.svelte`. Confirmed via Playwright: 2 `[aria-hidden="true"]` spans in the pager. SidebarNavItem accessible name (title+subtitle + `aria-current="step"`) verified — no change needed. Heading/landmark audit passed: one `<h1>`, `<aside>`, `<main>`, wordmark `<span>` — no change needed.
- Task 6: `npm run check` → 0 errors 0 warnings. `npm run test` → 5/5 (smoke + sections). `npm run build` → dist/ emitted 186ms. Playwright headless verification: Tab order = 4 sidebar items → Next (reading order); dark ink ring on sidebar, gold ring on Next; Enter on sidebar item 2 → section switched; Back+Space → returned; no `outline:none` anywhere; reload → Introduction (no persistence). All 4 ACs satisfied.

### File List

- `pokermath/src/styles/tokens.css` — MODIFIED (Focus + Motion token blocks)
- `pokermath/src/styles/global.css` — MODIFIED (`:focus-visible` rule + `prefers-reduced-motion` guard)
- `pokermath/src/lib/components/Sidebar.svelte` — MODIFIED (`.side` `--color-focus: var(--color-sidebar-text)`)
- `pokermath/src/App.svelte` — MODIFIED (`{#key active.id}` + `.section-head` CSS fade)
- `pokermath/src/lib/components/Pager.svelte` — MODIFIED (arrow glyphs wrapped in `aria-hidden` spans)
- `pokermath/src/lib/components/SidebarNavItem.svelte` — VERIFIED only (no change needed)

### Review Findings

- [x] [Review][Patch] Missing `animation-fill-mode: backwards` on `.section-head` — without it, a theoretical one-frame opacity:1 flash can occur before the CSS animation's `from { opacity:0 }` state takes hold on mount. `fill-mode: backwards` applies the `from` state before the first paint, which is the standard pattern for mount animations and costs nothing. [pokermath/src/App.svelte:40-42]
- [x] [Review][Defer] Reduced-motion guard doesn't zero `animation-delay` or `transition-delay` [pokermath/src/styles/global.css:21-29] — deferred, pre-existing; no current animation or transition uses a delay; add `animation-delay: 0ms !important; transition-delay: 0ms !important;` to the guard when Epic 2 introduces its first delayed transition
- [x] [Review][Defer] `{#key active.id}` wraps only the head placeholder — when Epic 2 adds interactive content to the main area and the keyed block is extended, focus will be lost on section switch [pokermath/src/App.svelte:14-19] — deferred, pre-existing; no interactive elements inside the keyed block currently; address in Epic 2 when screen archetypes are built

## Change Log

- feat(1.6): keyboard operability, visible focus & restrained-motion baseline (Date: 2026-05-29)
  - Added Focus and Motion token blocks to `tokens.css`
  - Added global `:focus-visible` ring and `prefers-reduced-motion` guard to `global.css`
  - Added `--color-focus` cascade override on `.side` in `Sidebar.svelte`
  - Wrapped section head in `{#key active.id}` with CSS fade in `App.svelte`
  - Closed deferred a11y items: Pager arrow `aria-hidden`, SidebarNavItem composite-name audit, heading/landmark audit
