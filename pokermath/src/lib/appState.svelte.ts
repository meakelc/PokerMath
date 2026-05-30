// Single source of mutable runtime state (AR-5). Grows to hold per-LO
// assessment state and the cheat-sheet modal target in Epic 2/3.
export const appState = $state({
  currentSection: 0, // index into content/sections.ts; 0 = Introduction (cold start)
})
