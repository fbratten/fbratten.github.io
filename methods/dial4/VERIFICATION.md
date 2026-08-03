# DIAL-4 publication verification

Verification performed before pull-request merge:

- every branch file was fetched back from GitHub after creation;
- JavaScript modules were source-reviewed for balanced wrappers, object shapes and initialization paths;
- every fixed JavaScript-referenced element ID was reconciled against `index.html`;
- no Mermaid dependency or Mermaid diagram is present;
- conceptual DIAL-4 modes and ChangePlane claim types remain separate;
- DIAL-4+ conceptual axes and ChangePlane record fields remain separate;
- both DIAL-4P meanings are spelled out and repository-scoped;
- browser laboratories use synthetic state and perform no model call, repository write, claim insertion, projection rendering or seal operation.

Automated JavaScript execution boundary:

- an independent retrieval attempt for local `node --check` was blocked by DNS policy in the execution environment;
- this delivery therefore does not claim automated JavaScript execution;
- source tests were not rerun for publication;
- public HTTP acceptance remains separate;
- real-browser interaction acceptance remains separate;
- source-reported test counts use mixed protocol scope;
- no claim-effect or annotation-reliability study is asserted.
