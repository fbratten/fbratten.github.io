# CBE family review receipt

Prepared 2026-09-27 on `codex/cbe-cbe-ix-profiles-labs-20260927`.
Base: `cc0bf3589f2c55e623d29786efe97d4d22a45bde`.

## Review routes

- `/methods/cbe/`: base method, responsibility decisions, ingestion example and classification lab.
- `/methods/cbe-ix/`: iterative variant, frontier and ledger, seven convergence checks, eight terminal cases and trace lab.
- `/methods/solutions/#bounded-capability-design`: added solution pattern, profile links and matrix columns.
- `/methods/5pp/`, `/methods/dialogue-lifecycle/`, `/methods/aics/`: additional presets in the existing lab forms.
- `/blueprint-ai-studio/labs/rules-authority-enforcement/#capability-boundaries`: two additional authority/verification exercises, included in export and reset.
- `#cbe-example` on each of the 18 original profiles: an explicitly labeled composition exercise.

## Preservation

- The original content of all 18 method profiles was compared with the base after removing only the added composition sections, stylesheets and presets. All original content remains.
- All ten original solution matrix rows retain their original 18 memberships. Two columns and one row are added.
- Existing form evaluators are unchanged. The added presets populate their existing inputs and invoke their existing evaluation.
- No files are removed. No source prompts, private paths or credentials are republished.
- CBE and CBE-IX are alternatives within a method family; the atlas does not require both on every task.

## Local checks

