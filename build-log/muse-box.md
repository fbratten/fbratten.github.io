# Muse box - sandboxed run of a closed-source coding-agent CLI

Build milestone: **2026-10-20** (phase 1 and 1.1). Public snapshot and check: **2026-10-20**. Project maturity: personal-use MVP, phase 1 of a planned sequence.

Muse box runs Meta's closed-source **Muse Code** CLI inside a [bubblewrap](https://github.com/containers/bubblewrap) box on a Linux workstation. The box confines the Muse process itself, not only the shell commands Muse starts.

The implementation source remains private. This page is a curated snapshot and check receipt, not a source release.

> **Update 2026-11-07:** phases 2 and 3 landed on 2026-10-20. See "Phases 2 and 3" at the end. The sections before it describe phase 1 as written on that date, including its statement that network access and credentials were not yet enabled.

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

## Phases 2 and 3

Build milestone: **2026-10-20**. Public update and check: **2026-11-07**.

| Area | What was added | Boundary |
|---|---|---|
| Network | A per-run proxy with a one-host allowlist, `api.meta.ai:443`. Every attempt is logged. Before each online run a probe checks that the proxy refuses another name, an IP literal and plain HTTP. | The box keeps a private network namespace. What Muse sends to that host still leaves the machine by design. |
| Credential | The API key enters the box through a pipe, and tests with a canary key check that it never appears in arguments, the environment or logs. | The key is stored for use inside the box. This is not a vault. |
| First real run | One run with a harmless prompt in an empty workspace. It exited 0, and the run phase of the egress log shows 4 tunnels, all to the allowed host, and nothing else. | One run only, in contributor mode. It executed no shell command, so Muse's inner sandbox nested in the box remains unproven. |

| Field | Value |
|---|---|
| Inspected source ref | `main` at `1c811346f13fdc17e27c7318976ae420469a8333`, 2026-11-07 |
| Executed check | `muse-box verify` on 2026-11-07: host, pins, settings and the box checked without starting Muse |
| Result | PASS, exit code 0: 4 pins match, 55 probe checks pass, 1 host path check vacuous |
| Source-reported | A test suite of 363 checks, 0 failed and 2 vacuous, and the real run, as recorded in the phase 2 and 3 pull request; not re-run for this update |
| Not executed | Any new run against Meta's online service |

Further runs against the online service need separate approval.
