---
name: Deep Table
description: Visual identity for PokerMath — a calm, desktop-web study tool that teaches poker math on a casino-felt surface with leaned-in gold accents.
status: final
created: 2026-05-28
updated: 2026-05-28
project: PokerMath
sources:
  - ../../prds/prd-PokerMath-2026-05-28/prd.md
colors:
  felt: '#0b3d2c'
  felt-deep: '#07291d'
  felt-panel: '#0e4a36'
  text-on-felt: '#eef2ef'
  text-on-felt-dim: '#a9c2b6'
  sidebar: '#eef0ee'
  sidebar-text: '#20262a'
  sidebar-text-dim: '#79847c'
  sidebar-active: '#dfe6e2'
  sidebar-border: '#dcdfda'
  gold: '#e0b24c'
  gold-deep: '#c8973a'
  gold-ink: '#241a07'
  success: '#34b27a'
  success-tint: 'rgba(52,178,122,0.14)'
  hint: '#e08a3c'
  hint-tint: 'rgba(224,138,60,0.14)'
  card-face: '#ffffff'
  suit-heart: '#d0322f'
  suit-diamond: '#2e6fd6'
  suit-club: '#1f9d55'
  suit-spade: '#1a1a1a'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  heading-md:
    fontFamily: Fraunces
    fontSize: 23px
    fontWeight: '600'
    lineHeight: '1.2'
  heading-sm:
    fontFamily: Fraunces
    fontSize: 19px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.09em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  value:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.2'
  value-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.1'
rounded:
  sm: 6px
  md: 9px
  lg: 12px
  card: 8px
  full: 9999px
spacing:
  unit: 8px
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '6': 24px
  '8': 32px
  '10': 40px
  content-pad: 36px
  section-gap: 24px
components:
  sidebar-nav-item:
    padding: '{spacing.3}'
    rounded: '{rounded.sm}'
    text: '{typography.body-md}'
    active-bg: '{colors.sidebar-active}'
    active-accent: '{colors.gold}'
    complete-mark-color: '{colors.gold-deep}'
  button-primary:
    bg: '{colors.gold}'
    text-color: '{colors.gold-ink}'
    font: '{typography.body-md}'
    rounded: '{rounded.sm}'
    padding: '11px 22px'
    shadow: '0 1px 0 {colors.gold-deep}'
  button-ghost:
    bg: transparent
    text-color: '{colors.text-on-felt-dim}'
    border: '1px solid rgba(255,255,255,0.2)'
    rounded: '{rounded.sm}'
  toggle-button:
    bg-unselected: '{colors.felt-deep}'
    bg-selected: '{colors.gold}'
    text-selected: '{colors.gold-ink}'
    border: '1px solid rgba(255,255,255,0.16)'
    rounded: '{rounded.sm}'
  input-field:
    bg: '{colors.felt-deep}'
    text: '{typography.value}'
    border: '1px solid rgba(255,255,255,0.16)'
    border-filled: '1px solid {colors.gold}'
    rounded: '{rounded.sm}'
    height: '40px'
  playing-card:
    face: '{colors.card-face}'
    rounded: '{rounded.card}'
    ratio: '2:3'
    shadow: '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.22)'
    rank-suit-font: '{typography.value-lg}'
  assessment-panel:
    bg: '{colors.felt-panel}'
    rounded: '{rounded.md}'
    shadow: '0 4px 20px rgba(0,0,0,0.28)'
    border: '1px solid rgba(255,255,255,0.06)'
    padding: '{spacing.6}'
  feedback-hint:
    bg: '{colors.hint-tint}'
    border: '1px solid {colors.hint}'
    rounded: '{rounded.sm}'
  feedback-success:
    bg: '{colors.success-tint}'
    border: '1px solid {colors.success}'
    rounded: '{rounded.sm}'
  cheat-sheet-modal:
    scrim: 'rgba(7,41,29,0.55)'
    surface: '{colors.card-face}'
    surface-text: '{colors.sidebar-text}'
    rounded: '{rounded.lg}'
    shadow: '0 24px 60px rgba(0,0,0,0.5)'
---

# PokerMath — DESIGN.md ("Deep Table")

