<script lang="ts">
  import type { Component } from 'svelte'
  import Pager from '../lib/components/Pager.svelte'
  import type { SectionId } from '../content/sections'

  let {
    sectionId,
    title,
    subtitle,
    content: Content,
  }: {
    sectionId: SectionId
    title: string
    subtitle: string
    content: Component
  } = $props()
</script>

<article class="screen">
  {#key sectionId}
    <div class="body">
      <header class="section-head">
        <h1 class="section-title">{title}</h1>
        <p class="section-subtitle">{subtitle}</p>
      </header>
      <div class="prose">
        <Content />
      </div>
    </div>
  {/key}
  <Pager />
</article>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;            /* fill the felt .main column so Pager margin-top:auto pins to the bottom */
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-section-gap);   /* heading → content rhythm (24px) */
    animation: section-fade var(--motion-fast) var(--motion-ease);
    animation-fill-mode: backwards;
  }

  @keyframes section-fade { from { opacity: 0; } to { opacity: 1; } }

  .section-head { display: flex; flex-direction: column; gap: var(--space-2); }

  .section-title {
    font: var(--font-display-lg);
    letter-spacing: var(--tracking-display-lg);
    color: var(--color-text-on-felt);
    margin: 0;
  }

  .section-subtitle {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt-dim);
    margin: 0;
  }

  .prose {
    max-width: 60ch;           /* justified literal — DESIGN.md caps prose at ~60ch; no token exists. ch unit is the typographic measure, not a hex/size that has a token. */
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
  }
</style>
