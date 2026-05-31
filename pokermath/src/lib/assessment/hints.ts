import type { AnswerKey, ErrorType, HintLadder, HintRung, Scenario } from './types'
import { EQUITY_TOLERANCE_PP } from './types'
import type { SubmittedAnswers } from './validation'
import { parseNum, REQUIRED_EQUITY_BAND } from './validation'

/** Half-window (pp) for matching a submitted value to a *canonical mistake* signature during error classification (e.g. the 20% denominator error). */
export const DETECT_TOLERANCE_PP = 3

export function detectError(
  scenario: Scenario,
  answer: AnswerKey,
  submitted: SubmittedAnswers,
): ErrorType | null {
  switch (scenario.lo) {
    case 'lo1': {
      const outsWrong = parseNum(submitted.outs) !== answer.outs
      if (outsWrong) return 'miscounted-outs'
      const streetsWrong = parseNum(submitted.streets) !== answer.streets
      const equityVal = parseNum(submitted.equity)
      const equityWrong = !(Math.abs(equityVal - answer.equity!) <= EQUITY_TOLERANCE_PP)
      if (streetsWrong || equityWrong) return 'wrong-multiplier'
      return null
    }
    case 'lo2': {
      const denomErrVal = (scenario.bet! / (scenario.pot! + scenario.bet!)) * 100
      const reqVal = parseNum(submitted.requiredEquity)
      const reqWrong = !(reqVal >= REQUIRED_EQUITY_BAND[0] && reqVal <= REQUIRED_EQUITY_BAND[1])
      const r = submitted.ratio
      const ratioWrong = !(
        r != null &&
        parseNum(r[0]) === answer.ratio![0] &&
        parseNum(r[1]) === answer.ratio![1]
      )
      if (reqWrong && Math.abs(reqVal - denomErrVal) <= DETECT_TOLERANCE_PP) return 'denominator-error'
      if (ratioWrong) return 'ratio-percentage-confusion'
      if (reqWrong) return 'denominator-error'
      return null
    }
    case 'lo3': {
      const equityVal = parseNum(submitted.equity)
      const equityCorrect = Math.abs(equityVal - answer.equity!) <= EQUITY_TOLERANCE_PP
      const r = submitted.ratio
      const ratioCorrect =
        r != null &&
        parseNum(r[0]) === answer.ratio![0] &&
        parseNum(r[1]) === answer.ratio![1]
      const reqVal = parseNum(submitted.requiredEquity)
      const reqCorrect = reqVal >= REQUIRED_EQUITY_BAND[0] && reqVal <= REQUIRED_EQUITY_BAND[1]
      const decisionCorrect = submitted.decision === answer.decision
      if (equityCorrect && ratioCorrect && reqCorrect && decisionCorrect) return null
      return 'wrong-comparison-direction'
    }
  }
}

export function selectHint(
  ladder: HintLadder,
  scenario: Scenario,
  answer: AnswerKey,
  submitted: SubmittedAnswers,
  prev: HintRung | null,
): HintRung | null {
  const errorType = detectError(scenario, answer, submitted)
  if (errorType == null) return null
  const rungs = ladder[errorType]
  if (rungs == null || rungs.length === 0) return null
  const rung =
    prev == null || prev.errorType !== errorType
      ? 0
      : Math.min(prev.rung + 1, rungs.length - 1)
  return { errorType, rung, text: rungs[rung] }
}
