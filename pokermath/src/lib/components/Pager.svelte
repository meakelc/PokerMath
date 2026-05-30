<script lang="ts">
  import { appState } from '../appState.svelte'
  import { sections } from '../../content/sections'

  const hasBack = $derived(appState.currentSection > 0)
  const hasNext = $derived(appState.currentSection < sections.length - 1)

  function back() {
    if (appState.currentSection > 0) appState.currentSection -= 1
  }

  function next() {
    if (appState.currentSection < sections.length - 1) appState.currentSection += 1
  }
</script>

<nav class="pager" aria-label="Section pager">
  <div class="slot">
    {#if hasBack}
      <button type="button" class="btn ghost" onclick={back}><span aria-hidden="true">←</span> Back</button>
    {/if}
  </div>
  <div class="slot end">
    {#if hasNext}
      <button type="button" class="btn primary" onclick={next}>Next <span aria-hidden="true">→</span></button>
    {/if}
  </div>
</nav>

<style>
  .pager {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: var(--space-8);
  }

  .btn {
    font: var(--font-body-md);
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: var(--padding-button-primary);
    cursor: pointer;
    border: 0;
  }

  .btn.primary {
    background: var(--color-gold);
    color: var(--color-gold-ink);
    box-shadow: var(--shadow-button-primary);
  }

  .btn.ghost {
    background: transparent;
    color: var(--color-text-on-felt-dim);
    border: var(--border-ghost);
  }
</style>
