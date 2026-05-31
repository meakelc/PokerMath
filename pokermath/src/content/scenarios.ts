import { parseCard } from '../lib/cards'
import type { LO, Scenario, AnswerKey } from '../lib/assessment/types'

export type ScenarioWithKey = { scenario: Scenario; answer: AnswerKey }

const lo1: ScenarioWithKey = {
  scenario: {
    id: 'lo1',
    lo: 'lo1',
    hand: [parseCard('Ah'), parseCard('Kh')],
    board: [parseCard('Qh'), parseCard('8h'), parseCard('7c')],
    prompt:
      'Your opponent moves all-in on the flop. Count your outs, note the streets still to come, and estimate your equity with the Rule of 2-and-4.',
  },
  answer: { outs: 9, streets: 2, equity: 36 },
}

const lo2: ScenarioWithKey = {
  scenario: {
    id: 'lo2',
    lo: 'lo2',
    hand: [],
    board: [],
    pot: 40,
    bet: 10,
    prompt:
      "There's $40 in the pot and your opponent bets $10. What pot odds are you getting, and what equity do you need to make calling break even?",
  },
  answer: { ratio: [5, 1], requiredEquity: 16.7 },
}

const lo3: ScenarioWithKey = {
  scenario: {
    id: 'lo3',
    lo: 'lo3',
    hand: [parseCard('Ah'), parseCard('Kh')],
    board: [parseCard('Qh'), parseCard('8h'), parseCard('7c')],
    pot: 40,
    bet: 10,
    prompt:
      "You hold Ah Kh on Qh 8h 7c. There's $40 in the pot and your opponent bets $10, putting you to a decision. Work out your equity and the pot odds, then commit: call or fold?",
  },
  answer: { equity: 36, ratio: [5, 1], requiredEquity: 16.7, decision: 'call' },
}

export const assessments = { lo1, lo2, lo3 } as const satisfies Record<LO, ScenarioWithKey>
