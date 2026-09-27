import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const shots = process.env.CBE_SCREENSHOT_DIR || '/tmp/cbe-visuals';
const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', error => errors.push(error.message));
const content = selector => page.locator(selector).innerText();

try {
  await mkdir(shots, { recursive: true });
  assert.ok((await page.goto(base + '/methods/cbe/')).ok());
  for (const [candidate, verdict, evidence] of [
    ['format', 'KEEP', 'format detection'],
    ['embedding', 'DELEGATE', 'Semantic Indexer'],
    ['retention', 'SPLIT', 'DELEGATE determining policy'],
    ['assistant', 'REJECT', 'does not close'],
    ['unknown', 'UNRESOLVED', 'does not establish who owns'],
  ]) {
    await page.selectOption('#candidate', candidate);
    assert.equal(await page.locator('input[name="verdict"]:checked').count(), 0, 'New candidate must clear the old prediction');
    await page.check('input[name="verdict"][value="' + verdict + '"]');
    await page.getByRole('button', { name: 'Check classification' }).click();
    assert.equal(await content('#classification-result h3'), 'Match: ' + verdict);
    assert.ok((await content('#classification-result')).toLowerCase().includes(evidence.toLowerCase()));
    assert.match(await content('#classification-result'), /No implementation action is authorized/);
  }
  await page.selectOption('#candidate', 'retention');
  await page.check('input[name="verdict"][value="KEEP"]');
  await page.getByRole('button', { name: 'Check classification' }).click();
  assert.equal(await content('#classification-result h3'), 'Reconsider: SPLIT');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  assert.equal(await page.locator('input:checked').count(), 0);
  await page.check('input[name="verdict"][value="KEEP"]');
  await page.getByRole('button', { name: 'Check classification' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await content('#classification-result h3'), 'Match: KEEP');

  assert.ok((await page.goto(base + '/methods/cbe-ix/')).ok());
  const terminals = {
    handoffs: 'EXHAUSTED_WITH_HANDOFFS', valid: 'EXHAUSTED_VALID',
    residual: 'EXHAUSTED_WITH_RESIDUAL_UNCERTAINTY', boundary: 'BLOCKED_BY_BOUNDARY_DECISION',
    drift: 'TARGET_IDENTITY_DRIFT', insufficient: 'INSUFFICIENT_INFORMATION',
    cycle: 'NON_CONVERGENT', limit: 'EXTERNAL_ITERATION_LIMIT_REACHED',
  };
  for (const [scenario, terminal] of Object.entries(terminals)) {
    await page.selectOption('#iteration-case', scenario);
    assert.equal(await content('#iteration-status'), 'READY');
    assert.equal(await page.locator('#iteration-ledger li').count(), 1, 'Case changes must clear prior trace');
    let steps = 0;
    while (await page.locator('#next-iteration').isEnabled()) {
      assert.ok(++steps <= 6, 'Trace failed to terminate');
      await page.click('#next-iteration');
      if (await content('#iteration-status') === 'VERIFY_CONVERGENCE') {
        assert.match(await content('#iteration-audit'), /empty frontier alone does not establish/);
      }
    }
    assert.equal(await content('#iteration-status'), terminal);
    if (scenario === 'limit') {
      assert.match(await content('#iteration-frontier'), /Parser selection/);
      assert.match(await content('#iteration-audit'), /C1 is false/);
    }
    if (scenario === 'cycle') assert.match(await content('#iteration-audit'), /C7 fails/);
    if (scenario === 'drift') assert.match(await content('#iteration-audit'), /C6 fails/);
    if (scenario === 'handoffs') {
      assert.match(await content('#iteration-handoffs'), /Semantic Indexer/);
      assert.match(await content('#iteration-audit'), /C1.*C2.*C3.*C4.*C5.*C6.*C7/);
    }
    await page.click('#reset-iterations');
    assert.equal(await content('#iteration-status'), 'READY');
    assert.equal(await page.locator('#iteration-ledger li').count(), 1);
  }
  await page.locator('#next-iteration').focus();
  await page.keyboard.press('Enter');
  assert.equal(await content('#iteration-status'), 'CONTINUE');

  // Every original profile receives a composition exercise, not a changed method definition.
  const profiles = ['5pp','dialogue-lifecycle','aics','orbit','dialectic','rigvedan','hermeneutic-didactic','dial4','dial4plus','dial4p-possibility','capability-gap','csr','sorr','card-pointer','gdsa','srcb','pisd','ipb'];
  for (const slug of profiles) {
    const response = await page.request.get(base + '/methods/' + slug + '/');
    assert.ok(response.ok());
    const html = await response.text();
    assert.ok(html.includes('id="cbe-example"'), slug + ': missing additive exercise');
    assert.ok(html.includes('../cbe/#lab') && html.includes('../cbe-ix/#lab'), slug + ': missing lab route');
  }
  for (const [slug, result, pass, blocked] of [
    ['5pp', '#receiptStatus', 'passed', 'failed'],
    ['dialogue-lifecycle', '#transitionStatus', 'allowed', 'blocked'],
    ['aics', '#gateStatus', 'authorized', 'blocked'],
  ]) {
    await page.goto(base + '/methods/' + slug + '/');
    await page.locator('[data-cbe-preset="analysis"]').click();
    assert.equal(await content(result), pass, slug + ': analysis fixture');
    await page.locator('[data-cbe-preset="blocked"]').click();
    assert.equal(await content(result), blocked, slug + ': boundary blocker');
    assert.match(await content('.cbe-preset-context'), /CBE-IX/);
  }

  for (const slug of ['cbe', 'cbe-ix']) {
    await page.goto(base + '/methods/' + slug + '/');
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), slug + ': horizontal overflow at ' + width);
      await page.screenshot({ path: shots + '/' + slug + '-' + width + '.png', fullPage: true });
    }
    const links = await page.locator('a[href]').evaluateAll(anchors => [...new Set(anchors.map(a => a.href))]);
    for (const link of links.filter(url => url.startsWith(base))) {
      const url = new URL(link);
      const response = await page.request.get(url.href);
      assert.ok(response.ok(), 'Broken route: ' + link);
      if (url.hash) {
        assert.ok((await response.text()).includes('id="' + url.hash.slice(1) + '"'), 'Missing anchor: ' + link);
      }
    }
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  for (const slug of ['cbe', 'cbe-ix']) {
    await fallback.goto(base + '/methods/' + slug + '/');
    assert.ok(await fallback.locator('#example').isVisible());
    assert.ok(await fallback.locator('noscript').isVisible());
    assert.equal(await fallback.locator('.lab-grid').isVisible(), false, 'Disabled interactions must not appear usable');
  }
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log('PASS CBE: candidate ownership, split and uncertainty; eight IX terminal cases; reset and keyboard; all 18 existing examples; three gate presets; routes, mobile and no-JS fallback.');
} finally {
  await browser.close();
}
