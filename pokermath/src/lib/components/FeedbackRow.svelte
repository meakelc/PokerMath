<script lang="ts">
  let {
    passed = null,
    hintText = null,
    successMessage = 'Well done — your answer is correct.',
  }: {
    passed?: boolean | null
    hintText?: string | null
    successMessage?: string
  } = $props()
</script>

{#if passed === false}
  <div class="row hint" role="alert">
    <span class="glyph" aria-hidden="true">!</span>
    <p class="message">{hintText ?? 'Check your answer and try again.'}</p>
  </div>
{:else if passed === true}
  <div class="row success" role="alert">
    <span class="glyph" aria-hidden="true">✓</span>
    <p class="message">{successMessage}</p>
  </div>
{/if}

<style>
  .row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    animation: feedback-fade var(--motion-fast) var(--motion-ease);
    animation-fill-mode: backwards;
  }

  .row.hint {
    background: var(--color-hint-tint);
    border: 1px solid var(--color-hint);
  }

  .row.success {
    background: var(--color-success-tint);
    border: 1px solid var(--color-success);
  }

  .glyph {
    font: var(--font-value);
    flex-shrink: 0;
    margin-top: 1px; /* optical alignment with message first line — no token for 1px nudge */
  }

  .row.hint .glyph { color: var(--color-hint); }
  .row.success .glyph { color: var(--color-success); }

  .message {
    font: var(--font-body-md);
    color: var(--color-text-on-felt);
    margin: 0;
  }

  @keyframes feedback-fade {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @media (prefers-reduced-motion: reduce) {
    .row { animation: none; }
  }
</style>
