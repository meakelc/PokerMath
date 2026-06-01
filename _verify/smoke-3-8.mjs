import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PORT = 5178
const BASE = `http://localhost:${PORT}`
const OUT = new URL('../_verify/3-8/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(BASE)
await page.waitForLoadState('networkidle')

let failures = 0
function check(label, ok, detail = '') {
  const icon = ok ? '✅' : '❌'
  if (!ok) failures++
  console.log(' ', label + ':', icon + (detail ? ' ' + detail : ''))
  return ok
}

async function ss(name) {
  await page.screenshot({ path: join(OUT, name) })
  console.log('📸', name)
}

async function goToCallingProfitably() {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.click('text=Calling Profitably')
  await page.waitForTimeout(400)
}

async function fillLO3(equity, ant, cons, reqEq) {
  await page.fill('input[aria-label="Your equity percentage"]', String(equity))
  await page.fill('input[aria-label="Ratio antecedent"]', String(ant))
  await page.fill('input[aria-label="Ratio consequent"]', String(cons))
  await page.fill('input[aria-label="Required equity percentage"]', String(reqEq))
  await page.waitForTimeout(100)
}

async function clearLO3() {
  await page.fill('input[aria-label="Your equity percentage"]', '')
  await page.fill('input[aria-label="Ratio antecedent"]', '')
  await page.fill('input[aria-label="Ratio consequent"]', '')
  await page.fill('input[aria-label="Required equity percentage"]', '')
  await page.waitForTimeout(100)
}

async function selectDecision(decision) {
  await page.click(`button[aria-label="${decision === 'call' ? 'Call' : 'Fold'}"], [role="group"][aria-label="Call or fold"] button:has-text("${decision === 'call' ? 'Call' : 'Fold'}")`)
  await page.waitForTimeout(100)
}

async function submit() {
  await page.click('button[type=submit]')
  await page.waitForSelector('[role="alert"]', { timeout: 5000 })
  await page.waitForTimeout(200)
}

async function getFeedbackText() {
  return (await page.locator('[role="alert"] .message').first().textContent()) ?? ''
}

async function getFeedbackClass() {
  return (await page.locator('[role="alert"]').first().getAttribute('class')) ?? ''
}

// ── 1. Navigate to Calling Profitably ────────────────────────────────────────
console.log('1. AC1 — Navigate to Calling Profitably, verify render')
await page.click('text=Calling Profitably')
await page.waitForTimeout(400)
await ss('01-calling-profitably-initial.png')

const kicker = await page.locator('.kicker').first().textContent()
check('Kicker is "Assessment"', kicker?.trim() === 'Assessment')

const proseCount = await page.locator('.prose').count()
const proseText = proseCount > 0 ? await page.locator('.prose').first().textContent() : ''
const proseOk = proseText.includes('call') || proseText.includes('Call') || proseText.includes('pot')
check('CallingContent prose renders above kicker', proseOk)

const cardRegion = await page.locator('.card-region').count()
check('Card region visible', cardRegion > 0)

const promptText = await page.locator('.prompt').first().textContent()
console.log('  Prompt:', promptText?.trim())
const promptOk = promptText?.includes('$40') && promptText?.includes('$10')
check('Prompt includes $40 and $10', promptOk)

const ratioGroup = await page.locator('[aria-label="Pot odds ratio"]').count()
check('RatioInput present', ratioGroup > 0)

const equityInput = await page.locator('input[aria-label="Your equity percentage"]').count()
check('Equity input present', equityInput > 0)

const reqEqInput = await page.locator('input[aria-label="Required equity percentage"]').count()
check('Required equity input present', reqEqInput > 0)

const toggleGroup = await page.locator('[role="group"][aria-label="Call or fold"]').count()
check('CallFoldToggle group present', toggleGroup > 0)

const callBtn = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').count()
const foldBtn = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').count()
check('Call button present', callBtn > 0)
check('Fold button present', foldBtn > 0)

// ── 2. AC2 initial state — neither pre-selected ───────────────────────────────
console.log('2. AC2 — CallFoldToggle initial state (neither selected)')
const callPressed = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').getAttribute('aria-pressed')
const foldPressed = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').getAttribute('aria-pressed')
check('Call not pressed initially', callPressed === 'false')
check('Fold not pressed initially', foldPressed === 'false')

// ── 3. Check Answer disabled until all fields + decision ──────────────────────
console.log('3. Check Answer disabled state')
const btnDisabled = await page.locator('button[type=submit]').getAttribute('disabled')
check('Disabled with no fields', btnDisabled !== null)

await page.fill('input[aria-label="Your equity percentage"]', '36')
await page.fill('input[aria-label="Ratio antecedent"]', '5')
await page.fill('input[aria-label="Ratio consequent"]', '1')
await page.fill('input[aria-label="Required equity percentage"]', '16.7')
await page.waitForTimeout(100)
const btnDisNoDecision = await page.locator('button[type=submit]').getAttribute('disabled')
check('Still disabled without decision', btnDisNoDecision !== null)

await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
await page.waitForTimeout(100)
const btnEnabled = await page.locator('button[type=submit]').getAttribute('disabled')
check('Enabled when all 4 fields + decision filled', btnEnabled === null)
await ss('02-check-answer-enabled.png')
await clearLO3()

// ── 4. AC2 interaction — click toggles ───────────────────────────────────────
console.log('4. AC2 — Click interaction')
await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
await page.waitForTimeout(100)
const callAfterClick = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').getAttribute('aria-pressed')
const foldAfterCallClick = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').getAttribute('aria-pressed')
check('Call selected after click', callAfterClick === 'true')
check('Fold deselected after Call click', foldAfterCallClick === 'false')

await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').click()
await page.waitForTimeout(100)
const foldAfterFoldClick = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').getAttribute('aria-pressed')
const callAfterFoldClick = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').getAttribute('aria-pressed')
check('Fold selected after Fold click', foldAfterFoldClick === 'true')
check('Call deselected after Fold click', callAfterFoldClick === 'false')
await ss('03-fold-selected.png')

// ── 5. AC3 wrong-direction path (Fold = wrong) ────────────────────────────────
console.log('5. AC3 — wrong-comparison-direction rung 0 (select Fold)')
await goToCallingProfitably()
await fillLO3('36', '5', '1', '16.7')
await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Fold")').click()
await page.waitForTimeout(100)
await submit()
await ss('04-wrong-direction-rung0.png')
const hint0 = await getFeedbackText()
const hint0cls = await getFeedbackClass()
console.log('  Rung 0 text:', hint0.trim())
check('Rung 0 is hint (amber)', hint0cls.includes('hint'))
check('Rung 0 "two numbers" or "line up"', hint0.toLowerCase().includes('line up') || hint0.toLowerCase().includes('two numbers') || hint0.toLowerCase().includes('larger'))

await submit()
await ss('05-wrong-direction-rung1.png')
const hint1 = await getFeedbackText()
console.log('  Rung 1 text:', hint1.trim())
const rung1ok = hint1.toLowerCase().includes('profitable') || hint1.toLowerCase().includes('equity') || hint1.toLowerCase().includes('meets')
check('Rung 1 escalated', rung1ok)

// ── 6. AC3+AC4 correct path (Call = correct) ──────────────────────────────────
console.log('6. AC3+AC4 — correct path (equity 36, ratio 5:1, reqEq 16.7, Call)')
await goToCallingProfitably()
await fillLO3('36', '5', '1', '16.7')
await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
await page.waitForTimeout(100)
await submit()
await ss('06-correct-success.png')
const successCls = await getFeedbackClass()
check('Success row has "success" class', successCls.includes('success'))

const sidebarDone = await page.locator('nav[aria-label="Sections"] button.done').count()
check('Sidebar Calling Profitably marked .done', sidebarDone > 0)

const sectionTitle = await page.locator('.section-title').first().textContent()
check('No auto-advance — still on Calling Profitably', sectionTitle?.trim() === 'Calling Profitably', sectionTitle?.trim() !== 'Calling Profitably' ? `(got: ${sectionTitle?.trim()})` : '')

await ss('07-sidebar-done.png')

// ── 7. AC3 equity band edge cases ────────────────────────────────────────────
console.log('7. AC3 — equity band edge cases (±3pp around 36)')

async function testEquityBand(equityVal, shouldPass) {
  await goToCallingProfitably()
  await fillLO3(equityVal, '5', '1', '16.7')
  await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
  await page.waitForTimeout(100)
  await submit()
  const cls = await getFeedbackClass()
  const passed = cls.includes('success')
  const exp = shouldPass ? 'PASS' : 'FAIL'
  const got = passed ? 'PASS' : 'FAIL'
  check(`equity=${equityVal}`, got === exp, got !== exp ? `got ${got}, expected ${exp}` : '')
}

await testEquityBand(33, true)
await testEquityBand(39, true)
await testEquityBand(32, false)

// ── 8. AC3 requiredEquity band edge cases ────────────────────────────────────
console.log('8. AC3 — requiredEquity band edge cases (16–17%)')

async function testReqEqBand(reqEqVal, shouldPass) {
  await goToCallingProfitably()
  await fillLO3('36', '5', '1', reqEqVal)
  await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
  await page.waitForTimeout(100)
  await submit()
  const cls = await getFeedbackClass()
  const passed = cls.includes('success')
  const exp = shouldPass ? 'PASS' : 'FAIL'
  const got = passed ? 'PASS' : 'FAIL'
  check(`requiredEquity=${reqEqVal}`, got === exp, got !== exp ? `got ${got}, expected ${exp}` : '')
}

await testReqEqBand(16, true)
await testReqEqBand(17, true)
await testReqEqBand(15, false)
await testReqEqBand(18, false)

// ── 9. Cheat sheet round-trip ─────────────────────────────────────────────────
console.log('9. Cheat sheet round-trip (FR-6)')
await goToCallingProfitably()
await fillLO3('36', '5', '1', '16.7')
await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
await page.waitForTimeout(100)
const sheetBtn = page.locator('aside .sheet').first()
const sheetBtnCount = await sheetBtn.count()
if (sheetBtnCount > 0) {
  await sheetBtn.click()
  await page.waitForTimeout(300)
  await ss('08-cheat-sheet-open.png')
  const dialogCount = await page.locator('[role="dialog"]').count()
  check('Cheat sheet dialog visible', dialogCount > 0)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await ss('09-after-esc.png')
  const equityAfter = await page.inputValue('input[aria-label="Your equity percentage"]')
  const antAfter = await page.inputValue('input[aria-label="Ratio antecedent"]')
  const consAfter = await page.inputValue('input[aria-label="Ratio consequent"]')
  const callPressedAfter = await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').getAttribute('aria-pressed')
  check('Equity preserved after Esc', equityAfter === '36', `(=${equityAfter})`)
  check('Ratio antecedent preserved after Esc', antAfter === '5', `(=${antAfter})`)
  check('Ratio consequent preserved after Esc', consAfter === '1', `(=${consAfter})`)
  check('Call still selected after Esc', callPressedAfter === 'true', `(=${callPressedAfter})`)
} else {
  check('Cheat sheet button found in aside', false, '— ".sheet" not found; skipping round-trip')
  await ss('08-cheat-sheet-open.png')
  await ss('09-after-esc.png')
}

// ── 10. Reload behavior ───────────────────────────────────────────────────────
console.log('10. Reload — resets to Intro, clears fields and checkmark')
await goToCallingProfitably()
await fillLO3('36', '5', '1', '16.7')
await page.locator('[role="group"][aria-label="Call or fold"] button:has-text("Call")').click()
await page.waitForTimeout(100)
await submit()
await page.reload()
await page.waitForLoadState('networkidle')
await ss('10-after-reload.png')
const reloadTitle = await page.locator('.section-title, h1').first().textContent()
console.log('  After reload heading:', reloadTitle?.trim())
const doneAfterReload = await page.locator('nav[aria-label="Sections"] button.done').count()
check('.done class absent after reload', doneAfterReload === 0, doneAfterReload > 0 ? `(count=${doneAfterReload})` : '')

await browser.close()

if (failures > 0) {
  console.error(`\n❌ Smoke test FAILED — ${failures} check(s) failed`)
  process.exit(1)
}
console.log('\n✅ Smoke test complete — screenshots in _verify/3-8/')
