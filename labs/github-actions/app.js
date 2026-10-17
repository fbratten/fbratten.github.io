/* Read-only GitHub Actions Lab 05. No network calls or GitHub mutations. */
(function(){
'use strict';
const {data,stepFor,predictEvent,count}=window.GitHubActionsLab;
const byId=id=>document.getElementById(id);
const glossaryBase='https://fbratten.github.io/From-Blueprint-to-Application/docs/resources/glossary.html#term-';
const phases=[...new Set(data.success.steps.map(s=>s.phase))];
const statusLabel={success:'SUCCESS',failure:'FAILURE',skipped:'SKIPPED'};
let selectedRun='success',selectedStep=10;
function text(tag,value,className){
 const element=document.createElement(tag);element.textContent=value;
 if(className)element.className=className;
 return element;
}
const filter=byId('step-phase'),search=byId('step-search');
for(const group of phases){
 const option=document.createElement('option');option.value=group;option.textContent=group;filter.appendChild(option);
}
function current(){return data[selectedRun];}
function conditionExplanation(step,run){
 switch(step.condition){
 case 'pull_request':return run.event==='pull_request'?'Enabled: this recorded event is pull_request.':'SKIPPED by design: if: github.event_name == pull_request, but this run was triggered by '+run.event+'.';
 case 'push':return run.event==='push'?'Enabled for a push. This step checks the deployed site, not just a local preview.':'This step requires a push. Here the event was pull_request, so no live site verification was performed by this job.';
 case 'failure':return run.conclusion==='failure'?'The diagnostics step runs after a previous failure (if: failure()).':'The diagnostics step is intentionally skipped for a successful run (if: failure()).';
 case 'always':return 'This step uses if: always() to attempt to save evidence even after failed tests. A stored artifact is not a test verdict.';
 case 'post-run':return 'A GitHub Actions post-job cleanup operation, not a second run of the test.';
 default:return 'Normally eligible when previous steps pass. A previous failure may cause later ordinary steps to be skipped.';
 }
}
function renderSelected(){
 const run=current(),step=stepFor(selectedRun,selectedStep);
 byId('step-phase-label').textContent=step.phase+' / Step '+step.number;
 byId('step-name').textContent=step.name;
 const badge=byId('step-status');
 badge.textContent=statusLabel[step.status]+' - recorded outcome';
 badge.dataset.status=step.status;
 byId('step-explanation').textContent=step.why+
  (selectedRun==='failure'&&step.status==='failure'?' Actual error: '+data.failure.observed_failure.message:'');
 byId('step-condition').textContent=conditionExplanation(step,run);
 for(const button of byId('step-list').querySelectorAll('button[data-step]')){
  button.setAttribute('aria-pressed',String(Number(button.dataset.step)===selectedStep));
 }
}
function renderList(){
 const run=current(),term=search.value.trim().toLocaleLowerCase();
 const visible=run.steps.filter(s=>(filter.value==='all'||s.phase===filter.value)
  &&(!term||(s.name+' '+s.phase+' '+s.why).toLocaleLowerCase().includes(term)));
 const list=byId('step-list');list.replaceChildren();
 if(!visible.length){
  list.appendChild(text('p','No matching steps. Clear the filter to view all 35.','lab-note'));
  return;
 }
 if(!visible.some(s=>s.number===selectedStep))selectedStep=visible[0].number;
 for(const step of visible){
  const button=text('button','','actions-step-button');button.type='button';
  button.dataset.step=String(step.number);
  button.setAttribute('aria-pressed',String(step.number===selectedStep));
  const number=text('span','#'+step.number,'actions-num');
  const label=text('span',step.name,'actions-step-name');
  const status=text('span',statusLabel[step.status],'actions-mini-status');
  status.dataset.status=step.status;button.append(number,label,status);
  button.addEventListener('click',()=>{selectedStep=step.number;renderSelected()});
  list.appendChild(button);
 }
 renderSelected();
}
function renderRun(){
 const run=current(),totals=count(selectedRun);
 byId('run-id').textContent=String(run.run_id);
 byId('job-id').textContent=String(run.job_id);
 byId('run-sha').textContent=run.sha.slice(0,12);
 byId('run-sha').title=run.sha;
 byId('run-event').textContent=run.event;
 const verdict=byId('run-conclusion');
 verdict.textContent=run.conclusion.toUpperCase();verdict.dataset.status=run.conclusion;
 for(const kind of ['success','failure','skipped'])byId('count-'+kind).textContent=String(totals[kind]);
 byId('count-all').textContent=String(run.steps.length);
 const a=byId('run-source');a.href=run.url;a.textContent='Open this '+run.conclusion+' run on GitHub';
 for(const button of document.querySelectorAll('[data-run]'))button.setAttribute('aria-pressed',String(button.dataset.run===selectedRun));
 filter.value='all';search.value='';selectedStep=selectedRun==='failure'?21:10;
 renderList();
}
for(const button of document.querySelectorAll('[data-run]')){
 button.addEventListener('click',()=>{selectedRun=button.dataset.run;renderRun()});
}
filter.addEventListener('change',renderList);search.addEventListener('input',renderList);
function renderTrigger(){
 const event=byId('trigger-select').value;
 const simulated=predictEvent(event);
 const special=simulated.filter(s=>s.condition!=='default'&&s.condition!=='post-run');
 const nodes=byId('condition-list');nodes.replaceChildren();
 for(const s of special){
  const article=document.createElement('article');article.dataset.outcome=s.outcome;
  article.appendChild(text('strong',s.name));
  const label=s.outcome==='would-run'?'WOULD RUN':s.outcome==='would-skip'?'WOULD SKIP':'DEPENDS ON FAILURE';
  article.appendChild(text('span',label));nodes.appendChild(article);
 }
 const would=special.filter(s=>s.outcome==='would-run').length;
 const skipped=special.filter(s=>s.outcome==='would-skip').length;
 byId('condition-summary').textContent='Hypothetical '+event+' event: '+would+' conditional steps would be eligible, '+skipped+' would be skipped due to the trigger. Earlier failures and actual outcomes are not predicted.';
 byId('trigger-receipt').textContent=JSON.stringify({
  simulation:true,real_execution:false,workflow_file:data.workflow.file,selected_event:event,
  conditional_steps:special.map(s=>({step:s.name,if_class:s.condition,eligibility:s.outcome})),
  interpretation:'Eligibility only. Not a new GitHub Actions run or a test verdict.'
 },null,2);
}
byId('trigger-select').addEventListener('change',renderTrigger);
const answers={q1:'job',q2:'condition',q3:'scope'};
byId('check-quiz').addEventListener('click',()=>{
 let correct=0,answered=0;
 for(const name of Object.keys(answers)){
  const selected=document.querySelector('input[name="'+name+'"]:checked');
  if(selected){answered++;if(selected.value===answers[name])correct++;}
 }
 if(answered!==3){
  byId('quiz-score').textContent='Answer all three questions first ('+answered+'/3 answered).';
  return;
 }
 byId('quiz-score').textContent=correct+'/3 correct. '+(correct===3
  ?'Excellent. You distinguished job identity, conditional skips and scoped verification.'
  :'Review: a job belongs to a run; skipped can be intentional; success covers the checks that ran on the stated revision.');
});
const anchors=[
 ['github-actions','GitHub Actions'],['workflow','Workflow'],['workflow-run','Workflow run'],
 ['ci-job','CI job'],['ci-step','Step'],['runner','Runner'],['run-trigger','Trigger'],
 ['workflow-dispatch','Workflow dispatch'],['yaml','YAML'],['checkout','Checkout'],
 ['playwright','Playwright'],['artifact','Artifact'],['deployment','Deployment'],['github-pages','GitHub Pages'],
 ['commit','Commit'],['push','Push'],['pull-request','Pull request'],['regression-test','Regression'],
 ['assertion','Assertion'],['ci-cd','CI/CD']
];
const glossary=byId('actions-glossary');
for(const [id,label] of anchors){
 const a=text('a',label);a.href=glossaryBase+id;a.target='_blank';a.rel='noopener';
 glossary.appendChild(a);
}
renderRun();renderTrigger();
})();