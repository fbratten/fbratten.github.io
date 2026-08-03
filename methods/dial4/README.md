# DIAL-4 method profile

Public-safe, interactive method profile for DIAL-4 and its operational projections.

## Route

`https://fbratten.github.io/methods/dial4/`

## Canonical conceptual source

- `fbratten/control-center-ops @ 7485ee6ade639c3928f043c268995269e75aca54`
- `04-Knowledge/Systems/Prompts and Prompting/Prompts library/DIAL-4.md`
- `KB/inbox/user-input/DIAL-4 - DIAL-4+ - and DIAL-4P.md`
- public first-party explanation: `https://adaptivearts.ai/blog/from-reasoning-mode-to-possibility-state/`, published 20 April 2026

## Operational record source

- `fbratten/changeplane @ 32cb7840915df7f0d527044e37242cd6123801e7`
- implementation increment: `e37da0129d2541f28bdb68a786089b6d0a1b3e3d`
- `src/changeplane/protocols/models.py`
- `schemas/changeplane.protocol.dial4.v1.schema.json`
- `schemas/changeplane.protocol.dial4plus.v1.schema.json`
- `tests/test_protocols.py`
- `docs/protocols.md`

## Core distinction

The conceptual framework defines four reasoning modes:

1. Deduction
2. Inference
3. Abatement
4. Legitimation

ChangePlane implements a related claim-separation record with the recommended claim-type vocabulary:

- source_fact
- interpretation
- implication
- decision
- inference
- verification

The two vocabularies are related but are not a normative one-to-one mapping. The profile preserves that distinction.

## DIAL-4+

The public conceptual explanation grades claims by confidence, evidence quality and scope.

ChangePlane uses the same `Dial4Claim` record and changes the protocol tag to `DIAL-4+` when confidence and/or strength is supplied. Its record also carries supporting evidence, weaknesses and uncertainty. It does not encode explicit `evidence_quality` or `scope` fields, so it is an operational projection rather than a complete implementation of the public conceptual schema.

## DIAL-4P naming boundary

Two distinct systems use the same label:

- DIAL-4P Possibility: DIAL-4 + DIAL-4+ + Diátaxis + 5PP possibility governance.
- ChangePlane DIAL-4P Projection/Productization: derived rendering of an existing trace.

The profile requires the expansion or repository context whenever DIAL-4P is named.

## Evidence boundaries

- Browser laboratories are synthetic and do not classify real claims automatically.
- A DIAL-4 label does not prove that the underlying claim is true.
- DIAL-4+ grading does not calibrate confidence automatically.
- ChangePlane claim types are free-form strings with a recommended vocabulary.
- Source-reported tests were not rerun for publication.
- No independent outcome study or calibrated annotation study was identified in the inspected source set.
