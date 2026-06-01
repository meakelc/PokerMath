import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PORT = 5178
const BASE = `http://localhost:${PORT}`
const OUT = new URL('../_verify/3-7/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
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

// ── helpers ──────────────────────────────────────────────────────────────────
async function ss(name) {
  await page.screenshot({ path: join(OUT, name) })
  console.log('📸', name)
}

async function goToPotOdds() {
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await page.click('text=Pot Odds')
  await page.waitForTimeout(400)
}

async function fillLO2(ant, cons, reqEq) {
  await page.fill('input[aria-label="Ratio antecedent"]', String(ant))
  await page.fill('input[aria-label="Ratio consequent"]', String(cons))
  await page.fill('input[aria-label="Required equity percentage"]', String(reqEq))
  await page.waitForTimeout(100)
}

async function clearLO2() {
  await page.fill('input[aria-label="Ratio antecedent"]', '')
  await page.fill('input[aria-label="Ratio consequent"]', '')
  await page.fill('input[aria-label="Required equity percentage"]', '')
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

// ── 1. Navigate to Pot Odds ───────────────────────────────────────────────────
await page.click('text=Pot Odds')
await page.waitForTimeout(400)
await ss('01-pot-odds-initial.png')
console.log('1. Navigated to Pot Odds')

const kicker = await page.locator('.kicker').first().textContent()
console.log('  kicker text:', kicker?.trim())
check('kicker is "Assessment"', kicker?.trim() === 'Assessment')

const cardRegion = await page.locator('.card-region').count()
check('No card-region visible', cardRegion === 0, cardRegion > 0 ? `(count=${cardRegion})` : '')

const ratioGroup = await page.locator('[aria-label="Pot odds ratio"]').count()
check('RatioInput present', ratioGroup > 0)

const sep = await page.locator('.sep').textContent()
check(`Colon separator "${sep}"`, sep === ':')

const suffix = await page.locator('.suffix').first().textContent()
check('% suffix', suffix === '%', suffix !== '%' ? `(got "${suffix}")` : '')

const promptText = await page.locator('.prompt').first().textContent()
console.log('  Prompt:', promptText?.trim())
const promptOk = promptText?.includes('$40') && promptText?.includes('$10')
check('Prompt has $40 and $10', promptOk)

const proseCount = await page.locator('.prose').count()
const proseText = proseCount > 0 ? await page.locator('.prose').first().textContent() : ''
const proseOk = proseText.includes('pot odds') || proseText.includes('Pot odds')
check('PotOddsContent prose renders', proseOk)

// ── 2. Check Answer disabled state ────────────────────────────────────────────
const btnDisabled = await page.locator('button[type=submit]').getAttribute('disabled')
check('2. Check Answer disabled (all empty)', btnDisabled !== null)
await ss('02-check-answer-disabled.png')

await page.fill('input[aria-label="Ratio antecedent"]', '5')
const btnDisPartial = await page.locator('button[type=submit]').getAttribute('disabled')
check('  Still disabled (ant only)', btnDisPartial !== null)

await page.fill('input[aria-label="Ratio consequent"]', '1')
await page.fill('input[aria-label="Required equity percentage"]', '16.7')
await page.waitForTimeout(100)
const btnEnabled = await page.locator('button[type=submit]').getAttribute('disabled')
check('  Enabled when all three filled', btnEnabled === null)
await clearLO2()

// ── 3. AC3 denominator-error rung 0 ──────────────────────────────────────────
console.log('3. AC3 denominator-error path')
await fillLO2('5', '1', '20')
await submit()
await ss('03-denominator-error-rung0.png')
const hint0 = await getFeedbackText()
const hint0cls = await getFeedbackClass()
console.log('  Rung 0 text:', hint0.trim())
check('Rung 0 is hint (amber)', hint0cls.includes('hint'))
check('Rung 0 "Did you include..."', hint0.includes('Did you include'))

await submit()
await ss('04-denominator-error-rung1.png')
const hint1 = await getFeedbackText()
console.log('  Rung 1 text:', hint1.trim())
const rung1ok = hint1.includes('$50') || hint1.includes('$10 to call') || hint1.includes('pot is')
check('Rung 1 escalated', rung1ok)
await clearLO2()

// ── 4. AC3 ratio-percentage-confusion ────────────────────────────────────────
console.log('4. AC3 ratio-percentage-confusion')
await fillLO2('16', '7', '16.7')
await submit()
await ss('05-ratio-percentage-confusion.png')
const confText = await getFeedbackText()
console.log('  Text:', confText.trim())
check('"Re-read which field..."', confText.includes('Re-read'))
await clearLO2()

// ── 5. AC2 + AC4 correct path ─────────────────────────────────────────────────
console.log('5. AC2+AC4 correct submission (5:1, 16.7)')
await fillLO2('5', '1', '16.7')
await submit()
await ss('06-correct-success-row.png')
const successText = await getFeedbackText()
const successCls = await getFeedbackClass()
console.log('  Success row text:', successText.trim())
check('Success row has "success" class', successCls.includes('success'))

await ss('07-sidebar-after-correct.png')
const potOddsItemDone = await page.locator('nav[aria-label="Sections"] button.done').count()
check('Sidebar Pot Odds item has .done class', potOddsItemDone > 0)

const sectionTitle = await page.locator('.section-title').first().textContent()
check('Section title still "Pot Odds"', sectionTitle?.trim() === 'Pot Odds', sectionTitle?.trim() !== 'Pot Odds' ? `(got: ${sectionTitle?.trim()})` : '')

// ── 6. Equity band edge cases ─────────────────────────────────────────────────
console.log('6. Required equity band edge cases')

async function testEquity(val, shouldPass) {
  await goToPotOdds()
  await fillLO2('5', '1', String(val))
  await submit()
  const cls = await getFeedbackClass()
  const passed = cls.includes('success')
  const label = passed ? 'PASS' : 'FAIL'
  const exp = shouldPass ? 'PASS' : 'FAIL'
  check(`equity=${val}`, label === exp, `got ${label}, expected ${exp}`)
  return label === exp
}

await testEquity(16, true)
await testEquity(17, true)
await testEquity(15, false)
await testEquity(18, false)

// ── 7. Cheat sheet round-trip ─────────────────────────────────────────────────
console.log('7. Cheat sheet round-trip')
await goToPotOdds()
await fillLO2('5', '1', '')
const sheetBtn = page.locator('aside .sheet').first()
const sheetBtnCount = await sheetBtn.count()
if (sheetBtnCount > 0) {
  const sheetTitle = await sheetBtn.textContent()
  await sheetBtn.click()
  await page.waitForTimeout(300)
  await ss('08-cheat-sheet-open.png')
  const dialogCount = await page.locator('[role="dialog"]').count()
  check(`Cheat sheet "${sheetTitle?.trim()}" dialog visible`, dialogCount > 0)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await ss('09-after-esc.png')
  const antAfterEsc = await page.inputValue('input[aria-label="Ratio antecedent"]')
  const consAfterEsc = await page.inputValue('input[aria-label="Ratio consequent"]')
  check('Antecedent preserved after Esc', antAfterEsc === '5', `(=${antAfterEsc})`)
  check('Consequent preserved after Esc', consAfterEsc === '1', `(=${consAfterEsc})`)
} else {
  check('Cheat sheet button found in aside', false, '— selector ".sheet" not found; skipping round-trip')
  await ss('08-cheat-sheet-open.png')
  await ss('09-after-esc.png')
}

// ── 8. Reload behavior ────────────────────────────────────────────────────────
console.log('8. Reload resets to Intro, clears fields and checkmark')
await goToPotOdds()
await fillLO2('5', '1', '16.7')
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
console.log('\n✅ Smoke test complete — screenshots in _verify/3-7/')
