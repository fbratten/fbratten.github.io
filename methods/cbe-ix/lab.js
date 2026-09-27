(() => {
  'use strict';
  const by = id => document.getElementById(id);
  const peerContracts = ['Retention Policy Service: metadata in; classification or unresolved result out.', 'Semantic Indexer: normalized content in; embedding references out.'];
  const followup = ['Parser selection: ambiguous matches', 'Classification attachment: conflicting returns'];
  const policyResidual = 'Residual: evidence about an external policy exception is unavailable. The target can still preserve unresolved or conflicting returns without deciding policy.';
  const initial = { status: 'READY', text: 'Invariant locked: accept documents and produce normalized ingestible records. Preserve acceptance, extraction, normalization and submission.', frontier: ['Extraction', 'Record normalization', 'Downstream submission'], handoffs: [], unresolved: [], audit: 'No convergence claim has been made.' };
  const first = { status: 'CONTINUE', text: 'I1 replays the CBE snapshot: KEEP format detection and parser selection. SPLIT policy determination from attachment; KEEP attaching a classification or preserving its unresolved state. DELEGATE policy decisions and embeddings. Two follow-up gaps remain: ambiguous parser matches and conflicting classification returns.', frontier: followup, handoffs: peerContracts, unresolved: [], audit: 'Accepted target responsibilities expose new internal gaps. Parser selection and unresolved-state representation are already present; neither is a new I2 finding.' };
  const second = { status: 'VERIFY_CONVERGENCE', text: 'I2: KEEP resolving multiple parser matches using supplied precedence, or reporting an unresolved choice when it is absent. KEEP preserving conflicting classification returns as a conflict instead of silently overwriting a value. These close the I1 follow-up gaps without deciding policy.', frontier: [], handoffs: peerContracts, unresolved: [], audit: 'C1 is satisfied. An empty frontier alone does not establish C2-C7.' };
  const checked = 'C1 empty frontier; C2 fresh scan has no new gaps; C3 no new KEEP delta; C4 SPLIT parts processed; C5 no currently resolvable unresolved candidate; C6 identity preserved; C7 no cycle.';
  const traces = {
    handoffs: { context: 'The ingestion example replays the CBE snapshot in I1, then explores two new edge cases in I2. The fixture supplies format support, parser precedence and peer contracts.', steps: [initial, first, second, { status: 'EXHAUSTED_WITH_HANDOFFS', text: 'I3: a further curated gap scan adds no target-owned responsibility. Handoffs remain explicit.', frontier: [], handoffs: peerContracts, unresolved: [], audit: checked }] },
    valid: { context: 'A narrower target: identify one of two supplied document formats or report unknown. This separate example needs no adjacent operation.', steps: [
      { status: 'READY', text: 'The format detector recognizes both supplied signatures but lacks an explicit unknown-format result.', frontier: ['Unknown-format outcome'], handoffs: [], unresolved: [], audit: 'The finite fixture defines the complete example input space.' },
      { status: 'CONTINUE', text: 'KEEP returning unknown when neither supplied signature matches. The original two classifications are preserved.', frontier: [], handoffs: [], unresolved: [], audit: 'Now perform the fresh gap scan and identity audit.' },
      { status: 'EXHAUSTED_VALID', text: 'The bounded fixture has no further target-owned gap and no material unresolved boundary.', frontier: [], handoffs: [], unresolved: [], audit: checked }
    ] },
    residual: { context: 'I1 discovers unavailable evidence about a policy exception. The uncertainty is recorded immediately and retained while target-owned gaps are processed.', steps: [initial,
      { ...first, text: first.text + ' The policy handoff also reveals that exception evidence is unavailable; record this nonblocking residual now.', unresolved: [policyResidual] },
      { ...second, unresolved: [policyResidual] },
      { status: 'EXHAUSTED_WITH_RESIDUAL_UNCERTAINTY', text: 'No further valid target-owned expansion can be derived from current evidence. The policy-exception uncertainty recorded at I1 remains visible.', frontier: [], handoffs: peerContracts, unresolved: [policyResidual], audit: checked + ' Exhaustion is relative to available evidence, not complete knowledge.' }
    ] },
    boundary: { context: 'After the base snapshot, a gap scan discovers disagreement about who decides regional access. Continuing the dependent expansion would risk the pipeline assuming a peer responsibility.', steps: [initial, first,
      { status: 'BLOCKED_BY_BOUNDARY_DECISION', text: 'The regional-access ownership dispute is discovered here. Stop for an architectural decision and retain the unprocessed target frontier for re-entry.', frontier: followup, handoffs: peerContracts, unresolved: ['Blocking decision: establish who owns regional access decisions. Continuing without that decision risks target/peer responsibility takeover.'], audit: 'C5 routes a question requiring external architectural authority to a blocking decision. This does not itself mean C5 failed. No exhaustion claim is made; target-owned work remains.' }
    ] },
    drift: { context: 'This deliberately flawed acceptance trace shows how locally plausible additions can collectively change the target. Policy decisions and semantic indexing remain delegated throughout.', steps: [initial,
      { status: 'CONTINUE', text: 'I1: KEEP a preview of the normalized output so ingestion errors can be detected. The local rationale is extraction validation; the identity check still recognizes ingestion.', frontier: ['Preview validation'], handoffs: peerContracts, unresolved: [], audit: 'C6 reviewed after the accepted preview responsibility; no reader-platform role is yet assumed.' },
      { status: 'CONTINUE', text: 'I2: KEEP correction annotations alongside the preview so normalization errors can be resolved. The local rationale is record correctness; the identity check still treats annotations as part of ingestion.', frontier: ['Correction annotation handling'], handoffs: peerContracts, unresolved: [], audit: 'C6 reviewed after the accepted annotation responsibility. Preserve this rationale for comparison with the next delta.' },
      { status: 'TARGET_IDENTITY_DRIFT', text: 'I3: provisionally KEEP ongoing reader notifications when annotated content changes, justified locally as delivering corrected output. Together, persistent previews, annotations and notifications now support ongoing reader use: the accepted set has become a reader platform. C6 catches the aggregate drift immediately; the acceptance decisions need revision.', frontier: ['Correction annotation handling'], handoffs: peerContracts, unresolved: ['Blocking review: re-evaluate the accumulated preview, annotation and notification responsibilities against the ingestion invariant. Preserve the last valid design; splitting the capability requires a separate decision.'], audit: 'C6 fails after the latest material delta. Peer operations were not accepted. Local plausibility did not establish that the accumulated design preserved identity.' }
    ] },
    insufficient: { context: 'The only input is "make the document system complete". Its responsibility and current operations are unspecified.', steps: [
      { status: 'READY', text: 'Check whether the invariant and current responsibilities can be established.', frontier: [], handoffs: [], unresolved: ['Missing input: target purpose and current responsibilities.'], audit: 'An unknown target has no established target-owned frontier. Do not infer ownership from a vague label.' },
      { status: 'INSUFFICIENT_INFORMATION', text: 'Meaningful iteration cannot begin. Request or retrieve the missing target definition.', frontier: [], handoffs: [], unresolved: ['Missing input: target purpose and current responsibilities.'], audit: 'An empty frontier does not prove convergence when the target itself is undefined.' }
    ] },
    cycle: { context: 'Successive passes rename already processed format detection without adding evidence or a material semantic delta.', steps: [initial, first,
      { status: 'CONTINUE', text: 'I2 proposes "file type recognition", semantically identical to accepted format detection. Record the duplicate without accepting a new responsibility.', frontier: followup, handoffs: peerContracts, unresolved: [], audit: 'First no-progress pass. Keep the duplicate signature in the ledger.' },
      { status: 'NON_CONVERGENT', text: 'I3 proposes "document kind identification", again the same responsibility. Two consecutive passes repeat without material progress.', frontier: followup, handoffs: peerContracts, unresolved: [], audit: 'C7 fails. Stop the semantic cycle; repeated wording is not expansion or exhaustion.' }
    ] },
    limit: { context: 'An external execution budget ends the run while valid target-owned questions remain.', steps: [initial, first,
      { status: 'EXTERNAL_ITERATION_LIMIT_REACHED', text: 'The environment prevents another pass. Preserve the ledger, handoffs and remaining frontier for resumption.', frontier: followup, handoffs: peerContracts, unresolved: [], audit: 'C1 is false. A resource limit cannot be reported as EXHAUSTED_*.' }
    ] }
  };
  let position = 0;
  function fillList(id, values, emptyText) {
    const list = by(id); list.replaceChildren();
    for (const value of values.length ? values : [emptyText]) { const li = document.createElement('li'); li.textContent = value; list.append(li); }
  }
  function writeStatus(element, status) {
    element.replaceChildren();
    // Keep the exact identifier in text/copy while wrapping only between its words.
    for (const part of status.match(/[^_]+_?/g)) {
      const span = document.createElement('span'); span.className = 'status-part'; span.textContent = part; element.append(span);
    }
  }
  function render() {
    const trace = traces[by('iteration-case').value];
    const step = trace.steps[position];
    by('case-context').textContent = trace.context;
    by('iteration-label').textContent = 'Trace entry ' + (position + 1) + ' of ' + trace.steps.length + (position === 0 ? ' (initial state)' : '');
    writeStatus(by('iteration-status'), step.status);
    by('iteration-explanation').textContent = step.text;
    fillList('iteration-frontier', step.frontier, 'No unprocessed target item in this trace.');
    fillList('iteration-handoffs', step.handoffs, 'No handoff recorded at this step.');
    fillList('iteration-unresolved', step.unresolved, 'No blocking decision or residual recorded at this step.');
    by('iteration-audit').textContent = step.audit;
    const ledger = by('iteration-ledger'); ledger.replaceChildren();
    for (const item of trace.steps.slice(0, position + 1)) {
      const li = document.createElement('li');
      const status = document.createElement('span'); writeStatus(status, item.status);
      li.append(status, document.createTextNode(': ' + item.text));
      if (item.unresolved.length) {
        const residual = document.createElement('p'); residual.className = 'small';
        residual.textContent = item.unresolved.join(' '); li.append(residual);
      }
      ledger.append(li);
    }
    by('next-iteration').disabled = position === trace.steps.length - 1;
  }
  function reset() { position = 0; render(); }
  by('next-iteration').addEventListener('click', () => { const trace = traces[by('iteration-case').value]; if (position < trace.steps.length - 1) position += 1; render(); });
  by('reset-iterations').addEventListener('click', reset);
  by('iteration-case').addEventListener('change', reset);
  by('iteration-lab').hidden = false;
  render();
})();
