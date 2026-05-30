<script lang="ts">
  import { appState } from './lib/appState.svelte'
  import { sections } from './content/sections'
  import Sidebar from './lib/components/Sidebar.svelte'
  import Pager from './lib/components/Pager.svelte'

  const active = $derived(sections[appState.currentSection])
</script>

<div class="app">
  <Sidebar />

  <main class="main">
    {#key active.id}
      <div class="section-head">
        <h1 class="section-title">{active.title}</h1>
        <p class="section-subtitle">{active.subtitle}</p>
      </div>
    {/key}
    <Pager />
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
