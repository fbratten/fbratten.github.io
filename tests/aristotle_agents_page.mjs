import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000}});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/labs/aristotle-to-agents/');
  await page.locator('#atlas-app').waitFor({state:'visible'});
  assert.equal(await page.locator('#view-nav button').count(),5);
  await page.locator('[data-node="aristoteles"]').press('Enter');
  assert.match(await page.locator('#node-detail').innerText(),/Sofistiska|Sophistical/);
  await page.locator('#syll-premise').uncheck();
  assert.match(await page.locator('#lab-result').innerText(),/premissen är falsk/);
  await page.locator('[data-view="history"]').click();
  await page.locator('#logic-op').selectOption('implies');
  assert.equal(await page.locator('#lab-result tbody tr').count(),4);
  await page.locator('[data-view="llm"]').click();
  assert.match(await page.locator('#lab-result').innerText(),/3 dokument · 1 oberoende ursprung/);
  await page.locator('#retrieval-contrast').check();
  assert.match(await page.locator('#lab-result').innerText(),/3 dokument · 3 oberoende ursprung/);
  await page.locator('[data-view="agents"]').click();
  await page.locator('#agent-run').click();
  assert.match(await page.locator('#lab-result').innerText(),/SIMULERAD ÅTGÄRD/);
  await page.locator('#gate-scope').check();await page.locator('#agent-run').click();
  assert.match(await page.locator('#lab-result').innerText(),/BLOCKERAD/);
  await page.locator('#gate-boundary').check();await page.locator('#gate-memory').check();
  await page.locator('#agent-run').click();
  assert.match(await page.locator('#lab-result').innerText(),/LÄS ENDAST/);
  await page.locator('[data-view="interplay"]').click();
  assert.match(await page.locator('#lab-result').innerText(),/3 röster · 1 ursprung/);
  await page.locator('#independent-source').check();
  assert.match(await page.locator('#lab-result').innerText(),/4 röster · 2 ursprung/);
  await page.locator('#all-nodes').check();
  assert.equal(await page.locator('#graph .node').count(),74);
  await page.locator('#node-search').fill('Aristoteles');
  assert.match(await page.locator('#graph-count').innerText(),/sökträffar/);
  const download=page.waitForEvent('download');await page.locator('#export-receipt').click();
  assert.match((await download).suggestedFilename(),/interplay-experiment.json$/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  assert.deepEqual(errors,[]);await context.close();
 }
 const noJs=await browser.newContext({javaScriptEnabled:false});const page=await noJs.newPage();
 await page.goto(base+'/labs/aristotle-to-agents/');assert(await page.locator('#fallback').isVisible());
 await page.getByText('Källor, ursprung och öppna data',{exact:true}).click();
 assert.equal(await page.getByRole('link',{name:/Original:/}).count(),4);
 await noJs.close();console.log('PASS: five atlas views, keyboard nodes, live experiments, exports, mobile layout and JavaScript-off fallback.');
} finally {await browser.close();}
