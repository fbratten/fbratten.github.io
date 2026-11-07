# Canvas skills - building a map, then looking at it

Build milestone: **2026-11-06**. Public snapshot: **2026-11-07**. Maturity: installed on one workstation; Obsidian 1.13.7 on one Linux desktop.

Two Agent Skills for maps in Obsidian Canvas. The implementation source remains private.

| Skill | What it does |
|---|---|
| `make-obsidian-canvas` | Builds a canvas from a data file: nested groups, colours, directed labelled edges and computed layout. Keeps the data file as the editable source, and keeps any earlier file. |
| `inspect-and-correct-obsidian-canvas` | Opens a canvas in the real app on a throwaway copy, finds its way around it, and corrects it by patch or by a person in the same window. Routes each correction to whatever owns the fact. |

## Why both

The first map behind this work passed 18 structural checks and still had 37 edges crossing cards. A map can pass its checks and be unreadable, so someone has to look at it in the app.

The same day, a helper that opened the first file in a vault handed non-canvas files to the desktop's default programs, on a person's working screen. The second skill therefore opens canvas files only, always on a copy.

## Checks

| Check | Result |
|---|---|
| Repository test suite at merge | 1016 passed |
| End-to-end run in the real app | 49 passed, 0 failed, with the person's own Obsidian running and its process unchanged |
| Validation with three model tiers | `VALIDATED_WITH_FINDINGS` after six rounds, the last without a new review. Reviews went from 30 findings to 7, none high. The last fixes had tests and an end-to-end run, but no further independent review |

## Limits

- Tested on one app version and one desktop. It uses the app's internal canvas objects, which are not a published interface, and it is written to fail loudly if they change.
- Readability measures are estimates. A picture of the real window is what counts.
- A map holds no facts of its own. The skills do not check that a map's content is true.

## Publication scope

This page contains a high-level description and summarized results. It includes no source code, vault content or session records.
