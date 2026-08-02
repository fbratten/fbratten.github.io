# Gate Monitor recruiter proof

Public-safe explanatory demonstration for the private source repository `fbratten/gate-monitor`.

## Evidence manifest

```yaml
project: Gate Monitor
private_source_repository: fbratten/gate-monitor
source_branch: main
current_source_pin: 90f9845d6fde1b1ba902473afea2bb79dfab9877
inspected_runtime_pin: 193821edcacca87d286292e5f568c6aad9c808df
security_implementation_pin: f3c30f4ce7e512cdd92615bd8fa82892843c9455
verified_at: 2026-08-02
proof_type:
  - source-pinned-private-implementation
  - deterministic-policy-explainer
  - browser-only-synthetic-simulation
source_reported_verification:
  tests_passed: 279
  environment_skips: 1
  dogfood_scripts_green: 3
limitations:
  - private Python source is not published
  - the browser demonstration is not the Gate Monitor runtime
  - no real prompts, sessions, costs, provider responses or audit logs are included
  - verification figures were not re-run by this proof-package change
  - no hosted multi-tenant control-plane claim
```

## Public-data policy

The proof package contains only:

- synthetic run events;
- fictional cost and timing values;
- a browser-only explanation of decision-state priority;
- source and verification pins;
- public-safe architecture descriptions;
- explicit limitations and non-claims.

It does not contain:

- real prompts or model outputs;
- provider account information;
- actual token usage or costs;
- local filesystem paths;
- production policies;
- real run/session identifiers;
- private JSONL event logs;
- private reports;
- source code copied from the private repository.

## Demonstration scope

The interactive page explains the implemented decision vocabulary and priority ordering through four synthetic presets:

1. `continue`
2. `warn`
3. `pause`
4. `escalate_to_human`

It also exposes synthetic quality and memory controls so a reviewer can see how findings affect the selected state.

The browser page performs no filesystem, network, MCP or provider operation.
