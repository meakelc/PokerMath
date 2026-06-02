---
title: 'Optional Pre/Post-Test Assessment'
type: 'feature'
created: '2026-06-02'
status: 'done'
baseline_commit: '50de61ddd981b9b469b1e14563745157a030b4ce'
context:
  - '{project-root}/docs/learning-objectives-and-assessment.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The tool teaches three LOs but offers no instrument to measure whether learners actually gained knowledge, so its effectiveness can't be evaluated.

**Approach:** Add two optional, identical 6-question multiple-choice quizzes (the exact questions in `docs/learning-objectives-and-assessment.md`) as bookend sidebar sections — "Pre-Test" at the top, "Post-Test" at the bottom. On submit, show total score, a per-LO breakdown, the doc's interpretation band, and (post-test) the pre→post learning gain. Offer a CSV download of results so data can be collected across learners. Pre-test score is held in memory for the session.

## Boundaries & Constraints

**Always:**
- Quiz questions, answer choices, correct answers, and interpretation bands come verbatim from `docs/learning-objectives-and-assessment.md`. Two questions per LO.
- Both quizzes are optional and fully skippable; the existing 4-section lesson flow and its interactive assessments are unchanged.
- Cold start still lands on Introduction (not the Pre-Test).
- Reuse existing design tokens, the `Pager`, and `LO` type. New components match the existing Svelte 5 (`$state`/`$props`/`$derived`) + token conventions.
- Submit is gated until all 6 questions are answered (mirror existing `canSubmit`).
- Per-administration quiz state is in-memory only (cleared on reload), consistent with the app's no-persistence design.

**Ask First:**
- Adding any persistence layer (localStorage/backend) — out of scope unless renegotiated.
- Shuffling question/answer order between administrations — deferred; ship static order.

**Never:**
- Do not alter the existing LO1–LO3 interactive assessments, validation engine, or hint ladders.
- Do not force the pre-test (no hard gate/redirect).
- Correct answers must not all share one position; vary correct index across the six questions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Submit pre-test, all answered | 6 selections | Score X/6 + per-LO (n/2 each) + interpretation band; no gain shown | N/A |
| Submit post-test after pre-test | 6 selections, pre score in memory | Score + per-LO + interpretation + gain (post−pre) with "meaningful" flag when ≥2 | N/A |
| Submit post-test, no pre on record | pre score null | Score shown; gain section reads "no pre-test on record" | N/A |
| Unanswered questions | <6 selections | Submit disabled | N/A |
| Download CSV | a quiz submitted | Triggers `.csv` download of per-question rows + summary (pre/post/gain) | Button only present after submit |
| Reload page | any | All quiz state blank | N/A |

</frozen-after-approval>

## Code Map

- `pokermath/src/content/quiz.ts` -- NEW. The 6 typed questions (id, lo, prompt, 4 options, correctIndex), verbatim copy; varied correct positions.
- `pokermath/src/lib/quiz/scoring.ts` -- NEW. Pure: `scoreQuiz(answers, questions)` → {total, perLO, interpretation}; `computeGain(pre, post)`.
- `pokermath/src/lib/quiz/export.ts` -- NEW. Pure `buildQuizCsv(state, questions)` + impure `downloadQuizCsv()` (Blob + anchor).
- `pokermath/src/lib/components/QuizQuestion.svelte` -- NEW. One MC question as accessible radio group (fieldset/legend), bindable selection.
- `pokermath/src/screens/QuizScreen.svelte` -- NEW. `variant: 'pre'|'post'`; renders questions, gated submit, results panel, download button, `Pager`.
- `pokermath/src/content/sections.ts` -- add `'quiz'` PageKind, `'pre-test'`/`'post-test'` SectionId + bookend entries.
- `pokermath/src/lib/appState.svelte.ts` -- add `quiz` slice (pre/post: answers[6], submitted, score); keep cold start on Introduction.
- `pokermath/src/App.svelte` -- route `currentPageKind === 'quiz'` → `QuizScreen` with variant from section id.
- `pokermath/src/lib/components/Sidebar.svelte` -- `getSectionComplete` marks a quiz section complete once submitted.
- `pokermath/src/content/sections.test.ts` -- update assertions for the new section list/order.

## Tasks & Acceptance

