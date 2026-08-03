(() => {
  'use strict';
  const R=window.RigVedanProfile=window.RigVedanProfile||{};
  R.enums={
    temporal:['ESTABLISHED','COMPLETED','SUPERSEDED','ACTIVE','IN_PROGRESS','CONTESTED','PLANNED','HYPOTHESIZED','OPEN_QUESTION','TIMELESS'],
    hermeneutic:['FACT','INTERPRETATION','HYPOTHESIS','CONTESTED','UNKNOWN'],
    didactic:['FOUNDATIONAL','DERIVED','SUPPLEMENTARY','ADVANCED'],
    content:['DECISION','DISCOVERY','STATE','ACTION','QUESTION']
  };
  R.anatomyNodes=[
    {id:'unit',label:'KnowledgeUnit',group:'core',x:.50,y:.48,r:62,summary:'A typed knowledge record with four classification axes, description and optional metadata.',items:['temporal','hermeneutic','didactic','content_type','description','metadata'],meta:[['Representation','Python dataclass'],['Serialization','to_dict / from_dict']]},
    {id:'temporal',label:'Temporal\nmarker',group:'temporal',x:.18,y:.20,r:48,summary:'When the knowledge applies or how its temporal state should be understood.',meta:[['Vocabulary','10 markers'],['Examples','ACTIVE, SUPERSEDED, TIMELESS']]},
    {id:'hermeneutic',label:'Hermeneutic\ntag',group:'hermeneutic',x:.18,y:.72,r:48,summary:'How the producer classifies the interpretation status of the statement.',meta:[['Vocabulary','5 tags'],['Caution','FACT remains producer-assigned']]},
    {id:'didactic',label:'Didactic\nweight',group:'didactic',x:.82,y:.18,r:48,summary:'Learning-dependency order: what should be understood before or after the unit.',meta:[['Vocabulary','4 weights'],['Range','FOUNDATIONAL to ADVANCED']]},
    {id:'content',label:'Content\ntype',group:'content',x:.84,y:.70,r:48,summary:'The kind of knowledge being represented.',meta:[['Vocabulary','5 types'],['Range','DECISION to QUESTION']]},
    {id:'description',label:'Description',group:'core',x:.50,y:.83,r:45,summary:'The human-readable content carried by the classification tuple.',meta:[['Type','string'],['Truth source','external to grammar']]},
    {id:'metadata',label:'Metadata',group:'boundary',x:.50,y:.13,r:43,summary:'Optional dictionary preserved by object serialization but omitted by the compact text formatter.',meta:[['Default','empty dict'],['Text round trip','not preserved']]}
  ];
  R.anatomyEdges=[['temporal','unit','classifies'],['hermeneutic','unit','classifies'],['didactic','unit','orders'],['content','unit','types'],['description','unit','contains'],['metadata','unit','augments','rgba(242,127,127,.5)',true]];

  const temporalDefs={
    ESTABLISHED:['Past','A settled or already established state.'],COMPLETED:['Past','An action or state that has finished.'],SUPERSEDED:['Past','Knowledge or a decision replaced by a newer one.'],ACTIVE:['Present','Currently applicable or in force.'],IN_PROGRESS:['Present','Currently being worked or unfolding.'],CONTESTED:['Present','Currently disputed or unstable.'],PLANNED:['Future','Intended future action or state.'],HYPOTHESIZED:['Future','A proposed possibility requiring evidence.'],OPEN_QUESTION:['Future','An unresolved question carried forward.'],TIMELESS:['Timeless','An intended marker for axiomatic or non-decaying knowledge; the grammar itself does not implement decay.']
  };
  R.temporalNodes=[
    {id:'past',label:'Past\nstates',group:'core',x:.18,y:.50,r:52,summary:'Three markers for established, completed or replaced knowledge.',meta:[['Count','3'],['Axis','temporal']]},
    {id:'present',label:'Present\nstates',group:'core',x:.42,y:.50,r:52,summary:'Three markers for active, ongoing or contested knowledge.',meta:[['Count','3'],['Axis','temporal']]},
    {id:'future',label:'Future\nstates',group:'core',x:.66,y:.50,r:52,summary:'Three markers for planned, hypothesized or unresolved future-facing knowledge.',meta:[['Count','3'],['Axis','temporal']]},
    {id:'timeless-group',label:'Timeless',group:'core',x:.88,y:.50,r:50,summary:'A separate marker for intended non-decaying or axiomatic knowledge.',meta:[['Count','1'],['Enforcement','not provided by grammar module']]},
    ...R.enums.temporal.map((name,i)=>{const group=i<3?'past':i<6?'present':i<9?'future':'timeless-group';const positions={past:[.08,.18,.28],present:[.32,.42,.52],future:[.58,.68,.78],'timeless-group':[.90]};const row=i%3;return{id:name,label:name.replace('_','\n'),group:'temporal',x:positions[group][group==='timeless-group'?0:row],y:group==='timeless-group'?.20:(row===0?.18:row===1?.80:.33),r:38,summary:temporalDefs[name][1],meta:[['Category',temporalDefs[name][0]],['Enum value',name]]};})
  ];
  R.temporalEdges=R.enums.temporal.map((name,i)=>[i<3?'past':i<6?'present':i<9?'future':'timeless-group',name,'contains']);

  R.integrationNodes=[
    {id:'grammar',label:'EBNF-RV\ngrammar',group:'core',x:.48,y:.45,r:60,summary:'The source module that defines enums, KnowledgeUnit, parser, formatters and bridge functions.',meta:[['Module','spine/grammar/ebnf_rv.py'],['Status','implemented']]},
    {id:'parser',label:'Single + multi-line\nparser',group:'content',x:.18,y:.18,r:48,summary:'Regex-backed parsing creates typed KnowledgeUnit objects and silently skips non-matching multi-line input.',meta:[['Functions','2'],['Failure mode','None / skipped line']]},
    {id:'formatter',label:'Text + context\nformatters',group:'didactic',x:.18,y:.70,r:48,summary:'Formats one or many units and creates a four-space-indented context-stack text block.',meta:[['Functions','3'],['Execution','none']]},
    {id:'dict',label:'Dictionary\nround trip',group:'hermeneutic',x:.48,y:.12,r:46,summary:'to_dict and from_dict preserve all six fields, including metadata.',meta:[['Methods','2'],['Invalid enum','raises ValueError']]},
    {id:'bridge',label:'Session-status\nbridge',group:'temporal',x:.80,y:.18,r:48,summary:'Maps the hermeneutic axis between uppercase tags and lowercase session-status strings.',meta:[['Functions','2'],['Axes bridged','hermeneutic only']]},
    {id:'dialectic',label:'DIALECTIC',group:'content',x:.82,y:.52,r:48,summary:'Encounter responses can contain tagged findings parsed into accumulated KnowledgeUnit objects.',meta:[['Relationship','consumer'],['Truth guarantee','none']]},
    {id:'context',label:'Context stack',group:'didactic',x:.80,y:.80,r:46,summary:'Formatted units can be embedded as annotated background text in a scenario context.',meta:[['Relationship','rendered text'],['Authority','not established by formatting']]},
    {id:'tests',label:'Grammar + Phase 5\ntests',group:'boundary',x:.46,y:.82,r:48,summary:'Committed tests cover enum values, object round trips, parsing, formatting, context rendering and bridge behavior.',meta:[['Execution here','not rerun'],['Receipts','source-reported']]}
  ];
  R.integrationEdges=[['parser','grammar','implements'],['formatter','grammar','implements'],['dict','grammar','implements'],['bridge','grammar','implements'],['grammar','dialectic','consumed by'],['grammar','context','renders for'],['tests','grammar','verify behavior']];

  R.lineageNodes=[
    {id:'design',label:'D10\ndesign',group:'didactic',x:.12,y:.48,r:46,summary:'The grammar was designed together with the DIALECTIC loop as SPINE Phase 5.',meta:[['Artefact','design/backlog'],['Name','EBNF-Rig Veda']]},
    {id:'phase5',label:'Initial implementation\n2 Mar 2026',group:'core',x:.35,y:.48,r:54,summary:'Enums, KnowledgeUnit, parser, formatters and compatibility bridge landed with DIALECTIC.',meta:[['Commit','26f13c191769…'],['Receipt','43 new tests; 85 total reported']]},
    {id:'timeless',label:'TIMELESS\n22 Mar 2026',group:'temporal',x:.58,y:.24,r:48,summary:'The intended temporal vocabulary gained TIMELESS for axiomatic or non-decaying knowledge.',meta:[['Commit','8fb9a55fea67…'],['Current marker count','10']]},
    {id:'docs',label:'Generated grammar\nreference',group:'didactic',x:.78,y:.22,r:45,summary:'Generated source documentation lists the four enums, KnowledgeUnit and seven public functions.',meta:[['Source','spine/grammar/README.md'],['Role','reference']]},
    {id:'tests',label:'Dedicated grammar\ntest surface',group:'boundary',x:.58,y:.73,r:48,summary:'A dedicated pytest module and historical Phase 5 module exercise grammar behavior.',meta:[['Sources','test_grammar.py; test_phase5.py'],['Rerun','no']]},
    {id:'current',label:'Pinned SPINE\nsource',group:'core',x:.82,y:.65,r:55,summary:'The public profile is bounded to the inspected implementation at the named source pin.',meta:[['Pin','8fa62c1ebfc0…'],['Temporal vocabulary','10 intended markers']]}
  ];
  R.lineageEdges=[['design','phase5','implemented as'],['phase5','timeless','extended by'],['phase5','tests','covered by'],['phase5','docs','documented in'],['timeless','current','included in'],['tests','current','present at pin'],['docs','current','describes']];
})();
