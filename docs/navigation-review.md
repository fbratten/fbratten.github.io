# Portfolio navigation draft

Prepared for review before merge or publication. Baseline: main at `b005601`.
All 32 remote branches were inspected at the start; none contained an unmerged
change relative to that main. No open PR competed with this work.

## Visitor routes

- Home leads with projects, methods and practical labs.
- Projects keeps the four current flagships, supporting evidence and the earlier
  archive. Existing project URLs remain available.
- Methods starts with problem finding, browsing and practice. The longer overview
  is a native disclosure; all 20 profiles and their labs remain available.
- Articles lists 46 public articles with original hero images, dates, excerpts
  and direct Adaptivearts.ai destinations. Text and category filtering are
  optional enhancements; the full directory works without JavaScript.
- Blueprint AI Studio connects the book, published reader labs, planned studio
  and LMS, and an evidence-linked project journal with an RSS feed.
- Shared static navigation, breadcrumbs, an all-pages directory, sitemap and
  404 page provide routes back. Other showcase repositories keep their own theme.

## Public evidence and honest project status

Checked 2026-09-28 (Europe/Stockholm):

- `https://adaptivearts.ai/blog/`: 46 public article cards and their original hero
  image URLs. Metadata is a checked-in snapshot, not a live API integration.
- `https://adaptivearts.ai/book/`: public book overview and cover. This destination
  is retained.
- `https://blueprintaistudio.app/`: coming-soon page. Do not describe the LMS as
  launched, enrolment-ready or fully operational.
- PR #30 and the published reader lab: evidence for the CBE/CBE-IX lab milestone.

No private source code, manuscript content or internal development receipts are
copied into the public journal. No invented completion percentages or daily
milestones. The initial status entry is labelled separately from shipped work.

## Maintain the journal

Daily monitoring produces a private status report and, when there is a material
change, a proposed public update. It does not write to this repository or publish.
After reviewing an update:

1. Add a stable ID, date, status kind, concise outcome and public evidence links to
   `blueprint-ai-studio/progress.json`. Update `verified_at` only after a new check.
2. Keep old entries intact. Label corrections and distinguish Published, Preview,
   Planned and Status check. An unchanged day needs no new milestone.
3. Run `python scripts/build_navigation.py` to refresh HTML and RSS.
4. Run the contract and browser checks, review the resulting diff and use a PR.

Article updates use `articles/entries.json` and the same renderer. Preserve the
original headline, hero image, date and destination. The generator also owns the
navigation and breadcrumb blocks on each page. Add page labels there when adding
a new local page.

## Separate book-link change

The obsolete `subscribepage.io/from-blueprint-to-application` destination is owned
by the separate `From-Blueprint-to-Application` repository. A separate draft
retires those links and the stale discount CTA in favor of Adaptivearts.ai's book
overview. No older Cicerone files are involved. Adaptivearts.ai itself is not
modified by either draft; it may retain its own upstream signup link.

## Review and verification

Review the homepage, methods, articles and Blueprint hub at desktop and mobile
widths. CI stores screenshots as `portfolio-navigation-visuals` and a complete
static review bundle and a portable, clickable HTML hub preview as
`portfolio-navigation-preview`. Open the HTML file directly to inspect the hub
routes. The preview opens method profiles, labs and articles at their current
public URLs; use the full bundle to inspect every changed local page. Serve the extracted
bundle at the web root (for example `python -m http.server 4173`) to follow local
links. No-JavaScript navigation and article browsing are checked separately.

Existing method explanations, examples, lab scripts and Build Log data are preserved.
Two pre-existing ORBIT cards pointed to public URLs returning 404 (Observation
Flow and the orbit-library IE package). Their descriptions are retained as
non-clickable cards marked as having no public page. No substitute source is
implied.
Navigation labels and surrounding context bars change deliberately. This is not
the earlier CBE-only additive profile check; inspect the navigation diff and run
the existing interaction suites as well as the new navigation checks.


Local verification: static copy/Canvas lint, navigation contract (37 pages),
Build Log contract (14 entries), navigation/filters/no-JS checks, all 10 method
Canvas interactions, solution explorer, CBE suite and Blueprint authority labs
pass. The local browser could not directly reach the Chart.js CDN; its exact
public bytes were cached for the Canvas run. CI uses the normal CDN. All 47
article/book images were fetched and decoded successfully. Nineteen method main
bodies match the baseline; ORBIT has only the two unavailable-card changes noted
above. No lab script or Build Log entry changed. The executable 5pp-gate was not
run; these are site and browser verification results, not a gate certificate.
