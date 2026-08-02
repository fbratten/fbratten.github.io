# Adaptivearts.ai recruiter proof

Public-safe architecture case study for the private source repository `fbratten/project-adaptivearts-ai`.

## Evidence manifest

```yaml
project: Adaptivearts.ai
public_product: https://adaptivearts.ai
private_source_repository: fbratten/project-adaptivearts-ai
source_branch: main
current_source_pin: adea33d6a2c193d67dcb0f5389fb7b17acf6954c
implementation_evidence_pin: e31d085707dd98c86286e8368b0c4dc75b5ac9fa
verified_at: 2026-08-02
proof_type:
  - deployed-public-product
  - architecture-case-study
  - source-pinned-private-implementation
  - browser-only-synthetic-flow
verification:
  - live public site externally reachable during review
  - Astro active build scripts inspected
  - Astro site configuration inspected
  - Supabase authentication and role projection inspected
  - server-side Gemini Edge Function inspected
limitations:
  - private source is not published
  - no automated test suite is claimed by this proof package
  - no new production build or deployment was performed by the case-study change
  - Google Gemini integration is not Azure OpenAI evidence
  - Supabase deployment is not Azure deployment evidence
```

## Public-data policy

This proof package contains only:

- architecture derived from the inspected source;
- public product descriptions already visible on Adaptivearts.ai;
- synthetic example requests and responses;
- source and verification pins;
- explicit limitations and non-claims.

It does not contain:

- Supabase project identifiers;
- API keys or credentials;
- private database rows;
- user accounts or session tokens;
- unpublished articles or editorial data;
- real provider responses;
- admin screenshots;
- private source code.

## Purpose

The page demonstrates how a static-first Astro site, React interactive components, Supabase Auth and an authenticated Edge Function combine into a public research platform with editorial and AI-assisted workflows.

The page is explanatory evidence. It is not a copy of the private application and does not execute Gemini or Supabase operations.
