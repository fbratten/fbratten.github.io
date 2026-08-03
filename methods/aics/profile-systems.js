(() => {
  'use strict';
  const A = window.AICSProfile = window.AICSProfile || {};
  A.conformanceNodes=[
    {id:'core',label:'core',group:'contract',x:.18,y:.50,r:52,summary:'Schema and semantic integrity, unique IDs, references, coherent phase gates, verification coverage and truthful profile claim.',meta:[['Executable?','Not implied'],['Dependency','Base for all other profiles']]},
    {id:'conversation',label:'conversation',group:'projection',x:.46,y:.17,r:49,summary:'Adds source-conversation traceability, visible dialogue phase, visible 5PP and lossless snapshot when rendered.',meta:[['Depends on','core'],['Focus','human-AI conversation continuity']]},
    {id:'repository',label:'repository',group:'projection',x:.47,y:.50,r:49,summary:'Adds canonical durable system, creator and last modifier provenance.',meta:[['Depends on','core'],['Non-claim','No write authorization']]},
    {id:'execution',label:'execution',group:'control',x:.46,y:.82,r:49,summary:'Adds status, accepted instruction, exact-version authorization, locked hard requirements and reciprocal verification coverage.',meta:[['Depends on','core'],['Closure','stricter audit when closed']]},
    {id:'full',label:'full',group:'evidence',x:.81,y:.50,r:59,summary:'All dependency profiles plus deterministic lossless conversation round-trip.',meta:[['Dependencies','core + conversation + repository + execution'],['Round trip','round_trip_verified=true']]}
  ];
  A.conformanceEdges=[['core','conversation','depends'],['core','repository','depends'],['core','execution','depends'],['conversation','full',''],['repository','full',''],['execution','full','']];
  A.lineageNodes=[
    {id:'contract',label:'Problem framing',group:'contract',x:.10,y:.40,r:44,summary:'Conversation instructions, repository artefacts and executing-agent interpretations can drift apart.',meta:[['Mechanism target','one canonical semantic contract']]},
    {id:'v01',label:'AICS 0.1\n31 Jul',group:'projection',x:.31,y:.23,r:47,summary:'Initial semantic model, lifecycle, projections, JSON Schema, validator, tests, example contract and CI validation.',meta:[['Source-reported tests','5'],['Commit','ffb6beb1…']]},
    {id:'v02',label:'AICS 0.2\n31 Jul',group:'contract',x:.51,y:.49,r:58,summary:'Self-hosting contract, five profiles, deterministic round-trip, changesets, CLI, multi-domain examples, negative fixtures and expanded CI.',meta:[['Source-reported tests','15'],['Commit','cd88e41b…']]},
    {id:'selfhosting',label:'AICS-0002\nself-hosting',group:'control',x:.72,y:.20,r:49,summary:'AICS governs a bounded increment of its own specification and tooling without bypassing independent tests, CI, review or authorization.',meta:[['Profile','full'],['Boundary','Self-hosting is not self-approval']]},
    {id:'cli',label:'Reference CLI',group:'projection',x:.76,y:.50,r:45,summary:'init, validate, profile, render conversation, roundtrip and apply.',meta:[['Package','aics-validator 0.2.0'],['Python','3.10+']]},
    {id:'examples',label:'5 valid\ncontracts',group:'evidence',x:.66,y:.79,r:43,summary:'Self-hosting, shoulder exercise, software change, agent handover and changeset-roundtrip base contracts.',meta:[['CI matrix','Python 3.10 and 3.12']]},
    {id:'negative',label:'3 negative\nfixtures',group:'evidence',x:.89,y:.77,r:43,summary:'Duplicate ID, blocked execution and failed closure expected-failure cases.',meta:[['Purpose','fail-loud semantic controls']]}
  ];
  A.lineageEdges=[['contract','v01','formalized'],['v01','v02','expanded'],['v02','selfhosting','governs'],['v02','cli','implements'],['v02','examples','exercises'],['v02','negative','challenges']];
})();
