(() => {
  'use strict';
  const P=window.Dial4PlusProfile=window.Dial4PlusProfile||{};
  P.axisNodes=[
    {id:'claim',label:'Claim',group:'record',always:true,primary:true,x:.50,y:.50,r:62,summary:'A DIAL-4 claim whose handling is enriched by separate strength dimensions.',meta:[['Rule','do not collapse dimensions'],['Truth guarantee','none']]},
    {id:'confidence',label:'Confidence',group:'confidence',x:.18,y:.22,r:54,summary:'How strongly the analyst or system currently holds the claim.',meta:[['Conceptual role','claim strength'],['Not equal to','evidence quality']]},
    {id:'quality',label:'Evidence\nquality',group:'evidence',x:.82,y:.22,r:56,summary:'How strong, direct and appropriate the supporting basis is for this claim.',meta:[['Conceptual role','support quality'],['Not equal to','citation count']]},
    {id:'scope',label:'Scope',group:'scope',x:.50,y:.84,r:54,summary:'The conditions, population, version, environment or domain inside which the claim is intended to hold.',meta:[['Conceptual role','validity boundary'],['Safer pattern','narrow explicit scope']]},
    {id:'handling',label:'Bounded\nhandling',group:'boundary',x:.50,y:.16,r:49,summary:'The three dimensions jointly influence whether a claim is retained, caveated, narrowed, retested or rejected.',meta:[['Output','handling posture'],['Automatic truth','no']]}
  ];
  P.axisEdges=[
    {from:'claim',to:'confidence',label:'held with'},
    {from:'claim',to:'quality',label:'supported by'},
    {from:'claim',to:'scope',label:'bounded to'},
    {from:'confidence',to:'handling',label:'informs',dashed:true},
    {from:'quality',to:'handling',label:'informs',dashed:true},
    {from:'scope',to:'handling',label:'informs',dashed:true}
  ];

  P.mappingNodes=[
    {id:'concept',label:'Conceptual\nDIAL-4+',group:'record',always:true,primary:true,x:.23,y:.48,r:64,summary:'Three explicit analytical dimensions: confidence, evidence quality and scope.',meta:[['Source','control-center-ops + article'],['Purpose','claim-strength hygiene']]},
    {id:'confidence',label:'Confidence',group:'confidence',x:.48,y:.15,r:45,summary:'Explicit conceptual axis and explicit ChangePlane field.',meta:[['ChangePlane field','confidence'],['Range enforcement','not in pinned dataclass/schema']]},
    {id:'quality',label:'Evidence\nquality',group:'evidence',x:.48,y:.48,r:48,summary:'Explicit conceptual axis without an explicit ChangePlane field of the same name.',meta:[['Operational proxies','supporting_evidence, weaknesses'],['Equivalent','no']]},
    {id:'scope',label:'Scope',group:'scope',x:.48,y:.81,r:45,summary:'Explicit conceptual axis without an explicit ChangePlane scope field.',meta:[['Possible context fields','phase, claim text, external records'],['Machine-enforced','no']]},
    {id:'record',label:'ChangePlane\nDial4Claim',group:'record',always:true,primary:true,x:.78,y:.48,r:66,summary:'Operational claim record that switches its protocol tag when confidence and/or strength is supplied.',meta:[['Protocol','DIAL-4+'],['Storage','protocol record + JSON']]},
    {id:'strength',label:'Strength',group:'confidence',x:.73,y:.13,r:44,summary:'Free-form operational warrant-strength field. It is not the same as conceptual evidence quality or scope.',meta:[['Type','optional string'],['Closed vocabulary','no']]},
    {id:'support',label:'Evidence +\nweaknesses',group:'evidence',x:.91,y:.23,r:46,summary:'Supporting references and explicit weaknesses remain attached to the record.',meta:[['Fields','supporting_evidence, weaknesses'],['Automatic evaluation','no']]},
    {id:'uncertainty',label:'Uncertainty',group:'boundary',x:.91,y:.75,r:46,summary:'Free-text residual uncertainty can be retained without converting it into a single confidence value.',meta:[['Field','uncertainty'],['Calibration','not automatic']]}
  ];
  P.mappingEdges=[
    {from:'concept',to:'confidence',label:'axis'},{from:'concept',to:'quality',label:'axis'},{from:'concept',to:'scope',label:'axis'},
    {from:'confidence',to:'record',label:'explicit field'},{from:'quality',to:'record',label:'partial projection',dashed:true},{from:'scope',to:'record',label:'not explicit',dashed:true},
    {from:'strength',to:'record',label:'field'},{from:'support',to:'record',label:'fields'},{from:'uncertainty',to:'record',label:'field'}
  ];

  P.recordNodes=[
    {id:'input',label:'Claim input',group:'record',x:.10,y:.50,r:48,summary:'Claim type, text, optional phase and optional grading fields enter the record constructor.',meta:[['Recommended types','6'],['Claim type enforcement','free-form']]},
    {id:'confidence',label:'confidence',group:'confidence',x:.28,y:.20,r:43,summary:'Optional float. CLI help says 0..1, but the pinned model and schema do not declare range checks.',meta:[['Schema type','number or null'],['minimum / maximum','absent']]},
    {id:'strength',label:'strength',group:'confidence',x:.28,y:.80,r:43,summary:'Optional free-form string used as warrant-strength grading.',meta:[['Schema type','string or null'],['Vocabulary','not closed']]},
    {id:'claim',label:'Dial4Claim',group:'record',always:true,primary:true,x:.48,y:.50,r:60,summary:'Dataclass holding claim identity, text, grading, support, weaknesses and uncertainty.',meta:[['Tag rule','confidence or strength → DIAL-4+'],['Round trip','to_dict']]},
    {id:'schema',label:'DIAL-4+\nJSON Schema',group:'boundary',x:.68,y:.22,r:53,summary:'Requires all fields, prohibits additional properties and requires confidence and/or strength to be non-null.',meta:[['Draft','2020-12'],['Range limit','not declared']]},
    {id:'ledger',label:'Protocol\nrecord',group:'record',x:.70,y:.74,r:50,summary:'The serialized record is persisted as a first-class protocol record associated with a run.',meta:[['Storage','ledger + JSON file'],['Epistemic validation','not supplied by storage']]},
    {id:'trace',label:'Ordered\nprotocol trace',group:'evidence',x:.87,y:.50,r:52,summary:'The ordered record set can be hashed into a seal as protocol_trace_sha256.',meta:[['Property','tamper evidence'],['Not proof of','claim truth']]}
  ];
  P.recordEdges=[
    {from:'input',to:'claim',label:'constructs'},{from:'confidence',to:'claim',label:'optional'},{from:'strength',to:'claim',label:'optional'},
    {from:'claim',to:'schema',label:'serializes against'},{from:'claim',to:'ledger',label:'persists'},
    {from:'schema',to:'trace',label:'shapes record',dashed:true},{from:'ledger',to:'trace',label:'ordered into'}
  ];

  P.lineageNodes=[
    {id:'apr8',label:'8 Apr 2026\nconfidence-label variant',group:'confidence',x:.12,y:.48,r:56,summary:'First-party development material adds explicit inline confidence labels and claim-strength axes to DIAL-4.',meta:[['Evidence class','private first-party provenance'],['Independent validation','no']]},
    {id:'model',label:'Three-axis\nconceptual model',group:'record',x:.35,y:.24,r:54,summary:'Confidence, evidence quality and scope become the compact DIAL-4+ strength surface.',meta:[['Function','grade claim handling'],['Single score','no']]},
    {id:'article',label:'20 Apr 2026\npublic explanation',group:'scope',x:.56,y:.50,r:54,summary:'The public article explains the DIAL-4+ axes and their role before the Possibility composition.',meta:[['Evidence class','public first-party explanation'],['Outcome study','no']]},
    {id:'mvp4',label:'7 Jul 2026\nChangePlane MVP-4',group:'record',x:.76,y:.24,r:56,summary:'The operational Dial4Claim record, protocol-tag switch, CLI flow, protocol storage and seal binding land.',meta:[['Commit','e37da0129d25…'],['Receipt','+6 tests, 71 total mixed scope']]},
    {id:'pin',label:'Current pinned\ncontract boundary',group:'boundary',x:.89,y:.70,r:54,summary:'The current schema retains graded records but does not encode explicit evidence-quality, scope or confidence-range constraints.',meta:[['ChangePlane pin','32cb7840915d…'],['Concept pin','7485ee6ade63…']]}
  ];
  P.lineageEdges=[
    {from:'apr8',to:'model',label:'formalized'},{from:'model',to:'article',label:'explained publicly'},
    {from:'model',to:'mvp4',label:'operationalized partly',dashed:true},{from:'mvp4',to:'pin',label:'contract retained'}
  ];
})();
