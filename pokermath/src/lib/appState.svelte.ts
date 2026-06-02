import type { CheatSheetId } from '../content/cheatsheets'
import type { HintRung, ValidationResult, Decision } from './assessment/types'
import { defaultSectionIndex } from '../content/sections'
import { quizQuestions } from '../content/quiz'

const blankAnswers = (): (number | null)[] => quizQuestions.map(() => null)

// Single source of mutable runtime state (AR-5).
export const appState = $state({
  currentSection: defaultSectionIndex, // index into content/sections.ts; cold start = Introduction
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
  // Optional pre/post-test. In-memory only — cleared on reload (no persistence layer).
  quiz: {
    pre: { answers: blankAnswers(), submitted: false, score: null as number | null },
    post: { answers: blankAnswers(), submitted: false, score: null as number | null },
  },
})
