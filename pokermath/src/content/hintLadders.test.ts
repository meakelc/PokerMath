import { describe, it, expect } from 'vitest'
import type { LO, ErrorType } from '../lib/assessment/types'
import { hintLadders } from './hintLadders'

const LOS = ['lo1', 'lo2', 'lo3'] as const satisfies readonly LO[]

const VALID_ERROR_TYPES: Record<LO, readonly ErrorType[]> = {
  lo1: ['miscounted-outs', 'wrong-multiplier'],
  lo2: ['denominator-error', 'ratio-percentage-confusion'],
  lo3: ['wrong-comparison-direction'],
}

describe('hintLadders', () => {
  it('has all three LO keys', () => {
    expect(Object.keys(hintLadders).sort()).toEqual(['lo1', 'lo2', 'lo3'])
  })

  for (const lo of LOS) {
    describe(`${lo}`, () => {
      const ladder = hintLadders[lo]

      it('only contains error types valid for this LO', () => {
        const presentTypes = Object.keys(ladder)
        for (const t of presentTypes) {
          expect(VALID_ERROR_TYPES[lo]).toContain(t)
        }
      })

      it('every ladder array is non-empty', () => {
        for (const rungs of Object.values(ladder)) {
          expect(rungs!.length).toBeGreaterThanOrEqual(1)
        }
      })

      it('every rung is a non-empty string', () => {
        for (const rungs of Object.values(ladder)) {
          for (const rung of rungs!) {
            expect(typeof rung).toBe('string')
            expect(rung.length).toBeGreaterThan(0)
          }
        }
      })

      it('no rung reveals the final equity answer (36)', () => {
        for (const rungs of Object.values(ladder)) {
          for (const rung of rungs!) {
            expect(rung).not.toMatch(/\b36\b/)
          }
        }
      })

      it('no rung reveals the final required-equity answer (16.7)', () => {
        for (const rungs of Object.values(ladder)) {
          for (const rung of rungs!) {
            expect(rung).not.toMatch(/\b16\.7\b/)
          }
        }
      })

      it('no rung reveals the final ratio answer (5:1)', () => {
        for (const rungs of Object.values(ladder)) {
          for (const rung of rungs!) {
            expect(rung).not.toMatch(/5:1/)
          }
        }
      })
    })
  }
})
