import { describe, it, expect } from 'vitest'
import { buildQuizCsv } from './export'
import type { QuizExportState } from './export'
import { quizQuestions } from '../../content/quiz'

const correctAll = quizQuestions.map((q) => q.correctIndex)
const wrongAll = quizQuestions.map((q) => (q.correctIndex + 1) % 4)

function lines(csv: string): string[] {
  return csv.trim().split('\n')
}

describe('buildQuizCsv', () => {
  it('emits a summary with pre/post scores and the learning gain', () => {
    const state: QuizExportState = {
      pre: { answers: wrongAll, score: 0 },
      post: { answers: correctAll, score: 6 },
    }
    const csv = buildQuizCsv(state, quizQuestions)
    expect(csv).toMatch(/Pre-test score,0/)
    expect(csv).toMatch(/Post-test score,6/)
    expect(csv).toMatch(/Learning gain,6/)
    expect(csv).toMatch(/Meaningful gain,yes/)
  })

  it('has a per-question header and one data row per submitted administration', () => {
    const state: QuizExportState = {
      pre: { answers: wrongAll, score: 0 },
      post: { answers: correctAll, score: 6 },
    }
    const rows = lines(buildQuizCsv(state, quizQuestions))
    const header = rows.find((r) => r.startsWith('administration,'))
    expect(header).toBeDefined()
    const preRows = rows.filter((r) => r.startsWith('pre,'))
    const postRows = rows.filter((r) => r.startsWith('post,'))
    expect(preRows).toHaveLength(6)
    expect(postRows).toHaveLength(6)
  })

  it('omits an administration that has not been submitted', () => {
    const state: QuizExportState = {
      pre: { answers: correctAll, score: 5 },
      post: { answers: quizQuestions.map(() => null), score: null },
    }
    const rows = lines(buildQuizCsv(state, quizQuestions))
    expect(rows.filter((r) => r.startsWith('pre,'))).toHaveLength(6)
    expect(rows.filter((r) => r.startsWith('post,'))).toHaveLength(0)
    expect(buildQuizCsv(state, quizQuestions)).toMatch(/Post-test score,\s*$|Post-test score,(\r)?$/m)
  })

  it('marks correctness and renders choice letters', () => {
    const state: QuizExportState = {
      pre: { answers: correctAll, score: 6 },
      post: { answers: quizQuestions.map(() => null), score: null },
    }
    const rows = lines(buildQuizCsv(state, quizQuestions))
    const q1 = rows.find((r) => r.startsWith('pre,q1,'))!
    expect(q1).toContain('true') // chosen == correct
    // correct letter for q1 (correctIndex 2) is 'C'
    expect(q1).toContain(',C,')
  })

  it('quote-escapes fields that contain commas or quotes', () => {
    const state: QuizExportState = {
      pre: { answers: quizQuestions.map((q) => q.correctIndex), score: 6 },
      post: { answers: quizQuestions.map(() => null), score: null },
    }
    const csv = buildQuizCsv(state, quizQuestions)
    // q5's correct option text contains an em-dash phrase but no comma; q6 distractors
    // do — ensure any field with a comma is wrapped in quotes (no bare comma splits).
    // Spot-check: every chosen_text/correct_text cell that contains a comma is quoted.
    for (const line of lines(csv)) {
      if (line.startsWith('pre,') || line.startsWith('post,')) {
        // a well-formed row has exactly 8 logical columns; quoted commas must not
        // increase the top-level split beyond 8 when we respect quotes.
        expect(splitCsvLine(line)).toHaveLength(8)
      }
    }
  })
})

/** Minimal CSV line splitter that respects double-quoted fields (test helper). */
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}
