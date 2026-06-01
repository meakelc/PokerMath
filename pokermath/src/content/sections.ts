export type PageKind = 'informational' | 'assessment'

export type SectionId = 'intro' | 'equity' | 'pot-odds' | 'calling'

export type Section = {
  id: SectionId
  title: string
  subtitle: string
  pageKinds: readonly PageKind[]
}

export const sections: readonly Section[] = [
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
] as const
