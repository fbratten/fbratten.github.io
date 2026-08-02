# Broker Lane Sandbox evidence manifest

Verified: 2026-08-02

## Purpose

This directory provides a short recruiter-facing orientation card for the public `fbratten/broker-lane-sandbox` source repository.

The source repository remains the canonical proof. This card does not replace its README, threat model, manual, tests or CI.

## Pin

- public source repository: `fbratten/broker-lane-sandbox`
- inspected source pin: `aae50e2d5b3bb3445561396d7cf80cef978bff24`
- implementation/test receipt named by the source README: `19091b1`
- source-reported test receipt: 286 passing tests on 2026-07-23
- current proof route: `broker-lane-sandbox/index.html`

## Supported claims

- default-deny subprocess execution;
- allow-listed bare command names;
- child environment built from empty;
- secret-shaped environment names dropped unless explicitly allowed;
- wall-clock timeout and process-group cleanup;
- optional POSIX resource limits;
- structured `ExecResult` JSON for success, refusal and failure;
- local llama.cpp-family inference with operator-provided, checksum-verified weights;
- additive JSONL streaming;
- model weights prohibited from Git and checked by repository guards;
- public threat model and explicit limitations.

## Non-claims

This card does not claim:

- kernel, VM or container isolation;
- a filesystem jail;
- a network namespace;
- cryptographic pinning of executable identity;
- hostile multi-tenant security;
- current support for Ollama or Transformers;
- that the test suite was re-run during card publication.

## Public-data policy

The card contains only public source-derived architecture and verification summaries. It contains no private paths, credentials, model weights, prompts, operational logs or private broker data.
