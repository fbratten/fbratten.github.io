import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { chromium } from "playwright";

const ctx = {};
runInNewContext(readFileSync(new URL("../labs/ai-testing/engine.js", import.meta.url), "utf8"), ctx);
const { domains, simulateFault, estimatePolicy } = ctx.AITesting;
assert.equal(Object.keys(domains).length, 4);
assert.ok(Object.values(domains).every(domain => domain.stages.length === 5 && domain.challenge.answer < 5));
const on = [true, true, true, true, true];
assert.equal(simulateFault("injection", on).caughtAt, 0);
assert.equal(simulateFault("loop", on).caughtAt, 2);
assert.equal(simulateFault("schema", on).caughtAt, 3);
assert.equal(simulateFault("retrieval", on).caughtAt, 1);
assert.equal(simulateFault("retrieval", [true, false, true, true, true]).caughtAt, 4);
assert.equal(simulateFault("retrieval", [true, false, true, true, false]).escaped, true);
assert.ok(simulateFault("schema", on).states[4].state === "skipped");
const sample = { commits: 800, cases: 500, prFraction: .25, commitFraction: .05, prSample: .1, nights: 20,
  rejectFraction: .3, earlyExit: true, fastPrice: .002, deepPrice: .02, fastSeconds: 3, parallel: 20 };
const tier = estimatePolicy(sample);
assert.ok(tier.optimizedCost < tier.baselineCost);
assert.ok(tier.savings > 0);
assert.equal(tier.perRunCoverage.nightly, 1);
assert.ok(estimatePolicy({...sample, earlyExit: false}).optimizedCost > tier.optimizedCost);
assert.ok(estimatePolicy({...sample, commitFraction: 1}).optimizedCost > tier.optimizedCost);
assert.throws(() => estimatePolicy({...sample, prSample: 1.1}));

// Mutation Gate Lab: verify all 13 source-pinned educational cases without executing real mutations.
const mgContext = {};
runInNewContext(readFileSync(new URL("../labs/mutation-gate/model.js", import.meta.url), "utf8"), mgContext);
const {data: mutationData, simulate: simulateMutation} = mgContext.MutationGateLab;
assert.equal(mutationData.cases.length, 13);
assert.equal(new Set(mutationData.cases.map(m => m.id)).size, 13);
for (const m of mutationData.cases) {
 assert.equal(simulateMutation(m.id, "baseline").status, "PASS");
 assert.equal(simulateMutation(m.id, "mutated").status, "CAUGHT");
 assert.equal(simulateMutation(m.id, "blind").status, "ESCAPED");
 assert.equal(simulateMutation(m.id, "broken").status, "BROKEN");
 assert.equal(simulateMutation(m.id, "mutated").real_execution, false);
 assert.equal(simulateMutation(m.id, "mutated").observed_in_reference_ci, "CAUGHT");
}
assert.throws(() => simulateMutation("unknown", "mutated"));

