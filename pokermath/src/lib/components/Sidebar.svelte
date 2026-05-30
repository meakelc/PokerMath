<script lang="ts">
  import { appState } from '../appState.svelte'
  import { sections } from '../../content/sections'
  import SidebarNavItem from './SidebarNavItem.svelte'
</script>

<aside class="side">
  <span class="wordmark">PokerMath</span>

  <span class="navlabel">Sections</span>

  <nav class="nav" aria-label="Sections">
    {#each sections as section, i (section.id)}
      <SidebarNavItem
        title={section.title}
        subtitle={section.subtitle}
        active={i === appState.currentSection}
        onselect={() => (appState.currentSection = i)}
      />
    {/each}
  </nav>
</aside>

<style>
  .side {
    background: var(--color-sidebar);
    display: flex;
    flex-direction: column;
    padding: var(--space-content-pad);
  }

  .wordmark {
    font: var(--font-heading-sm);
    color: var(--color-sidebar-text);
    letter-spacing: var(--tracking-display-lg);
  }

  .navlabel {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    text-transform: uppercase;
    color: var(--color-sidebar-text-dim);
    margin-top: var(--space-8);
    margin-bottom: var(--space-2);
  }

  .nav {
    display: flex;
    flex-direction: column;
  }
</style>
