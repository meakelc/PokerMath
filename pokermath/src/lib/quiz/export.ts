import type { QuizQuestion } from '../../content/quiz'
import type { QuizAnswers } from './scoring'
import { computeGain } from './scoring'

export type QuizAdministrationData = {
  answers: QuizAnswers
  /** null until the administration is submitted. */
  score: number | null
}

export type QuizExportState = {
  pre: QuizAdministrationData
  post: QuizAdministrationData
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

function letter(index: number | null): string {
  return index === null || index < 0 || index > 3 ? '' : LETTERS[index]
}

/** Escape a CSV field: quote it when it contains a comma, quote, or newline. */
function field(value: string | number | null): string {
  if (value === null) return ''
  const s = String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const PER_QUESTION_HEADER =
  'administration,question,lo,chosen,chosen_text,correct,correct_text,is_correct'

function administrationRows(
  label: 'pre' | 'post',
  data: QuizAdministrationData,
  questions: readonly QuizQuestion[]
): string[] {
  if (data.score === null) return [] // not submitted — omit
  return questions.map((q, i) => {
    const chosen = data.answers[i] ?? null
    const isCorrect = chosen === q.correctIndex
    return [
      label,
      q.id,
      q.lo,
      field(letter(chosen)),
      field(chosen === null ? '' : q.options[chosen]),
      field(letter(q.correctIndex)),
      field(q.options[q.correctIndex]),
      String(isCorrect),
    ].join(',')
  })
}

/**
 * Build a CSV of the session's quiz results for effectiveness evaluation:
 * a small summary block (pre/post scores + learning gain) followed by a
 * per-question table for each submitted administration. Pure — no DOM.
 */
export function buildQuizCsv(state: QuizExportState, questions: readonly QuizQuestion[]): string {
  const gain =
    state.pre.score !== null && state.post.score !== null
      ? computeGain(state.pre.score, state.post.score)
      : null

  const summary = [
    `Pre-test score,${field(state.pre.score)}`,
    `Post-test score,${field(state.post.score)}`,
    `Learning gain,${gain ? gain.delta : ''}`,
    `Meaningful gain,${gain ? (gain.meaningful ? 'yes' : 'no') : ''}`,
  ]

  const rows = [
    ...administrationRows('pre', state.pre, questions),
    ...administrationRows('post', state.post, questions),
  ]

  return [...summary, '', PER_QUESTION_HEADER, ...rows].join('\n')
}

/** Build the CSV and trigger a browser download. The only impure part of this module. */
export function downloadQuizCsv(
  state: QuizExportState,
  questions: readonly QuizQuestion[],
  filename = 'pokermath-results.csv'
): void {
  const csv = buildQuizCsv(state, questions)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
