---
title: "PokerMath PRD"
status: final
created: 2026-05-28
updated: 2026-05-28
---

# PRD: PokerMath

## 0. Document Purpose

This PRD is the build specification for PokerMath, a solo academic term project (HCI 520). Its reader is the builder (Meakel) and, downstream, the UX and implementation work that follows. It builds on two existing artifacts and does not duplicate them: the **Product Brief** (`_bmad-output/planning-artifacts/briefs/brief-PokerMath-2026-05-28/brief.md`) for vision and scope, and the **Design Specifications** PDF (`HCI 520 Term Project Design Specifications-2.pdf`) for the teaching outline, assessment examples, and wireframes. Vocabulary is anchored in the Glossary (§3); features are grouped with globally numbered FRs nested under them; assumptions are tagged inline and indexed in §12. The graded deliverable is the interactive system itself — this PRD is planning input, not a graded artifact.

## 1. Vision

PokerMath is a 15-to-30-minute, single-session web learning system that teaches the mathematical foundations of profitable poker decisions. It covers three tightly scoped, sequentially dependent concepts — hand equity estimation, pot odds calculation, and call profitability judgment — and treats the *mathematics* as the goal and poker as the context, not the reverse.

The product exists to bridge a specific failure of transfer: learners meet expected value and probability in abstract classroom settings (coins, dice, urns) and never recognize them in the wild. Poker is an unusually good transfer domain — the math governs real decisions, wrong answers carry visible consequences, and the surface is culturally familiar enough to engage without deep prior expertise. For a learner who has seen expected value on a whiteboard and never seen it matter, watching expected value decide a $40 call changes their relationship to the concept.

Success is a learner who, in one unaided sitting, can estimate a hand's equity with the Rule of 2-and-4, compute pot odds, and judge whether a call is profitable — and articulate why.

## 2. Target User

