import { describe, it, expect } from 'vitest'
import { quizQuestions } from './quiz'
import type { LO } from '../lib/assessment/types'

describe('quizQuestions', () => {
  it('has exactly 6 questions', () => {
    expect(quizQuestions).toHaveLength(6)
  })

  it('assesses each LO exactly twice', () => {
    const counts = quizQuestions.reduce<Record<LO, number>>(
      (acc, q) => ({ ...acc, [q.lo]: acc[q.lo] + 1 }),
      { lo1: 0, lo2: 0, lo3: 0 }
    )
    expect(counts).toEqual({ lo1: 2, lo2: 2, lo3: 2 })
  })

  it('gives every question 4 options and an in-range correctIndex', () => {
    for (const q of quizQuestions) {
      expect(q.options).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThanOrEqual(3)
      expect(q.options[q.correctIndex]).toBeTruthy()
    }
  })

  it('has unique ids', () => {
    const ids = quizQuestions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not place every correct answer at the same position', () => {
    const positions = new Set(quizQuestions.map((q) => q.correctIndex))
    expect(positions.size).toBeGreaterThan(1)
  })
})
