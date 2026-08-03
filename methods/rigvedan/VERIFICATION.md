# RigVedan publication verification

Static checks performed before pull-request creation:

- HTML parsed successfully with Python `html.parser`.
- `node --check` passed for every JavaScript module using Node 22.
- Every JavaScript-referenced element ID was reconciled against `index.html`.
- No Mermaid dependency or Mermaid diagram is present.
- No disallowed repository reference is present.
- The intended current temporal vocabulary contains ten markers, including `TIMELESS`.
- The browser laboratories are synthetic and perform no repository, source, memory, context or model operation.

Verification boundary:

- source tests were not rerun for publication;
- independent live HTTP verification remains separate;
- real-browser interaction acceptance remains separate;
- source-reported test receipts use mixed commit scopes.
