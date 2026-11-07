# Daily Flow - reviewing AI suggestions before they change a plan

Build milestone: **2026-11-03** (versions 2.3.0 and 2.4.0). Public snapshot: **2026-11-07**. Maturity: personal tool; source private and no public download.

Daily Flow is a personal planning web app in one HTML file. This page describes two increments that concern how AI suggestions reach the plan. It holds no planning data.

## What was added

| Version | Feature | Boundary |
|---|---|---|
| 2.3.0 | Select the day's work and older unfinished tasks, and prepare an editable instruction to share with an AI. | Selecting and sharing never change the plan. |
| 2.4.0 | Revised notes come back as an explicit proposal, reviewed field by field, and approved as the next version of the same task. | Each proposal must name the exact task and base version. Proposals are checked again at commit, and the whole batch stops on a conflict. |

Before 2.4.0, importing revised notes for an existing entry skipped it. Now earlier versions are kept, and only the accepted one is shown as current.

```text
AI suggestion != plan change
reviewed proposal != silent overwrite
```

## Checks

| Check | Result at 2.4.0 |
|---|---|
| Python tests | 13 passed |
| Browser test groups for revisions, on the actual release file | 20 passed |
| Formatter tests | 66 at close-out |
| Independent review | Architecture, code and interface review recorded in the pull request |

## Limits

- It serves one person. Nothing here shows that it suits anyone else.
- Use on a physical phone, the operating system's clipboard and a full restore were tracked as separate checks and are not claimed here.
- The private planning data stays outside Git.

## Publication scope

This page contains a high-level description and summarized checks. It includes no planning data, task text or personal details.