- Static site copy/Canvas lint: pass.
- Build Log contract and rendering: pass.
- CBE browser suite: pass for classification, split ownership, unknown-owner hold, eight IX terminal traces, reset, keyboard, all existing-profile links, three existing-lab presets, mobile layouts (including all terminal ledgers) and no-JavaScript fallback.
- Solution explorer: pass for 20 profile routes, 11 patterns, catalog coverage, matrix membership, filters, keyboard and no-JavaScript fallback.
- Blueprint labs: pass, including both new exercises, exported evidence and reset.
- Desktop and mobile CBE screenshots inspected.
- Existing Canvas browser suite: local run reached the 5PP page and stopped on `net::ERR_EMPTY_RESPONSE` loading an external resource. The unchanged suite passed in GitHub CI.
- First remote CI run: all required checks passed at `683121d28dd804af72e79bcfed02326aef57a1b0`, [run 36346828302](https://github.com/fbratten/fbratten.github.io/actions/runs/36346828302).
- Follow-up: mobile inspection of a long terminal-state ledger exposed horizontal overflow. Scoped word wrapping was added and every terminal trace now has a mobile overflow assertion. The updated CBE suite passed locally; the final PR head carries its own CI result.

The browser exercises use Playwright 1.55.0, matching the existing CI pin. The CBE labs use curated synthetic cases, not an LLM, a general semantic classifier or a convergence proof. A passing teaching exercise does not establish implementation authority or real-world efficacy.

## Publication boundary

This receipt describes a review branch. Merge and production publication require the separate review decision. Check the PR's checks and current head for the final remote verification result.


## Revision following review of `30c4c9f`

The review findings were checked against both original author-provided prompts on 2026-09-27. Both source hashes match their profile README values. The base CBE prompt was available in the implementing review context; its absence from another review context does not make the public projection independently source-verifiable. The README files now provide precise section mappings and explain that limitation.

| Finding | Revision / source-grounded result |
|---|---|
| 5PP blocker failed for missing evidence | The full analysis, verification and audit are recorded. The synthetic completeness check passes with **Park**, while dependent work remains held. A regression also confirms that removing verification makes this same Park record fail. The existing evaluator is unchanged. |
| Drift conflated with known peer takeover | A deliberately flawed acceptance trace accumulates preview, correction annotation and reader notification responsibilities. C6 is checked after each material delta and stops the aggregate change into a reader platform. Policy and indexing operations remain delegated. |
| Unowned decisions appeared in the target frontier | The new **Blocking decision / residual** list retains ownership questions, identity review and missing target input separately. The initial queue also uses target responsibilities instead of an indexing dependency. |
| I2 rediscovered already accepted behavior | I1 explicitly replays the CBE snapshot. I2 addresses new ambiguous-parser and conflicting-classification gaps; it does not claim parser selection or an unresolved-state representation as new discoveries. |
| SPLIT too broadly phrased | Definition now requires target work mixed with work belonging elsewhere or unnecessary scope. Base source Step 7 explicitly allows unnecessary portions; limiting SPLIT to peer ownership alone would be narrower than that source. |
| C5 and boundary-state wording | External architectural authority routes the unresolved question to a blocker; it is not described as a C5 failure. The terminal definition includes peer-takeover risk and distinguishes nonblocking residual uncertainty. |
| Residual appeared only at termination | Policy-exception uncertainty is recorded when discovered at I1 and retained in subsequent states and the ledger. |
| Catalog / atlas consistency | The problem card includes 5PP. Pattern 11 includes Execute (constructing the analysis) and Close / Re-enter, with arrow notation. CBE/IX sit in the expanded discover/design/activate role, consistent with the catalog family. |
| Mobile word breaks / misleading counter | Identifier words stay intact while wrapping between underscore-delimited parts; copied identifiers keep their exact spelling. The counter includes initial state and matches the number of displayed ledger entries. |

Revision checks: static lint and Build Log contract passed; CBE, solution explorer, Blueprint and Build Log browser suites passed locally. The CBE suite now checks Park versus completeness, per-step residual accounting, separate frontier/decisions, the revised drift and follow-up gaps, entry counts, and unbroken identifier words on mobile. Mobile and desktop screenshots were inspected. Preservation comparison again passed for all 18 original method profiles and all ten original matrix rows. The existing Canvas suite still encounters a local external-resource `ERR_EMPTY_RESPONSE`; use the PR's revision-head CI result for that suite. The standalone `5pp-gate` was not run; browser fixtures are not an authoritative protocol-gate result.

Project-source catalog maintenance is separate from this website branch: the supplied Cicerone row conflates CBE and CBE-IX and points to the iterative prompt. Its corrected mapping should use two rows: **CBE - Capability Boundary Expander** to `Capability-Boundary-Expander-AI-Execution-Prompt.md`, and **CBE-IX - Capability Boundary Expander - Iterative Exhaustion** to `Capability-Boundary-Expander-Iterative-Exhaustion-AI-Execution-Prompt.md`. The project document and the original prompts are not mutated or republished by this PR.


## Follow-up review of `8d13168`

Direct GitHub verification confirmed that [CI run 36348573498](https://github.com/fbratten/fbratten.github.io/actions/runs/36348573498) passed for the exact reviewed head `8d13168fbc8f0edfe5bebd28a5260c1c7c678785`.

The six subsequent findings are addressed:

1. Status words use inline `<wbr>` breaks. Chromium still inserts spaces in names derived from these breaks, so the status heading and every terminal-reference term carry exact `aria-label` values. The browser test reads Chromium's actual accessibility tree for all eight terminal cases, checks exact names and confirms words remain intact on mobile. This is accessibility-tree verification, not a claim of manual testing with every screen reader.
2. The drift review names I2 as the latest snapshot that passed C6 and uses it as a review starting point while reopening the I1/I2 acceptance decisions and the I3 proposal.
3. Residual uncertainty concerns the target's handoff return contract: whether a returned exception classification requires dedicated preservation in the normalized record. The synthetic fallback preserves unrecognized values unchanged with unresolved interpretation; exact return coverage needs external evidence. This replaces the earlier example about a policy service's internal exception evidence.
4. The general identity-drift definition covers one material change as well as accumulated accepted changes.
5. The discovery/design/activation group's heading and introductory description cover all three activities.
6. I1 accounts for the initial extraction and normalization areas, carries their remaining gaps into the named frontier and records downstream submission as locally exhausted against supplied handoffs. The drift trace also accounts for the original areas and closes preview validation before moving to correction annotations.

Local verification passed: copy/Canvas lint, revised CBE suite (including Chromium accessibility names), solution explorer, mobile overflow and word integrity, keyboard/reset and no-JavaScript paths. The updated residual trace was visually inspected on mobile. Check the PR's current head for final remote CI results.

Separately from repository changes, the two Cicerone documents supplied in this conversation were patched from their attached v1.0 baselines to v1.0.1. They now distinguish CBE/CBE-IX cards, exact prompt filenames and selection cues. Unrelated routes and dated inventory evidence were preserved. These document updates do not install files into a different project's Sources; that project still needs both original prompts and its appropriate updated source map. The website repository continues to contain derived profiles, not the raw source prompts.

## Source-completeness review of `00f3010`

Claude's three follow-up findings were checked against the original source bytes. Both SHA-256 values match the source snapshots in the profile READMEs. GitHub's API also ties successful [run 36350303353](https://github.com/fbratten/fbratten.github.io/actions/runs/36350303353) directly to `00f3010f5bb1958c79a995dd6917113f8fd4a124`; that association no longer depends on the number of workflow runs.

| Finding | Correction and evidence |
|---|---|
| CBE Example 2 omitted ingestion responsibilities while IX claimed C2 | Both worked examples and labs now include ingestion-level duplicate detection (KEEP), safety-gate coordination (KEEP) and the malware detection algorithm (DELEGATE). The Malware Scanner handoff states trigger, supplied document/correlation identifier, peer ownership, expected return and the target's behavior after return. I1 accounts for these responsibilities before I2 and the bounded C1-C7 closure. |
| Missing final CBE verdicts | All six names from output contract L are displayed separately from the four candidate classifications, including exact accessible names. The profile states the V1/V5/V10 failure rule and qualifies the relationship between BOUNDARY_UNRESOLVED and the IX boundary blocker. The single-candidate lab does not claim to certify a whole-analysis verdict. |
| Drift trace reused successful-path accounting | The alternative drift trace retains all four original responsibility areas as unprocessed alongside the preview/annotation question. It no longer claims that unspecified remaining gaps are represented by Preview validation alone. Its existing I2 review baseline and reopening instructions are preserved. |

The added document-identifier comparison, provided ingestion record set, new/duplicate submission rule and clear/flagged/unavailable scanner returns are explicitly declared teaching assumptions. Under this fixture a new identifier may proceed to the safety gate, a duplicate is held without rewriting the prior record, and the safety gate releases submission only for clear. These assumptions make the narrated closure inspectable; they are not prescribed source implementation details or proof of real safety. Malware detection remains owned by the peer.

Verification for this correction:

- Static copy/Canvas lint passed.
- The revised CBE browser suite passed using Playwright 1.55.0 and Chromium, matching the CI dependency pin. It checks all three added candidate cases, the six final names in the accessibility tree, scanner handoffs and duplicate/safety accounting in I1 and the final ledger, and retained original areas in every drift step.
- Existing checks in that suite also passed for the eight IX terminal scenarios, resets, keyboard interaction, mobile overflow and identifier integrity, all 18 existing composition links, three gate presets, internal routes and no-JavaScript reading.
- Desktop and mobile screenshots were inspected, including the new final-verdict section. The static worked example and all six verdicts remain available without JavaScript.
- All 18 pre-existing method profile files are byte-identical to the reviewed `00f3010` head. No existing solution matrix, evaluator, workflow or Blueprint implementation is changed by this correction.
- Eight explicit paths form this correction: the two profiles, their two lab scripts, their two README files, this receipt and the CBE test suite. No raw source prompt is added.
- The standalone `5pp-gate` was not run. Prior successful CI belongs to its recorded head; the corrected head must have its own CI result before using CI as evidence for this revision.

### Consuming-project source maps

The consuming adapter's source register and Cicerone documents are separate from this website PR. Register the supplied `09-Capability-Boundary-Expander-AI-Execution-Prompt.md` as the base CBE source where that is the incoming filename, after verifying its bytes against the base source hash. A numeric upload prefix is a locator alias, not a different method. CBE routes to the base prompt; CBE-IX routes to the iterative-exhaustion prompt.

Compare the actual target document before applying any earlier Cicerone patch. The article context inspected in this pass contains a general map labeled v1.0 and a distinct LinkedIn-focused map labeled v1.1. Neither proves the version of a separate project's map. A v1.0-to-v1.0.1 patch must not replace a v1.1 document wholesale. Preserve its unrelated routes and reconcile the two CBE entries against its current contents. No consuming-project attachment or adapter register was overwritten in this correction.
