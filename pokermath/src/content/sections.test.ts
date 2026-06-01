import { describe, it, expect } from 'vitest'
import { sections } from './sections'

describe('sections', () => {
  it('has exactly 4 entries', () => {
    expect(sections).toHaveLength(4)
  })

  it('ids are in fixed order', () => {
    expect(sections.map((s) => s.id)).toEqual(['intro', 'equity', 'pot-odds', 'calling'])
  })

  it('first section has only an informational page', () => {
    expect(sections[0].pageKinds).toEqual(['informational'])
  })

  it('three LO sections have informational then assessment pages', () => {
    expect(sections[1].pageKinds).toEqual(['informational', 'assessment'])
    expect(sections[2].pageKinds).toEqual(['informational', 'assessment'])
    expect(sections[3].pageKinds).toEqual(['informational', 'assessment'])
  })
})
