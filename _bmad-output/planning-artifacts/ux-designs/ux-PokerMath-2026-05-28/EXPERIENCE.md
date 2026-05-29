---
name: PokerMath Experience Spine
status: final
created: 2026-05-28
updated: 2026-05-28
project: PokerMath
sources:
  - ../../prds/prd-PokerMath-2026-05-28/prd.md
design_ref: ./DESIGN.md
---

# PokerMath — EXPERIENCE.md

> Information architecture & behavior. Owns *how it works*. Visual identity is [DESIGN.md](./DESIGN.md) ("Deep Table"); this spine references its tokens as `{path.to.token}`. Both spines win over any mock on conflict. Single primary journey (UJ-1, "Sam") from the PRD is the spine of §Key Flows.

## Foundation

**Desktop web only**, modern evergreen browsers, laptop/desktop resolutions. No responsive layout, no mobile/tablet, no native app (PRD §8). **Client-only static app**, single-session, no backend, no accounts, no persistence — a page reload returns the learner to the Introduction with everything cleared.

No third-party UI system is named; the app is built from the components specified in `{DESIGN.md}`. The structure is a fixed two-pane layout — persistent left sidebar + felt content area — that never reflows. Because there is one surface family and no responsive behavior, the **Responsive & Platform** section is intentionally omitted.

## Information Architecture

A strictly linear four-Section flow inside a persistent frame. Every need stated in the PRD resolves to a surface below, and every surface is reached by the linear pager or a sidebar jump.

