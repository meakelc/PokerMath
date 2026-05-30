import { describe, it, expect } from 'vitest'
import { parseCard, cardToString } from './cards'

describe('parseCard', () => {
  it('parses Ace of hearts', () => {
    expect(parseCard('Ah')).toEqual({ rank: 'A', suit: 'h' })
  })

  it('parses T (ten) — canonical notation, not 10', () => {
    expect(parseCard('Tc')).toEqual({ rank: 'T', suit: 'c' })
  })

  it('parses each suit', () => {
    expect(parseCard('2h')).toEqual({ rank: '2', suit: 'h' })
    expect(parseCard('2d')).toEqual({ rank: '2', suit: 'd' })
    expect(parseCard('2c')).toEqual({ rank: '2', suit: 'c' })
    expect(parseCard('2s')).toEqual({ rank: '2', suit: 's' })
  })

  it('parses a spread of ranks', () => {
    expect(parseCard('Ah')).toEqual({ rank: 'A', suit: 'h' })
    expect(parseCard('Kd')).toEqual({ rank: 'K', suit: 'd' })
    expect(parseCard('Qc')).toEqual({ rank: 'Q', suit: 'c' })
    expect(parseCard('Js')).toEqual({ rank: 'J', suit: 's' })
    expect(parseCard('Th')).toEqual({ rank: 'T', suit: 'h' })
    expect(parseCard('9d')).toEqual({ rank: '9', suit: 'd' })
    expect(parseCard('8c')).toEqual({ rank: '8', suit: 'c' })
    expect(parseCard('7s')).toEqual({ rank: '7', suit: 's' })
    expect(parseCard('6h')).toEqual({ rank: '6', suit: 'h' })
    expect(parseCard('5d')).toEqual({ rank: '5', suit: 'd' })
    expect(parseCard('4c')).toEqual({ rank: '4', suit: 'c' })
    expect(parseCard('3s')).toEqual({ rank: '3', suit: 's' })
    expect(parseCard('2h')).toEqual({ rank: '2', suit: 'h' })
  })

  it('rejects numeric ten "10c"', () => {
    expect(() => parseCard('10c')).toThrow()
  })

  it('rejects uppercase suit "AH"', () => {
    expect(() => parseCard('AH')).toThrow()
  })

  it('rejects invalid rank "Xh"', () => {
    expect(() => parseCard('Xh')).toThrow()
  })

  it('rejects lowercase rank "ah"', () => {
    expect(() => parseCard('ah')).toThrow()
  })

  it('rejects too-short string "A"', () => {
    expect(() => parseCard('A')).toThrow()
  })

  it('rejects too-long string "Ahx"', () => {
    expect(() => parseCard('Ahx')).toThrow()
  })

  it('rejects empty string ""', () => {
    expect(() => parseCard('')).toThrow()
  })
})

describe('cardToString', () => {
  it('serialises Queen of hearts', () => {
    expect(cardToString({ rank: 'Q', suit: 'h' })).toBe('Qh')
  })
})

describe('round-trip identity over all 52 cards', () => {
  const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
  const SUITS = ['h', 'd', 'c', 's'] as const

  for (const rank of RANKS) {
    for (const suit of SUITS) {
      const s = `${rank}${suit}`
      it(`round-trips ${s}`, () => {
        expect(cardToString(parseCard(s))).toBe(s)
      })
    }
  }
})
