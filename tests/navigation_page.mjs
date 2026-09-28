import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const shots = process.env.NAV_SCREENSHOT_DIR;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true });
async function settleVisibleImages(page) {
  await page.locator('img').evaluateAll(images => Promise.all(images
    .filter(image => image.getBoundingClientRect().top < innerHeight + 150)
    .map(image => image.decode().catch(() => {}))));
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(base + '/');
  await page.getByRole('navigation', { name: 'Site navigation', exact: true }).waitFor();
  assert.equal(await page.locator('.fb-links a').count(), 6);
  assert.equal(await page.locator('[data-article]').count(), 3);
  await page.getByRole('link', { name: 'All 46 articles' }).click();
  assert.match(page.url(), /\/articles\/$/);
  const total = await page.locator('[data-article]').count();
  assert.ok(total >= 46);
  const search = page.getByRole('searchbox', { name: 'Search articles' });
  await search.fill('When a Rule Is Not a Control');
  assert.equal(await page.locator('[data-article]:visible').count(), 1);
  assert.match(await page.locator('[data-article]:visible a').getAttribute('href'), /adaptivearts\.ai\/blog\/when-a-rule-is-not-a-control/);
  await search.fill('this-does-not-match-an-article-1234');
  assert.equal(await page.locator('[data-article]:visible').count(), 0);
  assert.ok(await page.locator('.fb-no-results').isVisible());
  await search.fill('');
  const groups = { 'Essays': 10, 'Technical guides': 17, 'Case studies': 2,
    'Research notes': 3, 'AI technology': 1, 'Earlier posts': 13 };
  assert.equal(await page.getByLabel('Category', { exact: true }).locator('option').count(), 7);
  for (const [category, expected] of Object.entries(groups)) {
    await page.getByLabel('Category', { exact: true }).selectOption(category);
    assert.equal(await page.locator('[data-article]:visible').count(), expected);
    for (const card of await page.locator('[data-article]:visible').all()) {
      assert.equal(await card.getAttribute('data-category'), category);
      if (category === 'Earlier posts') assert.match(await card.locator('time').getAttribute('datetime'), /^202[45]-/);
    }
  }
  await page.getByLabel('Category', { exact: true }).selectOption('');
  assert.equal(await page.locator('[data-article]:visible').count(), total);

  for (const route of ['/', '/projects/', '/methods/', '/articles/', '/blueprint-ai-studio/', '/all-pages/']) {
    await page.goto(base + route);
    if (shots && route === '/') {
      await page.locator('img').evaluateAll(images => Promise.all(images.map(image => {
        image.loading = 'eager'; return image.decode().catch(() => {});
      })));
      await page.screenshot({ path: `${shots}/home-full.png`, fullPage: true });
    }
    if (shots) await settleVisibleImages(page);
    if (shots) await page.screenshot({ path: `${shots}/${route === '/' ? 'home' : route.split('/')[1]}-desktop.png`, fullPage: false });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/methods/', '/methods/cbe/', '/methods/cbe-ix/', '/articles/', '/projects/', '/labs/', '/blueprint-ai-studio/', '/blueprint-ai-studio/labs/rules-authority-enforcement/', '/404.html']) {
    await page.goto(base + route);
    const button = page.locator('.fb-menu-button');
    await button.waitFor();
    const bounds = await button.boundingBox();
    assert.ok(bounds.width >= 44 && bounds.height >= 44, `Small menu target: ${route}`);
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.equal(await button.textContent(), 'Close');
    assert.ok(await page.locator('.fb-mobile-project').getByRole('link').isVisible());
    assert.ok(await page.getByRole('navigation', { name: 'Site navigation', exact: true }).isVisible());
    if (shots && route === '/') await page.screenshot({ path: `${shots}/menu-mobile.png` });
    await page.keyboard.press('Escape');
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Menu');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `Mobile overflow: ${route}`);
    if (shots && ['/', '/articles/', '/methods/', '/blueprint-ai-studio/'].includes(route)) {
      await settleVisibleImages(page);
      await page.screenshot({ path: `${shots}/${route === '/' ? 'home' : route.split('/')[1]}-mobile.png`, fullPage: false });
    }
  }

  await page.goto(base + '/methods/');
  assert.equal(await page.locator('#labs .fb-route').count(), 6);
  assert.equal(await page.locator('a.card[href="./cbe/"] h3').innerText(), 'Responsibility boundary design');
  await page.goto(base + '/blueprint-ai-studio/');
  assert.ok(await page.getByRole('heading', { name: 'Progress', exact: true }).isVisible());
  assert.equal(await page.locator('.fb-progress-entry').count(), 3);
  assert.match(await page.locator('main').innerText(), /coming-soon page/);
  const feed = await page.request.get(base + '/blueprint-ai-studio/feed.xml');
  assert.equal(feed.status(), 200);
  assert.match(await feed.text(), /<rss version="2.0">/);

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const fallback = await noJS.newPage();
  await fallback.goto(base + '/articles/');
  assert.ok(await fallback.getByRole('navigation', { name: 'Site navigation', exact: true }).isVisible());
  assert.equal(await fallback.locator('[data-article]:visible').count(), total);
  assert.equal(await fallback.locator('.fb-filters').isVisible(), false);
  await fallback.getByRole('navigation', { name: 'Site navigation', exact: true }).getByRole('link', { name: 'Methods & Labs', exact: true }).click();
  assert.equal(await fallback.locator('a.card').count(), 20);
  await fallback.getByText('How the methods fit together:', { exact: false }).click();
  assert.ok(await fallback.getByRole('heading', { name: 'From methods to practical system capability' }).isVisible());
  await noJS.close();
  console.log(`PASS: navigation, keyboard menu, filters (${total} articles), mobile layout, progress feed and no-JS routes.`);
} finally {
  await browser.close();
}
