import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/methods/solutions/`);
  const visible = page.locator('.solution:visible');
  assert.equal(await visible.count(), 10);
  await page.selectOption('#problem', 'context');
  assert.equal(await visible.count(), 3);
  await page.selectOption('#stage', 'reenter');
  await page.selectOption('#scale', 'portfolio');
  assert.equal(await visible.count(), 2);
  assert.match(page.url(), /problem=context/);
  await page.reload();
  assert.equal(await visible.count(), 2);
  await page.selectOption('#stage', 'execute');
  assert.equal(await visible.count(), 0);
  assert.equal(await page.locator('#no-results').isVisible(), true);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  assert.equal(await visible.count(), 10);
  assert.equal(new URL(page.url()).search, '');
  await page.goto(`${base}/methods/solutions/?problem=invalid&scale=portfolio#workflow-governance`);
  assert.equal(await page.locator('#workflow-governance').isVisible(), true);
  await page.locator('#workflow-governance summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#workflow-governance details').getAttribute('open'), '');
  const routes = await page.locator('.solution .chips a').evaluateAll(links => [...new Set(links.map(a => a.href))]);
  assert.equal(routes.length, 18);
  for (const url of routes) assert.equal((await page.request.get(url)).ok(), true, url);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
  }
  await page.goto(`${base}/methods/solutions/`);
  await page.locator('[data-problem-preset="context"]').click();
  assert.equal(await visible.count(), 3);
  assert.equal(await page.locator('[data-problem-preset="context"]').getAttribute('aria-pressed'), 'true');
  await page.selectOption('#scale', 'portfolio');
  await page.locator('#capability-matrix summary').click();
  assert.equal(await page.locator('#capability-matrix tbody tr:visible').count(), 2);
  // Check every matrix cell against the actual capability links, not duplicated expectations.
  assert.equal(await page.evaluate(() => {
    const columns = [...document.querySelectorAll('#capability-matrix thead a')].map(a => a.getAttribute('href'));
    return [...document.querySelectorAll('[data-pattern]')].every(row => {
      const links = [...document.querySelectorAll(`#${row.dataset.pattern} .chips a`)].map(a => a.getAttribute('href'));
      return [...row.querySelectorAll('td')].every((cell, i) => cell.classList.contains('included') === links.includes(columns[i]));
    });
  }), true);
  await page.locator('#capability-matrix tbody tr:visible th a').first().click();
  assert.equal(await visible.count(), 10);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.locator('[data-problem-preset="execution"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await visible.count(), 2);
  await page.keyboard.press('Enter');
  assert.equal(await visible.count(), 10);
  const shots = process.env.SCREENSHOT_DIR || '/tmp/solution-explorer-visuals';
  await mkdir(shots, { recursive: true });
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.matrix-scroll').scrollTo(0, 0); });
    await page.screenshot({ path: `${shots}/atlas-${width}.png`, fullPage: true });
    const overflow = await page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      elements: [...document.querySelectorAll('body *')].filter(el => !el.closest('.matrix-scroll') && el.getBoundingClientRect().right > innerWidth).map(el => el.tagName + '.' + el.className)
    }));
    assert.equal(overflow.fits, true, `matrix overflow at ${width}: ${overflow.elements.join(', ')}`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.matrix-scroll').focus();
  assert.equal(await page.locator('.matrix-scroll').evaluate(el => el === document.activeElement), true);
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto(`${base}/methods/solutions/`);
  assert.equal(await fallback.locator('.solution:visible').count(), 10);
  assert.equal(await fallback.locator('#solution-filters').isVisible(), false);
  assert.equal(await fallback.locator('.problem-shortcuts').isVisible(), false);
  await fallback.locator('#capability-matrix summary').click();
  assert.equal(await fallback.locator('#capability-matrix tbody tr:visible').count(), 10);
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log('Solution explorer passed: combined filters, URL restore, empty/reset states, keyboard details, 18 routes, mobile layout and no-JS fallback.');
} finally {
  await browser.close();
}
