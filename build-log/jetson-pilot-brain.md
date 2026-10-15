# Jetson Pilot Brain - development snapshot

Published: 2026-10-15. Project maturity: research / work in progress.

Jetson Pilot Brain explores a small language model as an advisory component for a UAV, with NVIDIA Jetson Orin 8GB as the intended edge-compute target. The work combines structured telemetry, scenario-based training data, parameter-efficient fine-tuning and offline evaluation.

The implementation source remains private. This page is a curated development snapshot and verification receipt, not a source release or an independently reproducible model benchmark.

## What has been built and what was checked

| Area | Evidence at this snapshot | Verification boundary |
|---|---|---|
| Data preparation | Python tooling for loading and validating scenario records, creating train/validation/test splits and formatting training examples. | Source inspected. The full dataset and preparation pipeline were not validated in this publication review. |
| Model training | QLoRA fine-tuning code with adapter configuration, checkpoint output and a bounded experiment duration. | Source inspected. No GPU training run or model-quality result is claimed. End-to-end training/evaluation integration remains unverified. |
| Offline evaluation | Code for comparing structured predictions with expected decisions and applying an acceptance gate. | The evaluator's three embedded self-test cases were executed and passed. This checks those cases, not overall evaluator correctness or model performance. |
| Edge deployment | Jetson deployment, model quantization and flight-controller integration are described as target stages. | No verified deployment, device performance or flight result is presented. |

## Intended system boundary

The design places the model in an advisory role behind a decision broker and the flight controller's own failsafes. That is an architectural requirement, not a verified claim that the broker, integration or aircraft safety controls are operational.

The engineering value is the connection between data contracts, constrained model adaptation and explicit acceptance checks. A good aggregate score alone is not intended to admit a model that fails a safety-critical case.

## Source pin and verification receipt

| Field | Value |
|---|---|
| Private source identity | `fbratten/jetson-pilot-brain` |
| Inspected source ref | `main` at `e5f3631123f4334e1af75e5ce00e87784d1ccd30` |
| Review date | 2026-10-15 |
| Evaluator file identity | Git blob `05a86e6b4f1fe73a2ec7604e394005f32c059500` |
| Executed check | Evaluator's embedded self-test, using its synthetic examples; no model or external service was invoked. |
| Result | PASS, three embedded cases: a correct routine decision, a correct safety-critical decision and an intentionally incorrect safety-critical decision that caused rejection. Process exit code: 0. |
| Unexecuted checks | GPU training, inference on trained weights, quantization, Jetson resource measurements, simulation, hardware integration and flight testing. |

These are newly executed tooling checks, not a repetition of source-reported test counts. The private implementation cannot be independently inspected through this receipt. No trained-model accuracy, reasoning quality, latency, memory-use or safety-certification result follows from the self-test.

## Publication scope

This public snapshot contains only a high-level description, source/version identifiers, a summarized check result and explicit limitations. It includes no private source code, scenario records, model weights, real telemetry, raw execution logs, local machine paths, account details or credentials. The source repository's visibility is unchanged.

The Build Log entry is marked **PUBLISHED** for this development snapshot. It does not mark the aircraft system as shipped, deployed or flight-verified.
