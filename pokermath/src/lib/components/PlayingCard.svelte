<script lang="ts">
  import { type Card, type Rank, type Suit } from '../cards'

  let { card }: { card: Card } = $props()

  const SUIT_SYMBOL: Record<Suit, string> = { h: '♥', d: '♦', c: '♣', s: '♠' }

  const RANK_LABEL: Record<Rank, string> = {
    A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack', T: 'Ten',
    '9': 'Nine', '8': 'Eight', '7': 'Seven', '6': 'Six',
    '5': 'Five', '4': 'Four', '3': 'Three', '2': 'Two',
  }
  const SUIT_LABEL: Record<Suit, string> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' }

  const cardLabel = (c: Card) => `${RANK_LABEL[c.rank]} of ${SUIT_LABEL[c.suit]}`
</script>

<div class="card suit-{card.suit}" role="img" aria-label={cardLabel(card)}>
  <span class="rank">{card.rank}</span>
  <span class="suit">{SUIT_SYMBOL[card.suit]}</span>
</div>

<style>
  .card {
    width: 60px; /* justified literal — no token; 60×90px seats value-lg stack; see Dev Notes "Card sizing" */
    aspect-ratio: var(--ratio-card);
    background: var(--color-card-face);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
  }

  .rank,
  .suit {
    font: var(--font-value-lg);
  }

  .card.suit-h .rank,
  .card.suit-h .suit {
    color: var(--color-suit-heart);
  }
  .card.suit-d .rank,
  .card.suit-d .suit {
    color: var(--color-suit-diamond);
  }
  .card.suit-c .rank,
  .card.suit-c .suit {
    color: var(--color-suit-club);
  }
  .card.suit-s .rank,
  .card.suit-s .suit {
    color: var(--color-suit-spade);
  }
</style>
