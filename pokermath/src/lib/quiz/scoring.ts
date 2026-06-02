import type { LO } from '../assessment/types'
import type { QuizQuestion } from '../../content/quiz'

/** A learner's selection per question, parallel to the question list. null = unanswered. */
export type QuizAnswers = readonly (number | null)[]

export type PerLO = Record<LO, { correct: number; total: number }>

export type QuizScore = {
  total: number
  perLO: PerLO
  interpretation: string
}

export type LearningGain = {
  delta: number
  /** A meaningful gain is one full LO's worth of questions — at least 2 points (doc §2). */
  meaningful: boolean
}

/** Scoring-guide bands from docs/learning-objectives-and-assessment.md §2. */
export function interpret(total: number): string {
  if (total <= 2) return 'Below baseline — learner likely has no prior framework for poker math'
  if (total <= 4) return 'Partial knowledge — may know one concept but cannot integrate them'
  return 'Strong mastery — all three objectives understood and applied correctly'
}

export function scoreQuiz(answers: QuizAnswers, questions: readonly QuizQuestion[]): QuizScore {
  const perLO: PerLO = {
    lo1: { correct: 0, total: 0 },
    lo2: { correct: 0, total: 0 },
    lo3: { correct: 0, total: 0 },
  }
  let total = 0

  questions.forEach((q, i) => {
    perLO[q.lo].total += 1
    if (answers[i] === q.correctIndex) {
      total += 1
      perLO[q.lo].correct += 1
    }
  })

  return { total, perLO, interpretation: interpret(total) }
}

/** Pre→post learning gain. Returns null when no pre-test score is on record. */
export function computeGain(pre: number | null, post: number): LearningGain | null {
  if (pre === null) return null
  const delta = post - pre
  return { delta, meaningful: delta >= 2 }
}
