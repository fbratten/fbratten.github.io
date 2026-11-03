'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const M=require('../labs/aristotle-to-agents/model.js');
const D=JSON.parse(fs.readFileSync(new URL('../labs/aristotle-to-agents/graph.json','file://'+__filename),'utf8'));
const ids=new Set(D.noder.map(n=>n.id));
assert.equal(ids.size,74);assert.equal(D.kanter.length,111);assert.equal(D.views.length,5);
for(const v of D.views){for(const c of v.columns)for(const id of c.nodes)assert(ids.has(id),id);}
for(const e of D.kanter){assert(ids.has(e.källa));assert(ids.has(e.mål));assert(D.typer[e.typ]);for(const r of e.referenser)assert(D.källor[r]);}
for(const n of D.noder)for(const s of n.källor)assert(D.källor[s]);
assert.deepEqual(M.truthTable('and').map(r=>r.result),[false,false,false,true]);
assert.deepEqual(M.truthTable('or').map(r=>r.result),[false,true,true,true]);
assert.deepEqual(M.truthTable('implies').map(r=>r.result),[true,true,false,true]);
assert(M.syllogism('valid',true).sound);assert(!M.syllogism('valid',false).sound);assert(!M.syllogism('invalid',true).sound);
const repeated=M.retrieval(3,false),contrasted=M.retrieval(3,true);
assert.equal(repeated.origins,1);assert.equal(repeated.challenge,0);assert.equal(contrasted.origins,3);assert.equal(contrasted.challenge,2);
// Exhaust every combination of the four controls, including a bad plan that is blocked.
for(let mask=0;mask<16;mask++){
 const gates={boundary:!!(mask&1),memory:!!(mask&2),scope:!!(mask&4),approval:!!(mask&8)};
 const r=M.agentTrace(gates);assert.equal(r.trace.length,5);
 assert.equal(r.badPlan,!gates.boundary||!gates.memory);
 assert.equal(r.unsafeAction,(!gates.boundary||!gates.memory)&&!gates.scope&&!gates.approval);
}
assert.equal(M.circulation(8,false).origins,1);assert.equal(M.circulation(8,true).origins,2);
const original=fs.readFileSync(new URL('../labs/aristotle-to-agents/original-graph.json','file://'+__filename));
assert.equal(require('node:crypto').createHash('sha256').update(original).digest('hex'),D.metadata.original_sha256);
console.log('PASS: graph integrity, original preservation, truth tables, retrieval provenance, 16 agent configurations and circulation.');
