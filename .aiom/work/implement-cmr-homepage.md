---
seed_version: '0.1'
id: implement-cmr-homepage
title: Implement the CMR homepage from the approved Figma design
objective: >-
  Translate the approved CMR homepage (Figma Home / Desktop 1:10, Tablet
  1:451, Mobile 1:884) into a production-quality, responsive Next.js page
  that reuses the merged MWDS foundation and shared UI, with strong visual
  fidelity, real routes, accessible interaction, and automated plus
  screenshot-reviewed validation.
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
created_at: '2026-11-07T23:52:00.000Z'
updated_at: '2026-11-08T22:00:00.000Z'
---
## Status

**Final targeted refinements (2026-11-08, after Round 2.1 was approved) implemented
and validated on PR #3; awaiting Owner approval to merge.** See "Final refinements"
first, then "Round 2.1" and "Round 2 refinement" below.
PR #3 stays open; not merged; no production deployment (Vercel Preview only).
Verified implementation head **`c2da050`**: GitHub CI `validate` and `browser`
pass (run 42505978575); Vercel deployment `B93L7N5SZUR24LPV31YAGNqyeKpJ` Ready as
a **Preview** at https://cmr-site-git-feat-cmr-homepage-mikewhitaker-projects.vercel.app
(Vercel SSO-protected). Commits after it only update this record.

Round 1 status (kept for the record): **all six slices implemented and
validated; awaiting final Owner verification.**
Branch `feat/cmr-homepage` (from `main` at `e610c25`), PR #3
(https://github.com/mikewhitakerdesign/cmr-site/pull/3), not merged, not
deployed. `validation_state: passed` covers the deterministic checks only.

**Final Owner decision (2026-11-08): the pre-review ("before") treatments are
restored** for the hero headline and Just show up (below), with their known
contrast shortfall **accepted as documented accessibility exceptions** for this
iteration. Those two elements are **not WCAG AA compliant and are not claimed
to be**. A contrast refinement (headline band; 42% shade) was built, measured
and then reverted at the Owner's direction; it is kept in the record below as
the tested alternative should the decision be revisited.

## Final refinements (2026-11-08)

### Authorization and scope

Round 2.1 was approved. A last targeted pass on PR #3, changing nothing else (the
natural hero photograph, hill geometry, layout and interactions are preserved): one
label for every Join CTA, no borders on the filled buttons, and black-and-white hill
graphics. Not merged, not deployed to production.

### As built

| # | Direction | As built |
|---|---|---|
| F1 | All four Join CTAs read "Join the club" and go to `/join` | Header (already), hero ("Become a Mtn Runner" → "Join the club"), Just show up ("Join Us" → "Join the club"), footer link (`footerNav`, "Join Us" → "Join the club"). Unrelated labels untouched; `/join` page heading is unchanged. A unit test renders all four and checks label and `href`; a browser test checks them in the live page (header, hero, Just show up, footer, in that order) and that no "Join Us" / "Become a Mtn Runner" link remains |
| F2 | No borders on the filled buttons; keep the inverse hover | `CtaLink`: the `border` class moved from the base into the `outline` variant only. Primary (black ↔ white) and secondary (white ↔ black) have no border at rest or on hover; the header's outline CTA keeps its intentional 1px default border. Padding restored to the pre-border values (`px-5 md:px-7`, `px-7`), so button sizes are as before; heights are caller-set and unchanged. Focus ring (3px + 2px gap), active states, contrast (solid on solid, 21:1) and reduced motion unchanged |
| F3 | Hills in black and white only; keep geometry, tags, legends, interactions, "Vertical scale exaggerated." | `render-profiles.mjs`: every fill is `#fff`, every line `#000` (SVGs contain only those two colors; before: eight grays plus near-black). Surface, bands and slab are white; contours and strata black, minor lines 0.5px and every fourth 1.15px. Geometry, anchors and data are byte-identical (same generator output); pastel tags, Total rise legend, hover/focus/touch behavior and the caption sentence untouched. The lower section's static topography is untouched |

### Validation (2026-11-08, macOS, Chromium)

- `npm run lint`, `tsc --noEmit`, `npm run tokens:check`, `npm run build`: pass.
- Vitest: **221 tests, 16 files, pass** (updated labels; filled buttons asserted border-free, outline asserted 1px; new four-CTA test).
- Playwright (393 / 768 / 1440): **133 pass, 8 visual skipped**. Hero, header and Figma geometry checks unchanged and passing (button positions and heights). Visual: **12 pass** after regenerating the affected baselines (homepage ×3, footer ×4).
- Contrast: CTAs ≈ 19–21:1; accepted exceptions unchanged and not claimed compliant. Hover states are solid black on white or white on black.
- Formspree still never contacted by tests.

## Round 2.1 final visual refinements (2026-11-08)

### Authorization and scope

A small follow-up on PR #3 (same branch, no new discovery): replace the hero
image with the **original photograph the Owner attached**; give the header CTA a
1px border; flip every CMR button to its opposite on hover; refine the hill
graphics (wider, simpler, more coherent, less peaked; no "steepest side" tag;
keep "Vertical scale exaggerated."); remove the topo liquid cursor effect, keeping
the static vector background and adding nothing animated in its place. Not merged,
not deployed; the two accepted contrast exceptions are unchanged; the two
untracked work items are untouched.

### As built

| # | Direction | As built |
|---|---|---|
| 2.1-1 | Hero from the attached original, good quality, composition preserved, light treatment only | `scripts/assets/build-hero.mjs`: crop the top 1900 of 2560 rows at full width, light grade (saturation ×1.5, gamma 1.2). No stretch, resample, sharpen or generation. **One** image (`public/home/hero.jpg`, 1920×1900) for every breakpoint, framed by `object-position` (50% 0% below 1024px, 50% 77% from 1024px, crest ≈ 72% down on desktop as in Figma). `<picture>` art direction, `hero-desktop.jpg`, the upscale script and `next.config.ts` qualities are gone |
| 2.1-2 | Header CTA 1px border | `CtaLink` gained an `outline` variant (1px black border, transparent) that the header CTA now uses instead of its own classes; 36px height and 110/128/150 widths unchanged |
| 2.1-3 | Hover flips: black → white, white → black, transparent → black | **(Borders on the filled buttons removed in the final refinement; only `outline` keeps its 1px.)** `CtaLink` variants: `primary` (black → white), `secondary` (white → black), `outline` (transparent → black). All carried a 1px border (the fill's own color at rest; the label's opposite after the flip) so a flipped button keeps its edge on any surface. Active, focus ring (3px + 2px gap in the surface color), disabled, 1px press nudge and reduced-motion handling unchanged. Padding trimmed 1px so widths match Figma's |
| 2.1-4 | Hills: wider, simpler, coherent, grounded; no "steepest side"; keep the exaggeration sentence | `render-profiles.mjs` rewritten around one recipe: 1000×540 canvas, island 910px wide at a flatter tilt, hill fills the island; smoothing at 10% of each hill's width; fuller dome curve (relief^0.8); 12 equal contour bands (every 4th heavier; no contour interval claimed); 2-line slab; darker low bands to lighter summit bands; same viewpoint for all. Drawn rise = 55 + 75·√(rise/60) px (exaggeration 1.2–3.8×, was 7–19×; recorded per hill). Steepest-side chip, leader, anchor, rotation and data removed. Caption keeps "Vertical scale exaggerated." (also on Warren Hill's illustrative caption) |
| 2.1-5 | Remove the liquid cursor effect, keep the static topo | `TopoField` (client) deleted; `TopoPattern` is a Server Component with the vector paths and nothing else: no filter, mask, pointer handling or client JavaScript |

### Hero photograph: correction to the Round 2 note

Round 2 guessed (from a different, wider file) that the approved image was an edit
with a reshaped crest. With the attached original the relationship is clear: the
approved frame is **this photograph with the hill stretched vertically** (crest and
track read steeper), extra sky above, and a more saturated grade. Runner, trees and
track are identical. Round 2.1 reproduces the composition and grade by cropping
and a light grade, **not** the stretch, so the hill is visibly **gentler** than in
Figma. If the steeper hill is wanted, it is an explicit editing decision (below).
Resolution is the file's own 1920px: ≈0.75× on a 1440px screen, sharp at 1×
displays up to 1920px, soft only on 2× displays wider than ~960px. Rights remain
unconfirmed. The approved raster is kept as `scripts/assets/source/hero-figma-approved.jpg`.

### Delivery status

Verified implementation head **`2e05a14`**: GitHub CI `validate` and `browser` pass
(run 42513033456); Vercel deployment `AViVeThskBSKQiJhGbZScL2V7RGC` Ready as a
**Preview** at https://cmr-site-git-feat-cmr-homepage-mikewhitaker-projects.vercel.app
(Vercel SSO-protected). PR #3 open, not merged; no production deployment. Commits
after it only update this record.

### A product bug found and fixed on the way

The repeated sticky-header test exposed that clicking the logo on the homepage
could park the page ~18–27px short of the top (≈15% under CPU load; invisible
when run alone). Cause: the header resized *in the page flow*, so Chrome's scroll
anchoring moved the scroll position as it re-expanded mid-smooth-scroll. First fix
(suspend anchoring during the scroll) was incomplete. Final fix: **the header's
layout box never changes**: it keeps its expanded height (`min-h` 137.13 / 100 / 123px)
and is click-through, and only the visible bar inside it
(`[data-slot=header-bar]`) shrinks. Nothing below ever shifts, so there is no
anchoring to fight. Verified 75/75 (25 repeats × 3 projects) under load, with a test
that the document does not move when the header turns compact.

### Contrast (method and thresholds unchanged; macOS Chromium)

- Hero CTAs and Just show up CTAs: ≈19–21:1 (solid fills, unchanged).
- Just show up heading: 3.54 / 3.80 / 3.67:1 at 393 / 768 / 1440 (≥ 3, asserted).
- **Accepted exceptions, unchanged and not claimed compliant.** Hero headline re-measured
  on the new photograph: **1.39 / 1.33 / 1.22:1** (Round 2: 1.32 / 1.23 / 1.24); Just
  show up copy 3.74 / 3.72 / 3.56:1.
- Hover states are solid black on white or white on black (21:1) and not photo-dependent.

### Validation (2026-11-08, macOS, Chromium)

