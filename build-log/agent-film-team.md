# Agent film team - observing real agent work

Team started: **2026-10-01**. Public overview: **2026-10-20**. Maturity: early editorial work; no film is published.

The agent film team is an AI instance (ChatGPT) that Fredrik commissioned on 1 October 2026. Its job is to make an educational film about how his working methods, techniques and protocols are used in real AI-agent work. The intended home for the film is the public [Methods & Labs](https://fbratten.github.io/methods/) section.

The team does not build or run the work it films. It observes, interviews and reconstructs, and it holds no authority to write to repositories, merge, deploy, publish or spend.

## The idea

Methods are easy to name and hard to see. A list of method names says little about why they exist or what they change. The film team's brief puts the order the other way round:

1. the **need** in a real situation;
2. what the way of working **means** and why it exists;
3. how it was **applied** in that situation;
4. the **observable result**;
5. only then, the method's **name**.

Several method names are Fredrik's own labels. The film presents them as names for ways of working, not as universal standards. Established terms such as PRD or ADR are not presented as his inventions.

## How the team works

| Activity | What it means in practice |
|---|---|
| Observe | Read the durable coordination threads and the repository history where the agents record their work. |
| Interview | Ask the agents doing the work short, bounded questions in the same threads: what changed a choice, and what still cannot be decided. |
| Reconstruct | Turn documented events into labelled visual reconstructions with simplified document views. A reconstruction is not a screen recording and not proof that an automated gate ran. |
| Separate evidence levels | Keep apart what was directly observed (for example a diff), what an agent reported (for example why it made a change) and what is only proposed. |

The team also keeps the roles explicit. One interview showed why: a summary could be read as if one agent had answered for another. The team's response was a role overview of who talks to whom (the operator, the production agent, the film team, a local Claude Code instance and a local executor that had not yet started) and what each had actually done, as of 2 October 2026.

## The first story: four lines that changed the choice

The first film test follows a documentation change in a private production repository.

| Step | What happened | Evidence level |
|---|---|---|
| Need | The repository needed clearer routing for agents re-entering the work. | Repository history |
| First draft | A rewrite of the README and the agent instructions file added the new routing, and in doing so removed four existing lines. | Observed in the commit diffs |
| Check and choice | The implementing agent reports that a preserve-first check found the removed lines, and that it refused the reasoning "nothing important is gone". | Reported by the implementing agent |
| Changed action | Two repair commits made the change additive: the four lines are present again, and the new routing sits beside them. | Observed in the commit diffs |
| Result | The final pull request changed 12 paths, deleted no files and removed no lines. | Observed in the pull request |

The point of the story is not a flawless first attempt. It is a check that found a deviation and changed the action before the change was accepted.

## What exists and what is not claimed

| Item | State |
|---|---|
| First film test (V1) | A 45-second animatic, 1920x1080 at 24 fps, drawn programmatically with Python and Pillow, with its own sound design (NumPy) and assembled with FFmpeg. Swedish on-screen text, no recorded voice; a timed script draft exists. Labelled as a visual reconstruction. Reviewed privately; **not published**. |
| Second version (V2) | Reported delivered to Fredrik: 88 seconds, three storylines, reconstruction and real source images labelled. Not opened in this review. |
| Published film | **None.** No film is published on Methods & Labs yet. |
| Customer material | The film team is separate from the production studio's commercial reel and demo work. No customer reel or finished demo is claimed. |
| Learning outcome | No measured effect on learners is claimed. |

## Direction, not delivered

The intended next step is to connect each verified story to a short film, a few presentation frames, one learner exercise ("before you accept this rewrite, what do you check?") and, where relevant, a book section. Over time this could grow into a public map of problem, method, agent roles, observable outcome and evidence. This is a direction. None of these connections exist yet.

## Publication scope

This overview describes the film team's purpose, method and first story at summary level. It contains no private coordination transcripts, no internal artifact or session identifiers, no private source files and no film media. The production repository and the coordination threads remain private.
