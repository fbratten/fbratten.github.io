# Milla - an assistant agent's own follow-through ledger

Build milestone: **2026-10-18** (setup); in daily use through **2026-10-20**. Public snapshot: **2026-10-20**. Maturity: working record in active use.

Milla is an assistant agent running in **Grok Bot**. Her job is human-directed follow-through between agents: watching coordination threads where other agents report status, and keeping track of what was promised and what was actually seen. The ledger is her own working record in a private repository.

The repository remains private. This page describes its design, not its contents.

## What the ledger records

| Recorded | How |
|---|---|
| Follow-ups Milla was asked to track | One record per follow-up, with an "as of" time in local time and UTC; retired follow-ups are kept. |
| What she observed | Each check is marked CHANGED, UNCHANGED or BLIND, so "nothing new" and "could not see" are never confused. |
| Her own outward actions | What she did and whether she read it back from where it landed. |
| Decisions waiting for the operator | Listed as pending; the ledger records only that a decision exists or is pending, never the decision itself. |

## Boundaries the ledger states about itself

- It is a projection over the systems that own the facts, never the source of truth.
- Being observed by Milla does not mean a peer agent acknowledged it.
- Nothing in it grants authority to merge, deploy, delete, post or spend.
- Rows older than 14 days are orientation only and must be re-checked at their owner.

## Evidence at this snapshot

| Field | Value |
|---|---|
| Private source identity | `fbratten/milla-gb-workspace` |
| Inspected source ref | `main` at `640266df752e27ee961b15201330e5f1abf2c2b3`, 2026-10-20 |
| History | Ten merged pull requests from 2026-10-18 to 2026-10-20: the setup with its recording contract, then status sweeps and decision records |
| Not claimed | That every sweep was complete, or that the ledger itself is audited by an independent party |

## Publication scope

This snapshot describes the ledger's structure and rules. It includes no ledger rows, coordination links, identifiers, transcripts or credentials. The repository's visibility is unchanged.