> Visual identity for PokerMath, a single-session desktop-web tool that teaches three poker-math competencies. Owns *how it looks*. The behavioral contract is [EXPERIENCE.md](./EXPERIENCE.md); it references the tokens above by name. Both spines win over any mock on conflict. Composition references: [`mockups/key-screen-assessment.html`](./mockups/key-screen-assessment.html), [`mockups/key-screen-informational.html`](./mockups/key-screen-informational.html), [`mockups/key-screen-cheatsheet-modal.html`](./mockups/key-screen-cheatsheet-modal.html).

## Brand & Style

PokerMath is a **calm study tool wearing a card-room jacket**. The dominant field is a deep poker-felt green — the table you sit down at to do the math — and a single warm metal, gold, marks the things that matter: the section you're on, the answer you commit to, the work you've finished. The light sidebar is the quiet ledger beside the table.

The posture is **focused and composed, not flashy**. This is a place to think, not a casino floor. Gold is *leaned into* but disciplined: it accents, it never floods. Motion is restrained by rule — transitions are quick and quiet, there are no celebratory animations, no spinners (the app is client-only and feels instant). The emotional register is the moment a hard concept clicks: serious, a little weighty, ultimately rewarding. Type carries that — a warm serif for the teaching voice, a clean sans for reading, and a monospace that makes every computed value look like exactly what it is: a number you worked out.

## Colors

The palette is a felt table lit by one warm light, with a paper ledger to its left.

- **Felt `{colors.felt}`** is the canvas — the main content area on every screen. **Felt-deep `{colors.felt-deep}`** recedes: input wells and recessed surfaces. **Felt-panel `{colors.felt-panel}`** is the slightly lifted assessment panel. Together they layer depth tonally before any shadow is added.
- **Gold `{colors.gold}`** is the single accent and the primary-action color. It carries: the active-section indicator (a left bar in the sidebar), primary buttons (Next, Check Answer), the selected Call/Fold toggle, the section-complete ✓, and thin trim/dividers. **Gold-deep `{colors.gold-deep}`** is its pressed/edge shade and the complete-mark color on the light sidebar. Gold is *never* used for error or success states — it must stay unambiguously "the thing to act on / the thing achieved."
- **Sidebar `{colors.sidebar}`** is a cool near-white paper; **sidebar-active `{colors.sidebar-active}`** tints the current section's row. **Sidebar-border `{colors.sidebar-border}`** divides the Sections list from the Cheat Sheets panel.
- **Success `{colors.success}`** (a confident table green, distinct from felt) confirms a fully-correct answer. **Hint `{colors.hint}`** (a warm, non-alarming amber — deliberately *not* red) carries corrective feedback; red is reserved by convention for the heart suit, so corrective copy must never read as "danger red."
- **Suits are fixed by spec (four-color deck)** and convey suit by symbol *and* color, never color alone: heart `{colors.suit-heart}`, diamond `{colors.suit-diamond}`, club `{colors.suit-club}`, spade `{colors.suit-spade}` — always on a white `{colors.card-face}` card face for maximum legibility against the felt.

## Typography

Three voices, each with one job:

- **Fraunces** (`display-lg`, `heading-md`, `heading-sm`) is the **teaching voice** — section titles and headings. Its warmth and optical-serif weight give the material textbook gravitas without stiffness.
- **Inter** (`body-lg`, `body-md`, `label-caps`, `caption`) is **everything you read and operate** — instructional prose, labels, sidebar, captions. Chosen for legibility across long reading passages. `label-caps` (tracked +0.09em, uppercase) marks kickers and field labels.
- **JetBrains Mono** (`value`, `value-lg`) renders **every computed value and all card notation** — `Ah Kh`, out counts, `36%`, `5:1`, required-equity thresholds. Monospace + tabular figures signals "this is a number to compute," visually separating values from prose. `value-lg` is the rank/suit on the playing cards.

`display-lg` uses tightened tracking (-0.01em) for a cohesive title block. Body copy holds a generous 1.6 line-height in service of comfortable reading.

## Layout & Spacing

A **fixed two-pane desktop layout**: a persistent left sidebar (~248px) and a felt content area that fills the rest. No responsive reflow — desktop-web only by spec.

