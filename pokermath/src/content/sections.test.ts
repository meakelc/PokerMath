import { describe, it, expect } from 'vitest'
import { sections, defaultSectionIndex } from './sections'

describe('sections', () => {
  it('has exactly 6 entries', () => {
    expect(sections).toHaveLength(6)
  })

  it('ids are in fixed order with optional quizzes as bookends', () => {
    expect(sections.map((s) => s.id)).toEqual([
      'pre-test',
      'intro',
      'equity',
      'pot-odds',
      'calling',
      'post-test',
    ])
  })

  it('bookend sections are quiz-kind single pages', () => {
    expect(sections[0].pageKinds).toEqual(['quiz'])
    expect(sections[sections.length - 1].pageKinds).toEqual(['quiz'])
  })

  it('introduction has only an informational page', () => {
    const intro = sections.find((s) => s.id === 'intro')!
    expect(intro.pageKinds).toEqual(['informational'])
  })

  it('three LO sections have informational then assessment pages', () => {
    for (const id of ['equity', 'pot-odds', 'calling']) {
      expect(sections.find((s) => s.id === id)!.pageKinds).toEqual([
        'informational',
        'assessment',
      ])
    }
  })

  it('cold start resolves to Introduction, not the Pre-Test', () => {
    expect(sections[defaultSectionIndex].id).toBe('intro')
  })
})
