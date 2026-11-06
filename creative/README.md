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
| preview.html | 95783e376f40517788006e82045170a656347ef2a7f3ba4a0bb51cf2b316848b |
| Embedded original WAV | 398ba5d67cc256f9b873012a04b9f21c184b723a8b6115a9a7576c99488e6cda |
| source/hud_mot_hud_seed.py | dc0289ffa36650214e205cc93319e6e729acbf9de75c5062d12d7b2485e87a8c |
| source/awaken-wired-intro.txt | 13bdbd5ec3429c18f62349b157f8c1fc1d5b65b6809b5067fd32fe240dd1c399 |

## Validation and open work

The exact preview bytes were checked in a browser for all six work routes,
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
