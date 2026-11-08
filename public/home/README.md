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
| `hero-desktop.jpg` | Image fill on Hero 1:377 (desktop) — kept unmodified at `scripts/assets/source/hero-desktop-figma.jpg` (768×1024) | → 1536×2048 JPEG q90 | **Round 2: restrained 2× Lanczos-3 upscale + light unsharp mask** (`scripts/assets/upscale-hero-desktop.mjs`). Nothing generated; fine texture stays as soft as the source. Served at optimizer quality 90 | **Provisional.** See "Original hero photograph" below. Needs a proper edit at full resolution and confirmed rights before launch. |
| `hero.jpg` | Image fill on Hero 78:279 / 78:397 (tablet, mobile) | 768×1024 PNG → JPEG q90 | Re-encode only | Provisional; same photo, different frame. Rights unconfirmed. |
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
  angle (steepest side turned to the right, as in the reference), easing the
  ground to the base near the island edge, and vertical exaggeration (each
  hill's rise is drawn the same height; factors 7–19×, recorded per hill).
- **Warren Hill is interpretive**: no distinct hill could be located in the data
  around Warren Park, so its shape is illustrative and it shows no figures.

| Hill | Summit | Base | Rise | Data notes |
|---|---|---|---|---|
| Cricket Hill | ≈ 620 ft | ≈ 590 ft | ≈ 30 ft | OSM node 1474219292 (natural=hill) |
| Warren Hill | — | — | — | Not located in the data; illustrative shape |
| Horner Hill | ≈ 615 ft | ≈ 595 ft | ≈ 20 ft | Mound at the north end of Horner Park, beside the river |
| Schiller Hill | ≈ 645 ft | ≈ 630 ft | ≈ 15 ft | Steep mound beside the Schiller Woods pond; small at this resolution |
| Mt. Trashmore | ≈ 670 ft | ≈ 605 ft | ≈ 60 ft | OSM "Mount Trashmore" peak. The approved art printed 669 / 604 / 65 ft (+ prominence 85 ft, not checkable here) |

## Original hero photograph (Round 2 investigation)

The approved hero fill is the Cricket Hill photograph also found, larger, in the
Owner's local files (`cricket-hill.jpg`: a 1673×964 photo inside a white mat;
dated 2026-08-31). Same trees, runner and track. But the approved image is not
just that photo scaled: the hill was reshaped into a steeper, peak-like crest
(the "make your own mountains" joke), the track bends further down-left, the
sky was extended upward and the color graded. Rebuilding the composition from
the original would lose that edit, so Round 2 ships the restrained upscale above
instead. Recommended: re-do the approved edit on the original at full
resolution (≥ 3464 px wide for 2× displays), then replace `hero-desktop.jpg`
and `hero.jpg`.

Icons (clock, map pin, arrows) are inline SVG in `src/components/icons.tsx`,
paths copied verbatim from the Figma exports.

## Regenerating

- Mesh gradient: `node scripts/assets/bake-mesh-gradient.mjs public/home/mesh-gradient.png 256`
- Desktop hero: `node scripts/assets/upscale-hero-desktop.mjs`
- Topography: `node scripts/assets/vectorize-topo.mjs`
- Hill profiles: `node scripts/assets/terrain/render-profiles.mjs` (offline, from
  the committed grids); `fetch-terrain.mjs` first to refresh the data
- Photos: re-export the fills listed above from Figma and apply the same
  transformation. Scripts use `sharp` from Next's install (not a direct dependency).
