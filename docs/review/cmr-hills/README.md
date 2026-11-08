# Chicago Hills: review evidence

Screenshots of the production build (`next build && next start`, Chromium,
macOS, 1× DPR, full page) taken 2026-11-08 for the Chicago Hills milestone.
See `.aiom/work/implement-cmr-chicago-hills.md` for the record.

| File | What |
|---|---|
| `build-hills-{393,768,1440}.jpg` | `/hills` directory (no Figma frame; composed) |
| `build-cricket-hill-{393,768,1440}.jpg` | Cricket Hill: photo hero, recorded surface, a CMR run |
| `build-warren-hill-{393,768,1440}.jpg` | Warren Hill: drawn hero, illustrative profile, no run |
| `build-horner-hill-{393,768,1440}.jpg` | Horner Hill: drawn hero, measured profile, a CMR run |
| `figma-vs-build-cricket-hill-{393,768,1732}.jpg` | Figma Hill Details (Mobile 1:7032, Tablet 1:6703, Desktop 1:6363) beside the build at the same width |

1440 images are scaled to 50%; the 768 comparison to 75% and the 1732 one to
50%. The floating "Questions?" button is the site-wide widget from the
homepage work, not part of these pages.

Visual regression baselines (macOS, `npm run test:visual`) live in
`tests/e2e/hills.spec.ts-snapshots/`.
