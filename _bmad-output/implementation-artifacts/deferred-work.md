# Deferred Work

## Deferred from: code review of 2-1-card-notation-graphical-card-rendering (2026-05-29)

- Duplicate card keys crash `CardGroup` keyed `{#each}` — `CardGroup.svelte:11`; in poker cards are unique per deck so same-card duplicates are an authoring bug; add upstream dedup guard or uniqueness assertion when content authors build groups in Story 2.2.
- RANKS/SUITS arrays duplicated in `cards.test.ts` instead of imported from `cards.ts` — `cards.test.ts:64-65`; divergence risk if source arrays change; export `RANKS`/`SUITS` from `cards.ts` and import in test when convenient.
- `CardGroup` `cards` prop has no default value — `CardGroup.svelte:5`; `svelte-check` catches missing required prop at build time; add `= []` default when first consumer is wired in Story 2.2.
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
