import type { LO, HintLadder } from '../lib/assessment/types'

export const hintLadders = {
  lo1: {
    'miscounted-outs': [
      'Re-count your outs — how many unseen cards complete your draw?',
      'All your hearts are outs. Four hearts are already showing — how many of the thirteen remain?',
      'Nine hearts are unseen. Now apply the rule for two streets to come.',
    ],
    'wrong-multiplier': [
      'Check your multiplier — how many streets are still to come on the flop?',
      'Two streets remain, so the Rule of 2-and-4 says ×4, not ×2.',
      'Multiply your outs by 4.',
    ],
  },
  lo2: {
    'denominator-error': [
      'Did you include the cost of your call in the pot?',
      'The pot is $50 and it costs $10 to call — your $10 goes into the denominator too.',
      'Use cost ÷ (pot + cost), i.e. 10 ÷ 60.',
    ],
    'ratio-percentage-confusion': [
      'Re-read which field wants a ratio and which wants a percentage.',
      'Pot odds as a ratio compare what is already in the pot to the cost of your call. The percentage is the break-even equity that ratio implies.',
      'Convert the ratio with cost ÷ (pot + cost).',
    ],
  },
  lo3: {
    'wrong-comparison-direction': [
      'Line up the two numbers you computed — which must be larger to call?',
      'Calling is profitable when your equity meets or beats the required equity.',
      'Compare your equity to the required-equity threshold, then decide.',
    ],
  },
} as const satisfies Record<LO, HintLadder>
