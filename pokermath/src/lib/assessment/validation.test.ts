import { describe, it, expect } from 'vitest'
import { assessments } from '../../content/scenarios'
import { EQUITY_TOLERANCE_PP } from './types'
import { validate, REQUIRED_EQUITY_BAND } from './validation'

describe('validate()', () => {
  describe('LO1 — exact fields + equity band', () => {
    const { answer } = assessments.lo1

    it('all-correct submission passes', () => {
      const result = validate(answer, { outs: '9', streets: '2', equity: '36' })
      expect(result.passed).toBe(true)
      expect(result.perField).toEqual({ outs: true, streets: true, equity: true })
    })

    it('perField contains only outs/streets/equity — no ratio or decision keys', () => {
      const result = validate(answer, { outs: '9', streets: '2', equity: '36' })
      expect('ratio' in result.perField).toBe(false)
      expect('decision' in result.perField).toBe(false)
      expect('requiredEquity' in result.perField).toBe(false)
    })

    it('hint is undefined (set by Story 3.3)', () => {
      const result = validate(answer, { outs: '9', streets: '2', equity: '36' })
      expect(result.hint).toBeUndefined()
    })

    describe('equity band — driven by EQUITY_TOLERANCE_PP constant', () => {
      const eq = answer.equity! // 36
      const lo = eq - EQUITY_TOLERANCE_PP // 33
      const hi = eq + EQUITY_TOLERANCE_PP // 39

      it('equity at lower band edge passes', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: String(lo) }).perField.equity).toBe(true))

      it('equity at upper band edge passes', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: String(hi) }).perField.equity).toBe(true))

      it('equity one below lower edge fails', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: String(lo - 1) }).perField.equity).toBe(false))

      it('equity one above upper edge fails', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: String(hi + 1) }).perField.equity).toBe(false))

      it('equity at key value passes', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: String(eq) }).perField.equity).toBe(true))
    })

    describe('outs — exact match', () => {
      it('outs 9 passes', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: '36' }).perField.outs).toBe(true))

      it('outs 8 fails', () =>
        expect(validate(answer, { outs: '8', streets: '2', equity: '36' }).perField.outs).toBe(false))

      it('outs 10 fails', () =>
        expect(validate(answer, { outs: '10', streets: '2', equity: '36' }).perField.outs).toBe(false))
    })

    describe('streets — exact match', () => {
      it('streets 2 passes', () =>
        expect(validate(answer, { outs: '9', streets: '2', equity: '36' }).perField.streets).toBe(true))

      it('streets 1 fails', () =>
        expect(validate(answer, { outs: '9', streets: '1', equity: '36' }).perField.streets).toBe(false))
    })

    it('one wrong field → passed false, others stay true', () => {
      const result = validate(answer, { outs: '8', streets: '2', equity: '36' })
      expect(result.passed).toBe(false)
      expect(result.perField.outs).toBe(false)
      expect(result.perField.streets).toBe(true)
      expect(result.perField.equity).toBe(true)
    })
  })

  describe('LO2 — ratio + required equity', () => {
    const { answer } = assessments.lo2

    it('all-correct submission passes', () => {
      const result = validate(answer, { ratio: ['5', '1'], requiredEquity: '16.7' })
      expect(result.passed).toBe(true)
      expect(result.perField).toEqual({ ratio: true, requiredEquity: true })
    })

    describe('required-equity band [16, 17]', () => {
      it('16 passes (lower edge)', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '16' }).perField.requiredEquity).toBe(true))

      it('17 passes (upper edge)', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '17' }).perField.requiredEquity).toBe(true))

      it('16.7 passes (textbook value)', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '16.7' }).perField.requiredEquity).toBe(true))

      it('20 fails (denominator error: 10/50)', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '20' }).perField.requiredEquity).toBe(false))

      it('15 fails (below band)', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '15' }).perField.requiredEquity).toBe(false))
    })

    describe('ratio — exact tuple match', () => {
      it('[5, 1] passes', () =>
        expect(validate(answer, { ratio: ['5', '1'], requiredEquity: '16.7' }).perField.ratio).toBe(true))

      it('[5, 2] fails', () =>
        expect(validate(answer, { ratio: ['5', '2'], requiredEquity: '16.7' }).perField.ratio).toBe(false))

      it('[1, 5] fails (inverted)', () =>
        expect(validate(answer, { ratio: ['1', '5'], requiredEquity: '16.7' }).perField.ratio).toBe(false))

      it('[50, 10] fails (unreduced equivalent)', () =>
        expect(validate(answer, { ratio: ['50', '10'], requiredEquity: '16.7' }).perField.ratio).toBe(false))
    })
  })

  describe('LO3 — full synthesis', () => {
    const { answer } = assessments.lo3

    it('all-correct submission passes with all four perField true', () => {
      const result = validate(answer, {
        equity: '36',
        ratio: ['5', '1'],
        requiredEquity: '16.7',
        decision: 'call',
      })
      expect(result.passed).toBe(true)
      expect(result.perField).toEqual({
        equity: true,
        ratio: true,
        requiredEquity: true,
        decision: true,
      })
    })

    it('decision fold → perField.decision false, passed false', () => {
      const result = validate(answer, {
        equity: '36',
        ratio: ['5', '1'],
        requiredEquity: '16.7',
        decision: 'fold',
      })
      expect(result.perField.decision).toBe(false)
      expect(result.passed).toBe(false)
    })

    it('equity 33 still passes (±3pp band applies in LO3)', () => {
      const result = validate(answer, {
        equity: '33',
        ratio: ['5', '1'],
        requiredEquity: '16.7',
        decision: 'call',
      })
      expect(result.perField.equity).toBe(true)
      expect(result.passed).toBe(true)
    })

    it('equity 39 still passes (±3pp band applies in LO3)', () => {
      const result = validate(answer, {
        equity: '39',
        ratio: ['5', '1'],
        requiredEquity: '16.7',
        decision: 'call',
      })
      expect(result.perField.equity).toBe(true)
      expect(result.passed).toBe(true)
    })
  })

  describe('robustness / defensive parsing', () => {
    const { answer } = assessments.lo1

    it('whitespace around digits is trimmed — outs "  9  " passes', () => {
      const result = validate(answer, { outs: '  9  ', streets: '2', equity: '36' })
      expect(result.perField.outs).toBe(true)
    })

    it('non-numeric equity → perField.equity false, no throw', () => {
      const result = validate(answer, { outs: '9', streets: '2', equity: 'abc' })
      expect(result.perField.equity).toBe(false)
      expect(result.passed).toBe(false)
    })

    it('empty outs string → perField.outs false, no throw', () => {
      const result = validate(answer, { outs: '', streets: '2', equity: '36' })
      expect(result.perField.outs).toBe(false)
    })

    it('REQUIRED_EQUITY_BAND is the source of the required-equity pass window', () => {
      const { answer: lo2answer } = assessments.lo2
      const [lo, hi] = REQUIRED_EQUITY_BAND
      expect(
        validate(lo2answer, { ratio: ['5', '1'], requiredEquity: String(lo) }).perField.requiredEquity,
      ).toBe(true)
      expect(
        validate(lo2answer, { ratio: ['5', '1'], requiredEquity: String(hi) }).perField.requiredEquity,
      ).toBe(true)
      expect(
        validate(lo2answer, { ratio: ['5', '1'], requiredEquity: String(lo - 1) }).perField.requiredEquity,
      ).toBe(false)
      expect(
        validate(lo2answer, { ratio: ['5', '1'], requiredEquity: String(hi + 1) }).perField.requiredEquity,
      ).toBe(false)
    })
  })
})
