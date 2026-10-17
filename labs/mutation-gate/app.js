/* Browser-local teaching interactions. No CI, GitHub action, test or mutation runs here. */
(function(){
'use strict';
const {data,simulate}=window.MutationGateLab;
const byId=id=>document.getElementById(id);
const select=byId('mutation-select');
const glossary='https://fbratten.github.io/From-Blueprint-to-Application/docs/resources/glossary.html#term-';
const groups=[...new Set(data.cases.map(c=>c.group))];
for(const group of groups){
 const section=document.createElement('optgroup');
 section.label=group;
 for(const item of data.cases.filter(c=>c.group===group)){
  const option=document.createElement('option');option.value=item.id;option.textContent=item.title;
  section.appendChild(option);
 }
 select.appendChild(section);
}
function addText(tag,parent,value,className){
 const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;parent.appendChild(e);return e;
}
for(const item of data.ci){
 const article=document.createElement('article');
 addText('h3',article,item.name);
 addText('p',article,item.scope);
 addText('span',article,item.result,'mutation-result');
 byId('ci-jobs').appendChild(article);
}
let mode='baseline';
function current(){return data.cases.find(c=>c.id===select.value)||data.cases[0];}
function showReceipt(){
 const item=current(),result=simulate(item.id,mode);
 const badge=byId('mutation-verdict');badge.textContent=result.status;badge.dataset.state=result.status;
 const note=byId('simulation-status');
 note.textContent=result.explanation;
 byId('mutation-receipt').textContent=JSON.stringify(result,null,2);
 for(const button of document.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(button.dataset.mode===mode));
}
function renderCase(){
 const item=current();
 byId('scenario-title').textContent=item.title;
 byId('scenario-protection').textContent=item.protection;
 byId('scenario-sabotage').textContent=item.sabotage;
 byId('scenario-assertion').textContent=item.assertion;
 byId('scenario-test').textContent=item.test;
 byId('scenario-id').textContent=item.id;
 byId('scenario-before').textContent=item.codeBefore;
 byId('scenario-after').textContent=item.codeAfter;
 byId('scenario-count').textContent=(data.cases.indexOf(item)+1)+' / '+data.cases.length;
 showReceipt();
}
select.addEventListener('change',()=>{mode='baseline';renderCase()});
for(const b of document.querySelectorAll('[data-mode]')){
 b.addEventListener('click',()=>{mode=b.dataset.mode;showReceipt()});
}
byId('case-prev').addEventListener('click',()=>{
 const i=data.cases.indexOf(current());select.value=data.cases[(i+data.cases.length-1)%data.cases.length].id;mode='baseline';renderCase();
});
byId('case-next').addEventListener('click',()=>{
 const i=data.cases.indexOf(current());select.value=data.cases[(i+1)%data.cases.length].id;mode='baseline';renderCase();
});
byId('check-quiz').addEventListener('click',()=>{
 const chosen=document.querySelector('input[name="proof-answer"]:checked');
 const out=byId('quiz-feedback');
 if(!chosen){out.textContent='Choose an answer first.';return;}
 out.textContent=chosen.value==='caught'
  ?'Correct. Baseline PASS and a real assertion FAIL after removing the protection is evidence that the selected test depends on that protection. It does not prove all possible bugs are covered.'
  :'Not quite. A green test after removing the protection is ESCAPED; a setup failure is BROKEN. Neither proves that the protection is covered.';
});
for(const pair of [
 ['mutation-gate','Mutation Gate'],['mutation-testing','Mutation Testing'],['anchor','Mutation anchor'],
 ['caught-mutation','CAUGHT'],['escaped-mutation','ESCAPED'],['broken-mutation','BROKEN'],
 ['commit-hash','Commit SHA'],['github-actions','GitHub Actions'],['rollback','Rollback'],['xss','XSS']]){
 const a=document.createElement('a');a.href=glossary+pair[0];a.target='_blank';a.rel='noopener';a.textContent=pair[1];
 byId('term-shortcuts').appendChild(a);
}
select.value=data.cases[0].id;
renderCase();
})();