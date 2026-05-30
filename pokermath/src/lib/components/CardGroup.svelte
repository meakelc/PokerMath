<script lang="ts">
  import { type Card, cardToString } from '../cards'
  import PlayingCard from './PlayingCard.svelte'

  let { cards, label }: { cards: Card[]; label: string } = $props()
</script>

<div class="group">
  <span class="group-label">{label}</span>
  <div class="cards">
    {#each cards as card (cardToString(card))}
      <PlayingCard {card} />
    {/each}
  </div>
</div>

<style>
  .group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .group-label {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    text-transform: uppercase;
    color: var(--color-text-on-felt-dim);
  }

  .cards {
    display: flex;
    gap: var(--space-2);
  }
</style>
