(() => {
  'use strict';
  const form = document.getElementById('candidate-form');
  const candidate = document.getElementById('candidate');
  const result = document.getElementById('classification-result');
  const cases = {
    format: { verdict: 'KEEP', explanation: 'Format detection closes a gap in extraction and belongs to the ingestion target.', boundary: 'Owns format detection and parser selection. Does not own semantic indexing.' },
    embedding: { verdict: 'DELEGATE', explanation: 'The Semantic Indexer owns embedding generation. The pipeline needs its output without duplicating the operation.', boundary: 'Handoff: normalized content goes to the Semantic Indexer; embedding references return to the pipeline.' },
    retention: { verdict: 'SPLIT', explanation: 'Separate the policy decision from attaching its returned classification.', boundary: 'DELEGATE determining policy to the Retention Policy Service. KEEP attaching the returned classification to the record.' },
    assistant: { verdict: 'REJECT', explanation: 'A reader assistant does not close a demonstrated gap in producing normalized ingestible records.', boundary: 'Keep the ingestion invariant. A separate reader-assistant proposal would need its own target definition.' },
    unknown: { verdict: 'UNRESOLVED', explanation: 'The evidence does not establish who owns regional access decisions. Do not invent a peer or assume target ownership.', boundary: 'Hold classification until responsibility evidence or an architectural decision is available. This is not a fifth acceptance verdict.' }
  };
  function show(title, paragraphs) {
    result.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = title;
    result.append(heading);
    for (const text of paragraphs) { const p = document.createElement('p'); p.textContent = text; result.append(p); }
  }
  function resetResult() { show('Choose a prediction', ['The target and peer responsibilities stay fixed throughout this exercise.']); }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const chosen = new FormData(form).get('verdict');
    if (!chosen) return;
    const reference = cases[candidate.value];
    show((chosen === reference.verdict ? 'Match: ' : 'Reconsider: ') + reference.verdict, [reference.explanation, reference.boundary, 'This is a design decision. No implementation action is authorized or performed.']);
  });
  candidate.addEventListener('change', () => { form.querySelectorAll('input').forEach(input => { input.checked = false; }); resetResult(); });
  form.addEventListener('reset', resetResult);
  document.getElementById('classification-lab').hidden = false;
})();
