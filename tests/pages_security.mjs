import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const externalScripts = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const request = route.request();
    if (request.resourceType() === 'script' && new URL(request.url()).origin !== new URL(base).origin) {
      externalScripts.push(request.url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto(base + '/worktrace/');
  await page.locator('#example').click();
  const examples = await page.locator('#events pre').allTextContents();
  assert.equal(examples.length, 4);
  assert.deepEqual(new Set(examples.map(s => JSON.parse(s).time_basis)),
    new Set(['order-only', 'source-interval', 'collection-time', 'source-exact']));
  await page.locator('#note').fill('token=synthetic-test-value');
  await page.locator('#record').click();
  assert.match(await page.locator('#status').innerText(), /refused/i);
  assert.equal(await page.locator('#events pre').count(), 4);

  // Insert an untrusted inline script and wait for the browser's CSP violation.
  const directive = await page.evaluate(() => new Promise(resolve => {
    document.addEventListener('securitypolicyviolation', event => resolve(event.effectiveDirective), {once: true});
    const script = document.createElement('script');
    script.textContent = 'window.untrustedMarker = true';
    document.head.append(script);
    setTimeout(() => resolve('no violation'), 2000);
  }));
  assert.equal(directive, 'script-src-elem');
  assert.equal(await page.evaluate(() => Boolean(window.untrustedMarker)), false);
  await page.goto(base + '/methods/5pp/');
  assert.equal(await page.evaluate(() => window.Chart?.version), '4.4.7');
  // Import the complete 3D dependency graph without relying on runner GPU support.
  const vertex = await page.evaluate(async () => {
    const three = await import('/assets/vendor/three.module.min.js');
    const {OrbitControls} = await import('/assets/vendor/OrbitControls.js');
    return [three.REVISION, typeof OrbitControls];
  });
  assert.deepEqual(vertex, ['160', 'function']);
  assert.deepEqual(externalScripts, []);
  assert.deepEqual(errors, []);
  console.log('PASS: Worktrace, script policy and same-origin chart/3D dependencies');
} finally {
  await browser.close();
}
