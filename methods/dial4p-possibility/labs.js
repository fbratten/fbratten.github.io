(() => {
  'use strict';
  const P = window.Dial4PPossibility = window.Dial4PPossibility || {};
  const by = id => document.getElementById(id);

  P.setupScroll = () => document.querySelectorAll('[data-scroll-target]').forEach(btn => btn.addEventListener('click', () => by(btn.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth'})));

  P.initClassifier = () => {
    const form = by('classifierForm');
    const run = () => {
      const direct = by('classDirect').checked;
      const partial = by('classPartial').checked;
      const pattern = by('classPattern').checked;
      const tooling = by('classTooling').checked;
      const engineering = by('classEngineering').checked;
      const contradiction = by('classContradiction').checked;
      const impossiblePremise = by('classImpossiblePremise').checked;
      const hardConstraint = by('classHardConstraint').checked;
      const outOfScope = by('classOutOfScope').checked;
      let status = 'Could Be', posture = 'structure before judging', reason = 'No hard collapse condition is present.';
      if (outOfScope) { status = 'Out of Scope'; posture = 'route or park'; reason = 'The item lies outside the present task boundary, without being declared invalid.'; }
      else if (contradiction || impossiblePremise || hardConstraint) { status = 'Impossible Under Current Constraints'; posture = 'reject within stated boundary'; reason = 'A contradiction, impossible premise or hard non-negotiable constraint forces collapse.'; }
      else if (direct && !partial) { status = 'Confirmed'; posture = 'use within declared scope'; reason = 'Direct support is present and no weakening signal was selected.'; }
      else if (tooling && !engineering) { status = 'Blocked by Current Tooling'; posture = 'track dependency or seek alternate route'; reason = 'The concept is not invalid, but the current capability surface blocks it.'; }
      else if (engineering) { status = 'Buildable with Custom Engineering'; posture = 'divide into modules and proof paths'; reason = 'No hard conceptual blocker is known, but non-trivial implementation work remains.'; }
      else if (pattern) { status = 'Emerging'; posture = 'replicate and measure'; reason = 'A pattern is visible but not yet stable.'; }
      else if (partial) { status = 'Plausible'; posture = 'retain with caveat and investigate'; reason = 'The claim is reasonable but only partially supported.'; }
      else if (!direct && !partial && !pattern) { status = 'Not Yet Evidenced'; posture = 'define an evidence-acquisition path'; reason = 'There is insufficient support in either direction.'; }
      const collapseAllowed = status === 'Impossible Under Current Constraints';
      by('classifierVerdict').textContent = status;
      by('classifierVerdict').className = `verdict ${status === 'Confirmed' ? 'pass' : collapseAllowed ? 'fail' : 'warn'}`;
      by('classifierOutput').textContent = JSON.stringify({
        status, posture, reason,
        collapse_allowed: collapseAllowed,
        claim_truth_validated: false,
        feasibility_proven: false,
        next_required_artifact: status === 'Buildable with Custom Engineering' ? 'bounded implementation plan' : status === 'Not Yet Evidenced' ? 'evidence plan' : status === 'Confirmed' ? 'scope-preserving receipt' : 'status-specific follow-up'
      }, null, 2);
    };
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    form.querySelectorAll('input').forEach(input => input.addEventListener('change', run));
    run();
  };

  P.initDivisionBuilder = () => {
    const form = by('divisionForm');
    const layerMap = {
      source: ['Identify authoritative inputs', 'Record source gaps and assumptions', 'Define source-of-truth boundary'],
      transformation: ['Build a minimal conversion path', 'Record normalization rules', 'Test failure on malformed input'],
      delivery: ['Create one bounded user-facing output', 'Define audience and Diátaxis form', 'Check information leakage'],
      automation: ['Define a repeatable trigger', 'Add retry and stop conditions', 'Capture execution receipt'],
      validation: ['Create positive and negative controls', 'Define falsifiers', 'Add regression checks'],
      governance: ['Define authority and permissions', 'Record provenance and non-claims', 'Set review and promotion gates'],
      execution: ['Pin runtime and dependencies', 'Define environment boundary', 'Verify rollback or safe stop']
    };
    const run = () => {
      const selected = [...form.querySelectorAll('input[data-layer]:checked')].map(x => x.dataset.layer);
      const title = by('divisionTitle').value.trim() || 'Unnamed possibility';
      const units = selected.flatMap(layer => layerMap[layer].map((task, index) => ({id:`${layer}-${index+1}`, layer, task, status:'candidate work unit'})));
      const proofPaths = selected.map(layer => ({layer, proof: layer === 'validation' ? 'negative and positive test receipt' : layer === 'governance' ? 'authority and provenance record' : `bounded ${layer} vertical slice`}));
      by('divisionVerdict').textContent = selected.length ? 'DIVIDED' : 'NO LAYERS';
      by('divisionVerdict').className = `verdict ${selected.length ? 'pass' : 'fail'}`;
      by('divisionOutput').textContent = JSON.stringify({
        possibility: title,
        selected_layers: selected,
        atomic_work_units: units,
        proof_paths: proofPaths,
        whole_system_feasibility_proven: false,
        note: 'Operational division enables progress; it does not guarantee the complete concept will succeed.'
      }, null, 2);
    };
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    form.querySelectorAll('input').forEach(input => input.addEventListener('change', run));
    run();
  };

  P.initCollapseLab = () => {
    const form = by('collapseForm');
    const soft = ['noProduct','noStandard','engineeringEffort','vendorGap','unfamiliar','noEvidence'];
    const hard = ['explicitContradiction','logicViolation','internalIncoherence','impossiblePremise','hardLimitation'];
    const run = () => {
      const softSelected = soft.filter(id => by(id).checked);
      const hardSelected = hard.filter(id => by(id).checked);
      let verdict = 'PRESERVE AND RECLASSIFY', action = 'Do not reject. Assign a bounded status and define the next proof path.';
      if (hardSelected.length) { verdict = 'COLLAPSE PERMITTED'; action = 'Reject or narrow only within the explicitly stated hard boundary.'; }
      by('collapseVerdict').textContent = verdict;
      by('collapseVerdict').className = `verdict ${hardSelected.length ? 'fail' : 'pass'}`;
      by('collapseOutput').textContent = JSON.stringify({
        soft_reasons_that_do_not_justify_rejection: softSelected,
        hard_reasons_that_can_force_collapse: hardSelected,
        verdict, action,
        out_of_scope_is_invalid: false,
        lack_of_evidence_is_feasibility_evidence: false
      }, null, 2);
    };
    form.addEventListener('submit', e => { e.preventDefault(); run(); });
    form.querySelectorAll('input').forEach(input => input.addEventListener('change', run));
    run();
  };
})();
