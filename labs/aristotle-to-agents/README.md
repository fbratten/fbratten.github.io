# Aristoteles till AI-agenter

Five Swedish knowledge-graph views and five browser-local experiments, extending
the operator's 2026-11-01 argumentation/LLM/agent graph. Route:
`/labs/aristotle-to-agents/`, with deep links `#overview`, `#history`, `#llm`,
`#agents` and `#interplay`.

## Scope and interpretation

The first four views retain the original themes. The fifth explores interactions
between ambiguity, apparent authority, selective evidence and recirculation.
All 74 original nodes and 111 typed edges are retained. `original-graph.json`
and the four SVGs in `original-diagrams/` are byte-preserved historical artifacts.
`graph.json` and `data.js` are labelled consumer projections. The working projection
adds source review status, primary-source routes and five view definitions.
It does not promote inherited edge grounding to a new independent verification.

The five thematic argument categories are a modern teaching grouping, not
Aristotle's original taxonomy. Chronology, historical connection, technical
relationship, analytic analogy and hypothetical risk are distinct edge types.
The graph is neither a complete intellectual history nor an empirically weighted
causal model. Original secondary references remain explicitly inherited.

## Experiments

1. Argument validity versus the truth of premises.
2. Boolean truth tables and material implication.
3. Retrieval selection, counterevidence and duplicated source origins.
4. A five-event agent simulation with separate instruction, memory, scope and
   review controls. All 16 control combinations have deterministic outcomes.
5. Repeated voices versus independent source origins.

Examples are synthetic. No model, network service, remote action, personal data
or local-storage write is used. JSON receipts contain only the chosen scenario
settings, deterministic results and export time. A human reviewer in experiment
4 is assumed to inspect evidence and withhold the unsupported publication.
This is a teaching assumption, not a claim that approval always blocks errors.

## Implementation and validation

Plain HTML/CSS/JavaScript; no dependencies or build step. `model.js` is usable
from Node and the browser. SVG node controls support mouse and keyboard;
the detail panel offers relation buttons and source links. Mobile graphs use
horizontal scrolling. Shared site navigation and the static fallback remain
available without JavaScript.

Run `node tests/aristotle_agents_model.cjs`, `python scripts/build_navigation.py --check`,
`python tests/navigation_contract.py`, `python tests/site_copy_and_canvas_lint.py`
and `python tests/build_log_contract.py` from the repository root.

Prepared from `main` at `42bb31a95488d8a6d7bf9c010d97e41bad08b63b` in an
isolated worktree. Branch audit: SCOPED. All 64 remote branch heads and the two
open PRs (#50 and #53) were inventoried. Relative to the pinned main, #50 was
diverged (+3/-9) and #53 diverged (+2/-5). Their unique navigation and Build Log
diffs were inspected; the current main already contains the newer lab catalog.
This change preserves that catalog and does not merge either unrelated PR.

Disposition: REUSE original graph + EXTEND existing Pages lab directory.
Source and content: operator request 2026-11-03, original graph package
`aristoteles_till_ai_llm_agenter_kunskapsgraf.zip`, and the linked primary sources.
No private source text, coordination logs, credentials or Library identifiers
are included in the public projection.

+
+## Bilingual reading and map workspace (2026-11-07)
+
+The Swedish route is preserved. `/labs/aristotle-to-agents/en/` provides the
+English variant of the same graph and five experiments. Language links retain
+the selected view. English output is generated from the Swedish sources and
+`translations.en.json` with `python scripts/build_atlas_english.py`; use `--check`
+to detect drift. Source IDs, topology, references and deterministic model
+outcomes retain their responsibilities across the two projections.
+
+The map uses the available page width and a taller, vertically resizable
+workspace. Nodes start at readable native scale. Fit entire map is a deliberate
+overview; 100% restores the readable size. Expand map opens a large keyboard
+accessible dialog, and Escape restores the original workspace. Selecting a node
+reveals its detail panel beside the map on desktop and below it on mobile.
+No original graph data or historical SVG was changed.
+