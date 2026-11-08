# CMR homepage — review evidence

Captured 2026-11-08 (updated after the PR #3 accessibility refinement) from the production build (`npm run build && next start`)
on branch `feat/cmr-homepage`, Chromium, 1× device pixel ratio, after all lazy
images loaded. Figma references are read-only renders of the CMR file
(`hLEeAchFtgd1WFtboIChil`): Home / Desktop `1:10` (1732 wide), Tablet `1:451`,
Mobile `1:884`.

| File | What it shows |
|---|---|
| `build-393.jpg`, `build-768.jpg`, `build-1440.jpg`, `build-1732.jpg` | Full page at the Figma frame widths (1440 = the desktop frame's 1400 container state; 1732 = the Figma frame width) |
| `build-1024.jpg`, `build-1280.jpg` | Full page at intermediate widths with no Figma frame (desktop layout, fluid type) |
| `figma-vs-build-393.jpg`, `-768.jpg`, `-1732.jpg` | Three panels: **Figma** · **build** · 50% overlay (Figma under build). Downscaled for size |
| `hero-before-after-1732.jpg`, `-768.jpg`, `-393.jpg` | Hero accessibility refinement: **Figma** · **before** (PR #3 at `8fcb524`: 60% headline, halo) · **after** (75% headline over a shade confined to the headline band) |
| `jsu-before-after-1732.jpg`, `-768.jpg`, `-393.jpg` | Just show up: **Figma** · **before** (30% shade, 90% copy) · **after** (38% shade, 100% copy) |

The "before" panels are the current build with the previous CSS restored
(headline 60% opacity with the 0.12em halo and no band; 30% shade with 90%
copy), captured at the same widths.

How to read the overlays:

- **Accessibility-driven deviations** (contrast over photography, each measured
  with `tests/e2e/contrast.mjs`): the hero headline at 75% over a shade behind
  the headline band, the outline CTAs' 50% black fill, and the Just show up 38%
  shade with full-white copy. These are the darker areas you will see compared
  with Figma.
- **Design decisions accepted in review** (not accessibility): uniform photo
  crop, em-based tracking, container alignment, featured Mt. Trashmore row,
  Explore all hills and card icons on tablet and mobile, provisional markers.
- **Other expected differences** are listed with reasons in
  `.aiom/work/implement-cmr-homepage.md` ("Design-to-code deviations"): the
  provisional-content markers (which also push later sections down on tablet and
  mobile), the omitted Apparel nav item, the footer's newsletter form (clipped in
  the Figma desktop frame), em-based display tracking, the hero photo cropped
  rather than stretched, container alignment fixes, and the legibility
  adjustments over photographs.
- **Run times and order** depend on when the page was built ("NOV 14" appears
  when a run is a week out); Figma shows a fixed sample week.
- Overlays are visual evidence, not proof of pixel-perfect fidelity. Geometry
  that is asserted lives in `tests/e2e/home.spec.ts`.
