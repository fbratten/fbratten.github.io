(() => {
  'use strict';
  const D=window.Dial4Profile=window.Dial4Profile||{};
  D.modeNodes=[
    {id:'source',label:'Source\nmaterial',group:'record',always:true,primary:true,x:.50,y:.50,r:58,summary:'The evidence, implementation, measurements or records being analyzed.',meta:[['Role','common input'],['Authority','remains external to the labels']]},
    {id:'deduction',label:'Deduction',group:'deduction',x:.20,y:.24,r:52,summary:'What can be responsibly concluded from the source?',meta:[['Burden','direct support'],['Protects against','overstated confidence']],items:['Evidence before implication','Claims must point to source material','Do not smuggle interpretation into finding']},
    {id:'inference',label:'Inference',group:'inference',x:.80,y:.24,r:52,summary:'What broader meaning or implication can reasonably be drawn?',meta:[['Burden','reasonable tethered extension'],['Protects against','possibility becoming certainty']],items:['State the interpretive move','Preserve uncertainty','Do not restate suggestion as fact']},
    {id:'abatement',label:'Abatement',group:'abatement',x:.20,y:.78,r:52,summary:'What burden, dependency, friction or uncertainty may be reduced?',meta:[['Burden','plausible operational impact'],['Protects against','utility being treated as proof']],items:['Name the burden','Name what must hold','Separate benefit from readiness']},
    {id:'legitimation',label:'Legitimation',group:'legitimation',x:.80,y:.78,r:54,summary:'What remains valid after explicit scope control, method discipline and verification?',meta:[['Burden','bounded validity'],['Protects against','formal-looking overreach']],items:['Mark in and out of scope','Separate confirmed, inferred and uncertain','Constrain what survives']}
  ];
  D.modeEdges=[
    {from:'source',to:'deduction',label:'supports'},
    {from:'source',to:'inference',label:'suggests'},
    {from:'source',to:'abatement',label:'may lessen'},
    {from:'deduction',to:'legitimation',label:'audit'},
    {from:'inference',to:'legitimation',label:'bound',dashed:true},
    {from:'abatement',to:'legitimation',label:'bound',dashed:true}
  ];

  D.mappingNodes=[
    {id:'concept',label:'Conceptual\nDIAL-4',group:'record',always:true,primary:true,x:.50,y:.12,r:58,summary:'Four didactic reasoning modes for separating evidential, interpretive, operational and bounded-validity claims.',meta:[['Canonical modes','4'],['Source','control-center-ops + public article']]},
    {id:'d',label:'Deduction',group:'deduction',x:.14,y:.38,r:43,summary:'Evidence-bound conclusion.',meta:[['Closest operational types','source_fact, verification'],['Exact mapping','no']]},
    {id:'i',label:'Inference',group:'inference',x:.36,y:.38,r:43,summary:'Reasonable implication beyond direct findings.',meta:[['Closest operational types','inference, interpretation, implication'],['Exact mapping','no']]},
    {id:'a',label:'Abatement',group:'abatement',x:.64,y:.38,r:43,summary:'Potential reduction in burden or friction.',meta:[['Closest operational types','implication, decision context'],['Dedicated ChangePlane type','no']]},
    {id:'l',label:'Legitimation',group:'legitimation',x:.86,y:.38,r:46,summary:'What survives explicit scope and verification discipline.',meta:[['Closest operational types','verification, decision'],['Dedicated ChangePlane type','no']]},
    {id:'record',label:'ChangePlane\nDial4Claim',group:'record',always:true,primary:true,x:.50,y:.72,r:60,summary:'A first-class claim-separation record with a free-form claim type and a recommended six-value vocabulary.',meta:[['Protocol tag','DIAL-4 or DIAL-4+'],['Storage','protocol record']]},
    {id:'types',label:'6 recommended\nclaim types',group:'boundary',x:.22,y:.86,r:50,summary:'source_fact, interpretation, implication, decision, inference and verification.',meta:[['Enforcement','recommended, free-form'],['One-to-one with modes','no']]},
    {id:'fields',label:'Evidence +\nuncertainty fields',group:'record',x:.78,y:.86,r:50,summary:'supporting_evidence, weaknesses and uncertainty remain available on the claim record.',meta:[['Present on base record','yes'],['Automatically calibrated','no']]}
  ];
  D.mappingEdges=[
    {from:'concept',to:'d',label:'mode'},{from:'concept',to:'i',label:'mode'},{from:'concept',to:'a',label:'mode'},{from:'concept',to:'l',label:'mode'},
    {from:'d',to:'record',label:'related projection',dashed:true},{from:'i',to:'record',label:'related projection',dashed:true},{from:'a',to:'record',label:'related projection',dashed:true},{from:'l',to:'record',label:'related projection',dashed:true},
    {from:'record',to:'types',label:'recommends'},{from:'record',to:'fields',label:'carries'}
  ];

  D.collisionNodes=[
    {id:'label',label:'DIAL-4P',group:'boundary',always:true,primary:true,x:.50,y:.48,r:62,summary:'An overloaded label that requires expansion or repository context.',meta:[['Safe use','always spell out'],['Interchangeable','no']]},
    {id:'possibility',label:'Possibility',group:'legitimation',x:.20,y:.28,r:55,summary:'Composed framework: DIAL-4 claim type, DIAL-4+ strength, Diátaxis document form and 5PP possibility governance.',meta:[['Authority','control-center-ops / Adaptivearts.ai'],['Role','knowledge and next-step governance']]},
    {id:'projection',label:'Projection /\nProductization',group:'abatement',x:.80,y:.28,r:57,summary:'ChangePlane rendering of an already-recorded trace into a derived downstream artifact.',meta:[['Authority','ChangePlane'],['source_truth','always false']]},
    {id:'status',label:'Possibility\nstatus',group:'inference',x:.20,y:.78,r:50,summary:'confirmed, plausible, emerging, buildable with custom engineering, blocked by tooling, or not yet evidenced.',meta:[['Question','what remains possible?'],['Not a projection type','yes']]},
    {id:'artifact',label:'Derived\nartifact',group:'record',x:.80,y:.78,r:50,summary:'seal report, handoff, PR summary, memory receipt, gotcha, ADR candidate or didactic explanation.',meta:[['Question','how is trace rendered?'],['Not possibility governance','yes']]}
  ];
  D.collisionEdges=[
    {from:'label',to:'possibility',label:'means in framework'},{from:'label',to:'projection',label:'means in repo'},
    {from:'possibility',to:'status',label:'governs'},{from:'projection',to:'artifact',label:'emits'}
  ];

  D.lineageNodes=[
    {id:'apr8',label:'8 Apr 2026\nworking formulation',group:'inference',x:.12,y:.48,r:54,summary:'Private first-party development material separates inference, reduction, deduction and 5PP evaluation before the final acronym is stabilized.',meta:[['Evidence class','first-party provenance'],['Public full text','no']]},
    {id:'framework',label:'DIAL-4\nformalization',group:'deduction',x:.34,y:.28,r:52,summary:'Deduction, Inference, Abatement and Legitimation are named as four distinct claim modes.',meta:[['Source','prompt library'],['Version label','1.0 in source schema']]},
    {id:'article',label:'20 Apr 2026\npublic explanation',group:'legitimation',x:.55,y:.50,r:54,summary:'Adaptivearts.ai publishes the problem, four burdens, DIAL-4+, document surface and Possibility composition.',meta:[['Evidence class','public first-party explanation'],['Independent validation','no']]},
    {id:'mvp4',label:'7 Jul 2026\nChangePlane MVP-4',group:'record',x:.76,y:.28,r:54,summary:'Dial4Claim, protocol tags, CLI flow, protocol storage and seal binding land as first-class records.',meta:[['Commit','e37da0129d25…'],['Source-reported increment','+6 tests, 71 total']]},
    {id:'pin',label:'Current pinned\nrecord contracts',group:'record',x:.89,y:.70,r:52,summary:'DIAL-4 and DIAL-4+ JSON Schemas distinguish ungraded and graded records.',meta:[['ChangePlane pin','32cb7840915d…'],['Concept pin','7485ee6ade63…']]}
  ];
  D.lineageEdges=[
    {from:'apr8',to:'framework',label:'distilled'},{from:'framework',to:'article',label:'explained publicly'},
    {from:'framework',to:'mvp4',label:'operationalized partly',dashed:true},{from:'mvp4',to:'pin',label:'contracts retained'}
  ];
})();
