import { describe, it, expect } from 'vitest'
import { cheatSheets } from './cheatsheets'

describe('cheatSheets', () => {
  it('has exactly 4 entries', () => {
    expect(cheatSheets).toHaveLength(4)
  })

  it('ids are in fixed order', () => {
    expect(cheatSheets.map((s) => s.id)).toEqual(['deck', 'holdem', 'rankings', 'jargon'])
  })

  it('every title is a non-empty string', () => {
    for (const sheet of cheatSheets) {
      expect(typeof sheet.title).toBe('string')
      expect(sheet.title.length).toBeGreaterThan(0)
    }
  })
})
