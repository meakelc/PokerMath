<script lang="ts">
  import CardGroup from '../../lib/components/CardGroup.svelte'
  import { parseCard } from '../../lib/cards'
</script>

<p>
  Welcome to PokerMath. Each Section teaches one idea and then asks you to use it.
  <!-- Story 2.3 replaces this with the real Introduction: prerequisites + hand-notation teaching. -->
</p>

<CardGroup label="Hand notation" cards={[parseCard('Ah'), parseCard('Tc')]} />
