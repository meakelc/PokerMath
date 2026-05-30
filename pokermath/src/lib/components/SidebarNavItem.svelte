<script lang="ts">
  let {
    title,
    subtitle,
    active = false,
    complete = false,
    onselect,
  }: {
    title: string
    subtitle: string
    active?: boolean
    complete?: boolean
    onselect: () => void
  } = $props()
</script>

<button
  type="button"
  class="item"
  class:active
  class:done={complete}
  aria-current={active ? 'step' : undefined}
  onclick={onselect}
>
  <span class="t">{title}</span>
  <span class="s">{subtitle}</span>
</button>

<style>
  .item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    text-align: left;
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    background: none;
    border: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }

  .t {
    font: var(--font-body-md);
    font-weight: 500;
    color: var(--color-sidebar-text);
  }

  .s {
    font: var(--font-caption);
    color: var(--color-sidebar-text-dim);
  }

  .item.active {
    background: var(--color-sidebar-active);
  }

  .item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 2px;
    background: var(--color-gold);
  }

  .item.active .t {
    color: var(--color-felt);
    font-weight: 600;
  }

  .item.done .t::after {
    content: ' ✓';
    color: var(--color-gold-deep);
  }
</style>
