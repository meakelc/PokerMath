export type PageKind = 'informational' | 'assessment' | 'quiz'

export type SectionId = 'pre-test' | 'intro' | 'equity' | 'pot-odds' | 'calling' | 'post-test'

export type Section = {
  id: SectionId
  title: string
  subtitle: string
  pageKinds: readonly PageKind[]
}

export const sections: readonly Section[] = [
  {
    id: 'pre-test',
    title: 'Pre-Test',
    subtitle: 'Optional · measure your starting point',
    pageKinds: ['quiz'],
  },
  {
    id: 'intro',
    title: 'Introduction',
    subtitle: 'Poker & hand notation',
    pageKinds: ['informational'],
  },
  {
    id: 'equity',
    title: 'Equity & the Rule of 2-and-4',
    subtitle: 'LO1 · estimate your equity',
    pageKinds: ['informational', 'assessment'],
  },
  {
    id: 'pot-odds',
    title: 'Pot Odds',
    subtitle: 'LO2 · price of a call',
    pageKinds: ['informational', 'assessment'],
  },
  {
    id: 'calling',
    title: 'Calling Profitably',
    subtitle: 'LO3 · is the call +EV?',
    pageKinds: ['informational', 'assessment'],
  },
  {
    id: 'post-test',
    title: 'Post-Test',
    subtitle: 'Optional · measure what you learned',
    pageKinds: ['quiz'],
  },
] as const

/** Cold-start section: Introduction, not the optional Pre-Test (the quizzes never force themselves). */
export const defaultSectionIndex = sections.findIndex((s) => s.id === 'intro')
