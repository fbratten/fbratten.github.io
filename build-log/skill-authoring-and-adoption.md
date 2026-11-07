# From an idea to a skill that is actually used

Build milestones: **2026-10-26** to **2026-10-29**. Public snapshot: **2026-11-07**. Maturity: merged into a private skills repository; validation differs per skill.

Six Agent Skills cover separate steps that are easy to mix up. The implementation source remains private.

| Step | Skill | The question it answers |
|---|---|---|
| Author | `author-governed-agent-skill` | Does this capability already have an owner, and if not, how is a reusable package written within a bounded mandate? |
| Capture | `add-observation-flow-record` | What level of record does this signal support, and does an earlier record already cover it? |
| Check claims | `verify-observation-claims` | What is independently supported, and is repeated reporting really one origin? |
| Assess | `assess-method-applicability` | Does a known method fit this task, compared with a fair simpler baseline? |
| Try | `evaluate-capability-pilot` | With hypothesis, baseline and limits set first, did it add value? |
| Verify use | `verify-capability-adoption` | Can one intended consumer find it, reach it at the right version, and get the stated outcome? |

## The distinctions they preserve

```text
repeated report != independent corroboration
pilot result != adoption
installed != used
```

## What is not claimed

- These skills were not all validated the same way. The authoring skill records that the required model-tier gate was not performed, and that its exercises ran in same-model sessions. The Observation Flow record skill also did not go through that gate, and its review was not repeated after its fixes.
- The evaluation skills checked for this page record planned behavioural checkpoints run by their current author. They make no claim of independent or blind testing, or of testing in an installed runtime.
- Merged is not used. No measurement of adoption or effect exists here.

## Publication scope

This page contains a high-level description. It includes no source code, test keys or session records.
