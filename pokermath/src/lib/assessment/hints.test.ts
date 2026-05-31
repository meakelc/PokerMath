import { describe, it, expect } from 'vitest'
import { assessments } from '../../content/scenarios'
import { hintLadders } from '../../content/hintLadders'
import { detectError, selectHint, DETECT_TOLERANCE_PP } from './hints'

describe('detectError()', () => {
  describe('LO1', () => {
    const { scenario, answer } = assessments.lo1

    it('wrong outs → miscounted-outs', () => {
      expect(detectError(scenario, answer, { outs: '8', streets: '2', equity: '36' })).toBe('miscounted-outs')
    })

    it('×2 mistake (equity=18) → wrong-multiplier', () => {
      expect(detectError(scenario, answer, { outs: '9', streets: '2', equity: '18' })).toBe('wrong-multiplier')
    })

    it('streets=1 → wrong-multiplier', () => {
      expect(detectError(scenario, answer, { outs: '9', streets: '1', equity: '36' })).toBe('wrong-multiplier')
    })

    it('all-correct → null', () => {
      expect(detectError(scenario, answer, { outs: '9', streets: '2', equity: '36' })).toBeNull()
    })
  })

  describe('LO2', () => {
    const { scenario, answer } = assessments.lo2

    it('requiredEquity≈20 (10/50 denominator error) → denominator-error', () => {
      expect(detectError(scenario, answer, { ratio: ['5', '1'], requiredEquity: '20' })).toBe('denominator-error')
    })

    it('ratio garbled, requiredEquity correct → ratio-percentage-confusion', () => {
      expect(detectError(scenario, answer, { ratio: ['16', '7'], requiredEquity: '16.7' })).toBe(
        'ratio-percentage-confusion',
      )
    })

    it('all-correct → null', () => {
      expect(detectError(scenario, answer, { ratio: ['5', '1'], requiredEquity: '16.7' })).toBeNull()
    })
  })

  describe('LO3', () => {
    const { scenario, answer } = assessments.lo3

    it('wrong decision (fold) → wrong-comparison-direction', () => {
      expect(
        detectError(scenario, answer, {
          equity: '36',
          ratio: ['5', '1'],
          requiredEquity: '16.7',
          decision: 'fold',
        }),
      ).toBe('wrong-comparison-direction')
    })

    it('all-correct → null', () => {
      expect(
        detectError(scenario, answer, {
          equity: '36',
          ratio: ['5', '1'],
          requiredEquity: '16.7',
          decision: 'call',
        }),
      ).toBeNull()
    })
  })
})

describe('selectHint() — escalation (AC2)', () => {
  const { scenario, answer } = assessments.lo1
  const ladder = hintLadders.lo1
  const wrongOuts = { outs: '8', streets: '2', equity: '36' }

  it('first miss (prev=null) → rung 0', () => {
    const result = selectHint(ladder, scenario, answer, wrongOuts, null)
    expect(result).not.toBeNull()
    expect(result!.rung).toBe(0)
    expect(result!.errorType).toBe('miscounted-outs')
    expect(result!.text).toBe(ladder['miscounted-outs']![0])
  })

  it('same error again → rung 1', () => {
    const prev = selectHint(ladder, scenario, answer, wrongOuts, null)!
    const result = selectHint(ladder, scenario, answer, wrongOuts, prev)
    expect(result!.rung).toBe(1)
    expect(result!.text).toBe(ladder['miscounted-outs']![1])
  })

  it('same error again → rung 2', () => {
    const r0 = selectHint(ladder, scenario, answer, wrongOuts, null)!
    const r1 = selectHint(ladder, scenario, answer, wrongOuts, r0)!
    const result = selectHint(ladder, scenario, answer, wrongOuts, r1)
    expect(result!.rung).toBe(2)
    expect(result!.text).toBe(ladder['miscounted-outs']![2])
  })

  it('clamped at last rung (stays at rung 2 on repeated same-error miss)', () => {
    const r0 = selectHint(ladder, scenario, answer, wrongOuts, null)!
    const r1 = selectHint(ladder, scenario, answer, wrongOuts, r0)!
    const r2 = selectHint(ladder, scenario, answer, wrongOuts, r1)!
    const result = selectHint(ladder, scenario, answer, wrongOuts, r2)
    expect(result!.rung).toBe(2)
    expect(result!.text).toBe(ladder['miscounted-outs']![2])
  })
})

