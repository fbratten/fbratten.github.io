(() => {
  'use strict';
  const P = window.Dial4PPossibility = window.Dial4PPossibility || {};

  P.stackNodes = [
    {id:'material',label:'Source material\nor idea',group:'boundary',x:.10,y:.50,r:50,summary:'The bounded input whose claims and possibilities are being examined.',meta:[['Input','article, blueprint, architecture, idea or system'],['Starting authority','source-bound']]},
    {id:'dial4',label:'DIAL-4\nclaim type',group:'claim',x:.30,y:.20,r:54,summary:'Separates Deduction, Inference, Abatement and Legitimation.',meta:[['Question','What kind of claim is this?'],['Failure prevented','category confusion']]},
    {id:'plus',label:'DIAL-4+\nclaim strength',group:'strength',x:.30,y:.80,r:54,summary:'Grades confidence, evidence quality and scope without converting confidence into truth.',meta:[['Question','How strong is the claim within its type?'],['Axes','confidence, evidence quality, scope']]},
    {id:'diataxis',label:'Diátaxis\ndocument form',group:'form',x:.55,y:.20,r:54,summary:'Routes knowledge to tutorial, how-to, reference or explanation.',meta:[['Question','Where and how should this knowledge be expressed?'],['Role','documentation form']]},
    {id:'fivepp',label:'5PP possibility\ngovernance',group:'governance',x:.55,y:.80,r:58,summary:'Clarifies, scopes, plans, executes and verifies what happens next.',meta:[['Question','What should happen to unresolved claims?'],['Operating law','possibility preservation under constraint']]},
    {id:'state',label:'Possibility\nstate',group:'governance',x:.78,y:.50,r:57,summary:'A graduated status replaces premature binary acceptance or rejection.',meta:[['Taxonomy','nine prompt statuses'],['Not equal to','truth, feasibility or readiness']]},
    {id:'action',label:'Bounded next\naction',group:'engineering',x:.93,y:.50,r:49,summary:'The state is translated into a proof path, enabling work, implementation unit, deferment or rejection.',meta:[['Output','actionable and falsifiable'],['Authority','bounded by evidence and scope']]}
  ];
  P.stackEdges = [
    {from:'material',to:'dial4',label:'classify'},
    {from:'material',to:'plus',label:'grade'},
    {from:'dial4',to:'diataxis',label:'route expression'},
    {from:'plus',to:'fivepp',label:'govern handling'},
    {from:'diataxis',to:'state',label:'make legible'},
    {from:'fivepp',to:'state',label:'classify'},
    {from:'state',to:'action',label:'operationalize'}
  ];

  P.statusNodes = [
    {id:'confirmed',label:'Confirmed',group:'claim',x:.14,y:.18,r:46,summary:'A strong deduction or bounded constraint is directly supported.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','use within declared scope']]},
    {id:'plausible',label:'Plausible',group:'strength',x:.35,y:.14,r:46,summary:'A reasonable inference remains tethered to evidence but is not established.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','investigate or caveat']]},
    {id:'emerging',label:'Emerging',group:'strength',x:.58,y:.14,r:46,summary:'A pattern is visible but not yet stable or sufficiently replicated.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','measure and repeat']]},
    {id:'could',label:'Could Be',group:'governance',x:.82,y:.18,r:46,summary:'A viable possibility has not yet earned a stronger status.',meta:[['Prompt taxonomy','yes'],['Article subset','not explicit'],['Next step','structure before judging']]},
    {id:'unevidenced',label:'Not Yet\nEvidenced',group:'boundary',x:.13,y:.52,r:49,summary:'There is currently insufficient support in either direction.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','define an evidence-acquisition path']]},
    {id:'tooling',label:'Blocked by\nCurrent Tooling',group:'boundary',x:.36,y:.52,r:52,summary:'The concept is not invalid, but a current dependency or capability is missing.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','track dependency or alternative route']]},
    {id:'buildable',label:'Buildable with\nCustom Engineering',group:'engineering',x:.62,y:.52,r:57,summary:'No hard conceptual blocker is known, but non-trivial implementation work is required.',meta:[['Prompt taxonomy','yes'],['Article subset','yes'],['Next step','divide into modules and proof paths']]},
    {id:'impossible',label:'Impossible Under\nCurrent Constraints',group:'boundary',x:.87,y:.52,r:58,summary:'An explicit hard constraint, contradiction, incoherence or impossible premise forces collapse.',meta:[['Prompt taxonomy','yes'],['Article subset','not explicit'],['Next step','reject with stated falsifier or constraint']]},
    {id:'scope',label:'Out of Scope',group:'form',x:.50,y:.84,r:47,summary:'The item is routed outside the present task boundary without being declared invalid.',meta:[['Prompt taxonomy','yes'],['Article subset','not explicit'],['Next step','park or transfer']]}
  ];
  P.statusEdges = [
    {from:'could',to:'plausible',label:'evidence grows'},
    {from:'plausible',to:'confirmed',label:'direct support'},
    {from:'could',to:'emerging',label:'pattern appears'},
    {from:'emerging',to:'confirmed',label:'stabilizes'},
    {from:'unevidenced',to:'could',label:'structure'},
    {from:'tooling',to:'buildable',label:'alternative found'},
    {from:'buildable',to:'emerging',label:'prototype evidence'},
    {from:'could',to:'impossible',label:'hard contradiction',dashed:true,color:'rgba(242,127,127,.6)'},
    {from:'could',to:'scope',label:'route elsewhere',dashed:true}
  ];

  P.pathwayNodes = [
    {id:'possibility',label:'Unresolved\npossibility',group:'governance',x:.08,y:.50,r:52,summary:'The original could-be claim before operational division.',meta:[['Status','unresolved'],['Rule','do not collapse before division']]},
    {id:'source',label:'Source\nlayer',group:'claim',x:.25,y:.16,r:45,summary:'Identify authoritative inputs, observed facts and missing evidence.',meta:[['Question','What is the system of record?'],['Proof path','source inspection']]},
    {id:'transform',label:'Transformation\nlayer',group:'engineering',x:.25,y:.40,r:49,summary:'Define conversion, normalization, interpretation or preparation work.',meta:[['Question','What turns input into usable form?'],['Proof path','bounded transformation prototype']]},
    {id:'delivery',label:'Rendering /\ndelivery',group:'form',x:.25,y:.65,r:48,summary:'Define how the result is presented, published or exposed.',meta:[['Question','What does the user receive?'],['Proof path','rendered vertical slice']]},
    {id:'automation',label:'Automation\nlayer',group:'engineering',x:.47,y:.14,r:46,summary:'Define triggers, schedules, event handling and repeatable execution.',meta:[['Question','What can run predictably?'],['Proof path','repeatable bounded flow']]},
    {id:'validation',label:'Validation\nlayer',group:'governance',x:.47,y:.38,r:47,summary:'Define correctness, completeness, safety and regression checks.',meta:[['Question','How will failure be detected?'],['Proof path','negative and positive controls']]},
    {id:'governance',label:'Governance\nlayer',group:'governance',x:.47,y:.64,r:48,summary:'Define scope, provenance, permissions, review and non-claims.',meta:[['Question','Who may decide and act?'],['Proof path','authority and audit boundary']]},
    {id:'execution',label:'Deployment /\nexecution',group:'engineering',x:.47,y:.86,r:49,summary:'Define runtime topology, dependencies and operating conditions.',meta:[['Question','Where and under what constraints does it run?'],['Proof path','environment receipt']]},
    {id:'units',label:'Atomic work\nunits',group:'engineering',x:.70,y:.50,r:53,summary:'Independent tasks are extracted so progress can begin without total certainty.',meta:[['Properties','bounded, testable, dependency-aware'],['Not guaranteed','whole-system feasibility']]},
    {id:'proof',label:'Proof paths +\nfalsifiers',group:'strength',x:.86,y:.28,r:52,summary:'Each unit gains evidence requirements and conditions that would disprove it.',meta:[['Output','testable hypothesis or receipt'],['Purpose','move status honestly']]},
    {id:'verdict',label:'Advance, narrow,\npark or reject',group:'boundary',x:.88,y:.70,r:55,summary:'The final disposition follows from evidence, constraints and the verified scope.',meta:[['Not allowed','uniform optimism'],['Not allowed','premature rejection']]}
  ];
  P.pathwayEdges = [
    {from:'possibility',to:'source',label:'divide'}, {from:'possibility',to:'transform',label:'divide'},
    {from:'possibility',to:'delivery',label:'divide'}, {from:'source',to:'automation'},
    {from:'transform',to:'validation'}, {from:'delivery',to:'governance'},
    {from:'automation',to:'units'}, {from:'validation',to:'units'},
    {from:'governance',to:'units'}, {from:'execution',to:'units'},
    {from:'units',to:'proof',label:'instrument'}, {from:'proof',to:'verdict',label:'verify'}
  ];

  P.boundaryNodes = [
    {id:'possibility',label:'DIAL-4P\nPossibility',group:'governance',x:.24,y:.45,r:67,summary:'A composed reasoning and possibility-governance framework.',meta:[['P means','Possibility'],['Input','claims, ideas, architectures'],['Output','typed, graded and governed possibility states']]},
    {id:'projection',label:'DIAL-4P\nProjection /\nProductization',group:'boundary',x:.76,y:.45,r:70,summary:'ChangePlane renders an existing protocol trace into a derived downstream artifact.',meta:[['P means','Projection/Productization'],['Input','existing protocol trace'],['Output','derived projection with source_truth=false']]},
    {id:'claim',label:'Claim +\nuncertainty',group:'claim',x:.12,y:.82,r:45,summary:'Possibility begins before resolution and preserves graduated status.',meta:[['Authority','source and explicit constraints'],['Action','classify, divide, test']]},
    {id:'trace',label:'Recorded\nprotocol trace',group:'engineering',x:.88,y:.82,r:47,summary:'Projection/Productization begins after protocol records already exist.',meta:[['Authority','trace provenance'],['Action','render derived artifact']]},
    {id:'warning',label:'Same acronym,\ndifferent system',group:'form',x:.50,y:.14,r:54,summary:'Every public use should include the expansion or repository context.',meta:[['Publication rule','always expand P'],['Interchangeable','no']]}
  ];
  P.boundaryEdges = [
    {from:'warning',to:'possibility',label:'distinguish'}, {from:'warning',to:'projection',label:'distinguish'},
    {from:'claim',to:'possibility',label:'input'}, {from:'trace',to:'projection',label:'input'},
    {from:'possibility',to:'projection',label:'not equivalent',dashed:true,color:'rgba(242,127,127,.62)'}
  ];
})();
