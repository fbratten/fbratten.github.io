const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=require('node:path').resolve(__dirname,'..');
const base=root+'/labs/aristotle-to-agents/';
const sv=JSON.parse(fs.readFileSync(base+'graph.json','utf8'));
const en=JSON.parse(fs.readFileSync(base+'en/graph.json','utf8'));
assert.equal(en.noder.length,74);assert.equal(en.kanter.length,111);
assert.deepEqual(en.noder.map(n=>n.id),sv.noder.map(n=>n.id));
assert.deepEqual(en.kanter.map(e=>[e.id,e.källa,e.mål,e.typ,e.referenser]),sv.kanter.map(e=>[e.id,e.källa,e.mål,e.typ,e.referenser]));
assert.deepEqual(en.noder.map(n=>[n.id,n.kategori,n.källor]),sv.noder.map(n=>[n.id,n.kategori,n.källor]));
assert.deepEqual(Object.keys(en.källor),Object.keys(sv.källor));
for(const id of Object.keys(sv.källor))assert.equal(en.källor[id].url,sv.källor[id].url);
assert.deepEqual(en.views.map(v=>[v.id,v.columns.map(c=>c.nodes)]),sv.views.map(v=>[v.id,v.columns.map(c=>c.nodes)]));
for(const node of en.noder){assert(node.label&&node.beskrivning);}
for(const edge of en.kanter){assert(edge.relation&&edge.förklaring);}
const A=require(base+'model.js'),B=require(base+'en/model.js');
for(const form of ['valid','invalid'])for(const p of [true,false]){
 const a=A.syllogism(form,p),b=B.syllogism(form,p);
 for(const k of ['valid','premise','sound'])assert.equal(a[k],b[k]);
}
for(const op of ['and','or','implies'])assert.deepEqual(A.truthTable(op),B.truthTable(op));
for(let k=1;k<=6;k++)for(const contrast of [true,false]){
 const a=A.retrieval(k,contrast),b=B.retrieval(k,contrast);
 assert.deepEqual([a.origins,a.support,a.challenge,a.rows.map(r=>[r.id,r.origin])],[b.origins,b.support,b.challenge,b.rows.map(r=>[r.id,r.origin])]);
}
for(let mask=0;mask<16;mask++){
 const gates={boundary:!!(mask&1),memory:!!(mask&2),scope:!!(mask&4),approval:!!(mask&8)};
 const a=A.agentTrace(gates),b=B.agentTrace(gates);
 assert.equal(a.unsafeAction,b.unsafeAction);assert.equal(a.badPlan,b.badPlan);assert.equal(a.trace.length,b.trace.length);
}
for(let count=1;count<=8;count++)for(const independent of [true,false]){
 const a=A.circulation(count,independent),b=B.circulation(count,independent);
 assert.equal(a.voices,b.voices);assert.equal(a.origins,b.origins);
}
console.log('PASS: bilingual graph identity, references, 5 views and deterministic outcome parity.');
