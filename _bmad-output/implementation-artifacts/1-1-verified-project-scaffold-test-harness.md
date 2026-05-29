---
baseline_commit: 91e58675050cfd0a4ea01bb6a38fcee4efa43394
---

# Story 1.1: Verified project scaffold & test harness

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the builder,
I want a clean, verified Svelte 5 + TS + Vite + Vitest base with demo content removed,
so that all later work starts from a known-good foundation that builds, type-checks, and runs tests.

## Acceptance Criteria

**AC1 — `test` script exists**
**Given** the existing `pokermath/` scaffold
**When** I inspect `package.json`
**Then** a `test` script running `vitest` exists alongside `dev`, `build`, `preview`, and `check`

**AC2 — all four commands succeed and build emits static `dist/`**
**Given** the scaffold
**When** I run `npm run dev`, `npm run build`, `npm run check`, and `npm run test`
**Then** each command succeeds (zero passing tests is acceptable at this stage)
**And** `npm run build` emits a static `dist/` bundle (AR-8)

**AC3 — demo cruft removed; minimal mount point only**
**Given** the demo scaffold cruft
**When** I open the project
**Then** `src/lib/Counter.svelte`, `src/assets/hero.png`, and the Vite/Svelte demo svgs are removed
**And** `App.svelte` and `app.css` contain no boilerplate demo markup — only a minimal mount point

**AC4 — no new libraries introduced**
**Given** the approved stack (Svelte 5, TypeScript, Vite, Vitest, svelte-check)
**When** the scaffold is finalized
**Then** no additional runtime or build library is introduced

## Tasks / Subtasks