Spacing is built on an **8px unit** and runs **comfortable**: `content-pad` (36px) frames the felt content area, `section-gap` (24px) separates major blocks (heading → prompt → card zone → answer panel → footer nav). Generous whitespace is load-bearing here — it keeps a math-dense screen calm and lowers cognitive load while the learner computes. The content column caps prose at ~60ch for readability; cards and the answer panel sit left-aligned within that rhythm.

## Elevation & Depth

Depth is **tactile but quiet** — objects rest on a table, they don't float in space.

- **Tonal layering first:** felt → felt-deep (wells) → felt-panel (the lifted answer panel) establish hierarchy by value before shadow.
- **Two shadow roles only:** playing cards get a crisp double-shadow (`0 2px 6px / 0 6px 16px` black) so they read as physical objects on the felt; the assessment panel gets a single soft ambient shadow (`0 4px 20px`). The cheat-sheet modal lifts highest (`0 24px 60px`) over a felt-tinted scrim.
- **Everything else stays flat:** sidebar, prose, dividers, footer nav. No texture, no gloss, no felt-fabric imagery — physicality comes from shadow and tone alone, keeping the "calm study tool" promise.

## Shapes

**Softly rounded.** A consistent radius family: `sm` (6px) for buttons, inputs, toggles, feedback boxes; `md` (9px) for the assessment panel; `lg` (12px) for the cheat-sheet modal; `card` (8px) for the playing cards' corners (real-card rounding on a 2:3 face). Nothing is sharp (too austere for a teaching tool) and nothing is fully pill (too casual/game-y). The rounding says "approachable and composed."

## Components

- **Sidebar nav item** — title (`body-md`, 500) + one-line subtitle (`caption`, dim). Active item: `sidebar-active` background + a 3px gold left-bar + title in felt color, 600. Completed item: a gold-deep ✓ appended to the title. All four items are always present and always clickable (free jump).
- **Cheat-sheet list item** (lower sidebar panel) — quiet rows with a leading chevron; click opens the modal.
- **Button — primary** — gold fill, gold-ink text, `sm` radius, generous horizontal padding, a 1px gold-deep bottom edge for a subtle pressable feel. Used for Next and Check Answer.
- **Button — ghost** — transparent with a 1px translucent-white border, dim text. Used for Back and the non-primary pager control.
- **Toggle button (Call / Fold)** — two large mutually-exclusive buttons, neither pre-selected; selected state fills gold with gold-ink text. Reserved for the LO3 judgment so the decision feels deliberate.
- **Input field** — felt-deep well, mono text, translucent border that turns gold once filled; numeric entry. Fixed `%` suffix shown inside where relevant so the learner types only the number.
- **Ratio input** — two small mono fields with a fixed `:` glyph between them (`[5] : [1]`) for the pot-odds ratio.
- **Playing card** — white 2:3 face, `card` radius, double-shadow. **Stacked layout:** rank centered above the suit symbol, both in `value-lg`, no corner indices — chosen for at-a-glance legibility when counting outs. Suit color per the four-color tokens.
- **Assessment panel** — the lifted felt-panel surface holding the answer fields + Check Answer + (when present) the feedback row.
- **Feedback — hint** — amber-bordered, `hint-tint` background, a leading `!` glyph, corrective copy. Distinct from success and never red.
- **Feedback — success** — success-green-bordered, `success-tint` background, a leading ✓, affirming copy.
- **Cheat-sheet modal** — white surface (`surface-text` ink) centered over a felt-tinted scrim, `lg` radius, highest shadow; a close control plus Esc/click-away dismiss.

## Do's and Don'ts

**Do**
- Keep felt the dominant field; let gold accent only the active, the actionable, and the achieved.
- Render every computed value and all card notation in the mono token — it's the product's signature legibility cue.
- Pair suit color with the suit symbol, always; keep card faces white for contrast against the felt.
- Keep motion quick and quiet; prefer an instant state change to an animated one.

**Don't**
- Don't use gold for success or error — those are green and amber respectively; gold means act/achieved.
- Don't color individual answer fields red on a wrong submission (a behavioral rule, see EXPERIENCE.md — the look must not imply per-field validation chrome).
- Don't add felt texture, glossy cards, casino chrome, or celebratory animation — it breaks the calm-study-tool tone.
- Don't introduce a second accent hue; the palette is felt + gold + the two feedback states + the four fixed suit colors. Nothing else.