- `npm run lint`, `tsc --noEmit`, `npm run tokens:check`: pass. `npm run build`: pass.
- Vitest: **220 tests, 16 files, pass** (new `CtaLink` test; updated hero, hills, topo and header tests).
- Playwright (393 / 768 / 1440): **130 pass, 8 visual skipped**, run twice with no flake;
  visual **12 pass** after regenerating the affected macOS baselines (homepage ×3, header ×3,
  footer ×5 — the footer changed only by a subpixel offset from the header's whole-pixel box).
- New and changed browser checks: hero is one image at its real resolution (never upscaled
  past the file) with per-breakpoint `object-position`; every CTA at rest and on hover
  (1px border, flips); header CTA border, hover and focus ring; sticky header does not
  shift the page; topo is static and unaffected by the pointer.
- Formspree is still never contacted by tests (requests aborted unless mocked).

### Round 2.1 notes and open decisions

1. **Hero:** the hill is gentler than in Figma (no stretch). Decide whether the approved
   steeper look should be recreated (an explicit edit of the original, ideally from a
   larger master) or whether the true shape is preferred. A ≥ 3840px master would also
   make 2× displays sharp.
2. **Hero headline** sits at 1.22–1.39:1 on this photo (accepted exception; not claimed AA).
3. **Hills:** Mt. Trashmore's real terracing leaves two lobes in the outer bands; the other
   four are near-concentric. Say if it should be smoothed further for a tighter family.
   Exaggeration is now modest (1.2–3.8×) and stated in every caption.
4. "Join Us" (footer, Just show up) vs the header's "Join the club" — still open from Round 2.

## Round 2 refinement (2026-11-08)

### Authorization and scope

Owner/GPT reviewed the live preview and approved a second design and
experience refinement as one coordinated increment ("CMR — Homepage Visual
Refinement, Round 2"): plan and implement in slices without intermediate review;
update PR #3 and the Vercel Preview; **do not merge or deploy to production**;
do not modify MWDS Figma or implement Code Connect; preserve the two untracked
work items; keep the two accepted contrast exceptions as they are (not
reopened). The Owner also provided a Formspree form (`mwlljgld`) for the
Questions feature and asked for the official `@formspree/react` package.

### Decisions recorded (Owner direction → as built)

| # | Direction | As built |
|---|---|---|
| R1 | Sticky nav; shrink logo and height on scroll; 1px black rule, no shadow | `HeaderShell` (client) sets `data-compact` past 96px of scroll, clears it below 16px (hysteresis vs. scroll anchoring); logo 188→112 / 128→96 / 100→72; 1px bottom border transparent → black; transitions only around the toggle (`data-animating`), none on resize; instant under reduced motion. `scroll-padding-top: 6rem` keeps focused content clear (WCAG 2.4.11) |
| R2 | Links right, beside the CTA, consistent spacing; CTA "Join the club" | One gap between every item and the CTA (24 tablet, 36 desktop); mobile keeps a second row, right-aligned under the CTA. Footer link and Just show up CTA still say "Join Us" (not in the direction) |
| R3 | Logo → home, and to top on the homepage | `HomeLink`: on `/`, a plain click scrolls to top (smooth unless reduced motion) and clears a hash; modified clicks unchanged |
| R4 | **(Superseded in Round 2.1: original photograph used.)** Hero image: prefer the original; else a restrained upscale | **Original found but not usable as-is** (see "Hero photograph" below); shipped a 2× Lanczos-3 upscale of the approved fill, served at optimizer quality 90 (`next.config.ts` `images.qualities: [75, 90]`) |
| R5 | CTAs: primary solid black / secondary solid white, hero and Just show up | `CtaLink` variants `primary` / `secondary` (replacing `solid` / `outline`): hover neutral 800 / cream, active 80% / border grey, 1px press nudge (motion-safe), focus ring unchanged. The outline CTA's 50% black fill (D6) is gone with the outline |
| R6 | Community: name black, description lighter gray, strike kept, smaller superscript ™ | Description in `muted-foreground` (#737373, 4.7:1 — AA at any size); TM 0.645em → 0.3em on the cap line, positioned without stretching the line box |
| R7 | Club metrics: no badge, centered heading, four equal pale tie-dye circles, smaller centered figures, odometer roll once | `ClubTotals` + `Odometer` (no dependency): figures 96→80 desktop, 48→40 below; circles ≤280 / 150 / 162; `cmr-tie-dye` utility (blooms, faint rings, conic swirl, blurred, clipped). Roll: CSS transforms only, one turn per digit, 1.1–1.6s staggered, once per mount; static when already visible at load, under reduced motion, and without JS; final values as text for assistive tech |
| R8 | Runs: Cricket SAT 5:30 ~2 hrs; Horner WED 5:30 ~60 min; drop Schiller; no badges; approachable descriptions | Data updated in `src/lib/runs.ts` (Schiller Quad Killer removed from the data; its detail route no longer exists). Status stays `provisional`. Upcoming list = next occurrence **per run** (`getNextOccurrencePerRun`), so the list is the two-run schedule. Descriptions are inclusive, invent no paces or protocol, and end "…to be confirmed" |
| R9 | **(Illustrations refined and "Steepest side" removed in Round 2.1.)** Hills: interactive profiles, five-hill illustration family, pastel labels, prominent rise legend, reusable | `HillsExplorer` + `HillProfile` + generated vector art (below). Mt. Trashmore by default; mouse/pen hover and keyboard focus preview; click/tap navigates; phones and coarse pointers get "Preview a hill profile" toggle buttons; all five drawings stacked and loaded together (no flicker, no shift), 200ms cross-fade (instant under reduced motion); hidden profiles `inert` + aria-hidden. `HillProfile` is used on `/hills/[slug]` too |
| R10 | **(Liquid cursor removed in Round 2.1; static vector topo remains.)** Flat is a state of mind: vector topo + restrained liquid cursor | `topo.svg` traced from the approved fill; `TopoField`: SVG turbulence displacement inside a soft lens that follows the pointer with a lag, strength from pointer speed, filter confined to the lens box, frame loop stops at rest. Only with `(hover: hover) and (pointer: fine)` and no reduced-motion preference; static otherwise. Text never moves |
| R11 | Footer: very light gray, more padding, tone-on-tone logo, darker gray ink and inputs | `Footer`: MWDS `muted` (#f5f5f5); ink = neutrals 700 (#404040, 9.4:1); input border neutrals 500 (4.4:1, ≥ 3:1 for UI); `CmrLogo tone="current"` (same masks over a solid fill); padding 80/96/128 top; links + legal under a hairline. Newsletter behavior unchanged (`inputClassName` prop added) |
| R12 | Floating Questions feature via Formspree `useForm` | `QuestionsWidget` in the root layout (every page): mint pill → non-modal dialog; question + email required, name optional; client validation mirrored by Formspree's; field and form errors linked to fields; "Sending…" + disabled; success only after Formspree confirms; Esc/close return focus; draft survives close/reopen; `_gotcha` honeypot. No storage, no CMR email API, no recipient address in the repo |

### Shared foundations changed (and what stayed homepage-only)

- **Shared, site-wide:** `Header` (+ new `HeaderShell`, `HomeLink`), `Footer`,
  `CmrLogo` (`tone` prop; deprecated `priority` → `loading="eager"`),
  `CtaLink` (variants renamed), `NewsletterSignup` (`inputClassName`), root
  layout (Questions panel; skip link above the sticky header), `cmr.css`
  (scroll padding).
- **New shared components:** `HillProfile` (homepage + hill pages), `Odometer`,
  `QuestionsWidget`.
- **CMR app-layer colors, not MWDS:** `--cmr-quiet-ink` / `--cmr-quiet-edge`
  alias MWDS brand neutrals 700 / 500; the four pastel tints (`--cmr-tint-*`
  wash + dye; mint reuses MWDS cmr/mint 50/100, peach/lavender/blue are new
  raw values picked from the mesh gradient's hues) are a deliberately small,
  decorative set read as `bg-(color:--…)` — not a Tailwind palette, so they
  can't spread as a parallel system. Candidates for MWDS (Figma) if adopted
  more widely. No MWDS token, component or generated file changed.
- **Homepage-only:** `ClubTotals`, `UpcomingRuns`, `CommunityIntro`,
  `HillsExplorer`, `TopoField`, `FlatStateOfMind`, `HomeHero`, `JustShowUp`.

### Hero photograph (R4 investigation) — superseded; see "Round 2.1" above

The approved hero fill (768×1024) is the Owner's Cricket Hill photograph, also
present locally at 1673×964 (inside a white mat) in `~/Downloads/cricket-hill.jpg`
(2026-08-31; alongside warren-, horner- and schiller-hill photos, not used).
Same trees, runner and track — but the approved image is an **edit**: the hill
reshaped into a steeper crest, the track bent, sky extended, colors graded. A
scripted rebuild from the original lost that edit (tested and discarded), so the
original is not a drop-in replacement. Shipped: `scripts/assets/upscale-hero-desktop.mjs`
(2× Lanczos-3 + light unsharp, nothing generated). Honest effect: crisper
silhouette and horizon, less optimizer/bilinear smear; grass and runner remain
as soft as the 768px source. **Recommended:** redo the approved edit on the
original at ≥ 3464px wide. Rights for the photograph remain unconfirmed.

### Terrain illustrations (R9): sources and limitations

- Elevation: AWS Open Data Terrain Tiles (Terrarium z15, ≈3.5 m/px; USGS 3DEP
  in the US). The USGS 3DEP ImageServer returned 504s on 2026-11-08. Locations:
  OpenStreetMap / Nominatim (named features for Cricket Hill and Mount
  Trashmore; parks otherwise, with the summit = local maximum of greatest
  relief). Grids committed under `scripts/assets/source/terrain/`.
- Figures (≈, 5 ft rounding): Cricket ≈ 620 / 590 / 30 ft; Horner ≈ 615 / 595 /
  20; Schiller ≈ 645 / 630 / 15; Mt. Trashmore ≈ 670 / 605 / 60 (approved art:
  669 / 604 / 65 — broadly consistent). **Prominence is not computed or shown**
  (the old "85 ft" is gone). **Warren Hill: no distinct hill found** in the data
  near Warren Park → interpretive shape, no figures, labelled as such.
- Interpretation: island outline, slab, viewing angle (steepest side to the
  right), edge easing to the base, vertical exaggeration 7–19× (each rise drawn
  the same height). Captions say "approximate" and "vertical scale exaggerated".
- Limits: ≈3.5 m tiles smooth small features (Schiller's mound is ≈ 60 m long);
  "base" is a definition (median ground just outside the foot), so rise can
  differ from a surveyed figure; locations for Horner and Schiller are inferred
  from the terrain and need Owner confirmation.

### Round 2 design-to-code deviations and notes

| # | Item | Note |
|---|---|---|
| R-a | Header +1px tall when expanded (123 desktop) | The 1px rule is always present (transparent until compact) so turning compact never jumps by a pixel |
| R-b | Mobile header 144 → 137 | Links row tightened to sit under the CTA |
| R-c | Run rows taller than Figma (e.g. 210 desktop vs 113.8) | Descriptions, per direction; workout label left-aligned below the description on tablet/mobile (was right-aligned) |
| R-d | Upcoming list shows 2 rows (was 3 occurrences) | One row per run (two-run schedule) |
| R-e | Hills section height differs from Figma (desktop 1324 vs 1272) | Profile + caption + list spacing redesigned |
| R-f | Totals section and figure sizes differ from Figma | Per direction (centered, circles, figures 80/40) |
| R-g | Header CTA vs footer/Just show up labels | Header "Join the club"; others keep "Join Us" (not in the direction) — Owner may want them aligned |
| R-h | `@formspree/react` adds ≈14 KB gzipped of Stripe *loader* code via its re-exports | Never executed on our pages (asserted: no off-site requests on load) |

### Validation (2026-11-08, macOS, Chromium)

- `npm run lint`, `tsc --noEmit`, `npm run tokens:check`: pass.
- Vitest: **212 tests, 15 files, pass** (new: header sticky/compact/home link,
  hills preview by hover/focus/touch, figures and interpretive profile, Odometer,
  Questions validation/sending/success/field error/delivery error/honeypot/axe,
  runs per-run list and descriptions, totals circles and status).
- Playwright (393 / 768 / 1440): **124 pass, 8 visual skipped**; visual:
  **12 pass** after regenerating the affected macOS baselines (homepage ×3,
  header ×3, footer ×6). New browser checks: compact header (1px black rule, no
  shadow, still pinned), logo → top, odometer roll and settle (circles still),
  reduced motion static, hill preview without layout shift and with all five
  drawings loaded, touch preview buttons, liquid topo active only on fine
  pointers and idle at rest, Questions with mocked Formspree (success, failure,
  axe), 320–1920 sweep.
- Formspree is never contacted by tests: every page route to `formspree.io` is
  aborted unless a test installs a mocked response. **No real submission has
  been made**; a live delivery test needs Owner authorization.
- Photo-text contrast (method unchanged; the helper now centers the target and
  hides the sticky header and Questions button while capturing — measurement
  setup only, thresholds unchanged): hero CTAs and Just show up CTAs ≈ 19–21:1
  (solid fills); Just show up heading 3.54 / 3.80 / 3.67:1 (≥ 3, asserted).
  **Accepted exceptions, unchanged and not claimed compliant:** hero headline
  1.32 / 1.23 / 1.24:1; Just show up copy 3.74 / 3.81 / 3.56:1 (393 / 768 / 1440).
- axe (WCAG 2.2 AA incl. contrast): clean on the homepage, header, footer and
  the open Questions panel.
- First Linux CI run on `7406b85`: `validate` passed; `browser` failed twice,
  both measurement timing on the slower runner, not product defects: (1) the
  320px contrast sweep's first capture returned *no measurable cells* (NaN) —
  the sticky header re-expanded mid-capture; the helper now waits for the
  element's box to be stable and retakes the three captures if it moved;
  (2) the hills layout-shift check saw 0.5px when section and list were read in
  separate calls — now read in one pass, allowing ≤ 1px (sub-pixel). The
  second run showed (1) was not timing: Linux renders light-on-dark text thinner,
  and the 320px CTA label (≈14.4px, white on the new black fill) had no
  half-font-size cell with 12 fully covered glyph pixels. The helper now
  re-scores with 2× (then 4×) cells only when no cell qualifies — same
  median-glyph vs worst-5%-background rule. Contrast thresholds and exceptions
  unchanged.

### Round 2 open Owner decisions

1. **Review the Round 2 increment as a whole** on the Vercel Preview.
2. **Hero photograph:** commission the approved edit on the original (≥ 3464 px)
   or accept the provisional upscale for now.
3. **Warren Hill:** confirm where CMR runs at Warren Park (the data shows no
   distinct hill); confirm the Horner and Schiller hill locations; decide
   whether the approximate figures may be shown at launch.
4. **Run details:** confirm Cricket (SAT 5:30, ~2 hrs) and Horner (WED 5:30,
   ~60 min), the meeting points, and the descriptions; then set them `verified`.
   Decide whether Schiller Quad Killer should return on the calendar.
5. **Labels:** align "Join Us" (footer, Just show up) with the header's "Join the club"?
6. **Formspree account settings:** allowed domains (production + preview),
   spam/reCAPTCHA (off for AJAX), notification recipient — and authorize one
   real test submission.
7. **Pastel tints:** keep as a CMR app-layer set or add to MWDS (Figma).


## Owner authorization and approved decisions (2026-11-07)

These supersede "Owner decisions requested" (kept below for history).

- **D1, content → provisional.** Unverified Figma content (runs, club totals,
  Mt. Trashmore figures) may be used for visual development but must be
  visibly marked so it cannot be mistaken for verified data. Nothing is
  fabricated. Existing placeholder records stay identifiable.
- **D2, gradient → static image.** Extract the static Figma gradient as an
  optimized image. No WebGPU runtime.
- **D3, hero photo → provisional.** Use the existing Figma raster; record the
  resolution and rights requirement for launch. Use the high-resolution "Just
  show up" photo, optimized. No stock or generated substitutes.
- **D4, breakpoints → judgment, documented.** Follow all three frames. Correct
  obvious inconsistencies (off-container elements, colliding type). Do **not**
  automatically carry desktop decoration to tablet and mobile; classify each
  difference as intentional adaptation, incomplete design, or needing design
  review.
- **D5, scheduling → both.** Support weekly recurrence rules, individual dated
  runs, cancellations/exceptions, one-off special runs, and overrides, in
  `America/Chicago` including DST. Simplest maintainable v1 model; no
  database, CMS, scheduling service, or browser polling. Routes unchanged.
- **D6, interaction → complete states.** Keyboard, hover, focus, active, and
  disabled states; contrast-appropriate focus on white, black, mint, and
  photographic surfaces; the smallest visually appropriate adjustment where
  text over imagery lacks contrast; reduced motion respected; no reliance on
  accessibility exceptions or on axe alone.
- **Design system:** MWDS tokens and existing primitives; keep the three
  component layers distinct; no parallel color or type system; no MWDS
  library or Figma changes; no Code Connect.
- **Revised slice order:** 1 Hero + next-run card; 2 Community statement + club
  totals; 3 Upcoming runs (completes the scheduling model); 4 Chicago hills;
  5 Just show up + Flat; 6 full-page refinement and hardening, compared at 393,
  768, 1024, 1440, and 1732.
- **Delivery:** commit cohesive increments, push the branch, open one PR, do
  not merge or deploy.

## Implementation record (2026-11-08)

### Slices and commits

| Slice | Commit | Delivered |
|---|---|---|
| 1 Hero + next-run card | `e0376f8` | Hero (1:377 / 78:279 / 78:397), `NextRunCard`; shared foundations (`fluid`, `Container`, `CtaLink`, `ArrowLink`, `PhotoBackdrop`, `ProvisionalBadge`, `icons`, on-dark focus); full scheduling model; data status model; baked gradient; assets |
| 2 Community + club totals | `4aaaf2d` | `CommunityIntro` (1:16 …), `ClubTotals` (1:243 …) |
| 3 Upcoming runs | `6300c86` | `UpcomingRuns` (1:24 …) with exception and override tests |
| 4 Chicago hills | `2433cc0` | `ChicagoHills` (1:118 …) with featured state and illustration |
| 5 Closing sections | `79a85bc` | `JustShowUp` (1:296 …), `FlatStateOfMind` (1:376 …) |
| 6 Refinement and hardening | commit with this record | Full-page review at 393/768/1024/1280/1440/1732 and a 20-width sweep; fixes (320px CTA overflow, desktop line heights, rule-inclusive row heights); `tests/e2e/home.spec.ts`; visual baselines; docs and evidence |

Each slice was tested, rendered in Chromium, overlaid on the Figma frame at
393/768/1732, corrected, and recorded before the next began.

### Architecture as built

The plan held, with three implementation-level changes: fluid values are a
TypeScript helper writing `-a`/`-b` custom properties read by static Tailwind
classes (`src/lib/fluid.ts`) instead of a CSS-only utility; `src/styles/cmr.css`
holds only the `ss08` utility; and `src/lib/content-status.ts` and
`src/lib/surfaces.ts` were added.

- **MWDS primitives:** none added or changed.
- **CMR shared** (`src/components/`): `Container`, `CtaLink` (solid / outline,
  inverse), `ArrowLink`, `PhotoBackdrop`, `ProvisionalBadge`, `icons`.
- **Homepage** (`src/components/home/`): `HomeHero`, `NextRunCard`,
  `CommunityIntro`, `ClubTotals`, `UpcomingRuns` (+ row), `ChicagoHills`
  (+ row), `JustShowUp`, `FlatStateOfMind`. All Server Components; the page adds
  no client JavaScript.
- **Data** (`src/lib/`): `schedule.ts` (pure scheduling), `runs.ts`, `hills.ts`,
  `club-totals.ts`, `content-status.ts`. No CMS, database, API, or polling.
- **Page:** `src/app/page.tsx`, `export const revalidate = 3600`.
- **Scaffold pages touched minimally** (to compile against the new models, not
  redesigned): `/calendar`, `/calendar/[slug]`, `/hills`, `/hills/[slug]` show
  schedule descriptions, status markers, and "Not measured yet".
- **Dependencies:** none added.

### Scheduling model (Owner decision D5)

Each run (route `/calendar/[slug]`, unchanged) has one `schedule`: `weekly`
(weekday, time, optional `startsOn`/`endsOn`, `cancellations[]`,
`overrides[]` of time / meeting point / note) or `once` (date, time,
`special`, `cancelled`). A moved run is a cancellation plus a `once` run. All
values are America/Chicago wall-clock; instants come from `Intl` time-zone
data (no dependency). DST gap times resolve forward and fall-back times to
the first occurrence. Upcoming occurrences are chronological from "now" and
stay upcoming until their start. The slot label is "TUE · 5:30 AM" within six
days, otherwise "NOV 14 · 5:00 AM". Covered by `tests/lib/schedule.test.ts`
(recurrence, bounds, cancellations, overrides, once and special runs, DST in
both directions, UTC-midnight edge, formatting, malformed input).

### Content status (Owner decision D1)

| Record | Status | Shown as |
|---|---|---|
| Three Figma weekly runs | provisional | "Sample · unconfirmed" on the card; "Sample schedule · unconfirmed" on the list |
| Five Figma hills (names, park · neighborhood) | provisional | Listed; no measurements recorded; detail pages say "Not measured yet" |
| Mt. Trashmore illustration figures | provisional | "Figures unverified" on the figure |
| 2026 club totals | provisional | "Provisional · unverified figures"; section hidden if set to `null` |
| Example Hill / Example Hill Repeats | placeholder | Never on the homepage; marked on scaffold pages |

Markers disappear once a record is `verified`, restoring the design exactly.

### Assets

See `public/home/README.md` for the full provenance record: hero photos
(Figma rasters, provisional), Just show up photo (2880px JPEG from the 4096px
fill), baked mesh gradient, community mark (cropped and rotated as framed),
Mt. Trashmore illustration and topo pattern (unaltered). No stock, generated,
or redrawn imagery.

### Accepted accessibility exceptions (Owner decision, 2026-11-08)

After the contrast refinement (kept below), the Owner decided to restore the
approved visual treatments and accept their contrast limits for this iteration.
Shipped state and measured worst-region contrast (method below; macOS Chromium,
13 widths, 320–1920):

| Text | Shipped treatment | Needs | Measured worst region | Status |
|---|---|---|---|---|
| **Hero headline "MAKE YOUR OWN MTNS"** | 60% white (as Figma) with the soft halo; no band | 3.0 (large text) | **1.19–1.36:1** (1.32 / 1.23 / 1.25 / 1.29 at 393 / 768 / 1440 / 1732) | **Exception. Does not meet WCAG AA 1.4.3.** |
| **Just show up body copy** | 90% white over a 30% shade | 4.5 | **3.55–4.04:1** (4.04 / 3.66 / 3.56 / 3.76) | **Exception. Does not meet WCAG AA 1.4.3.** |
| Just show up heading | 30% shade | 3.0 | 3.57–3.93:1 | Meets 3:1 (asserted) |
| Hero and Just show up CTAs | existing treatments (hero outline on 50% black fill) | 4.5 | ≥ 5.27:1 (outline), ≥ 11.67:1 (others) | Meets (asserted) |

Scope of the exception: only the hero headline and the Just show up body copy.
The hero headline is large display text whose meaning is also carried by the
page title and the `h1` text (screen readers and text-only use are unaffected);
the shortfall affects sighted low-contrast viewing. No threshold was changed:
`tests/e2e/home.spec.ts` keeps its 3:1 / 4.5:1 gates for all other targets, and
the two exceptions are measured and recorded on every run
(`exception …` annotations) but not asserted. If the treatments change, move
them back into the asserted set.

Measured Linux CI behavior of the copy at 30% was not asserted, so the
exception range above is macOS; CI is expected to measure about 0.5:1 lower.

**Tested alternative (reverted, available on request):** commits `30323f1` and
`6773a46` on this branch. Hero headline 75% over a 45% `--foreground` band
confined to the headline (≥ 3.19:1); Just show up 42% shade with full-white copy
(≥ 5.38:1 on macOS and passing on Linux CI). The comparison images were removed
from `docs/review/` because they no longer describe the shipped state; they can
be regenerated from those commits.

### Photographic contrast: method and the reverted refinement (PR #3 review, 2026-11-08)

**Review request.** Treat the hero headline as meaningful heading text (WCAG
AA large text, 3:1); keep the photograph, size, placement, typography and
two-line composition; keep the ghosted character where feasible; prefer the
smallest localized change; strengthen the validation method.

**Method (`tests/e2e/contrast.mjs`).** The previous check sampled only the
background (10th percentile of pixels behind the text, with an assumed text
color) — useful diagnostically, but it never measured the text as rendered and
let bright regions average out. The new method captures three renders of each
text element in Chromium at 1× — as shown; with the text forced to opaque
magenta (exact glyph shapes for that crop); with the text transparent but every
other layer kept (photo crop, gradient, shades, CTA fills, element opacity, any
text-shadow halo). Foreground = the real composited pixels inside the glyph
cores (so opacity and transparency are included as rendered). Background = the
pixels outside the glyphs, less a 1px anti-aliasing fringe. The box is split
into cells about half the font size (12–64px); each cell's score is its median
foreground against its worst 5% of background pixels; the element's result is
its **worst cell**. WCAG thresholds unchanged: 3:1 for the display headings,
4.5:1 for the CTA labels (15–18px semibold, not "large") and the copy.

**Limitations.** One engine (Chromium) at 1× DPR; results hold for the widths
measured (11 widths, 320–1920, since the crop shifts with width); the 5%
tolerance ignores specks smaller than 5% of a cell; WCAG's formula assumes solid
colors, so applying it per region over a photograph is a conservative
interpretation, not a certification. It supplements visual review — the
before/after evidence was judged by eye as well.

**Findings before the change.** Hero headline 1.23–1.32:1 (fail). The stricter
method also exposed the Just show up copy at 3.56–4.04:1 (fail) where lines
cross bright foliage — the earlier background-only sample had passed it. CTAs
(5.3–21:1) and the Just show up heading (3.6–3.8:1) passed.

**Options tried for the headline** (worst cell at 393 / 768 / 1440):

| Treatment | Result | Verdict |
|---|---|---|
| Letters 100%, no shade | 1.62 / 1.42 / 1.48 | Fails; also loses the ghost |
| Stronger halos (0.1em + 0.35em) at 60–75% | ≤ 1.45 | Fails: a halo darkens only a fringe; the cell around each letter stays bright |
| Graduated top-down sky shade 30–55% × letters 60–100% | passing combos need 45–55% at 60–75% | Passes but darkens the whole sky, including above the text, into flat grey |
| Band behind the headline with feathered edges inside the text box | 2.0–2.7 | Fails at the first and last lines |
| **Band at full strength across the headline's two lines, feathered outside it: 45% shade, letters 75%** | **3.53 / 3.24 / 3.36** | **Chosen**: passes everywhere; letters stay translucent; sky above and hill below keep their brightness |
| Same band at 55%, letters 60% | 3.56 / 3.36 / 3.40 | Passes; keeps Figma's opacity but makes the sky noticeably greyer |

**Final treatment.**
- Hero: headline 75% white (Figma 60%) over a `--foreground` band at 45%,
  full strength from the headline's first line box to its last, feathered with
  eased stops 80 / 96 / 160px above and below (mobile / tablet / desktop,
  interpolated). The band is sized from the headline's own fluid values, so it
  tracks it at every width. The halo was removed: the band does the work.
- Just show up: shade 30% → 42%, copy 90% → 100% white. On macOS 35% with
  full-white copy is the minimum that passes (worst 4.52:1 at 1920). A first
  push at 38% passed on macOS (≥ 4.85:1) but **failed on Linux CI: copy 4.47:1
  at 1280px** — Linux wraps and hints the text differently, so words land on a
  brighter patch of foliage. That is a genuine failure on a tested platform, so
  the shade was raised to 42% rather than the threshold lowered (macOS now
  ≥ 5.38:1; the same −0.5 platform gap still clears 4.5).
- Hero outline CTA: unchanged (50% black fill); re-measured, passes.

**Results after** (worst cell, macOS Chromium; 13 widths measured, 320–1920;
Linux CI runs the same assertions at 393/768/1440 and the sweep):

| Text | Needs | 393 | 768 | 1440 | 1732 | Range 320–1920 |
|---|---|---|---|---|---|---|
| Hero headline | 3.0 | 3.53 | 3.24 | 3.36 | 3.44 | 3.19 (1024) – 3.66 (320) |
| Hero "Find a Run" (black on white) | 4.5 | 19.91 | 21 | 21 | 21 | ≥ 19.9 |
| Hero "Become a Mtn Runner" | 4.5 | 5.27 | 7.11 | 13.21 | 13.87 | ≥ 5.27 |
| Just show up heading | 3.0 | 4.90 | 5.20 | 5.02 | 5.08 | 4.90 – 5.36 |
| Just show up copy | 4.5 | 6.25 | 5.73 | 5.53 | 5.77 | 5.38 – 6.25 |
| Just show up "Find a Run" | 4.5 | 21 | 21 | 21 | 21 | 21 |
| Just show up "Join Us" | 4.5 | 16.12 | 15.03 | 12.90 | 12.58 | ≥ 12.36 |

Evidence: `docs/review/cmr-homepage/hero-before-after-{1732,768,393}.jpg` and
`jsu-before-after-*.jpg` (Figma · before · after), regenerated full pages.

### Design-to-code deviations (classified per Owner decision D4)

Classes: **C** correction of an obvious inconsistency; **A** intentional
responsive adaptation, followed as drawn; **I** incomplete design, completed;
**L** accessibility (legibility) adjustment — measured; **R** needs design
review; **✓** accepted in the Owner/GPT review of 2026-11-08.

| # | Where | Figma | Code | Class |
|---|---|---|---|---|
| 1 | Hero photo, desktop | 768×1024 portrait stretched to 1732×968 (≈2.26× across, 0.95× down) | Same photo, uniform `cover` crop with the crest at the same height (~72%). The hill reads steeper than Figma's stretched version. | C ✓ (final photo still needed, D3) |
| 2 | Hero CTAs and card, desktop | 19px and 27px inside the container; aligned on tablet and mobile | Aligned to the container | C |
| 3 | "OWN MTNS" tracking | +10px at every size (overspaced on mobile) | 0.048em (equal to Figma at desktop) | C |
| 4 | Next-run card, tablet and mobile | Flattened text, no icons or arrow; no radius | Clock, pin, and arrow kept (they label time and place); radius stays desktop-only | I ✓ (icons), A (radius) |
| 5 | Hero outline CTA | White outline, no fill; label 1.5–1.9:1 over sky | 50% black fill; worst region ≥ 5.27:1 | L |
| 6 | Hero h1 | 60% white over pale sky | **As Figma** (60%) plus a soft halo in the foreground token. Worst region 1.19–1.36:1: **accepted WCAG AA exception** (Owner, 2026-11-08) | Exception |
| 7 | Community block | Desktop starts 9px left of the container and text overflows its box; tablet mark 39px high | Aligned to the container; mark centered at every size | C |
| 8 | Club totals surface | Cream fill hidden by a white child; white rules invisible | White, no rules, as rendered; empty slot 1:254 holds the provisional marker (below the figures on tablet and mobile) | C, R (Figma cleanup) |
| 9 | Display tracking (JSU, Flat, hills h2, hill names, run heading, stat values) | Fixed px at every size; collides on mobile ("JUSTSHOW") | em from the desktop ratio; tablet/mobile slightly wider than Figma | C ✓ |
| 10 | Run slots more than six days out | Not designed | "NOV 14 · 5:00 AM"; may run ~8px into the 32px gap on desktop | I |
| 11 | Run rows, tablet and mobile | No icons, ↗, or closing rule; link centered without arrow | As drawn | A |
| 12 | "Explore all hills", tablet and mobile | Absent (only path to `/hills` from the section) | Present, no arrow, in the space Figma leaves | I ✓ |
| 13 | Mt. Trashmore grey row | Grey fill at every size | Read as "featured hill" (the illustrated one); same fill is hover elsewhere | ✓ |
| 14 | Just show up | Copy 75% white over photo + 50% gradient; heading 2.6–2.8:1, copy below 3:1 | 30% black shade + copy at 90%. Heading 3.57–3.93:1 (meets 3:1); copy 3.55–4.04:1: **accepted WCAG AA exception** (Owner, 2026-11-08) | L (heading), Exception (copy) |
| 15 | Just show up, tablet copy measure | 550 | 540 (Figma's text renders ~1% wider; keeps its line breaks) | C |
| 16 | Topo pattern | 20% layer opacity | Already in the exported PNG; not re-applied (a first attempt applied it twice) | C |
| 17 | Flat statement, desktop | Text box overhangs the container by 7px | Centered in the container | C |
| 18 | Provisional markers | Not in Figma | Shown until content is verified; on tablet and mobile they add height (totals +54px, runs +26px) | I ✓ (D1) |
| 19 | Hover, active, focus, disabled states | Not drawn | CTA: cream / inverted / grey; rows: grey fill (hills), underline + ↗ nudge (runs); focus: 3px ring, white with a black gap on black and photos, black on white; `aria-disabled` 50% | ✓ (subject to continued accessibility validation) |
| 20 | Hill and run row heights, mobile/tablet | Row height includes the 1px rule | Padding reduced by 1px so rows equal Figma | C |
| 21 | Navigation "Apparel", footer form | — | Unchanged foundation decisions 1 and discrepancy 1 | — |

### Validation evidence (2026-11-08)

Deterministic checks (evidence, not Owner acceptance):

- `npm run lint`, `npx tsc --noEmit`, `npm run tokens:check`: pass.
- `npm test`: **188/188** (was 120; +68: fluid 8, schedule 21, hero 8,
  community + totals 8, runs 8, hills 8, closing sections 7).
- `npm run build`: pass; `/` prerendered with 1h revalidation; every run and
  hill route prerenders.
- `npm run test:e2e` (Chromium 393/768/1440): **97 passed, 8 skipped**
  (desktop-only sweeps and hover tests on other projects, plus the foundation's
  skips; after the PR #3 refinement). Includes: Figma geometry (hero, card, CTAs, section heights ±2px, run
  and hill row heights, display sizes at each frame), card overhang and
  stacking, overflow and CTA/card collision sweep at 15 widths from 320 to
  1920, CTA and row navigation (row clicks away from the link text), keyboard
  order, focus ring colors per surface, hover states, reduced motion, axe WCAG
  2.2 AA on the whole page including color contrast (0 violations), worst-region
  contrast of the five photo-text targets outside the accepted exceptions at each
  frame (hero headline and Just show up copy are measured and recorded, not
  asserted) plus a sweep at 320,
  600, 900, 1024, 1180, 1280, 1366, 1600 and 1920 (`contrast.mjs`), and no
  off-site requests.
- `npm run test:visual`: **12/12** — the 9 foundation baselines unchanged; the 3
  homepage baselines regenerated for the contrast refinement (macOS), with the
  clock-dependent card and run list masked.

Photographic contrast results: see "Photographic contrast" above (the earlier
10th-percentile figures are superseded).

Judgment review: per-slice and full-page overlays on Figma at 393, 768, and
1732, plus full pages at 1024, 1280, and 1440 (`docs/review/cmr-homepage/`). At
1400px and wider, desktop section tops are within 1–5px of Figma (968 / 1557 /
2049 / 2733 / 4004 / 4630 vs 967 / 1556 / 2048 / 2737 / 4009 / 4635). This is
not a claim of pixel-perfect fidelity; the differences are listed above.

### Known issues

- Contrast margins are smallest for the hero headline at 1024px (3.19:1 vs 3
  on macOS). Linux renders photo text differently (−0.5:1 observed on the Just
  show up copy), so CI on Linux is the authoritative gate; the sweep reports
  every failing width rather than stopping at the first. Changing the photo crop,
  shade, or headline geometry must re-run `contrast.mjs`; a replacement hero
  photograph (D3) will need re-measuring.
- The hero photo is visibly soft on desktop until the original is supplied.
- Visual baselines are macOS-only (unchanged limitation); the time-dependent
  run content is masked rather than snapshotted.
- "Next run" freshness depends on hourly revalidation, which needs a host that
  supports it (Vercel does; deployment is not authorized).
- ~~Pre-existing: `CmrLogo` uses the deprecated `priority` prop.~~ Fixed in Round 2 (`loading="eager"`).
- The calendar and hill pages are still scaffolds (outside this increment).

### Open Owner decisions

1. **Verify the restored treatments and the documented exceptions** (deviations
   6 and 14; "Accepted accessibility exceptions"). Decided 2026-11-08; shown here
   so final verification can confirm them. Revisit before launch if WCAG AA
   conformance is required for the hero headline or the Just show up copy; the
   tested fix is on this branch's history.
2. **Figma cleanup** (design-side, not blocking): the totals surface and empty
   frame 1:254 (8).
3. **Merge** of the PR.

Resolved in the 2026-11-08 review: hero headline contrast (decided: accepted exception, original treatment restored), uniform
crop, em tracking, featured Mt. Trashmore, Explore all hills and card icons on
tablet and mobile, hover/focus patterns, provisional markers.

### Release dependencies (before launch, not before merge)

- Verify or replace the runs, the hills CMR uses, the club totals, and the
  approximate hill figures (Round 2: from USGS data; Warren Hill unlocated);
  set them `verified`. Badges are no longer shown on the homepage (Round 2), so
  this is now the only safeguard against publishing unconfirmed facts.
- Original hero photograph edited as approved (≥ 3464px wide) and rights for
  every photograph and artwork (`public/home/README.md`).
- Formspree account configuration and one authorized real delivery test (Round 2).
- Carried over from the foundation: newsletter provider, social URLs, legal
  pages, deployment authorization.

### Acceptance criteria status

| Criterion | Status |
|---|---|
| Sections 1–7 in Figma order between Header and Footer | Met |
| Geometry at 393 / 768 / 1440 (+1732) within asserted tolerances; differences logged | Met (tests + overlays; log above) |
| No horizontal scroll or clipped text, 320–1920 | Met (sweep) |
| Links resolve to existing v1 routes | Met |
| Copy matches Figma; data from `src/lib`; unverified data marked; nothing fabricated | Met in Round 1. Round 2: badges removed by Owner direction; status kept as data; nothing fabricated (hill figures sourced, approximate, marked ≈) |
| Next run chronological from Chicago now, fresh via revalidation | Met (hourly) |
| One h1, heading outline, alt text, keyboard order, focus ≥ 3:1, axe clean | Met |
| Text over photography meets WCAG AA in its worst region | **Partially met**: CTAs and the Just show up heading meet it (asserted); the hero headline and Just show up copy do **not** and are Owner-accepted exceptions (not claimed compliant) |
| Reduced motion removes transitions | Met |
| No new runtime dependency; no MWDS change; shared UI unchanged with tests and baselines passing | Round 1: met. Round 2: `@formspree/react` added (Owner-directed); shared header/footer/CTA revised by direction with updated tests and baselines; no MWDS change |
| Lint, typecheck, tokens, Vitest, build, Playwright, visual pass | Met locally; CI green on PR #3 |
| Assets are faithful Figma exports with provenance recorded | Met (rights pending) |

## Planning record (discovery, 2026-11-07)

The sections below are the original plan, kept for history. Where they differ
from the implementation record above, the implementation record governs.

## Inputs and evidence

- Baseline: `main` at `e610c25c3bd11dfb1bc7f816dc56a857244731a2` (PR #2,
  MWDS foundation and shared UI, merged).
- CMR Figma `hLEeAchFtgd1WFtboIChil`: Home / Desktop `1:10` (1732 × 5702),
  Tablet `1:451` (768 × 4500), Mobile `1:884` (393 × 4873). Inspected with
  `get_metadata`, `get_design_context` per section per breakpoint,
  `get_variable_defs`, and full-frame plus section screenshots.
- MWDS library `H08HgMeVx6V23wY7aZdENf`: searched for icon and card components
  (`search_design_system`).
- Governing records: `define-cmr-v1-scope` (+ approval), the IA and content
  model (`define-cmr-v1-ia-and-content-model`, untracked, read only), visual
  direction (`explore-cmr-v1-visual-direction`, untracked, read only),
  `implement-cmr-mwds-foundation-and-shared-ui`, `implement-mwds-code-connect`.
- Next.js 16.4.5 bundled docs (`node_modules/next/dist/docs/`): Image
  (`preload` replaces the deprecated `priority`; art direction via
  `getImageProps`), route segment `revalidate` (previous caching model;
  `cacheComponents` is not enabled in `next.config.ts`).

Evidence (E) and inference (I) are labelled where the distinction matters.

## Current-state assessment

**Exists and is reused unchanged**

| Asset | Use on the homepage |
|---|---|
| `Header` + `NavLink` + `CmrLogo` (root layout) | Figma Navigation 1:436 / 78:259 / 78:377 is already implemented and geometry-tested. The homepage needs no header change: Figma's desktop nav is opaque white and sits over the top 122px of the hero frame, which equals the existing in-flow header. |
| `Footer` + `NewsletterSignup` (root layout) | Figma Footer 1:314 / 78:359 / 78:477 is already implemented. Its decisions (legal links hidden, social links env-gated, newsletter disabled until a provider is configured) apply unchanged. |
| `ui/button`, `ui/input` | Only inside `NewsletterSignup`. No homepage body element is an MWDS Button instance (E: hero and "Just show up" CTAs are plain frames). |
| MWDS tokens and Tailwind bridge | Colors, radii, spacing (4px grid), `text-p*`, `text-caption`, `text-h2`, `text-h3`, `font-mono`, shadows. |
| `src/lib/runs.ts`, `src/lib/hills.ts` | The data source for the runs list, next-run card, and hills list. Both currently hold one labeled placeholder record each. |
| `src/lib/navigation.tsx` | Route destinations (`/calendar`, `/hills`, `/about`, `/join`). |
| Vitest, Playwright (393/768/1440), axe, macOS `@visual` baselines, CI | Extended, not replaced. |

**Exists and is replaced:** `src/app/page.tsx` (scaffold placeholder).

**Missing:** every homepage section, CMR display typography and fluid scaling,
icons, inverse (on-dark and on-photo) CTA and focus treatments, the photo and
mesh-gradient backdrop, the run schedule model (weekday recurrence, workout
summary, duration), club totals data, and all homepage imagery.

**Observed, out of scope, not changed:** `CmrLogo` passes `priority` to
`next/image`, which Next.js 16 deprecates in favour of `preload`. It still
works. Recommend a one-line fix in a later shared-UI change.

## Figma section inventory

Display order is identical at all three breakpoints. Desktop measurements are
inside the 1400px container (48px side padding, so content is 1304px wide);
tablet uses 48px and mobile 24px side padding. "lh" is line height.

| # | Section | Desktop / Tablet / Mobile nodes | Content and structure | Destinations |
|---|---|---|---|---|
| 0 | Navigation | 1:436 / 78:259 / 78:377 | Existing `Header` | existing |
| 1 | Hero "Make your own MTNS" | 1:377 / 78:279 / 78:397 | Photo + mesh-gradient shader fill (20%); h1 "MAKE YOUR / OWN MTNS" (Geist Black, white, 60% opacity, centered, line 2 tracking +10px); CTAs "Find a Run" (white solid) and "Become a Mtn Runner" (2px white outline); black "Next run" card (eyebrow, title, clock + "TUE · 5:30 AM" in Geist Mono, pin + "Cricket Hill · Montrose Beach", "Run details →") | `/calendar`, `/join` (I), `/calendar/[slug]` |
| 2 | Community introduction | 1:16 / 78:291 / 78:409 | Vertical black hill-silhouette mark (raster, rotated −90°) beside a Geist Black + ss08 statement: "Chicago Mountain Runners™ is a running community for finding elevation, running it repeatedly and occasionally questioning our ~~sanity~~ decisions." | none |
| 3 | 2026 club totals | 1:243 / 78:294 / 78:412 | Heading; four stats: 132K ft Vertical climbed, 2.5K Total miles, 2 Runners on the hills, 240 Number of runs | none |
| 4 | Upcoming runs | 1:24 / 78:304 / 78:422 | Black surface. Eyebrow "Upcoming runs"; h2 "See you on the hill."; "See the full schedule →"; three run rows: day · time, run name, location, workout · duration, ↗ | `/calendar`, `/calendar/[slug]` |
| 5 | Chicago hills | 1:118 / 78:323 / 78:441 | h2 "Get high in the city."; intro copy; "Explore all hills →" (desktop only, see D4); Mt. Trashmore labeled 3D profile illustration; five numbered hill rows (01–05: name, park · neighborhood, ↗); the Mt. Trashmore row has a `#ececec` fill | `/hills`, `/hills/[slug]` |
| 6 | Just show up | 1:296 / 78:348 / 78:466 | Photo + the same mesh gradient (50%); h2 "JUST SHOW UP."; copy at 75% white; CTAs "Find a Run" (solid) and "Join Us" (outline) | `/calendar`, `/join` |
| 7 | Flat is a state of mind | 1:376 / 78:355 / 78:473 | White + topographic line pattern (raster, 20% opacity); 1px top border at 40% black; centered three-line Geist Black statement | none |
| 8 | Footer | 1:314 / 78:359 / 78:477 | Existing `Footer` | existing |

### Responsive layout by section (Figma, E)

| Section | Desktop (≥1400 container) | Tablet 768 | Mobile 393 |
|---|---|---|---|
| Hero | Frame 968 tall, of which 846 is visible below the header. h1 209/204. CTA row (h56, px28, 18px semibold, gap 12) and card share a top edge 799px from the frame top. Card is 542 wide, p32, radius 8, `0 24 30 rgba(65,65,65,.55)` shadow, and overhangs the next section by about 74px. | 670 tall. h1 98/102. CTAs h56 at y304. Card 380 × 245 at (340, 400), inside the hero, no radius, no icons. | 614 tall. h1 48/52. CTAs h48 with 15px text at y230. Card 345 × 245 full width at y326, no radius, no icons. |
| Community | Mark 93 × 385; statement 64/68, about 1053 wide, 36px gap | Mark 60.5 × 250; statement 42/44, 584 wide at x136 | Mark 30.7 × 127; statement 27/29, 297 wide at x72 |
| Totals | py96; heading 64/60.8 Black ss08; grid pt56, 4 × 302 columns, gap 32; value 96/60.8 (−1.92), unit "ft" 24; label pt12 16/24 | heading 44/46; 4 × 150 columns, gap 24; value 48/54; label 13/18 | heading 32/34; 2 × 2 grid, 162.5 columns, gap 20, rows 112 apart; value 48/54; label 13/18 |
| Upcoming runs | py96; heading row with link bottom-right; list pt56; row = grid 170 / 1fr (798) / 220 / 20, gap 32, py28, white top rule; final rule | Row 124 tall: time column 150 (14px mono), details at x170 (name 25/30, location 14/21), workout right-aligned on its own line; link centered below the list, no arrow | Row 166 tall, fully stacked (time, name 24/30, location, workout right-aligned); link centered below |
| Hills | py128; 2-column grid 620 / 620, gap 64; h2 96/88 (−3.84); copy 18/27 medium, 474 wide; illustration aspect 1448:1086; rows py24 with black top rule: index (mono 16), name 64/60.8 semibold, neighborhood (16) right-aligned, ↗ 20 | Heading 54/54 and copy in a 310 column; illustration 314 × 236 at right; rows 96: index mono 13, name 32/36, neighborhood below 13/20; no arrows | Single column; heading 48/48; illustration 345 × 259; rows 100 with the index indented 8px; name 28/36 |
| Just show up | py144; h2 144/129.6 (−6.48); copy pt32 630 wide 18/27; CTAs pt40 h56 | 430 tall; h2 80/80; copy 550 wide 16/24; CTAs h52 | 460 tall; h2 56/56 (wraps to 2 lines); copy 16/24; CTAs h52 |
| Flat | 710 tall; three lines 144/129.6 (−6.48), centered | 514; 110/108 | 398; 70/70 |

## Design analysis: discrepancies and ambiguities

Evidence first; the recommended handling follows. Items marked **D#** need an
Owner decision. Items marked **Rec** are planned unless the Owner objects at
review.

1. **Hero photo resolution (E). Blocks desktop fidelity (D3).** Every hero
   fill is a 768 × 1024 portrait raster. On desktop it fills a 1732 × 968
   landscape frame, so it is upscaled at least 2.25× (about 4.5× on 2× displays)
   and appears stretched. A sharp desktop hero needs the original photograph.
2. **Authored mesh-gradient shader (E) (D2).** Hero (20% opacity) and Just
   show up (50%) carry the same Figma "Mesh gradient" `ShaderFill`: static
   (`isAnimated: false`), 4 × 4 Catmull-Rom color mesh, WebGPU. Figma's
   tooling expects its WebGPU runtime to be shipped.
3. **Tablet and mobile frames are absolutely positioned and less detailed
   than desktop (E).** They omit the card's radius and icons, the run-row
   clock/pin/↗ icons, the hill-row arrows, the "See the full schedule" arrow,
   and the "Explore all hills" link. Desktop is fully auto-laid-out. (D4)
4. **Absolute letter-spacing is not scaled (E).** "JUST SHOW UP." and "FLAT
   IS…" use −6.48px at 144, 110, 80, 70, and 56px. On mobile, "JUSTSHOW"
   visibly collides in the Figma render. "Get high…" (−3.84) and hill names
   (−1.92) behave the same way. (D4, recommend em-based tracking from the
   desktop ratio.)
5. **Desktop off-grid offsets (E).** Hero CTAs sit 19px inside the container
   edge; the card's right edge is 27px inside; the community block starts 9px
   left of the container edge, and its 1053px text overflows its 1024px
   parent. Tablet and mobile align these to the container. (D4, recommend
   aligning to the container.)
6. **Mt. Trashmore row highlight (E; meaning is I).** The fifth hill row has a
   `#ececec` fill at all breakpoints and matches the illustrated hill. The
   most coherent reading is "featured hill whose profile is shown", not a
   frozen hover state. (D4, recommend: featured state; the same fill is the
   hover state for other rows.)
7. **Club totals surface (E).** Section 1:243 has a cream (`#f4f1e8`) fill
   fully covered by a white child, and its stat columns have 1px white top
   rules, invisible on white. The approved render is white with no visible
   rules. **Rec:** implement as rendered and log it for design cleanup.
8. **Unbound values (E).** `get_variable_defs` on the whole page returns only
   the newsletter instances' variables. Every body color, type style, and
   spacing value is raw. All colors still resolve to existing tokens by value
   (see Design-to-code mapping).
9. **Empty frame next to "2026 club totals." (E: node 1:254, 144 × 24, no
   children).** It is probably a placeholder for an "as of" note or link.
   **Rec:** render nothing and ask the designer.
10. **Content truth (E for text; I for status) (D1).** Runs (Cricket Mtn
    Repeats TUE 5:30 AM, Horner Hell Repeats FRI 5:30 AM, Schiller Quad Killer
    SAT 5:00 AM, with workouts and durations), five named hills with
    neighborhoods, club totals, and the illustration's labeled figures (summit
    669 ft, base 604 ft, rise 65 ft, prominence 85 ft) are real-world claims.
    Prominence exceeding the stated rise needs a factual check.
11. **Weekday-only schedule (E) versus the date-based Run model (D5).** The
    homepage shows "TUE · 5:30 AM", not dates; the IA's Run model has `date`
    as a required V1 field and a recurring flag as optional.
12. **Contrast on photography (I, to be measured) (D6).** At risk: h1 white at
    60% over a pale sky; the "Become a Mtn Runner" outline label over sky on
    tablet and mobile; Just show up copy at 75% white. The MWDS focus ring is
    black, which is invisible on the black runs section, the black card, and
    dark photography.
13. **"Shirts n' Stuff" / "Apparel" nav item** and the footer's legal and
    social links: already decided (foundation decisions 1, 2, 4). Not
    reopened.

## Proposed component architecture

Three layers, following the repository's existing conventions (flat
`src/components`, MWDS primitives in `src/components/ui`, data in `src/lib`).

**MWDS primitives:** none added. No homepage element is an MWDS instance;
the MWDS component library is not expanded in this increment.

**CMR shared components** (`src/components/`). Each is reused within the
homepage and is a likely candidate for later pages; none duplicates existing
functionality.

| Component | Purpose | Why shared |
|---|---|---|
| `Container` | `mx-auto max-w-[1400px] px-6 md:px-12`, the container already used inline by Header and Footer | Every section. Header and Footer are not migrated in this increment (no changes to merged components); adopting it there is a follow-up. |
| `CtaLink` | Link styled as the CMR photo CTA: `variant` = `solid-inverse` (white fill, black text) or `outline-inverse` (2px white border, white text); 6px radius (`rounded-md`); size from the section | Hero and Just show up; expected on Join and About. Not an MWDS Button variant (white-on-photo has no MWDS equivalent), mirroring how the header's Join Us CTA was handled (foundation discrepancy 6). |
| `ArrowLink` | Medium text link with a trailing 16px arrow; inherits color | "See the full schedule", "Explore all hills", "Run details" |
| `icons.tsx` | `ClockIcon`, `MapPinIcon`, `ArrowRightIcon`, `ArrowUpRightIcon`: the Figma-exported SVG paths verbatim (Lucide geometry; stroke 1.1667 at 16px, 1.25 at 20px), with `stroke="currentColor"` and `aria-hidden` | Four icons used 15 times. No `lucide-react` dependency; revisit if the icon count grows. |
| `PhotoBackdrop` | Full-bleed `next/image` photo, plus the baked mesh-gradient overlay at a given opacity, behind section content; sets the on-dark focus variables (see Interaction specification) | Hero and Just show up; the brand's photography-plus-gradient treatment |

**Homepage-specific components** (`src/components/home/`), one per section,
composed by `src/app/page.tsx`:

```
src/app/page.tsx                    Server Component; metadata; revalidate (D5)
└─ components/home/
   ├─ HomeHero.tsx                  PhotoBackdrop, h1, CtaLink ×2, NextRunCard
   │  └─ NextRunCard.tsx            eyebrow, title, <time>, location, ArrowLink
   ├─ CommunityIntro.tsx            mark (next/image, CSS-rotated) + statement
   ├─ ClubTotals.tsx                <dl> of stats from lib/club-totals
   ├─ UpcomingRuns.tsx              eyebrow, h2, <ol> of UpcomingRunRow, ArrowLink
   │  └─ UpcomingRunRow.tsx         stretched-link row
   ├─ ChicagoHills.tsx              h2, copy, ArrowLink, <figure> illustration, <ol> of HillRow
   │  └─ HillRow.tsx                stretched-link row, featured state
   ├─ JustShowUp.tsx                PhotoBackdrop, h2, copy, CtaLink ×2
   └─ FlatStateOfMind.tsx           topo pattern + statement
```

Run and hill rows stay homepage-specific until the Calendar and Hills index
pages are designed. The schedule, sort, and format logic goes in `src/lib` so
those pages can reuse it without reusing markup.

**Data** (`src/lib/`; no CMS, database, API, or new integration):

- `runs.ts`: extend `Run` (D5) with `schedule` (`{ kind: "weekly", weekday,
  time }` or `{ kind: "once", date, time }`), optional `workoutSummary`
  ("Hill repeats"), and optional `durationLabel` ("~60 min"). The latter two
  map to the IA's optional "expected duration" and the workout field. Add pure
  functions `nextOccurrence(run, now)`, `getUpcomingRuns(now, limit)`
  (chronological from now, per IA decision 4), `getNextRun(now)`, and
  `formatRunSlot()` ("TUE · 5:30 AM"), all in `America/Chicago`.
- `hills.ts`: keep `neighborhood` as the display string ("Montrose Beach ·
  Uptown"); add optional `profileIllustration` (src, alt, width, height).
  Array order is display order (01–05).
- `club-totals.ts` (new): `{ year, asOf, items: [{ value, unit?, label }] }`
  as display strings, maintained by hand (no Strava API). The section renders
  only when the Owner supplies values (D1).
- Homepage copy stays in the section components; it is fixed brand copy from
  Figma, not structured content.

**Styles:** `src/styles/cmr.css` (new, imported after the generated MWDS
files): a CMR app-layer stylesheet, explicitly not MWDS, holding (a) a
`fluid-type` utility that interpolates font size, line height, and tracking
piecewise-linearly between the Figma anchors (393 → 768 → 1400), and
(b) `display` defaults (Geist Black, `ss08`). Values stay at each call site
next to its Figma node ID, following the foundation's "off-scale values
reproduced and commented" precedent. They become candidates for Figma and
MWDS variables later. No generated token file or mapping is edited.

## Design-to-code mapping

| Figma value | Code | MWDS status |
|---|---|---|
| `#000000` text, fills, rules | `foreground`, `primary`, `border-foreground` | token (by value; unbound in Figma) |
| `#ffffff` surface, text on dark | `background`, `primary-foreground` | token |
| `#ececec` featured/hover row fill | `bg-border` (`general/border` = `cmr/divider` `#ececec`) | token value; semantic stretch, logged |
| `#f4f1e8` (hidden) | not rendered | `secondary` |
| White at 75% (JSU copy) | `text-primary-foreground/75` | token + opacity |
| Black at 40% (Flat top rule) | `border-foreground/40` | token + opacity |
| h1 at 60% opacity | `opacity-60` on the heading | raw opacity |
| Eyebrow 14/21, +1.5px, uppercase | `text-caption uppercase` | exact MWDS caption |
| Card title 30/30 −1 semibold | `text-h2 font-semibold` | exact MWDS h2 (desktop) |
| Run name 24/28.8 −1 semibold | `text-h3` | exact MWDS h3 (desktop) |
| Body 16/24, 18/27 medium, 14/20 medium | `text-p`, `text-p-lg font-medium`, `text-p-sm font-medium` | exact |
| Geist Mono 16/24 (times, index) | `font-mono text-p` | MWDS monospaced |
| Display: 209, 144, 110, 98, 96, 80, 70, 64, 56, 54, 48, 44, 42, 32, 28, 27, 26, 25px; Geist Black 900 + `ss08`; tracking −1.92 to −6.48 | `fluid-type` per call site | **not in MWDS** (MWDS h1 is 48 semibold) |
| 13px labels and index (tablet, mobile) | `text-[13px]` | **not in MWDS** (same precedent as the mobile nav) |
| Radius 8 (card), 6 (CTAs) | `rounded-lg`, `rounded-md` | token |
| Card shadow `0 24px 30px rgba(65,65,65,.55)` | arbitrary `shadow-[…]` | **not in MWDS** (closest is `shadow-2xl`, a different value) |
| Spacing 6, 12, 20, 24, 28, 32, 40, 48, 56, 64, 96, 128, 144 | numeric scale (`gap-1.5` … `py-36`) | all on the MWDS 4px absolute scale |
| Container 1400 / padding 48 / 24 | `Container` | matches Header and Footer |
| Mesh gradient | baked raster (D2) | **not in MWDS** (authored shader) |

## Asset inventory

None of these exist in the repository; all are Figma image fills or vectors.
Nothing was exported to the repository during discovery (inspection copies
were saved to the session scratchpad only).

| Asset | Figma source | Native size (E) | Format and plan | Responsive | Dependency |
|---|---|---|---|---|---|
| Hero photograph (hill, lone runner) | fill on 1:377 / 78:279 / 78:397 | 768 × 1024 portrait (desktop file differs from tablet/mobile) | `next/image`, `preload`, `sizes="100vw"`, `object-cover`, anchored bottom; art direction via `getImageProps` if desktop and mobile crops differ | Yes | **D3: original at ≥3464px wide**, plus provenance and rights. Interim: the Figma raster, flagged as soft on desktop. |
| "Just show up" photograph (trees on grass) | fill on 1:296 / 78:348 / 78:466 | 4096 × 3076 PNG, about 10 MB | Store a JPEG master (about 2880px wide, q≈90) rather than the 10 MB PNG; `next/image`, `object-cover`; desktop `object-position` ≈ 50% 6% (from Figma's crop), center elsewhere | Yes | Provenance and rights |
| Mesh gradient | `ShaderFill` (same parameters in both sections) | procedural | D2: bake once by running the authored WGSL verbatim in local Chromium, save a small PNG, and stretch it with `object-fit: fill`. The mesh is defined in normalized coordinates, so stretching equals rendering at the target aspect. One asset serves both sections at 20% and 50%. | No (stretched) | D2 |
| Community mark (hill silhouette) | fill on 23:103 / 78:292 / 78:410 | 4096 × 4096 PNG with alpha, mostly empty | Original file, drawn with `next/image` and a CSS crop and −90° rotation matching Figma. Do not trace or redraw. A vector original from the Owner would be preferable. | Size only | Provenance; vector if one exists |
| Mt. Trashmore 3D profile (labeled) | fill on 31:16 / 78:327 / 78:445 | 1448 × 1086 PNG with alpha | `next/image` inside a `<figure>`; Figma's −8.96% vertical offset reproduced; alt text carries the labeled figures | Size only | Provenance; factual check of the figures (D1) |
| Topographic pattern | fill on 1:376 / 78:355 / 78:473 | 1024 × 1024 PNG with alpha | Decorative CSS background or `aria-hidden` image at 20%, `object-cover` | No | Upscaled about 1.7× on desktop; an SVG or higher-resolution original preferred. Provenance. |
| Icons (clock, map-pin, arrow-right, arrow-up-right) | vectors in 1:24, 1:118, 1:407 | 16 and 20 px SVG | `icons.tsx` (verbatim paths, `currentColor`) | No | none |
| CMR wordmark | — | — | existing `CmrLogo` | — | none |

Exporting production assets is a separate step taken at implementation time;
each exported file's source node and export settings are recorded in
`public/home/README.md`.

## Interaction specification

Figma draws no interaction states for the homepage body. The behavior below is
designed to match MWDS and the merged shared UI; items marked (review) need
design sign-off (D6).

- **Links and destinations.** Hero "Find a Run" and Just show up "Find a Run"
  go to `/calendar`; "Become a Mtn Runner" (I) and Just show up "Join Us" go
  to `/join`; "Run details" and each run row go to `/calendar/[slug]`; "See
  the full schedule" goes to `/calendar`; "Explore all hills" goes to
  `/hills`; each hill row goes to `/hills/[slug]`. All internal, `next/link`.
- **Rows** use a stretched link: the run or hill name is the only anchor, and
  a `::after` overlay makes the whole row clickable. The accessible name stays
  short, and there are no nested interactive elements.
- **Hover (review).** Hill rows use `bg-border` (`#ececec`, the Figma
  highlight). Run rows (on black) underline the name and nudge the ↗ by 2px.
  `ArrowLink`s underline and nudge the arrow. `solid-inverse` CTAs use
  `bg-secondary` (cream). `outline-inverse` CTAs invert to white fill with
  black text. Transitions are color and transform only, 150ms, and disabled
  under `prefers-reduced-motion`.
- **Featured hill (D4).** The row whose hill has a profile illustration keeps
  the `#ececec` fill and is associated with the figure through
  `aria-describedby`. The illustration does not change on hover (only one
  illustration exists).
- **Focus (review).** The 3px ring plus 2px offset from foundation decision 5,
  with color by surface. On white: `ring` (black). On black and on photos, the
  section sets `--ring: var(--primary-foreground)` and `--focus-offset` to the
  surface color. This is the same local-override pattern the footer uses for
  `--focus-offset`, and it uses only tokens.
- **Keyboard order** follows the DOM. On desktop, "See the full schedule"
  appears visually top-right but sits in the DOM after the list (its
  tablet/mobile position), so reading and tab order put it after the runs.
  This is an intentional, minor visual/DOM divergence on desktop.
- **Next-run card and list** are computed in `America/Chicago` and ordered
  chronologically from "now" (IA decision 4). The page revalidates hourly
  (`export const revalidate = 3600`, D5) so the card does not go stale between
  deploys. Each slot renders `<time dateTime>` for its next occurrence.
- **Empty and partial data.** With no runs, the card is omitted, and the runs
  section shows "No runs on the calendar yet." with "See the full schedule".
  With fewer than three runs, the list shows what exists. With no hills, the
  list is omitted (heading, copy, and link remain). Without club totals, that
  section is omitted.
- **Motion:** none designed and none added.

## Responsive strategy

- **Three layouts, continuous type.** Mobile (<768), tablet (768–1023), and
  desktop (≥1024) layouts match the header's existing `md` and `lg`
  switches. Display type, stat values, and hero geometry interpolate between
  the Figma anchors (393 → 768 → 1400) with `fluid-type`, so they hit Figma
  values exactly at 393, 768, and ≥1400, and no intermediate width jumps or
  overflows. The desktop design is the container-max state: from 1400px up,
  layout is fixed and centered (the 1732px Figma frame and the 1440px test
  viewport render the same content box).
- **Pressure points between anchors**, each to be verified at 1024 and 1280:
  the totals row (four 96px values in 208px columns at 1024 needs the fluid
  scale), the hills 2-column grid (a 96px heading in a 432px column), the
  desktop run grid (fixed 170/220/20 columns with a flexible title column),
  and the hill-row name and right-aligned neighborhood.
- **Images.** `object-cover` with Figma's anchor per breakpoint; hero
  `preload`; all others lazy; explicit `sizes`. The desktop card overhangs the
  hero by about 74px (negative bottom margin on the card, with matching top
  padding in the community section); on tablet and mobile the card sits inside
  the hero.
- **Overflow.** No horizontal scroll from 320px up (asserted). Display lines
  may wrap (for example "JUST SHOW UP." on mobile, as designed) but are never
  clipped.
- **Touch targets.** CTAs 48–56px tall; rows ≥96px; text links 24px high
  (meets WCAG 2.5.8 at 24 × 24).

## Implementation sequence

Each slice ends with a working, tested section on `/` and a screenshot
review against Figma at 393, 768, and 1440, plus 1732 for desktop pixel
comparison. Work on branch `feat/cmr-homepage`.

| Slice | Delivers | Needs |
|---|---|---|
| 1. Community intro + club totals | `Container`, `cmr.css` (`fluid-type`, display defaults), `CommunityIntro` (mark asset), `ClubTotals` + `lib/club-totals.ts` | D1 for real totals (otherwise the section ships hidden) |
| 2. Upcoming runs | Run model extension + schedule logic (unit-tested across weekday, midnight, and DST boundaries), `icons.tsx`, `ArrowLink`, `UpcomingRuns`, on-dark focus treatment | D5; D1 for real runs (otherwise labeled fixtures) |
| 3. Chicago hills | Hill model extension, `HillRow` with featured state, illustration `<figure>` | D1 (hills, illustration figures), D4 |
| 4. Just show up + Flat | Mesh bake script + asset, `PhotoBackdrop`, `CtaLink`, JSU photo master, topo pattern | D2 |
| 5. Hero + next-run card | `HomeHero`, `NextRunCard` (reuses slices 2 and 4), hero photo, `revalidate` | D3 (interim raster allowed, flagged) |
| **Full-page preview** | First complete page. Owner browser review at 393, 768, 1024, 1440 against Figma, with the asset gaps listed. | — |
| 6. Hardening | Section-rhythm tuning from the full-page review; metadata (title, description); intermediate-viewport sweep; full a11y and keyboard pass; `@visual` baselines; README and asset provenance; update this record | — |

If D2 or D3 is unresolved when slice 4 or 5 starts, those slices proceed with
the interim treatment and the gap is recorded. The rest of the plan is not
blocked.

## Testing and validation

Deterministic checks are evidence, not Owner acceptance. Passing tests is not
proof of visual fidelity.

- **Unit and component (Vitest, jsdom).** Schedule math (`nextOccurrence`
  across week wrap, the same day before and after the start time, DST
  changeover, `America/Chicago` regardless of the host time zone);
  `formatRunSlot`; chronological ordering; each section's headings
  (exactly one h1, h2 per section), link names and hrefs, alt text, `<time>`
  values, empty and partial data states; `CtaLink` and `ArrowLink` variants;
  axe per section (contrast excluded in jsdom, as today).
- **Browser (Playwright, Chromium; projects at 393, 768, 1440, plus a
  review-only 1732 project).** Figma geometry per section at the three anchors
  (container x, heading font size and line height, row heights, CTA and card
  boxes, card overhang on desktop); computed token colors; fluid type equals
  Figma at the anchors and is monotonic between them; no horizontal overflow
  at 320, 600, 1024, 1180, and 1280; keyboard Tab order through the page;
  visible focus on white, black, and photo surfaces (ring ≥3:1 against the
  surface, checked like the foundation's footer test); `reducedMotion:
  'reduce'` removes transitions; axe on `/` including contrast.
- **Contrast on photography.** axe returns "incomplete" for text over images,
  so a dedicated test samples the rendered pixels behind the h1, CTA labels,
  and JSU copy and reports the ratio. Failures feed D6; they are not silently
  accepted.
- **Shared-UI regression.** Existing header and footer specs also run against
  `/`; the footer and header `@visual` baselines must not change.
- **Visual fidelity (human-reviewed).** Figma section screenshots at 393, 768,
  and 1732 are captured into `tests/visual-reference/home/`. A local review
  page shows each section side by side and as an overlay with the build at the
  same width. Each slice records the reviewer's findings here. `@visual`
  baselines (macOS) are added per section after review.
- **Build.** `npm run lint`, `npx tsc --noEmit`, `npm run tokens:check`,
  `npm test`, `npm run build` (`/` prerenders with revalidate), `npm run
  test:e2e`, `npm run test:visual`. CI runs everything except `@visual`, as
  today.

## Risks and dependencies

| Risk | Effect | Mitigation |
|---|---|---|
| Hero photo only 768px wide (E) | Soft or stretched desktop hero; fails the fidelity bar | D3; interim raster plus recorded gap |
| Content is not real or not approved (D1) | Publishing invented facts; rework of data and illustration | D1; labeled fixtures until confirmed; totals hidden without values |
| Tablet and mobile frames are less specified (E) | Rework if the design intends literal differences | D4 resolves it once |
| Display type at intermediate widths | Overflow or awkward wraps at 1024–1280 | Fluid scaling plus viewport sweep tests |
| Contrast over photos (D6) | WCAG 1.4.3 / 1.4.11 failures in hero and JSU | Measure in slice 4 and 5; design adjustment if needed |
| Next-run staleness | Wrong "next run" between deploys | Hourly revalidate (D5); deployment itself remains separately authorized |
| Asset weight (10 MB PNG) | Repository size, build time | JPEG master; `next/image` optimization |
| Provenance unknown for all imagery | Publishing without rights | Owner confirms per asset before launch (not before implementation) |
| `@visual` baselines are macOS-only | Visual regressions unseen in CI | Unchanged known limitation; run `test:visual` locally per slice |
| Two Work Items remain untracked | Governing state exists in one working copy only | Recommendation below; not changed here |

## Owner decisions requested (planning; superseded by the 2026-11-07 authorization above)

1. **D1 — Content.** Are the Figma runs (three weekly runs with times,
   locations, workouts, and durations), the five hills and neighborhoods, the
   club totals (132K ft, 2.5K mi, 2 runners, 240 runs, year 2026), and the
   Mt. Trashmore figures real and publishable? Recommended: confirm or correct
   them; they become the first real records in `src/lib`. Unconfirmed
   items render as labeled fixtures, and club totals stay hidden.
2. **D2 — Mesh gradient.** Recommended: bake the static shader to a
   committed raster (exact output, no WebGPU runtime, no client JS). The
   alternative ships Figma's WebGPU `ShaderFill` runtime with a static
   fallback for browsers without WebGPU.
3. **D3 — Hero photograph.** Please supply the original image (≥3464px wide,
   plus any separate mobile crop) and confirm rights for it, the Just show up
   photo, the topographic pattern, the illustration, and the mark.
4. **D4 — Breakpoint consistency (design sign-off).** Recommended: (a) carry
   the desktop details (card radius and icons, row icons and arrows, schedule
   arrow, "Explore all hills" link) to tablet and mobile; (b) use em-based
   tracking from the desktop ratios; (c) align the desktop hero CTAs, card,
   and community block to the container; (d) treat the Mt. Trashmore highlight
   as "featured hill".
5. **D5 — Run schedule model.** Recommended: weekly recurrence (weekday +
   time) with optional dated one-off runs, computed in Chicago time, with
   hourly revalidation of `/`. This changes the IA's required `date` field for
   recurring runs, which is why it needs your decision.
6. **D6 — Interaction and contrast sign-off.** Approve the hover and focus
   treatments above (inverse white ring on dark and photo surfaces). If the
   measured contrast of the hero h1, the "Become a Mtn Runner" label, or the
   JSU copy fails, choose between a Figma-designed legibility treatment (for
   example a scrim or a darker crop) and accepting it for the display h1 only.

## Acceptance criteria

- `/` renders sections 1–7 in Figma order between the existing Header and
  Footer, and replaces the scaffold placeholder.
- At 393, 768, and 1440 (and 1732 for desktop), each section matches Figma
  geometry within the asserted tolerances, and a recorded side-by-side review
  finds no unexplained differences. Every accepted difference is listed in the
  discrepancy log with its decision.
- No horizontal scroll and no clipped text from 320 to 1920px; display type
  scales continuously and equals Figma at the anchors.
- All links resolve to existing v1 routes; run and hill rows open the correct
  detail pages; no link points to an out-of-scope or invented destination.
- Content matches Figma copy exactly; data-driven parts come from `src/lib`;
  unconfirmed data is visibly labeled or hidden per D1; nothing is fabricated.
- The next-run card and list are chronological from the current Chicago time
  and stay correct across revalidation.
- Exactly one h1; a logical heading outline; informative images have alt text
  and decorative ones are hidden; keyboard order is logical; focus is visible
  (≥3:1) on every surface; axe reports no WCAG 2.2 AA violations; pixel-sampled
  contrast passes or has an Owner-recorded exception (D6).
- `prefers-reduced-motion` removes all transitions.
- No new runtime dependency; no MWDS component or token-contract change;
  Header, Footer, and NewsletterSignup unchanged, with their tests and visual
  baselines passing.
- Lint, typecheck, `tokens:check`, Vitest, build, Playwright, and
  `test:visual` all pass; CI is green.
- Every committed asset is a faithful Figma export or an Owner-supplied
  original, with source and provenance recorded.

## Scope and exclusions

In scope: the homepage (`/`), its sections, assets, data-model extensions in
`src/lib`, the CMR shared components listed above, `src/styles/cmr.css`,
tests, and documentation.

Out of scope: Calendar, Run detail, Hills, Hill detail, About, and Join page
designs (they keep their current scaffolds and stay reachable); MWDS
library expansion; Code Connect; Storybook; header or footer changes;
newsletter provider selection; social handles; legal pages; accounts, RSVP,
Strava API, commerce, and membership; deployment; any Figma edits.

## Validation approach

Deterministic: the test suite above. Judgment: per-slice screenshot review
against Figma by the orchestrator, then Owner review at the full-page preview
and at completion. Judgment results are recorded as review findings, not as
pass/fail checks.

## Proposed process improvements (not implemented)

- **Commit the two untracked Work Items** (repeated from the foundation
  record). This plan depends on both.
- **Refresh stale state.** `profile.md` `bootstrap.next_governed_action` and
  the foundation Work Item (`status: active`, `current_responsibility: owner`)
  predate the PR #2 merge. Recommend the Owner close the foundation item and
  point `next_governed_action` at this one.
- **Close `explore-cmr-v1-visual-direction`.** Its recorded outcome (an
  approved Figma direction) now exists in the CMR file.
- **Design-side hygiene for Figma:** bind homepage colors and type to MWDS
  variables; convert tablet and mobile frames to auto layout; draw hover and
  focus states; resolve the club-totals surface and the empty 1:254 frame.

## Authority requirement

None structurally. Implementation is local, reversible, in-repo work within
the approved v1 scope. The Owner has nonetheless gated implementation on review
of this plan (`blocker_state: awaiting-owner-review`). Committing, pushing,
opening a PR, merging, exporting production assets into the repository, and
deployment each need explicit authorization when reached.
