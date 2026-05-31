import { describe, it, expect } from 'vitest'
import { cardToString } from '../lib/cards'
import { assessments } from './scenarios'

describe('assessments', () => {
  it('has exactly the three LO keys', () => {
    expect(Object.keys(assessments).sort()).toEqual(['lo1', 'lo2', 'lo3'])
  })

  it('each scenario.lo matches its record key', () => {
    for (const [key, { scenario }] of Object.entries(assessments)) {
      expect(scenario.lo).toBe(key)
    }
  })

  it('scenario IDs are unique across the record', () => {
    const ids = Object.values(assessments).map(({ scenario }) => scenario.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('LO1 — equity', () => {
    const { scenario, answer } = assessments.lo1

    it('answer: outs === 9', () => expect(answer.outs).toBe(9))
    it('answer: streets === 2', () => expect(answer.streets).toBe(2))
    it('answer: equity === 36', () => expect(answer.equity).toBe(36))

    it('Rule-of-2-and-4 self-consistency (2 streets)', () => {
      expect(answer.equity).toBe(answer.outs! * 4)
    })

    it('hand is Ah Kh via parseCard round-trip', () => {
      expect(scenario.hand.map(cardToString)).toEqual(['Ah', 'Kh'])
    })

    it('board is Qh 8h 7c via parseCard round-trip', () => {
      expect(scenario.board.map(cardToString)).toEqual(['Qh', '8h', '7c'])
    })
  })

  describe('LO2 — pot odds', () => {
    const { scenario, answer } = assessments.lo2

    it('answer: ratio equals [5, 1]', () => expect(answer.ratio).toEqual([5, 1]))
    it('answer: requiredEquity within [16, 17]', () => {
      expect(answer.requiredEquity).toBeGreaterThanOrEqual(16)
      expect(answer.requiredEquity).toBeLessThanOrEqual(17)
    })
    it('scenario: pot === 40', () => expect(scenario.pot).toBe(40))
    it('scenario: bet === 10', () => expect(scenario.bet).toBe(10))

    it('ratio and requiredEquity are mathematically consistent', () => {
      // ratio [a, b] means a:b → requiredEquity = b/(a+b) × 100
      const expected = (answer.ratio![1] / (answer.ratio![0] + answer.ratio![1])) * 100
      expect(answer.requiredEquity!).toBeCloseTo(expected, 1)
    })
  })

  describe('LO3 — calling profitably', () => {
    const { scenario, answer } = assessments.lo3

    it('answer: equity === 36', () => expect(answer.equity).toBe(36))
    it('answer: ratio equals [5, 1]', () => expect(answer.ratio).toEqual([5, 1]))
    it('answer: requiredEquity within [16, 17]', () => {
      expect(answer.requiredEquity).toBeGreaterThanOrEqual(16)
      expect(answer.requiredEquity).toBeLessThanOrEqual(17)
    })
    it('answer: decision === call', () => expect(answer.decision).toBe('call'))

    it('climax invariant: equity > requiredEquity (call is +EV)', () => {
      expect(answer.equity!).toBeGreaterThan(answer.requiredEquity!)
    })

    it('hand is Ah Kh via parseCard round-trip', () => {
      expect(scenario.hand.map(cardToString)).toEqual(['Ah', 'Kh'])
    })

    it('board is Qh 8h 7c via parseCard round-trip', () => {
      expect(scenario.board.map(cardToString)).toEqual(['Qh', '8h', '7c'])
    })
  })

  describe('field conventions (AC4)', () => {
    it('all present percentage fields are finite numbers', () => {
      for (const { answer } of Object.values(assessments)) {
        if (answer.equity !== undefined) expect(Number.isFinite(answer.equity)).toBe(true)
        if (answer.requiredEquity !== undefined)
          expect(Number.isFinite(answer.requiredEquity)).toBe(true)
      }
    })

    it('all present ratio fields are 2-tuples of numbers', () => {
      for (const { answer } of Object.values(assessments)) {
        if (answer.ratio !== undefined) {
          expect(answer.ratio).toHaveLength(2)
          expect(typeof answer.ratio[0]).toBe('number')
          expect(typeof answer.ratio[1]).toBe('number')
        }
      }
    })
  })
})
