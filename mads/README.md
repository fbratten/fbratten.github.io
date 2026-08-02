# MADS recruiter proof

Public-safe proof-of-work package for **MADS — Multi-Agent Developer Sandbox**.

## Live page

`https://fbratten.github.io/mads/`

## Evidence pins

| Field | Value |
|---|---|
| Verified | 2026-08-02 |
| Private source repository | `fbratten/multi-agent-developer-sandbox` |
| Current source pin | `c84698d91d20bde4771a813029c52e2dfa356827` |
| Implementation-bearing verification pin | `dbd87c532bb01931b980ba2660a7f749b2e8a239` |
| Product increment | v1.2 ChangeSet hardening |
| Verification receipt | typecheck, lint, 125 Vitest tests, build, 13 Electron E2E scenarios |

The current source pin includes a documentation-only reconciliation. The test and E2E counts are inherited from the implementation-bearing pin and are not presented as a new run performed during publication.

## Public-data policy

The page uses only:

- a fictional `demo-calculator` repository;
- a synthetic TypeScript diff;
- synthetic ChangeSet and audit identifiers;
- browser-only state transitions;
- source-supported architecture and verification claims;
- explicit limitations and non-claims.

It does not include:

- private source code;
- real workspace names or paths;
- real prompts or provider responses;
- real audit-log records;
- API keys or credentials;
- private screenshots;
- user or customer data.

## Demonstrated flow

```text
agent proposal
-> Zod schema validation
-> policy and risk checks
-> human approval
-> controlled executor
-> durable audit
```

The interactive page simulates approve, apply and revert states. It does not perform filesystem operations and is not a browser port of the private Electron application.

## Boundaries

- local single-operator development environment;
- not a hosted multi-tenant IDE;
- not a kernel or container isolation boundary;
- application-level control and audit proof;
- Anthropic-focused provider integration at the pinned source state;
- private source repository.
