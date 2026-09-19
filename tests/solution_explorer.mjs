import { chromium } from 'playwright';
import assert from 'node:assert/strict';

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
  await page.screenshot({ path: '/tmp/solution-explorer.png', fullPage: true });
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto(`${base}/methods/solutions/`);
  assert.equal(await fallback.locator('.solution:visible').count(), 10);
  assert.equal(await fallback.locator('#solution-filters').isVisible(), false);
  await noJs.close();
  assert.deepEqual(errors, []);
  console.log('Solution explorer passed: combined filters, URL restore, empty/reset states, keyboard details, 18 routes, mobile layout and no-JS fallback.');
} finally {
  await browser.close();
}
