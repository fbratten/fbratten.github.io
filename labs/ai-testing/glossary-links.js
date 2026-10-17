/* Links AI testing vocabulary in the lab pages to the From Blueprint to Application glossary.
   Only visible prose inside <main> is linked; controls, code, headings and existing links are left alone.
   Visible text is unchanged, so text-based checks and copied content stay the same. */
(function(){
'use strict';
const BASE='https://fbratten.github.io/From-Blueprint-to-Application/docs/resources/glossary.html#term-';
// [anchor, pattern, case-sensitive]. Longer phrases first so they win over shorter ones.
const TERMS=[
 ["workflow-dispatch","workflow[_ ]dispatch"],
 ["workflow-run","workflow[ -]runs?"],
 ["github-pages","GitHub Pages",true],
 ["run-trigger","run triggers?|triggers?"],
 ["playwright","Playwright",true],
 ["artifact","artifacts?"],
 ["checkout","check[ -]?outs?"],
 ["deployment","deployments?|deployed"],
 ["yaml","YAML",true],
 ["workflow","workflows?"],
 ["mutation-gate","mutation[ -]gates?"],
 ["mutation-testing","mutation[ -]testing|mutation[ -]tests?"],
 ["mutation","mutation(?:s|al)?|mutants?"],
 ["anchor","mutation anchors?|source anchors?|anchors?"],
 ["non-vacuous-test","non[ -]vacuous tests?"],
 ["caught-mutation","CAUGHT",true],
 ["escaped-mutation","ESCAPED",true],
 ["broken-mutation","BROKEN",true],
 ["github-actions","GitHub Actions",true],
 ["commit-hash","commit hashes?|commit SHAs?|SHA",true],
 ["code-review","code reviews?"],
 ["test-harness","test harness(?:es)?"],
 ["test-matrix","test matrices|test matrix"],
 ["headless-browser","headless browsers?"],
 ["html-escaping","HTML escaping|escaping",true],
 ["ci-job","CI jobs?",true],
 ["ci-step","CI steps?",true],
 ["state-mirror","live[ -]state[ -]mirror|state[ -]mirror|live[ -]mirror"],
 ["rollback","rollbacks?"],
 ["validator","validators?|validation"],
 ["websocket","WebSockets?",true],
 ["repository","repositor(?:y|ies)|repos?"],
 ["branch","branches|branch"],
 ["worktree","worktrees?"],
 ["runner","runners?"],
 ["smoke-test","smoke tests?|smoke checks?"],
 ["opt-in","opt[ -]in"],
 ["pipeline","pipelines?"],
 ["push","push(?:es|ed|ing)?"],
 ["merge","merges?|merged|merging"],
 ["guard","guards?"],
 ["pytest","pytest"],
 ["xss","XSS",true],
 ["baseline","baseline"],
 ["regression-test","regression(?: tests?)?"],
 ["ci-cd","continuous integration"],
 ['fault-injection','fault[ -]injections?'],
 ['prompt-injection','prompt injections?'],
 ['defense-in-depth','defen(?:c|s)e[ -]in[ -]depth'],
 ['backward-compatibility','backward[ -]compatib(?:ility|le)'],
 ['llm-as-a-judge','llm[ -]as[ -]a[ -]judge|(?:fast|deep|automated)[ -]judges?|judges?'],
 ['golden-dataset','golden (?:dataset|examples?)|evaluation sets?'],
 ['end-to-end-test','end[ -]to[ -]end(?: tests?)?'],
 ['end-to-end-test','E2E',true],
 ['unit-test','unit tests?'],
 ['integration-test','integration tests?'],
 ['contract-test','contract tests?|contracts?'],
 ['regression-test','regression (?:tests?|checks?)|regressions?'],
 ['red-teaming','red[ -]team(?:ing)?'],
 ['sampled-evaluation','sampled (?:model )?evaluations?|sampl(?:e|es|ed|ing)'],
 ['short-circuit','short[ -]circuit|early exit'],
 ['circuit-breaker','circuit breakers?|breakers?'],
 ['human-in-the-loop','human[ -]in[ -]the[ -]loop|human (?:review|control)'],
 ['threat-model','threat models?|trust[ -]boundar(?:y|ies)'],
 ['least-privilege','least[ -]privilege|allowlists?'],
 ['verification-receipt','verification receipts?|receipts?'],
 ['untrusted-content','untrusted(?:[ -](?:content|text|documents?))?'],
 ['test-gate','test gates?'],
 ['linting','static checks?|linting|linters?'],
 ['tool-use','tool (?:calls?|use)'],
 ['multi-agent-system','multi[ -]agent(?: systems?)?'],
 ['groundedness','groundedness|grounding'],
 ['retrieval','retrieval|retrievers?|retrieved'],
 ['recall-k','recall@k'],
 ['chunking','chunking|chunks?'],
 ['deterministic-test','deterministic'],
 ['fixture','fixtures?'],
 ['handoff','hand[ -]?offs?'],
 ['guardrail','guard[ -]?rails?'],
 ['assertion','assertions?'],
 ['schema','schemas?'],
 ['mock','mocks?'],
 ['drift','drift'],
 ['trace','traces?'],
 ['sandbox','sandbox(?:es|ed)?'],
 ['nightly-run','nightly'],
 ['pull-request','pull requests?'],
 ['pull-request','PRs?',true],
 ['ci-cd','CI/CD|CI',true],
 ['commit','commits?'],
 ['injection-fallback','injections?'],
 ['rag','RAG',true],
 ['api','APIs?',true],
 ['mcp','MCP',true],
 ['hallucination','hallucinations?'],
 ['token','tokens?'],
 ['prompt','prompts?'],
 ['agent','agents?']
];
const RE=new RegExp('(?<![\\w@/-])(?:'+TERMS.map(([,p],i)=>'(?<t'+i+'>'+p+')').join('|')+')(?![\\w@/-])','gi');
const EXACT=TERMS.map(([,p,cs])=>cs?new RegExp('^(?:'+p+')$'):null);
const SKIP='a,button,select,option,textarea,input,pre,code,script,style,svg,canvas,nav,h1,h2,h3,[aria-hidden="true"],.lab-number,.lab-status,.lab-kicker,.glossary-link';
function anchorFor(groups,text){
 for(let i=0;i<TERMS.length;i++){if(groups['t'+i]!==undefined){
  if(EXACT[i]&&!EXACT[i].test(text))return null; // abbreviations such as CI, PR, API must match their case
  const a=TERMS[i][0];return a==='injection-fallback'?'prompt-injection':a}}
 return null;
}
function linkTextNode(node){
 const text=node.nodeValue;RE.lastIndex=0;
 if(!RE.test(text))return;
 RE.lastIndex=0;
 const frag=document.createDocumentFragment();let last=0,m;
 while((m=RE.exec(text))){
  const anchor=anchorFor(m.groups,m[0]);if(!anchor)continue;
  if(m.index>last)frag.appendChild(document.createTextNode(text.slice(last,m.index)));
  const a=document.createElement('a');
  a.className='glossary-link';a.href=BASE+anchor;a.target='_blank';a.rel='noopener';
  a.title='Glossary: opens in a new tab';a.textContent=m[0];
  frag.appendChild(a);last=m.index+m[0].length;
 }
 if(last===0)return;
 if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
 node.parentNode.replaceChild(frag,node);
}
function scan(root){
 if(!root||!root.querySelectorAll)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;
  if(!p||!n.nodeValue.trim()||p.closest(SKIP))return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(linkTextNode);
}
function start(){
 const main=document.getElementById('main');if(!main)return;
 scan(main);
 let queued=false;
 const observer=new MutationObserver(()=>{
  if(queued)return;queued=true;
  queueMicrotask(()=>{queued=false;observer.disconnect();scan(main);observer.observe(main,{childList:true,subtree:true,characterData:true})});
 });
 observer.observe(main,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
