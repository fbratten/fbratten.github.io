(() => {
  'use strict';
  // Load additional fixtures into existing forms; their evaluators are unchanged.
  function init() {
    document.querySelectorAll('[data-cbe-host]').forEach(panel => {
      const form = panel.closest('form');
      const host = panel.dataset.cbeHost;
      const set = (name, value) => { const field = form.querySelector('[name="' + name + '"]'); if (field) field.checked = value; };
      panel.querySelectorAll('[data-cbe-preset]').forEach(button => button.addEventListener('click', () => {
        const blocked = button.dataset.cbePreset === 'blocked';
        form.reset();
        let context;
        if (host === '5pp') {
          document.getElementById('sandboxProfile').value = 'constraint';
          document.getElementById('sandboxVerdict').value = blocked ? 'Park' : 'Advance';
          set('measurable', true); set('skeleton', true);
          set('verification', !blocked); set('audit', !blocked);
          context = blocked
            ? 'CBE-IX example: the regional-access owner is unresolved. The candidate ledger exists, but the verification record and audit are incomplete. Declaring Park does not make this record pass.'
            : 'CBE example: analysis-only scope is accepted, the invariant and peer exclusions are locked, and classification, handoff and audit records are present. Advance applies to the analysis record, not implementation.';
        } else if (host === 'dialogue-lifecycle') {
          document.getElementById('fromState').value = blocked ? 'CLARIFY' : 'EXECUTE';
          document.getElementById('toState').value = blocked ? 'DECIDE' : 'VERIFY';
          set('blockersResolved', !blocked);
          context = blocked
            ? 'CBE-IX example: a material regional-access ownership question blocks the dependent design decision. Resolve or explicitly defer it within a valid scope before advancing.'
            : 'CBE example: the accepted analysis produced candidate verdicts and handoff records. Evidence is retained, so the design analysis can move to verification. No pipeline implementation was authorized.';
        } else if (host === 'aics') {
          document.getElementById('gatePhase').value = 'DECIDE';
          document.getElementById('contractStatus').value = blocked ? 'draft' : 'frozen';
          set('blockingItemsEmpty', !blocked);
          set('executionAuthorized', !blocked);
          set('decisionAccepted', !blocked);
          context = blocked
            ? 'CBE-IX example: proposed responsibilities depend on an unresolved ownership decision. The draft contract has blockers and no accepted execution authorization. A candidate KEEP does not open this gate.'
            : 'CBE example: the exact frozen contract authorizes design analysis only. Its requirements preserve ingestion and peer boundaries. Passing this fixture grants no implementation authority.';
        }
        panel.querySelector('.cbe-preset-context').textContent = context;
        form.requestSubmit();
      }));
      panel.hidden = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
