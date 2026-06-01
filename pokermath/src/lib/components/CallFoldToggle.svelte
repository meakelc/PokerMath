<script lang="ts">
  import type { Decision } from '../../lib/assessment/types'

  let { value = $bindable('' as Decision | '') }: { value?: Decision | '' } = $props()

  function select(d: Decision) {
    value = d
  }

  function handleKey(e: KeyboardEvent, _d: Decision) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); select('fold') }
    else if (e.key === 'ArrowRight') { e.preventDefault(); select('call') }
    else if (e.key === ' ') { e.preventDefault(); select(value === 'call' ? 'fold' : 'call') }
  }
</script>

<div class="toggle" role="group" aria-label="Call or fold">
  <button
    type="button"
    class="btn"
    class:selected={value === 'call'}
    aria-pressed={value === 'call'}
    onclick={() => select('call')}
    onkeydown={(e) => handleKey(e, 'call')}
  >Call</button>
  <button
    type="button"
    class="btn"
    class:selected={value === 'fold'}
    aria-pressed={value === 'fold'}
    onclick={() => select('fold')}
    onkeydown={(e) => handleKey(e, 'fold')}
  >Fold</button>
</div>

<style>
  .toggle {
    display: flex;
    gap: var(--space-2);
  }

  .btn {
    min-width: 80px;
    padding: var(--padding-button-primary);
    border-radius: var(--radius-sm);
    font: var(--font-body-md);
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: var(--border-ghost);
    color: var(--color-text-on-felt);
  }

  .btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus);
    outline-offset: var(--focus-ring-offset);
  }

  .btn.selected {
    background: var(--color-gold);
    color: var(--color-gold-ink);
    border-color: transparent;
  }
</style>
