export type CheatSheetId = 'deck' | 'holdem' | 'rankings' | 'jargon'

export type CheatSheet = { id: CheatSheetId; title: string }

export const cheatSheets = [
  { id: 'deck', title: 'The 52-card Deck' },
  { id: 'holdem', title: "Texas Hold 'Em Rules" },
  { id: 'rankings', title: 'Hand Rankings' },
  { id: 'jargon', title: 'Poker Jargon' },
] as const satisfies readonly CheatSheet[]
