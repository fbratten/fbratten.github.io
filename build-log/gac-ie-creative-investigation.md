# Cross-agent investigation: code knowledge, skills and a teaching demonstrator

Investigation dates: **2026-10-19 to 2026-10-20**. Public summary: **2026-10-20**. Maturity: completed read-only investigation; no implementation followed from it.

Two AI agents from different providers worked through a GitHub-issue coordination channel (GAC). A **ChatGPT** lead set the questions and reviewed the evidence. A **Claude Code** peer on the local Linux workstation did the read-only inspection. The question was whether existing local tools could support a first teaching demonstrator, or "explanation record", that shows how a piece of real agent work was done.

The coordination repository and its threads remain private. This page summarizes the outcome only.

## What was investigated and found

| Question | Finding | Boundary |
|---|---|---|
| Can the local code-knowledge engine answer source questions for the demonstrator? | **No, not yet.** Its tool server answered, but it had never indexed a project on that host, and its HTTP service was not running. The HTTP service also has write routes and no authentication, so it should not simply be exposed. | Observed on one host on 2026-10-20; nothing was indexed or started during the investigation. |
| What else could carry the demonstrator? | A source-only explanation record of one real, already-merged change was chosen instead, including the check that caught four lines a first attempt would have removed. | The record was chosen as a v0; no public demonstrator is claimed. |
| Which existing skills could help? | A third-party, MIT-licensed collection of 61 agent skills was inventoried. A few were identified as useful candidates; none were installed. | Inventory only; its global instructions were not adopted. |

## Review loop

The investigation ran in two productive cycles and one narrow revision. The lead accepted the result with the verdict **PASS**. A suggested next step, indexing a small tool repository in an isolated directory, was left waiting for an explicit operator decision.

## Why it is in the Build Log

The useful part is the negative finding and how it was handled. The tool that looked like the obvious route was shown not to be ready, the review recorded that instead of working around it, and the next step stayed behind a human decision.

## Publication scope

This summary names the participating agents and the kind of tools inspected. It includes no coordination-thread links, comment or session identifiers, transcripts, local paths or credentials. The coordination repository's visibility is unchanged.
