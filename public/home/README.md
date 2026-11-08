# Homepage assets — provenance

Raster assets come from the approved CMR Figma file (`hLEeAchFtgd1WFtboIChil`,
"Chicago-MTN-RNNRS"), exported read-only through the Figma MCP integration on
2026-11-07. Round 2 (2026-11-08) added vector artwork derived from those
exports and from public elevation data, as listed below. No stock, generated
or redrawn imagery. **Rights and final resolution for every photograph and
artwork are unconfirmed and are release dependencies** (see
`.aiom/work/implement-cmr-homepage.md`).

| File | Source | Native → committed | Transformation | Status |
|---|---|---|---|---|
| `hero.jpg` | **Round 2.1: the Owner's original photograph** (Cricket Hill, runner on the crest), supplied 2026-11-08 and kept at `scripts/assets/source/hero-original.jpg` (1920×2560). Used for every breakpoint | → 1920×1900 JPEG q84 (≈ 250 KB) | `scripts/assets/build-hero.mjs`: crop the top 1900 of 2560 rows (full width), then a light grade toward the approved look (saturation ×1.5, gamma 1.2). **No stretching, resampling, sharpening or generation.** Per-breakpoint crops are CSS `object-position` | **Provisional on rights only** (resolution is the best available: 1920 px, so ~0.75× on a 1440 screen, ~1.0× at 1920, soft only on 2× displays above ~960 CSS px). Rights unconfirmed. |
| `just-show-up.jpg` | Image fill on Just show up 1:296 / 78:348 / 78:466 | 4096×3076 PNG (≈10 MB) → 2880×2163 JPEG q82 (≈1 MB) | Downscale + re-encode | Resolution sufficient. Rights unconfirmed. |
| `mesh-gradient.png` | Authored "Mesh gradient" ShaderFill on 1:377 and 1:296 (same 16 control points) | Procedural → 256×256 PNG | Baked from the shader's own math by `scripts/assets/bake-mesh-gradient.mjs` | Final (Figma-authored). |
| `community-mark.png` | Image fill on 23:103 / 78:292 / 78:410 ("CMR profile mark", 4096×4096) | → 373×1540 PNG with alpha | Cropped to the window Figma frames, rotated −90° as Figma does, downscaled | Rights/source vector unconfirmed. |
| `topo.svg` | Image fill on Flat is a state of mind 1:376 / 78:355 / 78:473 — kept at `scripts/assets/source/topo-pattern-figma.png` (1024²) | → 141 vector paths, 173 KB (≈ 60 KB gzipped) | **Round 2: traced to centerlines** (`scripts/assets/vectorize-topo.mjs`: threshold, Zhang–Suen thinning, line following, RDP, Catmull–Rom). Same lines as the approved art, resolution-independent; drawn at a constant 1.5px in 20% foreground | Provenance of the original pattern unconfirmed. |

## Hill profiles (`public/hills/*-profile.svg`, Round 2)

Five vector terrain illustrations in one style, modelled on the approved Mt.
Trashmore artwork (kept as a style reference at
`scripts/assets/source/mt-trashmore-profile-figma.png`; no longer shown).

- **Shape and figures** come from elevation data: AWS Open Data Terrain Tiles
  (Terrarium, zoom 15, ≈3.5 m/px), which in the US are built from USGS 3DEP.
  Hill locations: OpenStreetMap/Nominatim. Sampled grids are committed at
  `scripts/assets/source/terrain/*.json`; `scripts/assets/terrain/fetch-terrain.mjs`
  refreshes them, `render-profiles.mjs` draws the SVGs and writes
  `src/lib/hill-profiles.generated.ts`.
- **Figures** (summit, base, rise) are approximate: rounded to 5 ft and shown with
  "≈". Rise = summit minus the median ground elevation just outside the hill's
  foot. **Prominence is not computed and not shown.**
- **Interpretation** (not measurement): the island outline and slab, the viewing
  angle (from the south, tilted, the same for every hill), easing the ground
  to the base near the island edge, heavy smoothing (10% of the hill's width),
  12 equal contour bands (no contour interval is claimed), and vertical
  exaggeration (drawn rise = 55 + 75·√(rise/60) px: a gentle compression, factors
  1.2–3.8×, recorded per hill).
- **Warren Hill is interpretive**: no distinct hill could be located in the data
  around Warren Park, so its shape is illustrative and it shows no figures.

| Hill | Summit | Base | Rise | Data notes |
|---|---|---|---|---|
| Cricket Hill | ≈ 620 ft | ≈ 590 ft | ≈ 30 ft | OSM node 1474219292 (natural=hill) |
| Warren Hill | — | — | — | Not located in the data; illustrative shape |
| Horner Hill | ≈ 615 ft | ≈ 595 ft | ≈ 20 ft | Mound at the north end of Horner Park, beside the river |
| Schiller Hill | ≈ 645 ft | ≈ 630 ft | ≈ 15 ft | Steep mound beside the Schiller Woods pond; small at this resolution |
| Mt. Trashmore | ≈ 670 ft | ≈ 605 ft | ≈ 60 ft | OSM "Mount Trashmore" peak. The approved art printed 669 / 604 / 65 ft (+ prominence 85 ft, not checkable here) |

## Hero photograph (Round 2.1)

The Owner supplied the original photograph (1920×2560, Cricket Hill, runner on
the crest) on 2026-11-08; it is the hero source for every breakpoint.

**What the approved Figma frame is** (corrects the Round 2 note, which guessed
from a different, wider file): the same photograph with the hill **stretched
vertically** (the crest and track read steeper), extra sky added above, and a
more saturated grade. Runner, trees and track are identical. Rather than
distorting the photo, the code **crops** it at its real proportions:

- crop: top 1900 rows at full width (the crest is ≈ 74% down the file);
- grade: saturation ×1.5 and gamma 1.2, chosen by eye against the approved frame
  from three candidates (the approved sky is bluer, saturation ≈ 0.23 vs 0.14,
  and its grass brighter and more saturated, ≈ 0.96 vs 0.65);
- per-breakpoint framing by `object-position` (50% 0% below 1024 px, 50% 77%
  from 1024 px, which puts the crest ≈ 72% down the hero on desktop, as in Figma).

The hill is visibly **gentler** than in Figma, because the stretch was not
reproduced. Resolution is limited by the file itself (1920 px wide). For sharper
2× displays, a larger master is needed. The approved Figma raster is kept as a
reference at `scripts/assets/source/hero-figma-approved.jpg`.

Icons (clock, map pin, arrows) are inline SVG in `src/components/icons.tsx`,
paths copied verbatim from the Figma exports.

## Regenerating

- Mesh gradient: `node scripts/assets/bake-mesh-gradient.mjs public/home/mesh-gradient.png 256`
- Hero: `node scripts/assets/build-hero.mjs` (add `--plain` for the ungraded crop)
- Topography: `node scripts/assets/vectorize-topo.mjs`
- Hill profiles: `node scripts/assets/terrain/render-profiles.mjs` (offline, from
  the committed grids); `fetch-terrain.mjs` first to refresh the data
- Photos: re-export the fills listed above from Figma and apply the same
  transformation. Scripts use `sharp` from Next's install (not a direct dependency).
