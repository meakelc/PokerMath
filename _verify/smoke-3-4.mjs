import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const OUT = new URL('../_verify/3-4/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto('http://localhost:5180')
await page.waitForLoadState('networkidle')

// ── 1. Intro (initial state) ────────────────────────────────────────────────
await page.screenshot({ path: join(OUT, '01-intro.png') })
console.log('01 intro screenshotted')

// ── 2. Navigate to Equity (LO1 assessment) ─────────────────────────────────
await page.click('text=Equity')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '02-equity-empty.png') })
console.log('02 equity (empty) screenshotted')

// Check "Assessment" kicker visible
const kicker = await page.locator('.kicker').first().textContent()
console.log('kicker text:', kicker)

// Check Check Answer button disabled
const btnDisabled = await page.locator('button[type=submit]').getAttribute('disabled')
console.log('Check Answer disabled when empty:', btnDisabled !== null ? 'YES ✅' : 'NO ❌')

// Fill outs field
await page.fill('input[aria-label="Number of outs"]', '9')
await page.screenshot({ path: join(OUT, '03-equity-outs-filled.png') })
// gold border should appear on outs field
console.log('03 equity (outs filled, gold border check) screenshotted')

// Button still disabled (streets + equity empty)
const btn2 = await page.locator('button[type=submit]').getAttribute('disabled')
console.log('Check Answer still disabled (partial fill):', btn2 !== null ? 'YES ✅' : 'NO ❌')

// Fill all LO1 fields
await page.fill('input[aria-label="Streets remaining"]', '2')
await page.fill('input[aria-label="Your equity percentage"]', '36')
await page.waitForTimeout(100)
await page.screenshot({ path: join(OUT, '04-equity-all-filled.png') })
console.log('04 equity (all filled) screenshotted')

const btn3 = await page.locator('button[type=submit]').getAttribute('disabled')
console.log('Check Answer enabled when all filled:', btn3 === null ? 'YES ✅' : 'NO ❌')

// Test non-numeric stripping: type 'abc' into outs
await page.fill('input[aria-label="Number of outs"]', '')
await page.type('input[aria-label="Number of outs"]', 'abc')
await page.waitForTimeout(100)
const outsVal = await page.inputValue('input[aria-label="Number of outs"]')
console.log('Non-numeric stripped (outs after typing "abc"):', outsVal === '' ? `"${outsVal}" ✅` : `"${outsVal}" ❌`)

// Enter key submission: refill, click button
await page.fill('input[aria-label="Number of outs"]', '9')
await page.keyboard.press('Enter')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '05-equity-after-submit.png') })
console.log('05 equity after Enter submit screenshotted')

// ── 3. Pot Odds (LO2) ──────────────────────────────────────────────────────
await page.click('text=Pot Odds')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '06-pot-odds-empty.png') })
console.log('06 pot-odds (empty) screenshotted')

// LO2 should NOT have a card region (hand is empty)
const cardRegion = await page.locator('.card-region').count()
console.log('LO2 card-region hidden (hand empty):', cardRegion === 0 ? 'YES ✅' : 'NO ❌')

// Fill ratio fields
await page.fill('input[aria-label="Ratio antecedent"]', '5')
await page.fill('input[aria-label="Ratio consequent"]', '1')
await page.fill('input[aria-label="Required equity percentage"]', '17')
await page.waitForTimeout(100)
await page.screenshot({ path: join(OUT, '07-pot-odds-filled.png') })
const btn4 = await page.locator('button[type=submit]').getAttribute('disabled')
console.log('LO2 Check Answer enabled:', btn4 === null ? 'YES ✅' : 'NO ❌')

// ── 4. Calling (LO3) ───────────────────────────────────────────────────────
await page.click('text=Calling')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, '08-lo3-empty.png') })
console.log('08 lo3 (empty) screenshotted')

const cardRegionLo3 = await page.locator('.card-region').count()
console.log('LO3 card-region visible (has hand):', cardRegionLo3 > 0 ? 'YES ✅' : 'NO ❌')

await page.fill('input[aria-label="Your equity percentage"]', '36')
await page.fill('input[aria-label="Ratio antecedent"]', '5')
await page.fill('input[aria-label="Ratio consequent"]', '1')
await page.fill('input[aria-label="Required equity percentage"]', '17')
await page.waitForTimeout(100)
await page.screenshot({ path: join(OUT, '09-lo3-filled.png') })
const btn5 = await page.locator('button[type=submit]').getAttribute('disabled')
console.log('LO3 Check Answer enabled:', btn5 === null ? 'YES ✅' : 'NO ❌')

await browser.close()
console.log('\nSmoke test complete. Screenshots in _verify/3-4/')
