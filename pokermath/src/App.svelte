<script lang="ts">
  import { appState } from './lib/appState.svelte'
  import { sections } from './content/sections'
  import { sectionContent } from './content/sections/index'
  import Sidebar from './lib/components/Sidebar.svelte'
  import Pager from './lib/components/Pager.svelte'
  import InformationalScreen from './screens/InformationalScreen.svelte'

  const active = $derived(sections[appState.currentSection])
</script>

<div class="app">
  <Sidebar />

  <main class="main">
    {#if active.kind === 'informational' && sectionContent[active.id]}
      <InformationalScreen
        sectionId={active.id}
        title={active.title}
        subtitle={active.subtitle}
        content={sectionContent[active.id]!}
      />
    {:else}
      <!-- TEMPORARY: assessment Sections get their AssessmentScreen in Epic 3.
           Until then, keep the title + Pager so the shell stays navigable end-to-end. -->
      {#key active.id}
        <div class="section-head">
          <h1 class="section-title">{active.title}</h1>
          <p class="section-subtitle">{active.subtitle}</p>
        </div>
      {/key}
      <Pager />
    {/if}
  </main>
</div>

<div class="modal-layer"></div>

<style>
  .app {
    display: grid;
    grid-template-columns: 248px 1fr;
    height: 100vh;
  }

  .main {
    display: flex;
    flex-direction: column;
    background: var(--color-felt);
    padding: var(--space-content-pad);
  }

  .section-head {
    animation: section-fade var(--motion-fast) var(--motion-ease);
    animation-fill-mode: backwards;
  }

  @keyframes section-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .section-title {
    font: var(--font-display-lg);
    letter-spacing: var(--tracking-display-lg);
    color: var(--color-text-on-felt);
    margin: 0 0 var(--space-2) 0;
  }

  .section-subtitle {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt-dim);
    margin: 0;
  }

  .modal-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
</style>
