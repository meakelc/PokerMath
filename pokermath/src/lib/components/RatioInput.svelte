<script lang="ts">
  let {
    antecedent = $bindable(''),
    consequent = $bindable(''),
    label = 'Pot odds ratio',
  }: { antecedent?: string; consequent?: string; label?: string } = $props()

  function handleAntecedent(e: Event) {
    const el = e.target as HTMLInputElement
    const stripped = el.value.replace(/[^0-9.]/g, '')
    const cleaned = stripped.replace(/^(\d*\.?\d*).*$/, '$1')
    if (cleaned !== el.value) el.value = cleaned
    antecedent = cleaned
  }

  function handleConsequent(e: Event) {
    const el = e.target as HTMLInputElement
    const stripped = el.value.replace(/[^0-9.]/g, '')
    const cleaned = stripped.replace(/^(\d*\.?\d*).*$/, '$1')
    if (cleaned !== el.value) el.value = cleaned
    consequent = cleaned
  }
</script>

<div class="ratio" role="group" aria-label={label}>
  <div class="well" class:filled={antecedent !== ''}>
    <input
      type="text"
      inputmode="decimal"
      autocomplete="off"
      aria-label="Ratio antecedent"
      value={antecedent}
      oninput={handleAntecedent}
    />
  </div>
  <span class="sep" aria-hidden="true">:</span>
  <div class="well" class:filled={consequent !== ''}>
    <input
      type="text"
      inputmode="decimal"
      autocomplete="off"
      aria-label="Ratio consequent"
      value={consequent}
      oninput={handleConsequent}
    />
  </div>
</div>

<style>
  .ratio {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .well {
    width: 64px; /* justified literal — no width token for ratio fields */
    height: 40px;
  }

  .well input {
    width: 100%;
    height: 100%;
    background: var(--color-felt-deep);
    color: var(--color-text-on-felt);
    font: var(--font-value);
    border: var(--border-control);
    border-radius: var(--radius-sm);
    padding: 0 var(--space-3);
    text-align: center;
  }

  .well.filled input {
    border-color: var(--color-gold);
  }

  .sep {
    font: var(--font-value);
    color: var(--color-text-on-felt-dim);
  }

  input:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus);
    outline-offset: var(--focus-ring-offset);
  }
</style>
