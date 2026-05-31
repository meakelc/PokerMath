<script lang="ts">
  let { disabled }: { disabled: boolean } = $props()
</script>

<button type="submit" class="btn" {disabled}>Check Answer</button>

<style>
  .btn {
    background: var(--color-gold);
    color: var(--color-gold-ink);
    font: var(--font-body-md);
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: var(--padding-button-primary);
    border: 0;
    cursor: pointer;
    box-shadow: var(--shadow-button-primary);
  }

  .btn:disabled {
    opacity: 0.38; /* standard disabled convention — no dedicated token (DESIGN.md §Components) */
    cursor: not-allowed;
    box-shadow: none;
  }
</style>
