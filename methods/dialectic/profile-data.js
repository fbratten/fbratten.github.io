(() => {
  'use strict';
  const D=window.DialecticProfile=window.DialecticProfile||{};

  D.loopNodes=[
    {id:'subject',label:'Subject\nand context',group:'contract',groupLabel:'Loop input',x:.13,y:.48,r:54,summary:'The loop starts from a bounded subject plus optional initial context.',items:['Subject stays stable across iterations unless the caller changes it.','Initial context is included in the first encounter prompt.'],meta:[['Runtime status','implemented'],['Source','HermeneuticConfig + loop entry points']]},
    {id:'prior',label:'Scratchpad\nprior notes',group:'projection',groupLabel:'Working memory',x:.29,y:.18,r:48,summary:'Existing notes for the task are loaded before the loop and inserted into the working horizon.',items:['Prior notes are read through Scratchpad.get().','Same-run continuity is also carried by explicit previous-interpretation and accumulated-unit variables.'],meta:[['Runtime status','implemented'],['Persistence','file-backed scratchpad']]},
    {id:'encounter',label:'Encounter\ncall',group:'control',groupLabel:'Model interaction',x:.35,y:.48,r:52,summary:'An instrumented or callable model receives subject, context and the current horizon.',items:['Returns interpretation, tagged findings, questions and an is_complete flag.','The instrumented form records token and duration information.'],meta:[['Calls','one per iteration'],['Phase enum','ENCOUNTER']]},
    {id:'interpret',label:'Interpretation\n+ questions',group:'atom',groupLabel:'Model-produced content',x:.53,y:.23,r:48,summary:'The encounter response is parsed into an interpretation, newly opened questions and optional knowledge units.',items:['Plain text falls back to interpretation-only.','Structured JSON supports explicit questions, findings and completion.'],meta:[['Phase enum','INTERPRETATION'],['Parser','JSON with bounded fallback']]},
    {id:'adjust',label:'Horizon\nadjustment',group:'atom',groupLabel:'State update',x:.55,y:.55,r:48,summary:'The current interpretation becomes the next prior understanding, findings accumulate and a compact note is appended to scratchpad.',items:['Questions and findings alter the next prompt context.','Adjustment is implemented through state updates rather than a separate model call.'],meta:[['Phase enum','ADJUSTMENT'],['Model call','none dedicated']]},
    {id:'synthesis',label:'Synthesis\ncheck',group:'control',groupLabel:'Convergence assessment',x:.72,y:.34,r:50,summary:'After the first iteration, a separate synthesis call compares the previous and current interpretations.',items:['Returns similarity and has_converged.','Similarity is a model-produced control signal, not a truth metric.'],meta:[['Calls','zero on first pass; one on later passes'],['Phase enum','SYNTHESIS']]},
    {id:'stop',label:'Bounded\nstopping',group:'evidence',groupLabel:'Loop control',x:.83,y:.62,r:48,summary:'The loop stops on stable similarity, explicit completion or the configured iteration bound.',items:['STABLE: synthesis flag or similarity threshold.','EXPLICIT_DONE: encounter sets is_complete.','MAX_ITERATIONS: configured bound reached.'],meta:[['Default max','5'],['Default threshold','0.8']]},
    {id:'units',label:'RigVedan\nknowledge units',group:'evidence',groupLabel:'Structured findings',x:.70,y:.80,r:48,summary:'Parseable EBNF-RV findings accumulate as typed knowledge units across iterations.',items:['Temporal marker','Hermeneutic tag','Didactic weight','Content type and description'],meta:[['Temporal markers','10'],['Truth status','classification only']]},
    {id:'result',label:'Final\nunderstanding',group:'contract',groupLabel:'Loop result',x:.91,y:.30,r:52,summary:'The result returns final understanding, iteration records, accumulated knowledge units and bounded execution receipts.',items:['Convergence reason remains explicit.','Token count and duration are retained by the instrumented path.'],meta:[['Runtime status','implemented'],['Output','HermeneuticResult']]}
  ];
  D.loopEdges=[
    ['subject','encounter','frames'],['prior','encounter','rehydrates'],['encounter','interpret','returns'],['interpret','adjust','updates'],['adjust','encounter','next horizon','rgba(178,147,255,.55)',true],['adjust','synthesis','compare'],['synthesis','stop','assess'],['interpret','units','parse'],['stop','result','finalize'],['units','result','include']
  ];

  D.horizonNodes=[
    {id:'initial',label:'Initial\ncontext',group:'contract',x:.12,y:.25,r:46,summary:'Caller-supplied background for the first and later encounter prompts.',meta:[['Origin','caller'],['Mutation','not changed by loop']]},
    {id:'previous',label:'Previous\ninterpretation',group:'atom',x:.12,y:.70,r:48,summary:'The immediately preceding interpretation is passed explicitly between iterations.',meta:[['Origin','same run'],['Role','comparison and continuity']]},
    {id:'scratch',label:'Prior\nscratchpad notes',group:'projection',x:.36,y:.18,r:48,summary:'Previously stored notes are loaded once before the loop starts.',meta:[['Origin','task scratchpad'],['Load timing','before iteration loop']]},
    {id:'questions',label:'Open\nquestions',group:'atom',x:.35,y:.78,r:44,summary:'New questions expose what remains unresolved and influence subsequent interpretation.',meta:[['Origin','encounter response'],['Status','accumulated in records']]},
    {id:'findings',label:'Accumulated\nknowledge units',group:'evidence',x:.58,y:.16,r:50,summary:'Structured findings survive across iterations and are inserted into later prompts.',meta:[['Representation','EBNF-RV'],['Status','typed, accumulated']]},
    {id:'horizon',label:'Current\ninterpretive horizon',group:'contract',x:.58,y:.54,r:58,summary:'The prompt horizon combines initial context, prior notes, previous understanding, findings and unresolved questions.',meta:[['Nature','assembled context'],['Truth status','mixed and explicitly tagged']]},
    {id:'new',label:'New\ninterpretation',group:'control',x:.82,y:.34,r:48,summary:'The model produces a revised understanding from the assembled horizon.',meta:[['Origin','encounter call'],['Control','subject to parsing']]},
    {id:'append',label:'Scratchpad\nappend',group:'projection',x:.82,y:.72,r:46,summary:'A compact iteration note is appended for task-local working-memory continuity.',meta:[['Write','implemented'],['Scope','task-local']]}
  ];
  D.horizonEdges=[['initial','horizon','context'],['scratch','horizon','prior notes'],['previous','horizon','prior view'],['questions','horizon','unresolved'],['findings','horizon','typed findings'],['horizon','new','prompt'],['new','append','record'],['new','previous','next pass','rgba(178,147,255,.55)',true],['append','scratch','future re-entry','rgba(156,176,189,.34)',true]];

  D.implNodes=[
    {id:'loop',label:'SPINE\nDIALECTIC loop',group:'contract',x:.50,y:.47,r:60,summary:'The implemented heuristic-hermeneutic loop in SPINE.',meta:[['Primary module','spine/patterns/hermeneutic_loop.py'],['Status','implemented']]},
    {id:'client',label:'Instrumented\nLLM client',group:'control',x:.20,y:.18,r:48,summary:'The full entry point invokes an instrumented client and preserves ToolEnvelope-based receipts.',meta:[['Entry point','hermeneutic_loop()'],['Evidence','token + duration records']]},
    {id:'simple',label:'Callable\nwrapper',group:'control',x:.20,y:.72,r:46,summary:'A simplified entry point accepts a callable and supports testing or bounded standalone use.',meta:[['Entry point','hermeneutic_loop_simple()'],['Instrumentation','reduced']]},
    {id:'scratchpad',label:'Scratchpad',group:'projection',x:.50,y:.14,r:46,summary:'Task-local file-backed working memory used for prior-note retrieval and per-pass append.',meta:[['Module','spine/memory/scratchpad.py'],['Role','working memory']]},
    {id:'rigveda',label:'RigVedan\nEBNF-RV',group:'atom',x:.80,y:.18,r:50,summary:'The parseable annotation grammar used for structured findings.',meta:[['Module','spine/grammar/ebnf_rv.py'],['Temporal markers','10']]},
    {id:'tests',label:'Dedicated\nmocked tests',group:'evidence',x:.80,y:.50,r:48,summary:'Dedicated tests cover parsing, iterations, stopping, callbacks, accumulation, scratchpad and instrumentation.',meta:[['Module','scripts/tests/test_hermeneutic.py'],['Run in publication','no']]},
    {id:'dial4',label:'DIAL-4\nfamily',group:'projection',x:.78,y:.80,r:46,summary:'A separate claim-classification and possibility-governance family. It is not this loop.',meta:[['Relationship','adjacent, distinct'],['Canonical provenance','separate profile later']]},
    {id:'critique',label:'Structured\ncritique executor',group:'projection',x:.48,y:.82,r:48,summary:'A separate heuristic thesis/opposition/synthesis content-review executor also uses DIALECTIC terminology.',meta:[['Relationship','separate implementation'],['This profile','not the primary subject']]}
  ];
  D.implEdges=[['client','loop','executes'],['simple','loop','wraps'],['scratchpad','loop','rehydrates'],['rigveda','loop','structures findings'],['tests','loop','verify behavior'],['dial4','loop','not identical','rgba(242,127,127,.55)',true],['critique','loop','separate use of name','rgba(242,127,127,.55)',true]];

  D.lineageNodes=[
    {id:'design',label:'D9 + D10\ndesign',group:'projection',x:.12,y:.42,r:48,summary:'The DIALECTIC loop and EBNF-RV grammar were planned together as SPINE Phase 5.',meta:[['Artefact','design/backlog'],['Status','historical provenance']]},
    {id:'phase5',label:'Phase 5\n2 Mar 2026',group:'contract',x:.34,y:.42,r:54,summary:'Initial implementation of the EBNF-RV grammar and the heuristic-hermeneutic loop.',meta:[['Commit','26f13c191769…'],['Receipt','43 new tests; 85 total reported']]},
    {id:'timeless',label:'TIMELESS\n22 Mar 2026',group:'atom',x:.56,y:.20,r:48,summary:'The intended temporal vocabulary was extended with TIMELESS for axiomatic or non-decaying knowledge.',meta:[['Commit','8fb9a55fea67…'],['Temporal markers','10']]},
    {id:'dedicated',label:'Dedicated\ntest surface',group:'evidence',x:.58,y:.68,r:48,summary:'A dedicated modern test module covers full and simple loop paths, parsing and bounded stopping.',meta:[['Module','scripts/tests/test_hermeneutic.py'],['Execution here','not rerun']]},
    {id:'docs',label:'Generated\npattern API',group:'projection',x:.78,y:.26,r:46,summary:'The generated patterns reference identifies the hermeneutic loop as the DIALECTIC framework implementation.',meta:[['Module','spine/patterns/README.md'],['Status','source documentation']]},
    {id:'current',label:'Pinned SPINE\nsource',group:'contract',x:.82,y:.65,r:56,summary:'The profile is bounded to the inspected SPINE source pin and its implemented modules.',meta:[['Pin','8fa62c1ebfc0…'],['Publication claim','source-pinned implementation']]}
  ];
  D.lineageEdges=[['design','phase5','implemented as'],['phase5','timeless','vocabulary extended'],['phase5','dedicated','later covered by'],['phase5','docs','documented in'],['timeless','current','included in'],['dedicated','current','present at pin'],['docs','current','describes']];

  D.rigEnums={
    temporal:['ESTABLISHED','COMPLETED','SUPERSEDED','ACTIVE','IN_PROGRESS','CONTESTED','PLANNED','HYPOTHESIZED','OPEN_QUESTION','TIMELESS'],
    hermeneutic:['FACT','INTERPRETATION','HYPOTHESIS','CONTESTED','UNKNOWN'],
    didactic:['FOUNDATIONAL','DERIVED','SUPPLEMENTARY','ADVANCED'],
    content:['DECISION','DISCOVERY','STATE','ACTION','QUESTION']
  };
})();
