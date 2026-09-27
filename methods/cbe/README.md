# CBE public method profile

## Source snapshot

- Source: author-provided `Capability Boundary Expander - AI Execution Prompt`.
- Source created/updated: 2026-08-24.
- Supplied source SHA-256: `aafb90ecd6fdce446f77bf1e3194f2b35cad14c04a992560f6c4d0fa088c380a`.
- Projection prepared: 2026-09-27.
- Source status: supplied project document. No public canonical repository locator was established for this prompt. The source bytes are not republished here.

## Independent source verification

The exact author-provided source was available to the implementing reviewer and its SHA-256 was recomputed on 2026-09-27; it matches the value above. A reviewer with only this public repository cannot independently recompute that source hash. Obtain the named source document from the author and hash the original bytes before using the section mapping below. The profile and this receipt remain derived projections, not replacements for the prompt.

## Claim mapping

| Public claim | Source section | Scope of adaptation |
|---|---|---|
| Target and locked responsibility | Role, Parameters, Steps 1-2 | Condensed inputs and normalization |
| Gap-to-candidate order | Steps 3-6 | Gap discovery, candidate generation, relevance, peer overlap |
| Four candidate verdicts | Step 7; invariants CBE-I2-I5 | SPLIT includes target work mixed with peer-owned **or unnecessary** portions |
| Boundaries and handoffs | Steps 8-9 | Owns/excludes/input/output and return contract |
| Identity and verification | Steps 10-11 | Preserve original responsibilities, identity and uncertainty |
| Ingestion baseline and named peers | Example 2 - Document Ingestion Pipeline | Format detection and parser selection KEEP; embeddings DELEGATE; retention decision/attachment SPLIT |

The five numbered steps on the page summarize source steps 1-2, 3-4, 5-6, 7-9 and 10-11 respectively. The source's title is **Capability Boundary Expander**, not “Expansion”.

## Teaching additions

The ingestion example is adapted from CBE Example 2. The reader-assistant rejection, unknown regional-access ownership, explicit missing/conflicting/unrecognized-classification handling, ambiguous parser matching, accumulated reader-platform drift and all narrated iteration traces are curated synthetic examples. They are not historical deployment evidence. The narrow format-detector fixture is a separately declared target. I1 explicitly replays the base CBE snapshot; I2 closes new gaps about ambiguous parser matches and conflicting classification returns.

The CBE lab compares a reader prediction with a curated answer. The CBE-IX lab walks fixed traces; it is not a semantic convergence engine. Different terminal cases are alternatives, not a fixed precedence algorithm. No API, model, peer operation or repository write is performed. No visitor input is uploaded or persisted.

## Verification

Run `python tests/site_copy_and_canvas_lint.py`, serve the repository locally, then run `node tests/cbe_labs.mjs`, `node tests/solution_explorer.mjs`, `node tests/method_interactions.mjs` and `node tests/blueprint_authority_labs.mjs`. Review desktop/mobile screenshots and the no-JavaScript fallback. Existing method examples and lab logic remain available.
