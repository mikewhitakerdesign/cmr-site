---
seed_version: '0.1'
id: implement-cmr-the-science-page
title: Implement The Science editorial resource page (/the-science)
objective: >-
  Add "The Science" to the global navigation and publish /the-science, a
  long-form, sourced editorial resource on the physics, physiology, breathing,
  psychology and practice of running hill repeats in a flat city, built on the
  established CMR design system, with a sticky subsection navigation, an
  animated terrain-line hero, monochrome diagrams and three small interactive
  figures. Delivered as a reviewable PR with a Ready Vercel Preview; not merged.
status: in-review
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - content-publication
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: owner
created_at: '2026-11-09T21:00:00.000Z'
updated_at: '2026-11-09T23:30:00.000Z'
---
## Status

**In review: PR open, not merged.** Branch `feat/cmr-the-science` (worktree `../cmr-site-science`), rebased onto `main` at `6f5fff5` (after PR #11 and #12 merged during this work; no conflicts). The Owner reviews the Vercel Preview next; merge, production deployment and cleanup wait for the Owner's approval.

**Authorization:** Owner instruction of 2026-11-09 (the "The Science" brief, including the updated hero-animation direction): implement end to end through a validated PR with a working Preview, without intermediate questions. Explicitly not authorized: merging, production deployment, deleting remote branches, a closeout PR before approval. No approval artifact was added; the instruction is recorded here.

Not touched: `plan/cmr-join-page` and its uncommitted records in the primary worktree; PR #5. PR #11 merged while this was in progress; its header changes (Join tooltip, white CTA) are kept and the four-link spacing was re-validated on top of them.

## What was built

| Part | Implementation |
|---|---|
| Route | `src/app/the-science/page.tsx` (static). Title "The Science \| Chicago Mountain Runners", description metadata. No sitemap exists in the app, so none was added |
| Global nav | One entry in `primaryNav` (`src/lib/navigation.tsx`), between Chicago Mtns and About. Header and mobile menu are the existing ones |
| Hero | `ScienceHero` + `TerrainLines` (Canvas 2D): approved eyebrow, headline, subtitle and intro verbatim; black ground, light-gray terrain lines, a black wash from the left (vertical on phones) |
| Section bar | `ScienceNav`: sticky under the header's visible bar, eight anchors, current-section indicator, one horizontally scrolling row on small screens |
| Sections 02–09 | `src/components/science/sections/*`, in the brief's order, headings as given |
| Figures | Incline geometry with grade slider; four-point energy-cost chart; joint-action schematic; elevation accumulator; breathing-pattern guide; repeat waveform; ascent/descent pair; workout profile icons. All inline SVG (except the hero canvas), monochrome |
| Sources | `src/content/science-sources.ts`: 22 verified entries, numbered by first citation, stable anchors `#source-<id>`; inline `Cite` links to them; educational-information disclaimer under the list |

Client JavaScript is limited to the hero canvas, the section bar, the slider, the accumulator and the breathing guide. No new dependencies.

## Decisions and deviations (implementation judgment, for Owner review)

1. **Hero animation: an original Canvas 2D renderer, not ContourField.** The reference is a perspective terrain whose contour lines are lifted to their elevations. ContourField draws flat contours in a fragment shader and can't produce that geometry, so `TerrainLines` computes a height field (3D simplex noise), extracts contours (marching squares) and projects each at its level's height. It reuses ContourField's motion contract: the site motion preference (`data-motion`, footer Pause motion, system reduced motion) gives one still frame; paused off screen and in hidden tabs; ≤ 24 fps, dropping to 12 if a frame costs more than 14ms; DPR and pixel caps. Speed was set by eye to match the slow drift of "Flat is a state of mind". The watermarked reference was viewed locally for direction only (a few frames in a scratch folder); nothing from it is in the repo or the site. Its on-screen figures and summit callouts were left out.
2. **Header spacing for a fourth link** (`Header.tsx`). At 768 the four links, logo and CTA did not fit on one line (About wrapped), and at 393 the link row was 3px too wide (the page scrolled sideways). Tablet: one gap value of 16px (was 24) between links and before the CTA. Mobile: cell padding 6px (was 8) and type `clamp(12px, 3.82vw, 15px)` (exactly 15px at 393 and up), with sideways scroll inside the row as a last resort. Desktop unchanged. Two `@visual` header baselines (mobile, tablet) were updated; the diffs show only the new link and its spacing.
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

## Remaining for the Owner's review

- The hero animation's pace and density, judged in a real browser (the screenshots are still frames).
- The tablet header with four links (16px gaps) and the slightly smaller mobile link type below 393px.
- Editorial voice, especially Breathing (approved opening verbatim), the founder note and The Mind.
- The 23 stale `@visual` baselines from PR #11 (see Validation), which need a separate re-baseline.
- Whether Workouts should later link to specific hill pages once repeat gains are verified.

## Out of scope

Merging, production deployment, branch cleanup and AIOM closeout (after approval); new photography; hill-specific data; changes to other routes beyond the shared header spacing.
