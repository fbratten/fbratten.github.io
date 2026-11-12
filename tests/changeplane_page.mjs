import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch();
try{
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/changeplane/');
  await page.waitForFunction(()=>document.querySelector('#integrity-state').textContent==='MATCH');
  const original=await page.locator('.hash-row code').allTextContents();
  assert.equal(original.length,6);
  for(const scenario of ['event','patch','intent']){
   await page.locator('[data-case="'+scenario+'"]').click();
   await page.waitForFunction(s=>document.querySelector('[data-case="'+s+'"]').getAttribute('aria-pressed')==='true',scenario);
   assert.equal(await page.locator('#integrity-state').innerText(),'CHANGED');
   const rows=await page.locator('.hash-row').all();
   assert.equal(rows.length,3);
   const labels=['intent','event','patch'];
   for(let i=0;i<rows.length;i++){
    const [sealed,current]=await rows[i].locator('code').allTextContents();
    assert.equal(sealed,original[i*2],'Original seal must remain unchanged');
    assert.equal(sealed.slice(8)===current.slice(8),labels[i]!==scenario);
   }
  }
  await page.locator('[data-case="intact"]').click();
  await page.waitForFunction(()=>document.querySelector('#integrity-state').textContent==='MATCH');
  assert.deepEqual(await page.locator('.hash-row code').allTextContents(),original);
  await page.locator('summary').click();assert(await page.locator('.technical pre').isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);
  assert.deepEqual(errors,[]);await page.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false}),page=await ctx.newPage();
 await page.goto(base+'/changeplane/');
 assert(await page.locator('noscript').isVisible());
 assert.match(await page.locator('noscript').innerText(),/all three fingerprints match/);
 await page.locator('summary').click();assert(await page.locator('.technical pre').isVisible());
 await ctx.close();
 console.log('PASS: ChangePlane original seal, three tamper cases, reset, desktop/mobile overflow and no-JS explanation.');
}finally{await browser.close();}
