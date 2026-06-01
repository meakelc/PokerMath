---
title: 'Two-column card layout for informational screens'
type: 'feature'
created: '2026-05-31'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** The right half of the content area is unused negative space — prose is capped at 60ch while playing cards sit below the text they illustrate, making the layout feel narrow and wasteful.

**Approach:** Wrap each paragraph+card pair in a `.card-row` flex container so cards appear beside the paragraph that references them; widen the left gutter from sidebar to content; leave AssessmentScreen as a centered single column.

## Suggested Review Order

1. [`pokermath/src/App.svelte:74`](../../pokermath/src/App.svelte) — left padding widened from 36px → 64px
2. [`pokermath/src/screens/InformationalScreen.svelte:66`](../../pokermath/src/screens/InformationalScreen.svelte) — `.prose` loses `max-width`; new `.card-row` / `.card-col` flex rules; `max-width: 60ch` moved to `:global(p)`
3. [`pokermath/src/content/sections/IntroContent.svelte:29`](../../pokermath/src/content/sections/IntroContent.svelte) — two `.card-row` wrappers (one per paragraph+card pair)
4. [`pokermath/src/content/sections/EquityContent.svelte:14`](../../pokermath/src/content/sections/EquityContent.svelte) — one `.card-row` with `.card-col` holding both groups
5. [`pokermath/src/content/sections/PotOddsContent.svelte:14`](../../pokermath/src/content/sections/PotOddsContent.svelte) — same pattern
6. [`pokermath/src/content/sections/CallingContent.svelte:38`](../../pokermath/src/content/sections/CallingContent.svelte) — same pattern
7. [`pokermath/src/screens/AssessmentScreen.svelte:300`](../../pokermath/src/screens/AssessmentScreen.svelte) — spacing rules updated for `.card-row`; `.card-col` gap added so stacked groups don't collide
