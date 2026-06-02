<script lang="ts">
  import { appState } from '../lib/appState.svelte'
  import { quizQuestions } from '../content/quiz'
  import type { QuizVariant } from '../content/quiz'
  import { scoreQuiz, computeGain } from '../lib/quiz/scoring'
  import { downloadQuizCsv } from '../lib/quiz/export'
  import QuizQuestion from '../lib/components/QuizQuestion.svelte'
  import Pager from '../lib/components/Pager.svelte'

  let {
    variant,
    title,
  }: {
    variant: QuizVariant
    title: string
  } = $props()

  const state = $derived(appState.quiz[variant])
  const allAnswered = $derived(state.answers.every((a) => a !== null))
  const score = $derived(state.submitted ? scoreQuiz(state.answers, quizQuestions) : null)

  const gain = $derived.by(() => {
    if (variant !== 'post' || appState.quiz.post.score === null) return null
    return computeGain(appState.quiz.pre.score, appState.quiz.post.score)
  })
  const preMissing = $derived(variant === 'post' && appState.quiz.pre.score === null)

  const loLabels = { lo1: 'LO1 · Equity', lo2: 'LO2 · Pot Odds', lo3: 'LO3 · Calling' } as const
  const los = ['lo1', 'lo2', 'lo3'] as const

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault()
    if (!allAnswered) return
    state.score = scoreQuiz(state.answers, quizQuestions).total
    state.submitted = true
  }

  function handleDownload(): void {
    downloadQuizCsv(
      {
        pre: { answers: appState.quiz.pre.answers, score: appState.quiz.pre.score },
        post: { answers: appState.quiz.post.answers, score: appState.quiz.post.score },
      },
      quizQuestions
    )
  }
</script>

<article class="screen">
  {#key variant}
    <div class="body">
      <header class="section-head">
        <span class="kicker">{variant === 'pre' ? 'Pre-Test' : 'Post-Test'} · Optional</span>
        <h1 class="section-title">{title}</h1>
        <p class="lede">
          {#if variant === 'pre'}
            Six quick questions to capture what you already know — before you start the lessons. It's
            optional; skip ahead any time using the navigation below.
          {:else}
            The same six questions. Take it after working through the lessons to measure your gain.
          {/if}
        </p>
      </header>

      <form class="quiz" onsubmit={handleSubmit}>
        {#each quizQuestions as q, i (q.id)}
          <QuizQuestion
            question={q}
            number={i + 1}
            bind:value={appState.quiz[variant].answers[i]}
            locked={state.submitted}
          />
        {/each}

        {#if !state.submitted}
          <button type="submit" class="submit" disabled={!allAnswered}>Submit answers</button>
        {/if}
      </form>

      {#if state.submitted && score}
        <section class="results" aria-live="polite">
          <h2 class="results-title">Your score: {score.total} / {quizQuestions.length}</h2>
          <p class="band">{score.interpretation}</p>

          <ul class="per-lo">
            {#each los as lo (lo)}
              <li class="lo-row">
                <span class="lo-label">{loLabels[lo]}</span>
                <span class="lo-score">{score.perLO[lo].correct} / {score.perLO[lo].total}</span>
              </li>
            {/each}
          </ul>

          {#if variant === 'post'}
            <div class="gain">
              {#if preMissing}
                <span class="gain-none">No pre-test on record — take the Pre-Test to measure your learning gain.</span>
              {:else if gain}
                <span class="gain-value" class:meaningful={gain.meaningful}>
                  Learning gain: {gain.delta >= 0 ? '+' : ''}{gain.delta}
                  (pre {appState.quiz.pre.score} → post {appState.quiz.post.score})
                </span>
                <span class="gain-flag">
                  {#if gain.meaningful}✓ meaningful gain
                  {:else if gain.delta < 0}your score decreased — no learning gain this session
                  {:else}below the 2-point meaningful threshold{/if}
                </span>
              {/if}
            </div>
          {/if}

          <button type="button" class="download" onclick={handleDownload}>Download results (.csv)</button>
        </section>
      {/if}
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

  .lede {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
    max-width: 60ch;
    margin: var(--space-2) 0 0;
  }

  .quiz {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .submit,
  .download {
    align-self: flex-start;
    font: var(--font-body-md);
    font-weight: 600;
    border-radius: var(--radius-sm);
    padding: var(--padding-button-primary);
    cursor: pointer;
    border: 0;
    background: var(--color-gold);
    color: var(--color-gold-ink);
    box-shadow: var(--shadow-button-primary);
  }

  .submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results {
    background: var(--color-felt-panel);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-panel);
    border: var(--border-hairline);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .results-title {
    font: var(--font-display-lg);
    letter-spacing: var(--tracking-display-lg);
    color: var(--color-text-on-felt);
    margin: 0;
  }

  .band {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
    margin: 0;
    max-width: 60ch;
  }

  .per-lo {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .lo-row {
    display: flex;
    justify-content: space-between;
    max-width: 320px; /* justified literal — compact breakdown column */
  }

  .lo-label {
    font: var(--font-label-caps);
    letter-spacing: var(--tracking-label-caps);
    text-transform: uppercase;
    color: var(--color-text-on-felt-dim);
  }

  .lo-score {
    font: var(--font-value);
    color: var(--color-text-on-felt);
  }

  .gain {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    border-top: var(--border-hairline);
    padding-top: var(--space-4);
  }

  .gain-value {
    font: var(--font-body-lg);
    color: var(--color-text-on-felt);
  }

  .gain-value.meaningful {
    color: var(--color-gold);
  }

  .gain-flag,
  .gain-none {
    font: var(--font-caption);
    color: var(--color-text-on-felt-dim);
  }
</style>
