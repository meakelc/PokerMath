import type { Component } from 'svelte'
import type { SectionId } from '../sections'
import IntroContent from './IntroContent.svelte'
import EquityContent from './EquityContent.svelte'
import PotOddsContent from './PotOddsContent.svelte'
import CallingContent from './CallingContent.svelte'

// Per-Section instructional content (AR-9). Partial: assessment-kind Sections
// wire their teaching content in later stories / Epic 3.
export const sectionContent: Partial<Record<SectionId, Component>> = {
  intro: IntroContent,
  equity: EquityContent,
  'pot-odds': PotOddsContent,
  calling: CallingContent,
}
