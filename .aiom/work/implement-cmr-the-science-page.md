---
seed_version: '0.1'
id: implement-cmr-the-science-page
title: Implement The Science editorial resource page (/the-science)
objective: >-
  Add "The Science" to the global navigation and publish /the-science, a
  long-form, sourced editorial resource on the physics, physiology, breathing,
  psychology and practice of running hill repeats in a flat city, built on the
  established CMR design system, with a sticky subsection navigation, an
  animated contour hero, monochrome diagrams and three small interactive
  figures. Merged (PR #13) and verified in production.
status: complete
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - content-publication
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-09T21:00:00.000Z'
updated_at: '2026-11-10T00:40:00.000Z'
---
## Status

**Complete: merged and deployed (2026-11-10).** PR #13 merged as merge commit **`9ae4a29`** (head `ddd7769`, merged with a head-commit guard). `validate`, `browser` and the Vercel Preview passed on the PR head; CI passed on `main` at `9ae4a29`; the production deployment (`dpl_CshnYp5WJ6NyGNCpoQYXLXM4DKHq`, built from `9ae4a29`) is Ready at https://cmr-site-xi.vercel.app. See Outcome.

**Authorization:** Owner instructions of 2026-11-09: (1) the "The Science" brief and its hero-animation direction (implement through a validated PR, no merge); (2) the refinement pass on the Preview (same PR, no merge); (3) the final pass, which authorized the last refinements, merging PR #13 only, production verification and post-merge cleanup (no force-push, no rule changes, no unrelated PRs). No approval artifact was added; the instructions are recorded here.

Not touched: `plan/cmr-join-page` and its uncommitted records in the primary worktree; PR #5. PR #11 merged while this was in progress; its header changes (Join tooltip, white CTA) are kept and the four-link spacing was re-validated on top of them.

## What was built

| Part | Implementation |
|---|---|
| Route | `src/app/the-science/page.tsx` (static). Title "The Science \| Chicago Mountain Runners", description metadata. No sitemap exists in the app, so none was added |
| Global nav | One entry in `primaryNav` (`src/lib/navigation.tsx`), between Chicago Mtns and About. Header and mobile menu are the existing ones |
| Hero | `ScienceHero` + `TerrainLines` (Canvas 2D): approved eyebrow, headline, subtitle and intro verbatim; black ground, light-gray terrain lines, a black wash from the left (vertical on phones) | *(Final pass: `TerrainLines` replaced by the hill pages' `HillHeroBackground`; headline now "The science behind hill repeats?"; no eyebrow.)*
| Section bar | `ScienceNav`: sticky under the header's visible bar, eight anchors, current-section indicator, one horizontally scrolling row on small screens | *(Final pass: replaced by the shared `SectionNav`, same behaviour.)*
| Sections 02–09 | `src/components/science/sections/*`, in the brief's order, headings as given |
| Figures | Incline geometry with grade slider; four-point energy-cost chart; joint-action schematic; elevation accumulator; breathing-pattern guide; repeat waveform; ascent/descent pair; workout profile icons. All inline SVG (except the hero canvas), monochrome |
| Sources | `src/content/science-sources.ts`: 22 verified entries, numbered by first citation, stable anchors `#source-<id>`; inline `Cite` links to them; educational-information disclaimer under the list |

Client JavaScript is limited to the hero canvas, the section bar, the slider, the accumulator and the breathing guide. No new dependencies.

## Decisions and deviations (implementation judgment, for Owner review)

1. **Hero animation: an original Canvas 2D renderer, not ContourField.** The reference is a perspective terrain whose contour lines are lifted to their elevations. ContourField draws flat contours in a fragment shader and can't produce that geometry, so `TerrainLines` computes a height field (3D simplex noise), extracts contours (marching squares) and projects each at its level's height. It reuses ContourField's motion contract: the site motion preference (`data-motion`, footer Pause motion, system reduced motion) gives one still frame; paused off screen and in hidden tabs; ≤ 24 fps, dropping to 12 if a frame costs more than 14ms; DPR and pixel caps. Speed was set by eye to match the slow drift of "Flat is a state of mind". The watermarked reference was viewed locally for direction only (a few frames in a scratch folder); nothing from it is in the repo or the site. Its on-screen figures and summit callouts were left out.
2. **Header spacing for a fourth link** (`Header.tsx`). At 768 the four links, logo and CTA did not fit on one line (About wrapped), and at 393 the link row was 3px too wide (the page scrolled sideways). Tablet: one gap value of 16px (was 24) between links and before the CTA. Mobile: cell padding 6px (was 8) and type 15px from 393 up and `clamp(11.5px, 3.65vw, 15px)` below it (≈ 11.7px at 320, leaving room for Linux's wider font rendering, found in CI), with sideways scroll inside the row as a last resort. Desktop unchanged. Two `@visual` header baselines (mobile, tablet) were updated; the diffs show only the new link and its spacing.
3. **Section headings at 40 / 52 / 80px** (the hill pages use 48 / 54 / 96) so eight display headings don't dominate a long reading page. Same weight, tracking and style.
4. **Scroll offsets** are page-scoped `scroll-padding-top` sized to the tallest header state after a jump (phones: the top row can return when jumping upward, so 114 + 49 + 20px). After a downward jump on a phone there is about 64px of extra space above a heading; it is never covered. Sections carry a negative `scroll-margin-top` equal to their padding so a jump lands on the eyebrow, not on empty padding.
5. **Section links glide** under the system's `prefers-reduced-motion: no-preference` only. Navigation scrolling is functional motion, so it follows the system setting, as `src/lib/motion.ts` specifies; the decorative terrain follows the site preference.
6. **Energy-cost chart shows four points only**, the values in the abstract of Minetti et al. (2002), with no curve between them, because the full table was not read.
7. **Accumulator has no hill presets.** Hill figures in the repo are approximate USGS-derived profiles on `provisional` records, not Owner-verified repeat gains. The 40 ft default is labelled illustrative; a link goes to the hill pages.
8. **Workout examples are conservative and hill-agnostic.** The cited protocols (10 to 14 × 30 s at ≈ 10%) involved athletes and active adults; the examples start below them and name no hill distances or elevations.
9. **Founder note** is a short, attributed paragraph in the pressure-breathing subsection and says explicitly that it is one runner's experience, not evidence about oxygenation or performance.
10. **Two words reworded for the privacy audit:** "segments" and "plausible" match the audit's analytics patterns (Segment, Plausible) in served HTML. The copy says "limbs and joints" and "Reasonable, then".

## Research verification log

Method: every candidate in the brief and every added source was resolved on 2026-11-09 through NCBI E-utilities (PubMed records, abstracts; PMC full text for Lu et al. 2025) or Crossref (Shao et al. 2024, abstract included). Metadata in `science-sources.ts` is copied from those records. All 22 DOIs resolve at doi.org, all 21 PubMed IDs and 11 PMC IDs resolve. The copy was written from the abstracts; each claim cites the source that states it.

All ten candidates from the brief were verified and are used: Minetti 2002; Lu 2025 (the 2025 review); Tham 2026 (the 2026 meta-analysis); Bontemps 2025 (downhill soreness and repeated exposure); Balban 2023; Shao 2024 (the Springer slow-breathing meta-analysis); Rupp 2019 and Rupp 2021 (PEP); Singh 2025 (exercise and cognition); Zhai 2026 (psychological skills and mindfulness in runners).

Added: Vernillo 2020 and Khassetarash 2020 (graded-running biomechanics), Barnes 2013 (uphill interval training), Sheel & Romer 2012 (ventilation and respiratory mechanics), Zaccaro 2018 (slow breathing), Luks 2024 (WMS altitude illness guidelines), Pageaux 2016 (perception of effort), Singh 2023 and Noetel 2024 (exercise and mental health), Meeusen 2013 (overtraining consensus), Bontemps 2020 (downhill running review), Hyldahl 2017 (repeated-bout effect).

Considered and not used: Brick, MacIntyre & Campbell 2014 (attentional focus in endurance activity). It is real (Crossref), but its abstract could not be read, so it is not cited.

Limitations stated on the page: the 2026 meta-analysis found no significant pooled effect of uphill training on knee strength, jumping or aerobic capacity (low certainty); Barnes 2013 had no flat-ground control; mental-health evidence is for exercise in general and is rated low-certainty in parts; the 2026 runner review found psychological signals but no reliable performance effect; no controlled study of the guide-taught pressure-breathing technique was found, and PEP device studies are not equivalent to it.

## Validation

Local, on the rebased PR head (macOS, Node 24): `eslint` clean; `tsc --noEmit` clean (apart from the generated `PageProps`/`LayoutProps` that exist only after `next build`); `tokens:check` passes; `next build` passes (`/the-science` static). Vitest: 37 files, 462 tests, all pass (new: `tests/lib/science.test.tsx`, `tests/components/science/ScienceInteractives.test.tsx`). Playwright at 393 / 768 / 1440: 439 passed, 0 failed (new `tests/e2e/science.spec.ts`, 76 tests: sticky placement under every header state, one-row bar, anchors and fragment reload never covering headings, current-section tracking, keyboard and focus ring, citations, reduced motion, motion toggle, canvas drawing, the three interactives, monochrome SVG colors, no images, no sideways scroll including the header at 320px, axe WCAG 2.2 AA with contrast). `/the-science` was added to the privacy audit (no third-party requests, cookies or storage). `@visual`: the two updated header baselines pass. **Pre-existing, not caused here:** 23 full-page and footer `@visual` comparisons (home, hills, Join, FAQ, calendar, legal pages, footer at tablet/desktop) fail identically on unmodified `main` at `6f5fff5`, because PR #11 changed the footer, Join and hold UI without updating the macOS baselines (visual specs don't run in CI). Left as is (out of scope); re-baselining them belongs with that work or a separate Owner-approved step. Real-browser screenshots were reviewed at all three widths for the hero, every section, the section bar in each header state, and the figures. CI and Preview results are recorded in the PR.

## CI and Preview (PR #13)

- **Code head `23717ea`:** GitHub CI `validate` and `browser` pass; Vercel Preview **Ready** (`dpl_2H2GEeQCusoYFV844sEisejpe37w`, alias https://cmr-site-git-feat-cmr-the-science-mikewhitaker-projects.vercel.app). The build log shows `/the-science` prerendered as static from commit `23717ea`.
- Two CI-only issues were found and fixed on the branch: at 320px Linux renders the four mobile links about 3% wider than macOS, so the type below 393px was tightened (`65f9e44`); one canvas test sampled before hydration on a slow runner, so it now waits for the first frame (`23717ea`, stable over 45 repeated runs).
- **Preview access:** the Preview is behind Vercel Deployment Protection (Vercel login). `vercel curl` would create an automation bypass secret on the project when none exists, which changes the project's protection settings, so it was not used. Page-level checks were therefore run on a local production build of the same commit at 393 / 768 / 1440 (screenshots and the e2e suite) and in CI. The Owner can open the Preview while signed in to Vercel.

## Refinement pass (Owner review of the Preview, 2026-11-09)

Same PR (#13), same branch. Copy, sources, citations, sticky section bar and interactives preserved; copy changed only where the layout required it ("The accumulator below handles the arithmetic" → "The accumulator handles the arithmetic", the readout label "Rise per 100 ft" → "Rise", the three instruction lines).

| # | Direction | Implementation |
|---|---|---|
| 1 | Hero | Eyebrow removed. `TerrainLines` rebuilt for the reference's layered formations: peaks on an unbounded jittered lattice whose contour rings stack into tapering spires, low meandering ground contours between them, a steeper camera (≈ 33°) so the field fills the frame with no horizon, a light domain warp for irregular rings, soft fades at both depth ends. Drift ≈ 7–8 px/s mid-field (the "Flat is a state of mind" contours move ≈ 6.5 px/s); no loop or reset (new peaks arrive from the distance indefinitely). Same safeguards: motion preference, Pause motion, off-screen and hidden-tab pause, pixel cap; now ≤ 20 fps, dropping to 12 if a frame costs > 18 ms; noise calls per sample cut from about 12 to 3. Wash: near-solid black behind the copy (to 45% of the width from 1024px, vertical on phones and tablets) |
| 2 | Alternating fills | White / black from Physics to Sources. Black sections scope the theme variables (`.science-dark` in `src/styles/cmr.css`; the theme is `@theme inline`), so text, citations, rules, focus rings and buttons invert without per-component changes. Section rules removed; fills separate sections |
| 3 | Eyebrows | Numbers removed ("PHYSICS"); figure numbers kept |
| 4 | Two columns | `SplitRow` (from 1280px): figure right for Physics, Training, The Mind; left for Physiology, Breathing, Descending. Tops aligned; figure sticky beneath the section bar while its text scrolls. A `SplitAfter` continuation lets the text keep flowing beside a tall figure. Below 1280 the text comes first, then the figure, then the continuation, which is also the DOM and reading order. Physics has two rows (incline, then cost chart). Workouts and Sources keep their layouts. 1280 rather than 1024 because at 1024 each column would be about 430px, too narrow for the text |
| 5 | Figure frames | `Figure`: rounded-2xl frame, 20 to 40px padding, the homepage TBD circles' treatment reused exactly (`cmr-tie-dye` with `grayTintVars`), light palette restored inside (`.science-light`). No pastel tints. The brief's item 10 says "pastel frame"; item 5 specifies grayscale and no pastels, so grayscale was used |
| 6 | Incline | Starts flat; when at least half in view, rises to 10% over 1.8s (ease in-out), grade, angle and rise in step; once per page view; any slider input cancels it; reduced motion jumps to 10%. Annotations re-laid out so none touch the slope, the baseline or each other from 0% to 45% at 320 to 1440px, all inside the drawing (checked mechanically); "Horizontal distance" and "Along the surface" labelled distinctly; larger label type on phones. No screenshot was attached to the brief, so the collisions were found by testing 0%, 10%, 25% and 45% |
| 7 | Instructions | `Instruction` after the text that introduces each interactive figure (incline, accumulator, breathing). "figure to the right/left" from 1280px, "figure below" below it; only the visible wording is exposed |
| 8 | Physiology figure | New technical line drawing (`runner.ts`, `RunnerIllustration`): side view of a runner pushing off up a 10° slope, adult proportions, one continuous outline (stroke-under, fill-over), far limbs in gray, gluteus maximus, quadriceps and calf hatched in place with short leader lines. Built from a skeleton and anatomical width profiles; no external art. The joint-action list moved into the text beside it so the framed figure fits the viewport while sticky |

Refinement validation: lint, tsc, tokens:check, build pass; Vitest 469/469; Playwright 466 passed / 0 failed (new tests: fills alternate, eyebrows unnumbered, frames, sides alternate with tops aligned, text-first stacking, instruction wording per width, incline animates once / cancels / reduced motion, runner labels, monochrome check including oklab neutrals); `@visual`: header baselines pass, and the same 23 pre-existing failures as `main` (see Validation). Screenshots reviewed at 1440 / 768 / 393, including Figure 1 at 0% (before) and 10% (after), 25% and 45%.

## Final pass (Owner authorization 2026-11-09: refine, merge, verify, close out)

`main` had moved to `23687ef` (PRs #14–#17: permit hold lifted, footer rebuilt with a "Navigate" list, FAQ sticky category bar) and PR #13 conflicted. `main` was merged into the branch (a merge commit, no history rewrite or force-push). One conflict, in `src/styles/cmr.css`: the FAQ's scroll-padding rule and this page's now share one rule (`faq-nav`, `science-nav`).

| # | Direction | Implementation |
|---|---|---|
| 1 | Hero background | The hill pages' own background, extracted unchanged into `HillHeroBackground` (`src/components/hills/HillHero.tsx`) and used by both `HillHero` and `ScienceHero`: the same ContourField, props, colour, fallback, reduced-motion and Pause motion behaviour. The custom `TerrainLines` animation was deleted. The black wash over the left side was kept for the copy's contrast |
| 1 | Headline | "The science behind hill repeats?" as written; balanced wrapping, no line breaks. Title "The science behind hill repeats \| Chicago Mountain Runners", description updated; route `/the-science` and nav label "The Science" unchanged |
| — | Section bar | Adopted the shared `SectionNav` that PR #16 generalized from this page's bar (same behaviour plus environment guards); `ScienceNav` deleted, so there is one implementation |
| 2 | Footer | "The Science" in the footer Navigate list, in the primary navigation's order (Find a Run, Chicago Mtns, The Science, About, FAQ, Join the club) |
| 3 | Figure 3 | A solid silhouette of a runner pushing off uphill (near limbs black, far limbs gray), corrected stride (the swing knee no longer rises above the hip), the gluteus maximus, quadriceps and calf marked as light patches with numbered markers and a key, so there are no leader lines. The Owner's "running silhouette reference" from an earlier review did not reach this session (no image was attached), so the direction followed the written brief |
| 4 | Figure 7 | Descent arrows reversed to point downhill; geometry, explanations and line weights unchanged; checked visually and by a browser test of each arrow's head position |
| 5 | Workout icons | Thin-stroke steep hill, gentler hill, and paired up/down arrows, each in a grayscale tie-dye circle above its title; column numbers removed |
| 6 | Workouts CTA | The closing line and "Explore the hills" sit on a shared rule directly beneath the three columns, aligned with the grid |

Pre-merge validation (macOS, final tree): lint, tsc, tokens:check, build pass; Vitest 467 passed (2 skipped: hold-dependent tests that `main` now skips because the hold is lifted); Playwright 505 passed. One run-details test (`final-pass.spec.ts`, "cricket-mtn-repeats") failed once under full parallel load and passed 3/3 alone; this work does not touch that page. `@visual`: 34 failures, identical to unmodified `main` at `23687ef` (full-page and footer baselines that PRs #11 and #14–#16 changed without re-baselining; visual specs do not run in CI). Not re-baselined here.

## Outcome (2026-11-10)

**Merge.** `main` had moved to `23687ef` and PR #13 conflicted. Rewriting the branch was not possible (a force-push of a rebase was declined, and the Owner's instruction excluded force-pushing), so `main` was merged into the branch instead (`6c6bde6`) and the final-pass commit applied on top, with the tree checked byte-identical to the validated one before a normal fast-forward push. One CI-only test-timing issue was fixed (`ddd7769`: the incline introduction is observed with a MutationObserver, because on CI's software WebGL the hill hero's first frame can block the main thread long enough to compress the introduction). PR #13 merged by merge commit (the repository's established method; `main` has no branch protection) as **`9ae4a29`**, guarded on head `ddd7769`.

**CI.** PR head `ddd7769`: `validate`, `browser`, Vercel Preview (`dpl_52cjRAENo7C3HFZ1nzjNbFcEdh4d`, Ready, built from `ddd7769`) passed. `main` at `9ae4a29`: CI run 42726839746 passed.

**Production** (https://cmr-site-xi.vercel.app, `dpl_CshnYp5WJ6NyGNCpoQYXLXM4DKHq`, Ready, built from `9ae4a29`). Real-browser smoke at 1440, 768 and 393:
- `/the-science` 200; title "The science behind hill repeats | Chicago Mountain Runners"; H1 "The science behind hill repeats?"; hero background is the shared `HillHeroBackground` contour field (still frame in headless software WebGL, as on the hill pages); no browser console errors; no horizontal overflow.
- "The Science" in the primary navigation and the footer Navigate list, both linking to `/the-science`.
- Sections alternate white and black, Physics to Sources. Figure 3 silhouette with its three numbered muscle markers; Figure 7 with three downhill descent arrows; three workout icons; the closing line and "Explore the hills" on the shared rule under the columns.
- Section bar: "Descending" link lands with its heading below the bar (desktop bar bottom 124px, heading 201px; tablet 120 / 190; phone 99 / 218) and marks Descending current.
- Incline: rises to 10% on first view (10%, 5.7°, 10.0 ft); the slider then sets 25% (14.0°, 25.0 ft). Accumulator: 40 ft × 30 = 1,200 ft. Breathing guide: Start, then Inhale → Hold after 4.6s; Pause works.
- `/`, `/hills`, `/hills/cricket-hill`, `/calendar`, `/join`, `/faq`, `/about` all 200.

**Closeout PR test fix.** On the closeout PR's CI, `science.spec.ts` "is one row, sticks directly under the header's visible bar" failed once on mobile: the instant scroll ran before the header hydrated, so the header never saw a scroll down and kept its top row (the bar still sat exactly under it). The test now waits for hydration before scrolling (test-only change, in this closeout PR).

**Pre-existing, recorded, not changed:** 34 macOS `@visual` full-page and footer baselines fail identically on unmodified `main` at `23687ef` (changed by PRs #11 and #14–#16 without re-baselining; visual specs do not run in CI). The footer baseline would also need updating for the new "The Science" link; re-baselining all of them is a separate step. One run-details test (`final-pass.spec.ts`, "cricket-mtn-repeats", mobile) failed once locally under full parallel load and passed 3/3 alone and in CI; it is not part of this work.

**Cleanup.** After the merge: the implementation worktree `../cmr-site-science`, the local branches `feat/cmr-the-science` and `science-final` (the merged branch's local name), and the remote `feat/cmr-the-science` are removed (project convention). This closeout branch `docs/aiom-close-the-science` is removed after its PR merges. Not touched: the primary worktree (`plan/cmr-join-page` with its uncommitted records), PR #5 and other branches.

## Follow-up change (Owner, 2026-11-10): hero copy and Figure 3

PR #19 merged as **`c3727ed`** (head `1e5e90a`, merged with a head-commit guard). A direct push to `main` was attempted on the Owner's authorization and declined by `main`'s ruleset (pull request and required status checks required; also blocks deletion and non-fast-forward); it was not bypassed, and the Owner then authorized merging the PR. `validate`, `browser` and the Vercel Preview passed on the PR head; CI on `main` at `c3727ed` passed; production (https://cmr-site-xi.vercel.app) is Ready, built from `c3727ed`.

- **Hero:** heading "The science / behind hill / repeats?" on three lines from 1024px, balanced wrapping below; subtitle and intro replaced by one paragraph (max 560px). Shared hill hero background untouched.
- **Figure 3:** the segmented runner drawing is replaced by one solid silhouette (`runner.ts`) with three numbered markers on the pushing leg and the existing key. The silhouette is an original outline designed from the Owner's reference posture; no third-party artwork was used or traced (no suitable public-domain vector was reachable: Commons options were CC BY-SA or stylized Olympic pictograms). It was generated offline from tapered limb shapes (a local `shapely` script, not shipped or added as a dependency), smoothed into a single path.
- **Production smoke (1440 and 393):** `/the-science` 200; three heading lines at desktop; one hero paragraph, exact text; title "The science behind hill repeats | Chicago Mountain Runners"; one silhouette and three markers; no horizontal overflow; no console errors.
- Pre-existing `@visual` baseline failures are unchanged.

## Follow-ups (Owner; not blocking)

- Re-baseline the macOS `@visual` screenshots (34 stale since PRs #11 and #14–#16, plus the footer for this PR) in a separate, Owner-approved step.
- Judge the hero motion and Figure 3 on a real device (the automated checks run on software WebGL and still frames).
- The "running silhouette reference" mentioned in the final brief did not reach the implementing session; Figure 3 followed the written direction.

## Out of scope

New photography; hill-specific data; changes to other routes beyond the shared header spacing, the footer "The Science" link and the shared hero background and scroll-padding rule; re-baselining unrelated visual screenshots.
