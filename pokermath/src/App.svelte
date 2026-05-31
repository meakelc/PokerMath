<script lang="ts">
  import { appState } from './lib/appState.svelte'
  import { sections } from './content/sections'
  import { sectionContent } from './content/sections/index'
  import { cheatSheets } from './content/cheatsheets'
  import Sidebar from './lib/components/Sidebar.svelte'
  import InformationalScreen from './screens/InformationalScreen.svelte'
  import AssessmentScreen from './screens/AssessmentScreen.svelte'
  import CheatSheetModal from './lib/components/CheatSheetModal.svelte'
  import { cheatSheetContent } from './content/cheatsheets/index'
  import { assessments } from './content/scenarios'
  import type { ScenarioWithKey } from './content/scenarios'

  const active = $derived(sections[appState.currentSection])
  const openSheet = $derived(cheatSheets.find((s) => s.id === appState.openCheatSheet))

  type AssessmentSectionId = 'equity' | 'pot-odds' | 'calling'
  const assessmentScenarios: Record<AssessmentSectionId, ScenarioWithKey> = {
    equity: assessments.lo1,
    'pot-odds': assessments.lo2,
    calling: assessments.lo3,
  }
</script>

<div class="app">
  <Sidebar />

  <main class="main">
    {#if active.kind === 'assessment'}
      {@const asmEntry = assessmentScenarios[active.id as AssessmentSectionId]}
      {#if asmEntry}
        <AssessmentScreen
          sectionId={active.id}
          title={active.title}
          subtitle={active.subtitle}
          scenario={asmEntry.scenario}
          answer={asmEntry.answer}
          content={sectionContent[active.id]}
        />
      {/if}
    {:else if sectionContent[active.id]}
      <InformationalScreen
        sectionId={active.id}
        title={active.title}
        subtitle={active.subtitle}
        content={sectionContent[active.id]!}
      />
    {/if}
  </main>
</div>

<div class="modal-layer">
  {#if openSheet}
    {#key openSheet.id}
      {@const SheetContent = cheatSheetContent[openSheet.id]}
      <CheatSheetModal title={openSheet.title} onclose={() => (appState.openCheatSheet = null)}>
        <SheetContent />
      </CheatSheetModal>
    {/key}
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

  .modal-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }
</style>
