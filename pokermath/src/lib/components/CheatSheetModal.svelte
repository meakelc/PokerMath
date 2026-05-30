<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    onclose,
    children,
  }: {
    title: string
    onclose: () => void
    children: Snippet
  } = $props()

  let closeButton: HTMLButtonElement

  $effect(() => {
    closeButton?.focus()
  })
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') onclose() }} />

<div
  class="scrim"
  role="presentation"
  onclick={(e) => { if (e.target === e.currentTarget) onclose() }}
>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cs-title"
  >
    <header class="header">
      <h3 class="title" id="cs-title">{title}</h3>
      <button
        bind:this={closeButton}
        type="button"
        class="x"
        aria-label="Close"
        onclick={onclose}
      >✕</button>
    </header>

    <div class="body">
      {@render children()}
    </div>

    <footer class="footer">
      <span>Press <kbd>Esc</kbd> or click outside to close</span>
    </footer>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: var(--color-scrim);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    animation: modal-fade var(--motion-fast) var(--motion-ease);
    animation-fill-mode: backwards;
  }

  @keyframes modal-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .modal {
    background: var(--color-card-face);
    color: var(--color-sidebar-text);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-modal);
    width: min(560px, 90vw);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-sidebar-border);
  }

  .title {
    font: var(--font-heading-sm);
    color: var(--color-felt);
    margin: 0;
  }

  .x {
    background: none;
    border: 1px solid var(--color-sidebar-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font: var(--font-body-md);
    color: var(--color-sidebar-text-dim);
    line-height: 1;
    padding: var(--space-1) var(--space-2);
  }

  .body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }

  .footer {
    padding: var(--space-3) var(--space-6);
    border-top: 1px solid var(--color-sidebar-border);
    font: var(--font-caption);
    color: var(--color-sidebar-text-dim);
  }

  kbd {
    font: var(--font-caption);
    background: var(--color-sidebar);
    border: 1px solid var(--color-sidebar-border);
    border-radius: var(--radius-sm);
    padding: 1px 4px;
  }
</style>
