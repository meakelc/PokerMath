# Deferred Work

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