| Surface | Reached from | Purpose |
|---|---|---|
| Introduction | App open (cold); sidebar | Baseline poker knowledge + teach hand notation (`Ah`, `Tc`). Informational screen. |
| Equity & the Rule of 2-and-4 (LO1) | Next from Intro; sidebar | Teach equity (addition-law derivation → Rule of 2-and-4), then its assessment. |
| Pot Odds (LO2) | Next from LO1; sidebar | Teach pot odds + in-game contextualization, then its assessment. |
| Calling Profitably (LO3) | Next from LO2; sidebar | Law-of-large-numbers framing + stacking method, then the climax Call/Fold assessment. |
| Cheat Sheet (×4) | Sidebar lower panel, any time | On-demand reference (52-card Deck · Hold 'Em Rules · Hand Rankings · Poker Jargon). Modal overlay — does **not** change the active Section. |

- **Persistent left sidebar**, two stacked regions: **Section nav** (upper — four sections, title + one-line subtitle, active highlighted per `{components.sidebar-nav-item}`) and **Cheat Sheets panel** (lower — four sheets).
- **Main content area**, two screen archetypes: **Informational** (title + subtitle, instructional prose, contextual graphic region, Back/Next) and **Assessment** (title + "Assessment" kicker, prompt, labeled input fields in the lifted panel, Check Answer, a card-graphic region for board + hand, Back/Next).
- **Navigation is free and ungated:** Back/Next move one step; any sidebar item jumps directly. Order is fixed (Intro → LO1 → LO2 → LO3). Advancing **never** requires passing an assessment. Back is absent/disabled on Introduction; there is no Next past LO3.

→ Composition references: [`mockups/key-screen-assessment.html`](./mockups/key-screen-assessment.html) (Assessment archetype + hint state), [`mockups/key-screen-informational.html`](./mockups/key-screen-informational.html) (Informational archetype), [`mockups/key-screen-cheatsheet-modal.html`](./mockups/key-screen-cheatsheet-modal.html) (Cheat-Sheet modal over a dimmed Section). Spine wins on conflict.

## Voice and Tone

Microcopy. Brand voice/aesthetic posture live in `{DESIGN.md}` Brand & Style. **Register: warm coach** — encouraging, human, second-person; no emoji, no hype, no cutesy. Plain in instruction; warmth concentrated in feedback moments.

| Do | Don't |
|---|---|
| "Estimate your equity." | "Time to test yourself! 🎰" |
| "Nice — that call is +EV." | "🎉 Correct!!! You're a poker genius!" |
| "Not quite — recount your outs." | "Wrong. Try again." |
| "Any heart completes your flush — count the unseen ones." | Revealing the number, ever. |
| "Open a cheat sheet any time — your answers stay put." | "Are you sure you want to leave?" |
| Second person, your hand / your equity / your call. | Third person or passive ("the user should…"). |

## Component Patterns

Behavioral rules. Visual specs live in `{DESIGN.md}` Components.

| Component | Use | Behavioral rules |
|---|---|---|
| Sidebar Section item | Frame, always | Click jumps to that Section (free, ungated). Active = current Section. Shows a gold ✓ once that Section's assessment has been passed *this session* (cleared on reload). |
| Cheat-Sheet item | Frame, always | Click opens that sheet as a modal overlay. Does not change active Section. Available from every Section. |
| Pager (Back / Next) | Every screen | Back = previous Section; Next = next Section. Back absent on Intro; no Next past LO3 (FR-1). Always enabled within range regardless of assessment state. |
| Numeric input | Assessments | Mono numeric field; `%` rendered as a fixed suffix where relevant (learner types only the number). Editable at all times, including after a hint. |
| Ratio input | LO2, LO3 | Two mono fields with fixed `:` between (`[5] : [1]`). Both required for the ratio to validate. |
| Call/Fold toggle | LO3 only | Two large mutually-exclusive buttons; **neither pre-selected**. Selecting one is part of a complete submission. |
| Check Answer | Assessments | Validates **all** fields together (FR-11). Disabled until every field of that assessment has input. One button per assessment. |
| Hint feedback | Assessments | Appears below the panel on a wrong submission; corrective, escalating, never reveals the answer (see State Patterns). |
| Success feedback | Assessments | Replaces any hint on a fully-correct submission; affirms and marks the Section complete. |
| Cheat-Sheet modal | Any time | Opens over current screen with a felt-tinted scrim; Esc / click-away / close control dismiss. Underlying Section and all in-progress inputs are preserved. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold open / reload | App | Always lands on Introduction; all inputs, hints, and ✓ marks cleared (FR-3). No resume prompt. |
| Informational | Any Section | Prose + at least one contextual graphic region; Back/Next. No assessment chrome. |
| Assessment — pristine | LO1–LO3 | Empty fields (`— %` placeholders where suffixed). Check Answer **disabled**. No feedback shown. |
| Assessment — ready | LO1–LO3 | All fields have input. Check Answer **enabled** (gold, `{components.button-primary}`). |
| Assessment — incorrect (hint) | LO1–LO3 | `{components.feedback-hint}` row appears. **No per-field coloring** — all fields stay neutral and editable. Hint text is the next rung of the ladder for the *detected* error (see below). Learner edits and resubmits freely (unlimited retries). |
| Assessment — correct (success) | LO1–LO3 | `{components.feedback-success}` row replaces any hint; warm-coach affirmation. Sidebar marks the Section complete (gold ✓). **No auto-advance** — Next remains the learner's choice. |
| Cheat sheet open | Any | Modal over a `{components.cheat-sheet-modal.scrim}`. Section beneath unchanged; assessment inputs preserved on close (FR-6, UJ-1 edge case). |

**Hint ladder (escalating, within the detected error).** On each wrong submission the system diagnoses the *likely* error and shows the next, more-pointed rung — without ever stating the answer. If the error *type* changes between attempts, the ladder switches to that error's rungs. Canonical examples:

- **LO1 — miscounted outs:** 1) "Re-count your outs — how many unseen cards complete your draw?" → 2) "All your hearts are outs. Four hearts are already showing — how many of the thirteen remain?" → 3) "Nine hearts are unseen. Now apply the rule for two streets to come." (relevant sheet: *Hand Rankings*)
- **LO1 — wrong street multiplier (×2 vs ×4):** 1) "Check your multiplier — how many streets are still to come on the flop?" → 2) "Two streets remain, so the Rule of 2-and-4 says ×4, not ×2." → 3) "Multiply your outs by 4."
- **LO2 — `10/50 = 20%` denominator error:** 1) "Did you include the cost of *your* call in the pot?" → 2) "The pot is $50 and it costs $10 to call — your $10 goes into the denominator too." → 3) "Use cost ÷ (pot + cost), i.e. 10 ÷ 60." (relevant sheet: *Poker Jargon*)
- **LO2 — ratio/percentage confusion:** 1) "Re-read which field wants a ratio and which wants a percentage." → 2) "5:1 means five-to-one; the percentage is the break-even equity it implies." → 3) "Convert the ratio with cost ÷ (pot + cost)."
- **LO3 — wrong comparison direction:** 1) "Line up the two numbers you computed — which must be larger to call?" → 2) "Calling is profitable when your equity meets or beats the required equity." → 3) "Compare your equity to the required-equity threshold, then decide."

## Interaction Primitives

