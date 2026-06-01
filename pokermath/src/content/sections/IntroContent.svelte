<script lang="ts">
  import CardGroup from '../../lib/components/CardGroup.svelte'
  import { parseCard } from '../../lib/cards'

  const workedExamples = [parseCard('Ah'), parseCard('Tc')]
  const fourSuits = [parseCard('Ah'), parseCard('Kd'), parseCard('Qc'), parseCard('Js')]
</script>

<p>
  This tool assumes you already know a 52-card deck and Texas Hold 'Em — the betting
  rounds, the community board, what makes a winning hand. If you ever want a refresher
  on any of that, the Cheat Sheets in the sidebar have the essentials.
</p>

<p>
  What you need before the first lesson is a simple system for writing cards down. Every
  Section uses the same notation, so learning it now means you'll read any hand at a
  glance from the start.
</p>

<p>
  A card is two characters: a <strong>rank letter</strong> followed by a
  <strong>suit letter</strong>. Ranks run
  <code class="notation">A K Q J T 9 8 7 6 5 4 3 2</code>. Ten is always
  <code class="notation">T</code> — never <code class="notation">10</code>. Suits are
  lowercase: <code class="notation">h</code> hearts, <code class="notation">d</code>
  diamonds, <code class="notation">c</code> clubs, <code class="notation">s</code> spades.
</p>

<div class="card-row">
  <p>
    So <code class="notation">Ah</code> is the Ace of hearts and
    <code class="notation">Tc</code> is the Ten of clubs:
  </p>
  <div class="card-col">
    <CardGroup label="Ah · Tc" cards={workedExamples} />
  </div>
</div>

<div class="card-row">
  <p>
    Each suit also has its own color throughout the tool — hearts red, diamonds blue,
    clubs green, spades black. Here's one card from each suit so you can connect the
    letter to the color before the first lesson:
  </p>
  <div class="card-col">
    <CardGroup label="All four suits" cards={fourSuits} />
  </div>
</div>

<p>
  That's the whole system. Every card in every Section from here on uses this exact
  two-character notation — you'll find it becomes second nature quickly.
</p>
