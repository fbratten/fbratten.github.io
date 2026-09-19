# Solution-space projection

This directory is a public-safe projection of reusable capability compositions.

It does not own implementation truth, deployment status, runtime availability or mutation authority. Those claims remain with the owning repositories, records and current runtime evidence.

## Explorer

The ten patterns carry curated problem, lifecycle and scale tags. Filters intersect the three dimensions; an empty result describes catalog coverage, not impossibility. Capability links and working outputs remain in static HTML for accessibility and no-JavaScript reading. Outputs describe the artifacts a pattern is intended to produce, not measured customer results.

Query parameters preserve selections for sharing. Stable pattern anchors override filters so a linked pattern remains visible. No tracking, external requests or persisted visitor data are introduced.

Run `python tests/site_copy_and_canvas_lint.py` and, with a local server on port 4173 and Playwright installed, `node tests/solution_explorer.mjs`. The interaction test covers combined filters, empty/reset states, URL restoration, keyboard details, all capability routes, narrow layouts and no-JavaScript fallback.
