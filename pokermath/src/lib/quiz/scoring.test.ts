import { describe, it, expect } from 'vitest'
import { scoreQuiz, computeGain } from './scoring'
import { quizQuestions } from '../../content/quiz'

const correctAll = quizQuestions.map((q) => q.correctIndex)
const wrongAll = quizQuestions.map((q) => ((q.correctIndex + 1) % 4) as 0 | 1 | 2 | 3)

describe('scoreQuiz', () => {
  it('scores a perfect set as 6/6 with strong-mastery band', () => {
    const r = scoreQuiz(correctAll, quizQuestions)
    expect(r.total).toBe(6)
    expect(r.interpretation).toMatch(/Strong mastery/)
  })

  it('scores an all-wrong set as 0/6 with below-baseline band', () => {
    const r = scoreQuiz(wrongAll, quizQuestions)
    expect(r.total).toBe(0)
    expect(r.interpretation).toMatch(/Below baseline/)
  })

  it('treats null (unanswered) as incorrect', () => {
    const answers = quizQuestions.map(() => null)
    expect(scoreQuiz(answers, quizQuestions).total).toBe(0)
  })

  it('tallies per-LO correct out of 2', () => {
    // Answer only the two LO1 questions correctly, rest wrong.
    const answers = quizQuestions.map((q) =>
      q.lo === 'lo1' ? q.correctIndex : ((q.correctIndex + 1) % 4)
    )
    const r = scoreQuiz(answers, quizQuestions)
    expect(r.total).toBe(2)
    expect(r.perLO.lo1).toEqual({ correct: 2, total: 2 })
    expect(r.perLO.lo2).toEqual({ correct: 0, total: 2 })
    expect(r.perLO.lo3).toEqual({ correct: 0, total: 2 })
  })

  it('maps the partial band (3-4 correct)', () => {
    // Three correct.
    let n = 0
    const answers = quizQuestions.map((q) =>
      n++ < 3 ? q.correctIndex : ((q.correctIndex + 1) % 4)
    )
    const r = scoreQuiz(answers, quizQuestions)
    expect(r.total).toBe(3)
    expect(r.interpretation).toMatch(/Partial knowledge/)
  })
})

describe('computeGain', () => {
  it('returns null when there is no pre-test score', () => {
    expect(computeGain(null, 5)).toBeNull()
  })

  it('computes the delta and flags meaningful at >= 2', () => {
    expect(computeGain(2, 5)).toEqual({ delta: 3, meaningful: true })
    expect(computeGain(2, 4)).toEqual({ delta: 2, meaningful: true })
  })

  it('does not flag a gain below 2 as meaningful', () => {
    expect(computeGain(3, 4)).toEqual({ delta: 1, meaningful: false })
    expect(computeGain(5, 4)).toEqual({ delta: -1, meaningful: false })
  })
})
