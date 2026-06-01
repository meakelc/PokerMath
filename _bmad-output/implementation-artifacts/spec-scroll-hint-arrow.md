---
title: 'Scroll-hint arrow on information screens'
type: 'feature'
created: '2026-05-31'
status: 'done'
baseline_commit: '15d9b1226762f076e7522e7150d386c91b34d5ac'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On information screens, the Next/Back pager sits at the bottom of the content column. When the page is long, the pager is below the initial viewport and there is no visual cue that the user needs to scroll to navigate.

**Approach:** Show a fixed gold circular arrow button in the bottom-right corner of the viewport whenever the pager is out of view on information screens. Clicking it scrolls the pager into view. It disappears once the pager becomes visible.

## Boundaries & Constraints

**Always:**
- Arrow is gold (`--color-gold` background, `--color-gold-ink` foreground), circular, fixed bottom-right.
- Uses `IntersectionObserver` to track pager visibility — no polling, no scroll listeners.
- Arrow is only shown on information screens (not assessment screens). Achieved via a `scrollHint` prop on `Pager`.
- Arrow only visible when at least one pager button (Back or Next) is present.
- Arrow button is accessible: `type="button"`, `aria-label="Scroll to navigation"`.
- Respects `prefers-reduced-motion`: no enter/exit animation when reduced motion is active.
- Clicking arrow calls `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on the pager element.

**Ask First:**
- If IntersectionObserver root needs to be explicitly set to the `.main` scroll container (vs viewport default), halt and ask.

**Never:**
- Do not add the arrow to assessment screens.
- Do not use `window.scroll` or scroll event listeners.
- Do not add z-index higher than the modal layer (`.modal-layer` in `App.svelte` is `position: fixed; inset: 0`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pager below fold | Page loaded, content longer than viewport | Gold arrow visible bottom-right | — |
| Pager in view | User scrolled to bottom | Arrow hidden | — |
| Arrow clicked | Arrow visible | Page scrolls so pager is in view; arrow hides | — |
| No buttons | First page with no Back, last page with no Next | Arrow never shown (pager empty) | — |
| Section change | User navigates to new section | Arrow state resets (new content height) | — |

</frozen-after-approval>

## Code Map

- `pokermath/src/lib/components/Pager.svelte` — renders Back/Next buttons; receives new `scrollHint` prop; hosts IntersectionObserver and fixed arrow
- `pokermath/src/screens/InformationalScreen.svelte` — passes `scrollHint={true}` to `<Pager />`
- `pokermath/src/styles/tokens.css` — existing tokens used (`--color-gold`, `--color-gold-ink`, `--space-6`, `--radius-full`, `--shadow-button-primary`, `--motion-fast`, `--motion-ease`)

## Tasks & Acceptance

**Execution:**
- [x] `pokermath/src/lib/components/Pager.svelte` -- add `scrollHint: boolean = false` prop; bind `pagerEl` to the `<nav>`; mount `IntersectionObserver` watching `pagerEl` to set reactive `belowFold` state; render a fixed `.scroll-arrow` button when `scrollHint && belowFold && (hasNext || hasBack)`; style button as 44×44 px gold circle, `position: fixed; bottom: var(--space-6); right: var(--space-6)`; add CSS fade transition on `opacity`/`visibility` (skipped under `prefers-reduced-motion`)
- [x] `pokermath/src/screens/InformationalScreen.svelte` -- pass `scrollHint={true}` to `<Pager />`

**Acceptance Criteria:**
- Given a long information screen where the pager is below the viewport, when the screen loads, then a gold circular arrow button is visible in the bottom-right corner.
- Given the arrow is visible, when the user scrolls down so the pager enters the viewport, then the arrow disappears.
- Given the arrow is visible, when the user clicks it, then the page scrolls smoothly so the pager is in view.
- Given an assessment screen, when it loads regardless of content length, then no scroll arrow appears.
- Given a page where neither Back nor Next exists, when the page loads, then no scroll arrow appears.
- Given `prefers-reduced-motion: reduce`, when the arrow appears or disappears, then it does so without animation.

## Spec Change Log

## Design Notes

The arrow uses `IntersectionObserver` with default `root: null` (viewport). Since `.main` in `App.svelte` is constrained to `100vh` with `overflow-y: auto`, elements below the fold in `.main` are genuinely off-screen — viewport and scroll-container boundaries coincide in practice.

The fixed arrow sits at the same stacking context layer as the page but below the `.modal-layer` (`position: fixed; inset: 0; pointer-events: none` in `App.svelte`). Z-index is not needed unless a stacking conflict surfaces during testing.

## Suggested Review Order

**Scroll-hint observer + state**

- `scrollHint` prop gates all scroll-hint logic; observer mounts only when true
  [`Pager.svelte:6`](../../pokermath/src/lib/components/Pager.svelte#L6)

- `$effect` resets `belowFold` on section/page change, preventing stale arrow across navigations
  [`Pager.svelte:36`](../../pokermath/src/lib/components/Pager.svelte#L36)

- `IntersectionObserver` watches pager nav element; sets `belowFold` on each visibility change
  [`Pager.svelte:43`](../../pokermath/src/lib/components/Pager.svelte#L43)

**Arrow markup + visibility binding**

- Arrow rendered only when `scrollHint` is true; `.visible` class toggles CSS opacity/visibility
  [`Pager.svelte:70`](../../pokermath/src/lib/components/Pager.svelte#L70)

**Arrow CSS — enter/exit transition + reduced-motion**

- Base state hidden (`opacity:0`, `visibility:hidden`, `pointer-events:none`); `.visible` reveals with transition
  [`Pager.svelte:109`](../../pokermath/src/lib/components/Pager.svelte#L109)

- `prefers-reduced-motion` zeroes the transition so arrow appears/disappears instantly
  [`Pager.svelte:138`](../../pokermath/src/lib/components/Pager.svelte#L138)

**Caller — info screen opt-in**

- Single-line change passing `scrollHint={true}`; assessment screen remains unchanged
  [`InformationalScreen.svelte:31`](../../pokermath/src/screens/InformationalScreen.svelte#L31)

## Verification

**Commands:**
- `cd pokermath && npm run build` -- expected: no TypeScript or Svelte compile errors

**Manual checks (if no CLI):**
- Open a long info screen (e.g. Intro or Equity) and confirm gold arrow appears bottom-right before scrolling.
- Scroll to pager — confirm arrow disappears.
- Click arrow from a fresh load — confirm smooth scroll to pager.
- Open an assessment screen — confirm no arrow.
- Navigate between sections — confirm arrow state resets correctly.
