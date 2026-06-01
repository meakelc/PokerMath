<script lang="ts">
  import PlayingCard from '../../lib/components/PlayingCard.svelte'
  import { parseCard } from '../../lib/cards'

  const royalFlush    = ['Ah', 'Kh', 'Qh', 'Jh', 'Th'].map(parseCard)
  const straightFlush = ['9c', '8c', '7c', '6c', '5c'].map(parseCard)
  const fourOfAKind   = ['Kh', 'Ks', 'Kd', 'Kc', 'Ah'].map(parseCard)
  const fullHouse     = ['Qh', 'Qs', 'Qd', 'Jh', 'Js'].map(parseCard)
  const flush         = ['Ac', 'Tc', '7c', '4c', '2c'].map(parseCard)
  const straight      = ['8h', '7d', '6c', '5s', '4h'].map(parseCard)
  const threeOfAKind  = ['Th', 'Ts', 'Td', 'Ac', '5h'].map(parseCard)
  const twoPair       = ['Jh', 'Jd', '8s', '8d', 'Kc'].map(parseCard)
  const onePair       = ['7h', '7c', 'As', 'Kd', 'Qh'].map(parseCard)
  const highCard      = ['Ah', 'Kd', 'Jc', '8s', '4h'].map(parseCard)
</script>

<ul class="rankings">
  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">1</span>
        <span class="hand-name">Royal Flush</span>
      </div>
      <p class="hand-desc">A K Q J T all of the same suit</p>
    </div>
    <div class="card-row">
      {#each royalFlush as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">2</span>
        <span class="hand-name">Straight Flush</span>
      </div>
      <p class="hand-desc">Five consecutive ranks, all the same suit</p>
    </div>
    <div class="card-row">
      {#each straightFlush as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">3</span>
        <span class="hand-name">Four of a Kind</span>
      </div>
      <p class="hand-desc">Four cards of the same rank</p>
    </div>
    <div class="card-row">
      {#each fourOfAKind as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">4</span>
        <span class="hand-name">Full House</span>
      </div>
      <p class="hand-desc">Three of a kind plus a pair</p>
    </div>
    <div class="card-row">
      {#each fullHouse as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">5</span>
        <span class="hand-name">Flush</span>
      </div>
      <p class="hand-desc">Any five cards of the same suit</p>
    </div>
    <div class="card-row">
      {#each flush as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">6</span>
        <span class="hand-name">Straight</span>
      </div>
      <p class="hand-desc">Five cards in sequence, mixed suits</p>
    </div>
    <div class="card-row">
      {#each straight as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">7</span>
        <span class="hand-name">Three of a Kind</span>
      </div>
      <p class="hand-desc">Three cards of the same rank</p>
    </div>
    <div class="card-row">
      {#each threeOfAKind as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">8</span>
        <span class="hand-name">Two Pair</span>
      </div>
      <p class="hand-desc">Two different pairs</p>
    </div>
    <div class="card-row">
      {#each twoPair as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">9</span>
        <span class="hand-name">One Pair</span>
      </div>
      <p class="hand-desc">Two cards of the same rank</p>
    </div>
    <div class="card-row">
      {#each onePair as card}<PlayingCard {card} />{/each}
    </div>
  </li>

  <li class="ranking-item ranking-item--last">
    <div class="ranking-left">
      <div class="ranking-header">
        <span class="rank-num">10</span>
        <span class="hand-name">High Card</span>
      </div>
      <p class="hand-desc">None of the above — highest card plays</p>
    </div>
    <div class="card-row">
      {#each highCard as card}<PlayingCard {card} />{/each}
    </div>
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
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    border-bottom: 1px solid var(--color-sidebar-border);
    padding-bottom: var(--space-4);
  }

  .ranking-item--last {
    border-bottom: none;
    padding-bottom: 0;
  }

  .ranking-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
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
    flex-shrink: 0;
  }

  .hand-desc {
    font: var(--font-caption);
    color: var(--color-sidebar-text-dim);
    margin: 0;
  }
</style>
