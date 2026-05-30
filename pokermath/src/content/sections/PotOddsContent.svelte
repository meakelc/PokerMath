<script lang="ts">
  import CardGroup from '../../lib/components/CardGroup.svelte'
  import { parseCard } from '../../lib/cards'

  const hand = [parseCard('Ah'), parseCard('Kh')]
  const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
</script>

<p>
  Pot odds are the price of calling expressed as a ratio — how much is already in the pot
  versus what you must add. Before you can decide whether to call, you need to know what the
  pot is offering you.
</p>

<p>
  Pick up where LO1 left off. You're on the flop holding <code class="notation">Ah Kh</code>
  with the board showing <code class="notation">Qh 8h 7c</code> — a flush draw with roughly
  36% equity. Your opponent now bets $10 into a $40 pot.
</p>

<CardGroup label="Your hand" cards={hand} />

<CardGroup label="Flop" cards={board} />

<p>
  After the bet, the pot contains $50 when the decision reaches you. Your call is $10. The
  ratio is <strong>$50 to $10 — or 5:1</strong>. Five dollars already in the pot for every
  one dollar you put in.
</p>

<p>
  A ratio alone does not tell you whether to call. You need to convert it to a required
  equity. The formula: <strong>required equity = call ÷ (pot + call)</strong>. The denominator
  is the total pot if you call — your share of the prize.
</p>

<p>
  In this spot: $10 ÷ ($50 + $10) = $10 ÷ $60 ≈ <strong>16.7%</strong>. That is the minimum
  equity your hand needs to make the call profitable over many identical situations. Your flush
  draw has 36% equity — well above the threshold, so calling is correct.
</p>

<p>
  Notice how the ratio shifts when your opponent bets bigger. Say they had bet $25 into the
  same $40 pot instead. The new pot is $65, your call is $25 — ratio 65:25 ≈ 2.6:1, required
  equity = $25 ÷ $90 ≈ <strong>27.8%</strong>. The larger the bet relative to the pot, the
  worse your pot odds and the more equity you need to call profitably.
</p>

<p>
  In the assessment you will compute the ratio and required equity for a specific pot and call
  amount. Fix the formula now: <strong>call ÷ (pot + call)</strong>.
</p>
