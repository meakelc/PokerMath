<script lang="ts">
  import { appState } from './lib/appState.svelte'
  import { sections } from './content/sections'
  import { sectionContent } from './content/sections/index'
  import { cheatSheets } from './content/cheatsheets'
  import Sidebar from './lib/components/Sidebar.svelte'
  import Pager from './lib/components/Pager.svelte'
  import InformationalScreen from './screens/InformationalScreen.svelte'
  import CheatSheetModal from './lib/components/CheatSheetModal.svelte'

  const active = $derived(sections[appState.currentSection])
  const openSheet = $derived(cheatSheets.find((s) => s.id === appState.openCheatSheet))
</script>

<div class="app">
  <Sidebar />

  <main class="main">
    {#if sectionContent[active.id]}
      <InformationalScreen
        sectionId={active.id}
        title={active.title}
        subtitle={active.subtitle}
        content={sectionContent[active.id]!}
      />
    {:else}
      <!-- TEMPORARY: Sections with no content component registered yet.
           Epic 3 replaces this with AssessmentScreen for assessment-kind sections. -->
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

<div class="modal-layer">
  {#if openSheet}
    <CheatSheetModal title={openSheet.title} onclose={() => (appState.openCheatSheet = null)}>
      <!-- TEMPORARY (Story 2.7): real sheet content arrives in Story 2.8.
           2.8 replaces this with the registered content component for openSheet.id. -->
      <p class="cs-placeholder">This reference sheet is coming together — its content arrives shortly.</p>
    </CheatSheetModal>
  {/if}
</div>

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

  .cs-placeholder {
    font: var(--font-body-md);
    color: var(--color-sidebar-text-dim);
    margin: 0;
  }
</style>
