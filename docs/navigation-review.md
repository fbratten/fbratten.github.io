# Portfolio navigation draft

Prepared for review before merge or publication. Baseline: main at `b005601`.
The reference-sketch refinement builds on PR #32 at `c7dc494`, using an isolated
worktree. A fresh fetch found only that one unmerged site branch and PR.
All 32 remote branches were inspected at the start; none contained an unmerged
change relative to that main. No open PR competed with this work.

## Visitor routes

- Home leads with three visitor questions, four flagship cards, a Now building
  panel for Blueprint and the book, writing, a Build Log update and About.
- Projects keeps the four current flagships, supporting evidence and the earlier
  archive. Existing project URLs remain available.
- Methods & Labs combines problem finding, 20 plain-language labels with their
  published names, and six lab entry points. The longer overview
  is a native disclosure; all 20 profiles and their labs remain available.
- Articles lists 46 public articles with original hero images, dates, excerpts
  and direct Adaptivearts.ai destinations. Six browsing groups combine equivalent category labels and collect the 2024–2025
  articles under Earlier posts, without changing source metadata. Text and group filtering are
  optional enhancements; the full directory works without JavaScript.
- Blueprint AI Studio connects the book, published reader labs, planned studio
  and LMS, and an evidence-linked project journal with an RSS feed, derived from three
  admitted Build Log entries (16, 17 and 28 September).
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
copied into the public journal. Current availability appears in the status cards;
only admitted public Build Log records can become journal or RSS milestones.

## Reference sketch and content decisions

The supplied `Portfolio navigation sketch.html` is a design reference with ten
views. The implementation follows its navigation, visitor questions, colored
project cards, Now building/book composition, mobile menu and grouped footer.
It uses the actual article images and book cover instead of placeholders.

- The name is **5 Point Protocol (5PP)**, as specified by Fredrik. The earlier
  draft's "Five-phase work protocol" label was incorrect and is removed.
- The book has one section and one main-content destination on the Blueprint
  page: Adaptivearts.ai/book. There is no "Get notified" book call-to-action.
  The studio has an explicit Explore Blueprint AI Studio link; its status remains
  Coming soon. The shared footer retains its standard book link.
- Build Log is an internal route, so it is not marked as an external site.
- Fixed-width artboard sizes and bundled design-tool runtime are not copied into
  the production pages. Layout and the menu adapt to the available width.

## Maintain the journal

Daily monitoring produces a private status report and, when there is a material
change, a proposed public update. It does not write to this repository or publish.
After reviewing an update:

1. Verify and admit the milestone to the public Build Log using its existing
   publication contract.
2. Add its exact date and title, plus a stable RSS ID, to
   `blueprint-ai-studio/progress.json`. This file selects entries and can include a reviewed
   `display_title` and `display_summary` to explain their relevance to Blueprint.
   These must remain within the selected record's admitted claims. Date, status
   and evidence always come from the Build Log; the renderer still refuses
   missing, ambiguous or unadmitted entries, even when a display summary exists.
3. Run `python scripts/build_navigation.py` to refresh HTML and RSS, then review
   the diff and run the contract/browser checks before a PR.

An unchanged day needs no new milestone. Article updates use
`articles/entries.json` and the same renderer. Preserve the original headline,
hero image, date and destination. The renderer also owns navigation, breadcrumbs
and the shared footer on every page. Add page labels there for new local pages.

## Book-link scope correction

The portfolio archive, README and reader-lab book entry points now point to
Adaptivearts.ai/book rather than the old `/From-Blueprint-to-Application/`
showcase. The 5PP Historical public demo link remains intact.

The earlier claim that `subscribepage.io/from-blueprint-to-application` was
obsolete was unsupported: Adaptivearts.ai/book still links to it as Pre-order
book. That claim and the navigation test forbidding the domain are withdrawn.
The separate book-repository PR #1 remains an unconfirmed Draft proposal, not
an approved part of this portfolio revision. Its link removals have not been
merged. Adaptivearts.ai itself is unchanged. No Cicerone files are involved.

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
above. Shared footer context is preserved and the Blueprint lab changes only its
book destination and the common page frame. No lab script or Build Log entry changed. The executable 5pp-gate was not
run; these are site and browser verification results, not a gate certificate.


Reference refinement verification: all 20 method profile main bodies match PR
#32 at c7dc494; lab scripts and Build Log source entries remain unchanged. Static
checks, all existing browser suites and the refined navigation pass locally.
The progress contract also checks rejection of missing or unadmitted Build Log
entries. Desktop, mobile, open-menu and full-home visual checks were inspected.
The portable preview preserves the current page when following an in-page link.

## Review corrections after fdbfdb4

- Adaptivearts.ai is the exact brand spelling. The shared header and README use
  ® following the owner's confirmation of Swedish PRV registration.

- 5 Point Protocol naming is consistent in the directory, lab routes, profile
  and Dialogue Lifecycle cross-link. The five-point mechanism and lab scripts
  are unchanged.
- The Blueprint page has one book section with the cover and one main-content
  book link, before progress. No book notification or signup CTA is added.
- The 28 September milestone leads with the published reader-lab additions. It
  distinguishes two new profiles (20 total) from the 18 earlier profiles; its
  date, state and evidence still resolve from the admitted Build Log record.
  The reviewed title appears in HTML, the homepage teaser and RSS; HTML and
  RSS also use the reviewed summary.
- The article filter has six groups covering all 46 articles, including the
  2026 AI Technology article and all 13 earlier posts. Source metadata is intact.
- The menu button is at least 44 by 44 CSS pixels. Nine empty local navigation
  landmarks are removed while the local context labels remain.

Claude also reported pre-existing mobile overflow on worktrace, mads, vertex,
adaptivearts-ai, dial4, dial4p-possibility, gate-monitor and broker-lane-sandbox.
Those page-body layouts are a separate follow-up; this revision does not claim
that all legacy pages are free of horizontal scrolling.

Revision verification: static lint, navigation and Build Log contracts, all six
browser suites, every article filter group, minimum menu target size and the
portable preview pass locally. The consolidated book section was inspected on
desktop and mobile with the original cover. Eighteen method main bodies and all
six proof main bodies match fdbfdb4; the other two method bodies contain only
the requested 5PP naming corrections. Article metadata, Build Log records and
lab scripts are unchanged. 5pp-gate was not run.
