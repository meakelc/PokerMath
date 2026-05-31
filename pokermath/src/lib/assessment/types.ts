import type { Card } from '../cards'

/** Which learning objective a scenario assesses. */
export type LO = 'lo1' | 'lo2' | 'lo3'

/** Call/Fold judgment (LO3 only). */
export type Decision = 'call' | 'fold'

/** A ratio as [antecedent, consequent] — 5:1 is [5, 1] (AR-7). */
export type Ratio = [number, number]

/** Every assessment input field across LO1–LO3. */
export type FieldId = 'outs' | 'streets' | 'equity' | 'ratio' | 'requiredEquity' | 'decision'

/** A single assessment scenario shown to the learner. */
export type Scenario = {
  id: string
  lo: LO
  hand: Card[]
  board: Card[]
  pot?: number
  bet?: number
  prompt: string
}

/**
 * Correct answers for a scenario, keyed by field. Only the fields a scenario
 * uses are present.
 *  - Exact fields (outs, streets, ratio, decision): require exact match (FR-11).
 *  - equity: the textbook outs×4 value; the engine accepts ±EQUITY_TOLERANCE_PP (FR-11).
 *  - requiredEquity: the cost/(pot+cost) value; the engine accepts the 16–17% band (FR-11).
 * Percentages are plain numbers (36 = 36%); ratios are [antecedent, consequent] (AR-7).
 */
export type AnswerKey = {
  outs?: number
  streets?: number
  equity?: number
  ratio?: Ratio
  requiredEquity?: number
  decision?: Decision
}

/** Tolerance (percentage points) for the Rule-of-2-and-4 equity field (FR-11). */
export const EQUITY_TOLERANCE_PP = 3

/** Detected likely-error categories that drive hint-ladder selection. */
export type ErrorType =
  | 'miscounted-outs'
  | 'wrong-multiplier'
  | 'denominator-error'
  | 'ratio-percentage-confusion'
  | 'wrong-comparison-direction'

/** One escalating step of a hint ladder, as returned by the hint engine (Story 3.3). */
export type HintRung = {
  errorType: ErrorType
  rung: number // 0-based index within the ladder
  text: string
}

/** A ladder = ordered rungs per detected error type. Authored copy lives in content/hintLadders.ts. */
export type HintLadder = Partial<Record<ErrorType, readonly string[]>>

/** Result of validating a submission (Story 3.2). */
export type ValidationResult = {
  perField: Partial<Record<FieldId, boolean>>
  passed: boolean
  hint?: HintRung
}
