# Agent Workshop - a bounded loop with a separate checker

Build milestones: **2026-10-24** to **2026-10-26**. Public snapshot: **2026-11-07**. Maturity: provisional pilot home; rehearsal stage.

Agent Workshop is meant as a small, provider-neutral way for one person to run a lead agent, one or more workers and a separate check on a bounded task. The repository remains private. This page describes its design and one recorded rehearsal.

## What it fixes in place

| Part | Rule |
|---|---|
| Work order | A task with frozen, machine-checkable acceptance. |
| Acceptance | A deterministic command decides acceptance, and a negative control shows that the command can fail. A model's statement never decides it. |
| Separate checker | A checker model reads each attempt. The lead decides whether to uphold a finding. |
| Loop | An attempt cap, a revision cap, a stall rule and explicit terminal states, with evidence for every attempt. |
| Lead harness | One fresh repository per attempt, and authority that fails closed. Hardened over adversarial review rounds. |

## The rehearsal, PILOT-01r, 2026-10-25

Both work orders ended `DONE_VERIFIED`, and no registered failure condition was met.

| Work order | Worker | Attempts | What happened |
|---|---|---|---|
| A | Mid-class worker in the lead's session | 2 of 3 | Attempt 1 passed all 41 acceptance checks, but a mid-class checker model in the lead's session found a real violation: a 4301-digit count raised an error. The lead upheld it, and attempt 2 repaired it. |
| B, a replay | A ChatGPT worker, by its own report outside the lead's provider | 1 of 3 | 41 of 41, and the checker passed it. |

Both negative controls were rejected, with 37 of 41 checks passing, so the acceptance command could fail. The useful part is attempt 1: full acceptance was not enough, and the separate checker said so.

## What it is not

- It is a rehearsal. The real pilot belongs to the operator and has not been recorded as run.
- The replay was not blind. The first order's finding was within the worker's reach before it replied, a confound the lead introduced and recorded.
- No model is ranked, and one rehearsal shows little about general reliability.
- Execution is still tied to one Claude Code host. The route outside the lead's provider is only partly shown. The contract is v0.1 and unproven, and nothing shows that a small model can follow it.
- When the lead harness merged, no pilot had used it, and the repository records no pilot after this rehearsal.

## Publication scope

This page contains a high-level description and summarized results. It includes no source code, work-order text, coordination transcripts or session records.
