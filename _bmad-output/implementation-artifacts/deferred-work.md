# Deferred Work

## Deferred from: code review of 1-1-verified-project-scaffold-test-harness (2026-05-29)

- No CI pipeline — `.github/workflows` absent; test/check/build scripts only enforce locally. Address when setting up deployment/CI infrastructure.
- `environment: 'node'` in Vitest config is a latent constraint — component tests will need `jsdom`/`happy-dom` (not currently a dependency). Revisit when writing the first component test in Epic 2 or 3.
- No `engines` field in `package.json` — Node 24.x implied by `@types/node^24` but not documented. Add when setting up CI so runner version is explicit.
- Non-null assertion `!` on `getElementById('app')` in `main.ts` — pre-existing; safe because `index.html` has `<div id="app">`, but silently dangerous if mount target ever moves.
- Bleeding-edge version ranges (TypeScript 6, Vite 8, Vitest 4) — intentional per AC4; lockfile reproducibility depends on the git repo structure decision (see story 1.1 decision-needed findings).
