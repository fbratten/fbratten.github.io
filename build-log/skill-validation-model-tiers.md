# Skill validation with three model tiers

Build milestone: **2026-10-20**. Public snapshot: **2026-11-07**. Maturity: in use on this estate; one operator's workflow.

An Agent Skill is a set of instructions for an AI agent. A skill can pass every structural check and still lead a small model astray. `validate-skill-with-model-tiers` tests how a skill behaves. The implementation source remains private. This page describes its design and the results it has given.

## How it works

| Role | Who | Job |
|---|---|---|
| Preparer | A deterministic script, no model | Builds a blind package without tests or grading keys, and a hash manifest |
| Runner | The smallest model the skill claims to serve | Runs each test case blind |
| Grader | A stronger model | Grades each run against the withheld key, and gives each failure one class: model error, skill defect, key defect, harness failure or leakage |
| Reviewer | The strongest available model, other than the grader's | Confirms or rejects the grader's leads, and looks for defects no test case exercised |

It ends in one verdict: `INSUFFICIENT_EVIDENCE`, `NOT_VALIDATED`, `VALIDATED_WITH_FINDINGS` or `VALIDATED`. It only reports. It never edits the skill, its test cases or its keys.

## What it has found

| Case | Result |
|---|---|
| A review skill, an early behavioural run | `NOT_VALIDATED`. A blind run graded one case lower than the key required, and the reviewer confirmed a defect in the skill's own severity rule. The skill was then corrected. |
| Two canvas skills, six rounds (2026-11-06) | The first round gave 30 findings, 2 of them high. The fifth gave 7, none high, with all test cases passed. Final verdict `VALIDATED_WITH_FINDINGS`, because the last fixes had no further independent review. |

## What it does not show

- A verdict covers the skill's own test cases and the models used, not every future task.
- It does not show that anyone adopts the skill, or that it improves outcomes in use.
- Several skills on this estate have not been through it. Each states its own validation.

## Publication scope

This page contains a high-level description and summarized results. It includes no source code, test keys, session records or private paths.
