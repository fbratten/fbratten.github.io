# Build Log - public proof-of-work projection

This directory is a **public-safe projection of selected verified work**, not a raw activity log.

## Purpose

The Build Log answers a simple external question:

> What has been built, published or verified recently, and why does it matter?

It is intentionally different from private planning, session telemetry and repository history.

## Core boundary

```text
recorded work != verified outcome
recorded work != public work
planned work != completed work
public candidate != public
public summary != implementation authority
```

Only material already admitted as public belongs in this repository.

## Current first slice

- `index.html` renders the public log.
- `entries.json` is the small public projection manifest.
- the initial entries point only to already-public evidence.
- this first slice is manually curated.

No automatic ingestion or unattended publication is implemented here yet.

## Relationship to private evidence

Private planning and evidence systems may later help generate **publication candidates**, but they must not publish directly.

Candidate future flow:

```text
private evidence / verified work
        ↓
candidate generation
        ↓
claim + privacy + freshness checks
        ↓
PUBLIC_CANDIDATE
        ↓
explicit admission / governed policy
        ↓
entries.json
        ↓
Build Log
```

The intended evidence plane may include bounded signals from Day Planner value narratives, CCOPS worklogs, GitHub state and Worktrace. None of those sources gains public publication authority merely because it can observe or describe work.

## Value Narrative relationship

Day Planner's `why_it_matters` semantics are useful upstream because they help answer both:

- **private orientation:** why is this work worth doing?
- **public explanation:** after the work is actually evidenced and admitted for publication, why should another person care?

The public Build Log must still ground every statement in current public evidence. A persuasive sentence is not allowed to improve the underlying facts.

## Privacy and claim policy

Do not place these in `entries.json` unless a separate explicit publication decision makes them public:

- personal or family matters;
- health or financial details;
- job-application internals;
- private repository paths or source;
- raw Worktrace events, commands, session identifiers or transcripts;
- credentials, account state or provider secrets;
- private customer or employer information;
- unverified completion, deployment or production claims.

## Entry shape

The first-slice manifest uses:

```json
{
  "date": "YYYY-MM-DD",
  "state": "SHIPPED|PUBLISHED|VERIFIED",
  "title": "Public title",
  "summary": "One or two grounded sentences.",
  "why_it_matters": "One grounded value statement.",
  "evidence": [{"label": "Public evidence", "url": "https://..."}],
  "tags": ["..."]
}
```

This is a presentation schema for the first public slice, not a universal cross-system contract.

## Update discipline

Prefer a small PR that changes only `entries.json` when adding routine entries. Change the HTML only when the presentation itself needs to change.

Before admitting a new entry, verify:

1. the described outcome actually happened;
2. the evidence link is public and current enough for the claim;
3. the summary does not disclose private source material;
4. `why_it_matters` is grounded rather than promotional invention;
5. planned/in-progress work is not mislabeled as shipped or verified.

If any of those is unknown, keep the item out of the public manifest until resolved.