**Execution:**
- [x] `pokermath/src/content/quiz.ts` -- author the 6 questions + types from the doc; vary correctIndex across A–D.
- [x] `pokermath/src/content/quiz.test.ts` -- assert 6 questions, exactly 2 per LO, every `correctIndex` in 0–3 with 4 options, and that correct positions are not all identical.
- [x] `pokermath/src/lib/quiz/scoring.ts` + `scoring.test.ts` -- pure scoring & gain; cover all-correct, all-wrong, mixed, per-LO tallies, and the three interpretation bands; gain meaningful at ≥2.
- [x] `pokermath/src/lib/quiz/export.ts` + `export.test.ts` -- `buildQuizCsv` produces a header, one row per question (id, lo, chosen, correct, isCorrect), and a summary (pre, post, gain); unit-test the pure builder only.
- [x] `pokermath/src/lib/components/QuizQuestion.svelte` -- accessible radio group; arrow/keyboard operable; bound to a question's selection.
- [x] `pokermath/src/screens/QuizScreen.svelte` -- compose questions; disable submit until all answered; on submit compute & store score and render results + download.
- [x] `pokermath/src/lib/appState.svelte.ts` -- add quiz state; preserve Introduction as cold-start section.
- [x] `pokermath/src/content/sections.ts` -- add quiz PageKind/SectionIds + bookend sections.
- [x] `pokermath/src/App.svelte` -- add quiz routing branch.
- [x] `pokermath/src/lib/components/Sidebar.svelte` -- completion dot when a quiz is submitted.
- [x] `pokermath/src/content/sections.test.ts` -- update to the new section order (pre-test first, post-test last; Introduction is cold start).

**Acceptance Criteria:**
- Given a fresh load, when the app starts, then the active screen is Introduction and the sidebar shows Pre-Test above it and Post-Test below Calling Profitably.
- Given the Pre-Test with all 6 questions answered, when I submit, then I see total score, a per-LO breakdown (n/2 per LO), and the matching interpretation band.
- Given I completed the Pre-Test then submit the Post-Test, when results render, then a learning gain (post−pre) is shown and flagged "meaningful" only when the gain is ≥2.
- Given fewer than 6 answers selected, when I view the submit control, then it is disabled.
- Given a submitted quiz, when I click Download, then a CSV with per-question rows and a pre/post/gain summary is downloaded.
- Given any submitted quiz, when I reload, then all quiz selections and scores are cleared.

## Design Notes

Quiz is a third screen archetype alongside informational/assessment — distinct from the existing interactive LO assessments (which stay untouched). `QuizScreen` reads/writes `appState.quiz[variant]`; the post variant reads `appState.quiz.pre.score` for the gain. Keep scoring and CSV building pure (testable); only the download trigger touches the DOM. Bookend ordering means `sections` becomes `[pre-test, intro, equity, pot-odds, calling, post-test]`; cold-start index is resolved to Introduction's position rather than array index 0.

## Verification

**Commands:**
- `npm test` (in `pokermath/`) -- expected: all suites pass, including new quiz scoring/export/data tests.
- `npm run check` (in `pokermath/`) -- expected: no svelte-check or tsc errors.
- `npm run build` (in `pokermath/`) -- expected: clean production build.

**Manual checks:**
- Load app → Introduction active; Pre-Test/Post-Test present as first/last sidebar entries.
- Complete Pre-Test (varied answers) → score/per-LO/band correct; complete Post-Test → gain shown; Download yields a CSV with the expected rows; reload clears state.

## Suggested Review Order

**Feature shape — how it plugs in**

- New `quiz` PageKind + optional bookend sections define the whole archetype.
  [`sections.ts:14`](../../pokermath/src/content/sections.ts#L14)
- Cold start resolves to Introduction, not the Pre-Test (quizzes never force themselves).
  [`sections.ts:52`](../../pokermath/src/content/sections.ts#L52)
- Router branch dispatches quiz sections to `QuizScreen` by variant.
  [`App.svelte:37`](../../pokermath/src/App.svelte#L37)
- In-memory pre/post slice; blank-initialized so reload clears it.
  [`appState.svelte.ts:34`](../../pokermath/src/lib/appState.svelte.ts#L34)

**Domain core — questions, scoring, export**

- The six questions verbatim, with correct answer placed at a varied position.
  [`quiz.ts:23`](../../pokermath/src/content/quiz.ts#L23)
- Pure scoring: total, per-LO tally, interpretation band.
  [`scoring.ts:28`](../../pokermath/src/lib/quiz/scoring.ts#L28)
- Pure learning gain; null when no pre-test, meaningful at ≥2.
  [`scoring.ts:48`](../../pokermath/src/lib/quiz/scoring.ts#L48)
- CSV builder: per-question rows + pre/post/gain summary; quote-escaping for comma'd options.
  [`export.ts:59`](../../pokermath/src/lib/quiz/export.ts#L59)

**UI**

- Gated submit, results panel, gain copy, download trigger.
  [`QuizScreen.svelte:31`](../../pokermath/src/screens/QuizScreen.svelte#L31)
- Accessible radio group — native radios give arrow-key group nav for free.
  [`QuizQuestion.svelte:27`](../../pokermath/src/lib/components/QuizQuestion.svelte#L27)
- Sidebar completion dot once a quiz is submitted.
  [`Sidebar.svelte:12`](../../pokermath/src/lib/components/Sidebar.svelte#L12)

**Tests (peripheral)**

- Data integrity, scoring bands/gain, CSV builder, and updated section-order assertions.
  [`scoring.test.ts:1`](../../pokermath/src/lib/quiz/scoring.test.ts#L1)
