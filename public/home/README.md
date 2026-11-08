# Homepage assets — provenance

Every file here comes from the approved CMR Figma file (`hLEeAchFtgd1WFtboIChil`,
"Chicago-MTN-RNNRS"), exported read-only through the Figma MCP integration on
2026-11-07. No stock, generated, or redrawn imagery. **Rights and final
resolution for every photograph and artwork are unconfirmed and are release
dependencies** (see `.aiom/work/implement-cmr-homepage.md`).

| File | Figma source | Native → committed | Transformation | Status |
|---|---|---|---|---|
| `hero-desktop.jpg` | Image fill on Hero 1:377 (desktop) | 768×1024 PNG → 768×1024 JPEG q90 | Re-encode only | **Provisional.** Too small for desktop (Figma stretches it to 1732×968). Needs the original photograph (≥ 3464 px wide) and confirmed rights before launch. |
| `hero.jpg` | Image fill on Hero 78:279 / 78:397 (tablet, mobile) | 768×1024 PNG → JPEG q90 | Re-encode only | Provisional; same photo session, different frame. Rights unconfirmed. |
| `just-show-up.jpg` | Image fill on Just show up 1:296 / 78:348 / 78:466 | 4096×3076 PNG (≈10 MB) → 2880×2163 JPEG q82 (≈1 MB) | Downscale + re-encode | Resolution sufficient. Rights unconfirmed. |
| `mesh-gradient.png` | Authored "Mesh gradient" ShaderFill on 1:377 and 1:296 (same 16 control points) | Procedural → 256×256 PNG | Baked from the shader's own math by `scripts/assets/bake-mesh-gradient.mjs` (deterministic; re-run to regenerate) | Final (no rights issue; Figma-authored). |
| `community-mark.png` | Image fill on 23:103 / 78:292 / 78:410 ("CMR profile mark", 4096×4096) | → 373×1540 PNG with alpha | Cropped to exactly the window Figma frames (rows 17.6–41.8%), rotated −90° as Figma does, downscaled | Rights/source vector unconfirmed; a vector original is preferred if one exists. |
| `mt-trashmore-profile.png` | Image fill on 31:16 / 78:327 / 78:445 | 1448×1086 PNG | Lossless recompression only | **Printed figures (base 604 ft, summit 669 ft, rise 65 ft, prominence 85 ft) are unverified**; prominence exceeding rise needs a factual check. Provenance unconfirmed. |
| `topo-pattern.png` | Image fill on Flat is a state of mind 1:376 / 78:355 / 78:473 | 1024×1024 PNG | Lossless recompression only. The export already contains Figma's 20% layer opacity (black at alpha 51) | Upscaled ~1.7× on desktop; a vector or higher-resolution original is preferred. Provenance unconfirmed. |

Icons (clock, map pin, arrows) are inline SVG in `src/components/icons.tsx`,
paths copied verbatim from the Figma exports.

## Regenerating

- Mesh gradient: `node scripts/assets/bake-mesh-gradient.mjs public/home/mesh-gradient.png 256`
- Photos and artwork: re-export the fills listed above from Figma and apply the
  same transformation. The one-off conversion used `sharp` from the existing
  install (not a project dependency).
