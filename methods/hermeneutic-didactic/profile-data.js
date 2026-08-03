(() => {
  'use strict';
  const H=window.HermDidProfile=window.HermDidProfile||{};
  H.spineNodes=[
    {id:'subject',label:'Subject +\ninitial context',group:'spine',x:.12,y:.50,r:50,summary:'The bounded topic and starting horizon for iterative interpretation.',meta:[['Input','subject, context'],['Authority','starting material']]},
    {id:'scratch',label:'Scratchpad\nrehydration',group:'memory',x:.28,y:.18,r:47,summary:'Prior same-task notes are loaded into the next encounter horizon.',meta:[['Memory type','working memory'],['Durability','not automatically durable truth']]},
    {id:'encounter',label:'Encounter +\ninterpretation',group:'spine',x:.38,y:.52,r:54,summary:'A model call produces interpretation, questions, tagged findings and an explicit completion signal.',meta:[['Calls','one model call per iteration'],['Output','JSON-shaped response']]},
    {id:'rig',label:'RigVedan\nknowledge units',group:'evidence',x:.54,y:.18,r:48,summary:'Tagged findings are parsed and accumulated as typed knowledge units.',meta:[['Axes','temporal, hermeneutic, didactic, content'],['Truth guarantee','none']]},
    {id:'synthesis',label:'Synthesis\ncheck',group:'spine',x:.64,y:.52,r:52,summary:'After the first iteration, a second model call compares previous and current interpretations.',meta:[['Signals','similarity, has_converged'],['Threshold default','0.8']]},
    {id:'record',label:'Iteration\nrecord',group:'evidence',x:.72,y:.18,r:46,summary:'Each cycle records interpretation, questions, knowledge units, similarity, tokens and duration.',meta:[['Evidence','structured iteration record'],['Callback','optional']]},
    {id:'stop',label:'Stop or\nrepeat',group:'boundary',x:.84,y:.52,r:50,summary:'The loop stops on stable synthesis, explicit completion, max iterations or error.',meta:[['Default bound','5'],['Stable means','control condition, not truth']]},
    {id:'result',label:'Final\nunderstanding',group:'spine',x:.73,y:.82,r:49,summary:'Returns the latest interpretation, accumulated knowledge units, convergence reason and receipts.',meta:[['Record','HermeneuticResult'],['Converged property','STABLE only']]}
  ];
  H.spineEdges=[['subject','encounter','frames'],['scratch','encounter','rehydrates'],['encounter','rig','emits'],['encounter','synthesis','compares after first'],['rig','record','accumulates'],['synthesis','record','records'],['record','stop','evaluates'],['stop','encounter','repeat','rgba(178,147,255,.55)',true],['stop','result','finish']];

  H.changeNodes=[
    {id:'run',label:'Recorded\nrun',group:'changeplane',x:.10,y:.50,r:49,summary:'A ChangePlane run with events and optional patchset, eval, semantic binding and seal.',meta:[['Input','first-class run records'],['External generation','none in this pass']]},
    {id:'whole',label:'1. Read\nwhole',group:'changeplane',x:.26,y:.24,r:47,summary:'Summarizes intent, status, event count, patchset presence and seal presence.',meta:[['Field','whole_initial_reading'],['Grounding','run records']]},
    {id:'parts',label:'2. Inspect\nparts',group:'changeplane',x:.43,y:.24,r:47,summary:'Inspects changed files, eval verdict, semantic status/risk and error/repair signals.',meta:[['Field','parts_examined'],['Scope','fixed part set']]},
    {id:'reinterpret',label:'3. Reinterpret\nwhole',group:'changeplane',x:.58,y:.48,r:52,summary:'Deterministically rereads the run through its selected parts.',meta:[['Field','reinterpreted_whole'],['Current behavior','pure function of records']]},
    {id:'lesson',label:'4. Derive\nlesson',group:'evidence',x:.43,y:.76,r:48,summary:'Creates one source-grounded sentence for future work.',meta:[['Field','understanding_update'],['Count','one lesson']]},
    {id:'projection',label:'5. Didactic\nprojection',group:'evidence',x:.64,y:.78,r:50,summary:'Reuses ChangePlane DIAL-4P to create a derived didactic_explanation artifact.',meta:[['source_truth','false'],['Audience','future-run']]},
    {id:'candidate',label:'6. Memory\ncandidate',group:'memory',x:.84,y:.54,r:52,summary:'Drafts and persists a proposal-only memory-admission candidate.',meta:[['Status','draft/generated'],['Admission','not automatic']]},
    {id:'trace',label:'Protocol trace\n+ seal hash',group:'boundary',x:.82,y:.18,r:48,summary:'The loop record and projection enter the ordered protocol trace and can be seal-bound.',meta:[['Hash','protocol_trace_sha256'],['Guarantee','tamper-evidence, not truth']]}
  ];
  H.changeEdges=[['run','whole','reads'],['whole','parts','decomposes'],['parts','reinterpret','grounds'],['reinterpret','whole','fixpoint loop','rgba(233,183,91,.55)',true],['reinterpret','lesson','derives'],['lesson','projection','teaches'],['projection','candidate','supports'],['projection','trace','records'],['candidate','trace','records proposal']];

  H.compareNodes=[
    {id:'spine',label:'SPINE\nDIALECTIC',group:'spine',x:.22,y:.48,r:64,summary:'Model-backed iterative understanding over a subject and expanding interpretive horizon.',meta:[['Primary object','subject / interpretation'],['Typical output','final understanding + knowledge units']]},
    {id:'change',label:'ChangePlane\nHermeneutic pass',group:'changeplane',x:.78,y:.48,r:64,summary:'Deterministic interpretive pass over a recorded development run, ending in projection and memory proposal.',meta:[['Primary object','recorded run'],['Typical output','loop record + projection + candidate']]},
    {id:'iteration',label:'Iteration',group:'boundary',x:.50,y:.12,r:43,summary:'Both are bounded loops, but their iterative state and stopping signals differ.',meta:[['SPINE','model calls + horizon'],['ChangePlane','record fixpoint']]},
    {id:'memory',label:'Memory',group:'memory',x:.50,y:.82,r:43,summary:'SPINE uses scratchpad working memory. ChangePlane drafts an admission candidate but does not promote it.',meta:[['Common property','bounded'],['Critical distinction','working state vs admission proposal']]},
    {id:'didactic',label:'Didactic\noutput',group:'evidence',x:.50,y:.49,r:46,summary:'ChangePlane emits a didactic projection. SPINE returns accumulated understanding and typed findings rather than that projection record.',meta:[['Projection authority','derived only'],['Interchangeable','no']]}
  ];
  H.compareEdges=[['spine','iteration','uses'],['change','iteration','uses'],['spine','memory','uses scratchpad'],['change','memory','drafts candidate'],['spine','didactic','informs'],['change','didactic','emits']];

  H.provenanceNodes=[
    {id:'records',label:'Run records',group:'changeplane',x:.12,y:.42,r:48,summary:'Intent, events, patchset, eval, semantic binding and seal state.',meta:[['Authority','source records for pass'],['Mutation','read only']]},
    {id:'loop',label:'Hermeneutic\nloop record',group:'changeplane',x:.38,y:.28,r:52,summary:'Structured six-step record with iterations, guard and convergence fields.',meta:[['Protocol tag','HERMENEUTIC_DIDACTIC_LOOP'],['Schema','v1']]},
    {id:'projection',label:'DIAL-4P\ndidactic explanation',group:'evidence',x:.62,y:.24,r:54,summary:'A derived rendering with source_truth structurally false and cited source records.',meta:[['Projection type','didactic_explanation'],['Authority','derived']]},
    {id:'candidate',label:'Memory-admission\ncandidate',group:'memory',x:.64,y:.72,r:54,summary:'Draft/generated proposal carrying source references and an adjudicated verdict.',meta:[['Promotion','operator/governance decision'],['Durable write','not performed here']]},
    {id:'trace',label:'Ordered protocol\ntrace',group:'boundary',x:.84,y:.46,r:50,summary:'Both the loop record and projection are stored as first-class protocol records.',meta:[['Storage','ledger + JSON'],['Order','hash input']]},
    {id:'seal',label:'Tamper-evident\nseal',group:'boundary',x:.88,y:.78,r:48,summary:'The protocol trace hash can reveal post-seal edits to stored records.',meta:[['Hash','protocol_trace_sha256'],['Not proof of','reasoning truth']]}
  ];
  H.provenanceEdges=[['records','loop','grounds'],['loop','projection','produces'],['loop','candidate','drafts'],['loop','trace','stored in'],['projection','trace','stored in'],['candidate','trace','receipt referenced','rgba(178,147,255,.5)',true],['trace','seal','hash-bound']];
})();
