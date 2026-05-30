export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'
export type Suit = 'h' | 'd' | 'c' | 's'
export type Card = { rank: Rank; suit: Suit }

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
const SUITS = ['h', 'd', 'c', 's'] as const

export function parseCard(s: string): Card {
  if (s.length !== 2) throw new Error(`Invalid card notation: "${s}" (expected 2 chars)`)
  const rank = s[0] as Rank
  const suit = s[1] as Suit
  if (!(RANKS as readonly string[]).includes(rank))
    throw new Error(`Invalid rank: "${s[0]}" in "${s}"`)
  if (!(SUITS as readonly string[]).includes(suit))
    throw new Error(`Invalid suit: "${s[1]}" in "${s}" (suits are lowercase h d c s)`)
  return { rank, suit }
}

export function cardToString(c: Card): string {
  return `${c.rank}${c.suit}`
}
