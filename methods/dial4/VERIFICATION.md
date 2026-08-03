# DIAL-4 publication verification

Checks required before pull-request merge:

- HTML parsed successfully.
- Every JavaScript module passes `node --check` with Node 22.
- Every JavaScript-referenced element ID exists in `index.html`.
- No Mermaid dependency or Mermaid diagram is present.
- Conceptual DIAL-4 modes and ChangePlane claim types remain separate.
- DIAL-4+ conceptual axes and ChangePlane record fields remain separate.
- Both DIAL-4P meanings are spelled out and repository-scoped.
- Browser laboratories use synthetic state and perform no model call, repository write, claim insertion, projection rendering or seal operation.

Verification boundary:

- source tests were not rerun for publication;
- public HTTP acceptance remains separate;
- real-browser interaction acceptance remains separate;
- source-reported test counts use mixed protocol scope;
- no claim-effect or annotation-reliability study is asserted.
