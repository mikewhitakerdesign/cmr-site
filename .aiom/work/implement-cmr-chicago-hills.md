---
seed_version: '0.1'
id: implement-cmr-chicago-hills
title: Implement the CMR Chicago Hills directory and hill detail pages
objective: >-
  Replace the /hills and /hills/[slug] scaffolds with the Chicago Hills
  experience: a directory of the five hills and a detail page for each (Cricket
  Hill, Warren Hill, Horner Hill, Schiller Hill, Mt. Trashmore), built from the
  approved Hill Details frames (Figma 1:6363 / 1:6703 / 1:7032), the merged
  MWDS foundation, shared UI and HillProfile illustrations, with geographic,
  approximate, illustrative and provisional information kept visibly distinct.
status: active
stage: implementation
active_capability: ui-implementation
bundle_references:
  - repository-versioned-delivery
  - software-engineering
  - web-ui-experience
  - content-publication
authority_requirement: none
validation_state: passed
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-08T23:30:00.000Z'
updated_at: '2026-11-09T12:00:00.000Z'
---
## Status

**Implemented, then refined at the Owner's direction (refinement pass, below), on
branch `feat/cmr-chicago-hills` (from `origin/main` at `776cafc`); PR #4 open for
one coordinated Owner/GPT review. Not merged; nothing deployed to production
(Vercel Preview only).** `validation_state: passed` covers the deterministic checks
listed under Validation; the visual and content judgments are Owner decisions, not
mechanical passes. See "Delivery" for the PR, head commits, CI runs and Preview.

Sections below "Refinement pass" record the first milestone delivery as it was;
where the refinement pass changed something, the refinement section governs.

## Final mobile, motion and content refinements (Owner direction, 2026-11-09)

Brief "CMR: PR #4 Final Mobile, Motion & Content Refinements", from the Owner's
review of the live Preview. Same constraints: no merge, no deploy, Join
untouched, approved heroes, directory, calculations and maps unchanged.