### 2.1 Jobs To Be Done
- **Functional:** "Give me a concrete, real-stakes context where probability and expected-value reasoning actually decide something, so the abstract math finally clicks."
- **Functional:** "Let me practice computing equity and pot odds by hand and find out immediately whether I got it right."
- **Contextual:** "I'm in a course where applying concepts outside the classroom is the point; I need a self-contained experience I can finish in one sitting."
- **Emotional:** "Show me that this math isn't just academic — let me feel a wrong answer cost something."
- **(Builder's JTBD):** "Ship a focused, pedagogically sound interactive learning system that demonstrates Bloom-aligned instructional design for HCI 520."

### 2.2 Non-Users (v1)
- **Poker players seeking to improve their game.** A real and acknowledged audience, but explicitly *not* the v1 design target. PokerMath teaches the math through poker; it is not a poker-strategy trainer. This audience is served by the future drill-mode vision, not this version.
- **Learners with no exposure to Texas Hold 'Em who are unwilling to use the cheat sheets.** The system scaffolds prerequisites on demand but does not teach poker from zero as a primary path.

### 2.3 Key User Journeys

*Single primary journey; the product is linear and single-session, so one narrated walkthrough carries the experience.*

> **UJ-1. Sam, a stats student, finally sees expected value bite.**
> Sam has taken an intro probability course and can compute an expected value on paper but has never felt why it matters. Sam opens PokerMath in a desktop browser — no login, no setup, the Introduction screen just loads. Sam already knows Hold 'Em, so they skim the Introduction, note the hand notation (Ah, Tc), and click **Next**. In the Equity section Sam reads what equity is, sees the addition-law derivation, then learns the Rule of 2-and-4 as its shorthand. The embedded assessment shows a board (Qh 8h 7c) and a hand (Ah Kh) with the prompt *"your opponent goes all-in on the flop — estimate your equity."* Sam enters outs, remaining streets, and an equity percentage, and clicks **Check Answer**. The first attempt is wrong; instead of the answer, a hint appears: *"Re-count your outs — how many cards complete your draw?"* Sam recounts, retries, and gets the confirmation. Sam advances through Pot Odds the same way, and in Calling Profitably stacks both calculations to judge a real all-in call. **Climax:** the moment the computed equity clears the pot-odds threshold and Sam sees that calling is *mathematically* the right move — expected value, made concrete. **Resolution:** Sam finishes the final section having passed all three assessments unaided, in about 20 minutes, with no account and nothing saved.
> **Edge case:** Sam blanks on what an "out" is mid-assessment — opens the Hand Rankings / jargon cheat sheet from the sidebar, reads it, and returns to the same assessment with inputs intact.

## 3. Glossary

*Downstream work and this document use these terms exactly; no synonyms elsewhere.*

- **Learning Objective (LO)** — One of the three scoped competencies: LO1 equity estimation, LO2 pot odds calculation, LO3 call profitability judgment. The system has exactly three.
- **Section** — A top-level unit of the linear flow shown in the sidebar. There are four: Introduction, Equity & the Rule of 2-and-4 (LO1), Pot Odds (LO2), Calling Profitably (LO3). Each LO Section contains instructional content followed by one assessment.
- **Equity** — A hand's probability, expressed as a percentage, of winning at showdown given the current board.
- **Rule of 2-and-4** — A mental shorthand for equity: multiply outs by 2 with one street to come, or by 4 with two streets to come. Produces an *approximation* of true equity.
- **Out** — An unseen card that improves the hand to a likely winner.
- **Street** — A round of community-card dealing still to come (turn, river). On the flop, two streets remain.
- **Board** — The face-up community cards. **Flop** = the first three.
- **Showdown** — The point at which all cards are revealed and the winner determined.
- **Pot Odds** — The ratio of the current pot size to the cost of a call, also expressible as the percentage equity required to break even on the call.
- **Required Equity Threshold** — The minimum equity, derived from pot odds, at which a call is break-even or better.
- **Call / Fold** — The decision to match a bet (and reach showdown) or surrender the hand.
- **Profitable Call** — A call whose equity meets or exceeds the required equity threshold (positive long-run expected value).
- **Assessment** — An embedded, open-input (computed, not multiple-choice) exercise concluding each LO Section, checked by the system.
- **Hint** — A context-aware, canned corrective message shown on an incorrect assessment attempt, pointing at the likely error without revealing the answer.
- **Cheat Sheet** — On-demand reference content for poker prerequisites, opened from the sidebar without leaving the current screen. There are four: The 52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon.

## 4. Features

### 4.1 Learning Flow & Navigation
**Description:** PokerMath is a strictly linear, four-Section flow (Introduction → LO1 → LO2 → LO3), realizing UJ-1. A persistent left sidebar lists the four Sections with titles and one-line subtitles and indicates the learner's current position. Movement is via **Back** and **Next** controls. The system is single-session with no save, resume, scoring, or accounts — reloading starts fresh. There is no branching, adaptive path, or gating: learners may move freely via Back/Next and via the sidebar, and advancing is never blocked by passing an assessment.

**Functional Requirements:**

#### FR-1: Linear Section navigation
A learner can move forward and backward through the four ordered Sections using Next and Back controls. Realizes UJ-1.
**Consequences (testable):**
- Next on the Introduction lands on Equity (LO1); Next on Calling Profitably (LO3) is the end of the flow (no Next, or a disabled/absent control).
- Back on Equity returns to Introduction; Back is absent or disabled on the Introduction.
- Section order is fixed: Introduction, Equity, Pot Odds, Calling Profitably.

#### FR-2: Sidebar Section index with current-position indication
A learner can see all four Sections in the sidebar at all times and which one is active.
**Consequences (testable):**
- The four Sections render with their titles and subtitles in fixed order.
- The active Section is visually distinguished from the others.
- Selecting any Section in the sidebar jumps directly to it; all four are free jump targets at all times.

#### FR-3: Single-session, no persistence
The system holds no state across sessions.
**Consequences (testable):**
- A page reload returns the learner to the Introduction with all assessment inputs and progress cleared.
- No login, account, or save/resume control exists anywhere in the UI.
- No score, grade, or completion record is persisted.

### 4.2 Instructional Content Delivery
**Description:** Each Section presents educational content as text alongside contextual graphics on an Informational Screen. The Introduction establishes baseline poker knowledge and teaches hand notation (Ah, Tc). Each LO Section builds the concept before its shorthand: LO1 derives equity via the addition law of probability *before* introducing the Rule of 2-and-4; LO2 introduces pot odds then grounds it in how bets/calls shift the ratio in a real hand; LO3 motivates long-run thinking via the law of large numbers and "toy game" thought experiments (e.g., *"would you risk $1 for a 50/50 shot at $100?"*) before stacking equity against the required equity threshold. Authoring this instructional content (prose, examples, contextual graphics, specific hand scenarios) is in scope as a build deliverable.

**Functional Requirements:**

#### FR-4: Per-Section instructional content
A learner can read instructional content for each Section, presented as text with supporting contextual graphics.
**Consequences (testable):**
- Each of the four Sections renders its own instructional content with at least one contextual graphic region.
- LO1 content includes both the addition-law equity derivation and the Rule of 2-and-4 as its approximation.
- LO2 content includes the pot odds concept and at least one in-game contextualization of how the ratio changes.
- LO3 content includes a law-of-large-numbers framing with at least one toy-game example and the method for stacking equity vs. required equity threshold.

#### FR-5: Introduction & poker hand notation
A learner can establish or refresh baseline poker knowledge and learn the hand notation used throughout the system.
**Consequences (testable):**
- The Introduction states the assumed prerequisites (52-card deck, Hold 'Em rules) and points to the Cheat Sheets for refreshers.
- Hand notation (rank letter + suit letter, e.g., Ah, Tc) is taught in the Introduction and used consistently in all later Sections.

### 4.3 Cheat Sheet Scaffolding
**Description:** Four on-demand Cheat Sheets — The 52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon — are reachable from a dedicated lower-left sidebar panel. A learner who needs a prerequisite refresher can open one without losing their place or their in-progress assessment inputs, realizing the UJ-1 edge case.

**Functional Requirements:**

#### FR-6: On-demand Cheat Sheets
A learner can open any of the four Cheat Sheets from the sidebar at any point in the flow and return without losing context.
**Consequences (testable):**
- All four Cheat Sheets (52-card Deck, Texas Hold 'Em Rules, Hand Rankings, Poker Jargon) are accessible from every Section.
- Opening and closing a Cheat Sheet does not change the active Section.
- Any text entered in an in-progress assessment is preserved across opening/closing a Cheat Sheet. `[ASSUMPTION: cheat sheets present as an overlay/expandable panel rather than a route change, per the "dropdown menu" wording in the design spec.]`

### 4.4 Card & Board Rendering
**Description:** Hands and boards in instructional content and assessments render as graphical playing cards showing rank and suit, not plain text. Suits use the **four-color deck** scheme — ♥ red, ♦ blue, ♣ green, ♠ black — distinguished by both symbol and color, which also helps learners count flush outs faster.

**Functional Requirements:**

#### FR-7: Graphical card rendering
The system can render any specified card or set of cards as visual playing-card graphics with rank and suit.
**Consequences (testable):**
- A card shows its rank and a suit symbol.
- Suit is conveyed by both symbol and color, never color alone: ♥ red, ♦ blue, ♣ green, ♠ black.
- Board (e.g., Qh 8h 7c) and hand (e.g., Ah Kh) render as distinct labeled groups on assessment screens.

### 4.5 Open-Input Assessments
**Description:** Each LO Section concludes with one open-input Assessment that requires the learner to *compute* answers (no multiple choice), reinforcing procedural fluency. The Rule of 2-and-4 assessment decomposes the calculation into labeled fields (e.g., # of outs, # of remaining streets, resulting equity %); pot odds asks for a ratio and its percentage conversion; call profitability asks the learner to compute equity and pot odds and then render a Call/Fold judgment. A single **Check Answer** button validates all fields for that assessment. Each assessment is a single fixed scenario (not procedurally generated), mirroring the design-spec examples (AhKh on Qh8h7c; $40 pot / $10 bet; all-in $40 profitability).

**Functional Requirements:**

#### FR-8: LO1 equity assessment
A learner can compute and submit a hand's equity for a given board and hand using the Rule of 2-and-4.
**Consequences (testable):**
- Fields presented for outs, remaining streets, and resulting equity percentage.
- The learner derives the out count themselves from the rendered hand and board; outs are not pre-supplied. The chosen scenario must have an unambiguous out count.
- The scenario presents a hand and a flop as card graphics with a prompt to estimate equity.
- Submitted via Check Answer; validated per FR-11.

#### FR-9: LO2 pot odds assessment
A learner can compute and submit pot odds for a given pot size and call cost, as both a ratio and a percentage.
**Consequences (testable):**
- Fields presented for the pot odds ratio and the equivalent percentage.
- The scenario presents pot size and bet/call amount.
- Submitted via Check Answer; validated per FR-11.

#### FR-10: LO3 call profitability assessment
A learner can compute equity and pot odds for a given scenario and submit a Call/Fold judgment.
**Consequences (testable):**
- Fields presented for equity, pot odds (or required equity threshold), and a Call/Fold decision.
- The scenario presents hand, board, pot size, and bet amount as in the design-spec all-in example. For that scenario the canonical answer is equity ≈36% (per FR-11's ±3 band) vs. required equity ≈16.7%, so the profitable judgment is **Call**.
- The Call/Fold judgment validates against the correct equity-vs-threshold comparison; submitted via Check Answer per FR-11.

#### FR-11: Answer checking with approximation tolerance
The system can validate each submitted assessment field and report correct/incorrect, accepting values within a defined tolerance for approximation-based answers.
**Consequences (testable):**
- Exact-valued fields (outs, remaining streets, pot odds ratio) require exact correctness.
- The Rule-of-2-and-4 equity field accepts any value within **±3 percentage points** of the textbook `outs × 4` value (e.g., for the 9-out / 36% LO1 scenario, any answer 33–39% passes). The Rule of 2-and-4 is inherently approximate, so exact-match validation would be pedagogically wrong; the ±3 band also admits the over-count-corrected estimate.
- Pot odds use the **`cost / (pot + cost)` break-even convention**, where *pot* includes all bets made before the call. For the LO2 scenario ($40 pot, $10 opponent bet → $50 pot, $10 to call): accepted ratio is **5:1** and accepted required-equity percentage is **≈16.7%, rounded to the nearest whole percent (accept 16–17%)**.
- An assessment is "passed" only when all of its fields validate as correct.

#### FR-12: Context-aware hint and retry on incorrect answer
On an incorrect submission, the system can show a context-aware hint pointing at the likely error and let the learner try again, without revealing the correct answer.
**Consequences (testable):**
- An incorrect submission produces a hint message tied to the likely mistake (e.g., miscounted outs, wrong street multiplier (×2 vs ×4), forgetting to include the call amount in the pot-odds denominator (the 10/50 = 20% error), or ratio/percentage confusion), not a generic "try again."
- The correct answer is never displayed by the system. `[ASSUMPTION: retries are unlimited; no lockout, consistent with "no retry-limit logic" scope.]`
- The learner can resubmit after a hint; prior inputs remain editable.

#### FR-13: Correct-answer confirmation
On a fully correct submission, the system can confirm success so the learner knows the assessment is passed before advancing.
**Consequences (testable):**
- A correct submission produces a clear success indication distinct from the hint state.
- Advancing to the next Section remains available (passing is not required to use Next per FR-1, but success is acknowledged).

## 5. Learning Design Requirements

*Pedagogical constraints the content and assessments must satisfy. These are course-prescribed and load-bearing — they are requirements, not guidance.*

- **LDR-1 — Bloom alignment.** LO1 and LO2 must target procedural knowledge at the *Executing* level (applying the Rule of 2-and-4 and the pot odds formula). LO3 must target conceptual knowledge at the *Evaluating* level (judging a call by comparing two computed values). Assessments must require the cognitive act named, not a lower one — e.g., LO3 must require a judgment, not mere recall. Validates the design-spec LO/assessment mapping.
- **LDR-2 — Sequential dependency.** Content order must reflect that LO3 is not meaningfully performable without LO1 and LO2 internalized; the linear flow encodes this dependency directly. The sequence is structural, not decorative.
- **LDR-3 — Concept before shorthand.** The Rule of 2-and-4 must be introduced *after* its underlying derivation (addition law of probability) so learners understand the shorthand rather than memorizing it (FR-4). Profitable-calling intuition (law of large numbers, toy games) must precede the formula application in LO3.
- **LDR-4 — Compute, don't recognize.** Assessments must require computed open input, never multiple choice, to reinforce procedural fluency over pattern recognition (FR-8–FR-10).
- **LDR-5 — Corrective, non-revealing feedback.** Incorrect feedback must diagnose the likely error and prompt another attempt without giving the answer (FR-12), keeping the learner in the productive-struggle zone.

## 6. Non-Goals (Explicit)

- PokerMath is **not** a poker-strategy trainer. No pre-flop strategy, multi-street decisions, implied odds, GTO solving, bluffing, or opponent modeling.
- It is **not** a drill or practice tool. No procedurally generated hands, no repetition mode, no "next question" beyond the single assessment per LO.
- It is **not** adaptive. No branching paths, difficulty adjustment, or personalized sequencing.
- It is **not** an account-based or progress-tracking product. No login, scoring, persistence, analytics, or completion records.
- It is **not** a mobile or responsive product (see §8 Platform).
- It does **not** become a general probability course; poker is the sole context and the three LOs are the entire syllabus.

## 7. Information Architecture

*Top-level surfaces and screen structure, per the design-spec wireframes.*

- **Persistent left sidebar**, present on every screen, with two stacked regions:
  - **Section nav (upper):** the four Sections (Introduction · Equity & the Rule of 2-and-4 · Pot Odds · Calling Profitably), each with a title and a one-line subtitle; active Section highlighted.
  - **Cheat Sheets panel (lower):** the four Cheat Sheets (The 52-card Deck · Texas Hold 'Em Rules · Hand Rankings · Poker Jargon).
- **Main content area**, two screen archetypes:
  - **Informational Screen:** Section title + subtitle, instructional text, and a contextual graphic region; **Back** / **Next** controls.
  - **Assessment Screen:** Section title + "Assessment" label, a prompt, labeled input fields, a **Check Answer** button, and a card-graphic region showing the relevant board and hand; **Back** / **Next** controls.

## 8. Platform

- **Desktop web only.** No responsive layout, no mobile or tablet support, no native app. Target is **modern evergreen desktop browsers** (current Chrome/Edge/Firefox/Safari) at typical laptop/desktop resolutions.
- **Client-only, static delivery.** No backend, server-side state, or database is required by any FR. `[ASSUMPTION: implementation is a front-end-only static web app; tech stack unspecified by the source material and left to the builder.]`

## 9. Cross-Cutting NFRs

- **Performance:** Section transitions and Check Answer feedback feel instant (no perceptible spinner under normal conditions); justified by client-only, static, single-session design.
- **Accessibility:** No formal WCAG/508 conformance target for this academic build (confirmed with builder — no rubric requirement). The bar is basic legibility, adequate contrast, and non-color-dependent cues — notably, suit information must not rely on color alone (FR-7 pairs symbol with color).
- **Aesthetic & tone:** Calm, focused, "study tool" feel; the design-spec wireframes use a dark green theme with a light sidebar. Voice of instructional copy: plain, encouraging, second-person ("your hand," "your equity"). Detailed visual design lives downstream in UX, not here.
- **Reliability/observability:** Not applicable at meaningful scale — no persistence, no users to monitor, no uptime SLA.

## 10. Success Metrics

**Primary**
- **SM-1 — Unaided mastery.** A test learner who knows Hold 'Em can pass all three Assessments (FR-8, FR-9, FR-10) without external help in a single session. Target: pass all three. Validates the core instructional claim.
- **SM-2 — Single-session completion within window.** A learner completes the full flow (Introduction → LO3) in 15–30 minutes. Validates FR-1–FR-4 and the single-session design.

**Secondary**
- **SM-3 — Productive recovery from error.** When a learner submits a wrong answer, the hint (FR-12) is sufficient to reach the correct answer on a subsequent attempt without revealing it. Target: learners self-correct via hints rather than abandoning.

**Counter-metrics (do not optimize)**
- **SM-C1 — Do not minimize wrong answers by making assessments trivial.** A near-100% first-try pass rate would signal the assessments stopped requiring real computation (violating LDR-4). Some first-attempt errors are healthy. Counterbalances SM-1.
- **SM-C2 — Do not pad time to hit the window.** Hitting 15–30 minutes by adding filler content rather than necessary instruction is a failure, not a success. Counterbalances SM-2.

## 11. Open Questions

*None outstanding.* All Discovery- and review-stage questions have been resolved (see Glossary, FR-11, §8, and the Decision Log). Build-time configuration items that remain are tracked as assumptions in §12, not open questions.

## 12. Assumptions Index

*Confirmed with the builder (2026-05-28): free Back/Next + sidebar jump navigation, ungated; assessments are single fixed scenarios; learner derives outs in LO1; ±3-point equity tolerance; `cost/(pot+cost)` pot-odds convention (5:1 / ≈16.7%); four-color deck; no formal accessibility standard. Remaining open assumptions for confirmation at finalize:*

- FR-6 — Cheat Sheets present as an overlay/expandable panel, not a route change.
- FR-12 — Retries are unlimited; no lockout.
- §8 — Front-end-only static web app; specific tech stack left to the builder.
