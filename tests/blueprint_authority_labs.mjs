import { chromium } from 'playwright'

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '')
const url = `${baseUrl}/blueprint-ai-studio/labs/rules-authority-enforcement/`
const errors = []

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function text(selector) {
  return (await page.locator(selector).textContent())?.trim() || ''
}

try {
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  expect(response && response.ok(), `Lab page failed to load: ${response?.status()}`)
  await page.waitForSelector('#micro-labs')
  expect((await page.title()).includes('Rules, Authority & Enforcement'), 'Unexpected page title')

  // 1. Ambiguous request: missing authority must fail closed.
  await page.check('input[name="ambiguous-prediction"][value="BLOCK"]')
  await page.click('#run-ambiguous')
  expect((await text('#result-ambiguous')).startsWith('PASS'), 'Ambiguous-request lab did not PASS for BLOCK')

  // 2. Entitlement to authorize is not current approval.
  await page.check('input[name="approval-prediction"][value="BLOCK"]')
  await page.click('#run-approval')
  expect((await text('#result-approval')).startsWith('PASS'), 'Approval lab did not PASS for BLOCK')

  // 3. Negative/control arm must expose changed behavior when authority is absent.
  await page.click('#run-baseline')
  expect(await text('#baseline-no-control') === 'EXECUTES', 'Unexpected no-control baseline state')
  expect(await text('#baseline-with-control') === 'BLOCKS', 'Authority gate did not block without authority')
  expect((await text('#result-baseline')).startsWith('PASS'), 'Baseline lab did not PASS')

  // 4. Preservation: exact is PASS, silent annotation is FAIL.
  await page.selectOption('#preserve-mode', 'exact')
  await page.click('#run-preserve')
  expect((await text('#result-preserve')).startsWith('PASS'), 'Exact preservation did not PASS')
  await page.selectOption('#preserve-mode', 'annotated')
  await page.click('#run-preserve')
  expect((await text('#result-preserve')).startsWith('FAIL'), 'Annotated preservation did not FAIL')

  // 5. Verification should anchor on audit evidence + resulting state.
  await page.check('input[name="verification-choice"][value="audit-state"]')
  await page.click('#run-verification')
  expect((await text('#result-verification')).startsWith('PASS'), 'Verification gap did not PASS for audit+state evidence')

  // Deeper lab A: reader-owned inputs create a bounded decision record.
  await page.fill('#intent-action', 'Move mock workflow to ACTIVE')
  await page.selectOption('#intent-class', 'state-change')
  await page.fill('#intent-authority', 'Operator approves this exact synthetic change')
  await page.selectOption('#intent-authority-state', 'explicit')
  await page.fill('#intent-scope', 'ONBOARDING-DEMO only')
  await page.fill('#intent-expiry', 'one run')
  await page.click('#run-intent')
  expect((await text('#intent-output')).includes('"decision": "ALLOW"'), 'Intent/authority record did not produce ALLOW with explicit bounded authority')

  // Deeper lab B: a falsifiable control test needs all four fields.
  await page.fill('#test-rule', 'State changes require explicit approval')
  await page.fill('#test-violation', 'State changes without approval')
  await page.fill('#test-evidence', 'Audit log shows write when authorization=false')
  await page.fill('#test-control-arm', 'Same request with no enforcement gate')
  await page.click('#run-test-design')
  expect((await text('#result-test-design')).startsWith('PASS'), 'Failing-test design did not PASS with complete inputs')

  // Mobile layout sanity: no horizontal document overflow.
  await page.setViewportSize({ width: 390, height: 844 })
  const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)
  expect(noHorizontalOverflow, 'Mobile viewport has horizontal document overflow')

  // Keyboard sanity: main control can be focused and activated with Enter.
  await page.focus('#run-ambiguous')
  expect(await page.evaluate(() => document.activeElement?.id) === 'run-ambiguous', 'Primary lab control could not receive focus')
  await page.keyboard.press('Enter')
  expect((await text('#result-ambiguous')).startsWith('PASS'), 'Keyboard activation failed')

  expect(errors.length === 0, `Browser errors detected:\n${errors.join('\n')}`)
  console.log(`PASS Blueprint authority labs: ${url}`)
} finally {
  await browser.close()
}
