<script lang="ts">
  let {
    value = $bindable(''),
    suffix = '',
    label,
    id,
  }: { value?: string; suffix?: string; label: string; id: string } = $props()

  function handleInput(e: Event) {
    const el = e.target as HTMLInputElement
    const cleaned = el.value.replace(/[^0-9.]/g, '')
    if (cleaned !== el.value) el.value = cleaned
    value = cleaned
  }
</script>

<div class="field" class:filled={value !== ''}>
  <input
    {id}
    type="text"
    inputmode="decimal"
    autocomplete="off"
    aria-label={label}
    {value}
    oninput={handleInput}
  />
  {#if suffix}
    <span class="suffix" aria-hidden="true">{suffix}</span>
  {/if}
</div>

<style>
  .field {
    display: flex;
    align-items: center;
    position: relative;
    --control-height: 40px;
    height: var(--control-height);
  }

  .field input {
    flex: 1 1 auto;
    background: var(--color-felt-deep);
    color: var(--color-text-on-felt);
    font: var(--font-value);
    border: var(--border-control);
    border-radius: var(--radius-sm);
    height: 100%;
    padding: 0 var(--space-3);
  }

  .field input:has(~ .suffix) {
    padding-right: calc(var(--space-3) * 3);
  }

  .field.filled input {
    border-color: var(--color-gold);
  }

  .suffix {
    position: absolute;
    right: var(--space-3);
    font: var(--font-value);
    color: var(--color-text-on-felt-dim);
    pointer-events: none;
  }

  input:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus);
    outline-offset: var(--focus-ring-offset);
  }
</style>
