# COR - Capability & Opportunity Reasoning

Project creation and initial implementation: **2026-10-15**. Public overview reviewed: **2026-10-15**.

COR is a domain- and provider-agnostic framework for relating stated needs, evidence-backed capabilities and testable opportunity hypotheses. It distinguishes direct fit from strategic pursuit value: a possible opportunity does not establish a missing qualification, a hidden customer requirement or permission to act.

The source repository remains private. This is a bounded public overview of its starter implementation, not a source release or a claim of independently proven reasoning performance.

## Four application profiles

| Profile | Full name | What it applies COR to |
|---|---|---|
| **BJD** | Beyond Job Description | Careers and recruitment: explicit requirements, evidenced experience, transferable competence and strategic stretch opportunities. |
| **BPR** | Business Problem Reframing | Customer needs, procurement and RFPs: stated purchasing requirements versus hypotheses about the business outcome. |
| **ACD** | Agent Capability Discovery | AI agents and software workflows: usable capabilities, dependencies and execution authority, beyond tool names and feature lists. |
| **OCR** | Organizational Capability Reconfiguration | Teams and responsibilities: possible role allocation or capability combinations, without assuming stakeholder agreement. |

BJD is the most detailed profile. BPR, ACD and OCR are initial, bounded profile contracts with synthetic examples; their presence is not evidence of validated products or live integrations. BPR here means Business Problem Reframing, rather than Business Process Reengineering.

## What is implemented

- A standard-library Python CLI that validates authored assessment records and checks selected structural, evidence-reference and uncertainty invariants. It does not establish whether the underlying claims are objectively true.
- An optional, lossy RigVedan EBNF-RV report adapter. The structured JSON assessment retains the fuller evidence and metadata; the adapter does not replace the canonical RigVedan grammar owner.
- An offline M1 evaluation harness with five synthetic cases. It prepares prompts and scores separately supplied responses. Its matched report representations are separated from source-only and full-assessment conditions.

Existing methods such as SRCB, DIALECTIC, IPB, SORR and GDSA inform the design through conditional composition and source references. This does not assert that their runtimes are integrated or invoked automatically.

## Verification receipt and limits

| Field | Evidence |
|---|---|
| Private source identity | `fbratten/capability-opportunity-reasoning` |
| Inspected source pin | `165183a417505d2b9dd81805e4f28c40135363aa` on `main` |
| Date basis | GitHub repository creation metadata and first commit both record 2026-10-15; the core profiles and M1 harness were integrated the same day. |
| Source checks | The source repository's validation workflow completed successfully for this exact pin. This publication review inspected its result; it did not re-run the source suite. |
| Claim boundary | Passing synthetic fixture checks does not demonstrate COR method benefit, independent adjudication, improved sLLM accuracy or production readiness. No real-model trial result is presented here. |

The starter has no built-in model inference, live vacancy collection, applicant contact or autonomous external write actions. The private implementation cannot be independently inspected through this public receipt. No source code, private career records, raw logs, credentials or synthetic answer keys are reproduced here.

The Build Log's **PUBLISHED** state refers to this public explanation. Its 15 October date also matches the verified project creation and initial implementation date.
