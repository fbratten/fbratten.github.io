import assert from 'node:assert/strict';
import {readFile, mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const works = JSON.parse(await readFile(new URL('../creative/source/works.json', import.meta.url)));
const shots = process.env.NAV_SCREENSHOT_DIR || '/tmp/creative-visuals';
await mkdir(shots, {recursive: true});
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.cspFailures = [];
    document.addEventListener('securitypolicyviolation', e => window.cspFailures.push(e.effectiveDirective));
  });
  // Deterministic integration check, not a claim of provider playback. Actual
  // external playback observations are recorded separately in the media report.
  await page.route(/^https:\/\/(suno\.com|www\.youtube-nocookie\.com)\//, route => {
    external.push(route.request().url());
    return route.fulfill({contentType:'text/html', body:'<!doctype html><title>Provider boundary fixture</title><p>Allowed frame loaded.</p>'});
  });
  for (const width of [1365, 390, 320]) {
    await page.setViewportSize({width, height:900});
    for (const route of ['/creative/', ...works.map(w => '/creative/' + w.id + '/')]) {
      await page.goto(base + route);
      await page.evaluate(async () => {
        for (const image of document.images) { image.loading = 'eager'; await image.decode(); }
      });
      assert.equal(await page.locator('iframe').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route}: overflow at ${width}`);
      if (route === '/creative/') {
        assert.equal(await page.locator('.work-card').count(), 9);
        assert.equal(await page.locator('#work-grid .work-card').count(), 6);
        const mainImage=await page.locator('#work-grid .work-card figure').first().boundingBox();
        for(const id of ['take-em-all','rise-together-or-we-fall','low-orbit-high-standards']){
          const card=page.locator('.works--compact .work-card[href="/creative/'+id+'/"]');
          assert.equal(await card.count(),1);
          const image=await card.locator('figure').boundingBox();
          assert(Math.abs(image.width/mainImage.width-.2)<.01,'Compact image must be one fifth of full image width');
          const mainGrid=await page.locator('#work-grid').boundingBox();
          assert(image.y>=mainGrid.y+mainGrid.height,'Compact covers must follow the main collection');
        }
        for (const id of ['awaken-wired', 'superposition-baby']) {
          const card = page.locator(`.work-card[href="/creative/${id}/"]`);
          assert.equal(await card.count(), 1);
          await card.click();
          await page.locator('h1').waitFor();
          assert.equal(await page.getByRole('button', {name:'Load Suno player', exact:true}).count(), 1);
          assert.equal(await page.locator('details:not([open])').count(), 0);
          if (id === 'awaken-wired') {
            assert((await page.locator('.intro-source').innerText()).includes('Intro - Phase 3:'));
            await page.locator('.intro-source').scrollIntoViewIfNeeded();
            assert(await page.locator('.intro-source').isVisible());
          } else {
            assert.equal(await page.locator('.learning-terms details').count(), 3);
          }
          await page.goto(base + '/creative/');
        }
        if (width === 390) {
          await page.getByRole('button', {name:'Menu', exact:true}).click();
          // This link reloads the same URL. Await the new document and its
          // deferred menu script before reading the no-JS fallback attribute.
          await Promise.all([
            page.waitForNavigation({waitUntil:'load', timeout:15000}),
            page.getByRole('navigation', {name:'Site navigation'}).getByRole('link', {name:'Music & Film'}).click()
          ]);
          assert.equal(await page.locator('.fb-menu-button').getAttribute('aria-expanded'), 'false');
          assert(await page.locator('.fb-menu-panel').evaluate(panel => panel.hidden));
        }
        await page.screenshot({path: `${shots}/creative-${width}.png`, fullPage:true});
      }
    }
  }
  assert.deepEqual(external, [], 'No provider connection before a click');
  for (const work of works) {
    await page.goto(base + '/creative/' + work.id + '/');
    if (work.suno) {
    await page.getByRole('button', {name:'Load Suno player', exact:true}).click();
    const suno = page.locator('[data-provider="suno"] iframe');
    assert.equal(await suno.getAttribute('src'), 'https://suno.com/embed/' + work.suno);
    await page.frameLocator('[data-provider="suno"] iframe').getByText('Allowed frame loaded.').waitFor();
    }
    if (work.youtube) {
      await page.getByRole('button', {name:'Load YouTube player', exact:true}).click();
      await page.frameLocator('[data-provider="youtube"] iframe').getByText('Allowed frame loaded.').waitFor();
    }
    assert.deepEqual(await page.evaluate(() => window.cspFailures), []);
  }
  await page.goto(base + '/creative/hud-mot-hud/');
  const sound = await page.locator('audio').evaluate(async a => {
    await a.play();
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = {time:a.currentTime, duration:a.duration, error:a.error?.code ?? null};
    a.pause(); return result;
  });
  assert(sound.time > 0 && Math.abs(sound.duration - 12.63156) < 0.01 && sound.error === null);
  assert.deepEqual(await page.evaluate(() => window.cspFailures), []);
  // A non-admitted frame remains blocked even on a creative page.
  const blocked = await page.evaluate(() => new Promise(resolve => {
    document.addEventListener('securitypolicyviolation', e => resolve(e.effectiveDirective), {once:true});
    const frame = document.createElement('iframe'); frame.src = 'https://example.org/'; document.body.append(frame);
    setTimeout(() => resolve('not blocked'), 2000);
  }));
  assert.equal(blocked, 'frame-src');
  assert.deepEqual(errors, []);
  const noJS = await browser.newContext({javaScriptEnabled:false});
  const plain = await noJS.newPage();
  await plain.goto(base + '/creative/');
  await plain.locator('.work-card').first().click();
  await plain.getByRole('link', {name:'Open on Suno', exact:false}).waitFor();
  assert.equal(await plain.locator('audio').count(), 1);
  await noJS.close();
  console.log('PASS: creative desktop/mobile/no-JS navigation, original images, WAV playback, opt-in frame policy and rejected unapproved origin.');
} finally { await browser.close(); }