const root = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const screenshotDir = process.env.LAB_SHOT_DIR;
if (screenshotDir) await mkdir(screenshotDir, {recursive:true});
const browser = await chromium.launch({headless:true});
const errors = [];
try {
 const page = await browser.newPage({viewport:{width:1280,height:900}});
 page.on("pageerror", e => errors.push(e.message));
 await page.goto(root + "/labs/testing-architecture/");
 assert.equal(await page.locator("#architecture-flow .lab-node").count(), 5);
 await page.locator('#architecture-flow [data-stage="3"]').click();
 await page.getByRole("button", {name:"Check my choice"}).click();
 assert.match(await page.locator("#challenge-feedback").textContent(), /Correct/);
 await page.locator('[data-domain="rag"]').click();
 await page.locator('#architecture-flow [data-stage="2"]').click();
 await page.getByRole("button", {name:"Check my choice"}).click();
 assert.match(await page.locator("#challenge-feedback").textContent(), /Correct/);

 await page.goto(root + "/labs/fault-injection/");
 assert.equal(await page.locator("#fault-flow .lab-node").count(), 5);
 await page.locator('[data-fault="retrieval"]').click();
 assert.match(await page.locator("#fault-outcome").textContent(), /Gate 2/);
 await page.locator('[data-gate="1"]').uncheck();
 assert.match(await page.locator("#fault-outcome").textContent(), /Gate 5/);
 await page.locator('[data-gate="4"]').uncheck();
 assert.match(await page.locator("#fault-outcome").textContent(), /Unintercepted/);
 const receipt = JSON.parse(await page.locator("#fault-receipt").textContent());
 assert.equal(receipt.simulation, true);
 assert.equal(receipt.real_execution, false);
 assert.equal(receipt.observed_tokens, null);
 await page.locator("#reset-gates").click();
 assert.match(await page.locator("#fault-outcome").textContent(), /Gate 2/);

 await page.goto(root + "/labs/ai-evaluation-ci-cd/");
 const parseMoney = value => Number(value.replace(/[^0-9.]/g,""));
 const current = parseMoney(await page.locator("#estimated-total").textContent());
 const savings = parseMoney(await page.locator("#estimated-savings").textContent());
 assert.ok(current>0 && savings>0);
 await page.locator("#earlyExit").uncheck();
 const withoutExit = parseMoney(await page.locator("#estimated-total").textContent());
 assert.ok(withoutExit>current, "Early-exit switch should affect modeled costs");
 assert.equal(await page.locator("#policy-rows tr").count(), 3);
 if (screenshotDir) await page.screenshot({path:screenshotDir+"/ci-cd-desktop.png",fullPage:true});

 await page.goto(root + "/labs/mutation-gate/");
 assert.equal(await page.locator("#ci-jobs article").count(), 5);
 assert.equal(await page.locator("#mutation-select option").count(), 13);
 assert.equal(await page.locator("#mutation-verdict").textContent(), "PASS");
 await page.locator('[data-mode="mutated"]').click();
 assert.equal(await page.locator("#mutation-verdict").textContent(), "CAUGHT");
 let mr = JSON.parse(await page.locator("#mutation-receipt").textContent());
 assert.equal(mr.simulation, true);
 assert.equal(mr.real_execution, false);
 assert.equal(mr.reference_head, mutationData.head);
 await page.locator('[data-mode="blind"]').click();
 assert.equal(await page.locator("#mutation-verdict").textContent(), "ESCAPED");
 await page.locator('[data-mode="broken"]').click();
 assert.equal(await page.locator("#mutation-verdict").textContent(), "BROKEN");
 await page.locator("#mutation-select").selectOption("live-bridge-group-id-value-unchecked");
 assert.match(await page.locator("#scenario-title").textContent(), /group ID values/i);
 await page.locator('[data-mode="mutated"]').click();
 assert.equal(await page.locator("#mutation-verdict").textContent(), "CAUGHT");
 await page.locator('input[name="proof-answer"][value="caught"]').check();
 await page.locator("#check-quiz").click();
 assert.match(await page.locator("#quiz-feedback").textContent(), /Correct/);
 assert.ok(await page.locator('a[href$="#term-mutation-gate"]').count() > 0);
 assert.ok(await page.locator('a[href$="#term-rollback"]').count() > 0);
 assert.ok(await page.locator('a[href$="#term-merge"]').count() > 0);
 if (screenshotDir) await page.screenshot({path:screenshotDir+"/mutation-gate-desktop.png",fullPage:true});

 await page.setViewportSize({width:390,height:844});
 for (const path of ["/labs/testing-architecture/","/labs/fault-injection/","/labs/ai-evaluation-ci-cd/","/labs/mutation-gate/"]) {
  await page.goto(root+path);
  const x = await page.evaluate(() => ({width:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(x.width <= x.viewport+3, "Mobile overflow on "+path+": "+JSON.stringify(x));
  if (screenshotDir) await page.screenshot({path:screenshotDir+"/"+path.split("/")[2]+"-mobile.png",fullPage:true});
 }
 assert.deepEqual(errors, [], "No JavaScript errors in any lab");
 console.log("PASS: 4 labs, four domains, fault interception/fallback, CI/CD estimates, synthetic receipts and mobile layout.");
} finally { await browser.close(); }
