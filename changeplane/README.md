# ChangePlane public presentation

Source: private repository fbratten/changeplane, main at 32cb7840915df7f0d527044e37242cd6123801e7.
Reviewed: 2026-11-12. Branch audit FULL: main only, no open PRs.

This public page explains the source-inspected ledger, Git capture, sealing, replay, protocol records, harness registry, CLI/MCP interfaces and dry-run autopilot. It publishes no private source code, operational logs, credentials or real session records. The source repository remains private.

The interactive demo is independently authored JavaScript using Web Crypto and three fictional strings. It illustrates selected-artifact hash comparison, not the complete ChangePlane seal schema or runtime. The actual implementation uses an immutable run-metadata subset, an ordered event log, patch bytes and patchset metadata, plus optional enrichment hashes and seal-chain links. Optional bound fields can be reported as unchecked if the caller supplies no recomputed value. A matching seal is an integrity comparison, not proof that the original work is correct, complete or authorized.

Version 1 hashes are unkeyed SHA-256. A writer controlling both artifacts and the seal can recompute them. ADR-019 specifies a future opt-in keyed v2 design; this page does not claim that design is implemented.

See evidence.json for four focused checks executed against the actual Python create_seal and verify_seal functions in a temporary directory. Each negative case changed exactly one component after sealing; verification detected the expected mismatch. The complete project test suite was not rerun for this presentation.

Inspected implementation: core/ledger.py, core/models.py, seals/seal.py, replay/apply.py, eval/evaluator.py, mcp/tools.py, autopilot/controller.py; plus existing seal/replay tests and ADR-019. Gate Monitor supplies the presentation precedent, not an assertion that a live Gate Monitor backend is connected.

