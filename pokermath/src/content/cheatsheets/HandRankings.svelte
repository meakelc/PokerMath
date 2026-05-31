<script lang="ts">
  import PlayingCard from '../../lib/components/PlayingCard.svelte'
  import { parseCard } from '../../lib/cards'

  const royalFlush = [parseCard('Ah'), parseCard('Kh'), parseCard('Qh')]
  const straightFlush = [parseCard('9c'), parseCard('8c'), parseCard('7c')]
  const fourOfAKind = [parseCard('Kh'), parseCard('Ks'), parseCard('Kd')]
</script>

<ul class="rankings">
  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">1</span>
      <span class="hand-name">Royal Flush</span>
    </div>
    <div class="card-row">
      {#each royalFlush as card}
        <PlayingCard {card} />
      {/each}
    </div>
    <p class="hand-desc">A K Q J T all of the same suit</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">2</span>
      <span class="hand-name">Straight Flush</span>
    </div>
    <div class="card-row">
      {#each straightFlush as card}
        <PlayingCard {card} />
      {/each}
    </div>
    <p class="hand-desc">Five consecutive ranks, all the same suit</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">3</span>
      <span class="hand-name">Four of a Kind</span>
    </div>
    <div class="card-row">
      {#each fourOfAKind as card}
        <PlayingCard {card} />
      {/each}
    </div>
    <p class="hand-desc">Four cards of the same rank</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">4</span>
      <span class="hand-name">Full House</span>
    </div>
    <p class="hand-desc">Three of a kind plus a pair</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">5</span>
      <span class="hand-name">Flush</span>
    </div>
    <p class="hand-desc">Any five cards of the same suit</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">6</span>
      <span class="hand-name">Straight</span>
    </div>
    <p class="hand-desc">Five cards in sequence, mixed suits</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">7</span>
      <span class="hand-name">Three of a Kind</span>
    </div>
    <p class="hand-desc">Three cards of the same rank</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">8</span>
      <span class="hand-name">Two Pair</span>
    </div>
    <p class="hand-desc">Two different pairs</p>
  </li>

  <li class="ranking-item">
    <div class="ranking-header">
      <span class="rank-num">9</span>
      <span class="hand-name">One Pair</span>
    </div>
    <p class="hand-desc">Two cards of the same rank</p>
  </li>

  <li class="ranking-item ranking-item--last">
    <div class="ranking-header">
      <span class="rank-num">10</span>
      <span class="hand-name">High Card</span>
    </div>
    <p class="hand-desc">None of the above — highest card plays</p>
  </li>
</ul>

<style>
  .rankings {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: 0;
    margin: 0;
  }

  .ranking-item {
    border-bottom: 1px solid var(--color-sidebar-border);
    padding-bottom: var(--space-4);
  }

  .ranking-item--last {
    border-bottom: none;
    padding-bottom: 0;
  }

  .ranking-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  .rank-num {
    font: var(--font-value);
    color: var(--color-sidebar-text-dim);
    min-width: var(--space-6);
  }

  .hand-name {
    font: var(--font-body-md);
    font-weight: 600;
    color: var(--color-sidebar-text);
  }

  .card-row {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .hand-desc {
    font: var(--font-caption);
    color: var(--color-sidebar-text-dim);
    margin: var(--space-1) 0 0 0;
  }
</style>
