import type { CheatSheetId } from '../content/cheatsheets'
import type { HintRung, ValidationResult, Decision } from './assessment/types'

// Single source of mutable runtime state (AR-5).
export const appState = $state({
  currentSection: 0, // index into content/sections.ts; 0 = Introduction (cold start)
  currentPage: 0,    // sub-page index within the current section; resets to 0 on section change
  openCheatSheet: null as CheatSheetId | null, // null = closed; a CheatSheetId = that sheet open
  assessments: {
    lo1: {
      fields: { outs: '', streets: '', equity: '' },
      result: null as ValidationResult | null,
      hint: null as HintRung | null,
      passed: false,
    },
    lo2: {
      fields: { ratio: ['', ''] as [string, string], requiredEquity: '' },
      result: null as ValidationResult | null,
      hint: null as HintRung | null,
      passed: false,
    },
    lo3: {
      fields: { equity: '', ratio: ['', ''] as [string, string], requiredEquity: '', decision: '' as Decision | '' },
      result: null as ValidationResult | null,
      hint: null as HintRung | null,
      passed: false,
    },
  },
})
