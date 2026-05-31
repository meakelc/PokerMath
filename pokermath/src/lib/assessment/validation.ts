import type { AnswerKey, Decision, FieldId, ValidationResult } from './types'
import { EQUITY_TOLERANCE_PP } from './types'

/** Raw learner input as captured by the input primitives (Story 3.4). */
export type SubmittedAnswers = {
  outs?: string
  streets?: string
  equity?: string
  ratio?: [string, string] // [antecedent, consequent] from RatioInput
  requiredEquity?: string
  decision?: Decision // from CallFoldToggle — already 'call' | 'fold'
}

/** Accept window (percent) for the cost/(pot+cost) required-equity field — covers 10/60 ≈ 16.7 and learner rounding to 16 or 17 (FR-11). */
export const REQUIRED_EQUITY_BAND: readonly [number, number] = [16, 17]

export function parseNum(s: string | undefined): number {
  if (s == null || s.trim() === '') return NaN
  return Number(s)
}

export function validate(answer: AnswerKey, submitted: SubmittedAnswers): ValidationResult {
  const perField: Partial<Record<FieldId, boolean>> = {}

  if (answer.outs !== undefined) {
    perField.outs = parseNum(submitted.outs) === answer.outs
  }
  if (answer.streets !== undefined) {
    perField.streets = parseNum(submitted.streets) === answer.streets
  }
  if (answer.equity !== undefined) {
    const v = parseNum(submitted.equity)
    perField.equity = Math.abs(v - answer.equity) <= EQUITY_TOLERANCE_PP
  }
  if (answer.ratio !== undefined) {
    const r = submitted.ratio
    perField.ratio =
      r != null &&
      parseNum(r[0]) === answer.ratio[0] &&
      parseNum(r[1]) === answer.ratio[1]
  }
  if (answer.requiredEquity !== undefined) {
    const v = parseNum(submitted.requiredEquity)
    perField.requiredEquity = v >= REQUIRED_EQUITY_BAND[0] && v <= REQUIRED_EQUITY_BAND[1]
  }
  if (answer.decision !== undefined) {
    perField.decision = submitted.decision === answer.decision
  }

  const passed = Object.values(perField).every(Boolean)

  return { perField, passed }
}
