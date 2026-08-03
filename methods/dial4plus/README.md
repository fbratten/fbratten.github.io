# DIAL-4+ scientific profile

Public-safe, interactive scientific profile for claim-strength grading across the conceptual DIAL-4+ model and ChangePlane's operational `Dial4Claim` representation.

## Route

`https://fbratten.github.io/methods/dial4plus/`

## Canonical conceptual sources

- `fbratten/control-center-ops @ 7485ee6ade639c3928f043c268995269e75aca54`
- `04-Knowledge/Systems/Prompts and Prompting/Prompts library/DIAL-4.md`
- `KB/inbox/user-input/DIAL-4 - DIAL-4+ - and DIAL-4P.md`
- public first-party explanation: `https://adaptivearts.ai/blog/from-reasoning-mode-to-possibility-state/`, published 20 April 2026

## Operational source

- `fbratten/changeplane @ 32cb7840915df7f0d527044e37242cd6123801e7`
- implementation increment: `e37da0129d2541f28bdb68a786089b6d0a1b3e3d`
- `src/changeplane/protocols/models.py`
- `schemas/changeplane.protocol.dial4plus.v1.schema.json`
- `tests/test_protocols.py`

## Core distinction

The conceptual DIAL-4+ model grades claims along three independent dimensions:

1. confidence
2. evidence quality
3. scope

ChangePlane operationalizes a related but narrower record surface:

- `confidence`
- `strength`
- `supporting_evidence`
- `weaknesses`
- `uncertainty`

It switches the protocol tag from `DIAL-4` to `DIAL-4+` when confidence and/or strength is set. It does not encode explicit `evidence_quality` or `scope` fields.

## Validation boundary

The ChangePlane CLI help describes confidence as `0..1`, but at the pinned commit:

- the dataclass accepts an optional float without range validation;
- the JSON Schema accepts any JSON number;
- no minimum or maximum is declared in the schema;
- the inspected tests verify protocol-tag switching and end-to-end recording, not confidence-range rejection.

This is presented as a source-grounded contract boundary. The browser profile does not execute the source validator or claim a runtime exploit.

## Visual inventory

1. Native Canvas 2D conceptual three-axis model.
2. Native Canvas 2D evidence-quality and source-distance ladder.
3. Native Canvas 2D scope and generalization boundary.
4. Browser-local calibration laboratory.
5. Browser-local confidence-range and schema-boundary laboratory.
6. Native Canvas 2D conceptual-to-operational mapping.
7. Native Canvas 2D ChangePlane record and protocol-trace topology.
8. Native Canvas 2D lineage graph.
9. Chart.js field-coverage comparison.
10. Chart.js source-reported MVP-4 receipt graph.
11. Evidence table, failure modes, evaluation routes and explicit non-claims.

## Evidence boundaries

- Confidence is not automatically calibrated probability.
- Evidence quality is not inferred from citation count alone.
- Narrow scope can strengthen a bounded claim without making it universally true.
- A ChangePlane protocol tag does not validate the underlying claim.
- Protocol-trace hashing provides tamper evidence within its documented boundary, not epistemic truth.
- Browser laboratories are synthetic and perform no model call, source retrieval, repository write, claim insertion or seal operation.
- Source-reported tests were not rerun for publication.
- No independent calibration, annotation-reliability or outcome-efficacy study was identified in the inspected source set.
