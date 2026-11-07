import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({viewport:{width,height:960}, reducedMotion:'reduce'});
    const errors=[];
    page.on('pageerror', e=>errors.push(String(e)));
    page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
    const response=await page.goto(base+'/harnessing/', {waitUntil:'networkidle'});
    assert(response?.ok());
    await page.locator('[data-method-choice]').first().waitFor();
    const methods=await page.locator('#harness-library-data').evaluate(el=>JSON.parse(el.textContent).methods);
    assert.equal(await page.locator('[data-method-choice]').count(),15);
    const layout=await page.locator('#method-menu').evaluate(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {max:s.maxHeight,overflow:s.overflowY,scroll:el.scrollHeight,client:el.clientHeight,
        contained:[...el.children].every(x=>{const b=x.getBoundingClientRect();return b.top>=r.top-1&&b.bottom<=r.bottom+1;})};
    });
    assert.equal(layout.max,'none');
    assert(!['auto','scroll','hidden'].includes(layout.overflow));
    assert(layout.scroll<=layout.client+1 && layout.contained,'Method list clips entries');
    for(const m of methods){
      await page.locator(`[data-method-choice="${m.id}"]`).click();
      assert.equal(await page.locator('#method-title').textContent(),m.name);
      assert.equal(await page.locator('#method-reading .workplace-example').count(),2);
    }
    await page.locator('#method-query').fill('no-such-method-5981');
    assert.equal(await page.locator('[data-method-choice]').count(),0);
    assert(await page.locator('#method-reading').isHidden());
    await page.locator('#method-query').fill('');
    await page.locator('#method-group').selectOption('Orientation');
    assert.equal(await page.locator('[data-method-choice]').count(), methods.filter(x=>x.group==='Orientation').length);
    await page.locator('#method-group').selectOption('all');
    await page.locator('[data-terminal-step="3"]').click();
    assert.match(await page.locator('#terminal-detail').textContent(),/Apply DIALECTIC here/);
    await page.locator('[data-terminal-step="5"]').click();
    const pending=await page.locator('#terminal-confirm-result').textContent();
    await page.locator('#terminal-confirmed').check();
    assert.notEqual(await page.locator('#terminal-confirm-result').textContent(),pending);
    await page.locator('#terminal-scenario').selectOption('pallet');
    assert.match(await page.locator('#terminal-progress').textContent(),/Moment 1 of 6/);
    const pipelines=await page.locator('[data-pipeline]').evaluateAll(els=>els.map(x=>x.dataset.pipeline));
    assert.equal(pipelines.length,6);
    for(const id of pipelines){
      await page.locator(`[data-pipeline="${id}"]`).click();
      assert.equal(await page.locator('[data-pipeline-stage]').count(),5);
      await page.locator('[data-pipeline-stage="4"]').click();
      assert((await page.locator('#pipeline-detail').textContent()).includes('Input contract'));
    }
    await page.locator('#handoff-state').selectOption('missing');
    assert.match(await page.locator('#handoff-result').textContent(),/held/);
    await page.locator('#handoff-state').selectOption('mismatch');
    assert.match(await page.locator('#handoff-result').textContent(),/another case or revision/);
    await page.locator('[data-demo="context"]').click();
    assert.match(await page.locator('#context-result').textContent(),/14/);
    await page.locator('#context-gate').check();
    assert.match(await page.locator('#context-result').textContent(),/30/);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');
    assert.deepEqual(errors,[]);
    console.log(`PASS harnessing ${width}px: all methods, scenarios, pipelines, filters, lab and unclipped list`);
    await page.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(base+'/harnessing/');
  assert.equal(await page.locator('noscript details').count(),15);
  await page.locator('noscript details').first().locator('summary').click();
  assert(await page.locator('noscript details').first().locator('h4').first().isVisible());
  console.log('PASS harnessing JavaScript-off method reading');
  await context.close();
} finally { await browser.close(); }
