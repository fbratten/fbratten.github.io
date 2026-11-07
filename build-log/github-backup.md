# Verified backup of every GitHub repository

Backup and check: **2026-11-05**. Public snapshot: **2026-11-07**. Maturity: one verified run; the wider plan continues.

All 276 repositories on one GitHub account were copied to a local machine, and the copy was tested by restoring it. GitHub was a read-only source, and nothing went back up. This page gives results and limits. It does not say where the copy is.

## What was measured

| Check | Result |
|---|---|
| Copies against the inventory | 276 listed, 276 copied. The gate passed with 1 repository flagged for a known gap and acknowledged |
| References against GitHub | Every mirror's refs equalled GitHub's, and GitHub's did not move during the copy |
| Integrity | `git fsck` passed, and a SHA-256 list covers 20,291 files |
| Accidental writes | Push is disabled on every mirror |
| Restore test | 271 passed, 0 failed. 5 repositories with no commits were skipped |

## What it does not cover

Declared in the final report:

- large-file object content in one repository, and Discussions in seven;
- Projects, Actions, webhooks, deploy keys, collaborators, branch protection and rulesets;
- packages, commit comments, issue timeline events, uploaded attachments, Pages settings and gists;
- a second disk. So far this is one copy on one disk.

The restore test covers Git history only. Copied issue and pull request metadata was not restore-tested.

```text
copied != restorable
restored once != backed up forever
```

The run is a snapshot of one day. Later changes on GitHub are not in it.

## Publication scope

This page contains summarized results and declared gaps. It includes no paths, host names, repository lists or credentials.
