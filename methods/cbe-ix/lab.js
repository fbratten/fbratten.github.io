(() => {
  'use strict';
  const by = id => document.getElementById(id);
  const peerContracts = ['Retention Policy Service: metadata in; classification or unresolved result out.', 'Semantic Indexer: normalized content in; embedding references out.'];
  const initial = { status: 'READY', text: 'Invariant locked: accept documents and produce normalized ingestible records. Preserve acceptance, extraction, normalization and submission.', frontier: ['Format handling', 'Retention metadata attachment', 'Indexing dependency'], handoffs: [], audit: 'No convergence claim has been made.' };
  const first = { status: 'CONTINUE', text: 'I1: KEEP format detection. SPLIT determining retention policy from attaching its return. KEEP attachment; DELEGATE the policy decision and embeddings.', frontier: ['Parser selection', 'Handling an unresolved classification'], handoffs: peerContracts, audit: 'Material target delta recorded; peer operations remain outside the frontier.' };
  const second = { status: 'VERIFY_CONVERGENCE', text: 'I2: KEEP selecting a parser from supplied format support and preserving an explicit unresolved-classification state.', frontier: [], handoffs: peerContracts, audit: 'C1 is satisfied. An empty frontier alone does not establish C2-C7.' };
  const checked = 'C1 empty frontier; C2 fresh scan has no new gaps; C3 no new KEEP delta; C4 SPLIT parts processed; C5 no currently resolvable unresolved candidate; C6 identity preserved; C7 no cycle.';
  const traces = {
    handoffs: { context: 'The ingestion example has supplied format support and explicit peer contracts.', steps: [initial, first, second, { status: 'EXHAUSTED_WITH_HANDOFFS', text: 'I3: a further curated gap scan adds no target-owned responsibility. Handoffs remain explicit.', frontier: [], handoffs: peerContracts, audit: checked }] },
    valid: { context: 'A narrower target: identify one of two supplied document formats or report unknown. This separate example needs no adjacent operation.', steps: [
      { status: 'READY', text: 'The format detector recognizes both supplied signatures but lacks an explicit unknown-format result.', frontier: ['Unknown-format outcome'], handoffs: [], audit: 'The finite fixture defines the complete example input space.' },
      { status: 'CONTINUE', text: 'KEEP returning unknown when neither supplied signature matches. The original two classifications are preserved.', frontier: [], handoffs: [], audit: 'Now perform the fresh gap scan and identity audit.' },
      { status: 'EXHAUSTED_VALID', text: 'The bounded fixture has no further target-owned gap and no material unresolved boundary.', frontier: [], handoffs: [], audit: checked }
    ] },
    residual: { context: 'The target safely records unresolved classifications, but evidence about an external policy exception is unavailable. It does not block the defined target behavior.', steps: [initial, first, second,
      { status: 'EXHAUSTED_WITH_RESIDUAL_UNCERTAINTY', text: 'No further valid target-owned expansion can be derived from current evidence. Preserve the unavailable policy-exception evidence as residual uncertainty.', frontier: [], handoffs: peerContracts, audit: checked + ' Residual: external policy exception remains unverified; this is not complete knowledge.' }
    ] },
    boundary: { context: 'Two owners disagree about who decides regional access. Continuing would require the pipeline to assume a peer responsibility.', steps: [initial, first,
      { status: 'BLOCKED_BY_BOUNDARY_DECISION', text: 'Stop for the architectural ownership decision. Keep the unprocessed target frontier for re-entry.', frontier: ['Parser selection', 'Handling an unresolved classification', 'Regional access ownership decision'], handoffs: peerContracts, audit: 'C5 cannot be resolved locally. Do not claim exhaustion or invent a destination.' }
    ] },
    drift: { context: 'A later proposal absorbs reader conversations, semantic search and policy decisions into ingestion.', steps: [initial, first,
      { status: 'TARGET_IDENTITY_DRIFT', text: 'The proposed target is becoming a reader platform. Stop and re-evaluate the accumulated proposal against the original invariant.', frontier: ['Re-evaluate proposed reader-platform responsibilities'], handoffs: peerContracts, audit: 'C6 fails. Preserve the last valid design; do not silently rename the target to legitimize expansion.' }
    ] },
    insufficient: { context: 'The only input is "make the document system complete". Its responsibility and current operations are unspecified.', steps: [
      { status: 'READY', text: 'Check whether the invariant and current responsibilities can be established.', frontier: ['Establish target purpose and current responsibilities'], handoffs: [], audit: 'Do not infer a system definition from a vague label.' },
      { status: 'INSUFFICIENT_INFORMATION', text: 'Meaningful iteration cannot begin. Request or retrieve the missing target definition.', frontier: ['Establish target purpose and current responsibilities'], handoffs: [], audit: 'No completeness or convergence verdict is available.' }
    ] },
    cycle: { context: 'Successive passes rename already processed format detection without adding evidence or a material semantic delta.', steps: [initial, first,
      { status: 'CONTINUE', text: 'A pass proposes "file type recognition", semantically identical to accepted format detection. Record the duplicate without accepting a new responsibility.', frontier: ['Parser selection', 'Handling an unresolved classification'], handoffs: peerContracts, audit: 'First no-progress pass. Keep the duplicate signature in the ledger.' },
      { status: 'NON_CONVERGENT', text: 'A second pass proposes "document kind identification", again the same responsibility. The trace repeats without material progress.', frontier: ['Parser selection', 'Handling an unresolved classification'], handoffs: peerContracts, audit: 'C7 fails. Stop the semantic cycle; repeated wording is not expansion or exhaustion.' }
    ] },
    limit: { context: 'An external execution budget ends the run while valid target-owned questions remain.', steps: [initial, first,
      { status: 'EXTERNAL_ITERATION_LIMIT_REACHED', text: 'The environment prevents another pass. Preserve the ledger, handoffs and remaining frontier for resumption.', frontier: ['Parser selection', 'Handling an unresolved classification'], handoffs: peerContracts, audit: 'C1 is false. A resource limit cannot be reported as EXHAUSTED_*.' }
    ] }
  };
  let position = 0;
  function fillList(id, values, emptyText) {
    const list = by(id); list.replaceChildren();
    for (const value of values.length ? values : [emptyText]) { const li = document.createElement('li'); li.textContent = value; list.append(li); }
  }
  function render() {
    const trace = traces[by('iteration-case').value];
    const step = trace.steps[position];
    by('case-context').textContent = trace.context;
    by('iteration-label').textContent = 'Trace step ' + position + ' of ' + (trace.steps.length - 1);
    by('iteration-status').textContent = step.status;
    by('iteration-explanation').textContent = step.text;
    fillList('iteration-frontier', step.frontier, 'No unprocessed target item in this trace.');
    fillList('iteration-handoffs', step.handoffs, 'No handoff recorded at this step.');
    by('iteration-audit').textContent = step.audit;
    fillList('iteration-ledger', trace.steps.slice(0, position + 1).map(item => item.status + ': ' + item.text), '');
    by('next-iteration').disabled = position === trace.steps.length - 1;
  }
  function reset() { position = 0; render(); }
  by('next-iteration').addEventListener('click', () => { const trace = traces[by('iteration-case').value]; if (position < trace.steps.length - 1) position += 1; render(); });
  by('reset-iterations').addEventListener('click', reset);
  by('iteration-case').addEventListener('change', reset);
  by('iteration-lab').hidden = false;
  render();
})();
