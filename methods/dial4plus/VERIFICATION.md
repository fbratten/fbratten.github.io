# DIAL-4+ publication verification

Checks required before merge:

- HTML parses successfully.
- Every JavaScript module passes `node --check` with Node 22 when local retrieval is available.
- Every fixed JavaScript-referenced element ID exists in `index.html`.
- No Mermaid dependency or Mermaid diagram is present.
- Conceptual DIAL-4+ axes and ChangePlane record fields remain separate.
- Confidence, evidence quality and scope are not collapsed into one score.
- The confidence-range boundary is represented exactly as source supports: CLI documentation says `0..1`; dataclass and schema do not enforce minimum or maximum at the pinned source.
- Browser laboratories use synthetic state and perform no source execution, claim insertion, seal operation or repository mutation.

Verification boundary:

- source tests are not rerun for publication;
- live HTTP acceptance remains separate;
- real-browser interaction acceptance remains separate;
- source-reported MVP-4 receipts use mixed protocol scope;
- no calibration, annotation-reliability or outcome-efficacy study is asserted.
