# Historical Build Log milestones - May and June 2026

Public summary and source review: **2026-10-16**. The Build Log dates below describe historical implementation milestones, not the publication date of this summary. Dates use **Europe/Stockholm**.

All three implementation repositories remain private. This is a curated public verification receipt. It contains no private code, real data, raw logs, local machine paths, credentials or copied test fixtures. Private source/version identifiers provide provenance; they do not make the implementations independently inspectable through this page.

## Intelligence Engine 2026-06-17

**Milestone:** project-scoped cleanup for shared semantic indexes.

A shared LanceDB attachment could have an empty in-memory entity list even when the table contained rows. The inspected change removes the early return that skipped project cleanup in that state, counts from the table when needed and performs the project-filtered deletion. A regression test reopens the shared table and checks both removal of the target project's rows and preservation of another project's rows.

| Field | Evidence |
|---|---|
| Private source identity | `fbratten/intelligence-engine` |
| Implementation pin | `cd82902c2ebfb432ec37b63fb435e3c73706b185` |
| Implementation timestamp | 2026-06-17 07:43:06 UTC = **2026-06-17 09:43:06 Europe/Stockholm** |
| Review performed | Inspected the implementation diff and the added shared-table regression test. |
| Execution boundary | The source test suite was not re-run during this publication review. No new index rebuild, data-cleanup operation or production measurement was performed. |

This is a historical code-correction receipt, not a guarantee that every present-day index or deployment is free of stale data.

[Public Intelligence Engine showcase](https://fbratten.github.io/intelligence-engine-showcase/) provides broader project orientation; it is distinct from this dated implementation receipt.

## MADS 2026-06-06

**Milestone:** ChangeSet review, rollback drift checks and durable audit.

The inspected increment adds review warnings when declared file-creation intent would overwrite existing content, an explicit indicator for newline-only changes, refusal of reverts that would discard later edits and durable forwarding of ChangeSet lifecycle audit events. Audit persistence failures remain visible. The durability scope is ChangeSet lifecycle events, rather than every event in the application.

| Field | Evidence |
|---|---|
| Private source identity | `fbratten/multi-agent-developer-sandbox` |
| Implementation pin | `dbd87c532bb01931b980ba2660a7f749b2e8a239` |
| Implementation timestamp | 2026-06-05 23:23:21 UTC = **2026-06-06 01:23:21 Europe/Stockholm** |
| Review performed | Inspected implementation and regression-test changes for intent mismatch, revert drift and durable ChangeSet audit. |
| Source-reported verification | The implementation commit records typecheck, lint, 125 Vitest tests, build and 13 Electron E2E scenarios. These checks were **not re-run** during this publication review. |

The June 6 date follows Swedish local time. The June 5 UTC timestamp identifies the same event; this is not the August date when the public proof page was added.

[Public synthetic MADS demonstration](https://fbratten.github.io/mads/) illustrates the review flow. It does not execute the private Electron application or mutate the visitor's filesystem. These are application-level controls, not a kernel/container isolation claim.

## Gate Monitor 2026-05-26

**Milestone:** output-path confinement for MCP reports.

The inspected change resolves the requested output path and configured root before checking containment in the MCP report writer. It returns a structured error for paths that resolve outside the root, with regression coverage for traversal, outside absolute paths, symlink escapes and preservation of the default-output behavior.

| Field | Evidence |
|---|---|
| Private source identity | `fbratten/gate-monitor` |
| Implementation merge pin | `f3c30f4ce7e512cdd92615bd8fa82892843c9455` |
| Implementation timestamp | 2026-05-26 15:18:01 UTC = **2026-05-26 17:18:01 Europe/Stockholm** |
| Review performed | Inspected the merged containment implementation and its helper/tool-level regression tests. |
| Source-reported verification | The historical change record reports 279 passing tests, one environment-dependent skip and three successful dogfood scripts. These checks were **not re-run** during this publication review. |

The scope is the MCP report tool. It does not establish a general filesystem sandbox, a complete MCP authorization model, race-free filesystem isolation or equivalent confinement of the separate CLI report command.

[Public synthetic Gate Monitor demonstration](https://fbratten.github.io/gate-monitor/) explains the broader governance model. It is not the private Python runtime and does not itself demonstrate filesystem confinement.

## Publication and verification boundary

The three entries use **SHIPPED** for committed historical code increments. No customer deployment, production scale, independently repeated test result or new runtime validation is claimed. The broader public project pages remain orientation surfaces; the implementation pins and bounded review statements above identify the evidence for these particular milestones.
