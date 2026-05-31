import type { Component } from 'svelte'
import type { CheatSheetId } from '../cheatsheets'
import Deck from './Deck.svelte'
import HoldEmRules from './HoldEmRules.svelte'
import HandRankings from './HandRankings.svelte'
import Jargon from './Jargon.svelte'

export const cheatSheetContent: Record<CheatSheetId, Component> = {
  deck: Deck,
  holdem: HoldEmRules,
  rankings: HandRankings,
  jargon: Jargon,
}
