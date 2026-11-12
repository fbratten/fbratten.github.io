# Music & Film integration (2026-11-12)

The current collection is `creative/index.html`, with six permanent work routes.
The original review preview and its two source attachments are preserved unchanged
below this integration. See [integration and verification](../docs/music-film-integration-20261112.md)
and [media evidence](../docs/music-film-media-evidence-20261112.json).

Edit `creative/source/works.json` and `creative/source/home.html.txt`, then run:

```sh
python scripts/build_creative.py
python scripts/build_creative.py --check
python tests/creative_contract.py
python tests/navigation_contract.py
```

The generator also refreshes shared navigation, the directory and sitemap.
`creative/players.js` loads Suno or YouTube only after a visitor chooses a player.
Original cover bytes are kept locally; external provider links remain usable
without JavaScript. The release step applies a limited media policy to `creative/`.

The historical notes below describe PR #58, not the integrated route's current status.

---

# Music and film portfolio: review preview

This branch preserves the working MUZAK content and layout preview for Fredrik
Brattén's existing GitHub Pages portfolio. It is a review draft, not the final
production implementation. The current homepage, navigation and deployed site
are unchanged.

## Review

Open [preview.html](preview.html) in a browser. It is self-contained, including
the recovered original Hud mot hud WAV and Python source. External Suno links
need an internet connection. YouTube players are created only on click.

The six work views are Hud mot hud, Take 'em All, Same Wet Reeds, Low Orbit,
High Standards, Why Was Love, and Rise Together Or We Fall. A separate Superposition
example explores teaching through music. The composition section includes the
operator-supplied Awaken Wired intro and its five-phase overview.

Fredrik Brattén is the overall author; Ragnar Bratten appears as the artist name
beside relevant music works. Abstract cover treatments are labelled as layout
studies, not release artwork.

## Research corrections incorporated on 8 November 2026

The preview and its editorial source register now incorporate
[MUZAK-B02-RESULT-01](https://github.com/fbratten/github-agent-collaboration/issues/242#issuecomment-6674948149)
and the [lead review](https://github.com/fbratten/github-agent-collaboration/issues/242#issuecomment-6726441846):

- Hud mot hud: at least 38 Extend rows in the wider library inventory, with
  seed linkage established only for the initial 20 saved records. The 17
  preserve-the-pocket entries are style tags, not confirmed lyrics variants.
  The Studio export's exact parent remains unknown; the nearby V6 is a candidate.
- Same Wet Reeds: the annotated no-drums arrangement belongs to `099f8a5e`,
  track 16 in the stems manifest is `71513c74`, and the selected public Studio
  export is `b7a89df3`. The connections between them remain inferences. The 19
  earlier style entries do not establish 19 lyrics prompts.
- Low Orbit: export text confirms words and sequence, while voice assignment
  and the execution of the interruption still require listening.
- Take 'em All: the Apple Music artist and EP catalogues were read directly on
  8 November. They establish Foreign Sky - EP, 19 December 2025, and the Apple
  label credit Adaptivearts Records. Spotify and track-order details remain
  attributed to the peer report. Exact released Mixea-master bytes are missing.

The review view links each version ID and separates observations, reported
metadata and inference. No new audio listening check is claimed.

## Original source material

- [hud_mot_hud_seed.py](source/hud_mot_hud_seed.py): recovered original, unchanged.
- [awaken-wired-intro.txt](source/awaken-wired-intro.txt): complete example supplied
  directly by Fredrik, retaining original wording and notation.
- The original WAV is embedded without re-encoding and downloadable from the
  Hud mot hud page: 557,052 frames, 44,100 Hz, mono, 16-bit PCM,
  12.63156462585034 seconds.

The recovered Python produced a byte-identical WAV in an isolated verification
directory. This verifies seed reproducibility, not the exact Suno render chosen
for the later Studio export or how an instrument sounds in the finished song.

| Artifact | SHA-256 |
| --- | --- |
| preview.html | 4e4405f5445dde2b44202e651b2c995cff9289b71934b40baba805151f943982 |
| Embedded original WAV | 398ba5d67cc256f9b873012a04b9f21c184b723a8b6115a9a7576c99488e6cda |
| source/hud_mot_hud_seed.py | dc0289ffa36650214e205cc93319e6e729acbf9de75c5062d12d7b2485e87a8c |
| source/awaken-wired-intro.txt | 13bdbd5ec3429c18f62349b157f8c1fc1d5b65b6809b5067fd32fe240dd1c399 |

## Validation and open work

The 8 November correction revision passed the repository navigation contract,
site copy/canvas regression check, Build Log contract, JavaScript syntax check
and `git diff --check`. Browser checks confirmed the four changed work routes
and their corrected text, plus the rendered version/source table. Hash comparison
confirmed the embedded WAV, embedded Python and both source files are unchanged.
The Pages browser workflow does not include `creative/**` in its PR path filter;
these local checks do not imply a GitHub Actions run for this change.

The initial preview revision was checked in a browser for all six work routes,
collection navigation, expandable code and teaching notes, the seed anchor and
seed playback (readyState 4, advancing time, no media error). YouTube iframe
creation was checked; external video playback was not verified. Responsive CSS
is included; a separate mobile viewport run remains open.

Before production integration:

- Confirm final audio/video versions, credits, original covers and remaining
  YouTube representations. RISE's partial video pilot is separate from Official Audio.
- Pair process excerpts with the chosen recording before claiming the rendered
  music follows particular instructions. The Awaken intro is a composition plan.
- Replace hash-based preview views with built HTML at stable /creative/ routes.
  Integrate shared navigation, breadcrumbs, directory and sitemap using the
  existing repository renderer.
- Separate public copy from internal review notes and choose the production
  media-asset layout instead of embedding the full preview format.
- Complete mobile and embedded-media checks on that production revision.

Source claims distinguish direct instructions, original bytes, reported metadata
and inference. The HTML's review view contains the detailed source register.
Coordination is recorded in [GAC #242](https://github.com/fbratten/github-agent-collaboration/issues/242).
No merge or public deployment is part of preserving this draft on its branch.
