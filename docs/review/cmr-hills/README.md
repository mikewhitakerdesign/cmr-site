# Chicago Hills: review evidence

Screenshots of the production build (`next build && next start`, Chromium,
macOS, 1× DPR, full page), refinement pass of PR #4, taken 2026-11-09. See
`.aiom/work/implement-cmr-chicago-hills.md` ("Refinement pass") for the record.

| File | What |
|---|---|
| `build-hills-{393,768,1440}.jpg` | `/hills` directory: "Chicago H̶i̶l̶l̶s̶ / Mountains", unnumbered rows, Grass/dirt, Weekly with CMR, Just show up. |
| `build-cricket-hill-{393,768,1440}.jpg` | Cricket Hill: contour hero, breadcrumb below, lede alone, repeat circles with counts and miles, static map, More hills on repeat. |
| `build-warren-hill-{393,768,1440}.jpg` | Warren Hill: no mapped route (TBD circles), no weekly run |
| `build-horner-hill-{393,768,1440}.jpg` | Horner Hill: TBD circles, a weekly run |
| `build-home-{393,768,1440}.jpg` | Homepage, full page |
| `home-flat-{393,768,1440}.jpg` | "Flat is a state of mind" with the moving grey contours (one frame) |
| `home-footer-{393,768,1440}.jpg` | Footer: newsletter left, wordmark right (stacked on mobile) |
| `home-club-totals-…`, `home-see-you-on-the-hill-…`, `home-get-high-…` | The two resized headings beside the reference size |
| `motion-hill-hero-frames.jpg`, `motion-flat-frames.jpg` | Three frames, 2 s apart, showing the contour motion |

768 images are scaled to 75% and 1440 images to 50%. Screenshots catch the
animation mid-motion; the visual baselines (`tests/e2e/*-snapshots/`, macOS,
`npm run test:visual`) use reduced motion, which renders one fixed frame. The
floating "Questions?" button is the site-wide widget. The milestone's
Figma-vs-build comparisons are in git history (`8ba945e`); this pass
deliberately departs from those frames.
