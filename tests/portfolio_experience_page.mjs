import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/projects/');
  const groups=['flagships','development','supporting','archive'],counts=[4,1,5,11];
  assert.equal(await page.locator('[role=tab]').count(),4);
  for(let i=0;i<groups.length;i++){
   await page.locator('#category-'+groups[i]).click();
   assert.equal(await page.locator('[data-project-panel]:visible').count(),1);
   assert.equal(await page.locator('#category-'+groups[i]).getAttribute('aria-selected'),'true');
   assert.equal(+(await page.locator('[data-project-count="'+groups[i]+'"]').textContent()),counts[i]);
   assert(await page.locator('#'+groups[i]).isVisible());
  }
  await page.locator('#category-archive').press('Home');
  assert.equal(await page.locator('#category-flagships').getAttribute('aria-selected'),'true');
  await page.locator('#category-flagships').press('ArrowRight');
  assert.equal(await page.locator('#category-development').getAttribute('aria-selected'),'true');
  await page.goto(base+'/projects/#supporting');assert(await page.locator('#supporting').isVisible());
  await page.goto(base+'/methods/');assert.notEqual(await page.locator('.method-overview').getAttribute('open'),null);
  for(const route of ['/','/projects/','/methods/','/labs/','/all-pages/']){
   await page.goto(base+route);
   assert(await page.locator('a[href="/harnessing/"]').count()>0,route+' missing Harnessing Library');
  }
  await page.goto(base+'/labs/aristotle-to-agents/');
  const box=await page.locator('#graph-scroll').boundingBox();
  if(width>1000){assert(box.width>=width*.85);assert(box.height>=640);}
  const node=await page.locator('[data-node="aristoteles"] rect').boundingBox();
  assert(node.width>=230,'Nodes must start at a readable scale');
  await page.locator('#expand-map').click();assert(await page.locator('#map-dialog').isVisible());
  await page.locator('#map-dialog [data-node="aristoteles"]').press('Enter');
  assert.match(await page.locator('#node-detail').innerText(),/Sofistiska|Sophistical/);
  await page.keyboard.press('Escape');assert(!(await page.locator('#map-dialog').isVisible()));
  assert.equal(await page.evaluate(()=>document.activeElement.id),'expand-map');
  await page.locator('#zoom-fit').click();
  const fit=await page.locator('#graph').boundingBox();assert(fit.width<=box.width+1);
  await page.locator('#zoom-out').click();assert((await page.locator('#graph').boundingBox()).width<=fit.width+1);
  await page.locator('#zoom-reset').click();
  assert((await page.locator('[data-node="aristoteles"] rect').boundingBox()).width>=230);
  await page.locator('[data-view="agents"]').click();
  await page.locator('[data-atlas-language][hreflang="en"]').click();
  assert.match(page.url(),/\/en\/#agents$/);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('[data-view="agents"]').getAttribute('aria-pressed'),'true');
  for(const view of ['overview','history','llm','agents','interplay']){
   await page.locator('[data-view="'+view+'"]').click();
   assert.match(await page.locator('#lab-title').innerText(),/Lab/);
   assert(!/[åäöÅÄÖ]/.test(await page.locator('#lab').innerText()),'Untranslated English lab '+view);
  }
  await page.locator('#all-nodes').check();assert.equal(await page.locator('#graph .node').count(),74);
  assert(!/Argumentation \/ retorik|Språkmodeller|Verifiering \/ kontroll/.test(await page.locator('#graph').innerText()),'Untranslated node/category text');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);await page.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false}),page=await ctx.newPage();
 await page.goto(base+'/projects/');assert.equal(await page.locator('[data-project-panel]:visible').count(),4);
 await page.goto(base+'/labs/aristotle-to-agents/en/');assert(await page.locator('#fallback').isVisible());
 assert.match(await page.locator('#fallback').innerText(),/JavaScript/);
 await ctx.close();console.log('PASS: category panels, keyboard/hash/fallback, expanded overview, Harnessing discovery, large map and English variant at desktop/mobile.');
}finally{await browser.close();}
