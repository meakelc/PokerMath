import { describe, it, expect } from 'vitest'
import { sections } from './sections'

describe('sections', () => {
  it('has exactly 4 entries', () => {
    expect(sections).toHaveLength(4)
  })

  it('ids are in fixed order', () => {
    expect(sections.map((s) => s.id)).toEqual(['intro', 'equity', 'pot-odds', 'calling'])
  })

  it('first section is informational', () => {
    expect(sections[0].kind).toBe('informational')
  })

  it('three LO sections are assessment', () => {
    expect(sections[1].kind).toBe('assessment')
    expect(sections[2].kind).toBe('assessment')
    expect(sections[3].kind).toBe('assessment')
  })
})
