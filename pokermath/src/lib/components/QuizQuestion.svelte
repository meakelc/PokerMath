<script lang="ts">
  import type { QuizQuestion } from '../../content/quiz'

  let {
    question,
    number,
    value = $bindable(null as number | null),
    locked = false,
  }: {
    question: QuizQuestion
    number: number
    value?: number | null
    locked?: boolean
  } = $props()

  const letters = ['A', 'B', 'C', 'D'] as const
  const name = $derived(`quiz-${question.id}`)
</script>

<fieldset class="question" disabled={locked}>
  <legend class="legend"><span class="num">{number}.</span> {question.prompt}</legend>
  <div class="options">
    {#each question.options as option, i (i)}
      <label class="option" class:selected={value === i}>
        <input
          class="radio"
          type="radio"
          {name}
          value={i}
          checked={value === i}
          onchange={() => (value = i)}
        />
        <span class="marker" aria-hidden="true">{letters[i]}</span>
        <span class="text">{option}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .question {
    border: 0;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .legend {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
    max-width: 60ch; /* justified literal — same prose cap used across screens */
    padding: 0;
  }

  .num {
    font-weight: 600;
    color: var(--color-gold);
    margin-right: var(--space-2);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .option {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-sm);
    border: var(--border-ghost);
    cursor: pointer;
    color: var(--color-text-on-felt);
    font: var(--font-body-md);
  }

  .option:hover {
    background: var(--color-felt-panel);
  }

  .option.selected {
    background: var(--color-gold);
    color: var(--color-gold-ink);
    border-color: transparent;
  }

  .option.selected .marker {
    color: var(--color-gold-ink);
  }

  /* Native radio drives selection + arrow-key group nav; visually minimal. */
  .radio {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .marker {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    color: var(--color-text-on-felt-dim);
    min-width: 1.5em;
    flex-shrink: 0;
  }

  .text {
    flex: 1 1 auto;
  }

  .option:has(.radio:focus-visible) {
    outline: var(--focus-ring-width) solid var(--color-gold);
    outline-offset: var(--focus-ring-offset);
  }

  .question[disabled] .option {
    cursor: default;
  }
</style>
