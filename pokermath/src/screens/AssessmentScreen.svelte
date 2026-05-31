<script lang="ts">
  import { appState } from '../lib/appState.svelte'
  import { validate } from '../lib/assessment/validation'
  import type { SubmittedAnswers } from '../lib/assessment/validation'
  import { selectHint } from '../lib/assessment/hints'
  import { hintLadders } from '../content/hintLadders'
  import { assessments } from '../content/scenarios'
  import CardGroup from '../lib/components/CardGroup.svelte'
  import Pager from '../lib/components/Pager.svelte'
  import NumericInput from '../lib/components/NumericInput.svelte'
  import RatioInput from '../lib/components/RatioInput.svelte'
  import CheckAnswerButton from '../lib/components/CheckAnswerButton.svelte'
  import type { SectionId } from '../content/sections'
  import type { Scenario, AnswerKey } from '../lib/assessment/types'

  let {
    sectionId,
    title,
    subtitle,
    scenario,
    answer,
  }: {
    sectionId: SectionId
    title: string
    subtitle: string
    scenario: Scenario
    answer: AnswerKey
  } = $props()

  const canSubmit = $derived.by(() => {
    if (scenario.lo === 'lo1') {
      const f = appState.assessments.lo1.fields
      return f.outs !== '' && f.streets !== '' && f.equity !== ''
    }
    if (scenario.lo === 'lo2') {
      const f = appState.assessments.lo2.fields
      return f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
    }
    if (scenario.lo === 'lo3') {
      // decision (CallFoldToggle) excluded — added in Story 3.8
      const f = appState.assessments.lo3.fields
      return f.equity !== '' && f.ratio[0] !== '' && f.ratio[1] !== '' && f.requiredEquity !== ''
    }
    return false
  })

  function buildSubmitted(lo: 'lo1' | 'lo2' | 'lo3'): SubmittedAnswers {
    if (lo === 'lo1') {
      const f = appState.assessments.lo1.fields
      return { outs: f.outs, streets: f.streets, equity: f.equity }
    }
    if (lo === 'lo2') {
      const f = appState.assessments.lo2.fields
      return { ratio: f.ratio as [string, string], requiredEquity: f.requiredEquity }
    }
    // lo3
    const f = appState.assessments.lo3.fields
    return {
      equity: f.equity,
      ratio: f.ratio as [string, string],
      requiredEquity: f.requiredEquity,
      // decision excluded until Story 3.8 wires CallFoldToggle
    }
  }

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault()
    if (!canSubmit) return

    const lo = scenario.lo
    const submitted = buildSubmitted(lo)
    const result = validate(answer, submitted)

    // Math.max(0,...) clamp for negative prev.rung — deferred-work.md:6
    const rawPrev = appState.assessments[lo].hint
    const prev = rawPrev ? { ...rawPrev, rung: Math.max(0, rawPrev.rung) } : null
    const hint = result.passed ? null : selectHint(hintLadders[lo], scenario, answer, submitted, prev)

    appState.assessments[lo].result = result
    appState.assessments[lo].hint = hint
    appState.assessments[lo].passed = result.passed
  }
</script>

<article class="screen">
  {#key sectionId}
    <div class="body">
      <header class="section-head">
        <span class="kicker">Assessment</span>
        <h1 class="section-title">{title}</h1>
      </header>

      <!-- Card region — hidden when hand is empty (LO2 has no hand/board) — deferred-work.md:23 -->
      {#if scenario.hand.length > 0}
        <div class="card-region">
          <CardGroup cards={scenario.board} label="Board" />
          <CardGroup cards={scenario.hand} label="Hand" />
        </div>
      {/if}

      <p class="prompt">{scenario.prompt}</p>

      <form class="panel" onsubmit={handleSubmit}>
        <!-- LO1 fields -->
        {#if scenario.lo === 'lo1'}
          <div class="fields">
            <div class="field-row">
              <label for="outs" class="field-label">Outs</label>
              <NumericInput
                id="outs"
                label="Number of outs"
                bind:value={appState.assessments.lo1.fields.outs}
              />
            </div>
            <div class="field-row">
              <label for="streets" class="field-label">Streets remaining</label>
              <NumericInput
                id="streets"
                label="Streets remaining"
                bind:value={appState.assessments.lo1.fields.streets}
              />
            </div>
            <div class="field-row">
              <label for="equity" class="field-label">Your equity</label>
              <NumericInput
                id="equity"
                label="Your equity percentage"
                suffix="%"
                bind:value={appState.assessments.lo1.fields.equity}
              />
            </div>
          </div>
        {/if}

        <!-- LO2 fields -->
        {#if scenario.lo === 'lo2'}
          <div class="fields">
            <div class="field-row">
              <span class="field-label">Pot odds</span>
              <RatioInput
                bind:antecedent={appState.assessments.lo2.fields.ratio[0]}
                bind:consequent={appState.assessments.lo2.fields.ratio[1]}
              />
            </div>
            <div class="field-row">
              <label for="requiredEquity" class="field-label">Required equity</label>
              <NumericInput
                id="requiredEquity"
                label="Required equity percentage"
                suffix="%"
                bind:value={appState.assessments.lo2.fields.requiredEquity}
              />
            </div>
          </div>
        {/if}

        <!-- LO3 fields -->
        {#if scenario.lo === 'lo3'}
          <div class="fields">
            <div class="field-row">
              <label for="lo3-equity" class="field-label">Your equity</label>
              <NumericInput
                id="lo3-equity"
                label="Your equity percentage"
                suffix="%"
                bind:value={appState.assessments.lo3.fields.equity}
              />
            </div>
            <div class="field-row">
              <span class="field-label">Pot odds</span>
              <RatioInput
                bind:antecedent={appState.assessments.lo3.fields.ratio[0]}
                bind:consequent={appState.assessments.lo3.fields.ratio[1]}
              />
            </div>
            <div class="field-row">
              <label for="lo3-requiredEquity" class="field-label">Required equity</label>
              <NumericInput
                id="lo3-requiredEquity"
                label="Required equity percentage"
                suffix="%"
                bind:value={appState.assessments.lo3.fields.requiredEquity}
              />
            </div>
            <!-- CallFoldToggle: Story 3.8 -->
          </div>
        {/if}

        <!-- Feedback row slot — FeedbackRow rendered here in Story 3.5 -->

        <CheckAnswerButton disabled={!canSubmit} />
      </form>
    </div>
  {/key}

  <Pager />
</article>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-section-gap);
    animation: section-fade var(--motion-fast) var(--motion-ease);
    animation-fill-mode: backwards;
  }

  @keyframes section-fade { from { opacity: 0; } to { opacity: 1; } }

  .section-head {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .kicker {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    text-transform: uppercase;
    color: var(--color-text-on-felt-dim);
  }

  .section-title {
    font: var(--font-display-lg);
    letter-spacing: var(--tracking-display-lg);
    color: var(--color-text-on-felt);
    margin: 0;
  }

  .card-region {
    display: flex;
    gap: var(--space-8);
  }

  .prompt {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
    max-width: 60ch; /* justified literal — same cap as InformationalScreen prose; no token for 60ch */
    margin: 0;
  }

  .panel {
    background: var(--color-felt-panel);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-panel);
    border: var(--border-hairline);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .field-label {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    text-transform: uppercase;
    color: var(--color-text-on-felt-dim);
    min-width: 160px; /* justified literal — no token for label column width */
  }
</style>
