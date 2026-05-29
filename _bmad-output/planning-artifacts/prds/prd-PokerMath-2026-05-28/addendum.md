# PokerMath PRD — Addendum

Downstream-facing depth that supports the PRD but doesn't belong in its main narrative. Sourced from the Design Specifications PDF (`HCI 520 Term Project Design Specifications-2.pdf`) and the Product Brief. For use by content authoring, UX, and implementation.

## A. Per-Section Teaching Outline (content-authoring reference)

Verbatim-faithful expansion of the design-spec topic outline. The PRD captures these as capabilities (FR-4, FR-5); this is the content spine the author should realize.

**1. Introduction to Poker**
- Establish the baseline poker knowledge expected before using the system.
- Direct unfamiliar learners to the Cheat Sheets (52-card deck composition/structure, hand rankings, Hold 'Em rules and jargon).
- Teach poker hand notation to streamline communication (Ace of hearts = Ah, 10 of clubs = Tc, etc.).

**2. LO1 — Hand Equity and the Rule of 2-and-4**
- Teach the concept of equity: a player's chance to win the hand at showdown (all cards revealed).
- Present the actual equity calculation using the **addition law of probability** to show the underlying math.
- Teach the Rule of 2-and-4 as a shorthand that approximates that calculation — it works because a 52-card deck is almost exactly one-half of 100, the factor a percentage calculation needs.

**3. LO2 — Pot Odds Calculation**
- Teach the concept of pot odds: the ratio of current pot size to the cost of the considered call.
- Contextualize within a real game — show how the odds fluctuate with how many players bet/called and how much was risked, connecting the abstract ratio to actual poker actions.

**4. LO3 — Judging Call Profitability**
- Teach how to connect the prior LOs to judge whether a call is profitable in the long run.
- Present the **law of large numbers** and illustrative "toy games" / thought experiments (e.g., "Would you risk $1 for a 50/50 chance at $100?").
- Teach the stacking method: use pot odds to find the required equity to call, then compare against the calculated equity of your own hand.

## B. Assessment Scenarios (verbatim from design spec)

These are the concrete example items behind FR-8, FR-9, FR-10. Treat as the canonical v1 scenarios unless the builder deliberately substitutes.

**LO1 — Equity / Rule of 2-and-4**
> You hold Ah and Kh. The flop shows Qh, 8h, and 7c. Use the Rule of 2-and-4 to estimate your hand's equity.
- Note (builder): this is a 9-out flush draw (AhKh + Qh8h on board = four hearts seen; 13 − 4 = 9 outs), two streets to come → ≈ 9 × 4 = 36% equity. Use to set the FR-11 tolerance band and to confirm Open Question #2 (outs unambiguous).

**LO2 — Pot Odds Calculation**
> There is $40 in the pot. Your opponent bets $10. Calculate your pot odds as a ratio, and then convert it into a percentage.
- Resolved answer key (builder): the opponent's $10 bet is in the pot at decision time → pot = $50, cost to call = $10. **Ratio = 5:1. Required-equity percentage = `cost/(pot+cost)` = 10/(50+10) = 16.7% (accept 16–17%).** The common wrong answer 10/50 = 20% (forgetting to add your own call to the denominator) is a good canned-hint trigger.

**LO3 — Judging Call Profitability**
> You hold Ah and Kh. The flop shows Qh, 8h, and 7c. There is $40 in the pot. Your opponent bets all-in for $40. Calculate your equity and pot odds, then compare them to determine if calling is profitable.

## C. Bloom Coding (from design spec, for rubric traceability)

- **Prerequisites:** Recalling [1.2] the 52-card deck composition; Recalling [1.2] Hold 'Em rules — both *[Bc] Knowledge of theories, models, and structures*.
- **LO1:** Executing [3.1] the Rule of 2-and-4 — *[Ca] Knowledge of subject-specific skills and algorithms*.
- **LO2:** Executing [3.1] the pot odds formula — *[Ca] Knowledge of subject-specific skills and algorithms*.
- **LO3:** Judging [5.2] call profitability by comparing equity vs. required threshold — *[Bc] Knowledge of theories, models, and structures*.

These codes underpin LDR-1 in the PRD and are the likely grading rubric anchors.

## D. Content Sourcing (from design spec)

Content draws from: Wikipedia on the underlying mathematical concepts; poker educational platforms (Upswing Poker, GTOWizard) for poker-specific framing; supplemented by the builder's own familiarity. Relevant if the course requires citation/sourcing of instructional content.

## E. Future Vision — Drill Mode (deferred, from brief)

The natural extension is a repeatable practice mode: procedurally generated hands and board states for drilling equity and pot odds until automatic. This would unlock the secondary audience (poker players who want repetitive drilling) with a different retention model. Explicitly out of scope for v1 (see PRD §6) and recorded here so the deferral rationale isn't lost.
