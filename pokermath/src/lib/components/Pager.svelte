<script lang="ts">
  import { onMount } from 'svelte'
  import { appState } from '../appState.svelte'
  import { sections } from '../../content/sections'

  let { scrollHint = false }: { scrollHint?: boolean } = $props()

  const section = $derived(sections[appState.currentSection])
  const hasBack = $derived(appState.currentPage > 0 || appState.currentSection > 0)
  const hasNext = $derived(
    appState.currentPage < section.pageKinds.length - 1 ||
    appState.currentSection < sections.length - 1
  )

  function back() {
    if (appState.currentPage > 0) {
      appState.currentPage -= 1
    } else if (appState.currentSection > 0) {
      appState.currentSection -= 1
      appState.currentPage = sections[appState.currentSection].pageKinds.length - 1
    }
  }

  function next() {
    if (appState.currentPage < section.pageKinds.length - 1) {
      appState.currentPage += 1
    } else if (appState.currentSection < sections.length - 1) {
      appState.currentSection += 1
      appState.currentPage = 0
    }
  }

  let pagerEl = $state<HTMLElement | undefined>(undefined)
  let belowFold = $state(false)

  $effect(() => {
    // Reset on navigation so stale arrow doesn't carry over to the new section/page
    const _s = appState.currentSection
    const _p = appState.currentPage
    belowFold = false
  })

  onMount(() => {
    if (!scrollHint || !pagerEl) return
    const observer = new IntersectionObserver((entries) => {
      belowFold = !entries[0].isIntersecting
    })
    observer.observe(pagerEl)
    return () => observer.disconnect()
  })

  function scrollToPager() {
    pagerEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
</script>

<nav class="pager" aria-label="Section pager" bind:this={pagerEl}>
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

{#if scrollHint}
  <button
    type="button"
    class="scroll-arrow"
    class:visible={belowFold && (hasNext || hasBack)}
    aria-label="Scroll to navigation"
    onclick={scrollToPager}
  ><span aria-hidden="true">↓</span></button>
{/if}

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

  .scroll-arrow {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: var(--color-gold);
    color: var(--color-gold-ink);
    border: 0;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-button-primary);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--motion-fast) var(--motion-ease),
                visibility var(--motion-fast) var(--motion-ease);
  }

  .scroll-arrow.visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-arrow {
      transition: none;
    }
  }
</style>