describe('selectHint() — ladder switch (AC3)', () => {
  const { scenario, answer } = assessments.lo1
  const ladder = hintLadders.lo1
  const wrongOuts = { outs: '8', streets: '2', equity: '36' }
  const wrongMultiplier = { outs: '9', streets: '2', equity: '18' }

  it('error type changes → resets to rung 0 of new ladder', () => {
    const r0 = selectHint(ladder, scenario, answer, wrongOuts, null)!
    const r1 = selectHint(ladder, scenario, answer, wrongOuts, r0)!
    const atRung2 = selectHint(ladder, scenario, answer, wrongOuts, r1)!
    expect(atRung2.rung).toBe(2)

    const result = selectHint(ladder, scenario, answer, wrongMultiplier, atRung2)
    expect(result).not.toBeNull()
    expect(result!.errorType).toBe('wrong-multiplier')
    expect(result!.rung).toBe(0)
    expect(result!.text).toBe(ladder['wrong-multiplier']![0])
  })
})

describe('selectHint() — guards', () => {
  it('all-correct submission → null', () => {
    const { scenario, answer } = assessments.lo1
    const result = selectHint(hintLadders.lo1, scenario, answer, { outs: '9', streets: '2', equity: '36' }, null)
    expect(result).toBeNull()
  })

  it('error type missing from ladder → null (lo3 ladder lacks miscounted-outs)', () => {
    const { scenario, answer } = assessments.lo1
    const wrongOuts = { outs: '8', streets: '2', equity: '36' }
    // lo3 ladder has no 'miscounted-outs' key — guards the Partial lookup
    const result = selectHint(hintLadders.lo3, scenario, answer, wrongOuts, null)
    expect(result).toBeNull()
  })
})

describe('AC4 — no hint rung reveals the final answer value', () => {
  it('LO1 ladders: no rung contains the equity answer "36"', () => {
    for (const rungs of Object.values(hintLadders.lo1)) {
      for (const text of rungs) {
        expect(text).not.toContain('36')
      }
    }
  })

  it('LO2 ladders: no rung contains requiredEquity answer "16.7"', () => {
    for (const rungs of Object.values(hintLadders.lo2)) {
      for (const text of rungs) {
        expect(text).not.toContain('16.7')
      }
    }
  })

  it('LO2 ladders: no rung contains ratio answer "5:1" or "5 : 1"', () => {
    for (const rungs of Object.values(hintLadders.lo2)) {
      for (const text of rungs) {
        expect(text).not.toContain('5:1')
        expect(text).not.toContain('5 : 1')
      }
    }
  })

  it('LO3 ladder: no rung contains equity "36", requiredEquity "16.7", or ratio "5:1"', () => {
    for (const rungs of Object.values(hintLadders.lo3)) {
      for (const text of rungs) {
        expect(text).not.toContain('36')
        expect(text).not.toContain('16.7')
        expect(text).not.toContain('5:1')
      }
    }
  })
})

describe('robustness', () => {
  const { scenario, answer } = assessments.lo1

  it('whitespace around outs "  8  " → miscounted-outs', () => {
    expect(detectError(scenario, answer, { outs: '  8  ', streets: '2', equity: '36' })).toBe('miscounted-outs')
  })

  it('non-numeric equity "abc" with correct outs/streets → wrong-multiplier, no throw', () => {
    expect(detectError(scenario, answer, { outs: '9', streets: '2', equity: 'abc' })).toBe('wrong-multiplier')
  })

  it('empty submission on LO1 → a rung or null, never a throw', () => {
    expect(() => selectHint(hintLadders.lo1, scenario, answer, {}, null)).not.toThrow()
  })

  it('DETECT_TOLERANCE_PP is exported and equals 3', () => {
    expect(DETECT_TOLERANCE_PP).toBe(3)
  })
})
