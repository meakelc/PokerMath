# Input Reconciliation — Design Specifications PDF → PRD

Source: `HCI 520 Term Project Design Specifications-2.pdf`

## Coverage check (design-spec element → PRD home)
- Topic/learner descriptions, prerequisites (52-card deck, Hold 'Em rules) → §2, FR-5. ✅
- LO definitions with Bloom codes (3.1 Executing ×2, 5.2 Judging) → §5 LDR-1, addendum §C. ✅
- Assessment methods + 3 example scenarios (AhKh/Qh8h7c; $40+$10; all-in $40) → FR-8–10, addendum §B (verbatim + answer keys). ✅
- Teaching outline (intro→addition law→Rule of 2-and-4; pot odds concept→in-game; LO3 LLN/toy games→stacking) → FR-4, addendum §A. ✅
- Hand notation (Ah, Tc) taught in intro → FR-5, §3, UJ-1. ✅
- Wireframe: persistent left sidebar (4-section nav + subtitles) → FR-2, §7. ✅
- Wireframe: lower-left Cheat Sheets panel (4 sheets) → FR-6, §7. ✅
- Wireframe: Informational Screen (title/subtitle, text, contextual graphic, Back/Next) → §7, FR-4. ✅
- Wireframe: Assessment Screen (prompt, labeled input fields, Check Answer, card graphics, Back/Next) → §7, FR-8, FR-13. ✅
- Wireframe: multi-field input (# outs, # remaining streets, equity) → FR-8. ✅
- Wireframe: card rendering w/ suit symbols + color (red hearts, blue diamond) → FR-7 (resolved to four-color deck). ✅
- Content sourcing (Wikipedia, Upswing/GTOWizard, own familiarity) → addendum §D. ✅

## Notable interpretation decisions (recorded, not gaps)
1. **Design spec's learner description leads with "improve poker play."** The brief (later, authoritative) re-prioritizes to the math-learner as PRIMARY and poker-player as secondary/non-user. PRD follows the brief. Intentional, logged in brief decision-log. ✅
2. **"Open-input" vs multi-field.** Design-spec wireframe shows decomposed fields; PRD models this as multi-field computed input (FR-8) — fully consistent with the brief's "open-input." ✅
3. **Pot odds value.** Design spec gives the scenario but not the answer key; PRD/addendum supply 5:1 / 16.7% via the confirmed `cost/(pot+cost)` convention. New decision, logged. ✅
4. **Dark green theme** from wireframes → §9 Aesthetic&tone (kept as light direction; detailed visual design deferred to UX). ✅

## Verdict
Full coverage of teaching content, assessments, and wireframe structure. The one divergence (audience priority) is deliberate and traceable to the brief. Wireframe UI detail is captured at PRD altitude (§7 IA) with depth preserved in the addendum for downstream UX.
