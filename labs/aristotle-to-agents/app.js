(() => {
  'use strict';
  const D=window.ATLAS_DATA,M=window.ATLAS_MODEL,$=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nodes=new Map(D.noder.map(n=>[n.id,n]));
  let view=D.views[0],selected=null,selectedEdge=null,zoom=1,labState={},agentStep=0;
  const cat=id=>D.kategorier[nodes.get(id).kategori];
  const sourceLinks=ids=>ids.length?ids.map(id=>{const s=D.källor[id];return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><br><small>${esc(s.review_status)}</small></li>`;}).join(''):'<li>Ingen specifik referens angiven i originalposten. Läs som arbetsmodell.</li>';
  function cols(){return $('all-nodes').checked?Object.entries(D.kategorier).map(([id,c])=>({title:c.legend,nodes:D.noder.filter(n=>n.kategori===id).map(n=>n.id)})):view.columns;}
  function viewIds(){return cols().flatMap(c=>c.nodes);}
  function edgesFor(ids){const set=new Set(ids),type=$('relation-filter').value;return D.kanter.filter(e=>set.has(e.källa)&&set.has(e.mål)&&(type==='all'||e.typ===type));}
  function wrap(label,max=24){const words=label.split(' '),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).trim().length>max&&lines.at(-1))lines.push(w);else lines[lines.length-1]=(lines.at(-1)+' '+w).trim();}return lines;}
  function el(tag,attrs={},text){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
  function keyClick(e,fn){e.addEventListener('click',fn);e.addEventListener('keydown',k=>{if(k.key==='Enter'||k.key===' '){k.preventDefault();fn();}});}
  function draw(){
    const columns=cols(),ids=viewIds(),edges=edgesFor(ids),q=$('node-search').value.trim().toLocaleLowerCase('sv');
    const matches=new Set(ids.filter(id=>{const n=nodes.get(id);return !q||`${n.label} ${n.beskrivning}`.toLocaleLowerCase('sv').includes(q);}));
    const relevant=new Set(matches);if(q)for(const e of edges)if(matches.has(e.källa)||matches.has(e.mål)){relevant.add(e.källa);relevant.add(e.mål);}
    const near=new Set(selected?[selected]:ids);if(selected)for(const e of edges)if(e.källa===selected||e.mål===selected){near.add(e.källa);near.add(e.mål);}
    const width=columns.length*280+30,height=Math.max(...columns.map(c=>c.nodes.length))*100+80,pos=new Map();
    const svg=$('graph');svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.width=`${zoom*100}%`;svg.style.minWidth=`${$('all-nodes').checked?width*zoom:860*zoom}px`;
    const title=el('title',{},`${view.title}: ${ids.length} begrepp och ${edges.length} relationer`);svg.append(title);
    const defs=el('defs');for(const [type,t]of Object.entries(D.typer)){const m=el('marker',{id:`arrow-${type}`,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});m.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:t.color}));defs.append(m);}svg.append(defs);
    columns.forEach((c,i)=>{svg.append(el('text',{x:i*280+30,y:30,fill:'#c1cde0','font-size':12,'font-weight':600},c.title));c.nodes.forEach((id,j)=>pos.set(id,{x:i*280+20,y:55+j*100}));});
    for(const e of edges){
      if(q&&!(matches.has(e.källa)||matches.has(e.mål)))continue;
      const a=pos.get(e.källa),b=pos.get(e.mål),forward=b.x>a.x,same=a.x===b.x;
      const x1=a.x+(forward?242:same?242:0),y1=a.y+34,x2=b.x+(forward?0:242),y2=b.y+34;
      const bend=same?80:Math.max(65,Math.abs(x2-x1)*.4),path=`M${x1},${y1} C${x1+(forward||same?bend:-bend)},${y1} ${x2+(forward?-bend:bend)},${y2} ${x2},${y2}`;
      const active=selectedEdge===e.id||selected&&(e.källa===selected||e.mål===selected);
      const g=el('g',{class:`edge${active?' active':''}${selected&&!active?' dim':''}`,'data-edge':e.id});g.append(el('title',{},`${nodes.get(e.källa).label} → ${nodes.get(e.mål).label}: ${e.relation}`));
      g.append(el('path',{class:'edge-hit',d:path}));g.append(el('path',{class:'ink',d:path,stroke:D.typer[e.typ].color,'stroke-dasharray':D.typer[e.typ].style==='solid'?'none':D.typer[e.typ].style==='dotted'?'2 5':'7 5','marker-end':`url(#arrow-${e.typ})`}));g.addEventListener('click',()=>showEdge(e.id));svg.append(g);
    }
    for(const id of ids){const p=pos.get(id),n=nodes.get(id),c=cat(id),lines=wrap(n.label);const dim=!relevant.has(id)||selected&&!near.has(id);
      const g=el('g',{class:`node${selected===id?' selected':''}${dim?' dim':''}`,transform:`translate(${p.x},${p.y})`,tabindex:0,role:'button','aria-label':`${n.label}. Visa definition och samband.`,'data-node':id});
      g.append(el('title',{},n.beskrivning));g.append(el('rect',{width:242,height:78,rx:10,fill:c.fill,stroke:c.color,'stroke-width':1.3}));
      const text=el('text',{x:13,y:lines.length>2?19:25,fill:'#f0f4fb','font-size':12.5,'font-weight':600});lines.slice(0,3).forEach((line,j)=>text.append(el('tspan',{x:13,dy:j?16:0},line)));g.append(text);
      if(lines.length<=2)g.append(el('text',{x:13,y:64,fill:'#bbc8db','font-size':9.5},n.period||c.legend));keyClick(g,()=>showNode(id));svg.append(g);
    }
    $('graph-count').textContent=q?`${matches.size} sökträffar · ${ids.length} noder i vyn`:`${ids.length} noder · ${edges.length} relationer · klicka för att utforska`;
    $('node-catalog').innerHTML=ids.map(id=>`<button type="button" data-catalog="${esc(id)}">${esc(nodes.get(id).label)}</button>`).join(' ');
    $('node-catalog').querySelectorAll('button').forEach(b=>b.onclick=()=>{showNode(b.dataset.catalog);$('node-detail').scrollIntoView({block:'nearest'});});
  }
  function showNode(id){selected=id;selectedEdge=null;draw();const n=nodes.get(id),relations=D.kanter.filter(e=>e.källa===id||e.mål===id);
    $('node-detail').innerHTML=`<span class="badge">${esc(cat(id).legend)}</span><h3>${esc(n.label)}</h3><p>${esc(n.beskrivning)}</p><p class="muted">${esc(n.period||'Begrepp utan enskilt årtal')}<br>${esc(n.provenance)}</p><details open><summary>Källor</summary><ul>${sourceLinks(n.källor)}</ul></details><h3 style="margin-top:20px">${relations.length} samband i hela grafen</h3>${relations.map(e=>`<button class="edge-button" type="button" data-edge-id="${e.id}">${esc(nodes.get(e.källa).label)} → ${esc(nodes.get(e.mål).label)}<br><span class="muted">${esc(e.relation)}</span></button>`).join('')}`;
    $('node-detail').querySelectorAll('[data-edge-id]').forEach(b=>b.onclick=()=>showEdge(b.dataset.edgeId));
  }
  function showEdge(id){const e=D.kanter.find(e=>e.id===id);selectedEdge=id;selected=null;draw();
    $('node-detail').innerHTML=`<span class="badge">${esc(D.typer[e.typ].label)}</span><h3>${esc(nodes.get(e.källa).label)} → ${esc(nodes.get(e.mål).label)}</h3><p><strong>${esc(e.relation)}</strong></p><p>${esc(D.typer[e.typ].description)}</p><p>${esc(e.förklaring)}</p><p>Originalets bedömning: <strong>${esc(e.grundning)}</strong>.<br>${esc(e.review_status)}.</p><ul>${sourceLinks(e.referenser)}</ul><button class="node-back" data-target="${esc(e.källa)}">Visa startnoden</button> <button class="node-back" data-target="${esc(e.mål)}">Visa målnoden</button>`;
    $('node-detail').querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>showNode(b.dataset.target));
  }
  function defaultDetail(){$('node-detail').innerHTML=`<span class="badge">Läs kartan</span><h3>Vad betyder pilen?</h3><p>Välj en nod för definition, källor och alla dess samband. Klicka på en pil för relationens betydelse och grundning.</p><p>Vyn är ett urval. Markera <strong>Visa hela grafen</strong> för att utforska alla 74 begrepp.</p><p>${esc(view.lesson)}</p>`;}
  function setView(id,writeHash=true){view=D.views.find(v=>v.id===id)||D.views[0];selected=selectedEdge=null;zoom=1;agentStep=0;labState={};$('node-search').value='';$('relation-filter').value='all';$('all-nodes').checked=false;
    $('view-title').textContent=view.headline;$('view-intro').textContent=view.intro;$('view-counter').textContent=`Översikt ${D.views.indexOf(view)+1} / 5 · ${view.title}`;
    document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view.id)));
    if(writeHash)history.replaceState(null,'',`#${view.id}`);draw();defaultDetail();renderLab();
  }
  const select=(id,label,options)=>`<label class="stack-label">${label}<select id="${id}">${options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`;
  const check=(id,label,checked=false)=>`<label><input type="checkbox" id="${id}" ${checked?'checked':''}>${label}</label>`;
  function renderLab(){
    const titles={overview:'Lab 1: Är slutsatsen hållbar?',history:'Lab 2: Från påstående till sanningsvärde',llm:'Lab 3: Vad hittade sökningen egentligen?',agents:'Lab 4: Stega genom en agentkedja',interplay:'Lab 5: Många röster, hur många ursprung?'};
    let controls='',intro='';
    if(view.id==='overview'){intro='Ändra argumentets form och den första premissens sanningshalt. Granska vad som faktiskt blir verifierat.';controls=select('syll-form','Argumentets form',[['valid','Alla A är B. x är A. Alltså är x B.'],['invalid','Alla A är B. x är B. Alltså är x A.']])+check('syll-premise','Använd sann premiss (annars: alla katter är fåglar)',true);}
    if(view.id==='history'){intro='En boolesk regel kan kontrolleras för alla möjliga indata. Undersök hur implikation skiljer sig från ett kausalt påstående.';controls=select('logic-op','Logisk operation',[['and','p OCH q'],['or','p ELLER q (inkluderande)'],['implies','p IMPLICERAR q']]);}
    if(view.id==='llm'){intro='Sex påhittade dokument handlar om samma AI-pilot. De tre högst rankade bygger på samma ursprung. Ändra urvalet och räkna oberoende källor.';controls='<label class="stack-label">Antal hämtade dokument: <output id="k-value">3</output><input type="range" id="retrieval-k" min="1" max="6" value="3"></label>'+check('retrieval-contrast','Prioritera även motbelägg och andra ursprung');}
    if(view.id==='agents'){intro='Testuppdrag: granska ett besparingspåstående, förbered en rapport. Scenariot innehåller en instruktion i en extern sida och ett dåligt minne. Slå på kontroller och inspektera händelserna.';controls=check('gate-boundary','Behandla externa instruktioner som data')+check('gate-memory','Kräv proveniens för minnesposter')+check('gate-scope','Tillåt bara läsverktyg')+check('gate-approval','Kräv faktisk granskning före publicering')+'<div class="lab-actions"><button id="agent-next">Nästa steg</button><button id="agent-run">Kör hela scenariot</button><button id="agent-reset">Börja om</button></div><p class="atlas-note">Detta är en regelstyrd simulering. Ingen verklig agent, nätverksanslutning eller publicering används.</p>';}
    if(view.id==='interplay'){intro='Ett obestyrkt påstående återges i flera kanaler. Lägg till återpubliceringar och sedan en separat granskning. Räknas källorna rätt?';controls='<label class="stack-label">Antal återpubliceringar: <output id="copy-value">3</output><input type="range" id="copy-count" min="1" max="8" value="3"></label>'+check('independent-source','Lägg till en oberoende källa som ifrågasätter påståendet');}
    $('lab').innerHTML=`<span class="eyebrow">Pröva själv / deterministiskt experiment</span><h2 id="lab-title">${titles[view.id]}</h2><p>${intro}</p><div class="lab-grid"><div>${controls}</div><div class="atlas-result" id="lab-result" role="status" aria-live="polite"></div></div><p class="atlas-note">${esc(view.lesson)}</p><div class="lab-actions"><button id="export-receipt">Hämta experimentets resultat (JSON)</button></div>`;
    $('lab').querySelectorAll('select,input').forEach(e=>e.addEventListener('input',()=>{if(view.id==='agents')agentStep=0;updateLab();}));
    if(view.id==='agents'){$('agent-next').onclick=()=>{agentStep=Math.min(5,agentStep+1);updateLab();};$('agent-run').onclick=()=>{agentStep=5;updateLab();};$('agent-reset').onclick=()=>{agentStep=0;updateLab();};}
    $('export-receipt').onclick=()=>{const blob=new Blob([JSON.stringify({view:view.id,synthetic:true,model:'deterministic-teaching-model-v1',timestamp:new Date().toISOString(),...labState},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`aristotle-agents-${view.id}-experiment.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};updateLab();
  }
  function updateLab(){let html='';
    if(view.id==='overview'){const form=$('syll-form').value,p=$('syll-premise').checked,r=M.syllogism(form,p);labState={inputs:{form,premise:p},result:r};html=`<p><strong>Exempel</strong><br>${form==='valid'?(p?'Alla katter är däggdjur. Misse är en katt. Alltså är Misse ett däggdjur.':'Alla katter är fåglar. Misse är en katt. Alltså är Misse en fågel.'):(p?'Alla katter är däggdjur. Fido är ett däggdjur. Alltså är Fido en katt.':'Alla katter är fåglar. Pip är en fågel. Alltså är Pip en katt.')}</p><p>Giltig form: <strong class="${r.valid?'pass':'risk'}">${r.valid?'JA':'NEJ'}</strong><br>Sann första premiss: <strong>${p?'JA':'NEJ'}</strong><br>Både giltig och baserad på sanna premisser: <strong>${r.sound?'JA':'NEJ'}</strong></p><p>${r.text}</p>`;}
    if(view.id==='history'){const op=$('logic-op').value,rows=M.truthTable(op);labState={inputs:{op},result:rows};html=`<table><caption>Sanningstabell för ${esc($('logic-op').selectedOptions[0].text)}</caption><thead><tr><th scope="col">p</th><th scope="col">q</th><th scope="col">Utfall</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.p?'Sant':'Falskt'}</td><td>${r.q?'Sant':'Falskt'}</td><td>${r.result?'Sant':'Falskt'}</td></tr>`).join('')}</tbody></table><p>Materiell implikation är falsk endast när p är sant och q falskt. Den anger en logisk relation; den bevisar ingen orsak i världen.</p>`;}
    if(view.id==='llm'){const k=+$('retrieval-k').value,contrast=$('retrieval-contrast').checked,r=M.retrieval(k,contrast);$('k-value').value=k;labState={inputs:{k,contrast},result:r};html=`<p><strong>${r.rows.length} dokument · ${r.origins} oberoende ursprung</strong><br>${r.support} stödjande texter · ${r.challenge} texter med motbelägg eller blandat resultat</p>${r.rows.map(d=>`<div class="trace-row"><strong>${d.id} · ${d.stance}<span class="muted">${d.origin}</span></strong><p>${d.text}</p></div>`).join('')}<p class="${r.challenge?'pass':'risk'}">${r.challenge?'Underlaget innehåller invändningar. Granska sakfrågan före slutsats.':'Urvalet saknar motbelägg. Det verifierar inte att påståendet håller.'}</p>`;}
    if(view.id==='agents'){const gates={boundary:$('gate-boundary').checked,memory:$('gate-memory').checked,scope:$('gate-scope').checked,approval:$('gate-approval').checked},r=M.agentTrace(gates);labState={inputs:gates,visibleSteps:agentStep,result:r};$('agent-next').disabled=agentStep>=5;html=agentStep?r.trace.slice(0,agentStep).map(t=>`<div class="trace-row"><strong>${t.stage}<span>${t.status}</span></strong><p>${t.text}</p></div>`).join(''):'<p>Tryck på <strong>Nästa steg</strong> för att följa data, instruktion, minne, plan och verktyg.</p>';if(agentStep===5)html+=`<p class="${r.unsafeAction?'risk':'pass'}"><strong>${r.unsafeAction?'Riskvägen når en simulerad skrivning.':r.badPlan?'Skrivningen stoppas, men planen är fortfarande felaktig.':'Uppdraget stannar vid källgranskning.'}</strong></p>`;}
    if(view.id==='interplay'){const copies=+$('copy-count').value,independent=$('independent-source').checked,r=M.circulation(copies,independent);$('copy-value').value=copies;labState={inputs:{copies,independent},result:r};html=`<p><strong>${r.voices} röster · ${r.origins} ursprung</strong></p><div class="atlas-circulation">${Array.from({length:copies},(_,i)=>`<span>Kanal ${i+1}<br>Ursprung A</span>`).join('')}${independent?'<span class="independent">Granskning<br>Ursprung B</span>':''}</div><p>${r.conclusion}</p><p class="muted">Antalet är en illustration av proveniens, inte en sannolikhetsmodell eller mätning av människors tilltro.</p>`;}
    $('lab-result').innerHTML=html;
  }
  $('view-nav').innerHTML=D.views.map((v,i)=>`<button type="button" data-view="${v.id}" aria-pressed="false"><span class="num">0${i+1}</span><span class="name">${v.title}</span></button>`).join('');$('view-nav').querySelectorAll('button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
  for(const [id,t]of Object.entries(D.typer)){$('relation-filter').add(new Option(t.label,id));const s=document.createElement('span');s.innerHTML=`<i style="background:${t.color}"></i>${esc(t.label)}`;s.title=t.description;$('legend').append(s);}
  $('node-search').oninput=draw;$('relation-filter').onchange=()=>{selected=selectedEdge=null;draw();defaultDetail();};$('all-nodes').onchange=()=>{selected=selectedEdge=null;zoom=1;draw();defaultDetail();};
  $('clear-focus').onclick=()=>{$('node-search').value='';$('relation-filter').value='all';selected=selectedEdge=null;draw();defaultDetail();};
  $('zoom-in').onclick=()=>{zoom=Math.min(2.5,zoom+.25);draw();};$('zoom-out').onclick=()=>{zoom=Math.max(.5,zoom-.25);draw();};$('zoom-reset').onclick=()=>{zoom=1;draw();$('graph-scroll').scrollTo(0,0);};
  $('sources').innerHTML=Object.values(D.källor).map(s=>`<article class="atlas-source"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><small>${esc(s.review_status)}</small></article>`).join('');
  $('fallback').hidden=true;$('atlas-app').hidden=false;setView(location.hash.slice(1),false);window.addEventListener('hashchange',()=>setView(location.hash.slice(1),false));
})();