| # | Item | What changed |
|---|---|---|
| M1 | Mobile header (`Header`, `HeaderShell`) | Below 768: top row (logo + "Join the club", 64px), a 1px rule, then the link row. Links 15px (was 13); each link is its whole cell, 48px tall, cells sharing the full width (`flex-auto`, so a fourth link, "The Science", fits by adding it to `primaryNav`). Scrolling down past the top row slides it away (`data-hide-top`, a transform on the bar) and the link row stays pinned; scrolling up (more than 6px) brings it back; focus on the logo or CTA brings it back. The header's layout box keeps 114px, so content never shifts or jumps. Reduced motion: no slide. Tablet and desktop unchanged (no compact shrink on mobile; the slide replaces it) |
| M2 | Mobile hero headline | Fills the content width: `(100vw − 48px) / 6.24` (each line ≈ 6.1em; 44px at 320, 55px at 393, 61px at 430), lines never wrap. The 2% margin covers Linux's slightly wider rendering: at `/ 6.12` "MAKE YOUR" wrapped at 320 on the CI runner (run 42589462068) |
| M3 | Mobile hero CTAs | Stacked, full width: Find a Run, then Join the club; colours and hovers unchanged |
| M4 | Next-run card | 8px radius at every size; mobile: at the bottom of the hero, hanging 96px into the white page (hero `mb-24` holds the space; 64px before the statement); a static contour pattern inside at every size (TopoPattern, `--cmr-contour-on-dark` at 45%, ≈ #262626 on black; no canvas) |
| M5 | Mobile club totals | The grid bleeds 12px into the margins, gap 24 both ways: circles ≈ 136 / 159 / 172 / 191 at 320 / 375 / 393 / 430 (were ≤ 162, 126 at 320); labels on one line (no wrap, 4% padding) |
| M6 | Moon sequence | `Odometer` gained a `done` phase and `after`: the moon distance waits until all four totals have finished rolling AND it is itself 40% on screen, then spins down once (1,261,154,400 → 1,261,022,400). Visible at load: still. Reduced motion: still. Screen readers: the final figure |
| M7 | Moon typography | Only "1,261,022,400" is bold and 1.15×; " feet away." is ordinary text |
| M8 | Footer wordmark | A real link, `href="#top"` (works without JS), named "Chicago Mountain Runners, back to top"; JS scrolls smoothly (instant under reduced motion), keeps the URL clean and moves focus to the skip link. The wordmark inside is decorative (the link carries the name); look unchanged |
| M9 | Warren / Schiller copy | Owner's paragraphs, verbatim; headings, sources (Warren: Chicago Park District; Schiller: none) and `provisional` status unchanged. No other hill copy changed |
| M10 | "Find what you've been looking for." | Heading, address, actions and note in the left half; the map in the right half, centred vertically against them. Desktop heading on exactly three lines ("Find what / you've been / looking for."); natural wrapping on tablet (two columns kept) and phones (stacked, map last). Copy, map, pin, attribution, zoom and links unchanged. All five pages |

Validation (2026-11-09, macOS, Chromium): lint, `tsc`, `tokens:check`, build
pass; Vitest **279 pass** (new: hide-top logic, four-link mobile row, Odometer
`done` and `after` sequencing, moon typography, footer link, Owner copy);
Playwright **249 pass, 10 skipped** (new: real-wheel scrolling hides and restores
the mobile top row with no layout change or jump, focus restores it, never on
tablet/desktop, no slide under reduced motion; mobile header geometry (114px,
48px cells, full width, 15px); hero headline fills 320 / 375 / 393 / 430 without
overflow; stacked full-width CTAs; card radius, pattern, 96px overhang, ≥ 48px
before the statement; mobile circles equal, 22–32px apart, bigger, labels one
line inside; moon waits for all four totals and for visibility, runs once,
only the number bold; back-to-top scrolls to 0, clean URL, focus at the skip
link, instant under reduced motion; Find layout on all five pages, three lines
on desktop); visual **21 pass**, 10 baselines updated (mobile header, mobile
homepage, mobile footer focus, /hills mobile, Cricket and Warren at three
widths), stable on re-run. Evidence in `docs/review/cmr-hills/`.

CI note: run 42589462068 (`9f70447`) failed two tests on Linux at 320px: the
headline wrap above, and the homepage photo-text contrast sweep measuring the
now full-width "Find a Run" while the pointer rested on it (hover inverts its
colours mid-transition). The sweep now parks the pointer before each
measurement; thresholds unchanged.

Delivery: commits `2a8885d` (implementation), `9f70447` (tests, baselines,
evidence, record), `c770b6c` (CI fix). Verified head **`c770b6c`**: GitHub CI
`validate` and `browser` pass (run 42590502376); Vercel Preview rebuilt from it
(branch URL under Delivery, SSO-protected). PR #4 description updated. Not
merged; no production deployment.

## Final refinement pass (Owner direction, 2026-11-09)

Brief "CMR: Final refinement pass for PR #4", plus two clarifications from the
Owner (route language, shared hover layer, body-text color). Same constraints:
no merge, no deploy, Join untouched, static OpenStreetMap maps and the Cricket
Hill calculation kept.

| # | Item | What changed |
|---|---|---|
| F1 | Footer ink | `--cmr-quiet-ink` is now 80% neutrals 500 + 20% neutrals 600 (≈ #6c6c6c): 4.8:1 on #f5f5f5, "only barely accessible" (was neutrals 700, 9.4:1). Neutrals 500 alone is 4.4:1, under AA. The placeholder now uses the full ink (80% of it would fail). Layout unchanged |
| F2 | Motion timing | `ContourField` default speed 0.045 → 0.036 (20% slower) for the hill heroes and "Flat is a state of mind". Reduced motion and the software-renderer still frame unchanged |
| F3 | Body-text color | One name, `BODY_TEXT_COLOR` (src/lib/headings.ts) = the approved Cricket Hill description's color (70% black, ≈ #4d4d4d, 8.4:1). Used by that description, the homepage "Get high in the city." copy and the /hills intro, so they are identical by construction. Not applied site-wide |
| F4 | Moon line | Under the club totals: an outlined rocket (Lucide geometry, ISC; not in Figma) and h3 "We're going to the moon!", then "Join the club and help us get there. We're only **1,261,022,400 feet away**." (bold, 1.15×). The distance counts down, odometer style, from 1,261,154,400 ft (238,855 mi, the average distance from Earth to the Moon) to 1,261,022,400 ft: exactly the 132K ft "Vertical climbed". Static data (`clubTotals.moon`); no Strava logic |
| F5 | Totals animation | `Odometer`: rolls a little slower (first digit 1.5 s, was 1.1 s; +200 ms per digit). New `from` (count down: each changed digit starts a turn above and spins down; others stay) and `watch="section"` (start with the section, 25% visible), used by the four figures and the moon distance so they roll together, once per page load. Reduced motion: final values, no motion. Assistive tech reads the final figure |
| F6 | Em dashes | None left in visible copy or metadata in this PR's pages: titles use "Name \| Chicago Mountain Runners"; About scaffold, Questions widget ("Thanks, your question is on its way."), the Cricket run description and the placeholder hill rewritten with commas or full stops. **Not changed:** `src/app/join/page.tsx` (paused Join, off limits) still has two |
| F7 | Copy | Warren and Schiller no longer mention "the drawing on this page" (that section was removed); Horner "Not tall. Not nothing." → "It isn't tall, but it isn't nothing either."; Mt. Trashmore "This one's is municipal waste." → "This one's happens to be municipal waste." The route sentence ("…based on specific routes mapped by CMR. The Cricket Hill route is .2 miles up and down.") is the Owner's approved language, unchanged and now asserted verbatim: the Owner, CMR's founder, mapped the route |
| F8 | /hills | Provisional tag and "Hill details are unconfirmed. Rise figures are approximate." removed (rows keep `data-status="provisional"`). Drawing thumbnails removed; desktop columns rebalanced to 5 : 2 : 2 : 3 + ↗ |
| F9 | Row hover | The grey fill is replaced by **one shared** WebGL contour layer behind the list (`DirectoryHoverField`), revealed only through the active row with `clip-path: inset(…)` that glides between rows; fades in and out. Created on the first hover or keyboard focus; paused (no frames drawn) whenever no row is active; one canvas no matter how many rows are hovered. Lighter than the homepage: the same grey lines at 60% opacity, smaller landforms. Reduced motion: still frame, no glide or fade. Software WebGL: still frame. Decorative (aria-hidden, no pointer events); link, underline, ↗ nudge and focus ring unchanged. `ContourField` gained `paused` |
| F10 | Hill hero | 25% shorter: 405 / 523 / 633 (was 540 / 697 / 844). Name size, contrast and the contour background unchanged |
| F11 | "How tall is it?" | One column: support copy widened to 620 (the measure of the run line and the footer sentence); the four circles on one row beneath it, spread edge to edge at the club-totals sizes (280 desktop, 150 tablet), 2 × 2 on phones |
| F12 | Map | Eases in 6% over 1 s on hover, about the centre so the pin stays on the place; none under reduced motion |

Validation (2026-11-09, macOS, Chromium): lint, `tsc`, `tokens:check`, build
pass; Vitest **270 pass**; Playwright **231 pass, 12 skipped** (new: shared
hover layer, one canvas, clip follows the row, paused when hidden, focus
reveals it; whole-row click away from the name; no drawings or provisional
markers; body-text color identical across the three paragraphs; route sentence
verbatim; one-row circles spread edge to edge; hero 25% shorter; map zoom and
its reduced-motion opt-out; moon countdown 1,261,154,400 → 1,261,022,400 with
the figures; footer ink ≈ #6c6c6c between 4.5:1 and 5.5:1; titles without em dashes);
visual **21 pass**, 18 baselines updated (hills pages, homepage, footer), stable
on re-run. Note: the footer-only baselines would have passed unchanged (the ink
change is under the screenshot comparison's per-pixel threshold), so they were
refreshed explicitly. Evidence in `docs/review/cmr-hills/`.

Delivery: commit `4b3d4fe` on `feat/cmr-chicago-hills`. GitHub CI `validate` and
`browser` pass (run 42584585971); Vercel Preview rebuilt from it (branch URL under
Delivery, SSO-protected). PR #4 description updated. Not merged; no production
deployment.

## Refinement pass (Owner direction, 2026-11-08 / 09)

Two Owner briefs on PR #4: "CMR — Chicago Hills Refinement Pass for PR #4" and a
correction to the Cricket Hill repeat metrics. Same delivery constraints: no
merge, no deploy, Join untouched, reuse the architecture, no unrelated redesign.

### What changed

**Motion (new, code-only).** `src/components/ContourField.tsx`: one WebGL2
fragment shader drawing the contour lines of slowly evolving 3D simplex noise
(Ashima/Gustavson, MIT) over a lightly warped domain, anti-aliased with
screen-space derivatives (constant hairline). No dependency, about 3 KB. Direction
only from the Owner's four reference videos (watched as frame sheets; nothing
from them is used or loaded). Restraint: ≤ 30 fps, paused off screen and in hidden
tabs, pixel budget ≈ 2.5 MP; `prefers-reduced-motion: reduce` → one still frame,
following the setting live; a software WebGL renderer (SwiftShader / llvmpipe — no
usable GPU) → the same still frame, so it never burns the CPU every frame; no pointer input (the Round 2 liquid cursor stays
removed); `aria-hidden`; the lines fade in after the first frame; without WebGL2
the static `TopoPattern` renders. Colors come from CSS tokens:
`--cmr-contour-on-dark` (MWDS neutrals 600, #525252) and `--cmr-contour-on-light`
(neutrals 300, #d4d4d4), added to `src/styles/cmr.css` as aliases.
- Hill heroes (all five): grey lines on black, seeded per hill.
- Homepage "Flat is a state of mind": grey lines on white; statement static.

**Hill detail template.**
- Hero: contour background replaces the Cricket Hill photograph and the static
  pattern (photo, `build-hill-hero.mjs` and the `hero` field removed — recoverable
  from `5329d58`); no eyebrow; name larger (60 / 104 / 176) and one word per line,
  capped on phones so "TRASHMORE" never clips; breadcrumb moved below the hero
  (now "Chicago Mountains / {hill}").
- Lede alone: standfirst ("One of Chicago Mountain Runners' primary training
  hills.") and the visible provisional badge/note removed. `data-status` stays on
  the section; every record stays `provisional`.
- Removed: the "Elevation gain" five-column strip (`HillStats`) and "What goes up."
  with its graphic (`HillProfileSection`, `repeat-diagram.svg`).
- "The mountain at Montrose." kept as the approved reference. Spec rows: Cricket
  keeps the Figma rows; the others show the Owner's "Surface · Grass/dirt".
- Repeats: heading "How tall is it? / How tall you need it?"; the Owner's support
  copy; final sentence dynamic ("The Cricket Hill route is .2 miles up and
  down." / "CMR hasn't mapped a route on {hill} yet…"). Four pastel metric
  circles (club-totals style, shared `tintVars` now in `src/lib/tints.ts`, odometer
  roll-in) in a 2 × 2 quadrant: target, large count, "REPEATS", miles beneath.
  Line drawing removed. No route → dashed outline circles reading TBD / TBD.
- Runs band: run title at the display size; empty state "No set weekly run."
- "Find what you've / been looking for.": address, buttons and note unchanged;
  the placeholder is now a static greyscale map (see Data).
- "More hills on repeat.": new `MoreHills` — names only (with park ·
  neighborhood and ↗), whole-row link, grey hover, name slides in, ↗ nudges,
  focus ring; motion off under reduced motion.
- Section headings (all but the hero name and lede) use the homepage "Get high in
  the city." size, now shared as `displayHeading()` in `src/lib/headings.ts`.

**Directory `/hills`.** No eyebrow; h1 "Chicago H̶i̶l̶l̶s̶ / Mountains" — "Hills"
struck through and "Mountains" always alone on the second line: an intentional
visual joke (Owner, 2026-11-09), not a naming inconsistency; 44px on phones so the
first line holds. Rows: no numbers; Surface "Grass/dirt" for every hill; column
"Weekly with CMR" (weekly runs only; one-off runs excluded); "No set weekly run"
where none. Rise footnote removed. Closing band is the homepage `JustShowUp`
(`PickAHill` deleted). The one-line status note ("Hill details are unconfirmed.
Rise figures are approximate.") stays — the brief did not remove it (decision R-4).

**Footer.** Newsletter takes the left half; the CMR wordmark ("CHICAGO /
MOUNTAIN / RUNNERS™") fills the right half in the footer ink, below the
newsletter on phones. Traced from the Owner's attached image
(`scripts/assets/source/cmr-wordmark-owner.png` → `trace-wordmark.mjs` (potrace,
run once, not a dependency) → `public/brand/cmr-wordmark.svg`), drawn by
`CmrWordmark` as a mask over `currentColor`. The small CMR badge above the
newsletter is removed so the footer carries one mark (decision R-5).

**Homepage headings.** "2026 club totals." and "See you on the hill." now use the
"Get high in the city." size (48 / 54 / 96) and its −0.04em tracking.

**Illustrations.** Checked, unchanged: the five SVGs are black and white only
(#000 / #fff, no greys), pastel labels and "Vertical scale exaggerated." remain
on the homepage explorer. The directory thumbnails stay label-free.

### Data and provenance

| Field | Value | Kind |
|---|---|---|
| `page.surfaceSummary` | "Grass/dirt", all five | Owner-provided (2026-11-08) |
| Cricket `page.route` | `distanceMi 0.2`, `gainPerRepeatFt 40`, basis "25 complete repeats ≈ 5 miles and ≈ 1,000 ft of gain" | Owner-confirmed route baseline (2026-11-09), approximate |
| Repeat counts / miles | `routeCounts()`: ceil(target / 40) repeats × 0.2 mi → 500 ft 13 / 2.6 mi; 1,000 ft 25 / 5 mi; 2,500 ft 63 / 12.6 mi; 5,000 ft 125 / 25 mi | **Derived** workout arithmetic from that baseline — not surveyed elevation |
| Other four hills | no `route` → TBD counts and miles | Never calculated from overall rise (tested) |
| `page.mapImage` | `public/hills/maps/{slug}.jpg`, 1280×720 greyscale | OpenStreetMap tiles, fetched once by `scripts/assets/build-hill-maps.mjs` (≈ 24 tiles per hill, identified User-Agent, per the OSMF tile policy); centres from Nominatim (Cricket Hill natural/hill; Warren, Horner, James parks; Schiller Woods centroid at one zoom out). "© OpenStreetMap contributors" shown on every map. No runtime map requests |

The first refinement brief gave stored counts (25 / 50 / 150 / 300 repeats; 5 /
10 / 30 / 60 mi), which did not follow from one gain per repeat. The Owner's
correction replaced them with the baseline above; the stored counts were never
pushed. `Hill.elevationGainFt` / `repeatDistanceMi` stay unset: the route
baseline is approximate and lives on the route, separate from surveyed fields.

### Deviations and judgment calls in this pass

| # | Item | Decision |
|---|---|---|
| R1 | Two-line headings at the display size ("How tall is it? / How tall you need it?", "Find what you've / been looking for.") | Two lines from tablet up. At 393 the 48px display size cannot fit "How tall you need it?" in 345px, so phones wrap to 3–4 lines; the size rule was kept over the line count |
| R2 | Repeats layout | The heading spans the section (two lines at 96px are wider than the space left of a quadrant); the quadrant sits right of the support copy, below the heading, from tablet; stacked on phones |
| R3 | Find section layout | Heading spans; address/actions left, map right (same reason) |
| R4 | Directory status note | Kept (not named in the brief); hill pages show no visible provisional marker |
| R5 | Footer badge | Removed in favour of the one large wordmark |
| R6 | Breadcrumb label | "Chicago Mountains" (matches the directory h1) instead of "Chicago Mtns" |
| R7 | Breadcrumb ink | 75% black (≈ #404040): muted-foreground measured 4.06:1 at 13px mono once anti-aliased |
| R8 | Hero photograph | Removed for all five (the brief applies the animated background to every hill page) |
| R9 | Review evidence | The milestone's Figma-vs-build images were removed: the refinement deliberately departs from those frames. They remain in git history (`8ba945e`) |

### Future work (recorded only — not implemented in PR #4)

For the **Join the Club** flow (paused; its Work Item is untouched on
`plan/cmr-join-page`), the Owner wants three pages, detailed and specific to the
running club:
- **FAQ** — what joining means, what happens when someone joins, how joining
  works, whether it costs money.
- **Terms** — expectations for runners and protections for runners; protections
  for the club founder / director / admin.
- **Privacy** — what is collected when joining and how it is used.
Carry this into `implement-cmr-join-page` when Join resumes. (Owner, 2026-11-08.)

## Authorization and scope

Owner direction (2026-11-08, "CMR — Chicago Hills Directory & Detail Pages"): the
next v1 milestone after the merged homepage (PR #3). Implement `/hills` and the
five hill pages from the approved Figma and the established CMR direction; reuse
existing components, MWDS foundations and the `HillProfile` illustrations (no
regeneration, no gray shading, no steepest-side labels, no exaggerated mountains;
keep "Vertical scale exaggerated."); keep Warren Hill illustrative; fabricate no
elevations, prominence, repeat distances, routes, GPS, parking, meeting points or
CMR workout advice; keep content-status metadata and promote nothing; no maps,
GPX, integrations or new features beyond v1; work in slices without routine
approval; commit, push, open a PR; **do not merge or deploy**. Join the Club is
paused and was not touched.

Authority: `none`, as for the homepage — local, reversible implementation inside
the approved v1 scope (`define-cmr-v1-scope`, approval artifact on file) and the
accepted IA (`define-cmr-v1-ia-and-content-model`). Merging and production
deployment remain Owner actions.

Preserved, untouched: the uncommitted Join planning changes on
`plan/cmr-join-page` (`.aiom/profile.md`, `.aiom/work/implement-cmr-homepage.md`)
and the untracked Work Items (`define-cmr-v1-ia-and-content-model.md`,
`explore-cmr-v1-visual-direction.md`, `implement-cmr-join-page.md`). This work
was done in a separate git worktree so that checkout was never switched or
stashed. For the same reason `.aiom/profile.md` `next_governed_action` is **not**
updated on this branch (the pending Join planning edit rewrites that field;
updating it here would conflict). Update it when the Join planning work is
committed.

## Figma frames

| Surface | Frames | Notes |
|---|---|---|
| Hill detail | Hill Details / Desktop **1:6363**, Tablet **1:6703**, Mobile **1:7032** (page "Hill Details", 1:6362) | Sections: hero 1:6673 / 1:7007 / 1:7336; lede 1:6699; stats 1:6377; "What goes up." 1:6700; "The mountain at Montrose." 1:6445; "Make it taller." 1:6701; "Run it with us" 1:6551; "Find the mountain." 1:6702 |
| Hill directory | **None.** Every page of the file was checked (Home, Find a Run, Run Details, About, Hill Details, Join Us, Playground, Make Import / Baseline, Archive) | Composed from approved parts; see "Directory design" |
| Reused patterns | Home "Chicago hills" 1:118 / 78:323 / 78:441; Find a Run heading 1:1296 ("Pick a hill. Show up.") | |
| Not used | "Reference / Hill image variation" 28:10 (old exaggerated Mt. Trashmore with prominence) and the reference photo sections 28:5 / 28:6 | Superseded by the Round 2.1 illustrations |

## Implementation slices

1. **Data and helpers.** `src/lib/hills.ts` gains a `HillPage` record per hill
   (lede, about, sources, surface, address, map query, optional hero photo) with
   each field's provenance documented; `repeatsTo` (IA decision 7),
   `surfaceLabel`, `hillsWithPages`, `otherHills`. `src/lib/runs.ts`
   `getRunsAtHill` (the Hill → Run side of the IA's bidirectional relationship);
   `src/lib/schedule.ts` `describeCadence`; `src/lib/maps.ts` (plain map-service
   URLs); `src/lib/hill-directory.ts` (numbered entries with CMR cadences).
2. **Shared component extensions** (backward compatible): `CtaLink` variant
   `outlineOnDark`; `icons.tsx` `NavigationIcon` (Figma 1:6591 export);
   `HillProfile` prop `annotated` (default `true`); `TopoPattern` optional
   `className`.
3. **Hill detail page** `src/app/hills/[slug]/page.tsx` and
   `src/components/hills/*`: `HillHero`, `HillLede`, `HillStats`,
   `HillProfileSection`, `HillAbout`, `HillRepeats`, `HillRuns`,
   `FindTheMountain`, plus "More hills". Static params for the five hills,
   `dynamicParams = false` (the placeholder hill 404s), `generateMetadata`,
   hourly revalidation (runs are time-dependent, as on the homepage).
4. **Directory** `src/app/hills/page.tsx`: page head, `HillDirectoryList`,
   provenance caption, `PickAHill` closing band.
5. **Assets.** `public/hills/cricket-hill-hero.jpg` from the Owner's original
   photograph (`scripts/assets/build-hill-hero.mjs`: crop + grayscale only);
   `public/hills/repeat-diagram.svg` (Figma "FieldDrawing" 1:6531, verbatim).
   The five terrain SVGs are reused unchanged.
6. **Tests, review evidence, this record.**

Small fix outside the pages: the `/calendar/[slug]` scaffold now links only hills
that have a page (the placeholder run pointed at the placeholder hill).

## Components reused / modified / added

- **Reused unchanged:** `Container`, `ArrowLink`, `ProvisionalBadge`, `MapPinIcon`,
  `ArrowUpRightIcon`, `fluid.ts` helpers, `onDarkSurface`, `Header` (its
  `aria-current` already covers `/hills/*`), `Footer`, `QuestionsWidget`, MWDS
  tokens and type.
- **Modified (additive):** `CtaLink` (+`outlineOnDark`), `HillProfile`
  (+`annotated`), `TopoPattern` (+`className`), `icons.tsx` (+`NavigationIcon`).
  The homepage's use of each is unchanged (homepage unit, browser and visual
  tests pass unchanged).
- **Added:** `src/components/hills/*` (above). No MWDS token, primitive or
  generated file changed; no new dependency; no new color.

## Directory design (no Figma frame)

`/hills` extends the approved homepage hill list rather than inventing a new
pattern: numbered rows on black rules, Geist names, park · neighborhood, ↗, the
`#ececec` hover row and a whole-row link. To meet the IA's "comparative hill data"
requirement each row adds a label-free thumbnail of the approved drawing, the
approximate rise, the surface and when CMR runs it (desktop: one aligned row with
a column header; tablet: drawing beside the text; mobile: stacked). The head uses
the Hill Details hero scale (display 48 → 144, Geist Mono eyebrow) with the nav's
own label as h1, "Chicago H̶i̶l̶l̶s̶ Mtns". It closes with a black band reusing
the Find a Run frame's "Pick a hill. Show up." and the two site CTAs. **This is a
composition, not an approved design: Owner review needed.**

## Geographic information and sources

Read 2026-11-08. These back the "sourced" sentences on each page and are cited on
the page under the about copy. They are published references, not Owner
verification: every hill stays `provisional`.

| Hill | Sources read | What they support | Not used / uncertain |
|---|---|---|---|
| Cricket Hill | [Chicago Park District: Cricket Hill](https://www.chicagoparkdistrict.com/parks-facilities/cricket-hill) (4500 N. Lake Shore Dr. at Montrose; in Lincoln Park); [WBEZ Curious City](https://www.wbez.org/stories/how-did-cricket-hill-in-chicago-get-its-name/369e3b9b-4b90-4abe-a47c-a4e606df0b50) (1948 decision to build an artificial sledding hill on the landfill extension; "45-foot-tall") | Location, origin | WBEZ's 45 ft differs from the terrain estimate (≈ 30 ft rise above the surrounding ground); neither is shown as a measured height. The cricket-field origin of the name was not confirmed by the pages read and is not stated. "Uptown" (Figma) vs Buena Park in some sources |
| Warren Hill | [Chicago Park District: Warren (Laurence) Park](https://www.chicagoparkdistrict.com/parks-facilities/warren-laurence-park) (6601 N. Western Ave.; 88.93 acres; nine-hole golf course; ice rink) | Park facts, address | The Park District page does not mention a hill. Secondary sledding guides (not cited) put a sledding hill in the park's west section near the rink — a lead for re-measuring, since the terrain search (centered east of there) found no distinct hill |
| Horner Hill | [Chicago Park District: Horner (Henry) Park](https://www.chicagoparkdistrict.com/parks-facilities/horner-henry-park) (2741 W. Montrose; Montrose & California; Irving Park; clay pits → dump → filled and graded; "large tobogganing hill" by the early 1950s) | Location, origin | Hill location within the park inferred from terrain (needs Owner confirmation) |
| Schiller Hill | None citable: the Forest Preserves of Cook County pages refused automated reads (HTTP 403) | Only "a Forest Preserves of Cook County site along Irving Park Road" is stated, uncited | Hill location inferred from the highest ground the data found in the woods (needs confirmation) |
| Mt. Trashmore | [Wikipedia: Mount Trashmore (Illinois)](https://en.wikipedia.org/wiki/Mount_Trashmore_(Illinois)) (Robert E. James Park, Evanston; landfill closed and converted 1965; sledding; ski slope from 1973; "65 ft") | Location, origin, use | Wikipedia's 65 ft is broadly consistent with the terrain estimate (≈ 60 ft); only the estimate is shown |

Approximate figures (unchanged, from `scripts/assets/terrain`, USGS 3DEP via AWS
Terrain Tiles, rounded to 5 ft): Cricket ≈ 620 / 590 / 30 ft (summit / base /
rise); Horner ≈ 615 / 595 / 20; Schiller ≈ 645 / 630 / 15; Mt. Trashmore ≈ 670 /
605 / 60; Warren — none (illustrative). Prominence is not computed or shown.

## How the four kinds of information are kept apart

| Kind | Where | How it's marked |
|---|---|---|
| Sourced geography | About paragraphs, address, map query | "Sources" list under the copy |
| Approximate elevation | Profile labels and rise legend; directory "Rise" | "≈", "approximate" captions; directory caption says rise isn't the climb of one repeat |
| Illustrative graphic | Warren Hill profile | "Elevation profile · illustrative"; caption; no figures; status note |
| Provisional club content | Ledes, CMR voice, Cricket Hill surface/exposure/terrain rows and standfirst, runs | "Provisional" badge + status note on every hill page and on `/hills`; records stay `provisional` |

Not fabricated: elevation gain per repeat, repeat distance and the 500 / 1,000 ft
repeat counts show **TBD** (as in Figma). The counts are computed by `repeatsTo`
only from a measured gain per repeat; the approximate terrain rise is deliberately
**not** used, because a repeat need not climb the whole hill (asserted by tests).
No meeting points, parking, routes or workouts: "Find the mountain." links go to
the park/landmark and say so; runs come only from `src/lib/runs.ts`.

## Design-to-code deviations

| # | Item | Figma | Build | Class |
|---|---|---|---|---|
| H1 | Hero photo | Low-res matted copy of the Owner's Cricket Hill photo, desaturated (mat reads as a grey frame) | Same photograph from the original file, grayscale, full-bleed, no mat | Correction (artifact of the source copy) |
| H2 | Heroes for the other four hills | Only Cricket Hill drawn | Shorter black hero with the static topo pattern; no stock or generated photos | Variation (no approved photos; rights for the Owner's other hill photos unconfirmed) |
| H3 | Breadcrumb "Chicago Mtns / {hill}" + top shade on the photo hero | — | Added for navigation; the shade keeps it ≥ 4.5:1 over pale sky | Addition |
| H4 | Hero height | Frame includes the nav (967 / 819 / 682) | Measured below the sticky header: 844 / 697 / 540 | As homepage |
| H5 | Content-status note under the lede | — | "Provisional" badge + one line | Addition (Owner decision D1) |
| H6 | "What goes up." figure | Desktop empty ("data pending"); tablet/mobile an idealized dashed curve | The hill's `HillProfile` at every size; eyebrow "approximate" / "illustrative" | Per milestone direction |
| H7 | Sources under the about copy; Cricket Hill's 4th paragraph (1948 origin) | — | Added | Addition (provenance) |
| H8 | Spec rows for hills with no recorded surface | Cricket's four rows | One "Surface · Not recorded yet" row | Variation |
| H9 | "Make it taller." footnote | — | "Counted from the elevation gain of one repeat, once it's measured." | Addition |
| H10 | Run band content | Sample "Cricket Hill Repeats, Tuesday 6:00 AM, ~60 min" | Runs data: "Cricket Mtn Repeats, Every Saturday · 5:30 AM, ~2 hrs"; Horner shows its Wednesday run; others "No group runs here yet." | Data, not design |
| H11 | "Find a Run" outline on black | 2px white border | 1px (`outlineOnDark`), matching the Owner's 1px outline rule | Consistency |
| H12 | Map placeholder | Schematic, desktop grey / tablet-mobile black outline | As drawn per frame, plus a small "Not a map" label; decorative | Addition (honesty) |
| H13 | Map actions | Buttons | Outbound Google Maps links (new tab) + "Directions go to the park, not a meeting point." | See decision 4 |
| H14 | "More hills" section before the footer | — | The other four hills (directory rows) + "All hills" | Addition (navigation) |
| H15 | Footer | Mint footer with "Join Us" | The site's current footer (Round 2: grey, "Join the club") | Superseded by merged homepage decisions |
| H16 | "Make it taller." counts on mobile | Two 164px columns + 48 gap (376px > 345px) | Columns share the width below 768 | Correction |
| H17 | Stats strip label "Elevation gain" | Visible as drawn | + visually hidden "per repeat"; "500 ft" + hidden "of climbing" | Accessibility |

## Accessibility

- One h1 per page; section headings in order; breadcrumb `nav` with
  `aria-current="page"`; header marks the Hills section current on `/hills/*`.
- Whole-row links in the directory use one real link per row with a stretched
  overlay (no nested interactive content); visible 3px focus ring on the row;
  hover underline and grey row; arrow nudge only with motion allowed.
- External map links open in a new tab and say so in their names; "View run"
  names include the run ("View run: Cricket Mtn Repeats").
- Decorative art (`alt=""`, `aria-hidden`); figures are text.
- axe (WCAG 2.2 AA incl. contrast) clean on `/hills` and all five hill pages at
  393 / 768 / 1440, and on the components in jsdom.
- Hero text over the photograph (measured with the homepage's worst-region
  method): hill name 16.7–17.0:1; eyebrow 16.7–17.2:1; breadcrumb 4.72–8.76:1
  (≥ 4.5 asserted). No accessibility exceptions are introduced.

## Validation (2026-11-08, macOS, Chromium)

- `npm run lint`, `tsc --noEmit` (after `next typegen`), `npm run tokens:check`,
  `npm run build`: pass. Build prerenders `/hills` and the five hill pages
  (revalidate 1h).
- Vitest: **260 tests, 19 files, pass** (new: `tests/lib/hills.test.ts`,
  `tests/components/hills/HillDetail.test.tsx`,
  `tests/components/hills/HillDirectoryList.test.tsx`; `CtaLink` table extended).
  Includes: provisional status kept and no gain/distance promoted; Warren
  illustrative; Cricket copy verbatim; repeat maths; Hill → Run; map URLs;
  no-run variant; axe.
- Playwright (393 / 768 / 1440): **203 pass, 10 skipped** (visual + one
  desktop-only check). New `tests/e2e/hills.spec.ts`: titles/metadata, 404 for the
  placeholder, Figma geometry (hero height, h1 and lede size, stats columns),
  whole-row click and focus ring, hover, desktop column alignment, Hill → Run →
  Hill, homepage → directory → hill, More hills and breadcrumb, map links (new
  tab, no request to a map service), 320–1920 overflow sweep, axe on every page,
  photo-text contrast. Homepage and shared-UI suites unchanged and passing.
- Visual regression (`npm run test:visual`, macOS): **21 pass**; existing
  homepage, header and footer baselines unchanged; 9 new baselines
  (`/hills`, Cricket Hill, Warren Hill × 3 widths), stable on re-run.
- Review screenshots: `docs/review/cmr-hills/` (build at 393 / 768 / 1440;
  Figma-vs-build at 393 / 768 / 1732).

## Validation — refinement pass (2026-11-09, macOS, Chromium)

- `npm run lint`, `tsc --noEmit`, `npm run tokens:check`, `npm run build`: pass.
- Vitest: **264 pass** (19 files). New/changed: route baseline and derived table
  (13 / 25 / 63 / 125; 2.6 / 5 / 12.6 / 25 mi), no counts without a route,
  Grass/dirt, static map per hill, no standfirst/hero, weekly-only directory
  cadences, hero name words and spacing, breadcrumb after the hero, lede alone,
  TBD circles, More hills, footer, axe.
- Playwright (393 / 768 / 1440): **224 pass, 10 skipped**. New: contour hero and
  Flat animate (frames differ — test browsers render WebGL in software, so these
  tests opt in with a test-only `__CMR_CONTOUR_FORCE_MOTION__` flag), hold one
  still frame on software WebGL as shipped, and under reduced motion (which wins
  over the flag);
  grey line colors; text doesn't move; hero name fits 320–1440; headline
  "Mountains" on line 2 at 320–1920; section headings = homepage display size;
  two-line headings from tablet; 2 × 2 quadrant beside the copy; Cricket counts
  and miles; TBD for others; no visible provisional marker; map image loaded and
  credited, no off-site requests; More hills without columns; footer wordmark
  half-width layout; JustShowUp closes `/hills`; axe clean everywhere; hero
  contrast (name ≥ 3, breadcrumb ≥ 4.5 worst region). `playwright.config.ts` adds
  Chromium `--enable-unsafe-swiftshader` so WebGL runs on GPU-less CI.
- Visual (`npm run test:visual`, macOS): **21 pass**, stable on re-run. 18
  baselines updated (hills ×3 pages, homepage, footer, footer focus × 3 widths),
  rendered with reduced motion so the contour frame is deterministic; header
  baselines unchanged.
- Review screenshots: `docs/review/cmr-hills/` (see its README).

## Delivery

**Refinement pass:** commits `01f2e20` (implementation), `f14b171` (tests and
baselines), `c91c7ea` (record and evidence), `20587b6` (contrast-sweep fix),
`ede9a00` (record), `7920223` (software-renderer still frame). Verified head
**`7920223`**: GitHub CI `validate` and `browser` pass (run 42572703986, browser
2m12s); Vercel Preview rebuilt from it (branch URL below, SSO-protected). CI history: run 42570866595 (`c91c7ea`) failed the homepage
photo-text contrast sweep (30s timeout); run 42571352930 (`20587b6`) passed; run
42571799005 (`ede9a00`, record-only) failed the hill hero contrast test the same
way. Cause, both times: on the GPU-less Linux runner Chromium renders WebGL in
software, and the full-size contour animation starved screenshot-heavy tests.
Fix in the component (not only the tests): software renderers get the still
frame, which is also right for real visitors without a usable GPU. Thresholds
unchanged. PR #4 description updated. Not merged; no production deployment.

Milestone delivery (history):

- **PR #4**: https://github.com/mikewhitakerdesign/cmr-site/pull/4 (open, mergeable,
  not merged).
- Verified implementation head **`5329d58`**: GitHub CI `validate` and `browser`
  pass (run 42528632956). Vercel Preview deployed:
  https://cmr-site-git-feat-cmr-chicago-hills-mikewhitaker-projects.vercel.app
  (Vercel SSO-protected). No production deployment. Commits after `5329d58` only
  update this record.
- First CI run (`8ba945e`, run 42528338001): `validate` passed; `browser` failed
  one test. On desktop, the hero-contrast check timed out inside the full-page
  scroll helper on the Linux runner (a hang in `page.evaluate`, not a contrast
  result). The test now waits for the hero photo only. Thresholds are unchanged,
  and it passed 9/9 locally with `--repeat-each=3` and on the second CI run.

## Decisions needed before merging

Final mobile pass: no new blockers. Mobile nav cells share the width by
content (`flex-auto`) rather than strictly equal widths, so "Chicago Hills
Mtns" fits at 320px; text gaps are even. Say if strictly equal cells are wanted.

Final pass (still open):

- **F-a. Join page em dashes:** `src/app/join/page.tsx` (paused Join scaffold) still
  has two em dashes (title and body). Fix when Join resumes, or allow a one-line
  change now.
- **F-b. Moon line:** "Join the club" is plain text (Join is paused); link it to
  `/join` when Join ships? The distance is static and must be updated with the
  "Vertical climbed" total.
- **F-c. Copy edits:** confirm the four rewritten hill lines (F7).

Refinement pass (still open unless noted):

- **R-a. Two-line headings on phones** (R1): accept wrapping at 393, or allow a
  smaller phone size for those two headings only.
- **R-b. Footer** (R5): confirm removing the small CMR badge.
- ~~R-c. Directory status note~~: removed in the final pass (F8).
- **R-d. Maps:** OpenStreetMap static images (attribution required, ODbL/
  CC BY-SA) — confirm, and confirm the pins for Horner Park and Schiller Woods
  (park/woods centres, not the hills).
- **R-e. Cricket Hill hero photograph** is no longer shown (R8); confirm.
- **R-f. Routes for the other four hills** (distance and gain per repeat) to
  replace their TBDs.

Still open from the milestone (1, 3 and 7 partly answered by this pass):

1. **Directory design.** `/hills` has no Figma frame; approve the composition or
   direct a frame.
2. **Hill content.** Confirm or rewrite the four non-Cricket ledes and the CMR
   voice lines; confirm Cricket Hill's Figma copy ("one of CMR's primary training
   hills", surface, exposure, terrain) as fact before it is `verified`.
3. **Hill locations.** Where CMR actually runs at Warren Park (published guides
   point to the west section near the rink; worth re-measuring), Horner Park and
   Schiller Woods. Until then Warren stays illustrative.
4. **Map links.** Google Maps outbound links (no API, nothing embedded) for "Get
   directions" / "View map"; alternative: Apple Maps or OpenStreetMap, or remove
   until meeting points are confirmed.
5. **Measurements.** Elevation gain per repeat and repeat distance per hill
   (they unlock the 500 / 1,000 ft counts). Optionally: whether to show
   *illustrative* counts from the approximate rise, clearly labelled — not done.
6. **Photography.** Cricket Hill's hero uses the Owner's photograph (rights still
   unconfirmed, as for the homepage). Photos for the other hills, if wanted.
7. **Breadcrumb and "More hills"** are additions; keep or remove.
