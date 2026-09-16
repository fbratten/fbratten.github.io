(() => {
  'use strict';

  const session = {
    lab_family: 'blueprint-rules-authority-enforcement',
    generated_at: null,
    results: {},
  };

  const $ = (id) => document.getElementById(id);
  const selected = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

  function setResult(id, message, tone = 'info') {
    const el = $(id);
    if (!el) return;
    el.className = `result ${tone}`;
    el.textContent = message;
  }

  function record(id, data) {
    session.generated_at = new Date().toISOString();
    session.results[id] = {
      ...data,
      recorded_at: new Date().toISOString(),
    };
  }

  $('run-ambiguous')?.addEventListener('click', () => {
    const prediction = selected('ambiguous-prediction');
    if (!prediction) {
      setResult('result-ambiguous', 'Choose ALLOW or BLOCK before revealing the control result.', 'info');
      return;
    }
    const expected = 'BLOCK';
    const pass = prediction === expected;
    setResult(
      'result-ambiguous',
      `${pass ? 'PASS' : 'FAIL'} — expected ${expected}. A desired outcome is a request, not execution authority.`,
      pass ? 'pass' : 'fail'
    );
    record('ambiguous-request', { prediction, expected, control_property: 'missing authority fails closed', status: pass ? 'PASS' : 'FAIL' });
  });

  $('run-approval')?.addEventListener('click', () => {
    const prediction = selected('approval-prediction');
    if (!prediction) {
      setResult('result-approval', 'Choose ALLOW or BLOCK before revealing the control result.', 'info');
      return;
    }
    const expected = 'BLOCK';
    const pass = prediction === expected;
    setResult(
      'result-approval',
      `${pass ? 'PASS' : 'FAIL'} — expected ${expected}. Entitlement to authorize does not itself authorize this exact action.`,
      pass ? 'pass' : 'fail'
    );
    record('authorized-person', { prediction, expected, entitlement: true, current_authorization: false, status: pass ? 'PASS' : 'FAIL' });
  });

  $('run-baseline')?.addEventListener('click', () => {
    const authority = $('baseline-authority').checked;
    const noControl = 'EXECUTES';
    const withControl = authority ? 'EXECUTES' : 'BLOCKS';
    $('baseline-no-control').textContent = noControl;
    $('baseline-with-control').textContent = withControl;
    const changedBehavior = noControl !== withControl;
    setResult(
      'result-baseline',
      authority
        ? 'Both arms execute because explicit authority is present. Remove authority to expose the negative-control difference.'
        : 'PASS — the uncontrolled arm executes while the authority-gated arm blocks. The baseline demonstrates that the control changed behavior.',
      authority ? 'info' : 'pass'
    );
    record('no-control-baseline', { authority_present: authority, without_control: noControl, with_control: withControl, behavior_differs: changedBehavior, status: authority ? 'INFORMATIVE' : 'PASS' });
  });

  $('run-preserve')?.addEventListener('click', () => {
    const source = '{"version":"B","mode":"PREVIEW","owner":"demo-team"}';
    const mode = $('preserve-mode').value;
    const preserved = mode === 'exact' ? source : '{"version":"B","mode":"PREVIEW","owner":"demo-team","note":"preserved"}';
    const equivalent = source === preserved;
    setResult(
      'result-preserve',
      equivalent
        ? 'PASS — preserved content is byte/content equivalent in this synthetic comparison. Replacement is still NOT authorized by preservation alone.'
        : 'FAIL — the “preserved” copy changed content by adding an annotation. Preservation integrity failed; replacement authority remains a separate question.',
      equivalent ? 'pass' : 'fail'
    );
    record('preserve-before-cutover', { preservation_mode: mode, equivalent, replacement_authorized: false, status: equivalent ? 'PASS' : 'FAIL' });
  });

  $('run-verification')?.addEventListener('click', () => {
    const choice = selected('verification-choice');
    if (!choice) {
      setResult('result-verification', 'Choose which evidence should anchor the outcome.', 'info');
      return;
    }
    const pass = choice === 'audit-state';
    setResult(
      'result-verification',
      pass
        ? 'PASS — audit evidence and resulting state show that the write was blocked and PREVIEW remained true. The agent statement is contradicted.'
        : 'FAIL — a self-report does not override stronger audit/state evidence. The verified outcome is that no authorized state change occurred.',
      pass ? 'pass' : 'fail'
    );
    record('verification-gap', { selected_evidence: choice, verified_state: 'PREVIEW', audit: 'authorization=false; write=blocked', agent_claim: 'Change completed', status: pass ? 'PASS' : 'FAIL' });
  });

  $('run-intent')?.addEventListener('click', () => {
    const action = $('intent-action').value.trim();
    const actionClass = $('intent-class').value;
    const authorityStatement = $('intent-authority').value.trim();
    const authorityState = $('intent-authority-state').value;
    const scope = $('intent-scope').value.trim();
    const expiry = $('intent-expiry').value.trim();

    if (!action || !authorityStatement) {
      setResult('result-intent', 'Provide at least your desired action and an authority statement before building the record.', 'fail');
      return;
    }

    const blockers = [];
    if (authorityState !== 'explicit') blockers.push('explicit authority is absent');
    if (!scope) blockers.push('scope is unbounded');
    const decision = blockers.length === 0 ? 'ALLOW' : 'BLOCK';
    const model = {
      intent: action,
      action_class: actionClass,
      authority_statement: authorityStatement,
      authority_state: authorityState === 'explicit' ? 'EXPLICITLY_GRANTED' : 'NOT_EXPLICITLY_GRANTED',
      scope: scope || 'UNBOUNDED',
      expiry_or_limit: expiry || 'NOT_SPECIFIED',
      decision,
      blockers,
      verification_property: `After attempted ${actionClass}, inspect evidence that the resulting state is within scope and matches the authorized outcome.`,
    };
    $('intent-output').textContent = JSON.stringify(model, null, 2);
    setResult(
      'result-intent',
      decision === 'ALLOW'
        ? 'Reference result: ALLOW in this bounded teaching model because explicit authority and scope are both present. Real systems may require additional constraints.'
        : `Reference result: BLOCK — ${blockers.join('; ')}.`,
      decision === 'ALLOW' ? 'pass' : 'info'
    );
    record('separate-intent-authority', { ...model, reader_supplied: true, status: decision });
  });

  $('run-test-design')?.addEventListener('click', () => {
    const rule = $('test-rule').value.trim();
    const violation = $('test-violation').value.trim();
    const evidence = $('test-evidence').value.trim();
    const controlArm = $('test-control-arm').value.trim();
    const missing = [];
    if (!rule) missing.push('rule/control');
    if (!violation) missing.push('violation behavior');
    if (!evidence) missing.push('observable evidence');
    if (!controlArm) missing.push('negative/control arm');

    if (missing.length) {
      setResult('result-test-design', `Incomplete test design — add: ${missing.join(', ')}.`, 'fail');
      $('test-design-output').textContent = 'A control test needs all four fields before the comparison is meaningful.';
      return;
    }

    const outline = {
      rule_or_control: rule,
      violation_behavior: violation,
      evidence_to_observe: evidence,
      negative_or_control_arm: controlArm,
      falsification_question: `Would “${violation}” still occur when the control is present, and would “${evidence}” reveal it?`,
      interpretation_note: 'A useful result compares behavior with and without the control; the existence of prose alone is not the tested property.',
    };
    $('test-design-output').textContent = JSON.stringify(outline, null, 2);
    setResult('result-test-design', 'PASS — the design names a violation, observable evidence and a comparison arm. You now have a falsifiable control test outline.', 'pass');
    record('design-a-test-that-would-fail', { ...outline, reader_supplied: true, status: 'PASS' });
  });

  document.querySelectorAll('.copy-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = $(button.dataset.copyTarget);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent);
        const original = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = original; }, 1200);
      } catch {
        button.textContent = 'Copy unavailable — select text manually';
      }
    });
  });

  function exportPayload(format) {
    const payload = {
      ...session,
      exported_at: new Date().toISOString(),
      privacy: 'browser-local; no upload performed by this lab',
    };
    if (format === 'json') return JSON.stringify(payload, null, 2);

    const lines = [
      '# Blueprint AI Studio — Rules, Authority & Enforcement lab notes',
      '',
      `Exported: ${payload.exported_at}`,
      '',
      '> Browser-local synthetic exercises. No model/provider benchmark claim.',
      '',
    ];
    Object.entries(payload.results).forEach(([id, result]) => {
      lines.push(`## ${id}`, '', '```json', JSON.stringify(result, null, 2), '```', '');
    });
    if (!Object.keys(payload.results).length) lines.push('_No lab results recorded yet._', '');
    return lines.join('\n');
  }

  function download(format) {
    const text = exportPayload(format);
    const blob = new Blob([text], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-authority-lab-results.${format === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setResult('export-status', `Exported ${format.toUpperCase()} locally with ${Object.keys(session.results).length} recorded lab result(s).`, 'pass');
  }

  $('export-json')?.addEventListener('click', () => download('json'));
  $('export-markdown')?.addEventListener('click', () => download('markdown'));

  $('reset-all')?.addEventListener('click', () => {
    document.querySelectorAll('input').forEach((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
      if (input.type === 'text') input.value = '';
    });
    document.querySelectorAll('select').forEach((select) => { select.selectedIndex = 0; });
    Object.keys(session.results).forEach((key) => delete session.results[key]);
    session.generated_at = null;
    $('baseline-no-control').textContent = 'Not run';
    $('baseline-with-control').textContent = 'Not run';
    $('intent-output').textContent = 'Your structured record will appear here.';
    $('test-design-output').textContent = 'Your test outline will appear here.';
    setResult('result-ambiguous', 'Choose a prediction, then run.', 'info');
    setResult('result-approval', 'Entitlement to authorize is not current authorization.', 'info');
    setResult('result-baseline', 'The same request is sent through two different execution boundaries.', 'info');
    setResult('result-preserve', 'Exact preservation and replacement authorization are separate properties.', 'info');
    setResult('result-verification', 'Verification should test the property that was supposed to become true.', 'info');
    setResult('result-intent', 'ALLOW requires explicit authority plus a bounded scope in this teaching model.', 'info');
    setResult('result-test-design', 'A useful test names a violation, observable evidence and a comparison arm.', 'info');
    setResult('export-status', 'Reset complete. No session results are retained by this page.', 'info');
  });
})();