- [x] **Task 1: Add `test` script to `package.json` (AC: #1, #2)**
  - [x] Add `"test": "vitest run"` to the `scripts` block in `pokermath/package.json`, alongside the existing `dev`, `build`, `preview`, `check`.
  - [x] Use `vitest run` (single-run mode), **not** bare `vitest` — bare `vitest` enters watch mode in a TTY and will hang an automated run. `vitest run` exits when the suite finishes. The epic's "running `vitest`" intent is satisfied by `vitest run`.
  - [x] Do NOT add any new dependency — `vitest@^4.1.7` is already in `devDependencies`.

- [x] **Task 2: Make `npm run test` succeed with no/zero tests (AC: #2)**
  - [x] Vitest exits non-zero when it finds **no** test files. AC2 says "zero passing tests is acceptable," so you must make the empty/near-empty run green. Choose ONE approach and apply it (see Dev Notes → Decision: empty-test handling):
    - **Preferred:** add one trivial smoke test so the harness is demonstrably wired, e.g. `pokermath/src/smoke.test.ts` with a single `expect(true).toBe(true)` assertion. This proves the test command actually executes a test rather than passing vacuously.
  - [x] Add the Vitest config to `vite.config.ts` (see Task 4) so the test runner is explicitly configured.

- [x] **Task 3: Strip demo scaffold cruft (AC: #3)**
  - [x] Delete `pokermath/src/lib/Counter.svelte`.
  - [x] Delete `pokermath/src/assets/hero.png`, `pokermath/src/assets/svelte.svg`, `pokermath/src/assets/vite.svg`. If `src/assets/` is then empty, leave it removed (it is recreated by later stories only if needed).
  - [x] Delete `pokermath/public/icons.svg` (demo icon sprite referenced only by the boilerplate `App.svelte`). **Keep** `pokermath/public/favicon.svg` (per architecture directory structure, `public/favicon.svg` is the intended retained asset).
  - [x] Replace `pokermath/src/App.svelte` body with a minimal mount point — a single root element and no demo imports/markup. See Dev Notes → Reference: minimal App.svelte.
  - [x] Replace `pokermath/src/app.css` with a minimal/empty base — remove all demo styling (hero, ticks, next-steps, social, etc.). An empty file or a tiny reset is acceptable; the full "Deep Table" token + global layer is Story 1.2's job (AR-2), **do not** create `src/styles/tokens.css` or `global.css` here.
  - [x] After deletions, confirm no remaining `import` in `App.svelte`/`main.ts` references a deleted file (this is what `npm run check` will catch).

- [x] **Task 4: Configure Vitest in `vite.config.ts` (AC: #2, #4)**
  - [x] Add a `test` block to the existing `defineConfig` in `pokermath/vite.config.ts`. Use the Vitest config import pattern (see Dev Notes → Reference: vite.config.ts). Default `node` environment is sufficient — the only mandated test target (the assessment engine, Story 3.2/3.3) is pure framework-free TS and needs no DOM.
  - [x] Do NOT add `jsdom`/`happy-dom` or any new dep — component tests are explicitly optional at this scale (architecture: "Component-level tests are optional").

- [x] **Task 5: Verify all four commands (AC: #2)**
  - [x] Run `npm run check` → svelte-check + tsc must report 0 errors.
  - [x] Run `npm run build` → must succeed and produce `pokermath/dist/` with `index.html` + bundled assets (AR-8).
  - [x] Run `npm run test` → must exit 0 (green).
  - [x] Verify `npm run dev` starts the Vite dev server without error (start it, confirm it serves, then stop it — do not leave it running; it is a long-lived process).
  - [x] Record the exact command outputs in the Dev Agent Record → Completion Notes.

### Review Findings

- [ ] [Review][Decision] Git repo structure — `pokermath/` is entirely untracked in what appears to be a home-directory git repo (`C:\Users\meake`); decide whether to initialize a dedicated repo at `C:\Users\meake\Documents\Sites\PokerMath` or properly add `pokermath/` to the existing tracked structure; `package-lock.json` is also untracked, making the build non-reproducible on CI or a fresh machine
- [ ] [Review][Decision] AC2 verification gap — `dist/index.html` is present on disk but may be stale from a pre-cleanup build; all four commands (`dev`, `build`, `check`, `test`) must be re-run against the current cleaned-up files to confirm AC2 is satisfied
- [ ] [Review][Patch] `smoke.test.ts` included in `tsconfig.app.json` scope (`"src/**/*.ts"` include glob); as the test suite grows, any use of Vitest globals (`describe`, `it`, `vi`) will cause `npm run check` to fail — exclude test files from the app tsconfig or add a dedicated `tsconfig.test.json` with `"types": ["vitest/globals"]` [pokermath/tsconfig.app.json]
- [x] [Review][Defer] No CI pipeline — `.github/workflows` absent; test/check/build scripts only run locally [pokermath/package.json] — deferred, pre-existing
- [x] [Review][Defer] `environment: 'node'` latent constraint — component tests will require `jsdom`/`happy-dom` which is not a current dependency; intentional per spec [pokermath/vite.config.ts:7] — deferred, pre-existing
- [x] [Review][Defer] No `engines` field in `package.json` — Node version assumption (24.x implied by `@types/node^24`) is undocumented [pokermath/package.json] — deferred, pre-existing
- [x] [Review][Defer] Non-null assertion `!` in `main.ts` on `getElementById('app')` — pre-existing and unchanged; `index.html` confirmed to have `<div id="app">` [pokermath/src/main.ts:5] — deferred, pre-existing
- [x] [Review][Defer] Bleeding-edge version ranges (TS 6, Vite 8, Vitest 4) — intentional per AC4 stack definition; lockfile tracking depends on git setup decision above [pokermath/package.json] — deferred, pre-existing

## Dev Notes

### Current scaffold state (verified 2026-05-29)

The `pokermath/` scaffold already exists with `node_modules` installed. Confirmed facts:

- `package.json` scripts present: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `check` (`svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json`). **`test` is missing** — this is the gap AC1 closes. [Source: pokermath/package.json:6-11]
- Dependencies already include everything needed — `svelte@^5.55.5`, `typescript@~6.0.2`, `vite@^8.0.12`, `vitest@^4.1.7`, `svelte-check@^4.4.8`, `@sveltejs/vite-plugin-svelte@^7.1.2`, `@tsconfig/svelte@^5.0.8`, `@types/node@^24.12.3`. **AC4: do not add anything.** [Source: pokermath/package.json:12-21]
- Demo cruft present and must be removed: `src/lib/Counter.svelte`, `src/assets/hero.png`, `src/assets/svelte.svg`, `src/assets/vite.svg`, `public/icons.svg`, and the full demo body of `src/App.svelte` (hero section, docs/social link lists, ticks/spacer) + demo styling in `src/app.css`. [Source: pokermath/src/App.svelte:1-89, pokermath/src/assets/, pokermath/public/]
- `vite.config.ts` currently has only the `svelte()` plugin and **no `test` block**. [Source: pokermath/vite.config.ts:1-8]
- `main.ts` mounts `App` into `#app` via Svelte 5's `mount()` API — leave this idiom intact; it is the correct Svelte 5 pattern. Only ensure it still imports `./app.css` and `./App.svelte` after the cleanup. [Source: pokermath/src/main.ts:1-9]

### Decision: empty-test handling (AC2)

`vitest run` with **no test files** exits non-zero ("No test files found"), which would fail AC2. Resolve by adding one trivial smoke test (`src/smoke.test.ts`) — preferred because it proves the harness genuinely runs a test. (`--passWithNoTests` is the fallback if a smoke test is undesired, but the smoke test is the recommended path and can simply be deleted later once real engine tests land in Epic 3.) Either way the result must be a green `npm run test`.

### Reference: minimal `App.svelte` (replace entire file)

Keep it truly minimal — Story 1.3 (`AR-6`, `UX-DR1`) builds the real two-pane frame (Sidebar + content + modal layer). Do not anticipate that here. A single placeholder root element with no demo imports is the target, e.g.:

```svelte
<main>
  <!-- App shell built in Story 1.3 -->
</main>
```

### Reference: `vite.config.ts` with Vitest

Vitest reads config from the Vite config. Use the dedicated config typing so `test` is recognized:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  test: {
    // pure TS engine is the only mandated test target — node env is enough
    environment: 'node',
  },
})
```

(The triple-slash `vitest/config` reference, or importing `defineConfig` from `vitest/config` instead of `vite`, both work in Vitest 4. Pick one; do not add a separate `vitest.config.ts` file — the architecture lists `vite.config.ts` as the single "Vite + Vitest config".) [Source: architecture.md:389]

### Architecture compliance (guardrails)

- **Stack is fixed:** TypeScript + Svelte 5 (runes) + Vite + Vitest + svelte-check. Requires Node 20.19+/22.12+. No other runtime/build library — plain CSS later (no Tailwind/CSS-in-JS), no router, no state library. [Source: architecture.md:131-147, 529-534; epics.md AR-1]
- **Co-located tests:** real tests live beside the code they cover (`validation.ts` ↔ `validation.test.ts`), no `__tests__/` tree. The smoke test is temporary; follow this convention for anything real. [Source: architecture.md:294-295, 508-509]
- **Build output:** `vite build` → static `dist/` (HTML/CSS/JS), deployable to any static host or opened locally; no server/env/secrets. This is AR-8 and AC2's `dist/` clause. [Source: architecture.md:229, 519-522; epics.md AR-8]
- **Scope boundary:** This story is *only* scaffold finalization + test harness. Do NOT create `tokens.css`/`global.css` (Story 1.2 / AR-2), `appState.svelte.ts` or `sections.ts` (Story 1.3 / AR-5), `cards.ts` (Epic 2 / AR-3), or the assessment engine (Epic 3 / AR-4). Stay inside the four ACs. [Source: epics.md:130-154]

### Project Structure Notes

- All work happens inside `pokermath/` (the Vite project root), not the repo root. The repo root also holds `_bmad/`, `_bmad-output/`, and `docs/` — leave those untouched.
- Target end-state for touched paths: `package.json` (+test script), `vite.config.ts` (+test block), `src/App.svelte` (minimal), `src/app.css` (minimal/empty), `src/smoke.test.ts` (new, temporary), and the deletions in `src/lib/`, `src/assets/`, `public/`.
- No conflicts with the architecture's target directory structure — this story produces a strict subset of it. [Source: architecture.md:383-434]

### Testing standards summary

- Test runner: Vitest 4, single-run via `vitest run` for `npm run test`.
- Only the assessment engine is *mandated* for tests (arrives in Epic 3); component/UI tests are optional at this scale. The smoke test here exists solely to make the harness green and prove it executes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1] — story statement + acceptance criteria
- [Source: _bmad-output/planning-artifacts/epics.md#Additional-Requirements] — AR-1 (scaffold status + remaining work), AR-8 (static-host deployment)
- [Source: _bmad-output/planning-artifacts/architecture.md#Tech-Stack] — lines 131-147 (stack, runtime, build, testing framework)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Directory-Structure] — lines 383-434 (target tree; `vite.config.ts` = Vite + Vitest config; `public/favicon.svg` retained)
- [Source: _bmad-output/planning-artifacts/architecture.md#Test-organization] — lines 294-295, 508-509 (co-located tests)
- [Source: pokermath/package.json], [Source: pokermath/src/App.svelte], [Source: pokermath/vite.config.ts], [Source: pokermath/src/main.ts] — current scaffold state

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

None.

### Completion Notes List

- AC1: Added `"test": "vitest run"` to `pokermath/package.json` scripts block. No new deps added.
- AC2: All four commands verified green. `npm run check` → 0 errors/warnings. `npm run build` → `dist/index.html` + `dist/assets/index-*.css` + `dist/assets/index-*.js`. `npm run test` → 1 test passed (1). `npm run dev` → Vite ready at http://localhost:5173/ (started and stopped).
- AC3: Deleted `src/lib/Counter.svelte`, `src/assets/hero.png`, `src/assets/svelte.svg`, `src/assets/vite.svg` (assets dir removed as empty), `public/icons.svg`. `App.svelte` replaced with single `<main>` placeholder. `app.css` replaced with minimal `body { margin: 0; }` reset.
- AC4: No new dependencies added. Vitest was already in devDependencies.
- `vite.config.ts` updated with `/// <reference types="vitest/config" />` and `test: { environment: 'node' }` block.
- Smoke test `src/smoke.test.ts` added — proves harness runs; temporary, can be deleted once real tests land in Epic 3.

### File List

- pokermath/package.json (modified — added test script)
- pokermath/vite.config.ts (modified — added vitest/config reference + test block)
- pokermath/src/App.svelte (modified — replaced with minimal mount point)
- pokermath/src/app.css (modified — replaced with minimal body reset)
- pokermath/src/smoke.test.ts (new — temporary smoke test for harness)
- pokermath/src/lib/Counter.svelte (deleted)
- pokermath/src/assets/hero.png (deleted)
- pokermath/src/assets/svelte.svg (deleted)
- pokermath/src/assets/vite.svg (deleted)
- pokermath/public/icons.svg (deleted)

## Change Log

- 2026-05-29: Story 1.1 implemented — added test script, Vitest config, smoke test, stripped demo cruft; all four commands verified green.
