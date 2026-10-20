# Muse box - sandboxed run of a closed-source coding-agent CLI

Build milestone: **2026-10-20** (phase 1 and 1.1). Public snapshot and check: **2026-10-20**. Project maturity: personal-use MVP, phase 1 of a planned sequence.

Muse box runs Meta's closed-source **Muse Code** CLI inside a [bubblewrap](https://github.com/containers/bubblewrap) box on a Linux workstation. The box confines the Muse process itself, not only the shell commands Muse starts.

The implementation source remains private. This page is a curated snapshot and check receipt, not a source release.

## What the box enforces in phase 1

| Area | What is built | Boundary |
|---|---|---|
| Home directory | Muse gets an empty, private home: no SSH keys, other agents' configuration or browser profiles. | Applies to the boxed process; the host keeps its own files. |
| Network | No network in phase 1. Only Muse's offline echo provider is used. | A logged, domain-allowlisted proxy is a later phase that needs separate approval. |
| Install | A read-only, checksum-pinned Muse install that cannot update or delete itself. | Updating means deliberately re-pinning. |
| Workspace | Exactly one writable workspace per run, with its `.git` mounted read-only. A workspace holding project-local agent configuration is refused. | Muse's own trust prompt is allowed for a workspace the box accepts. |
| Arguments | Only a small allowlist of Muse arguments; flags that weaken Muse's own sandbox or approvals are refused with a typed error. | Muse's inner sandbox stays on inside the box. |
| Records | Every run writes a start and a final record to a local run log. | The log is local and not published. |

## What it is not

- Not a kernel boundary against a determined attacker: the box shares the host kernel and the user account.
- Not a data-protection boundary toward the vendor: once networking is enabled in a later phase, what Muse sends to its service leaves the machine by design.
- Not a way to run Muse with weaker settings.

Credentials and network access are later phases, and neither is enabled. Sibling boxes for other agent CLIs exist only as empty repositories and are not part of this entry.

## Source pin and check receipt

| Field | Value |
|---|---|
| Private source identity | `fbratten/muse-box` |
| Inspected source ref | `main` at `a91ab8c053e03dc55a5da36aaeeda8ecb6085865`, 2026-10-20 |
| Merged phases | P0 decisions, admission record and pins (2026-10-19); P1 offline box with negative tests and P1.1 workspace trust (2026-10-20) |
| Executed check | `muse-box verify` on 2026-10-20: host, pins, settings and the box checked without starting Muse |
| Result | PASS, exit code 0: 4 pins match, 54 probe checks pass |
| Source-reported | A test suite of 273 checks, reported in the phase 1.1 commit; not re-run for this snapshot |
| Not executed | Any run against Meta's online service, networked phases, credentials |

## Publication scope

This snapshot contains a high-level description, a source pin, a summarized check result and explicit limits. It includes no source code, local paths, run logs, account details or credentials. The source repository's visibility is unchanged.
