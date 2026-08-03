(() => {
  'use strict';
  const P=window.Dial4PlusProfile=window.Dial4PlusProfile||{},by=id=>document.getElementById(id);
  P.setupScroll=()=>document.querySelectorAll('[data-scroll-target]').forEach(btn=>btn.addEventListener('click',()=>by(btn.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth'})));

  P.initCalibration=()=>{
    const form=by('calibrationForm'),confidence=by('calConfidence');
    const label=()=>by('calConfidenceValue').textContent=Number(confidence.value).toFixed(2);
    confidence.addEventListener('input',label);
    const run=()=>{
      const c=Number(confidence.value),quality=by('calQuality').value,scope=by('calScope').value,contradiction=by('calContradiction').checked;
      const qualityRank={none:0,analogy:1,documentation:2,implementation:3,observed:4}[quality];
      const scopeRank={unbounded:0,general:1,local:2,bounded:3}[scope];
      let posture='RETAIN WITH CAVEAT',reason='The dimensions do not justify a stronger posture.';
      if(contradiction){posture='REVISE OR REJECT';reason='Known contradictory evidence must be resolved before confidence is retained.';}
      else if(qualityRank===0){posture='NOT YET SUPPORTED';reason='Confidence without supporting evidence remains an unsupported belief state.';}
      else if(c>=.8&&qualityRank<=1){posture='CONFIDENCE / EVIDENCE MISMATCH';reason='High confidence is paired with weak or analogical evidence.';}
      else if(qualityRank>=3&&scopeRank===0){posture='NARROW THE SCOPE';reason='Strong local evidence does not justify an unbounded claim.';}
      else if(c>=.75&&qualityRank>=3&&scopeRank>=2){posture='STRONG WITHIN BOUND';reason='Confidence, evidence quality and scope are mutually aligned within an explicit boundary.';}
      else if(qualityRank<=2||scopeRank<=1){posture='TENTATIVE / BOUNDED';reason='Retain the claim, but state the weaker evidence or broader scope explicitly.';}
      const status=posture==='STRONG WITHIN BOUND'?'pass':posture==='REVISE OR REJECT'||posture.includes('MISMATCH')?'fail':'warn';
      by('calibrationVerdict').textContent=posture;by('calibrationVerdict').className=`verdict ${status}`;
      by('calibrationOutput').textContent=JSON.stringify({conceptual_dial4_plus:{confidence:c,evidence_quality:quality,scope,known_contradiction:contradiction},handling_posture:posture,reason,calibrated_probability:false,claim_truth_validated:false,source_retrieved:false},null,2);
    };
    form.addEventListener('submit',e=>{e.preventDefault();run()});form.addEventListener('change',run);label();run();
  };

  P.initScopeStress=()=>{
    const form=by('scopeForm');
    const run=()=>{
      const evidenceScope=by('evidenceScope').value,claimScope=by('assertedScope').value,replications=Number(by('replicationCount').value),versionBound=by('versionBound').checked;
      const rank={single:0,local:1,multi:2,broad:3};
      const gap=rank[claimScope]-rank[evidenceScope];
      let verdict='SCOPE ALIGNED',reason='The asserted claim does not exceed the selected evidence scope.';
      if(gap>=2){verdict='SEVERE GENERALIZATION GAP';reason='The claim reaches substantially beyond the evidence boundary.';}
      else if(gap===1){verdict='NARROW OR CAVEAT';reason='The claim is one scope level broader than the evidence.';}
      if(replications===0){verdict='NOT YET REPLICATED';reason='No replication is represented in the synthetic input.';}
      const status=verdict==='SCOPE ALIGNED'?'pass':verdict==='SEVERE GENERALIZATION GAP'?'fail':'warn';
      by('scopeVerdict').textContent=verdict;by('scopeVerdict').className=`verdict ${status}`;
      by('scopeOutput').textContent=JSON.stringify({evidence_scope:evidenceScope,asserted_scope:claimScope,synthetic_replications:replications,version_bound:versionBound,scope_gap:gap,handling:verdict,reason,external_validity_proven:false},null,2);
    };
    form.addEventListener('submit',e=>{e.preventDefault();run()});form.addEventListener('change',run);run();
  };

  P.initSchemaBoundary=()=>{
    const form=by('schemaForm');
    const run=()=>{
      const raw=by('schemaConfidence').value.trim(),strength=by('schemaStrength').value.trim(),hasNumber=raw!==''&&!Number.isNaN(Number(raw)),confidence=hasNumber?Number(raw):null;
      const graded=hasNumber||strength!=='';
      const documentedRangeAligned=!hasNumber||(confidence>=0&&confidence<=1);
      const syntheticSchemaShapeAccepts=graded&&(hasNumber||strength!=='');
      let verdict=graded?'DIAL-4+ SHAPE':'DIAL-4 SHAPE';
      if(hasNumber&&!documentedRangeAligned)verdict='SCHEMA / DOCUMENTED RANGE GAP';
      by('schemaVerdict').textContent=verdict;by('schemaVerdict').className=`verdict ${documentedRangeAligned?'pass':'warn'}`;
      by('schemaOutput').textContent=JSON.stringify({input:{confidence,strength:strength||null},computed_protocol:graded?'DIAL-4+':'DIAL-4',documented_cli_intent:'confidence 0..1',documented_range_aligned:documentedRangeAligned,pinned_dataclass_has_range_check:false,pinned_json_schema_has_minimum:false,pinned_json_schema_has_maximum:false,synthetic_shape_would_meet_anyOf:syntheticSchemaShapeAccepts,real_schema_executed:false,real_record_written:false},null,2);
    };
    form.addEventListener('submit',e=>{e.preventDefault();run()});form.addEventListener('input',run);run();
  };
})();
