<script lang="ts">
  import CardGroup from '../../lib/components/CardGroup.svelte'
  import { parseCard } from '../../lib/cards'

  const hand = [parseCard('Ah'), parseCard('Kh')]
  const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
</script>

<p>
  Every poker decision you make is one of many identical situations you will face over a
  lifetime at the table. The question is never "did I win this hand?" — it is "was the call
  correct given the information I had?" A good call loses sometimes. That is not a reason to
  fold.
</p>

<p>
  Think about it this way: a friend offers you a simple game. Flip a fair coin. Heads, you
  collect $5. Tails, you pay $1. You will lose roughly half the flips — but over 100 plays you
  collect $250 and pay out $50, a profit of $200. You should take every single flip without
  hesitation. <strong>The math decides, not any individual outcome.</strong>
</p>

<p>
  Calling a bet works the same way. If your equity in the hand exceeds the required equity
  threshold set by the pot odds, the call is profitable over many repetitions — even when this
  particular hand does not come through.
</p>

<p>
  The method has two steps. <strong>Step one:</strong> compute your equity. The Rule of 2-and-4
  from LO1 gives you a fast estimate at the table. <strong>Step two:</strong> compute the
  required equity from the pot odds formula — <strong>call ÷ (pot + call)</strong> — the same
  formula you applied in LO2. If your equity exceeds the required equity, calling is the
  correct, profitable play. If it falls short, folding is correct.
</p>

<p>
  Return to the hand you have now seen in both LO1 and LO2: <code class="notation">Ah Kh</code>
  on the flop <code class="notation">Qh 8h 7c</code> — a nine-out flush draw.
</p>

<CardGroup label="Your hand" cards={hand} />

<CardGroup label="Flop" cards={board} />

<p>
  <strong>Step one — your equity:</strong> 9 outs with two streets remaining — 9 × 4 =
  <strong>36%</strong>. <strong>Step two — required equity:</strong> your opponent bets $10
  into a $40 pot. Required equity = $10 ÷ ($50 + $10) = $10 ÷ $60 ≈ <strong>16.7%</strong>.
  Stack them side by side: 36% against 16.7%. Your equity clears the threshold by a wide
  margin. The call is correct.
</p>

<p>
  In the assessment you will be given a hand, a board, a pot, and a bet. Compute both values
  yourself, then commit to a decision. The method is always the same: equity versus threshold.
</p>
