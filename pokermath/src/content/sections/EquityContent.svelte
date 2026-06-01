<script lang="ts">
  import CardGroup from '../../lib/components/CardGroup.svelte'
  import { parseCard } from '../../lib/cards'

  const hand = [parseCard('Ah'), parseCard('Kh')]
  const board = [parseCard('Qh'), parseCard('8h'), parseCard('7c')]
</script>

<p>
  Equity is your probability of winning at showdown. At any point in the hand, certain
  cards would improve your hand to a winner — those cards are your <strong>outs</strong>.
</p>

<div class="card-row">
  <p>
    Say you're dealt <code class="notation">Ah Kh</code> and the flop comes
    <code class="notation">Qh 8h 7c</code>. You have a flush draw: two hearts in your hand,
    two hearts on the board.
  </p>
  <div class="card-col">
    <CardGroup label="Your hand" cards={hand} />
    <CardGroup label="Flop" cards={board} />
  </div>
</div>

<p>
  How many outs do you have? There are 13 hearts in the deck. You can see four of them
  (<code class="notation">Ah</code>, <code class="notation">Kh</code>,
  <code class="notation">Qh</code>, <code class="notation">8h</code>), so 9 hearts remain
  unseen. You have <strong>9 outs</strong>.
</p>

<p>
  Now for the derivation. With 47 unseen cards remaining after the flop, the probability of
  catching a heart on the turn is roughly 9/47 ≈ 19%. If you miss, the river gives another
  chance — roughly 9/46 ≈ 20%. These two chances combine to about <strong>35%</strong>
  equity.
</p>

<p>
  That's accurate, but slow to compute at the table. The <strong>Rule of 2-and-4</strong>
  gives you a fast approximation: <strong>×4 for two streets remaining, ×2 for one</strong>.
  With two streets still to come (turn and river), multiply your outs by 4: 9 × 4 = 36% —
  within a percentage point of the exact figure.
</p>

<p>
  Fix this split now before you move to the assessment. Two streets remaining: multiply by 4.
  One street remaining: multiply by 2. You'll apply it to new scenarios right away.
</p>
