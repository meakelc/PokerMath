<script lang="ts">
  import { appState } from '../appState.svelte'
  import { sections } from '../../content/sections'
  import type { Section } from '../../content/sections'
  import { cheatSheets } from '../../content/cheatsheets'
  import SidebarNavItem from './SidebarNavItem.svelte'

  function getSectionComplete(section: Section): boolean {
    if (section.id === 'equity')   return appState.assessments.lo1.passed
    if (section.id === 'pot-odds') return appState.assessments.lo2.passed
    if (section.id === 'calling')  return appState.assessments.lo3.passed
    return false
  }
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
        complete={getSectionComplete(section)}
        onselect={() => { appState.currentSection = i; appState.currentPage = 0 }}
      />
    {/each}
  </nav>

  <div class="sheets">
    <span class="navlabel">Cheat Sheets</span>
    {#each cheatSheets as sheet (sheet.id)}
      <button
        type="button"
        class="sheet"
        onclick={() => (appState.openCheatSheet = sheet.id)}
      >
        <span class="chevron" aria-hidden="true">›</span>
        {sheet.title}
      </button>
    {/each}
  </div>
</aside>

<style>
  .side {
    --color-focus: var(--color-sidebar-text);
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

  .sheets {
    margin-top: auto;
    border-top: 1px solid var(--color-sidebar-border);
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
  }

  .sheets .navlabel {
    margin-top: 0;
  }

  .sheet {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    text-align: left;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: none;
    border: 0;
    cursor: pointer;
    font: var(--font-caption);
    color: var(--color-sidebar-text);
  }

  .sheet:hover {
    background: var(--color-sidebar-active);
  }

  .chevron {
    color: var(--color-sidebar-text-dim);
    font-size: 1.1em;
    line-height: 1;
  }
</style>
