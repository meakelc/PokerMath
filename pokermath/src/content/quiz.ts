import type { LO } from '../lib/assessment/types'

/** Which administration of the (identical) quiz a screen represents. */
export type QuizVariant = 'pre' | 'post'

/**
 * One multiple-choice question in the pre/post-test. The pre-test and post-test
 * administer this same set (docs/learning-objectives-and-assessment.md §2).
 * Two questions assess each LO so a single guess can't inflate an LO's score.
 *
 * The source doc lists every correct choice as "A" — that is answer-key
 * formatting, not display order. Here the correct choice is placed at a varied
 * position per question (see `correctIndex`) so the quiz isn't trivially gameable.
 */
export type QuizQuestion = {
  id: string
  lo: LO
  prompt: string
  options: readonly [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: 'q1',
    lo: 'lo1',
    prompt:
      'You hold J♠ T♠. The flop is 9♠ 3♥ 2♣, giving you an open-ended straight draw (any 8 or any Queen completes your straight — 8 outs). The turn card arrives and misses your draw. One street (the river) remains. Using the Rule of 2-and-4, what is your approximate equity?',
    options: ['32%', '8%', '16%', '17%'],
    correctIndex: 2,
  },
  {
    id: 'q2',
    lo: 'lo1',
    prompt:
      'You hold A♥ 6♥. After the flop, the board shows K♥ 8♥ 4♣ — you can see four hearts (two in your hand, two on the board). There are 13 hearts in a full deck. Two streets (turn and river) remain. Using the Rule of 2-and-4, what is your approximate equity?',
    options: ['36%', '44%', '18%', '52%'],
    correctIndex: 0,
  },
  {
    id: 'q3',
    lo: 'lo2',
    prompt:
      'There is $60 in the pot and your opponent bets $20. What pot odds ratio are you being offered?',
    options: ['3:1', '5:1', '2:1', '4:1'],
    correctIndex: 3,
  },
  {
    id: 'q4',
    lo: 'lo2',
    prompt:
      'Using the same scenario from Question 3 ($60 original pot, $20 bet, 4:1 pot odds): what is the minimum equity your hand needs for the call to be profitable?',
    options: ['25%', '20%', '33%', '17%'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    lo: 'lo3',
    prompt:
      'You have a flush draw with 9 outs on the turn (one street remaining). The pot is $50 and your opponent bets $25. Should you call or fold?',
    options: [
      'Fold — your 18% equity falls below the 25% required equity',
      'Call — 9 outs is a strong draw that usually justifies calling',
      'Call — the pot odds ratio of 2:1 signals a favorable call',
      'Fold — you need at least 50% equity to call any bet',
    ],
    correctIndex: 0,
  },
  {
    id: 'q6',
    lo: 'lo3',
    prompt:
      'A player holds 12 outs with two streets remaining. The pot is $40 and the opponent bets $20. What is the correct decision?',
    options: [
      "Fold — the opponent's large relative bet signals a strong hand",
      'Call — having more than 10 outs always makes calling correct',
      'Call — the 48% equity comfortably exceeds the 25% required equity',
      'Fold — the required equity is 33%, which exceeds the player’s equity',
    ],
    correctIndex: 2,
  },
] as const
