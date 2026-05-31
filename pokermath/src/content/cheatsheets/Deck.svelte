<script lang="ts">
  import PlayingCard from '../../lib/components/PlayingCard.svelte'
  import { parseCard } from '../../lib/cards'

  const suitExamples = [
    parseCard('Ah'),
    parseCard('Kd'),
    parseCard('Qc'),
    parseCard('Js'),
  ]
</script>

<p>A standard deck has 52 cards: 13 ranks in each of 4 suits.</p>

<p><strong>Ranks</strong> — high to low: A K Q J <code>T</code> 9 8 7 6 5 4 3 2. Note that <code>T</code> stands for Ten — never <code>10</code>. This is the same hand-notation shorthand you'll see throughout this course.</p>

<p><strong>Suits</strong> — one card per suit, showing symbol and color:</p>

<div class="card-row">
  {#each suitExamples as card}
    <PlayingCard {card} />
  {/each}
</div>
<p class="caption">♥ red · ♦ blue · ♣ green · ♠ black</p>

<p>The Ace plays high (above a King) or low (below a 2) in a straight, but not both at once.</p>

<style>
  p {
    margin: 0;
  }

  p + p {
    margin-top: var(--space-4);
  }

  .card-row {
    display: flex;
    gap: var(--space-3);
    margin: var(--space-4) 0;
  }

  .caption {
    font: var(--font-caption);
    color: var(--color-sidebar-text-dim);
    margin-top: 0;
  }

  code {
    font: var(--font-value);
    color: var(--color-sidebar-text);
  }
</style>