- **Click to act.** No hover-dependent functionality (information must never hide behind hover, per the accessibility floor).
- **Keyboard:** Tab moves through fields in reading order; **Enter submits Check Answer** when it is enabled; **Esc closes the cheat-sheet modal**. Arrow/space toggles the Call/Fold buttons when focused.
- **Numeric fields** accept numeric entry; non-numeric input is simply not accepted rather than throwing an error.
- **Restrained motion (hard rule):** state changes (hint appears, success appears, modal opens) use only quick, quiet fades/position shifts. **Banned:** spinners/loaders (the app is instant), celebratory animations or confetti on success, card-dealing/flip animations, attention-pulsing, auto-advancing carousels.
- **No destructive actions, no confirmations:** nothing is saved or deleted, so there are no "are you sure?" prompts anywhere.

## Accessibility Floor

Behavioral floor (PRD §9 — no formal WCAG target; bar = legibility, adequate contrast, non-color-dependent cues). Visual contrast values live in `{DESIGN.md}`.

- **Suit is never color alone:** every card pairs the suit symbol with its color (`{colors.suit-heart}` / `{colors.suit-diamond}` / `{colors.suit-club}` / `{colors.suit-spade}`). A learner who cannot distinguish the four colors can still read suit from the symbol.
- **Feedback is never color alone:** the hint row carries a `!` glyph and corrective words; the success row carries a ✓ and affirming words — not just amber vs. green.
- **Active Section** is indicated by the gold left-bar *and* a weight/background change, not color alone.
- **Focus is always visible** on interactive elements; tab order follows reading order on every screen.
- **Legible defaults:** body text at `{typography.body-lg}` on the felt; computed values in the mono token at readable size; no text smaller than `{typography.caption}`.
- **Keyboard-operable:** the full flow (navigate, enter answers, submit, open/close cheat sheets) is completable without a mouse.

## Inspiration & Anti-patterns

This product is defined as much by what it refuses as what it does (PRD §6 Non-Goals).

- **Lifted from textbooks:** concept-before-shorthand sequencing (derivation, *then* the Rule of 2-and-4) — the structure teaches understanding, not memorization (LDR-3).
- **Lifted from good tutoring:** corrective, non-revealing, escalating hints that keep the learner in productive struggle (LDR-5) rather than handing over the answer.
- **Rejected — gamification (streaks, scores, XP, badges):** no persistence, no accounts, no scoring by design. Mastery is the reward; the success confirmation is the only celebration, and it's quiet.
- **Rejected — adaptive/branching paths and difficulty tuning:** the linear order *is* the pedagogy (sequential dependency, LDR-2). No personalization.
- **Rejected — multiple-choice answers:** every assessment demands a computed open input (LDR-4); recognition is not fluency.
- **Rejected — drill mode / "next question":** one fixed scenario per LO in v1. Repetition is explicitly future vision, not this build.

## Key Flows

### Flow 1 — Sam sees expected value bite (UJ-1, the primary journey)

*Sam, a stats student who can compute an expected value on paper but has never felt why it matters. Desktop browser, one unaided sitting.*

1. Sam opens PokerMath — no login, no setup; the **Introduction** loads cold. Sam knows Hold 'Em, skims it, notes the hand notation (`Ah`, `Tc`), clicks **Next**.
2. In **Equity (LO1)** Sam reads what equity is, sees the addition-law derivation, then meets the Rule of 2-and-4 as its shorthand.
3. The assessment shows board `Qh 8h 7c` and hand `Ah Kh`: *"Your opponent goes all-in on the flop — estimate your equity."* Sam enters outs, streets, and an equity %, and clicks **Check Answer**.
4. First attempt is wrong. **No answer appears** — instead the amber hint: *"Re-count your outs — how many unseen cards complete your draw?"* Inputs stay put. Sam recounts (9), retries, and gets the green confirmation; the sidebar marks LO1 complete with a gold ✓.
5. **Edge case mid-assessment:** Sam blanks on what an "out" is — opens the *Hand Rankings* cheat sheet from the sidebar (modal over a dimmed felt), reads, presses Esc. The assessment is exactly as left, inputs intact.
6. Sam advances through **Pot Odds (LO2)** the same way — entering the `5:1` ratio and `≈17%` required equity.
7. In **Calling Profitably (LO3)** Sam stacks both calculations against the all-in: computes equity (~36%), required equity (~16.7%), then commits the **Call/Fold** toggle.
8. **Climax:** the moment the computed equity clears the pot-odds threshold and Sam selects **Call** — and the success state confirms it was *mathematically* the right move. Expected value, made concrete on a $40 call.
9. **Resolution:** Sam finishes having passed all three assessments unaided, in about 20 minutes, with no account and nothing saved. Closing the tab leaves no trace — and that's the point.

**Failure path:** Sam keeps mis-multiplying ×2 instead of ×4. The hint ladder escalates from "check your multiplier" to "two streets remain, so ×4" to "multiply your outs by 4" — pointed, but never the final number. Unlimited retries; no lockout.
