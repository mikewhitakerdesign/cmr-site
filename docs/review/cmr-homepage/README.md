# CMR homepage — review evidence

Captured 2026-11-08 from the production build (`npm run build && next start`)
on branch `feat/cmr-homepage`, Chromium, 1× device pixel ratio, after all lazy
images loaded. Figma references are read-only renders of the CMR file
(`hLEeAchFtgd1WFtboIChil`): Home / Desktop `1:10` (1732 wide), Tablet `1:451`,
Mobile `1:884`.

| File | What it shows |
|---|---|
| `build-393.jpg`, `build-768.jpg`, `build-1440.jpg`, `build-1732.jpg` | Full page at the Figma frame widths (1440 = the desktop frame's 1400 container state; 1732 = the Figma frame width) |
| `build-1024.jpg`, `build-1280.jpg` | Full page at intermediate widths with no Figma frame (desktop layout, fluid type) |
| `figma-vs-build-393.jpg`, `-768.jpg`, `-1732.jpg` | Three panels: **Figma** · **build** · 50% overlay (Figma under build). Downscaled for size |

How to read the overlays:

- **Expected differences** are listed with reasons in
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
